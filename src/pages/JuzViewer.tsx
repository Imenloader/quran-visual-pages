import { useParams, Navigate, Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
// --- التعديل هنا: إضافة lazy و Suspense ---
import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { juzData, getQuranPageFallbackImageUrl, toArabicNumber, surahIndex } from "@/data/quranData";
import QuranHeader from "@/components/QuranHeader";
import ReaderToolsDrawer from "@/components/ReaderToolsDrawer";
import ProgressBar from "@/components/ProgressBar";
import PageNavigator from "@/components/PageNavigator";
import JuzIndex from "@/components/JuzIndex";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { ChevronRight, ChevronLeft, ArrowUp, Maximize, Minimize, ChevronUp, GraduationCap, RefreshCw, Music, Eye, EyeOff, LayoutList, Square, Trophy, Menu, ArrowLeft } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import QuranTextViewer from "@/components/QuranTextViewer";
import TajweedLegend from "@/components/TajweedLegend";
import QuranPlayerBar from "@/components/QuranPlayerBar";
import { useTranslation } from "react-i18next";
import { useAudioPlayer, getAudioUrl } from "@/contexts/AudioPlayerContext";
import { audioDownloadService } from "@/services/audioDownloadService";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { syncService } from "@/services/syncService";
import BackButton from "@/components/BackButton";
import AtmosphericBackground from "@/components/AtmosphericBackground";
import { cn } from "@/lib/utils";
import { useOffline } from "@/contexts/OfflineContext";
import { useQanet } from "@/pages/qanet/QanetContext";

// --- التعديل هنا: تحميل KhatmaCelebration بشكل Lazy ---
const KhatmaCelebration = lazy(() => import("@/components/KhatmaCelebration"));
// ---------------------------------------------------

const BOOKMARK_KEY = "quran-bookmark";

interface BookmarkData {
  juz: number;
  page: number;
  readingMode: "image" | "text";
  verseKey?: string;
}

const getBookmark = (): BookmarkData | null => {
  try {
    const data = localStorage.getItem(BOOKMARK_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    
    // Handle wrapped syncService payload format
    const bookmarkData = (parsed && typeof parsed === 'object' && '_syncedAt' in parsed) 
      ? parsed.data 
      : parsed;

    if (bookmarkData && typeof bookmarkData.juz === 'number' && typeof bookmarkData.page === 'number') {
      return bookmarkData;
    }
    return null;
  } catch {
    return null;
  }
};

const saveBookmark = (juz: number, page: number, readingMode: "image" | "text", verseKey?: string) => {
  const data = { 
    juz, 
    page, 
    readingMode, 
    verseKey: verseKey || "" // Ensure never undefined for Firestore
  };
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(data));
  // Also sync to cloud if logged in
  syncService.saveData(BOOKMARK_KEY, data).catch(err => {
    console.warn("Failed to sync bookmark to cloud:", err);
  });
};

function JuzViewer() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { juzNumber } = useParams();
  const num = parseInt(juzNumber || "0");
  const juz = juzData.find((j) => j.number === num);
  const { theme, readingMode, setReadingMode, scrollDirection, tajweedMode, hifzMode, setHifzMode, preferredImageSource, setPreferredImageSource, isLoaded } = useTheme();
  const { addAyahRead, addPageRead, addJuzCompleted } = useUser();
  const { pageStatus, refreshJuzCompletion, prefetchNeighborPages, prepareJuzOffline } = useOffline();
  const { isTracking, trackingSession, stopTracking, updateTrackingPage } = useQanet();



  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});
  const [pageSources, setPageSources] = useState<Record<number, string[]>>({});
  const [sourceIndexes, setSourceIndexes] = useState<Record<number, number>>({});
  const [isPreparingJuzOffline, setIsPreparingJuzOffline] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(juz?.startPage || 0);
  const [hiddenPages, setHiddenPages] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem("quran-hidden-pages");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [hiddenLines, setHiddenLines] = useState<Record<number, number[]>>(() => {
    try {
      const saved = localStorage.getItem("quran-hidden-lines");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Predictive Pre-fetching Effect
  useEffect(() => {
    if (currentPage > 0 && juz) {
      prefetchNeighborPages(currentPage, 2, { start: juz.startPage, end: juz.endPage });
    }
  }, [currentPage, juz, prefetchNeighborPages]);


  // Handle ?test=true from navigation
  useEffect(() => {
    if (searchParams.get("test") === "true") {
      setHifzMode(true);
    }
  }, [searchParams, setHifzMode]);

  const { isFullscreen, setIsFullscreen } = useTheme();
  const { playAyah, togglePlay, currentSurah, stopPlayer, syncMode } = useAudioPlayer();
    const [showControls, setShowControls] = useState(false);
    const [showToolsDrawer, setShowToolsDrawer] = useState(false);

  useEffect(() => {
    setIsFullscreen(!showControls);
  }, [showControls, setIsFullscreen]);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [showPageNav, setShowPageNav] = useState(false);
  const [showKhatmaCelebration, setShowKhatmaCelebration] = useState(false);

  // Auto-stop JuzViewer player when leaving the page or switching tabs
  useEffect(() => {
    const handleUnmount = () => {
      if (syncMode) {
        stopPlayer();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && syncMode) {
        // User switched to another browser tab
        // Note: We only stop if syncMode is active, meaning it was started from the JuzViewer
        stopPlayer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      handleUnmount();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setIsFullscreen(false);
    };
  }, [syncMode, stopPlayer, setIsFullscreen]);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState<BookmarkData | null>(null);
  const [currentVerseKey, setCurrentVerseKey] = useState<string | undefined>(() => getBookmark()?.verseKey);

  const lastScrollY = useRef(0);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const currentPageRef = useRef(currentPage);
  const prevScrollDirectionRef = useRef(scrollDirection);
  const prevReadingModeRef = useRef(readingMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialDist, setInitialDist] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState<number>(100);
  const [isPinching, setIsPinching] = useState(false);

  // Pinch-to-zoom logic
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        setIsPinching(true);
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        setInitialDist(dist);
        setInitialZoom(zoom);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDist !== null) {
        if (e.cancelable) e.preventDefault();
        
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = dist / initialDist;
        const nextZoom = Math.min(Math.max(initialZoom * scale, 40), 250);
        setZoom(nextZoom);
      }
    };

    const handleTouchEnd = () => {
      setInitialDist(null);
      setIsPinching(false);
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoom, initialDist, initialZoom]);

  const pages = useMemo(() => {
    if (!juz) return [];
    return Array.from(
      { length: juz.endPage - juz.startPage + 1 },
      (_, i) => juz.startPage + i
    );
  }, [juz]);

  const progress = useMemo(() => {
    if (!pages.length || !currentPage) return 0;
    const index = pages.indexOf(currentPage);
    return Math.round(((index + 1) / pages.length) * 100);
  }, [pages, currentPage]);

  const getSourceCandidates = useCallback((page: number) => {
    const candidates = Array.from({ length: 6 }, (_, level) =>
      getQuranPageFallbackImageUrl(page, level, tajweedMode, preferredImageSource || undefined)
    ).filter(Boolean);
    return [...new Set([...candidates, "/placeholder.svg"])];
  }, [tajweedMode, preferredImageSource]);

  const getImageUrl = useCallback((page: number) => {
    const sources = pageSources[page] || getSourceCandidates(page);
    const idx = sourceIndexes[page] || 0;
    return sources[Math.min(idx, sources.length - 1)];
  }, [pageSources, sourceIndexes, getSourceCandidates]);

  const lastTriggerRef = useRef("");
  
  useEffect(() => {
    if (!pages.length) return;
    
    // Only run if the triggering state has actually changed to avoid scroll-refresh loops
    const triggerKey = JSON.stringify({
      juz: juz?.number,
      tajweed: tajweedMode,
      preferred: preferredImageSource
    });
    
    if (lastTriggerRef.current === triggerKey) return;
    lastTriggerRef.current = triggerKey;

    let cancelled = false;
    
    const buildDeterministicSources = async () => {
      const nextSources: Record<number, string[]> = {};
      
      // If we're offline, we MUST prefer cached items
      const isOffline = !navigator.onLine;

      if (!("caches" in window)) {
        pages.forEach((page) => {
          nextSources[page] = getSourceCandidates(page);
        });
        if (!cancelled) {
          setPageSources(nextSources);
        }
        return;
      }

      const cache = await caches.open("quran-pages-cache");
      
      // Batch cache checks to be faster
      const results = await Promise.all(pages.map(async (page) => {
        const candidates = getSourceCandidates(page);
        const preferred = candidates[0];
        const others = candidates.slice(1);
        
        const cached: string[] = [];
        const uncached: string[] = [];
        
        for (const c of others) {
          if (c === "/placeholder.svg") {
            uncached.push(c);
          } else {
            const hit = await cache.match(c);
            if (hit) cached.push(c);
            else uncached.push(c);
          }
        }
        
        const prefHit = preferred !== "/placeholder.svg" ? await cache.match(preferred) : null;
        
        let final: string[];
        if (prefHit) {
          final = [preferred, ...cached, ...uncached];
        } else {
          final = isOffline 
            ? [...cached, preferred, ...uncached] 
            : [preferred, ...cached, ...uncached];
        }
        return { page, sources: final };
      }));

      if (cancelled) return;

      results.forEach(res => {
        nextSources[res.page] = res.sources;
      });

      setPageSources(prev => {
        if (JSON.stringify(prev) === JSON.stringify(nextSources)) return prev;
        return nextSources;
      });
    };

    buildDeterministicSources();
    return () => {
      cancelled = true;
    };
  }, [pages, getSourceCandidates, tajweedMode, preferredImageSource, juz?.number]);

  useEffect(() => {
    localStorage.setItem("quran-hidden-pages", JSON.stringify(hiddenPages));
  }, [hiddenPages]);

  useEffect(() => {
    localStorage.setItem("quran-hidden-lines", JSON.stringify(hiddenLines));
  }, [hiddenLines]);

  const handleImageLoad = useCallback((page: number) => {
    setLoadingStates(prev => ({ ...prev, [page]: false }));
  }, []);

  const handleImageError = useCallback((page: number) => {
    setSourceIndexes(prev => {
      const sources = pageSources[page] || getSourceCandidates(page);
      const current = prev[page] || 0;
      const next = Math.min(current + 1, sources.length - 1);
      return { ...prev, [page]: next };
    });
  }, [pageSources, getSourceCandidates]);

  const isPageHidden = (page: number) => hifzMode && !!hiddenPages[page];

  const togglePageHidden = useCallback((page: number) => {
    setHiddenPages(prev => ({
      ...prev,
      [page]: !prev[page]
    }));
  }, []);

  const isLineHidden = (page: number, lineIndex: number) => {
    return hifzMode && (hiddenLines[page]?.includes(lineIndex) ?? false);
  };

  const toggleLineHidden = useCallback((page: number, lineIndex: number) => {
    setHiddenLines(prev => {
      const lines = prev[page] || [];
      const newLines = Array.isArray(lines) && lines.includes(lineIndex)
        ? lines.filter(l => l !== lineIndex)
        : [...(Array.isArray(lines) ? lines : []), lineIndex];
      return { ...prev, [page]: newLines };
    });
  }, []);

  const hideAllLines = useCallback((page: number) => {
    setHiddenLines(prev => ({
      ...prev,
      [page]: Array.from({ length: 15 }, (_, i) => i)
    }));
    toast.info(`تم إخفاء أسطر الصفحة ${toArabicNumber(page.toString())}`);
  }, []);

  const showAllLines = useCallback((page: number) => {
    setHiddenLines(prev => ({
      ...prev,
      [page]: []
    }));
    toast.info(`تم إظهار أسطر الصفحة ${toArabicNumber(page.toString())}`);
  }, []);



  useEffect(() => {
    let isMounted = true;
    const initPage = async () => {
      if (pages.length > 0 && currentPage === 0) {
        // Try to load from cloud/local
        const cloudBookmark = await syncService.loadData<BookmarkData | null>(BOOKMARK_KEY, null);
        
        if (!isMounted) return;

        // Restore reading mode if the bookmark specifies it
        if (cloudBookmark?.readingMode && cloudBookmark.readingMode !== readingMode) {
          setReadingMode(cloudBookmark.readingMode);
        }

        let targetPage = cloudBookmark?.page;
        let targetVerse = cloudBookmark?.verseKey;

        // Parse hash if present (e.g., #verse-1:2 or #page-5)
        if (location.hash) {
          if (location.hash.startsWith('#verse-')) {
            targetVerse = location.hash.replace('#verse-', '');
            const [sNum] = targetVerse.split(":");
            const surah = surahIndex.find(s => s.number.toString() === sNum);
            if (surah && surah.startPage) {
               targetPage = surah.startPage;
            }
          } else if (location.hash.startsWith('#page-')) {
            const hashPage = parseInt(location.hash.replace('#page-', ''));
            if (!isNaN(hashPage) && pages.includes(hashPage)) {
              targetPage = hashPage;
            }
          }
        }

        if (targetPage && pages.includes(targetPage)) {
          setCurrentPage(targetPage);
          if (targetVerse) setCurrentVerseKey(targetVerse);
          if (scrollDirection === "vertical") {
            setTimeout(() => scrollToPage(targetPage!), 100);
          }
        } else if (cloudBookmark && cloudBookmark.juz === num && pages.includes(cloudBookmark.page)) {
          setCurrentPage(cloudBookmark.page);
          if (cloudBookmark.verseKey) setCurrentVerseKey(cloudBookmark.verseKey);
          if (scrollDirection === "vertical") {
            setTimeout(() => scrollToPage(cloudBookmark.page), 100);
          }
        } else {
          setCurrentPage(pages[0]);
        }
      }
    };
    initPage();

    return () => {
      isMounted = false;
    };
  }, [pages, num, scrollDirection, currentPage, location.hash, readingMode, setReadingMode]);

  useEffect(() => {
    if (!juz) return;
    refreshJuzCompletion(num);
    prefetchNeighborPages(juz.startPage, 2, { start: juz.startPage, end: juz.endPage });
  }, [juz, num, prefetchNeighborPages, refreshJuzCompletion]);

  useEffect(() => {
    if (!juz || !currentPage) return;
    prefetchNeighborPages(currentPage, 2, { start: juz.startPage, end: juz.endPage });
  }, [currentPage, juz, prefetchNeighborPages]);

  const scrollToPage = useCallback((page: number) => {
    const el = pageRefs.current[page];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleNextPage = useCallback(() => {
    if (currentPage < juz!.endPage) {
      const next = currentPage + 1;
      setCurrentPage(next);
      if (scrollDirection === "vertical") {
        scrollToPage(next);
      }
    }
  }, [currentPage, juz, scrollDirection, scrollToPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > juz!.startPage) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      if (scrollDirection === "vertical") {
        scrollToPage(prev);
      }
    }
  }, [currentPage, juz, scrollDirection, scrollToPage]);

  const handleSaveBookmark = useCallback(() => {
    if (currentPage) {
      saveBookmark(num, currentPage, readingMode, currentVerseKey);
      setSavedBookmark({ juz: num, page: currentPage, readingMode, verseKey: currentVerseKey });
    }
  }, [num, currentPage, readingMode, currentVerseKey]);

  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    setShowControls(true);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    if (next) {
      toast("وضع ملء الشاشة", {
        description: "انقر على الشاشة لإظهار/إخفاء الأزرار",
        duration: 3000,
        position: "top-center",
      });
      resetControlsTimer();
    }
  }, [isFullscreen, setIsFullscreen, resetControlsTimer]);

  const handleScreenTap = useCallback(() => {
    setShowControls(prev => !prev);
    if (!showControls) resetControlsTimer();
  }, [showControls, resetControlsTimer]);

  const handleMainPlayToggle = useCallback(() => {
    if (!juz) return;
    const isCurrentJuzPlaying = currentSurah && juz.surahs && juz.surahs.includes(currentSurah.name);
    
    if (!isCurrentJuzPlaying) {
      const startSurahParts = juz.startSurah.split(" ");
      const startSurahName = startSurahParts[0];
      const startAyahNumber = startSurahParts.length > 1 ? parseInt(startSurahParts[1]) : 1;
      
      const surahInfo = surahIndex.find(s => s.name === startSurahName);
      if (surahInfo) {
        playAyah(surahInfo.number, startAyahNumber, num);
      }
    } else {
      togglePlay();
    }
  }, [juz, currentSurah, playAyah, togglePlay]);
  const handleVerseInView = useCallback((key: string) => {
    setCurrentVerseKey(key);
    if (readingMode === "text") {
      const [sNum] = key.split(":");
      const surah = surahIndex.find(s => s.number.toString() === sNum);
      if (surah && surah.startPage !== currentPage) {
        setCurrentPage(surah.startPage);
      }
    }
  }, [readingMode, currentPage]);

  const getPageBadgeLabel = useCallback((page: number) => {
    const status = pageStatus[page] || "missing";
    if (status === "cached") return { text: "cached", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" };
    if (status === "downloading") return { text: "downloading", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" };
    return { text: "missing", className: "bg-muted text-muted-foreground border-border/40" };
  }, [pageStatus]);

  const handleDownloadAudio = useCallback(async () => {
    if (!juz || isDownloadingAudio) return;
    
    setIsDownloadingAudio(true);
    toast.info("جاري بدء تحميل صوتيات الجزء...", {
      description: "سيتم تحميل التلاوات للوصول إليها دون اتصال"
    });
    
    try {
      const surahsInJuz = juz.surahs.map(name => surahIndex.find(s => s.name === name)).filter(Boolean);
      
      let downloadedCount = 0;
      const total = surahsInJuz.length;
      
      // Default to Alafasy if nothing playing, or use what's playing
      const defaultServer = "https://server8.mp3quran.net/afs/";
      const server = currentSurah?.id ? (localStorage.getItem("quran-last-played") ? JSON.parse(localStorage.getItem("quran-last-played")!).moshafServer : defaultServer) : defaultServer;
      
      for (const surah of surahsInJuz) {
        if (!surah) continue;
        const url = getAudioUrl(server, surah.number);
        const fileName = `سورة ${surah.name}`;
        
        const success = await audioDownloadService.downloadAudio(url, fileName);
        if (success) downloadedCount++;
      }
      
      if (downloadedCount === total) {
        toast.success("تم تحميل جميع سور الجزء بنجاح");
      } else if (downloadedCount > 0) {
        toast.warning(`تم تحميل ${downloadedCount} من أصل ${total} سور`);
      } else {
        toast.error(t("hub.offline.fetchError"));
      }
    } catch (error) {
      console.error("Audio download error:", error);
      toast.error(t("hub.offline.clearError"));
    } finally {
      setIsDownloadingAudio(false);
    }
  }, [juz, isDownloadingAudio, currentSurah]);

  const handlePrepareThisJuzOffline = useCallback(async () => {
    if (!juz || isPreparingJuzOffline) return;
    setIsPreparingJuzOffline(true);
    toast.info(`${isAr ? "جاري تجهيز" : "Preparing"} ${juz.nameAr} ${isAr ? "للعمل دون اتصال..." : "for offline use..."}`);
    try {
      await prepareJuzOffline(juz.number);
      toast.success(`تم تجهيز ${juz.nameAr} للأوفلاين`);
    } catch (error) {
      console.error("Failed preparing juz offline:", error);
      toast.error(isAr ? "تعذر تجهيز هذا الجزء للأوفلاين" : "Could not prepare this juz for offline");
    } finally {
      setIsPreparingJuzOffline(false);
    }
  }, [juz, isPreparingJuzOffline, prepareJuzOffline]);

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeNavigation({ 
    onSwipeLeft: scrollDirection === "horizontal" ? handleNextPage : undefined, 
    onSwipeRight: scrollDirection === "horizontal" ? handlePrevPage : undefined 
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handleNextPage();
      } else if (e.key === "ArrowRight") {
        handlePrevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextPage, handlePrevPage]);


  useEffect(() => {
    if (currentPage !== 0 && juz) {
      const timer = setTimeout(() => {
        saveBookmark(num, currentPage, readingMode, currentVerseKey);
        setSavedBookmark({ juz: num, page: currentPage, readingMode, verseKey: currentVerseKey });

        // --- Qanet Auto-Tracking Integration ---
        if (isTracking) {
          updateTrackingPage(currentPage);
        }
        // ----------------------------------------

        try {
          const history = JSON.parse(localStorage.getItem("quran-reading-history") || "{}");
          const rawHistory = history[num] || {};

          // Guard: ensure visitedPages is always a valid array (guards against malformed data)
          const visitedPages: number[] = Array.isArray(rawHistory.visitedPages)
            ? rawHistory.visitedPages
            : [];

          const juzHistory = {
            pagesRead: rawHistory.pagesRead ?? 0,
            lastPage: rawHistory.lastPage ?? 0,
            completed: rawHistory.completed ?? false,
            visitedPages,
          };

          if (!juzHistory.visitedPages.includes(currentPage)) {
            juzHistory.visitedPages = [...juzHistory.visitedPages, currentPage];
            juzHistory.pagesRead = juzHistory.visitedPages.length;

            addPageRead();

            if (juzHistory.pagesRead === pages.length && !juzHistory.completed) {
              juzHistory.completed = true;
              addJuzCompleted();

              if (num === 30) {
                setShowKhatmaCelebration(true);
              } else {
                toast.success(t("juzViewer.juzCompleted"), {
                  description: `${t("juzViewer.congrats")} ${isAr ? toArabicNumber(num.toString()) : num}`,
                  icon: <Trophy className="text-gold" />
                });
              }
            }
          }

          juzHistory.lastPage = currentPage;
          history[num] = juzHistory;
          localStorage.setItem("quran-reading-history", JSON.stringify(history));
        } catch (e) {
          console.error("Failed to update reading history:", e);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentPage, num, readingMode, juz, currentVerseKey, addPageRead, addJuzCompleted, pages.length]);


  useEffect(() => {
    if (!juz || pages.length === 0 || !isLoaded) return;
    
    const cacheImages = async () => {
      // Cache current page and next 10 pages
      const currentPageIdx = pages.indexOf(currentPage);
      const start = Math.max(0, currentPageIdx - 2);
      const end = Math.min(pages.length - 1, currentPageIdx + 10);
      
      const pagesToCache = pages.slice(start, end);
      
      for (const p of pagesToCache) {
        const url = getImageUrl(p);
        const img = new Image();
        img.src = url;
      }
    };
    
    const timer = setTimeout(cacheImages, 1000);
    return () => clearTimeout(timer);
  }, [juz, pages, currentPage, tajweedMode, getImageUrl, isLoaded]);



  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (!juz || pages.length === 0 || scrollDirection === "horizontal") return;

    const options = {
      root: null,
      rootMargin: "-45% 0px -45% 0px", 
      threshold: [0, 0.5, 1.0],
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const visibleEntry = entries.find(entry => entry.isIntersecting);
      
      if (visibleEntry) {
        const pageNum = parseInt(visibleEntry.target.id.replace("page-", ""));
        if (pageNum && pageNum !== currentPageRef.current) {
          setCurrentPage(pageNum);
          currentPageRef.current = pageNum;
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    observerRef.current = observer;
    
    pages.forEach(page => {
      const el = document.getElementById(`page-${page}`);
      if (el) observer.observe(el);
    });

    if (pages.length > 0) {
      const firstPageEl = document.getElementById(`page-${pages[0]}`);
      if (firstPageEl) {
        const rect = firstPageEl.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight) {
          setCurrentPage(pages[0]);
          currentPageRef.current = pages[0];
        }
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [juz, num, pages, readingMode, scrollDirection]);



  if (!isLoaded) return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full" />
      <p className="text-muted-foreground font-serif italic">جاري تحميل إعداداتك الخاصة...</p>
    </div>
  );

  if (!juz) return <Navigate to="/" replace />;






  const maxWidth = Math.round(672 * (zoom / 100));











  return (
    <div
      className={`min-h-dvh h-dvh bg-background selection:bg-accent/20 flex flex-col overflow-y-auto overflow-x-hidden`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AtmosphericBackground />
      <div className="fixed inset-0 pattern-islamic opacity-[0.01] pointer-events-none" />
      {/* Always-visible tiny page number — top left, translucent */}
      {currentPage > 0 && !showControls && (
        <div className="fixed top-3 left-3 z-[100] pointer-events-none">
          <div className="w-7 h-7 rounded-lg bg-black/20 backdrop-blur-sm text-white/70 flex items-center justify-center font-serif text-[11px] shadow-sm">
            {toArabicNumber(currentPage.toString())}
          </div>
        </div>
      )}

      {/* Slim translucent top bar — slides down on tap */}
      <div className={`fixed top-0 left-0 right-0 z-[150] transition-all duration-400 ease-out ${showControls ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-full"}`}>
        <div className="bg-black/60 backdrop-blur-xl px-3 py-2 flex items-center justify-between safe-area-top">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/10 transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-white font-serif text-sm leading-none">{juz.nameAr}</span>
            {currentPage > 0 && (
              <span className="text-white/60 text-[10px] font-serif mt-0.5">
                {t("juzViewer.pageOf", { current: isAr ? toArabicNumber(currentPage.toString()) : currentPage, total: isAr ? toArabicNumber(juz.endPage.toString()) : juz.endPage })}
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowToolsDrawer(true); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/10 transition-all active:scale-90"
          >
            <Menu size={20} />
          </button>
        </div>
        <ProgressBar progress={progress} currentPage={currentPage} totalPages={pages.length} startPage={juz.startPage} />
      </div>

      {/* Tools Drawer (bottom sheet) */}
      <ReaderToolsDrawer
        open={showToolsDrawer}
        onOpenChange={setShowToolsDrawer}
        onSaveBookmark={handleSaveBookmark}
        bookmarked={!!(savedBookmark?.juz === num && savedBookmark?.page === currentPage)}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(z + 20, 200))}
        onZoomOut={() => setZoom((z) => Math.max(z - 20, 40))}
        onResetZoom={() => setZoom(100)}
        hifzMode={hifzMode}
        onToggleHifzMode={() => {
          const nextMode = !hifzMode;
          setHifzMode(nextMode);
          if (nextMode) {
            hideAllLines(currentPage);
            toast.success(t("juzViewer.hifzModeActive"), {
              description: t("juzViewer.hifzModeDesc")
            });
          }
        }}
        onDownloadAudio={handleDownloadAudio}
        isDownloadingAudio={isDownloadingAudio}
        onPrepareOffline={handlePrepareThisJuzOffline}
        isPreparingOffline={isPreparingJuzOffline}
        currentPage={currentPage}
        juzNumber={num}
        pages={pages}
        onGoToPage={(page) => {
          setCurrentPage(page);
          if (scrollDirection === "vertical") {
            scrollToPage(page);
          }
        }}
      />



      {/* --- التعديل هنا: استخدام Suspense حول KhatmaCelebration --- */}
      <Suspense fallback={null}>
        <KhatmaCelebration 
          isVisible={showKhatmaCelebration} 
          onClose={() => setShowKhatmaCelebration(false)} 
        />
      </Suspense>
      {/* -------------------------------------------------------- */}




      <main
        className={`w-full flex-1 flex flex-col items-center transition-all duration-500 relative`}
        onClick={handleScreenTap}
      >
        {tajweedMode && !hifzMode && readingMode === "image" && (
          <div className={`w-full max-w-5xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isFullscreen ? "mt-4" : ""}`}>
            <TajweedLegend />
          </div>
        )}
        {hifzMode && readingMode === "image" && (
          <div className="mb-4 text-center">
            <span className="text-xs font-serif text-muted-foreground bg-background/50 px-3 py-1 rounded-full border border-border/20">
              {t("juzViewer.hifzInstructions")}
            </span>
          </div>
        )}

        <div 
          ref={containerRef}
          className="w-full h-full flex-1 overflow-x-auto custom-scrollbar touch-auto flex flex-col"
        >
          <div 
            className={cn(
              "flex-1 h-full min-h-full w-full flex flex-col gap-0 mx-auto origin-top",
              !isPinching && "transition-[width] duration-300 ease-out"
            )}
            style={{ 
              width: `${zoom}%`, 
              minWidth: "100%",
              maxWidth: "none",
              alignItems: zoom > 100 ? 'flex-start' : 'center'
            }}
          >
          {readingMode === "image" ? (
            scrollDirection === "vertical" ? (
              pages.map((page) => (
                <div
                  key={page}
                  ref={(el) => { 
                    if (el) pageRefs.current[page] = el;
                  }}
                  id={`page-${page}`}
                  className={`relative w-full h-dvh shrink-0 group flex items-center justify-center`}
                >
                  {hifzMode && (
                    <div className="sticky top-4 md:top-6 z-30 flex justify-end px-4 md:px-6 pointer-events-none">
                      <div className="flex flex-row gap-1 bg-background/80 backdrop-blur-xl p-1 rounded-2xl border border-border/20 shadow-2xl pointer-events-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePageHidden(page);
                          }}
                          title={isPageHidden(page) ? "إظهار الصفحة" : "إخفاء الصفحة"}
                          className={`p-2 rounded-xl transition-all ${isPageHidden(page) ? "bg-primary text-primary-foreground" : "hover:bg-accent/10 text-primary"}`}
                        >
                          {isPageHidden(page) ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            hideAllLines(page);
                          }}
                          title="إخفاء الأسطر"
                          className="p-2 rounded-xl hover:bg-accent/10 text-primary transition-all"
                        >
                          <Square size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showAllLines(page);
                          }}
                          title="إظهار الأسطر"
                          className="p-2 rounded-xl hover:bg-accent/10 text-primary transition-all"
                        >
                          <LayoutList size={16} />
                        </button>
                      </div>
                    </div>
                  )}



                  {errorStates[page] && (
                    <div className="w-full h-full aspect-[3/4] bg-muted/30 flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                        <ArrowUp className="rotate-180" size={24} />
                      </div>
                      <span className="text-muted-foreground font-serif italic text-lg">
                        تعذر تحميل الصفحة {page}
                      </span>
                    </div>
                  )}

                  {!errorStates[page] && (
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                      <div className="quran-page-bg absolute inset-0 w-full h-full" />
                      <div className={`w-full h-full absolute inset-0 transition-all duration-700 ${isPageHidden(page) ? "blur-3xl opacity-5 grayscale scale-95" : "blur-0 opacity-100 scale-100"}`}>
                        <LazyImage
                          key={getImageUrl(page)}
                          src={getImageUrl(page)}
                          alt={`صفحة ${page} من المصحف الشريف`}
                          className="quran-page-img w-full h-full object-fill md:object-contain"
                          priority={Math.abs(page - currentPage) <= 1}
                          onLoad={() => handleImageLoad(page)}
                          onError={() => handleImageError(page)}
                        />
                      </div>

                      {hifzMode && !isPageHidden(page) && (
                        <div className="absolute inset-0 flex flex-col pointer-events-none z-20">
                          {Array.from({ length: 15 }).map((_, i) => (
                            <div
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLineHidden(page, i);
                              }}
                              className={`flex-1 w-full transition-all duration-500 cursor-pointer pointer-events-auto ${
                                isLineHidden(page, i) 
                                  ? "bg-card backdrop-blur-2xl border-y border-border/10 shadow-inner" 
                                  : "bg-transparent hover:bg-accent/5"
                              }`}
                            >
                              {isLineHidden(page, i) && (
                                <div className="w-full h-full flex items-center justify-center opacity-30">
                                  <div className="w-12 h-0.5 bg-accent/50 rounded-full" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/5 mix-blend-multiply pointer-events-none opacity-20" />
                      
                      {isPageHidden(page) && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePageHidden(page);
                          }}
                        >
                          <div className="bg-muted/60 backdrop-blur-xl p-6 rounded-3xl border border-border/40 shadow-2xl flex flex-col items-center gap-3">
                            <RefreshCw className="w-10 h-10 text-accent animate-spin-slow" />
                            <p className="text-primary font-serif italic text-sm">انقر للمراجعة</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="w-full flex-1 h-full flex flex-col items-center">
                <div key={currentPage} className="w-full h-full flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 w-full h-full">
                      <div className="quran-page-bg absolute inset-0 w-full h-full" />
                      {hifzMode && (
                      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-col gap-2">
                        <div className="flex flex-col gap-1 bg-background/80 backdrop-blur-xl p-1 rounded-2xl border border-border/20 shadow-2xl">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePageHidden(currentPage);
                            }}
                            title={isPageHidden(currentPage) ? "إظهار الصفحة" : "إخفاء الصفحة"}
                            className={`p-2 rounded-xl transition-all ${isPageHidden(currentPage) ? "bg-primary text-primary-foreground" : "hover:bg-accent/10 text-primary"}`}
                          >
                            {isPageHidden(currentPage) ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              hideAllLines(currentPage);
                            }}
                            title="إخفاء الأسطر"
                            className="p-2 rounded-xl hover:bg-accent/10 text-primary transition-all"
                          >
                            <Square size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showAllLines(currentPage);
                            }}
                            title="إظهار الأسطر"
                            className="p-2 rounded-xl hover:bg-accent/10 text-primary transition-all"
                          >
                            <LayoutList size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className={`w-full h-full absolute inset-0 transition-all duration-700 ${isPageHidden(currentPage) ? "blur-3xl opacity-5 grayscale scale-95" : "blur-0 opacity-100 scale-100"}`}>
                      <LazyImage
                        key={getImageUrl(currentPage)}
                        src={getImageUrl(currentPage)}
                        alt={`صفحة ${currentPage} من المصحف الشريف`}
                        className="quran-page-img w-full h-full object-fill md:object-contain"
                        priority={true}
                        onLoad={() => handleImageLoad(currentPage)}
                        onError={() => handleImageError(currentPage)}
                      />
                    </div>

                    {hifzMode && !isPageHidden(currentPage) && (
                      <div className="absolute inset-0 flex flex-col pointer-events-none z-20">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <div
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLineHidden(currentPage, i);
                            }}
                            className={`flex-1 w-full transition-all duration-500 cursor-pointer pointer-events-auto ${
                              isLineHidden(currentPage, i) 
                                ? "bg-card backdrop-blur-2xl border-y border-border/10 shadow-inner" 
                                : "bg-transparent hover:bg-accent/5"
                            }`}
                          >
                            {isLineHidden(currentPage, i) && (
                              <div className="w-full h-full flex items-center justify-center opacity-30">
                                <div className="w-12 h-0.5 bg-accent/50 rounded-full" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isPageHidden(currentPage) && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePageHidden(currentPage);
                        }}
                      >
                        <div className="bg-muted/60 backdrop-blur-xl p-6 rounded-3xl border border-border/40 shadow-2xl flex flex-col items-center gap-3">
                          <RefreshCw className="w-10 h-10 text-accent" />
                          <p className="text-primary font-serif italic text-sm">{t("juzViewer.clickToReview")}</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
              </div>
            )
          ) : (
            <div className="w-full bg-card rounded-[2.5rem] border border-border/40 shadow-islamic overflow-hidden">
              <QuranTextViewer 
                juzNumber={num} 
                hifzMode={hifzMode} 
                initialVerseKey={currentVerseKey}
                onVerseInView={handleVerseInView}
              />
            </div>
          )}
        </div>
      </div>
    </main>

    {/* Bottom Juz Navigation */}
    <div className={`container max-w-2xl mx-auto px-6 pb-20 pt-4 flex gap-4 transition-all duration-500`}>
      {num > 1 && (
        <button
          onClick={() => navigate(`/juz/${num - 1}`)}
          className="flex-1 flex flex-col items-center gap-2 p-6 rounded-[2rem] bg-card border border-border/40 hover:bg-primary/5 transition-all shadow-sm group"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary">{t("juzViewer.prevJuz")}</span>
          <div className="flex items-center gap-2 text-primary font-serif font-bold text-lg">
            <ChevronRight size={20} className="md:w-6 md:h-6" />
            <span>{isAr ? toArabicNumber((num - 1).toString()) : num - 1}</span>
          </div>
        </button>
      )}
      {num < 30 && (
        <button
          onClick={() => navigate(`/juz/${num + 1}`)}
          className="flex-1 flex flex-col items-center gap-2 p-6 rounded-[2rem] bg-card border border-border/40 hover:bg-primary/5 transition-all shadow-sm group"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary">{t("juzViewer.nextJuz")}</span>
          <div className="flex items-center gap-2 text-primary font-serif font-bold text-lg">
            <span>{isAr ? toArabicNumber((num + 1).toString()) : num + 1}</span>
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </div>
        </button>
      )}
    </div>



      <div className="text-center pb-24">
        <button
          onClick={(e) => {
            const container = e.currentTarget.closest('.overflow-y-auto');
            if (container) {
              container.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="group inline-flex flex-col items-center gap-3 text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 group-hover:shadow-soft transition-all">
            <ArrowUp size={18} strokeWidth={1.5} />
          </div>
          <span className="italic group-hover:text-accent">{t("common.backToTop")}</span>
        </button>
      </div>



      {currentSurah && (
        <div className={cn(
          "fixed left-0 right-0 z-[130] px-4 pointer-events-none flex justify-center transition-all duration-700 ease-[0.16, 1, 0.3, 1]",
          "bottom-4",
          isScrollingDown 
            ? "opacity-0 translate-y-20 scale-90" 
            : "opacity-100 translate-y-0 scale-100"
        )}>
          <div className="pointer-events-auto">
            <QuranPlayerBar onPlayFirst={handleMainPlayToggle} isScrollingDown={isScrollingDown} isFullscreen={isFullscreen} />
          </div>
        </div>
      )}
      {isTracking && trackingSession && (
        <div className="fixed top-24 left-4 z-[160] bg-emerald-950/90 text-white p-4 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl flex flex-col gap-3 min-w-[140px] animate-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">تتبع القانتين</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gold leading-none">{(trackingSession.visitedPages.length * 15).toLocaleString('ar-EG')}</span>
            <span className="text-[10px] font-bold opacity-60">آية مقروءة</span>
          </div>
          <button 
            onClick={() => {
              stopTracking(true);
              toast.success("تم حفظ الجلسة بنجاح!");
            }}
            className="w-full bg-white text-emerald-950 py-2 rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all"
          >
            حفظ وإنهاء
          </button>
        </div>
      )}
    </div>
  );
};

export default JuzViewer;
