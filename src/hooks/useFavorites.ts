import { useState, useCallback, useEffect } from "react";

export type FavoriteItem =
  | { type: "juz"; id: number; nickname?: string }
  | { type: "dhikr"; id: number; categoryId: string; nickname?: string }
  | { type: "recitation"; id: number; surahName: string; reciterId: number; reciterName: string; moshafId: number; moshafServer: string; nickname?: string }
  | { type: "reciter"; id: number; name: string; nickname?: string };

const STORAGE_KEY = "quran-favorites";

const loadFavorites = (): FavoriteItem[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveFavorites = (items: FavoriteItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setFavorites(loadFavorites());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const reorderFavorites = useCallback((newOrder: FavoriteItem[]) => {
    setFavorites(newOrder);
    saveFavorites(newOrder);
  }, []);

  const updateFavorite = useCallback((item: FavoriteItem, updates: Partial<FavoriteItem>) => {
    setFavorites(prev => {
      const next = prev.map(f => {
        const isMatch = f.type === item.type && f.id === item.id && 
          (f.type !== "recitation" || (f.reciterId === item.reciterId && f.moshafId === item.moshafId));
        
        return isMatch ? { ...f, ...updates } : f;
      });
      saveFavorites(next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      let exists: boolean;
      if (item.type === "recitation") {
        exists = prev.some(
          f => f.type === "recitation" && f.id === item.id && f.reciterId === item.reciterId && f.moshafId === item.moshafId
        );
      } else if (item.type === "reciter") {
        exists = prev.some(f => f.type === "reciter" && f.id === item.id);
      } else {
        exists = prev.some(f => f.type === item.type && f.id === item.id);
      }

      let next: FavoriteItem[];
      if (exists) {
        if (item.type === "recitation") {
          next = prev.filter(f => !(f.type === "recitation" && f.id === item.id && f.reciterId === item.reciterId && f.moshafId === item.moshafId));
        } else if (item.type === "reciter") {
          next = prev.filter(f => !(f.type === "reciter" && f.id === item.id));
        } else {
          next = prev.filter(f => !(f.type === item.type && f.id === item.id));
        }
      } else {
        next = [...prev, item];
      }
      saveFavorites(next);
      return next;
    });
  }, []);

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
