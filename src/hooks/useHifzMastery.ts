import { useState, useEffect, useCallback } from "react";
import { storage } from "@/lib/storage";

export interface PageMastery {
  lastTested: string;
  masteryLevel: number; // 0-3
  history: boolean[]; // last 5 results
}

export const useHifzMastery = () => {
  const [masteryData, setMasteryData] = useState<Record<number, PageMastery>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await storage.get("hifz-mastery-data");
      if (data) {
        setMasteryData(JSON.parse(data));
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  const saveResult = useCallback(async (pageNumber: number, success: boolean) => {
    const current = masteryData[pageNumber] || {
      lastTested: new Date().toISOString(),
      masteryLevel: 0,
      history: []
    };

    const newHistory = [...current.history, success].slice(-3); // Keep last 3 for mastery logic
    let newLevel = current.masteryLevel;

    // Logic: 3 consecutive successes = Level Up
    if (newHistory.length === 3 && newHistory.every(v => v === true)) {
      newLevel = Math.min(3, newLevel + 1);
    } else if (!success) {
      newLevel = Math.max(0, newLevel - 1);
    }

    const updated = {
      ...masteryData,
      [pageNumber]: {
        lastTested: new Date().toISOString(),
        masteryLevel: newLevel,
        history: [...current.history, success].slice(-5)
      }
    };

    setMasteryData(updated);
    await storage.set("hifz-mastery-data", JSON.stringify(updated));
  }, [masteryData]);

  const getPageMastery = (pageNumber: number): PageMastery | undefined => {
    return masteryData[pageNumber];
  };

  return { masteryData, isLoaded, saveResult, getPageMastery };
};
