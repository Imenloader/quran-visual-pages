import React, { useState, useEffect } from "react";
import { DownloadCloud, CheckCircle2, Loader2, Trash2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { getQuranPageImageUrl, toArabicNumber } from "@/data/quranData";

const CACHE_NAME = 'quran-pages-cache';
const TOTAL_PAGES = 604;

const OfflineManager: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
      toast.error("يرجى الاتصال بالإنترنت لبدء التجهيز");
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    let count = 0;

    try {
      const cache = await caches.open(CACHE_NAME);
      
      // Download in batches to avoid overwhelming the browser
      const batchSize = 10;
      for (let i = 1; i <= TOTAL_PAGES; i += batchSize) {
        const batch = [];
        for (let j = i; j < i + batchSize && j <= TOTAL_PAGES; j++) {
          const url = getQuranPageImageUrl(j);
          batch.push(
            cache.add(url)
              .then(() => {
                count++;
                setDownloadedCount(prev => Math.max(prev, count));
                setProgress(Math.round((count / TOTAL_PAGES) * 100));
              })
              .catch(err => console.error(`Failed to download page ${j}:`, err))
          );
        }
        await Promise.all(batch);
      }
      
      toast.success("تم تجهيز جميع الصفحات بنجاح للقراءة دون اتصال");
      await checkCacheStatus();
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("حدث خطأ أثناء التجهيز. يرجى المحاولة مرة أخرى");
    } finally {
      setIsDownloading(false);
    }
  };

  const clearCache = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع الصفحات المحملة؟ ستحتاج للإنترنت لقراءتها مجدداً.")) return;
    
    try {
      await caches.delete(CACHE_NAME);
      setDownloadedCount(0);
      setProgress(0);
      toast.success("تم حذف البيانات بنجاح");
    } catch (error) {
      toast.error("فشل حذف البيانات");
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
          <span className="text-xs font-serif font-bold text-primary/60">
            {isOnline ? "متصل بالإنترنت" : "أنت الآن في وضع عدم الاتصال"}
          </span>
        </div>
        
        <div className="text-left">
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
            {toArabicNumber(downloadedCount)} / {toArabicNumber(TOTAL_PAGES)} صفحة
          </span>
        </div>
      </div>

      <div className="relative h-3 bg-primary/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(downloadedCount / TOTAL_PAGES) * 100}%` }}
          className="absolute inset-y-0 right-0 bg-accent shadow-accent-glow"
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
                جاري التجهيز... {toArabicNumber(progress)}%
              </>
            ) : (
              <>
                <DownloadCloud size={20} />
                تجهيز المصحف للقراءة دون اتصال (Offline)
              </>
            )}
          </motion.button>
        ) : (
          <div className="h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-3 text-emerald-600 font-serif font-bold">
            <CheckCircle2 size={20} />
            المصحف جاهز بالكامل للقراءة دون اتصال
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={clearCache}
          className="h-14 rounded-2xl border-2 border-red-200 text-red-500 font-serif font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-3"
        >
          <Trash2 size={20} />
          حذف البيانات المحملة
        </motion.button>
      </div>

      <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 flex items-start gap-3">
        <AlertCircle size={18} className="text-gold shrink-0 mt-0.5" />
        <p className="text-[11px] text-primary/70 font-serif leading-relaxed italic">
          تجهيز المصحف للقراءة دون اتصال يتطلب مساحة تخزين تقريبية (١٥٠ ميجابايت) في متصفحك.
        </p>
      </div>
    </div>
  );
};

export default OfflineManager;
