export type OfflineBundleState = "idle" | "downloading" | "ready" | "error";

export interface OfflineBundleStatus {
  bundleId: string;
  cacheNames: string[];
  state: OfflineBundleState;
  sizeBytes: number;
  itemCount: number;
  progress: number;
  lastUpdatedAt: number | null;
  error?: string;
}

export interface OfflineSnapshot {
  isOnline: boolean;
  bundles: Record<string, OfflineBundleStatus>;
  storageUsageBytes: number;
  storageQuotaBytes: number;
  lastSyncedAt: number;
}

const OFFLINE_BUNDLES: Record<string, string[]> = {
  quran: ["quran-pages-cache"],
  api: ["quran-api-cache", "prayer-times-cache"],
  audio: ["quran-audio-cache"],
};

class OfflineOrchestrator {
  private listeners = new Set<(snapshot: OfflineSnapshot) => void>();
  private inMemoryBundleState = new Map<string, Partial<OfflineBundleStatus>>();

  private emit(snapshot: OfflineSnapshot) {
    this.listeners.forEach((listener) => listener(snapshot));
  }

  subscribe(listener: (snapshot: OfflineSnapshot) => void) {
    this.listeners.add(listener);
    this.getSnapshot().then(listener).catch(() => {
      // Ignore hydration issues in unsupported browsers.
    });

    return () => this.listeners.delete(listener);
  }

  notify() {
    this.getSnapshot()
      .then((snapshot) => this.emit(snapshot))
      .catch((error) => {
        console.warn("offlineOrchestrator notify failed:", error);
      });
  }

  async getSnapshot(): Promise<OfflineSnapshot> {
    const [bundles, storage] = await Promise.all([
      this.getBundleStatuses(),
      this.getStorageUsage(),
    ]);

    return {
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      bundles,
      storageUsageBytes: storage.usageBytes,
      storageQuotaBytes: storage.quotaBytes,
      lastSyncedAt: Date.now(),
    };
  }

  async getStorageUsage() {
    if (!("storage" in navigator) || !("estimate" in navigator.storage)) {
      return { usageBytes: 0, quotaBytes: 0 };
    }

    const estimate = await navigator.storage.estimate();
    return {
      usageBytes: estimate.usage ?? 0,
      quotaBytes: estimate.quota ?? 0,
    };
  }

  private async getCacheStats(cacheNames: string[]) {
    if (!("caches" in window)) {
      return { sizeBytes: 0, itemCount: 0 };
    }

    let sizeBytes = 0;
    let itemCount = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      itemCount += requests.length;

      for (const request of requests) {
        const response = await cache.match(request);
        if (!response) continue;
        const blob = await response.blob();
        sizeBytes += blob.size;
      }
    }

    return { sizeBytes, itemCount };
  }

  async getBundleStatuses(): Promise<Record<string, OfflineBundleStatus>> {
    const entries = await Promise.all(
      Object.entries(OFFLINE_BUNDLES).map(async ([bundleId, cacheNames]) => {
        const cached = this.inMemoryBundleState.get(bundleId);

        try {
          const { sizeBytes, itemCount } = await this.getCacheStats(cacheNames);
          const state: OfflineBundleState = itemCount > 0 ? "ready" : cached?.state === "downloading" ? "downloading" : "idle";

          const status: OfflineBundleStatus = {
            bundleId,
            cacheNames,
            state,
            sizeBytes,
            itemCount,
            progress: cached?.progress ?? (itemCount > 0 ? 100 : 0),
            lastUpdatedAt: Date.now(),
            error: cached?.error,
          };

          this.inMemoryBundleState.set(bundleId, status);
          return [bundleId, status] as const;
        } catch (error) {
          const status: OfflineBundleStatus = {
            bundleId,
            cacheNames,
            state: "error",
            sizeBytes: 0,
            itemCount: 0,
            progress: 0,
            lastUpdatedAt: Date.now(),
            error: error instanceof Error ? error.message : "Failed to read cache",
          };

          this.inMemoryBundleState.set(bundleId, status);
          return [bundleId, status] as const;
        }
      })
    );

    return Object.fromEntries(entries);
  }

  async clearBundle(bundleId: string) {
    const cacheNames = OFFLINE_BUNDLES[bundleId];
    if (!cacheNames || !("caches" in window)) return;

    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    this.inMemoryBundleState.set(bundleId, {
      bundleId,
      cacheNames,
      state: "idle",
      progress: 0,
      sizeBytes: 0,
      itemCount: 0,
      lastUpdatedAt: Date.now(),
    });

    this.notify();
  }

  async clearAll() {
    if (!("caches" in window)) return;

    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    this.notify();
  }

  async downloadBundle(bundleId: string) {
    const current = this.inMemoryBundleState.get(bundleId);
    this.inMemoryBundleState.set(bundleId, {
      ...current,
      bundleId,
      cacheNames: OFFLINE_BUNDLES[bundleId] ?? [],
      state: "downloading",
      progress: 0,
      error: undefined,
      lastUpdatedAt: Date.now(),
    });
    this.notify();

    if (bundleId === "quran") {
      await this.prefetchQuranPages();
    }

    this.inMemoryBundleState.set(bundleId, {
      ...this.inMemoryBundleState.get(bundleId),
      state: "ready",
      progress: 100,
      lastUpdatedAt: Date.now(),
    });
    this.notify();
  }

  async refresh() {
    this.notify();
  }

  private async prefetchQuranPages() {
    if (!("caches" in window)) return;

    const cache = await caches.open("quran-pages-cache");
    const totalPages = 604;

    for (let page = 1; page <= totalPages; page += 1) {
      const pagePath = `/quran-images/pages/page${String(page).padStart(3, "0")}.png`;
      const request = new Request(pagePath, { method: "GET" });
      try {
        await cache.add(request);
      } catch {
        // Continue best-effort caching.
      }

      const progress = Math.round((page / totalPages) * 100);
      this.inMemoryBundleState.set("quran", {
        ...this.inMemoryBundleState.get("quran"),
        bundleId: "quran",
        cacheNames: OFFLINE_BUNDLES.quran,
        state: "downloading",
        progress,
        lastUpdatedAt: Date.now(),
      });
    }
  }
}

export const offlineOrchestrator = new OfflineOrchestrator();
