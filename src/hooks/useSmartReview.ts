import { useMemo } from "react";
import { useHifzMastery, PageMastery } from "./useHifzMastery";

export interface AtRiskPage {
  pageNumber: number;
  mastery: PageMastery;
  reason: "weak" | "stale" | "untested";
}

export const useSmartReview = () => {
  const { masteryData, isLoaded } = useHifzMastery();

  const atRiskPages = useMemo(() => {
    if (!isLoaded) return [];

    const pages: AtRiskPage[] = [];
    const now = new Date();
    const staleThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Check all 604 pages
    for (let i = 1; i <= 604; i++) {
      const mastery = masteryData[i];
      
      if (!mastery) {
        // Untested pages could be added here, but maybe too many. 
        // Let's focus on those with some history first.
        continue;
      }

      const lastTested = new Date(mastery.lastTested);
      const isStale = now.getTime() - lastTested.getTime() > staleThreshold;
      const isWeak = mastery.masteryLevel < 3;

      if (isWeak) {
        pages.push({ pageNumber: i, mastery, reason: "weak" });
      } else if (isStale) {
        pages.push({ pageNumber: i, mastery, reason: "stale" });
      }
    }

    // Sort by priority: Weak first, then Stale
    return pages.sort((a, b) => {
      if (a.reason === "weak" && b.reason !== "weak") return -1;
      if (a.reason !== "weak" && b.reason === "weak") return 1;
      return b.mastery.masteryLevel - a.mastery.masteryLevel;
    });
  }, [masteryData, isLoaded]);

  const getReviewSuggestions = (count: number = 5) => {
    return atRiskPages.slice(0, count);
  };

  return { atRiskPages, getReviewSuggestions, isLoaded };
};
