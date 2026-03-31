import { useState, useRef, useEffect, useCallback } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage = ({ src, alt, className = "", onLoad, onError }: LazyImageProps) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" } // preload 600px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <div ref={imgRef} className="relative w-full">
      {/* Blur placeholder */}
      <div
        className={`absolute inset-0 z-[2] transition-opacity duration-500 ${
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="w-full h-full bg-gradient-to-b from-muted/80 via-muted/50 to-muted/80 backdrop-blur-sm animate-pulse rounded-lg" />
        {!hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground font-naskh">جاري التحميل...</span>
            </div>
          </div>
        )}
      </div>

      {/* Aspect ratio placeholder when image not loaded */}
      {!isLoaded && <div className="w-full aspect-[3/4]" />}

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-auto block transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;
