import { useState, useCallback, useEffect } from "react";

export type FavoriteItem =
  | { type: "juz"; id: number }
  | { type: "dhikr"; id: number; categoryId: string };

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

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      const exists = prev.some(
        f => f.type === item.type && f.id === item.id
      );
      const next = exists
        ? prev.filter(f => !(f.type === item.type && f.id === item.id))
        : [...prev, item];
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (type: FavoriteItem["type"], id: number) =>
      favorites.some(f => f.type === type && f.id === id),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
};
