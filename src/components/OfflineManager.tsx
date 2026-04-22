import React, { useState, useEffect } from "react";
import { DownloadCloud, CheckCircle2, Loader2, Trash2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { toArabicNumber } from "@/data/quranData";
import { useTranslation } from "react-i18next";
import { offlineOrchestrator } from "@/services/offlineOrchestrator";
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

const TOTAL_PAGES = 604;

const OfflineManager: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const bootstrap = async () => {
      try {
        const status = await offlineOrchestrator.getBundleStatus("quran-pages");
        setDownloadedCount(status.completed);
        setProgress(status.progress);
        setFailedCount(status.failed);
        setIsDownloading(status.state === "running");
      } catch (error) {
        console.error("Failed to bootstrap offline status:", error);
      }
    };

    void bootstrap();

    const unsubscribe = offlineOrchestrator.subscribe((event) => {
      if (event.bundleId !== "quran-pages" || !event.bundleStatus) {
        return;
      }

      const bundleStatus = event.bundleStatus;
      setDownloadedCount(bundleStatus.completed);
      setProgress(bundleStatus.progress);
      setFailedCount(bundleStatus.failed);
      setIsDownloading(bundleStatus.state === "running");

      if (bundleStatus.state === "completed") {
        toast.success(t("hub.offline.ready"));
      } else if (bundleStatus.state === "error") {
        toast.warning(
          t("hub.offline.downloadFailed", {
            count: i18n.language === "ar" ? toArabicNumber(bundleStatus.failed) : bundleStatus.failed,
          }),
        );
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [i18n.language, t]);

  const downloadAllPages = async () => {
    if (!isOnline) {
      toast.error(t("hub.offline.connectToStart"));
      return;
    }

    try {
      const status = await offlineOrchestrator.getBundleStatus("quran-pages");
      if (status.state === "paused") {
        await offlineOrchestrator.resumeBundle("quran-pages");
      } else {
        await offlineOrchestrator.prepareBundle("quran-pages");
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(t("hub.offline.clearError"));
    }
  };

  const clearCache = async () => {
    try {
      await offlineOrchestrator.clearBundle("quran-pages");
      setDownloadedCount(0);
      setProgress(0);
      setFailedCount(0);
      setIsDownloading(false);
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
            {i18n.language === "ar" ? toArabicNumber(downloadedCount) : downloadedCount} / {i18n.language === "ar" ? toArabicNumber(TOTAL_PAGES) : TOTAL_PAGES} {t("hub.offline.pages")}
          </span>
          {failedCount > 0 && (
            <p className="text-[9px] text-red-500 mt-1">{t("hub.offline.downloadFailed", { count: i18n.language === "ar" ? toArabicNumber(failedCount) : failedCount })}</p>
          )}
        </div>
      </div>

      <div className="relative h-3 bg-primary/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(downloadedCount / TOTAL_PAGES) * 100}%` }}
          className={`absolute inset-y-0 ${i18n.language === "ar" ? "right-0" : "left-0"} bg-accent shadow-accent-glow`}
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
                {t("hub.offline.downloading", { progress: i18n.language === "ar" ? toArabicNumber(progress) : progress })}
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
              {i18n.language === "ar" ? "مسح البيانات المخزنة؟" : "Clear cached data?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-serif">
              {t("hub.offline.clearConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 rounded-xl h-12 border-primary/10 font-serif">
              {i18n.language === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={clearCache}
              className="flex-1 rounded-xl h-12 bg-red-500 hover:bg-red-600 text-white font-serif"
            >
              {i18n.language === "ar" ? "نعم، مسح" : "Yes, clear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 flex items-start gap-3">
        <AlertCircle size={18} className="text-gold shrink-0 mt-0.5" />
        <p className={`text-[11px] text-primary/90 font-serif leading-relaxed italic ${i18n.language === "ar" ? "text-right" : "text-left"}`}>
          {t("hub.offline.storageInfo")}
        </p>
      </div>
    </div>
  );
};

export default OfflineManager;
