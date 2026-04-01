import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { JuzInfo, toArabicNumber, getQuranPageImageUrl } from "@/data/quranData";
import { DownloadCloud, Check, Loader2, Wifi, WifiOff, Heart, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";
import { motion } from "motion/react";

interface JuzCardProps {
  juz: JuzInfo;
  index: number;
  isBookmarked?: boolean;
  searchQuery?: string;
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

const JuzCard = ({ juz, index, isBookmarked, searchQuery }: JuzCardProps) => {
  const wasDone = getStoredState(juz.number);
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "done">(wasDone ? "done" : "idle");
  const [progress, setProgress] = useState(0);
  const [cachedPercent, setCachedPercent] = useState<number | null>(wasDone ? 100 : null);
  const [longPressing, setLongPressing] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite("juz", juz.number);

  const totalPages = juz.endPage - juz.startPage + 1;

  const readingProgress = useMemo(() => {
    try {
      const history = JSON.parse(localStorage.getItem("quran-reading-history") || "{}");
      const juzHistory = history[juz.number] || { pagesRead: 0 };
      return (juzHistory.pagesRead / totalPages) * 100;
    } catch {
      return 0;
    }
  }, [juz.number, totalPages]);

  const matchedSurahs = useMemo(() => 
    searchQuery ? juz.surahs.filter(s => s.includes(searchQuery)) : []
  , [searchQuery, juz.surahs]);

  useEffect(() => {
    if (wasDone) return;
    let cancelled = false;
    const checkCache = async () => {
      try {
        const cache = await caches.open("quran-pages-cache");
        const keys = await cache.keys();
        const urls = new Set(keys.map(k => k.url));
        let cached = 0;
        for (let p = juz.startPage; p <= juz.endPage; p++) {
          const pageUrl = new URL(getQuranPageImageUrl(p), window.location.origin).href;
          if (urls.has(pageUrl)) cached++;
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

  const downloadForOffline = useCallback(async (e: React.MouseEvent) => {
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
      const cache = await caches.open("quran-pages-cache");
      await Promise.all(
        batch.map(async (page) => {
          try {
            const url = getQuranPageImageUrl(page);
            await cache.add(url);
          } catch (err) { 
            console.error(`Failed to cache page ${page}:`, err);
          }
          loaded++;
          setProgress(Math.round((loaded / totalPages) * 100));
        })
      );
    }

    setDownloadState("done");
    setCachedPercent(100);
    setStoredState(juz.number, true);
  }, [downloadState, juz.number, juz.startPage, totalPages]);

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
      if (navigator.vibrate) navigator.vibrate(30);
      if (downloadState === "idle") {
        toast.info(`جاري تحميل ${juz.nameAr} للأوفلاين...`);
        downloadForOffline({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent);
      }
    }, 600);
  }, [downloadState, juz.nameAr, downloadForOffline]);

  const handlePointerUp = useCallback(() => {
    setLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isLongPress.current) e.preventDefault();
  }, []);

  return (
    <Link
      to={`/juz/${juz.number}`}
      className="group block"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
    >
      <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border bg-card p-6 md:p-8 transition-all duration-500 hover:shadow-islamic select-none ${
          isBookmarked ? "border-accent shadow-gold-glow" : "border-border/60 hover:border-primary/40"
        }`}
      >
        {/* Reading Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20 z-20">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${readingProgress}%` }}
            className="h-full bg-accent/40"
          />
        </div>

        {/* Decorative Background Element */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        
        {/* Bookmark Badge */}
        {isBookmarked && (
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-serif font-bold px-5 py-2 rounded-bl-3xl z-10 shadow-sm flex items-center gap-2">
            <BookOpen size={12} />
            <span>متوقف هنا</span>
          </div>
        )}

        {/* Action Buttons Container */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-2 md:gap-3 z-10">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite({ type: "juz", id: juz.number }); }}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-all backdrop-blur-sm ${
              isFav ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground hover:bg-red-500/5 hover:text-red-400"
            }`}
          >
            <Heart size={14} fill={isFav ? "currentColor" : "none"} strokeWidth={1.5} className="md:w-4 md:h-4" />
          </button>

          <button
            onClick={downloadForOffline}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-all backdrop-blur-sm ${
              downloadState === "done"
                ? "bg-emerald-500/10 text-emerald-500"
                : downloadState === "downloading"
                ? "bg-accent/10 text-accent"
                : "bg-muted/50 text-muted-foreground hover:bg-accent/10 hover:text-accent"
            }`}
          >
            {downloadState === "downloading" ? (
              <Loader2 size={14} className="animate-spin md:w-4 md:h-4" />
            ) : downloadState === "done" ? (
              <Check size={14} className="md:w-4 md:h-4" />
            ) : (
              <DownloadCloud size={14} strokeWidth={1.5} className="md:w-4 md:h-4" />
            )}
          </button>
        </div>

        {/* Juz Number Circle */}
        <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8">
          <svg
            className={`absolute inset-0 w-20 h-20 md:w-24 md:h-24 -rotate-90 transition-opacity duration-500 ${longPressing ? "opacity-100" : "opacity-0"}`}
            viewBox="0 0 96 96"
          >
            <circle cx="48" cy="48" r="44" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeOpacity="0.1" />
            <circle
              cx="48" cy="48" r="44" fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44}`}
              strokeLinecap="round"
              className={longPressing ? "animate-long-press-ring" : ""}
            />
          </svg>
          <div className={`flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-emerald-deep text-white transition-all duration-500 shadow-lg ${longPressing ? "scale-90" : "group-hover:scale-105"}`}>
            <span className="text-2xl md:text-3xl font-bold font-serif">
              {juz.number}
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          <h3 className="font-serif text-2xl md:text-3xl font-medium text-primary group-hover:text-accent transition-colors duration-300">
            {juz.nameAr}
          </h3>

          <p className="text-[10px] md:text-xs text-muted-foreground font-naskh leading-relaxed max-w-[240px] mx-auto line-clamp-2">
            {juz.surahs.join("، ")}
          </p>
          
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-3 md:w-4 bg-border" />
            <p className="text-xs md:text-sm text-muted-foreground font-naskh italic">
              {juz.startSurah}
            </p>
            <div className="h-px w-3 md:w-4 bg-border" />
          </div>

          {matchedSurahs.length > 0 && (
            <div className="pt-2 flex flex-wrap justify-center gap-1 md:gap-1.5">
              {matchedSurahs.map(s => (
                <span key={s} className="text-[8px] md:text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-naskh font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="pt-3 md:pt-4">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-muted text-[9px] md:text-[11px] text-muted-foreground font-naskh">
              <span>صفحة {juz.startPage}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{juz.endPage}</span>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 md:gap-2">
            {cachedPercent === 100 ? (
              <div className="flex items-center gap-1 md:gap-1.5 text-emerald-500 text-[8px] md:text-[10px] font-medium">
                <Wifi size={10} className="md:w-3 md:h-3" />
                <span>جاهز للأوفلاين</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 md:gap-1.5 text-muted-foreground text-[8px] md:text-[10px]">
                <WifiOff size={10} className="md:w-3 md:h-3" />
                <span>{cachedPercent ? `${cachedPercent}%` : "غير محمّل"}</span>
              </div>
            )}
          </div>
          
          <div className="text-[8px] md:text-[10px] text-muted-foreground font-serif uppercase tracking-[0.1em] md:tracking-widest">
            Juz {juz.number}
          </div>
        </div>

        {/* Download Progress Bar */}
        {downloadState === "downloading" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden">
            <motion.div 
              className="h-full bg-accent" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default JuzCard;
