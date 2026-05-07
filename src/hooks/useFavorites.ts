import { useState, useCallback, useEffect } from "react";
import { syncService } from "@/services/syncService";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

export interface FavoriteCollection {
  id: string;
  name: string;
  color?: string;
}

export type FavoriteItem = (
  | { type: "juz"; id: number; nickname?: string }
  | { type: "dhikr"; id: number; categoryId: string; nickname?: string }
  | { type: "recitation"; id: number; surahName: string; reciterId: number; reciterName: string; moshafId: number; moshafServer: string; nickname?: string }
  | { type: "reciter"; id: number; name: string; nickname?: string }
  | { type: "hadith"; id: number; bookId: string; bookName: string; text: string; nickname?: string }
  | { type: "verse"; id: string; surahNumber: number; verseNumber: number; surahName: string; text: string; nickname?: string }
  | { type: "story"; id: string; title: string; nickname?: string }
) & { collectionId?: string };

const STORAGE_KEY = "quran-favorites";
const COLLECTIONS_KEY = "quran-favorite-collections";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [collections, setCollections] = useState<FavoriteCollection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(async () => {
    const savedFavs = await syncService.loadData<FavoriteItem[]>(STORAGE_KEY, []);
    setFavorites(savedFavs);
    const savedColls = await syncService.loadData<FavoriteCollection[]>(COLLECTIONS_KEY, []);
    if (savedColls.length === 0) {
      const defaultColls: FavoriteCollection[] = [
        { id: "morning", name: "الصباح / Morning", color: "#fbbf24" },
        { id: "comfort", name: "الطمأنينة / Comfort", color: "#3b82f6" },
        { id: "healing", name: "الشفاء / Healing", color: "#10b981" }
      ];
      setCollections(defaultColls);
      await syncService.saveData(COLLECTIONS_KEY, defaultColls);
    } else {
      setCollections(savedColls);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadData();
      }
    });
    loadData();
    return () => unsubscribe();
  }, [loadData]);

  const saveFavorites = useCallback(async (items: FavoriteItem[]) => {
    await syncService.saveData(STORAGE_KEY, items);
  }, []);

  const saveCollections = useCallback(async (items: FavoriteCollection[]) => {
    await syncService.saveData(COLLECTIONS_KEY, items);
  }, []);

  const reorderFavorites = useCallback(async (newOrder: FavoriteItem[]) => {
    setFavorites(newOrder);
    await saveFavorites(newOrder);
  }, [saveFavorites]);

  const updateFavorite = useCallback(async (item: FavoriteItem, updates: Partial<FavoriteItem>) => {
    const next = favorites.map(f => {
      let isMatch = f.type === item.type && f.id === item.id;
      
      if (isMatch && f.type === "recitation" && item.type === "recitation") {
        isMatch = f.reciterId === item.reciterId && f.moshafId === item.moshafId;
      }
      
      return isMatch ? ({ ...f, ...updates } as FavoriteItem) : f;
    });
    setFavorites(next);
    await saveFavorites(next);
  }, [favorites, saveFavorites]);

  const toggleFavorite = useCallback(async (item: FavoriteItem) => {
    let exists: boolean;
    if (item.type === "recitation") {
      const recitationItem = item;
      exists = favorites.some(
        f => f.type === "recitation" && f.id === recitationItem.id && f.reciterId === recitationItem.reciterId && f.moshafId === recitationItem.moshafId
      );
    } else if (item.type === "reciter") {
      exists = favorites.some(f => f.type === "reciter" && f.id === item.id);
    } else {
      exists = favorites.some(f => f.type === item.type && f.id === item.id);
    }

    let next: FavoriteItem[];
    if (exists) {
      if (item.type === "recitation") {
        const recitationItem = item;
        next = favorites.filter(f => !(f.type === "recitation" && f.id === recitationItem.id && f.reciterId === recitationItem.reciterId && f.moshafId === recitationItem.moshafId));
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

  const addCollection = useCallback(async (name: string, color?: string) => {
    const newColl: FavoriteCollection = {
      id: Date.now().toString(),
      name,
      color
    };
    const next = [...collections, newColl];
    setCollections(next);
    await saveCollections(next);
    return newColl;
  }, [collections, saveCollections]);

  const removeCollection = useCallback(async (id: string) => {
    const next = collections.filter(c => c.id !== id);
    setCollections(next);
    await saveCollections(next);
    
    // Remove collectionId from items in this collection
    const nextFavs = favorites.map(f => f.collectionId === id ? ({ ...f, collectionId: undefined } as FavoriteItem) : f);
    setFavorites(nextFavs);
    await saveFavorites(nextFavs);
  }, [collections, favorites, saveCollections, saveFavorites]);

  const isFavorite = useCallback(
    (type: FavoriteItem["type"], id: string | number, reciterId?: number, moshafId?: number) => {
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

  return { 
    favorites, collections, isLoaded, 
    toggleFavorite, isFavorite, reorderFavorites, updateFavorite,
    addCollection, removeCollection
  };
};
