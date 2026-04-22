import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { offlineOrchestrator, type OfflineGlobalStatus } from "@/services/offlineOrchestrator";
import type { OfflineBundleId } from "@/offline/offlineManifest";

interface OfflineContextValue {
  isOnline: boolean;
  status: OfflineGlobalStatus | null;
  refreshStatus: () => Promise<void>;
  clearBundle: (bundleId: OfflineBundleId) => Promise<void>;
  clearAllBundles: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState<OfflineGlobalStatus | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const next = await offlineOrchestrator.getGlobalStatus();
      setStatus(next);
    } catch (error) {
      console.error("Failed to refresh offline status", error);
    }
  }, []);

  const clearBundle = useCallback(async (bundleId: OfflineBundleId) => {
    await offlineOrchestrator.clearBundle(bundleId);
    await refreshStatus();
  }, [refreshStatus]);

  const clearAllBundles = useCallback(async () => {
    await offlineOrchestrator.clearAllManagedBundles();
    await refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    refreshStatus();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refreshStatus]);

  const value = useMemo(() => ({
    isOnline,
    status,
    refreshStatus,
    clearBundle,
    clearAllBundles,
  }), [isOnline, status, refreshStatus, clearBundle, clearAllBundles]);

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error("useOffline must be used within OfflineProvider");
  return ctx;
};

