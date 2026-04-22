import { useState, useCallback, useEffect } from "react";
import { syncService } from "@/services/syncService";

export type FontSizeContext = "reading" | "athkar" | "tafsir" | "default";

const STORAGE_KEY = "quran-font-sizes";

export const useFontSize = () => {
  const [fontSizes, setFontSizes] = useState<Record<FontSizeContext, number>>({
    reading: 100,
    athkar: 100,
    tafsir: 100,
    default: 100
  });

  useEffect(() => {
    const load = async () => {
      const saved = await syncService.loadData<Record<FontSizeContext, number>>(STORAGE_KEY, {
        reading: 100,
        athkar: 100,
        tafsir: 100,
        default: 100
      });
      setFontSizes(saved);
    };
    load();
  }, []);

  const setFontSize = useCallback(async (context: FontSizeContext, size: number) => {
    const next = { ...fontSizes, [context]: size };
    setFontSizes(next);
    await syncService.saveData(STORAGE_KEY, next);
    
    // Apply globally if default
    if (context === "default") {
      document.documentElement.style.setProperty("--font-size-base", `${size}%`);
    }
  }, [fontSizes]);

  return { fontSizes, setFontSize };
};
