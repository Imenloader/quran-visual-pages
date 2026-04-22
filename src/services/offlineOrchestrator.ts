import { OFFLINE_BUNDLES, type OfflineBundleId } from "@/offline/offlineManifest";

export interface OfflineBundleStatus {
  bundleId: OfflineBundleId;
  cacheName: string;
  entries: number;
  maxEntries: number;
  percent: number;
}

export interface OfflineGlobalStatus {
  bundles: OfflineBundleStatus[];
  totalEntries: number;
  storageUsageBytes: number;
  storageQuotaBytes: number;
}

const getCacheEntries = async (cacheName: string) => {
  if (!("caches" in window)) return 0;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  return keys.length;
};

const normalizePercent = (entries: number, maxEntries: number) => {
  if (!maxEntries) return 0;
  return Math.min(100, Math.round((entries / maxEntries) * 100));
};

export const offlineOrchestrator = {
  async getBundleStatus(bundleId: OfflineBundleId): Promise<OfflineBundleStatus> {
    const config = OFFLINE_BUNDLES[bundleId];
    const entries = await getCacheEntries(config.cacheName);
    return {
      bundleId,
      cacheName: config.cacheName,
      entries,
      maxEntries: config.maxEntries,
      percent: normalizePercent(entries, config.maxEntries),
    };
  },

  async getGlobalStatus(): Promise<OfflineGlobalStatus> {
    const bundleIds = Object.keys(OFFLINE_BUNDLES) as OfflineBundleId[];
    const bundles = await Promise.all(bundleIds.map((id) => this.getBundleStatus(id)));
    const storage = "storage" in navigator && "estimate" in navigator.storage
      ? await navigator.storage.estimate()
      : { usage: 0, quota: 0 };

    return {
      bundles,
      totalEntries: bundles.reduce((sum, b) => sum + b.entries, 0),
      storageUsageBytes: storage.usage ?? 0,
      storageQuotaBytes: storage.quota ?? 0,
    };
  },

  async clearBundle(bundleId: OfflineBundleId) {
    if (!("caches" in window)) return false;
    const { cacheName } = OFFLINE_BUNDLES[bundleId];
    return caches.delete(cacheName);
  },

  async clearAllManagedBundles() {
    const bundleIds = Object.keys(OFFLINE_BUNDLES) as OfflineBundleId[];
    await Promise.all(bundleIds.map((id) => this.clearBundle(id)));
  },
};

