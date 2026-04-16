import { useState, useCallback, useEffect } from "react";
import { storage } from "@/lib/storage";

export type FavoriteItem =
  | { type: "juz"; id: number; nickname?: string }
  | { type: "dhikr"; id: number; categoryId: string; nickname?: string }
  | { type: "recitation"; id: number; surahName: string; reciterId: number; reciterName: string; moshafId: number; moshafServer: string; nickname?: string }
  | { type: "reciter"; id: number; name: string; nickname?: string }
  | { type: "hadith"; id: number; bookId: string; bookName: string; text: string; nickname?: string };

const STORAGE_KEY = "quran-favorites";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const stored = await storage.get(STORAGE_KEY);
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse favorites", e);
        }
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  const saveFavorites = useCallback(async (items: FavoriteItem[]) => {
    await storage.set(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const reorderFavorites = useCallback(async (newOrder: FavoriteItem[]) => {
    setFavorites(newOrder);
    await saveFavorites(newOrder);
  }, [saveFavorites]);

  const updateFavorite = useCallback(async (item: FavoriteItem, updates: Partial<FavoriteItem>) => {
    const next = favorites.map(f => {
      const isMatch = f.type === item.type && f.id === item.id && 
        (f.type !== "recitation" || (f.reciterId === item.reciterId && f.moshafId === item.moshafId));
      
      return isMatch ? { ...f, ...updates } : f;
    });
    setFavorites(next);
    await saveFavorites(next);
  }, [favorites, saveFavorites]);

  const toggleFavorite = useCallback(async (item: FavoriteItem) => {
    let exists: boolean;
    if (item.type === "recitation") {
      exists = favorites.some(
        f => f.type === "recitation" && f.id === item.id && f.reciterId === item.reciterId && f.moshafId === item.moshafId
      );
    } else if (item.type === "reciter") {
      exists = favorites.some(f => f.type === "reciter" && f.id === item.id);
    } else {
      exists = favorites.some(f => f.type === item.type && f.id === item.id);
    }

    let next: FavoriteItem[];
    if (exists) {
      if (item.type === "recitation") {
        next = favorites.filter(f => !(f.type === "recitation" && f.id === item.id && f.reciterId === item.reciterId && f.moshafId === item.moshafId));
      } else if (item.type === "reciter") {
        next = favorites.filter(f => !(f.type === "reciter" && f.id === item.id));
      } else {
        next = favorites.filter(f => !(f.type === item.type && f.id === item.id));
      }
    } else {
      next = [...favorites, item];
    }
    setFavorites(next);
    await saveFavorites(next);
  }, [favorites, saveFavorites]);

  const isFavorite = useCallback(
    (type: FavoriteItem["type"], id: number, reciterId?: number, moshafId?: number) => {
      if (type === "recitation" && reciterId !== undefined && moshafId !== undefined) {
        return favorites.some(f => f.type === "recitation" && f.id === id && f.reciterId === reciterId && f.moshafId === moshafId);
      }
      if (type === "reciter") {
        return favorites.some(f => f.type === "reciter" && f.id === id);
      }
      return favorites.some(f => f.type === type && f.id === id);
    },
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, reorderFavorites, updateFavorite };
};
