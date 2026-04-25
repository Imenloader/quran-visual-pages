import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTheme } from "./ThemeContext";
import { getQuranPageFallbackImageUrl, getQuranPageImageUrl, juzData } from "@/data/quranData";
import { offlineOrchestrator, type OfflineBundleStatus, type OfflineGlobalStatus } from "@/services/offlineOrchestrator";

const CACHE_NAME = "quran-pages-cache";

type PageCacheState = "cached" | "missing" | "downloading";

interface OfflineContextValue {
  // Global Orchestrator State
  isOnline: boolean;
  bundles: OfflineBundleStatus[];
  globalStatus: OfflineGlobalStatus;
  
  // Specific Juz Caching State (Legacy/Specialized)
  pageStatus: Record<number, PageCacheState>;
  juzCompletion: Record<number, number>;
  
  // Actions
  refresh: () => Promise<void>;
  downloadBundle: (bundleId: any) => Promise<void>;
  clearBundle: (bundleId: any) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // Specialized Actions
  refreshJuzCompletion: (juzNumber?: number) => Promise<void>;
  prefetchNeighborPages: (currentPage: number, distance: number, bounds: { start: number; end: number }) => Promise<void>;
  prepareJuzOffline: (juzNumber: number) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

const getOrderedSourceUrls = (page: number, isTajweed = true, preferredSourceId?: string): string[] => {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (let level = 0; level < 6; level++) {
    const url = getQuranPageFallbackImageUrl(page, level, isTajweed, preferredSourceId);
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  const primary = getQuranPageImageUrl(page, isTajweed, preferredSourceId);
  if (primary && !seen.has(primary)) {
    urls.unshift(primary);
  }

  return Array.from(new Set(urls));
};

export const OfflineProvider = ({ children }: { children: ReactNode }) => {
  // Global State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [bundles, setBundles] = useState<OfflineBundleStatus[]>([]);
  const [globalStatus, setGlobalStatus] = useState<OfflineGlobalStatus>({
    bundles: [],
    totalItems: 0,
    completedItems: 0,
    failedItems: 0,
    progress: 0
  });

  // Specialized State
  const [pageStatus, setPageStatus] = useState<Record<number, PageCacheState>>({});
  const [juzCompletion, setJuzCompletion] = useState<Record<number, number>>({});
  const { preferredImageSource, tajweedMode } = useTheme();

  // Sync with Orchestrator
  useEffect(() => {
    const unsubscribe = offlineOrchestrator.subscribe((event) => {
      setBundles(event.globalStatus.bundles);
      setGlobalStatus(event.globalStatus);
      setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    });

    return unsubscribe;
  }, []);

  // Sync with Online/Offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isCached = useCallback(async (cache: Cache, url: string) => {
    const hit = await cache.match(url);
    return !!hit;
  }, []);

  const cachePageWithFallbacks = useCallback(async (cache: Cache, page: number) => {
    const candidates = getOrderedSourceUrls(page, tajweedMode, preferredImageSource || undefined);

    for (const url of candidates) {
      if (await isCached(cache, url)) {
        return true;
      }
    }

    for (const url of candidates) {
      try {
        // Primary attempt: Direct CORS
        let response = await fetch(url, { mode: "cors" });
        
        // Secondary attempt: Proxy if direct fails
        if (!response.ok) {
          console.warn(`Direct fetch failed for ${url}, trying proxy fallback...`);
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
          response = await fetch(proxyUrl);
        }

        if (response.ok) {
          await cache.put(url, response.clone());
          return true;
        }
      } catch (err) {
        console.warn(`Failed to fetch ${url} even with proxy:`, err);
        // keep trying deterministic fallback list
      }
    }

    return false;
  }, [isCached]);

  const refreshJuzCompletion = useCallback(async (juzNumber?: number) => {
    if (!("caches" in window)) return;
    const cache = await caches.open(CACHE_NAME);
    const list = typeof juzNumber === "number" ? juzData.filter(j => j.number === juzNumber) : juzData;

    const entries = await Promise.all(
      list.map(async (juz) => {
        const pages = Array.from({ length: juz.endPage - juz.startPage + 1 }, (_, i) => juz.startPage + i);
        let cached = 0;

        for (const page of pages) {
          const urls = getOrderedSourceUrls(page, tajweedMode, preferredImageSource || undefined);
          const hasAny = await Promise.any(urls.map(async (url) => {
            const hit = await cache.match(url);
            if (!hit) throw new Error("miss");
            return true;
          })).then(() => true).catch(() => false);

          if (hasAny) {
            cached++;
            setPageStatus(prev => ({ ...prev, [page]: "cached" }));
          } else {
            setPageStatus(prev => ({ ...prev, [page]: prev[page] === "downloading" ? "downloading" : "missing" }));
          }
        }

        const pct = Math.round((cached / pages.length) * 100);
        return [juz.number, pct] as const;
      })
    );

    setJuzCompletion(prev => ({ ...prev, ...Object.fromEntries(entries) }));
  }, []);

