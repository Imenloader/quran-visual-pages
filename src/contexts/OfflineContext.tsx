import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { offlineOrchestrator, type OfflineBundleStatus } from "@/services/offlineOrchestrator";

interface OfflineContextValue {
  isOnline: boolean;
  bundles: Record<string, OfflineBundleStatus>;
  storageUsageBytes: number;
  storageQuotaBytes: number;
  lastSyncedAt: number;
  refresh: () => Promise<void>;
  downloadBundle: (bundleId: string) => Promise<void>;
  clearBundle: (bundleId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [bundles, setBundles] = useState<Record<string, OfflineBundleStatus>>({});
  const [storageUsageBytes, setStorageUsageBytes] = useState(0);
  const [storageQuotaBytes, setStorageQuotaBytes] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(0);

  useEffect(() => {
    const unsubscribe = offlineOrchestrator.subscribe((snapshot) => {
      setIsOnline(snapshot.isOnline);
      setBundles(snapshot.bundles);
      setStorageUsageBytes(snapshot.storageUsageBytes);
      setStorageQuotaBytes(snapshot.storageQuotaBytes);
      setLastSyncedAt(snapshot.lastSyncedAt);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const syncFromSwEvent = () => {
      offlineOrchestrator.refresh();
    };

    const handleServiceWorkerMessage = () => {
      syncFromSwEvent();
    };

    const workboxBroadcast = "BroadcastChannel" in window ? new BroadcastChannel("workbox") : null;
    const offlineBroadcast = "BroadcastChannel" in window ? new BroadcastChannel("offline-cache") : null;

    const handleBroadcastMessage = () => {
      syncFromSwEvent();
    };

    workboxBroadcast?.addEventListener("message", handleBroadcastMessage);
    offlineBroadcast?.addEventListener("message", handleBroadcastMessage);

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    }

    const handleOnline = () => {
      setIsOnline(true);
      syncFromSwEvent();
    };
    const handleOffline = () => {
      setIsOnline(false);
      syncFromSwEvent();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      workboxBroadcast?.removeEventListener("message", handleBroadcastMessage);
      offlineBroadcast?.removeEventListener("message", handleBroadcastMessage);
      workboxBroadcast?.close();
      offlineBroadcast?.close();

      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const value = useMemo<OfflineContextValue>(
    () => ({
      isOnline,
      bundles,
      storageUsageBytes,
      storageQuotaBytes,
      lastSyncedAt,
      refresh: () => offlineOrchestrator.refresh(),
      downloadBundle: (bundleId: string) => offlineOrchestrator.downloadBundle(bundleId),
      clearBundle: (bundleId: string) => offlineOrchestrator.clearBundle(bundleId),
      clearAll: () => offlineOrchestrator.clearAll(),
    }),
    [isOnline, bundles, storageUsageBytes, storageQuotaBytes, lastSyncedAt]
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

const useOfflineContext = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("Offline hooks must be used within OfflineProvider");
  }
  return context;
};

export const useOfflineStatus = () => {
  const { isOnline, storageUsageBytes, storageQuotaBytes, lastSyncedAt } = useOfflineContext();
  return { isOnline, storageUsageBytes, storageQuotaBytes, lastSyncedAt };
};

export const useOfflineBundle = (bundleId: string) => {
  const { bundles } = useOfflineContext();
  return bundles[bundleId] ?? null;
};

export const useOfflineActions = () => {
  const { refresh, downloadBundle, clearBundle, clearAll } = useOfflineContext();
  return { refresh, downloadBundle, clearBundle, clearAll };
};
