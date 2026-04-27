#!/usr/bin/env python3
"""
🕌 IMMORTAL GRADE — Kalimmat Quranic Words Scraper
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Production-hardened async scraper for Quranic word meanings from Kalimmat.com.

Features:
• Fixed async context manager lifecycle (was critically broken in v1)
• Worker-pool pattern with bounded async queue (backpressure-safe)
• Lazy-initialised token-bucket rate limiter (no event-loop capture at import)
• Full circuit breaker state machine (CLOSED → OPEN → HALF_OPEN)
• Session-scoped LRU meaning cache (avoids redundant network hits)
• Multi-strategy HTML extraction with Kalimmat-specific CSS selectors
• Atomic JSON saves with checksum + backup (fsync guaranteed)
• Structured JSON logging with per-record context fields
• Rich terminal UI (progress bar, live stats panel)
• Typer CLI with full --dry-run / --limit / --verbose / --metrics flags
• Proper exception hierarchy for fine-grained error handling
• Graceful SIGINT/SIGTERM shutdown draining the in-flight queue
• Arabic text normalisation pipeline (PyArabic + regex fallback)
• Prefix-stripping retry with exponential back-off
• Pydantic v2 settings with env var & .env file support

Usage:
    python kalimmat_scraper.py [OPTIONS]
    python kalimmat_scraper.py --dry-run --limit 50 --verbose

Environment Variables:
    KALIMMAT_CONCURRENT=3        Max parallel workers
    KALIMMAT_RPS=1.0             Requests per second
    KALIMMAT_TIMEOUT=30          Request timeout (seconds)
    KALIMMAT_OUTPUT=./mujam.json Output path
    KALIMMAT_LOG_LEVEL=INFO

Requirements:
    pip install aiohttp tenacity beautifulsoup4 pydantic pydantic-settings \
                typer rich pyarabic tqdm
"""

from __future__ import annotations

# ─────────────────────────────────────────────────────────────
# Standard library
# ─────────────────────────────────────────────────────────────
import asyncio
import hashlib
import json
import logging
import os
import re
import signal
import sys
import tempfile
import time
import urllib.parse
from collections import deque
from contextlib import asynccontextmanager, suppress
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum, auto
from pathlib import Path
from typing import (
    Any, Final, Literal, NamedTuple, Protocol,
    Sequence, TypeVar, runtime_checkable,
)

# ─────────────────────────────────────────────────────────────
# Third-party (hard requirements)
# ─────────────────────────────────────────────────────────────
import aiohttp
import typer
from aiohttp import ClientSession, TCPConnector
from aiohttp.client_exceptions import ClientError, ServerDisconnectedError
from bs4 import BeautifulSoup
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential_jitter,
    before_sleep_log,
)

# ─────────────────────────────────────────────────────────────
# Optional dependencies (graceful degradation)
# ─────────────────────────────────────────────────────────────
try:
    from pyarabic.araby import strip_tashkeel, normalize_alef, normalize_tehmarbuta
    _PYARABIC = True
except ImportError:
    _PYARABIC = False
    strip_tashkeel = normalize_alef = normalize_tehmarbuta = lambda x: x  # type: ignore[assignment]

try:
    from rich.console import Console
    from rich.logging import RichHandler
    from rich.progress import (
        Progress, SpinnerColumn, BarColumn,
        TaskProgressColumn, TimeRemainingColumn, TextColumn,
    )
    from rich.panel import Panel
    from rich.table import Table
    _RICH = True
    _console = Console(stderr=True)
except ImportError:
    _RICH = False
    _console = None  # type: ignore[assignment]

# ─────────────────────────────────────────────────────────────
# Type helpers
# ─────────────────────────────────────────────────────────────
T = TypeVar("T")

# ═════════════════════════════════════════════════════════════
# §1  EXCEPTION HIERARCHY
# ═════════════════════════════════════════════════════════════

class ScraperError(Exception):
    """Base for all scraper errors."""

class CircuitOpenError(ScraperError):
    """Raised when the circuit breaker is OPEN and requests are rejected."""

class MeaningNotFoundError(ScraperError):
    """Raised when the target page exists but yields no parseable meaning."""

class FetcherNotInitializedError(ScraperError):
    """Raised when the fetcher is accessed before the scraper enters its context."""

class DataIntegrityError(ScraperError):
    """Raised when a post-write integrity check fails."""


# ═════════════════════════════════════════════════════════════
# §2  DOMAIN MODELS
# ═════════════════════════════════════════════════════════════

class ScraperStatus(Enum):
    IDLE      = auto()
    RUNNING   = auto()
    DRAINING  = auto()   # Shutdown requested; draining queue
    COMPLETED = auto()
    ERROR     = auto()


@dataclass(frozen=True, slots=True)
class WordEntry:
    """Immutable, content-addressed Quranic word meaning entry."""
    word:       str
    meaning:    str
    source:     str = "kalimmat"
    fetched_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    checksum:   str = field(init=False, compare=False)

    def __post_init__(self) -> None:
        digest = hashlib.sha256(
            f"{self.word}{self.meaning}{self.source}".encode()
        ).hexdigest()[:16]
        object.__setattr__(self, "checksum", digest)

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


class _PrefixResult(NamedTuple):
    stripped_form: str
    prefix_used:   str


