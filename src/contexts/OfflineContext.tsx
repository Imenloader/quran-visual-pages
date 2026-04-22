import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { getQuranPageFallbackImageUrl, getQuranPageImageUrl, juzData } from "@/data/quranData";

const CACHE_NAME = "quran-pages-cache";

type PageCacheState = "cached" | "missing" | "downloading";

interface OfflineContextValue {
  pageStatus: Record<number, PageCacheState>;
  juzCompletion: Record<number, number>;
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
  const [pageStatus, setPageStatus] = useState<Record<number, PageCacheState>>({});
  const [juzCompletion, setJuzCompletion] = useState<Record<number, number>>({});

  const isCached = useCallback(async (cache: Cache, url: string) => {
    const hit = await cache.match(url);
    return !!hit;
  }, []);

  const cachePageWithFallbacks = useCallback(async (cache: Cache, page: number) => {
    const candidates = getOrderedSourceUrls(page, true);

    for (const url of candidates) {
      if (await isCached(cache, url)) {
        return true;
      }
    }

    for (const url of candidates) {
      try {
        const response = await fetch(url, { mode: "cors" });
        if (response.ok) {
          await cache.put(url, response.clone());
          return true;
        }
      } catch {
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
          const urls = getOrderedSourceUrls(page, true);
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
    const pages: number[] = [];

    for (let p = currentPage - distance; p <= currentPage + distance; p++) {
      if (p >= bounds.start && p <= bounds.end) pages.push(p);
    }

    for (const page of pages) {
      setPageStatus(prev => ({ ...prev, [page]: prev[page] === "cached" ? "cached" : "downloading" }));
    }

    await Promise.all(
      pages.map(async (page) => {
        const ok = await cachePageWithFallbacks(cache, page);
        setPageStatus(prev => ({ ...prev, [page]: ok ? "cached" : "missing" }));
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
    pageStatus,
    juzCompletion,
    refreshJuzCompletion,
    prefetchNeighborPages,
    prepareJuzOffline,
  }), [pageStatus, juzCompletion, refreshJuzCompletion, prefetchNeighborPages, prepareJuzOffline]);

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error("useOffline must be used within OfflineProvider");
  return ctx;
};
