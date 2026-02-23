import { useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import { juzData, getQuranPageImageUrl, toArabicNumber } from "@/data/quranData";
import QuranHeader from "@/components/QuranHeader";

const JuzViewer = () => {
  const { juzNumber } = useParams();
  const num = parseInt(juzNumber || "0");
  const juz = juzData.find((j) => j.number === num);

  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});

  if (!juz) return <Navigate to="/" replace />;

  const pages = Array.from(
    { length: juz.endPage - juz.startPage + 1 },
    (_, i) => juz.startPage + i
  );

  const handleImageLoad = (page: number) => {
    setLoadingStates((prev) => ({ ...prev, [page]: false }));
  };

  const handleImageError = (page: number) => {
    setLoadingStates((prev) => ({ ...prev, [page]: false }));
    setErrorStates((prev) => ({ ...prev, [page]: true }));
  };

  return (
    <div className="min-h-screen bg-background">
      <QuranHeader title={juz.nameAr} showBack />

      {/* Navigation between Juz */}
      <div className="flex justify-between items-center container max-w-4xl mx-auto px-4 py-4">
        {num > 1 ? (
          <a
            href={`/juz/${num - 1}`}
            className="text-sm font-naskh text-muted-foreground hover:text-gold transition-colors"
          >
            → الجزء السابق
          </a>
        ) : (
          <span />
        )}
        <span className="text-sm text-muted-foreground font-naskh">
          {toArabicNumber(pages.length)} صفحة
        </span>
        {num < 30 ? (
          <a
            href={`/juz/${num + 1}`}
            className="text-sm font-naskh text-muted-foreground hover:text-gold transition-colors"
          >
            الجزء التالي ←
          </a>
        ) : (
          <span />
        )}
      </div>

      {/* Pages grid */}
      <main className="container max-w-4xl mx-auto px-4 pb-12">
        <div className="flex flex-col items-center gap-4">
          {pages.map((page) => (
            <div
              key={page}
              className="relative w-full max-w-2xl rounded-lg overflow-hidden border border-border bg-card shadow-sm"
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
                  className="w-full h-auto block"
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
          className="text-sm font-naskh text-muted-foreground hover:text-gold transition-colors"
        >
          ↑ العودة للأعلى
        </button>
      </div>
    </div>
  );
};

export default JuzViewer;