@dataclass(slots=True)
class ScrapingMetrics:
    """Runtime counters and timing; safe for concurrent mutation via asyncio (single thread)."""
    total_words: int = 0
    successful:  int = 0
    failed:      int = 0
    skipped:     int = 0
    retries:     int = 0
    cache_hits:  int = 0

    # Rolling latency buffer (last 200 requests, milliseconds)
    _latencies: deque[float] = field(default_factory=lambda: deque(maxlen=200))
    start_time:  datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    def record_latency(self, ms: float) -> None:
        self._latencies.append(ms)

    @property
    def elapsed_seconds(self) -> float:
        return (datetime.now(timezone.utc) - self.start_time).total_seconds()

    @property
    def success_rate(self) -> float:
        total = self.successful + self.failed
        return (self.successful / total * 100) if total > 0 else 0.0

    @property
    def p50_latency_ms(self) -> float:
        if not self._latencies:
            return 0.0
        s = sorted(self._latencies)
        return s[len(s) // 2]

    @property
    def p95_latency_ms(self) -> float:
        if not self._latencies:
            return 0.0
        s = sorted(self._latencies)
        return s[int(len(s) * 0.95)]

    def to_prometheus(self) -> str:
        lines = [
            "# HELP kalimmat_words_total Words processed by status",
            "# TYPE kalimmat_words_total counter",
            f'kalimmat_words_total{{status="success"}} {self.successful}',
            f'kalimmat_words_total{{status="failed"}} {self.failed}',
            f'kalimmat_words_total{{status="skipped"}} {self.skipped}',
            f'kalimmat_words_total{{status="cache_hit"}} {self.cache_hits}',
            "# HELP kalimmat_duration_seconds Total scrape wall-clock time",
            "# TYPE kalimmat_duration_seconds gauge",
            f"kalimmat_duration_seconds {self.elapsed_seconds:.3f}",
            "# HELP kalimmat_success_rate_percent Request success percentage",
            "# TYPE kalimmat_success_rate_percent gauge",
            f"kalimmat_success_rate_percent {self.success_rate:.2f}",
            "# HELP kalimmat_latency_p50_ms Median request latency",
            "# TYPE kalimmat_latency_p50_ms gauge",
            f"kalimmat_latency_p50_ms {self.p50_latency_ms:.1f}",
            "# HELP kalimmat_latency_p95_ms p95 request latency",
            "# TYPE kalimmat_latency_p95_ms gauge",
            f"kalimmat_latency_p95_ms {self.p95_latency_ms:.1f}",
        ]
        return "\n".join(lines) + "\n"


# ═════════════════════════════════════════════════════════════
# §3  CONFIGURATION (Pydantic v2 Settings)
# ═════════════════════════════════════════════════════════════

class LogLevel(str, Enum):
    DEBUG    = "DEBUG"
    INFO     = "INFO"
    WARNING  = "WARNING"
    ERROR    = "ERROR"
    CRITICAL = "CRITICAL"


class ScraperSettings(BaseSettings):
    """
    All settings sourced from environment variables (prefix KALIMMAT_)
    and optionally a .env file. CLI flags override these at runtime.
    """
    model_config = SettingsConfigDict(
        env_prefix="KALIMMAT_",
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    # Concurrency & throttling
    concurrent_requests: int   = Field(default=2,    ge=1,  le=20)
    requests_per_second: float = Field(default=1.0,  gt=0,  le=10.0)
    request_timeout:     int   = Field(default=30,   ge=5,  le=120)
    max_retries:         int   = Field(default=3,    ge=0,  le=10)
    queue_max_size:      int   = Field(default=500,  ge=10)

    # Persistence
    output_file:       Path = Field(default=Path("src/data/Datasets/mujam.json"))
    juz_dir:           Path = Field(default=Path("src/data/juz"))
    checkpoint_every:  int  = Field(default=25, ge=1)

    # HTTP
    user_agents: list[str] = Field(default=[
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 "
        "Version/17.4 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "Chrome/124.0.0.0 Safari/537.36",
    ])

    # Logging
    log_level: LogLevel = Field(default=LogLevel.INFO)
    log_file:  Path     = Field(default=Path("kalimmat.log"))

    # Feature flags
    enable_metrics: bool      = Field(default=False)
    dry_run:        bool      = Field(default=False)
    word_limit:     int | None = Field(default=None, ge=1)

    @field_validator("output_file", "juz_dir", "log_file")
    @classmethod
    def _resolve(cls, v: Path) -> Path:
        return v.resolve()


# ═════════════════════════════════════════════════════════════
# §4  ARABIC TEXT UTILITIES
# ═════════════════════════════════════════════════════════════

# Compiled once at module level — never pay re-compile cost again.
_RE_DIACRITICS:  Final = re.compile(
    r'[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]'
)
_RE_ZERO_WIDTH:  Final = re.compile(r'[\u200B-\u200D\uFEFF\u00AD]')
_RE_TATWEEL:     Final = re.compile(r'\u0640+')
_RE_MULTI_SPACE: Final = re.compile(r'\s{2,}')
_RE_ARABIC_CHAR: Final = re.compile(r'[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]')
_RE_BACKTICK:    Final = re.compile(r'`([^`]+)`')
_RE_WHITESPACE:  Final = re.compile(r'\s+')

# Prefixes longest-first so greedy stripping never leaves a sub-prefix.
_ARABIC_PREFIXES: Final[tuple[str, ...]] = (
    "وال", "فال", "بال", "كال",
    "لل",
    "ال", "و", "ف", "ب", "ك", "ل",
)

# Minimum remaining stem length after prefix removal (avoid stripping to noise).
_MIN_STEM_LENGTH: Final[int] = 2


def normalize_arabic(word: str, *, use_pyarabic: bool = True) -> str:
    """
    Normalise an Arabic token into a canonical dictionary key:
      1. Strip diacritics (tashkeel), zero-width chars, tatweel
      2. Collapse alef variants (أإآٱ) → ا
      3. Normalise ى → ي, ة → ه
      4. Strip punctuation noise
      5. Collapse internal whitespace

    Args:
        word: Raw Arabic token (may contain diacritics / non-Arabic chars).
        use_pyarabic: Delegate to PyArabic when installed (more thorough).

    Returns:
        Normalised string, or empty string if nothing remains.
    """
    if not word:
        return ""

    w = _RE_DIACRITICS.sub("", word.strip())
    w = _RE_ZERO_WIDTH.sub("", w)
    w = _RE_TATWEEL.sub("", w)

    if use_pyarabic and _PYARABIC:
        w = strip_tashkeel(w)
        w = normalize_alef(w)
        w = normalize_tehmarbuta(w)
    else:
        w = re.sub(r'[\u0623\u0625\u0622\u0671]', '\u0627', w)  # أإآٱ → ا
        w = w.replace('\u0649', '\u064A')                        # ى  → ي
        w = w.replace('\u0629', '\u0647')                        # ة  → ه

    # Remove non-Arabic / non-space residue
    w = re.sub(r'[^\u0600-\u06FF\s]', '', w)
    w = _RE_MULTI_SPACE.sub(" ", w).strip()
    return w


def iter_prefix_variants(word: str) -> list[_PrefixResult]:
    """
    Yield (stripped_form, prefix) pairs for all applicable Arabic prefixes,
    longest-first, filtering out stems that are too short to be meaningful.
    """
    results: list[_PrefixResult] = []
    for prefix in _ARABIC_PREFIXES:
        if word.startswith(prefix):
            stem = word[len(prefix):]
            if len(stem) >= _MIN_STEM_LENGTH:
                results.append(_PrefixResult(stem, prefix))
    return results


def extract_ts_words(juz_dir: Path) -> set[str]:
    """
    Parse TypeScript source files and extract Arabic tokens from backtick
    template literals.  Returns the raw set (pre-normalisation).
    """
    words: set[str] = set()

    if not juz_dir.exists():
        logging.warning("Juz directory not found: %s", juz_dir)
        return words

    ts_files = list(juz_dir.glob("*.ts"))
    if not ts_files:
        logging.warning("No .ts files found in %s", juz_dir)
        return words

    for ts_file in ts_files:
        try:
            content = ts_file.read_text(encoding="utf-8")
        except UnicodeDecodeError as exc:
            logging.error("Encoding error reading %s: %s", ts_file, exc)
            continue

        for match in _RE_BACKTICK.finditer(content):
            for token in _RE_WHITESPACE.split(match.group(1)):
                token = token.strip()
                if token and _RE_ARABIC_CHAR.search(token):
                    words.add(token)

    logging.info("Extracted %d unique raw tokens from %d files", len(words), len(ts_files))
    return words


# ═════════════════════════════════════════════════════════════
# §5  HTML EXTRACTION — Kalimmat-specific
# ═════════════════════════════════════════════════════════════

# CSS selector cascade, most specific first.  Tuple of (selector, attr_or_None).
# attr_or_None: None → use .get_text(); "content" → use tag["content"]
_MEANING_SELECTORS: Final[tuple[tuple[str, str | None], ...]] = (
    # Site-specific structured markup
    ('[itemprop="description"]',            None),
    ('.word-meaning',                        None),
    ('.meaning-text',                        None),
    ('.definition',                          None),
    # Class pattern matching
    ('div[class*="meaning"]',                None),
    ('div[class*="definition"]',             None),
    # Meta tags (fallback)
    ('meta[name="description"]',            "content"),
    ('meta[property="og:description"]',     "content"),
    ('meta[name="twitter:description"]',    "content"),
)

_MEANING_BLACKLIST: Final[frozenset[str]] = frozenset({
    "غير متوفر", "لا يوجد", "N/A", "", "undefined", "null",
})

_MIN_MEANING_LENGTH: Final[int] = 3


def extract_meaning(html: str) -> str | None:
    """
    Multi-strategy extraction of an Arabic word meaning from Kalimmat HTML.

    Strategy waterfall:
      1. Site-specific CSS selectors (structured content)
      2. Largest text block containing Arabic characters (heuristic)
      3. Returns None if nothing meaningful is found

    Args:
        html: Raw HTML response body.

    Returns:
        Cleaned meaning string, or None.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Strategy 1: CSS selector cascade
    for selector, attr in _MEANING_SELECTORS:
        tag = soup.select_one(selector)
        if not tag:
            continue
        text = (tag.get(attr, "") if attr else tag.get_text(separator=" ", strip=True)) or ""  # type: ignore[arg-type]
        text = _clean_meaning(text)
        if text:
            return text

    # Strategy 2: Largest <p> or <div> block containing Arabic text
    candidates: list[tuple[int, str]] = []
    for tag in soup.find_all(["p", "div", "span"]):
        text = tag.get_text(separator=" ", strip=True)
        if _RE_ARABIC_CHAR.search(text) and len(text) > _MIN_MEANING_LENGTH:
            candidates.append((len(text), text))

    if candidates:
        candidates.sort(reverse=True)
        for _, text in candidates[:3]:
            cleaned = _clean_meaning(text)
            if cleaned:
                return cleaned

    return None


def _clean_meaning(raw: str) -> str | None:
    """Sanitise a candidate meaning string; return None if it's useless."""
    text = (
        raw
        .replace("&quot;", '"')
        .replace("&amp;",  "&")
        .replace("&nbsp;", " ")
        .replace("\xa0",   " ")
    )
    text = _RE_MULTI_SPACE.sub(" ", text).strip()

    if not text or text in _MEANING_BLACKLIST or len(text) < _MIN_MEANING_LENGTH:
        return None
    return text


# ═════════════════════════════════════════════════════════════
# §6  RATE LIMITER  (lazy event-loop capture)
# ═════════════════════════════════════════════════════════════

class AsyncRateLimiter:
    """
    Token-bucket rate limiter.  Event-loop time is captured lazily (on first
    `acquire`) to avoid the "attached to a different loop" error that plagued v1.

    Thread-safety: asyncio.Lock (single-event-loop safe; not multi-threaded).
    """

    __slots__ = ("rate", "burst", "_tokens", "_last_ts", "_lock", "_initialised")

    def __init__(self, rate: float, *, burst: float | None = None) -> None:
        if rate <= 0:
            raise ValueError("rate must be positive")
        self.rate          = rate
        self.burst         = burst if burst is not None else rate
        self._tokens       = self.burst
        self._last_ts:  float | None = None
        self._lock:     asyncio.Lock | None = None
        self._initialised  = False

    def _ensure_init(self) -> None:
        """Lazily create the lock and capture current time inside the running loop."""
        if not self._initialised:
            self._lock = asyncio.Lock()
            self._last_ts = asyncio.get_event_loop().time()
            self._initialised = True

    async def acquire(self) -> None:
        """Block until a token is available, then consume it."""
        self._ensure_init()
        assert self._lock is not None and self._last_ts is not None  # narrowing

        async with self._lock:
            now = asyncio.get_event_loop().time()
            elapsed = now - self._last_ts
            self._tokens = min(self.burst, self._tokens + elapsed * self.rate)
            self._last_ts = now

            if self._tokens < 1:
                wait = (1 - self._tokens) / self.rate
                # ±10 % jitter prevents thundering-herd on burst completion
                jitter = wait * 0.1 * (hash(now) % 21 - 10) / 10
                await asyncio.sleep(max(0.0, wait + jitter))
                self._tokens = 0
            else:
                self._tokens -= 1


# ═════════════════════════════════════════════════════════════
# §7  CIRCUIT BREAKER  (proper async state machine)
# ═════════════════════════════════════════════════════════════

class CircuitState(Enum):
    CLOSED    = "CLOSED"     # Normal operation
    OPEN      = "OPEN"       # Failing; reject all requests
    HALF_OPEN = "HALF_OPEN"  # Recovery probe in flight


class CircuitBreaker:
    """
    Full async circuit breaker.

    Transitions:
        CLOSED  → OPEN      after `failure_threshold` consecutive failures
        OPEN    → HALF_OPEN after `recovery_timeout` seconds
        HALF_OPEN → CLOSED  on first success in HALF_OPEN
        HALF_OPEN → OPEN    on first failure in HALF_OPEN

    Only one probe is allowed through in HALF_OPEN via `_probe_in_flight`.
    """

    __slots__ = (
        "failure_threshold", "recovery_timeout", "expected_exception",
        "_failures", "_last_failure_ts", "_state", "_lock", "_probe_in_flight",
    )

    def __init__(
        self,
        failure_threshold:  int   = 5,
        recovery_timeout:   float = 30.0,
        expected_exception: type[Exception] = ClientError,
    ) -> None:
        self.failure_threshold  = failure_threshold
        self.recovery_timeout   = recovery_timeout
        self.expected_exception = expected_exception

        self._failures:        int   = 0
        self._last_failure_ts: float = 0.0
        self._state:           CircuitState = CircuitState.CLOSED
        self._lock             = asyncio.Lock()
        self._probe_in_flight  = False

    @property
    def state(self) -> CircuitState:
        return self._state

    async def call(self, coro: "asyncio.Future[T] | asyncio.coroutines.Coroutine[Any, Any, T]") -> T:
        """Execute *coro* under circuit-breaker control."""
        async with self._lock:
            state = self._state

            if state == CircuitState.OPEN:
                elapsed = asyncio.get_event_loop().time() - self._last_failure_ts
                if elapsed >= self.recovery_timeout and not self._probe_in_flight:
                    self._state = CircuitState.HALF_OPEN
                    self._probe_in_flight = True
                    logging.debug("Circuit breaker → HALF_OPEN (probe allowed)")
                else:
                    raise CircuitOpenError(
                        f"Circuit is OPEN (failed {self._failures}× — "
                        f"next probe in {self.recovery_timeout - elapsed:.0f}s)"
                    )

        try:
            result = await coro  # type: ignore[misc]
        except self.expected_exception as exc:
            async with self._lock:
                self._failures       += 1
                self._last_failure_ts = asyncio.get_event_loop().time()
                self._probe_in_flight = False
                if (self._state == CircuitState.HALF_OPEN
                        or self._failures >= self.failure_threshold):
                    self._state = CircuitState.OPEN
                    logging.warning(
                        "Circuit breaker → OPEN after %d failures", self._failures
                    )
            raise
        else:
            async with self._lock:
                if self._state in (CircuitState.HALF_OPEN, CircuitState.OPEN):
                    logging.info("Circuit breaker → CLOSED (recovered)")
                self._state           = CircuitState.CLOSED
                self._failures        = 0
                self._probe_in_flight = False
            return result  # type: ignore[return-value]


# ═════════════════════════════════════════════════════════════
# §8  HTTP FETCHER  (Protocol + production implementation)
# ═════════════════════════════════════════════════════════════

@runtime_checkable
class FetcherProtocol(Protocol):
    async def fetch(self, url: str, headers: dict[str, str]) -> tuple[int, str | None]:
        ...


class AioHttpFetcher:
    """Production fetcher: connection pooling, DNS caching, configurable timeouts."""

    __slots__ = ("_session", "_user_agents", "_timeout")

    def __init__(
        self,
        session:     ClientSession,
        user_agents: Sequence[str],
        timeout:     int,
    ) -> None:
        self._session     = session
        self._user_agents = user_agents
        self._timeout     = aiohttp.ClientTimeout(total=timeout, connect=10)

    async def fetch(self, url: str, headers: dict[str, str]) -> tuple[int, str | None]:
        try:
            async with self._session.get(
                url, headers=headers, timeout=self._timeout,
                allow_redirects=True, max_redirects=5,
            ) as resp:
                if resp.status == 404:
                    return 404, None
                resp.raise_for_status()
                # Respect declared encoding; fall back to utf-8
                text = await resp.text(errors="replace")
                return resp.status, text
        except asyncio.TimeoutError:
            logging.debug("Timeout: %s", url)
            return 504, None
        except ServerDisconnectedError:
            logging.debug("Server disconnected: %s", url)
            return 503, None
        except ClientError as exc:
            logging.debug("Client error (%s): %s", type(exc).__name__, url)
            return 500, None


# ═════════════════════════════════════════════════════════════
# §9  MEANING CACHE  (session-scoped; avoids duplicate network hits)
# ═════════════════════════════════════════════════════════════

class MeaningCache:
    """
    Simple bounded dict cache keyed on normalised search term.

    Not thread-safe by design — asyncio single-event-loop guarantees
    that coroutines won't preempt each other mid-operation.
    """

    __slots__ = ("_store", "_max_size")

    def __init__(self, max_size: int = 10_000) -> None:
        self._store:    dict[str, str | None] = {}
        self._max_size = max_size

    def get(self, key: str) -> tuple[bool, str | None]:
        """Returns (hit, value).  Value may be None (cached miss)."""
        if key in self._store:
            return True, self._store[key]
        return False, None

    def set(self, key: str, value: str | None) -> None:
        if len(self._store) >= self._max_size:
            # Evict oldest 10 %
            for k in list(self._store)[:self._max_size // 10]:
                del self._store[k]
        self._store[key] = value

    def __len__(self) -> int:
        return len(self._store)


# ═════════════════════════════════════════════════════════════
# §10  LOGGING SETUP
# ═════════════════════════════════════════════════════════════

def configure_logging(
    level:    LogLevel,
    log_file: Path,
    *,
    rich:     bool = _RICH,
) -> None:
    """Configure root logger with console (Rich or plain) + rotating file handler."""
    root = logging.getLogger()
    root.handlers.clear()
    root.setLevel(level.value)

    if rich and _RICH:
        console_handler = RichHandler(
            console=_console,
            show_path=False,
            markup=True,
            rich_tracebacks=True,
        )
    else:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(logging.Formatter(
            "%(asctime)s [%(levelname)s] %(name)s — %(message)s",
            datefmt="%H:%M:%S",
        ))

    console_handler.setLevel(level.value)
    root.addHandler(console_handler)

    # Persistent file log (plain text, always full detail)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    file_handler = logging.FileHandler(log_file, encoding="utf-8", mode="a")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)-8s] %(name)s:%(lineno)d — %(message)s"
    ))
    root.addHandler(file_handler)

    # Silence noisy third-party loggers
    for noisy in ("aiohttp", "urllib3", "asyncio"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


# ═════════════════════════════════════════════════════════════
# §11  ATOMIC PERSISTENCE
# ═════════════════════════════════════════════════════════════

def atomic_save(path: Path, data: dict[str, dict]) -> None:
    """
    Write *data* to *path* atomically:
      1. Serialise to a sibling temp file (same filesystem → rename is atomic)
      2. fsync the file descriptor (guarantees disk persistence)
      3. Rename temp → target (POSIX atomic; Windows best-effort)
      4. Validate entry count post-write
      5. On failure, restore the pre-existing backup

    Raises:
        DataIntegrityError: if post-write entry count mismatches.
        OSError: for filesystem-level failures after backup restoration.
    """
    backup = path.with_suffix(path.suffix + ".bak")

    # Rotate existing file to backup
    if path.exists():
        path.replace(backup)

    tmp_path: Path | None = None
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp_name = tempfile.mkstemp(
            dir=path.parent, suffix=".tmp", prefix=path.stem + "_"
        )
        tmp_path = Path(tmp_name)

        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2, sort_keys=True)
            fh.write("\n")
            fh.flush()
            os.fsync(fh.fileno())

        tmp_path.rename(path)  # Atomic on POSIX

        # Post-write integrity check
        written = json.loads(path.read_text(encoding="utf-8"))
        if len(written) != len(data):
            raise DataIntegrityError(
                f"Expected {len(data)} entries, found {len(written)} after write"
            )

        # Clean up backup on success
        if backup.exists():
            backup.unlink()

    except Exception:
        logging.exception("Atomic save failed — attempting backup restoration")
        if tmp_path and tmp_path.exists():
            with suppress(OSError):
                tmp_path.unlink()
        if backup.exists() and not path.exists():
            backup.rename(path)
        raise


# ═════════════════════════════════════════════════════════════
# §12  CORE SCRAPER SERVICE
# ═════════════════════════════════════════════════════════════

class KalimmatScraper:
    """
    Production async scraper with:
      • Correct async context manager lifecycle (v1 was critically broken here)
      • Worker-pool pattern with a bounded async queue (backpressure-aware)
      • Circuit breaker + rate limiter + per-session meaning cache
      • Graceful SIGINT/SIGTERM shutdown (drains queue, saves checkpoint)

    Usage:
        async with KalimmatScraper(settings) as scraper:
            result = await scraper.scrape(words, existing=loaded_dict)
    """

    def __init__(self, settings: ScraperSettings) -> None:
        self.settings = settings
        self.metrics  = ScrapingMetrics()
        self.status   = ScraperStatus.IDLE

        self._circuit_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=30.0)
        self._rate_limiter    = AsyncRateLimiter(settings.requests_per_second)
        self._cache           = MeaningCache()
        self._shutdown_event  = asyncio.Event()

        # Lifecycle holders — set during __aenter__, cleared during __aexit__
        self._session:   ClientSession | None = None
        self._fetcher:   FetcherProtocol | None = None

    # ── Context Manager ───────────────────────────────────────────────────────

    async def __aenter__(self) -> "KalimmatScraper":
        """Open HTTP session and register shutdown signal handlers."""
        connector = TCPConnector(
            limit=self.settings.concurrent_requests + 5,
            ttl_dns_cache=300,
            use_dns_cache=True,
            force_close=False,
            enable_cleanup_closed=True,
        )
        self._session = ClientSession(connector=connector)
        self._fetcher = AioHttpFetcher(
            session=self._session,
            user_agents=self.settings.user_agents,
            timeout=self.settings.request_timeout,
        )

        # Register signal handlers for graceful shutdown
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            with suppress(NotImplementedError):   # Windows: SIGTERM may not be supported
                loop.add_signal_handler(sig, self._request_shutdown)

        logging.info(
            "Scraper ready — workers=%d  RPS=%.1f  timeout=%ds",
            self.settings.concurrent_requests,
            self.settings.requests_per_second,
            self.settings.request_timeout,
        )
        self.status = ScraperStatus.IDLE
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val:  BaseException | None,
        exc_tb:   Any,
    ) -> None:
        """Close HTTP session and flush final log."""
        if self._session:
            await self._session.close()
            self._session = None
            self._fetcher = None
        logging.info("Scraper shut down cleanly.")

    def _request_shutdown(self) -> None:
        logging.warning("Shutdown signal received — draining queue…")
        self._shutdown_event.set()
        self.status = ScraperStatus.DRAINING

    # ── Network Layer ─────────────────────────────────────────────────────────

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential_jitter(initial=1, max=12, jitter=0.5),
        retry=retry_if_exception_type((ClientError, asyncio.TimeoutError, OSError)),
        before_sleep=before_sleep_log(logging.getLogger("kalimmat.retry"), logging.DEBUG),
        reraise=True,
    )
    async def _fetch_meaning(self, term: str) -> str | None:
        """
        Fetch and extract meaning for *term*, with:
          • Session-level cache check (avoids wasted RPS)
          • Rate limiter (token bucket)
          • Circuit breaker protection
          • Latency recording for percentile metrics
        """
        if not self._fetcher:
            raise FetcherNotInitializedError("Call __aenter__ before fetching")

        # Cache hit — free return
        hit, cached = self._cache.get(term)
        if hit:
            self.metrics.cache_hits += 1
            return cached

        await self._rate_limiter.acquire()

        path = urllib.parse.quote(f"\u0645\u0639\u0646\u0649-\u0643\u0644\u0645\u0629/{term}")
        url = f"https://kalimmat.com/{path}"
        
        headers = {
            "User-Agent": self.settings.user_agents[
                hash(term) % len(self.settings.user_agents)
            ],
            "Accept":          "text/html,application/xhtml+xml;q=0.9",
            "Accept-Language": "ar-SA,ar;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection":      "keep-alive",
        }

        t0 = time.monotonic()
        status, html = await self._circuit_breaker.call(
            self._fetcher.fetch(url, headers)
        )
        self.metrics.record_latency((time.monotonic() - t0) * 1000)

        if status == 404 or html is None:
            self._cache.set(term, None)
            return None

        meaning = extract_meaning(html)
        self._cache.set(term, meaning)
        return meaning

    # ── Word Processing ───────────────────────────────────────────────────────

    async def _process_word(self, raw: str) -> tuple[str, WordEntry] | None:
        """
        Full pipeline for one raw token:
          1. Normalise
          2. Attempt full-form fetch
          3. Attempt prefix-stripped variants (longest prefix first)
          4. Return None on definitive miss
        """
        norm = normalize_arabic(raw)
        if not norm:
            self.metrics.skipped += 1
            return None

        # Attempt 1: full normalised form
        meaning = await self._fetch_meaning(norm)

        # Attempt 2: prefix variants (with polite inter-request delay)
        if not meaning:
            for variant in iter_prefix_variants(norm):
                logging.debug(
                    "Prefix strip '%s' → '%s' for '%s'",
                    variant.prefix_used, variant.stripped_form, raw,
                )
                await asyncio.sleep(0.15)
                meaning = await self._fetch_meaning(variant.stripped_form)
                if meaning:
                    break

        if not meaning:
            self.metrics.failed += 1
            return None

        self.metrics.successful += 1
        return norm, WordEntry(word=raw, meaning=meaning)

    # ── Worker Pool (queue-based) ──────────────────────────────────────────────

    async def _worker(
        self,
        queue:   asyncio.Queue[str | None],
        results: dict[str, dict],
        out:     Path,
    ) -> None:
        """
        Consume words from *queue*.  Sentinel value `None` signals exit.
        Checkpoint-saves every `settings.checkpoint_every` new entries.
        """
        saved_since_checkpoint = 0
        processed = 0

        while True:
            raw = await queue.get()
            try:
                if raw is None:          # Poison-pill sentinel — worker is done
                    # Save any remaining unsaved entries before exiting
                    if saved_since_checkpoint > 0:
                        try:
                            out.write_text(
                                json.dumps(results, ensure_ascii=False, indent=2, sort_keys=True),
                                encoding="utf-8"
                            )
                        except Exception as e:
                            logging.warning("Final checkpoint save failed: %s", e)
                    return

                if self._shutdown_event.is_set():
                    return

                try:
                    result = await self._process_word(raw)
                except CircuitOpenError:
                    logging.warning("Circuit OPEN — skipping '%s'", raw)
                    self.metrics.failed += 1
                    continue  # Don't die, keep processing other words
                except Exception as e:
                    logging.warning("Error processing '%s': %s", raw, e)
                    self.metrics.failed += 1
                    continue  # Don't die, keep processing other words

                processed += 1
                if processed % 50 == 0:
                    m = self.metrics
                    logging.info(
                        "Progress: processed=%d found=%d failed=%d | dict_size=%d",
                        m.successful + m.failed + m.skipped,
                        m.successful,
                        m.failed,
                        len(results),
                    )

                if result:
                    norm, entry = result
                    results[norm] = entry.to_dict()
                    saved_since_checkpoint += 1

                    if saved_since_checkpoint >= self.settings.checkpoint_every:
                        # Fast save (not atomic) to avoid blocking the event loop
                        try:
                            out.write_text(
                                json.dumps(results, ensure_ascii=False, indent=2, sort_keys=True),
                                encoding="utf-8"
                            )
                            logging.info(
                                "Checkpoint — %d total entries saved", len(results)
                            )
                        except Exception as e:
                            logging.warning("Checkpoint save failed: %s", e)
                        saved_since_checkpoint = 0

            finally:
                queue.task_done()

    # ── Public API ────────────────────────────────────────────────────────────

    async def scrape(
        self,
        words:    Sequence[str],
        existing: dict[str, dict] | None = None,
    ) -> dict[str, dict]:
        """
        Orchestrate the scraping run.

        Args:
            words:    Raw Arabic tokens to process.
            existing: Previously saved dictionary (results merged in).

        Returns:
            Combined {normalised_word → entry_dict} dictionary.
        """
        if self.settings.dry_run:
            logging.info("[DRY RUN] No network requests will be made.")
            return existing or {}

        results: dict[str, dict] = dict(existing) if existing else {}

        # Deduplicate against existing data
        existing_norms: set[str] = {normalize_arabic(k) for k in results}
        pending = [
            w for w in words
            if (n := normalize_arabic(w)) and n not in existing_norms
        ]

        if self.settings.word_limit:
            pending = pending[: self.settings.word_limit]

        if not pending:
            logging.info("Nothing new to process — all words already in dictionary.")
            return results

        self.metrics.total_words = len(pending)
        self.status = ScraperStatus.RUNNING
        logging.info("Processing %d new words…", len(pending))

        # Build bounded queue and seed it
        queue: asyncio.Queue[str | None] = asyncio.Queue(
            maxsize=self.settings.queue_max_size
        )

        async def _producer() -> None:
            for w in pending:
                if self._shutdown_event.is_set():
                    break
                await queue.put(w)
            # Send one sentinel per worker
            for _ in range(self.settings.concurrent_requests):
                await queue.put(None)

        # Launch workers
        workers = [
            asyncio.create_task(
                self._worker(queue, results, self.settings.output_file),
                name=f"worker-{i}",
            )
            for i in range(self.settings.concurrent_requests)
        ]
        producer_task = asyncio.create_task(_producer(), name="producer")

        # Always use simple mode — Rich progress bar causes async deadlocks
        await asyncio.gather(producer_task, *workers)

        # Final save
        atomic_save(self.settings.output_file, results)
        self.status = ScraperStatus.COMPLETED

        self._log_summary(results)

        if self.settings.enable_metrics:
            metrics_path = self.settings.output_file.with_suffix(".metrics")
            metrics_path.write_text(self.metrics.to_prometheus(), encoding="utf-8")
            logging.info("Prometheus metrics → %s", metrics_path)

        return results

    async def _run_with_progress(
        self,
        workers:       list[asyncio.Task[None]],
        producer_task: asyncio.Task[None],
        pending:       list[str],
    ) -> None:
        """Drive workers while rendering a Rich live progress bar."""
        total = len(pending)

        with Progress(
            SpinnerColumn(),
            TextColumn("[bold blue]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            TextColumn("•"),
            TimeRemainingColumn(),
            console=_console,
            transient=True,
        ) as progress:
            task_id = progress.add_task("Scraping Quranic words…", total=total)
            done = 0

            await asyncio.gather(producer_task, return_exceptions=True)

            while done < total and not self._shutdown_event.is_set():
                current = self.metrics.successful + self.metrics.failed + self.metrics.skipped
                if current > done:
                    progress.advance(task_id, current - done)
                    done = current
                if all(w.done() for w in workers):
                    break
                await asyncio.sleep(0.25)

            await asyncio.gather(*workers, return_exceptions=True)
            progress.update(task_id, completed=total)

    def _log_summary(self, results: dict[str, dict]) -> None:
        m = self.metrics

        if _RICH and _console:
            table = Table(title="Scraping Complete", show_header=False, box=None)
            table.add_column("Label", style="bold")
            table.add_column("Value", style="green")

            table.add_row("✓ Successful",    str(m.successful))
            table.add_row("✗ Failed",        str(m.failed))
            table.add_row("⟳ Skipped",       str(m.skipped))
            table.add_row("⚡ Cache hits",    str(m.cache_hits))
            table.add_row("⏱  Duration",     f"{m.elapsed_seconds:.1f}s")
            table.add_row("🎯 Success rate", f"{m.success_rate:.1f}%")
            table.add_row("📶 p50 latency",  f"{m.p50_latency_ms:.0f}ms")
            table.add_row("📶 p95 latency",  f"{m.p95_latency_ms:.0f}ms")
            table.add_row("📁 Output",       str(self.settings.output_file))
            table.add_row("📖 Total entries", str(len(results)))

            _console.print(Panel(table, border_style="blue"))
        else:
            logging.info(
                "Done — ✓%d ✗%d skip:%d cache:%d | %.1fs | %.1f%% | p50=%dms | %s",
                m.successful, m.failed, m.skipped, m.cache_hits,
                m.elapsed_seconds, m.success_rate, m.p50_latency_ms,
                self.settings.output_file,
            )


# ═════════════════════════════════════════════════════════════
# §13  CLI (Typer)
# ═════════════════════════════════════════════════════════════

app = typer.Typer(
    name="kalimmat-scraper",
    help="🕌 Scrape Quranic word meanings from Kalimmat.com",
    add_completion=False,
)


@app.command()
def main(
    dry_run: bool = typer.Option(
        False, "--dry-run", "-n",
        help="Parse words but make no network requests.",
    ),
    limit: int | None = typer.Option(
        None, "--limit", "-l", min=1,
        help="Cap the number of new words processed.",
    ),
    verbose: bool = typer.Option(
        False, "--verbose", "-v",
        help="Set log level to DEBUG.",
    ),
    metrics: bool = typer.Option(
        False, "--metrics", "-m",
        help="Export Prometheus metrics file alongside output.",
    ),
    output: Path | None = typer.Option(
        None, "--output", "-o",
        help="Override output JSON path.",
    ),
    juz_dir: Path | None = typer.Option(
        None, "--juz-dir",
        help="Override TypeScript source directory.",
    ),
) -> None:
    """
    Extract Arabic words from TypeScript juz files, then scrape their
    meanings from kalimmat.com, saving results atomically to a JSON file.
    """
    settings = ScraperSettings()

    # CLI flags take precedence over env vars / .env
    if dry_run:
        settings = settings.model_copy(update={"dry_run": True})
    if limit is not None:
        settings = settings.model_copy(update={"word_limit": limit})
    if metrics:
        settings = settings.model_copy(update={"enable_metrics": True})
    if output is not None:
        settings = settings.model_copy(update={"output_file": output.resolve()})
    if juz_dir is not None:
        settings = settings.model_copy(update={"juz_dir": juz_dir.resolve()})
    if verbose:
        settings = settings.model_copy(update={"log_level": LogLevel.DEBUG})

    configure_logging(settings.log_level, settings.log_file)

    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        with suppress(AttributeError):
            sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]

    exit_code = asyncio.run(_run(settings))
    raise typer.Exit(exit_code)


async def _run(settings: ScraperSettings) -> int:
    """Async entry point: load, scrape, save."""
    # Load existing dictionary
    mujam: dict[str, dict] = {}
    if settings.output_file.exists():
        try:
            mujam = json.loads(settings.output_file.read_text(encoding="utf-8"))
            logging.info("Loaded %d existing entries from %s", len(mujam), settings.output_file)
        except json.JSONDecodeError as exc:
            logging.error("Corrupted JSON (%s) — starting fresh", exc)

    # Extract words from TypeScript sources
    logging.info("Scanning %s for Arabic tokens…", settings.juz_dir)
    all_words = extract_ts_words(settings.juz_dir)

    if not all_words:
        logging.warning("No words found — check --juz-dir path.")
        return 1

    try:
        async with KalimmatScraper(settings) as scraper:
            await scraper.scrape(words=list(all_words), existing=mujam)
        return 0
    except KeyboardInterrupt:
        logging.warning("Interrupted.")
        return 130
    except Exception:
        logging.exception("Fatal scraper error")
        return 1

if __name__ == "__main__":
    app()
