import { useParams, Navigate, Link, useNavigate, useSearchParams } from "react-router-dom";
// --- التعديل هنا: إضافة lazy و Suspense ---
import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { juzData, getQuranPageFallbackImageUrl, toArabicNumber, surahIndex } from "@/data/quranData";
import QuranHeader from "@/components/QuranHeader";
import ReadingToolbar from "@/components/ReadingToolbar";
import ProgressBar from "@/components/ProgressBar";
import PageNavigator from "@/components/PageNavigator";
import JuzIndex from "@/components/JuzIndex";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { ChevronRight, ChevronLeft, ArrowUp, Maximize, Minimize, ChevronUp, GraduationCap, RefreshCw, Music, Eye, EyeOff, LayoutList, Square, Trophy } from "lucide-react";
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

// --- التعديل هنا: تحميل KhatmaCelebration بشكل Lazy ---
const KhatmaCelebration = lazy(() => import("@/components/KhatmaCelebration"));
const SourceSelector = lazy(() => import("@/components/SourceSelector"));
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
    return data ? JSON.parse(data) : null;
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
  const [searchParams] = useSearchParams();
  const { juzNumber } = useParams();
  const num = parseInt(juzNumber || "0");
  const juz = juzData.find((j) => j.number === num);
  const { theme, readingMode, scrollDirection, tajweedMode, hifzMode, setHifzMode, preferredImageSource, setPreferredImageSource, isLoaded } = useTheme();
  const { addAyahRead, addPageRead, addJuzCompleted } = useUser();
  const { pageStatus, refreshJuzCompletion, prefetchNeighborPages, prepareJuzOffline } = useOffline();



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
  const [showControls, setShowControls] = useState(true);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [showPageNav, setShowPageNav] = useState(false);
  const [showJuzIndex, setShowJuzIndex] = useState(false);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
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
    };
  }, [syncMode, stopPlayer]);
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
    const initPage = async () => {
      if (pages.length > 0 && currentPage === 0) {
        // Try to load from cloud/local
        const cloudBookmark = await syncService.loadData<BookmarkData | null>(BOOKMARK_KEY, null);
        
        if (cloudBookmark && cloudBookmark.juz === num && pages.includes(cloudBookmark.page)) {
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
  }, [pages, num, scrollDirection, currentPage]);

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
    if (!isFullscreen) return;
    setShowControls(prev => !prev);
    if (!showControls) resetControlsTimer();
  }, [isFullscreen, showControls, resetControlsTimer]);

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

        const history = JSON.parse(localStorage.getItem("quran-reading-history") || "{}");
        const juzHistory = history[num] || { pagesRead: 0, lastPage: 0, visitedPages: [] };
        
        if (!(juzHistory.visitedPages || []).includes(currentPage)) {
          juzHistory.visitedPages.push(currentPage);
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
      }, 1500); 
      
      return () => clearTimeout(timer);
    }
  }, [currentPage, num, readingMode, juz, currentVerseKey, addAyahRead, addPageRead, addJuzCompleted, pages.length]);

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full" />
      <p className="text-muted-foreground font-serif italic">جاري تحميل إعداداتك الخاصة...</p>
    </div>
  );

  if (!juz) return <Navigate to="/" replace />;






  const maxWidth = Math.round(672 * (zoom / 100));











  return (
    <div
      className={`min-h-screen bg-background selection:bg-accent/20 ${isFullscreen ? "fullscreen-reading" : ""}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AtmosphericBackground />
      <div className="fixed inset-0 pattern-islamic opacity-[0.01] pointer-events-none" />
      
      <div className={`fixed right-4 md:right-8 z-[120] flex flex-col gap-3 md:gap-4 transition-all duration-500 ${isFullscreen ? (showControls ? "bottom-6 md:bottom-8 opacity-100" : "bottom-6 md:bottom-8 opacity-0 pointer-events-none") : "bottom-24 md:bottom-32 opacity-100"}`}>
          {scrollDirection === "vertical" && progress > 10 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollToPage(pages[0]);
              }}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center"
              title={t("common.backToTop")}
            >
              <ChevronUp className="size-[20px] md:size-[28px]" />
            </button>
          )}
        
        {isFullscreen && showControls && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center bg-primary text-gold border border-primary/10"
            title="الخروج من ملء الشاشة"
          >
            <Minimize className="size-[18px] md:size-[24px]" />
          </button>
        )}

{!isFullscreen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center bg-muted/90 backdrop-blur-md text-primary border border-border/40"
            title="وضع ملء الشاشة"
          >
            <Maximize className="size-[18px] md:size-[24px]" />
          </button>
        )}
      </div>

      <div className={`${isFullscreen && !showControls ? "opacity-0 pointer-events-none fixed top-0 left-0 right-0 z-[150]" : isFullscreen ? "fixed top-0 left-0 right-0 z-[150] opacity-100 pointer-events-auto" : "relative z-20"}`}>
        {!isFullscreen && <QuranHeader title={juz.nameAr} showBack />}
        {isFullscreen && (
          <div className="bg-emerald-deep/95 border-b border-border/40 px-4 py-3 flex items-center justify-between">
            <BackButton variant="ghost" />
            <h2 className="text-white font-serif text-xl">{juz.nameAr}</h2>
            <div className="w-10" />
          </div>
        )}
        <ProgressBar progress={progress} currentPage={currentPage} totalPages={pages.length} startPage={juz.startPage} />
        <div className="px-4 pb-2">
          <button
            onClick={handlePrepareThisJuzOffline}
            disabled={isPreparingJuzOffline}
            className="w-full h-10 rounded-xl border border-border/50 bg-card/80 text-sm font-serif text-primary disabled:opacity-60"
          >
            {isPreparingJuzOffline ? t("hub.offline.downloading") : t("juzViewer.prepareOffline")}
          </button>
        </div>

        <ReadingToolbar
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(z + 20, 200))}
          onZoomOut={() => setZoom((z) => Math.max(z - 20, 40))}
          onResetZoom={() => setZoom(100)}
          onSaveBookmark={handleSaveBookmark}
          onTogglePageNav={() => setShowPageNav((v) => !v)}
          onToggleJuzIndex={() => setShowJuzIndex((v) => !v)}
          onToggleSourceSelector={() => setShowSourceSelector((v) => !v)}
          currentPage={currentPage}
          bookmarked={savedBookmark?.juz === num && savedBookmark?.page === currentPage}
          juzNumber={num}
          hifzMode={hifzMode}
          onDownloadAudio={handleDownloadAudio}
          isDownloadingAudio={isDownloadingAudio}
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
        />
      </div>

      {showPageNav && (
        <PageNavigator
          pages={pages}
          currentPage={currentPage}
          onGoToPage={(page) => {
            setCurrentPage(page);
            if (scrollDirection === "vertical") {
              scrollToPage(page);
            }
            setShowPageNav(false);
          }}
          onClose={() => setShowPageNav(false)}
        />
      )}

      <Suspense fallback={null}>
        {showSourceSelector && (
          <SourceSelector onClose={() => setShowSourceSelector(false)} />
        )}
      </Suspense>

      {/* --- التعديل هنا: استخدام Suspense حول KhatmaCelebration --- */}
      <Suspense fallback={null}>
        <KhatmaCelebration 
          isVisible={showKhatmaCelebration} 
          onClose={() => setShowKhatmaCelebration(false)} 
        />
      </Suspense>
      {/* -------------------------------------------------------- */}

      {!isFullscreen && (
        <div className="flex justify-between items-center container max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
          <div className="flex-1">
            {num > 1 && (
              <Link
                to={`/juz/${num - 1}`}
                className="group flex items-center gap-2 md:gap-3 text-xs md:text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-all"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  <ChevronRight size={14} strokeWidth={1.5} className="md:w-4 md:h-4" />
                </div>
                <span className="group-hover:text-accent italic hidden xs:inline">{t("juzViewer.prevJuz")}</span>
              </Link>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-0.5 md:gap-1">
            <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-accent uppercase">إحصائيات القراءة</span>
            <span className="text-xs md:text-sm text-primary font-serif italic">
              {i18n.language === 'ar' ? toArabicNumber(pages.length.toString()) : pages.length} {t("hub.offline.pages")}
            </span>
          </div>

          <div className="flex-1 flex justify-end">
            {num < 30 && (
              <Link
                to={`/juz/${num + 1}`}
                className="group flex items-center gap-2 md:gap-3 text-xs md:text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-all"
              >
                <span className="group-hover:text-accent italic hidden xs:inline">{t("juzViewer.nextJuz")}</span>
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  <ChevronLeft size={14} strokeWidth={1.5} className="md:w-4 md:h-4" />
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      <main
        className={`mx-auto px-4 flex flex-col items-center transition-all duration-500 ${isFullscreen ? "pb-12 pt-4" : "pb-40 pt-4"}`}
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

        <div className="flex flex-col items-center gap-6 md:gap-8 sm:gap-12 w-full" style={{ maxWidth: `${isFullscreen ? 9999 : maxWidth}px` }}>
          {readingMode === "image" ? (
            scrollDirection === "vertical" ? (
              pages.map((page) => (
                <div
                  key={page}
                  ref={(el) => { 
                    if (el) pageRefs.current[page] = el;
                  }}
                  id={`page-${page}`}
                  className={`relative rounded-[1.5rem] md:rounded-[2rem] border border-border/40 bg-card shadow-islamic w-full group min-h-[600px] md:min-h-[900px] ${currentPage === page ? "ring-2 ring-accent/20" : ""}`}
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

                  <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 flex flex-col items-center gap-0.5 md:gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-primary/20 backdrop-blur-md text-primary flex items-center justify-center font-serif text-xs md:text-sm shadow-sm border border-primary/10">
                      {page}
                    </div>
                    <span className="text-[6px] md:text-[8px] font-bold text-primary/70 uppercase tracking-widest">Page</span>
                    <span className={cn("text-[8px] px-2 py-0.5 rounded-full border uppercase tracking-wide", getPageBadgeLabel(page).className)}>
                      {getPageBadgeLabel(page).text}
                    </span>
                  </div>

                  {errorStates[page] && (
                    <div className="w-full aspect-[3/4] bg-muted/30 flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                        <ArrowUp className="rotate-180" size={24} />
                      </div>
                      <span className="text-muted-foreground font-serif italic text-lg">
                        تعذر تحميل الصفحة {page}
                      </span>
                    </div>
                  )}

                  {!errorStates[page] && (
                    <div className="relative overflow-hidden">
                      <div className={`transition-all duration-700 ${isPageHidden(page) ? "blur-3xl opacity-5 grayscale scale-95" : "blur-0 opacity-100 scale-100"}`}>
                        <LazyImage
                          key={getImageUrl(page)}
                          src={getImageUrl(page)}
                          alt={`صفحة ${page} من المصحف الشريف`}
                          className="quran-page-img w-full h-auto group-hover:scale-[1.01]"
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
              <div className="w-full flex flex-col items-center">
                <div key={currentPage}>                <div className="relative rounded-[2.5rem] md:rounded-[3rem] border border-border/40 bg-card shadow-2xl w-full overflow-hidden">
                  <div className="relative">
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

                    <div className={`${isPageHidden(currentPage) ? "blur-3xl opacity-5 grayscale scale-95" : "blur-0 opacity-100 scale-100"}`}>
                      <LazyImage
                        key={getImageUrl(currentPage)}
                        src={getImageUrl(currentPage)}
                        alt={`صفحة ${currentPage} من المصحف الشريف`}
                        className="quran-page-img w-full h-auto"
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
                  <div className="absolute top-6 left-6 z-10 flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 backdrop-blur-md text-primary flex items-center justify-center font-serif text-sm shadow-sm border border-primary/10">
                      {currentPage}
                    </div>
                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wide", getPageBadgeLabel(currentPage).className)}>
                      {getPageBadgeLabel(currentPage).text}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-8 mt-8">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === juz.startPage}
                    className="p-4 rounded-2xl bg-card border border-border/40 text-primary disabled:opacity-30 transition-all hover:bg-muted/50"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <span className="font-serif text-lg text-primary">
                    {t("juzViewer.pageOf", { current: isAr ? toArabicNumber(currentPage.toString()) : currentPage, total: isAr ? toArabicNumber(juz.endPage.toString()) : juz.endPage })}
                  </span>
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage === juz.endPage}
                    className="p-4 rounded-2xl bg-card border border-border/40 text-primary disabled:opacity-30 transition-all hover:bg-muted/50"
                  >
                    <ChevronLeft size={24} />
                  </button>
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
      </main>

      {!isFullscreen && (
        <div className="text-center pb-12">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex flex-col items-center gap-3 text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 group-hover:shadow-soft transition-all">
              <ArrowUp size={18} strokeWidth={1.5} />
            </div>
            <span className="italic group-hover:text-accent">{t("common.backToTop")}</span>
          </button>
        </div>
      )}

      {isFullscreen && showControls && (
        <div 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-4"
        >
          {currentPage > 0 && (
            <div className="h-12 md:h-14 px-6 rounded-full bg-primary/90 border border-primary/10 flex items-center gap-3 shadow-2xl">
              <span className="text-[8px] md:text-[10px] font-bold text-gold uppercase tracking-widest">الصفحة</span>
              <span className="font-serif text-lg md:text-xl font-medium text-white">{toArabicNumber(currentPage.toString())}</span>
            </div>
          )}
        </div>
      )}

      {showJuzIndex && <JuzIndex onClose={() => setShowJuzIndex(false)} currentJuz={num} />}

      <div className={cn(
        "fixed left-0 right-0 z-[130] px-4 pointer-events-none flex justify-center transition-all duration-700 ease-[0.16, 1, 0.3, 1]",
        isFullscreen ? "bottom-8" : "bottom-[104px]",
        (isFullscreen && !showControls) || isScrollingDown 
          ? "opacity-0 translate-y-20 scale-90" 
          : "opacity-100 translate-y-0 scale-100"
      )}>
        <div className="pointer-events-auto">
          <QuranPlayerBar onPlayFirst={handleMainPlayToggle} isScrollingDown={isScrollingDown} isFullscreen={isFullscreen} />
        </div>
      </div>
    </div>
  );
};

export default JuzViewer;
