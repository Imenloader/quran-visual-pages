import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { JuzInfo, toArabicNumber, getQuranPageImageUrl } from "@/data/quranData";
import { Download, Check, Loader2, Wifi, WifiOff, Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface JuzCardProps {
  juz: JuzInfo;
  index: number;
  isBookmarked?: boolean;
}

const STORAGE_KEY = "juz-download-state";

const getStoredState = (juzNumber: number): boolean => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return stored[juzNumber] === true;
  } catch { return false; }
};

const setStoredState = (juzNumber: number, done: boolean) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    stored[juzNumber] = done;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch { /* ignore */ }
};

const JuzCard = ({ juz, index, isBookmarked }: JuzCardProps) => {
  const wasDone = getStoredState(juz.number);
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "done">(wasDone ? "done" : "idle");
  const [progress, setProgress] = useState(0);
  const [cachedPercent, setCachedPercent] = useState<number | null>(wasDone ? 100 : null);
  const [longPressing, setLongPressing] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite("juz", juz.number);

  const totalPages = juz.endPage - juz.startPage + 1;

  // Check how many pages are cached on mount
  useEffect(() => {
    if (wasDone) return;
    let cancelled = false;
    const checkCache = async () => {
      try {
        const cache = await caches.open("workbox-runtime");
        const keys = await cache.keys();
        const urls = new Set(keys.map(k => k.url));
        let cached = 0;
        for (let p = juz.startPage; p <= juz.endPage; p++) {
          if (urls.has(getQuranPageImageUrl(p))) cached++;
        }
        if (!cancelled) {
          const pct = Math.round((cached / totalPages) * 100);
          setCachedPercent(pct);
          if (cached === totalPages) {
            setDownloadState("done");
            setStoredState(juz.number, true);
          }
        }
      } catch {
        if (!cancelled) setCachedPercent(null);
      }
    };
    checkCache();
    return () => { cancelled = true; };
  }, [juz.startPage, juz.endPage, totalPages, juz.number, wasDone]);

  const downloadForOffline = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloadState === "downloading") return;
    setDownloadState("downloading");
    setProgress(0);

    let loaded = 0;
    const batchSize = 4;
    const pages = Array.from({ length: totalPages }, (_, i) => juz.startPage + i);

    for (let i = 0; i < pages.length; i += batchSize) {
      const batch = pages.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (page) => {
          try {
            const url = getQuranPageImageUrl(page);
            const res = await fetch(url, { cache: "force-cache" });
            if (res.ok) await res.blob();
          } catch { /* ignore */ }
          loaded++;
          setProgress(Math.round((loaded / totalPages) * 100));
        })
      );
    }

    setDownloadState("done");
    setCachedPercent(100);
    setStoredState(juz.number, true);
  };

  // Long-press to download
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handlePointerDown = useCallback(() => {
    isLongPress.current = false;
    if (downloadState === "idle") {
      setLongPressing(true);
    }
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setLongPressing(false);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      if (downloadState === "idle") {
        toast.info(`جاري تحميل ${juz.nameAr} للأوفلاين...`);
        downloadForOffline({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent);
      }
    }, 600);
  }, [downloadState, juz.nameAr]);

  const handlePointerUp = useCallback(() => {
    setLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isLongPress.current) {
      e.preventDefault();
    }
  }, []);

  const { ref: revealRef, isVisible } = useScrollReveal<HTMLAnchorElement>({ threshold: 0.1 });

  return (
    <Link
      to={`/juz/${juz.number}`}
      ref={revealRef}
      className={`group block transition-all duration-500 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${(index % 10) * 60}ms` }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
    >
      <div className={`relative overflow-hidden rounded-lg border-2 bg-card p-5 transition-all duration-300 hover:shadow-islamic hover:border-gold-light hover:-translate-y-1 select-none ${
        isBookmarked ? "border-gold shadow-[0_0_12px_rgba(196,167,82,0.3)]" : "border-border"
      }`}>
        {isBookmarked && (
          <div className="absolute top-0 right-0 bg-gold text-foreground text-[9px] font-naskh font-bold px-2 py-0.5 rounded-bl-lg z-10">
            📖 متوقف هنا
          </div>
        )}
        <div className="absolute top-0 left-0 w-12 h-12 gradient-gold opacity-20 rounded-br-full" />

        {/* Favorite button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite({ type: "juz", id: juz.number }); }}
          title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 ${
            isFav ? "bg-red-500/20 text-red-500" : "bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
          }`}
        >
          <Heart size={14} fill={isFav ? "currentColor" : "none"} />
        </button>

        {/* Download button */}
        <button
          onClick={downloadForOffline}
          title="تحميل للقراءة أوفلاين"
          className={`absolute ${isBookmarked ? "top-8" : "top-2"} right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 ${
            downloadState === "done"
              ? "bg-primary text-primary-foreground"
              : downloadState === "downloading"
              ? "bg-gold/20 text-gold"
              : "bg-muted text-muted-foreground hover:bg-gold/20 hover:text-gold"
          }`}
        >
          {downloadState === "downloading" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : downloadState === "done" ? (
            <Check size={14} />
          ) : (
            <Download size={14} />
          )}
        </button>

        {/* Progress bar */}
        {downloadState === "downloading" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden rounded-b-lg">
            <div className="h-full gradient-gold transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="relative flex items-center justify-center w-14 h-14 mx-auto mb-3">
          {/* Long-press progress ring */}
          <svg
            className={`absolute inset-0 w-14 h-14 -rotate-90 transition-opacity ${longPressing ? "opacity-100" : "opacity-0"}`}
            viewBox="0 0 56 56"
          >
            <circle cx="28" cy="28" r="25" fill="none" stroke="hsl(var(--gold))" strokeWidth="3" strokeOpacity="0.2" />
            <circle
              cx="28" cy="28" r="25" fill="none"
              stroke="hsl(var(--gold))"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 25}`}
              strokeDashoffset={`${2 * Math.PI * 25}`}
              strokeLinecap="round"
              className={longPressing ? "animate-long-press-ring" : ""}
            />
          </svg>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full gradient-islamic transition-transform ${longPressing ? "scale-90" : ""}`}>
            <span className="text-lg font-bold font-amiri text-primary-foreground">
              {toArabicNumber(juz.number)}
            </span>
          </div>
        </div>

        <h3 className="text-center font-amiri text-lg font-bold text-foreground mb-1 group-hover:text-gold-dark transition-colors">
          {juz.nameAr}
        </h3>

        <p className="text-center text-sm text-muted-foreground font-naskh">
          {juz.startSurah}
        </p>

        <p className="text-center text-xs text-muted-foreground mt-2 font-naskh">
          صفحة {toArabicNumber(juz.startPage)} - {toArabicNumber(juz.endPage)}
        </p>

        {/* Offline status indicator */}
        {downloadState !== "downloading" && cachedPercent !== null && (
          <div className={`flex items-center justify-center gap-1 mt-2 text-[10px] font-naskh ${
            cachedPercent === 100 ? "text-primary" : cachedPercent > 0 ? "text-gold" : "text-muted-foreground/50"
          }`}>
            {cachedPercent === 100 ? (
              <>
                <Wifi size={10} />
                <span>متاح أوفلاين</span>
              </>
            ) : cachedPercent > 0 ? (
              <>
                <Wifi size={10} />
                <span>{cachedPercent}% محمّل</span>
              </>
            ) : (
              <>
                <WifiOff size={10} />
                <span>غير محمّل</span>
              </>
            )}
          </div>
        )}

        {downloadState === "downloading" && (
          <p className="text-center text-[10px] text-gold font-naskh mt-1">
            جاري التحميل... {progress}%
          </p>
        )}
        {downloadState === "done" && (
          <p className="text-center text-[10px] text-primary font-naskh mt-1">
            ✓ تم التحميل للأوفلاين
          </p>
        )}
      </div>
    </Link>
  );
};

export default JuzCard;
