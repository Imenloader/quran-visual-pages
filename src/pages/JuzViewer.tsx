import { useParams, Navigate, Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { juzData, getQuranPageImageUrl, toArabicNumber } from "@/data/quranData";
import QuranHeader from "@/components/QuranHeader";
import ReadingToolbar from "@/components/ReadingToolbar";
import ProgressBar from "@/components/ProgressBar";
import PageNavigator from "@/components/PageNavigator";
import JuzIndex from "@/components/JuzIndex";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { ChevronRight, ChevronLeft, ArrowUp, Maximize, Minimize } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import { toast } from "sonner";

const BOOKMARK_KEY = "quran-bookmark";

interface BookmarkData {
  juz: number;
  page: number;
}

const getBookmark = (): BookmarkData | null => {
  try {
    const data = localStorage.getItem(BOOKMARK_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const saveBookmark = (juz: number, page: number) => {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify({ juz, page }));
};

const JuzViewer = () => {
  const { juzNumber } = useParams();
  const num = parseInt(juzNumber || "0");
  const juz = juzData.find((j) => j.number === num);

  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPageNav, setShowPageNav] = useState(false);
  const [showJuzIndex, setShowJuzIndex] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState<BookmarkData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeNavigation({ juzNumber: num });

  // Clean up fullscreen on unmount
  useEffect(() => {
    return () => { document.documentElement.classList.remove("fullscreen-reading"); };
  }, []);

  useEffect(() => {
    setSavedBookmark(getBookmark());
    const hash = window.location.hash;
    if (hash.startsWith("#page-")) {
      const pageNum = parseInt(hash.replace("#page-", ""));
      if (pageNum) {
        setTimeout(() => {
          document.getElementById(`page-${pageNum}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 500);
      }
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!juz) return;
    const pages = Array.from(
      { length: juz.endPage - juz.startPage + 1 },
      (_, i) => juz.startPage + i
    );
    let visiblePage = pages[0];
    for (const page of pages) {
      const el = pageRefs.current[page];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2) {
          visiblePage = page;
        }
      }
    }
    setCurrentPage(visiblePage);
    // Auto-save bookmark as user scrolls
    if (visiblePage) {
      saveBookmark(num, visiblePage);
      setSavedBookmark({ juz: num, page: visiblePage });
    }
  }, [juz, num]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (!juz) return <Navigate to="/" replace />;

  const pages = Array.from(
    { length: juz.endPage - juz.startPage + 1 },
    (_, i) => juz.startPage + i
  );

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
      saveBookmark(num, currentPage);
      setSavedBookmark({ juz: num, page: currentPage });
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
      className={`min-h-screen bg-background ${isFullscreen ? "fullscreen-reading" : ""}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header & toolbar - hidden in fullscreen unless controls shown */}
      <div className={`transition-all duration-300 ${isFullscreen && !showControls ? "opacity-0 pointer-events-none -translate-y-full fixed top-0 left-0 right-0 z-50" : isFullscreen ? "fixed top-0 left-0 right-0 z-50 opacity-100" : ""}`}>
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

      {/* Navigation between Juz - hidden in fullscreen */}
      {!isFullscreen && (
        <div className="flex justify-between items-center container max-w-4xl mx-auto px-4 py-3">
          {num > 1 ? (
            <Link
              to={`/juz/${num - 1}`}
              className="flex items-center gap-1 text-sm font-naskh text-muted-foreground hover:text-gold transition-colors"
            >
              <ChevronRight size={16} />
              الجزء السابق
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground font-naskh">
            {toArabicNumber(pages.length)} صفحة
          </span>
          {num < 30 ? (
            <Link
              to={`/juz/${num + 1}`}
              className="flex items-center gap-1 text-sm font-naskh text-muted-foreground hover:text-gold transition-colors"
            >
              الجزء التالي
              <ChevronLeft size={16} />
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* Swipe hint on mobile - hidden in fullscreen */}
      {!isFullscreen && (
        <div className="text-center text-xs text-muted-foreground font-naskh pb-2 sm:hidden">
          ← اسحب للتنقل بين الأجزاء →
        </div>
      )}

      {/* Pages */}
      <main
        className={`mx-auto px-2 sm:px-4 flex flex-col items-center overflow-x-auto ${isFullscreen ? "pb-8 pt-2" : "pb-32 sm:pb-12"}`}
        onClick={handleScreenTap}
      >
        <div className="flex flex-col items-center gap-3 sm:gap-4 w-full" style={{ maxWidth: `${isFullscreen ? 9999 : maxWidth}px` }}>
          {pages.map((page) => (
            <div
              key={page}
              ref={(el) => { pageRefs.current[page] = el; }}
              id={`page-${page}`}
              className="relative rounded-lg overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 w-full"
            >
              {!isFullscreen && (
                <div className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground text-xs font-naskh px-2 py-1 rounded">
                  صفحة {toArabicNumber(page)}
                </div>
              )}

              {errorStates[page] && (
                <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground font-naskh text-sm">
                    تعذر تحميل الصفحة {toArabicNumber(page)}
                  </span>
                </div>
              )}

              {!errorStates[page] && (
                <LazyImage
                  src={getQuranPageImageUrl(page)}
                  alt={`صفحة ${toArabicNumber(page)} من المصحف الشريف`}
                  className="quran-page-img"
                  onLoad={() => handleImageLoad(page)}
                  onError={() => handleImageError(page)}
                />
              )}
            </div>
          ))}
        </div>
      </main>


      {/* Back to top - desktop only, hidden in fullscreen */}
      {!isFullscreen && (
        <div className="text-center pb-8 hidden sm:block">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1 text-sm font-naskh text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowUp size={14} />
            العودة للأعلى
          </button>
        </div>
      )}

      {/* Fullscreen toggle button */}
      <button
        onClick={toggleFullscreen}
        className={`fixed z-[60] p-3 rounded-full shadow-lg transition-all duration-300 ${
          isFullscreen
            ? `bottom-6 left-6 gradient-gold text-foreground ${showControls ? "opacity-100" : "opacity-30 hover:opacity-100"}`
            : "bottom-24 sm:bottom-6 left-4 bg-card border border-border text-foreground hover:bg-muted"
        }`}
        title={isFullscreen ? "الخروج من ملء الشاشة" : "وضع ملء الشاشة"}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      {/* Fullscreen page indicator */}
      {isFullscreen && currentPage > 0 && (
        <div className={`fixed bottom-6 right-6 z-[60] bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 font-naskh text-xs text-muted-foreground transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
          صفحة {toArabicNumber(currentPage)}
        </div>
      )}

      {/* Juz Index Modal */}
      {showJuzIndex && <JuzIndex onClose={() => setShowJuzIndex(false)} currentJuz={num} />}
    </div>
  );
};

export default JuzViewer;
