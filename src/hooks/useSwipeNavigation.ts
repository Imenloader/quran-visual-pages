import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
}

export function useSwipeNavigation({ onSwipeLeft, onSwipeRight, minSwipeDistance = 80 }: SwipeConfig) {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
    if (diff > 0 && onSwipeLeft) {
      onSwipeLeft();
    } else if (diff < 0 && onSwipeRight) {
      onSwipeRight();
    }
  }, [minSwipeDistance, onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
