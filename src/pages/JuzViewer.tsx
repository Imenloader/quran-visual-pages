import { useParams, Navigate, Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { juzData, getQuranPageImageUrl, toArabicNumber } from "@/data/quranData";
import QuranHeader from "@/components/QuranHeader";
import ReadingToolbar from "@/components/ReadingToolbar";
import ProgressBar from "@/components/ProgressBar";
import PageNavigator from "@/components/PageNavigator";
import { Bookmark, ChevronRight, ChevronLeft, ArrowUp } from "lucide-react";

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
  const [savedBookmark, setSavedBookmark] = useState<BookmarkData | null>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

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

  // Scroll tracking for progress
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
  }, [juz]);

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

  return (
    <div className="min-h-screen bg-background">
      <QuranHeader title={juz.nameAr} showBack />

      {/* Progress bar */}
      <ProgressBar progress={progress} currentPage={currentPage} totalPages={pages.length} startPage={juz.startPage} />

      {/* Toolbar: zoom, bookmark, page nav */}
      <ReadingToolbar
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(z + 20, 200))}
        onZoomOut={() => setZoom((z) => Math.max(z - 20, 40))}
        onResetZoom={() => setZoom(100)}
        onSaveBookmark={handleSaveBookmark}
        onTogglePageNav={() => setShowPageNav((v) => !v)}
        currentPage={currentPage}
        bookmarked={savedBookmark?.juz === num && savedBookmark?.page === currentPage}
      />

      {/* Page navigator */}
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

      {/* Navigation between Juz */}
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

      {/* Pages */}
      <main className="container mx-auto px-4 pb-12 flex flex-col items-center">
        <div className="flex flex-col items-center gap-4 w-full">
          {pages.map((page) => (
            <div
              key={page}
              ref={(el) => { pageRefs.current[page] = el; }}
              id={`page-${page}`}
              className="relative rounded-lg overflow-hidden border border-border bg-card shadow-sm transition-all duration-300"
              style={{ width: "100%", maxWidth: `${maxWidth}px` }}
            >
              {/* Page number badge */}
              <div className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground text-xs font-naskh px-2 py-1 rounded">
                صفحة {toArabicNumber(page)}
              </div>

              {/* Loading skeleton */}
              {loadingStates[page] !== false && !errorStates[page] && (
                <div className="absolute inset-0 w-full h-full bg-muted animate-pulse flex items-center justify-center z-[5]">
                  <span className="text-muted-foreground font-naskh text-sm">جاري التحميل...</span>
                </div>
              )}

              {/* Error state */}
              {errorStates[page] && (
                <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground font-naskh text-sm">
                    تعذر تحميل الصفحة {toArabicNumber(page)}
                  </span>
                </div>
              )}

              {/* Image */}
              {!errorStates[page] && (
                <img
                  src={getQuranPageImageUrl(page)}
                  alt={`صفحة ${toArabicNumber(page)} من المصحف الشريف`}
                  className="w-full h-auto block quran-page-img"
                  loading="lazy"
                  onLoad={() => handleImageLoad(page)}
                  onError={() => handleImageError(page)}
                />
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Back to top */}
      <div className="text-center pb-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-1 text-sm font-naskh text-muted-foreground hover:text-gold transition-colors"
        >
          <ArrowUp size={14} />
          العودة للأعلى
        </button>
      </div>
    </div>
  );
};

export default JuzViewer;
