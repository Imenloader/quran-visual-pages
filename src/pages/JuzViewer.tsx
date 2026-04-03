import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { juzData, getQuranPageImageUrl, getQuranPageFallbackImageUrl, toArabicNumber, surahIndex } from "@/data/quranData";
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
import KhatmaCelebration from "@/components/KhatmaCelebration";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";

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
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify({ juz, page, readingMode, verseKey }));
};

const JuzViewer = () => {
  const navigate = useNavigate();
  const { juzNumber } = useParams();
  const num = parseInt(juzNumber || "0");
  const juz = juzData.find((j) => j.number === num);
  const { theme, readingMode, scrollDirection, tajweedMode, hifzMode, setHifzMode } = useTheme();
  const { addAyahRead, addPageRead, addJuzCompleted } = useUser();

  const pages = useMemo(() => {
    if (!juz) return [];
    return Array.from(
      { length: juz.endPage - juz.startPage + 1 },
      (_, i) => juz.startPage + i
    );
  }, [juz]);

  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});
  const [fallbackLevel, setFallbackLevel] = useState<Record<number, number>>({});
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

  useEffect(() => {
    localStorage.setItem("quran-hidden-pages", JSON.stringify(hiddenPages));
  }, [hiddenPages]);

  useEffect(() => {
    localStorage.setItem("quran-hidden-lines", JSON.stringify(hiddenLines));
  }, [hiddenLines]);

  const isPageHidden = (page: number) => hifzMode && !!hiddenPages[page];

  const togglePageHidden = (page: number) => {
    setHiddenPages(prev => ({
      ...prev,
      [page]: !prev[page]
    }));
  };

  const isLineHidden = (page: number, lineIndex: number) => {
    return hifzMode && (hiddenLines[page]?.includes(lineIndex) ?? false);
  };

  const toggleLineHidden = (page: number, lineIndex: number) => {
    setHiddenLines(prev => {
      const lines = prev[page] || [];
      const newLines = lines.includes(lineIndex)
        ? lines.filter(l => l !== lineIndex)
        : [...lines, lineIndex];
      return { ...prev, [page]: newLines };
    });
  };

  const hideAllLines = (page: number) => {
    setHiddenLines(prev => ({
      ...prev,
      [page]: Array.from({ length: 15 }, (_, i) => i)
    }));
    toast.info(`تم إخفاء أسطر الصفحة ${toArabicNumber(page)}`);
  };

  const showAllLines = (page: number) => {
    setHiddenLines(prev => ({
      ...prev,
      [page]: []
    }));
    toast.info(`تم إظهار أسطر الصفحة ${toArabicNumber(page)}`);
  };

  const handleNextPage = useCallback(() => {
    if (currentPage < juz!.endPage) {
      const next = currentPage + 1;
      setCurrentPage(next);
      if (scrollDirection === "vertical") {
        scrollToPage(next);
      }
    }
  }, [currentPage, juz, scrollDirection]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > juz!.startPage) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      if (scrollDirection === "vertical") {
        scrollToPage(prev);
      }
    }
  }, [currentPage, juz, scrollDirection]);

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeNavigation({ 
    onSwipeLeft: scrollDirection === "horizontal" ? handleNextPage : undefined, 
    onSwipeRight: scrollDirection === "horizontal" ? handlePrevPage : undefined 
  });

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // In RTL: Left arrow for next page, Right arrow for previous page
      if (e.key === "ArrowLeft") {
        handleNextPage();
      } else if (e.key === "ArrowRight") {
        handlePrevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  const [showPageNav, setShowPageNav] = useState(false);
  const [showJuzIndex, setShowJuzIndex] = useState(false);
  const [showKhatmaCelebration, setShowKhatmaCelebration] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState<BookmarkData | null>(null);
  const [currentVerseKey, setCurrentVerseKey] = useState<string | undefined>(() => getBookmark()?.verseKey);

  // Initialize currentPage to the first page of the Juz or bookmarked page
  useEffect(() => {
    if (pages.length > 0 && currentPage === 0) {
      const bookmark = getBookmark();
      if (bookmark && bookmark.juz === num && pages.includes(bookmark.page)) {
        setCurrentPage(bookmark.page);
        if (bookmark.verseKey) setCurrentVerseKey(bookmark.verseKey);
        // Initial scroll for vertical mode
        if (scrollDirection === "vertical") {
          setTimeout(() => scrollToPage(bookmark.page), 100);
        }
      } else {
        setCurrentPage(pages[0]);
      }
    }
  }, [pages, num, scrollDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevScrollDirectionRef = useRef(scrollDirection);
  const prevReadingModeRef = useRef(readingMode);

  // Sync scroll position when switching to vertical mode OR back to image mode
  useEffect(() => {
    const switchingToVertical = scrollDirection === "vertical" && prevScrollDirectionRef.current === "horizontal";
    const switchingToImage = readingMode === "image" && prevReadingModeRef.current === "text";

    if ((switchingToVertical || switchingToImage) && scrollDirection === "vertical" && currentPage !== 0) {
      // Small delay to ensure DOM is ready after mode switch
      setTimeout(() => scrollToPage(currentPage), 100);
    }
    
    prevScrollDirectionRef.current = scrollDirection;
    prevReadingModeRef.current = readingMode;
  }, [scrollDirection, readingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save bookmark whenever page changes (debounced)
  useEffect(() => {
    if (currentPage !== 0 && juz) {
      const timer = setTimeout(() => {
        saveBookmark(num, currentPage, readingMode, currentVerseKey);
        setSavedBookmark({ juz: num, page: currentPage, readingMode, verseKey: currentVerseKey });

        // Update reading history for stats
        const history = JSON.parse(localStorage.getItem("quran-reading-history") || "{}");
        const juzHistory = history[num] || { pagesRead: 0, lastPage: 0, visitedPages: [] };
        
        if (!juzHistory.visitedPages.includes(currentPage)) {
          juzHistory.visitedPages.push(currentPage);
          juzHistory.pagesRead = juzHistory.visitedPages.length;
          
          // Add points/stats for reading a new page
          addPageRead();

          // Check if Juz is completed
          if (juzHistory.pagesRead === pages.length && !juzHistory.completed) {
            juzHistory.completed = true;
            addJuzCompleted();
            
            // Special celebration for Juz 30 (Khatma)
            if (num === 30) {
              setShowKhatmaCelebration(true);
            } else {
              toast.success(t("profile.juzCompletedMsg"), {
                description: t("profile.juzCompletedDesc", { num: toArabicNumber(num) }),
                icon: <Trophy className="text-gold" />
              });
            }
          }
        }
        
        juzHistory.lastPage = currentPage;
        history[num] = juzHistory;
        localStorage.setItem("quran-reading-history", JSON.stringify(history));
      }, 1500); // Wait 1.5s before saving to avoid lag during fast scrolling
      
      return () => clearTimeout(timer);
    }
  }, [currentPage, num, readingMode, juz, currentVerseKey, addAyahRead, addPageRead, addJuzCompleted, pages.length]);

  // Aggressive caching for current Juz and neighboring pages
  useEffect(() => {
    if (!juz || pages.length === 0) return;
    
    const cacheImages = async () => {
      // Cache current page and 5 pages ahead/behind
      const start = Math.max(0, pages.indexOf(currentPage) - 5);
      const end = Math.min(pages.length - 1, pages.indexOf(currentPage) + 10);
      
      const pagesToCache = pages.slice(start, end);
      
      for (const p of pagesToCache) {
        const url = getImageUrl(p);
        const img = new Image();
        img.src = url;
      }
    };
    
    cacheImages();
  }, [juz, pages, currentPage, tajweedMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const { isFullscreen, setIsFullscreen } = useTheme();
  const { playAyah, togglePlay, currentSurah } = useAudioPlayer();
  const [showControls, setShowControls] = useState(true);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;
      
      if (isFullscreen) {
        resetControlsTimer();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFullscreen]);

  useEffect(() => {
    setSavedBookmark(getBookmark());
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#page-")) {
        const pageNum = parseInt(hash.replace("#page-", ""));
        if (pageNum) {
          setTimeout(() => {
            const el = document.getElementById(`page-${pageNum}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
              setCurrentPage(pageNum);
            }
          }, 500);
        }
      } else if (hash.startsWith("#verse-")) {
        const key = hash.replace("#verse-", "");
        if (key) {
          setCurrentVerseKey(key);
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [num]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // IntersectionObserver for vertical scrolling
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (!juz || pages.length === 0 || scrollDirection === "horizontal") return;

    const options = {
      root: null,
      rootMargin: "-45% 0px -45% 0px", // Focus on a narrow strip in the middle of the screen
      threshold: [0, 0.5, 1.0],
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the entry that is most visible in our target area
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
    
    // Observe all pages
    pages.forEach(page => {
      const el = document.getElementById(`page-${page}`);
      if (el) observer.observe(el);
    });

    // Also observe the first page immediately to ensure it's set
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

  if (!juz) return <Navigate to="/" replace />;

  const progress = currentPage
    ? ((currentPage - juz.startPage) / (juz.endPage - juz.startPage)) * 100
    : 0;

  const handleImageLoad = (page: number) => {
    setLoadingStates((prev) => ({ ...prev, [page]: false }));
  };

  const handleImageError = (page: number) => {
    const currentLevel = fallbackLevel[page] || 0;
    if (currentLevel < 2) {
      console.log(`Image load failed for page ${page} at level ${currentLevel}, trying next fallback...`);
      setFallbackLevel((prev) => ({ ...prev, [page]: currentLevel + 1 }));
    } else {
      setLoadingStates((prev) => ({ ...prev, [page]: false }));
      setErrorStates((prev) => ({ ...prev, [page]: true }));
    }
  };

  const getImageUrl = (page: number) => {
    const level = fallbackLevel[page] || 0;
    
    // If tajweed mode is on, try to get tajweed images first
    if (tajweedMode && level === 0) {
      return `https://quran.com/images/quran/tajweed/${page}.png`;
    }
    
    // Use the new fallback level logic from quranData
    return getQuranPageFallbackImageUrl(page, level);
  };

  const scrollToPage = (page: number) => {
    const el = pageRefs.current[page];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSaveBookmark = () => {
    if (currentPage) {
      saveBookmark(num, currentPage, readingMode, currentVerseKey);
      setSavedBookmark({ juz: num, page: currentPage, readingMode, verseKey: currentVerseKey });
    }
  };

  const maxWidth = Math.round(672 * (zoom / 100));

  const toggleFullscreen = () => {
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
  };

  const resetControlsTimer = () => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    setShowControls(true);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handleScreenTap = () => {
    if (!isFullscreen) return;
    setShowControls(prev => !prev);
    if (!showControls) resetControlsTimer();
  };

  const handleMainPlayToggle = () => {
    if (!juz) return;
    
    // Check if the currently playing surah is part of this Juz
    const isCurrentJuzPlaying = currentSurah && juz.surahs.includes(currentSurah.name);
    
    if (!isCurrentJuzPlaying) {
      // Parse startSurah to get initial Ayah number
      const startSurahParts = juz.startSurah.split(" ");
      const startSurahName = startSurahParts[0];
      const startAyahNumber = startSurahParts.length > 1 ? parseInt(startSurahParts[1]) : 1;
      
      const surahInfo = surahIndex.find(s => s.name === startSurahName);
      if (surahInfo) {
        playAyah(surahInfo.number, startAyahNumber);
      }
    } else {
      togglePlay();
    }
  };

  const handleVerseInView = (key: string) => {
    setCurrentVerseKey(key);
    if (readingMode === "text") {
      const [sNum] = key.split(":");
      const surah = surahIndex.find(s => s.number.toString() === sNum);
      if (surah && surah.startPage !== currentPage) {
        // Update currentPage so bookmark and home page are consistent
        setCurrentPage(surah.startPage);
      }
    }
  };

  return (
    <div
      className={`min-h-screen bg-background selection:bg-accent/20 ${isFullscreen ? "fullscreen-reading" : ""}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Immersive Background Elements */}
      <div className="fixed inset-0 pattern-islamic opacity-[0.01] pointer-events-none" />
      
      {/* Floating Action Buttons */}
      <div className={`fixed right-4 md:right-8 z-[120] flex flex-col gap-3 md:gap-4 transition-all duration-500 ${isFullscreen ? (showControls ? "bottom-6 md:bottom-8 opacity-100" : "bottom-6 md:bottom-8 opacity-0 pointer-events-none") : "bottom-24 md:bottom-32 opacity-100"}`}>
        <AnimatePresence>
          {scrollDirection === "vertical" && progress > 10 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={(e) => {
                e.stopPropagation();
                scrollToPage(pages[0]);
              }}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
              title="العودة للأعلى"
            >
              <ChevronUp className="size-[20px] md:size-[28px]" />
            </motion.button>
          )}
        </AnimatePresence>
        
        {isFullscreen && showControls && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 bg-primary text-gold border border-primary/10"
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
            className="w-10 h-10 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 bg-muted/90 backdrop-blur-md text-primary border border-border/40"
            title="وضع ملء الشاشة"
          >
            <Maximize className="size-[18px] md:size-[24px]" />
          </button>
        )}
      </div>

      {/* Header & toolbar - hidden in fullscreen unless controls shown */}
      <div className={`transition-all duration-700 ease-[0.16, 1, 0.3, 1] ${isFullscreen && !showControls ? "opacity-0 pointer-events-none -translate-y-full fixed top-0 left-0 right-0 z-[150]" : isFullscreen ? "fixed top-0 left-0 right-0 z-[150] opacity-100 pointer-events-auto" : "relative z-20"}`}>
        {!isFullscreen && <QuranHeader title={juz.nameAr} showBack />}
        {isFullscreen && (
          <div className="bg-emerald-deep/95 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
              <ChevronRight size={20} />
            </button>
            <h2 className="text-white font-serif text-xl">{juz.nameAr}</h2>
            <div className="w-10" /> {/* Spacer */}
          </div>
        )}
        <ProgressBar progress={progress} currentPage={currentPage} totalPages={pages.length} startPage={juz.startPage} />

        <ReadingToolbar
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(z + 20, 200))}
          onZoomOut={() => setZoom((z) => Math.max(z - 20, 40))}
          onResetZoom={() => setZoom(100)}
          onSaveBookmark={handleSaveBookmark}
          onTogglePageNav={() => setShowPageNav((v) => !v)}
          onToggleJuzIndex={() => setShowJuzIndex((v) => !v)}
          currentPage={currentPage}
          bookmarked={savedBookmark?.juz === num && savedBookmark?.page === currentPage}
          juzNumber={num}
          hifzMode={hifzMode}
          onToggleHifzMode={() => {
            const nextMode = !hifzMode;
            setHifzMode(nextMode);
            if (nextMode) {
              // Hide all lines of the current page by default when entering hifzMode
              hideAllLines(currentPage);
              toast.success("تم تفعيل وضع التحفيظ والمراجعة", {
                description: "انقر على الأسطر لإخفائها أو إظهارها"
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

      <KhatmaCelebration 
        isVisible={showKhatmaCelebration} 
        onClose={() => setShowKhatmaCelebration(false)} 
      />

      {/* Navigation between Juz - Editorial Style */}
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
                <span className="group-hover:text-accent italic hidden xs:inline">الجزء السابق</span>
              </Link>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-0.5 md:gap-1">
            <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-accent uppercase">إحصائيات القراءة</span>
            <span className="text-xs md:text-sm text-primary font-serif italic">
              {toArabicNumber(pages.length)} صفحة مباركة
            </span>
          </div>

          <div className="flex-1 flex justify-end">
            {num < 30 && (
              <Link
                to={`/juz/${num + 1}`}
                className="group flex items-center gap-2 md:gap-3 text-xs md:text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-all"
              >
                <span className="group-hover:text-accent italic hidden xs:inline">الجزء التالي</span>
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  <ChevronLeft size={14} strokeWidth={1.5} className="md:w-4 md:h-4" />
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pages Container */}
      <main
        className={`mx-auto px-4 flex flex-col items-center transition-all duration-500 ${isFullscreen ? "pb-12 pt-4" : "pb-40 pt-4"}`}
        onClick={handleScreenTap}
      >
        {tajweedMode && !hifzMode && (
          <div className={`w-full max-w-5xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isFullscreen ? "mt-4" : ""}`}>
            <TajweedLegend />
          </div>
        )}
        {hifzMode && readingMode === "image" && (
          <div className="mb-4 text-center">
            <span className="text-xs font-serif text-muted-foreground bg-background/50 px-3 py-1 rounded-full border border-border/20">
              استخدم الأزرار الموجودة على كل صفحة للتحكم في وضع الحفظ
            </span>
          </div>
        )}

        <div className="flex flex-col items-center gap-6 md:gap-8 sm:gap-12 w-full" style={{ maxWidth: `${isFullscreen ? 9999 : maxWidth}px` }}>
          {readingMode === "image" ? (
            scrollDirection === "vertical" ? (
              pages.map((page) => (
                <motion.div
                  key={page}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "200px" }}
                  transition={{ duration: 0.5 }}
                  ref={(el) => { 
                    if (el) pageRefs.current[page] = el;
                  }}
                  id={`page-${page}`}
                  className={`relative rounded-[1.5rem] md:rounded-[2rem] border border-border/40 bg-card shadow-islamic transition-all duration-500 w-full group min-h-[600px] md:min-h-[900px] ${currentPage === page ? "ring-2 ring-accent/20" : ""}`}
                >
                  {/* Hifz Mode Per-Page Controls */}
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

                  {/* Page Number Badge */}
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 flex flex-col items-center gap-0.5 md:gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-primary/20 backdrop-blur-md text-primary flex items-center justify-center font-serif text-xs md:text-sm shadow-sm border border-primary/10">
                      {page}
                    </div>
                    <span className="text-[6px] md:text-[8px] font-bold text-primary/70 uppercase tracking-widest">Page</span>
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

                      {/* Line-by-line overlays in Hifz mode */}
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
                      {/* Subtle overlay for better reading comfort */}
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
                </motion.div>
              ))
            ) : (
              <div className="w-full flex flex-col items-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 30, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -30, scale: 1.02 }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="relative rounded-[2.5rem] md:rounded-[3rem] border border-border/40 bg-card shadow-2xl w-full"
                  >
                    <div className="relative">
                      {/* Hifz Mode Per-Page Controls */}
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
                              <GraduationCap size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                hideAllLines(currentPage);
                              }}
                              title="إخفاء الأسطر"
                              className="p-2 rounded-xl hover:bg-accent/10 text-primary transition-all"
                            >
                              <Minimize size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showAllLines(currentPage);
                              }}
                              title="إظهار الأسطر"
                              className="p-2 rounded-xl hover:bg-accent/10 text-primary transition-all"
                            >
                              <Maximize size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className={`transition-all duration-1000 ease-out ${isPageHidden(currentPage) ? "blur-3xl opacity-5 grayscale scale-95" : "blur-0 opacity-100 scale-100"}`}>
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

                      {/* Line-by-line overlays in Hifz mode */}
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
                            <RefreshCw className="w-10 h-10 text-accent animate-spin-slow" />
                            <p className="text-primary font-serif italic text-sm">انقر للمراجعة</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-6 left-6 z-10 flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-2xl bg-primary/20 backdrop-blur-md text-primary flex items-center justify-center font-serif text-sm shadow-sm border border-primary/10">
                        {currentPage}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                <div className="flex items-center gap-8 mt-8">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === juz.startPage}
                    className="p-4 rounded-2xl bg-card border border-border/40 text-primary disabled:opacity-30 transition-all hover:bg-muted/50"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <span className="font-serif text-lg text-primary">
                    صفحة {toArabicNumber(currentPage)} من {toArabicNumber(juz.endPage)}
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
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-card rounded-[2.5rem] border border-border/40 shadow-islamic overflow-hidden"
            >
              <QuranTextViewer 
                juzNumber={num} 
                hifzMode={hifzMode} 
                initialVerseKey={currentVerseKey}
                onVerseInView={handleVerseInView}
              />
            </motion.div>
          )}
        </div>
      </main>

      {/* Back to top - Refined */}
      {!isFullscreen && (
        <div className="text-center pb-12">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex flex-col items-center gap-3 text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 group-hover:shadow-soft transition-all">
              <ArrowUp size={18} strokeWidth={1.5} />
            </div>
            <span className="italic group-hover:text-accent">العودة للبداية</span>
          </button>
        </div>
      )}

      {/* Fullscreen Controls - Floating Exquisite Elements */}
      <AnimatePresence>
        {isFullscreen && showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-4"
          >
            {currentPage > 0 && (
              <div className="h-12 md:h-14 px-6 rounded-full bg-primary/90 backdrop-blur-xl border border-primary/10 flex items-center gap-3 shadow-2xl">
                <span className="text-[8px] md:text-[10px] font-bold text-gold uppercase tracking-widest">الصفحة</span>
                <span className="font-serif text-lg md:text-xl font-medium text-white">{toArabicNumber(currentPage)}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Player Bar */}
      <div className={cn(
        "fixed left-1/2 -translate-x-1/2 z-[130] transition-all duration-700 ease-[0.16, 1, 0.3, 1]",
        isFullscreen ? "bottom-8" : "bottom-28 md:bottom-32",
        (isFullscreen && !showControls) || isScrollingDown 
          ? "opacity-0 pointer-events-none translate-y-20 scale-90" 
          : "opacity-100 translate-y-0 scale-100"
      )}>
        <QuranPlayerBar onPlayFirst={handleMainPlayToggle} isScrollingDown={isScrollingDown} isFullscreen={isFullscreen} />
      </div>

      {/* Juz Index Modal */}
      {showJuzIndex && <JuzIndex onClose={() => setShowJuzIndex(false)} currentJuz={num} />}
    </div>
  );
};

export default JuzViewer;
