import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface SwipeConfig {
  juzNumber: number;
  minSwipeDistance?: number;
}

export function useSwipeNavigation({ juzNumber, minSwipeDistance = 80 }: SwipeConfig) {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) < minSwipeDistance) return;

    // RTL: swipe left = next, swipe right = previous
    if (diff > 0 && juzNumber > 1) {
      navigate(`/juz/${juzNumber - 1}`);
    } else if (diff < 0 && juzNumber < 30) {
      navigate(`/juz/${juzNumber + 1}`);
    }
  }, [juzNumber, minSwipeDistance, navigate]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
