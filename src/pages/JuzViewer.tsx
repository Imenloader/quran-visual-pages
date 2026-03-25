import { useParams, Navigate, Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { juzData, getQuranPageImageUrl, toArabicNumber } from "@/data/quranData";
import QuranHeader from "@/components/QuranHeader";
import ReadingToolbar from "@/components/ReadingToolbar";
import ProgressBar from "@/components/ProgressBar";
import PageNavigator from "@/components/PageNavigator";
import JuzIndex from "@/components/JuzIndex";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { ChevronRight, ChevronLeft, ArrowUp, Maximize, Minimize } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import QuranTextViewer from "@/components/QuranTextViewer";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const BOOKMARK_KEY = "quran-bookmark";

interface BookmarkData {
  juz: number;
  page: number;
  readingMode: "image" | "text";
}

const getBookmark = (): BookmarkData | null => {
  try {
    const data = localStorage.getItem(BOOKMARK_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const saveBookmark = (juz: number, page: number, readingMode: "image" | "text") => {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify({ juz, page, readingMode }));
};

const JuzViewer = () => {
  const { juzNumber } = useParams();
  const num = parseInt(juzNumber || "0");
  const juz = juzData.find((j) => j.number === num);
  const { theme, readingMode } = useTheme();

  const pages = useMemo(() => {
    if (!juz) return [];
    return Array.from(
      { length: juz.endPage - juz.startPage + 1 },
      (_, i) => juz.startPage + i
    );
  }, [juz]);

  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(0);

  // Initialize currentPage to the first page of the Juz or bookmarked page
  useEffect(() => {
    if (pages.length > 0 && currentPage === 0) {
      const bookmark = getBookmark();
      if (bookmark && bookmark.juz === num && pages.includes(bookmark.page)) {
        setCurrentPage(bookmark.page);
      } else {
        setCurrentPage(pages[0]);
      }
    }
  }, [pages, num, currentPage]);

  const [showPageNav, setShowPageNav] = useState(false);
  const [showJuzIndex, setShowJuzIndex] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState<BookmarkData | null>(null);

  // Aggressive caching for current Juz
  useEffect(() => {
    if (!juz) return;
    const cacheImages = async () => {
      const pageUrls = pages.map(p => getQuranPageImageUrl(p));
      for (const url of pageUrls) {
        const img = new Image();
        img.src = url;
      }
    };
    cacheImages();
  }, [juz, pages]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeNavigation({ juzNumber: num });

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
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [num]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!juz || pages.length === 0) return;

    const options = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.id.replace("page-", ""));
          if (pageNum) {
            setCurrentPage(pageNum);
            saveBookmark(num, pageNum, readingMode);
            setSavedBookmark({ juz: num, page: pageNum, readingMode });
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);
    
    // Initial observation
    Object.values(pageRefs.current).forEach((el) => {
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [juz, num, pages, readingMode]);

  if (!juz) return <Navigate to="/" replace />;

  const progress = currentPage
    ? ((currentPage - juz.startPage) / (juz.endPage - juz.startPage)) * 100
    : 0;

  const handleImageLoad = (page: number) => {
    setLoadingStates((prev) => ({ ...prev, [page]: false }));
  };

  const handleImageError = (page: number) => {
    setLoadingStates((prev) => ({ ...prev, [page]: false }));
    setErrorStates((prev) => ({ ...prev, [page]: true }));
  };

  const scrollToPage = (page: number) => {
    const el = pageRefs.current[page];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSaveBookmark = () => {
    if (currentPage) {
      saveBookmark(num, currentPage, readingMode);
      setSavedBookmark({ juz: num, page: currentPage, readingMode });
    }
  };

  const maxWidth = Math.round(672 * (zoom / 100));

  const toggleFullscreen = () => {
    setIsFullscreen(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("fullscreen-reading");
        toast("وضع ملء الشاشة", {
          description: "انقر على الشاشة لإظهار/إخفاء الأزرار",
          duration: 3000,
          position: "top-center",
        });
        resetControlsTimer();
      } else {
        document.documentElement.classList.remove("fullscreen-reading");
      }
      return next;
    });
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

  return (
    <div
      className={`min-h-screen bg-background selection:bg-accent/20 ${isFullscreen ? "fullscreen-reading" : ""}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Immersive Background Elements */}
      <div className="fixed inset-0 pattern-islamic opacity-[0.01] pointer-events-none" />
      
      {/* Header & toolbar - hidden in fullscreen unless controls shown */}
      <div className={`transition-all duration-700 ease-[0.16, 1, 0.3, 1] ${isFullscreen && !showControls ? "opacity-0 pointer-events-none -translate-y-full fixed top-0 left-0 right-0 z-50" : isFullscreen ? "fixed top-0 left-0 right-0 z-50 opacity-100" : "relative z-20"}`}>
        <QuranHeader title={juz.nameAr} showBack />
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
        />
      </div>

      {showPageNav && (
        <PageNavigator
          pages={pages}
          currentPage={currentPage}
          onGoToPage={(page) => {
            scrollToPage(page);
            setShowPageNav(false);
          }}
          onClose={() => setShowPageNav(false)}
        />
      )}

      {/* Navigation between Juz - Editorial Style */}
      {!isFullscreen && (
        <div className="flex justify-between items-center container max-w-5xl mx-auto px-6 py-8 relative z-10">
          <div className="flex-1">
            {num > 1 && (
              <Link
                to={`/juz/${num - 1}`}
                className="group flex items-center gap-3 text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  <ChevronRight size={16} strokeWidth={1.5} />
                </div>
                <span className="group-hover:text-accent italic">الجزء السابق</span>
              </Link>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">إحصائيات القراءة</span>
            <span className="text-sm text-primary font-serif italic">
              {toArabicNumber(pages.length)} صفحة مباركة
            </span>
          </div>

          <div className="flex-1 flex justify-end">
            {num < 30 && (
              <Link
                to={`/juz/${num + 1}`}
                className="group flex items-center gap-3 text-sm font-serif font-medium text-muted-foreground hover:text-primary transition-all"
              >
                <span className="group-hover:text-accent italic">الجزء التالي</span>
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  <ChevronLeft size={16} strokeWidth={1.5} />
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
        <div className="flex flex-col items-center gap-8 sm:gap-12 w-full" style={{ maxWidth: `${isFullscreen ? 9999 : maxWidth}px` }}>
          {readingMode === "image" ? (
            pages.map((page) => (
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                ref={(el) => { pageRefs.current[page] = el; }}
                id={`page-${page}`}
                className={`relative rounded-[2rem] overflow-hidden border border-border/40 bg-card shadow-islamic transition-all duration-500 w-full group ${currentPage === page ? "ring-2 ring-accent/20" : ""}`}
              >
                {/* Page Number Badge */}
                <div className="absolute top-6 left-6 z-10 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-deep/90 backdrop-blur-md text-white flex items-center justify-center font-serif text-sm shadow-lg border border-white/10">
                    {page}
                  </div>
                  <span className="text-[8px] font-bold text-primary/70 uppercase tracking-widest">Page</span>
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
                    <LazyImage
                      src={getQuranPageImageUrl(page)}
                      alt={`صفحة ${page} من المصحف الشريف`}
                      className="quran-page-img w-full h-auto transition-transform duration-700 group-hover:scale-[1.01]"
                      onLoad={() => handleImageLoad(page)}
                      onError={() => handleImageError(page)}
                    />
                    {/* Subtle overlay for better reading comfort */}
                    <div className="absolute inset-0 bg-primary/5 mix-blend-multiply pointer-events-none opacity-20" />
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-card rounded-[2.5rem] border border-border/40 shadow-islamic overflow-hidden"
            >
              <QuranTextViewer juzNumber={num} />
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
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: showControls ? 1 : 0.2, scale: 1 }}
            className="fixed bottom-8 left-8 z-[60] flex items-center gap-4"
          >
            <button
              onClick={toggleFullscreen}
              className="w-14 h-14 rounded-[1.5rem] bg-emerald-deep text-gold flex items-center justify-center shadow-2xl border border-white/10 hover:scale-110 active:scale-95 transition-all"
              title="الخروج من ملء الشاشة"
            >
              <Minimize size={24} strokeWidth={1.5} />
            </button>
            
            {currentPage > 0 && (
              <div className="h-14 px-6 rounded-[1.5rem] bg-card/40 backdrop-blur-xl border border-border/40 flex items-center gap-3 shadow-xl">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Page</span>
                <span className="font-serif text-xl font-medium text-primary">{currentPage}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Juz Index Modal */}
      {showJuzIndex && <JuzIndex onClose={() => setShowJuzIndex(false)} currentJuz={num} />}
    </div>
  );
};

export default JuzViewer;
