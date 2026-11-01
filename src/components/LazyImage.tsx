import { useState, useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

const LazyImage = ({ src, alt, className = "", onLoad, onError, priority = false }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
    setIsRetrying(false);
  }, [src]);

  const handleRetry = () => {
    if (!imgRef.current) return;
    setIsRetrying(true);
    setHasError(false);
    // Bust the browser cache so a genuinely failed fetch isn't served from cache again
    const bust = src.includes("?") ? `${src}&r=${Date.now()}` : `${src}?r=${Date.now()}`;
    imgRef.current.src = bust;
    setRetryCount((c) => c + 1);
  };

  return (
    <div className="relative w-full h-full">
      {!isLoaded && !hasError && (
        <div className="w-full aspect-[3/4] bg-muted/20 animate-pulse flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin ${isRetrying ? "opacity-60" : ""}`} />
            <span className="text-[10px] text-primary/40 font-serif italic">
              {isRetrying ? "جاري إعادة المحاولة..." : "جاري التحميل..."}
            </span>
          </div>
        </div>
      )}

      {hasError && (
        <div className="w-full aspect-[3/4] bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/10">
          <span className="text-xs text-destructive/60 font-serif">تعذر تحميل الصفحة</span>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/10 text-accent text-xs font-serif font-bold hover:bg-accent/20 transition-colors"
          >
            <RefreshCw size={13} />
            إعادة المحاولة
          </button>
        </div>
      )}

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} absolute inset-0 transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => {
          setIsLoaded(true);
          setIsRetrying(false);
          onLoad?.();
        }}
        onError={() => {
          // Auto-fallback through sources for the first attempts, then surface a retry button
          if (retryCount < 1) {
            setRetryCount((c) => c + 1);
            setTimeout(() => {
              if (imgRef.current) {
                const bust = src.includes("?") ? `${src}&r=${Date.now()}` : `${src}?r=${Date.now()}`;
                imgRef.current.src = bust;
              }
            }, 400);
          } else {
            setHasError(true);
            setIsRetrying(false);
            onError?.();
          }
        }}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
};

export default LazyImage;
