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
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(() => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;
    
    // If vertical movement is significant, ignore the swipe
    if (Math.abs(diffY) > Math.abs(diffX)) return;
    if (Math.abs(diffX) < minSwipeDistance) return;

    // RTL: swipe left = next, swipe right = previous
    if (diffX > 0 && onSwipeLeft) {
      onSwipeLeft();
    } else if (diffX < 0 && onSwipeRight) {
      onSwipeRight();
    }
  }, [minSwipeDistance, onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