  const prefetchNeighborPages = useCallback(async (currentPage: number, distance: number, bounds: { start: number; end: number }) => {
    if (!("caches" in window)) return;

    const cache = await caches.open(CACHE_NAME);
    const textCache = await caches.open("quran-text-cache");
    const pages: number[] = [];

    for (let p = currentPage - distance; p <= currentPage + distance; p++) {
      if (p >= bounds.start && p <= bounds.end) pages.push(p);
    }

    for (const page of pages) {
      setPageStatus(prev => ({ ...prev, [page]: prev[page] === "cached" ? "cached" : "downloading" }));
    }

    await Promise.all(
      pages.map(async (page) => {
        // Prefetch Image
        const imgOk = await cachePageWithFallbacks(cache, page);
        
        // Prefetch Text
        const textUrl = `https://api.quran.com/api/v4/quran/verses/uthmani?page_number=${page}`;
        const hasText = await textCache.match(textUrl);
        if (!hasText) {
          try {
            const res = await fetch(textUrl);
            if (res.ok) await textCache.put(textUrl, res);
          } catch (e) {
            console.warn("Predictive text fetch failed", e);
          }
        }

        setPageStatus(prev => ({ ...prev, [page]: imgOk ? "cached" : "missing" }));
      })
    );

    const juz = juzData.find(j => currentPage >= j.startPage && currentPage <= j.endPage);
    if (juz) await refreshJuzCompletion(juz.number);
  }, [cachePageWithFallbacks, refreshJuzCompletion]);

  const prepareJuzOffline = useCallback(async (juzNumber: number) => {
    if (!("caches" in window)) return;
    const juz = juzData.find(j => j.number === juzNumber);
    if (!juz) return;

    const cache = await caches.open(CACHE_NAME);
    const pages = Array.from({ length: juz.endPage - juz.startPage + 1 }, (_, i) => juz.startPage + i);

    for (const page of pages) {
      setPageStatus(prev => ({ ...prev, [page]: "downloading" }));
    }

    for (const page of pages) {
      const ok = await cachePageWithFallbacks(cache, page);
      setPageStatus(prev => ({ ...prev, [page]: ok ? "cached" : "missing" }));
    }

    await refreshJuzCompletion(juzNumber);
  }, [cachePageWithFallbacks, refreshJuzCompletion]);

  const value = useMemo(() => ({
    isOnline,
    bundles,
    globalStatus,
    pageStatus,
    juzCompletion,
    refresh: async () => { /* Orchestrator doesn't have a simple refresh yet */ },
    downloadBundle: (bundleId: any) => offlineOrchestrator.prepareBundle(bundleId),
    clearBundle: (bundleId: any) => offlineOrchestrator.clearBundle(bundleId),
    clearAll: () => offlineOrchestrator.clearAll(),
    refreshJuzCompletion,
    prefetchNeighborPages,
    prepareJuzOffline,
  }), [isOnline, bundles, globalStatus, pageStatus, juzCompletion, refreshJuzCompletion, prefetchNeighborPages, prepareJuzOffline]);

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error("useOffline must be used within OfflineProvider");
  return ctx;
};

// Compatibility hooks for older code that might expect them
export const useOfflineStatus = () => {
  const { isOnline, globalStatus } = useOffline();
  return { 
    isOnline, 
    storageUsageBytes: 0, // Simplified for now
    storageQuotaBytes: 0,
    lastSyncedAt: Date.now() 
  };
};

export const useOfflineBundle = (bundleId: string) => {
  const { bundles } = useOffline();
  return bundles.find(b => b.bundleId === bundleId) ?? null;
};

export const useOfflineActions = () => {
  const { refresh, downloadBundle, clearBundle, clearAll } = useOffline();
  return { refresh, downloadBundle, clearBundle, clearAll };
};
