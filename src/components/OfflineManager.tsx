import React, { useState, useEffect } from "react";
import { DownloadCloud, CheckCircle2, Loader2, Trash2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { getQuranPageImageUrl, getQuranPageFallbackImageUrl, toArabicNumber } from "@/data/quranData";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOffline } from "@/contexts/OfflineContext";

const CACHE_NAME = 'quran-pages-cache';
const TOTAL_PAGES = 604;

const OfflineManager: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { refreshStatus } = useOffline();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    checkCacheStatus();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkCacheStatus = async () => {
    if (!('caches' in window)) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      setDownloadedCount(keys.length);
    } catch (error) {
      console.error("Error checking cache status:", error);
    }
  };

  const downloadAllPages = async () => {
    if (!isOnline) {
      toast.error(t("hub.offline.connectToStart"));
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    let count = 0;
    let failedCount = 0;

    try {
      if (!('caches' in window)) {
        toast.error("ميزة التخزين المؤقت غير مدعومة في هذا المتصفح");
        return;
      }
      const cache = await caches.open(CACHE_NAME);
      
      const downloadPage = async (page: number, retries = 3) => {
        const localUrl = getQuranPageImageUrl(page, true);
        const fallbackUrl = getQuranPageFallbackImageUrl(page, 0, true);
        
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            // Try local first
            let response = await fetch(localUrl);
            
            // If local fails (404), try fallback
            if (!response.ok) {
              console.log(`Local page ${page} not found, trying fallback...`);
              response = await fetch(fallbackUrl);
            }

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            // Cache the response under the local URL key
            await cache.put(localUrl, response);
            return true;
          } catch (err) {
            if (err instanceof Error && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
              throw err; // Re-throw quota error to catch it in the main block
            }
            if (attempt === retries) {
              console.error(`Failed to download page ${page} after ${retries} attempts:`, err);
              return false;
            }
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
          }
        }
        return false;
      };

      // Download in batches to avoid overwhelming the browser
      const batchSize = 3; // Further reduced batch size for better stability on mobile
      for (let i = 1; i <= TOTAL_PAGES; i += batchSize) {
        if (!navigator.onLine) throw new Error("Disconnected");
        
        const batch = [];
        for (let j = i; j < i + batchSize && j <= TOTAL_PAGES; j++) {
          batch.push(
            downloadPage(j)
              .then(success => {
                count++;
                if (!success) failedCount++;
                setDownloadedCount(prev => Math.max(prev, count));
                setProgress(Math.round((count / TOTAL_PAGES) * 100));
              })
          );
        }
        await Promise.all(batch);
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      if (failedCount > 0) {
        toast.warning(t("hub.offline.downloadFailed", { count: i18n.language === 'ar' ? toArabicNumber(failedCount) : failedCount }));
      } else {
        toast.success(t("hub.offline.ready"));
      }
      await checkCacheStatus();
      await refreshStatus();
    } catch (error) {
      console.error("Download failed:", error);
      if (error instanceof Error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        toast.error("مساحة التخزين ممتلئة. يرجى توفير مساحة في جهازك.");
      } else if (error instanceof Error && error.message === "Disconnected") {
        toast.error(t("hub.offline.offlineStatus"));
      } else {
        toast.error(t("hub.offline.clearError"));
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const clearCache = async () => {
    try {
      await caches.delete(CACHE_NAME);
      setDownloadedCount(0);
      setProgress(0);
      await refreshStatus();
      toast.success(t("hub.offline.clearSuccess"));
    } catch (error) {
      toast.error(t("hub.offline.clearError"));
    } finally {
      setIsAlertOpen(false);
    }
  };

  const isFullyDownloaded = downloadedCount >= TOTAL_PAGES;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Wifi size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <WifiOff size={16} />
            </div>
          )}
          <span className="text-xs font-serif font-bold text-primary/80">
            {isOnline ? t("hub.offline.onlineStatus") : t("hub.offline.offlineStatus")}
          </span>
        </div>
        
        <div className="text-left">
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
            {i18n.language === 'ar' ? toArabicNumber(downloadedCount) : downloadedCount} / {i18n.language === 'ar' ? toArabicNumber(TOTAL_PAGES) : TOTAL_PAGES} {t("hub.offline.pages")}
          </span>
        </div>
      </div>

      <div className="relative h-3 bg-primary/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(downloadedCount / TOTAL_PAGES) * 100}%` }}
          className={`absolute inset-y-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} bg-accent shadow-accent-glow`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!isFullyDownloaded ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadAllPages}
            disabled={isDownloading}
            className={`h-14 rounded-2xl flex items-center justify-center gap-3 font-serif font-bold transition-all shadow-lg ${
              isDownloading 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-emerald-deep text-gold hover:shadow-emerald-deep/20"
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {t("hub.offline.downloading", { progress: i18n.language === 'ar' ? toArabicNumber(progress) : progress })}
              </>
            ) : (
              <>
                <DownloadCloud size={20} />
                {t("hub.offline.downloadAll")}
              </>
            )}
          </motion.button>
        ) : (
          <div className="h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-3 text-emerald-600 font-serif font-bold">
            <CheckCircle2 size={20} />
            {t("hub.offline.ready")}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAlertOpen(true)}
          className="h-14 rounded-2xl border-2 border-red-200 text-red-500 font-serif font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-3"
        >
          <Trash2 size={20} />
          {t("hub.offline.deleteData")}
        </motion.button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-primary/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              {i18n.language === 'ar' ? "مسح البيانات المخزنة؟" : "Clear cached data?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-serif">
              {t("hub.offline.clearConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 rounded-xl h-12 border-primary/10 font-serif">
              {i18n.language === 'ar' ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={clearCache}
              className="flex-1 rounded-xl h-12 bg-red-500 hover:bg-red-600 text-white font-serif"
            >
              {i18n.language === 'ar' ? "نعم، مسح" : "Yes, clear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 flex items-start gap-3">
        <AlertCircle size={18} className="text-gold shrink-0 mt-0.5" />
        <p className={`text-[11px] text-primary/90 font-serif leading-relaxed italic ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
          {t("hub.offline.storageInfo")}
        </p>
      </div>
    </div>
  );
};

export default OfflineManager;
