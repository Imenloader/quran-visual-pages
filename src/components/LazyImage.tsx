import { useState, useEffect } from "react";

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

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div className="relative w-full h-full">
      {!isLoaded && !hasError && (
        <div className="w-full aspect-[3/4] bg-muted/20 animate-pulse flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
            <span className="text-[10px] text-primary/40 font-serif italic">جاري التحميل...</span>
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="w-full aspect-[3/4] bg-destructive/5 flex items-center justify-center rounded-2xl border border-destructive/10">
          <span className="text-xs text-destructive/60 font-serif">فشل التحميل</span>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? "opacity-100" : "opacity-0 absolute inset-0"}`}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        onError={() => {
          setHasError(true);
          onError?.();
        }}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
};

export default LazyImage;
