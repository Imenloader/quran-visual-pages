import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DownloadCloud, Info, CheckCircle2, Trash2, Database, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getQuranPageImageUrl, juzData, toArabicNumber as toArabicDigits } from "@/data/quranData";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";
import AudioDownloadManager from "@/components/AudioDownloadManager";
import { useOffline } from "@/contexts/OfflineContext";

const Offline = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [downloadedSize, setDownloadedSize] = useState("0 MB");
  const [quranCacheSize, setQuranCacheSize] = useState("0 MB");
  const [apiCacheSize, setApiCacheSize] = useState("0 MB");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { juzCompletion, refreshJuzCompletion } = useOffline();

  const toArabicNumber = (str: string) => {
    if (i18n.language !== 'ar') return str;
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (w) => arabicNumbers[parseInt(w)]);
  };

  const getCacheSize = async (cacheName: string) => {
    try {
      if (!window.caches) return 0;
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      let size = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          size += blob.size;
        }
      }
      return size;
    } catch (e) {
      console.warn(`Error calculating size for cache ${cacheName}:`, e);
      return 0;
    }
  };

  useEffect(() => {
    const checkStorage = async () => {
      try {
        if ("storage" in navigator && "estimate" in navigator.storage) {
          const { usage } = await navigator.storage.estimate();
          if (usage) {
            setDownloadedSize(`${(usage / (1024 * 1024)).toFixed(1)} MB`);
          }
        }

        // Calculate specific cache sizes
        const quranSize = await getCacheSize('quran-pages-cache');
        setQuranCacheSize(`${(quranSize / (1024 * 1024)).toFixed(1)} MB`);

        const apiSize = await getCacheSize('quran-api-cache');
        setApiCacheSize(`${(apiSize / (1024 * 1024)).toFixed(1)} MB`);
      } catch (e) {
        console.warn("Error checking storage:", e);
      }
    };
    checkStorage();
    if (refreshJuzCompletion) refreshJuzCompletion();
  }, [refreshJuzCompletion]);

  const clearCache = async () => {
    if (!window.caches) {
      toast.error("ميزة التخزين المؤقت غير مدعومة في هذا المتصفح");
      return;
    }
    if (confirm(t("hub.offline.clearConfirm"))) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        setDownloadedSize("0 MB");
        if (refreshJuzCompletion) await refreshJuzCompletion();
        toast.success(t("hub.offline.clearSuccess"));
      } catch (err) {
        toast.error(t("hub.offline.clearError"));
      }
    }
  };

  const { preferredImageSource, tajweedMode } = useTheme();

  const downloadAllPages = async () => {
    if (!window.caches) {
      toast.error("ميزة التخزين المؤقت غير مدعومة");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const cache = await caches.open('quran-pages-cache');
      const totalPages = 604;
      let downloadedCount = 0;

      // Download in batches of 5 to avoid overloading
      const batchSize = 5;
      for (let i = 1; i <= totalPages; i += batchSize) {
        const batch = [];
        for (let j = 0; j < batchSize && (i + j) <= totalPages; j++) {
          const pageNum = i + j;
          const url = getQuranPageImageUrl(pageNum, tajweedMode, preferredImageSource || undefined);
          batch.push(
            fetch(url, { mode: 'no-cors' }).then(async () => {
              await cache.add(url);
              downloadedCount++;
              setDownloadProgress(Math.round((downloadedCount / totalPages) * 100));
            }).catch(err => {
              console.error(`Failed to download page ${pageNum}:`, err);
              downloadedCount++;
            })
          );
        }
        await Promise.all(batch);
      }

      toast.success("تم تحميل جميع صفحات المصحف بنجاح");
      
      const usage = await navigator.storage.estimate();
      if (usage?.usage) setDownloadedSize(`${(usage.usage / (1024 * 1024)).toFixed(1)} MB`);
      const quranSize = await getCacheSize('quran-pages-cache');
      setQuranCacheSize(`${(quranSize / (1024 * 1024)).toFixed(1)} MB`);
      if (refreshJuzCompletion) await refreshJuzCompletion();

    } catch (err) {
      console.error("Download error:", err);
      toast.error("حدث خطأ أثناء التحميل");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <BackButton />
          <h1 className="text-xl font-bold font-serif">{t("hub.offline.title")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="space-y-6">
          <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-soft text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Database className="w-48 h-48 text-primary" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <DownloadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-serif">{t("hub.offline.usedSpace")}</p>
                <p className="text-4xl font-bold font-mono text-foreground">{i18n.language === 'ar' ? toArabicNumber(downloadedSize) : downloadedSize}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between group hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className={`space-y-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-sm font-bold font-serif text-foreground">{t("hub.offline.quran")}</h3>
                  <p className="text-[10px] text-muted-foreground font-serif">{t("hub.offline.quranDesc")}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-primary font-mono">{i18n.language === 'ar' ? toArabicNumber(quranCacheSize) : quranCacheSize}</span>
            </div>

            <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between group hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className={`space-y-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-sm font-bold font-serif text-foreground">{t("hub.offline.athkar")}</h3>
                  <p className="text-[10px] text-muted-foreground font-serif">{t("hub.offline.athkarDesc")}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-primary font-mono">{i18n.language === 'ar' ? toArabicNumber(apiCacheSize) : apiCacheSize}</span>
            </div>

            <div className="pt-4 border-t border-border/40">
              <button
                onClick={downloadAllPages}
                disabled={isDownloading}
                className={`w-full h-16 rounded-2xl bg-primary text-primary-foreground font-bold font-serif flex flex-col items-center justify-center transition-all shadow-lg hover:shadow-primary/20 ${isDownloading ? "opacity-70" : "hover:scale-[1.02]"}`}
              >
                {isDownloading ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>جاري التحميل... {toArabicNumber(downloadProgress.toString())}%</span>
                    </div>
                    <div className="w-48 h-1 bg-white/20 rounded-full mt-1">
                      <div className="h-full bg-white transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <DownloadCloud className="w-6 h-6" />
                    <div className="text-right">
                      <p>تحميل المصحف كاملاً</p>
                      <p className="text-[10px] font-normal opacity-80">للقراءة في أي وقت بدون إنترنت</p>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Audio Download Manager Section */}
          <div className="space-y-4">
            <div className="p-4 bg-card border border-border rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Music className="w-5 h-5" />
                </div>
                <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-sm font-bold font-serif text-foreground">التلاوات الصوتية</h3>
                  <p className="text-[10px] text-muted-foreground font-serif">إدارة تحميل التلاوات للاستماع بدون اتصال</p>
                </div>
              </div>
              <AudioDownloadManager />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-card border border-border rounded-2xl">
              <h3 className="text-sm font-bold font-serif mb-3">حالة الأجزاء للأوفلاين</h3>
              <div className="max-h-64 overflow-auto space-y-2 pr-1">
                {juzData.map((juz) => {
                  const pct = (juzCompletion && juzCompletion[juz.number]) ?? 0;
                  return (
                    <div key={juz.number} className="p-2 rounded-xl border border-border/50 bg-muted/20">
                      <div className="flex items-center justify-between text-xs font-serif mb-1">
                        <span>{juz.nameAr}</span>
                        <span className="font-mono">{i18n.language === 'ar' ? toArabicDigits(pct) : pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={clearCache}
              className="w-full h-14 rounded-2xl border-2 border-destructive/20 text-destructive font-bold font-serif hover:bg-destructive/5 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              {t("hub.offline.clearAll")}
            </button>

            <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex items-start gap-3">
              <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className={`text-xs text-muted-foreground font-serif leading-relaxed ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t("hub.offline.info")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offline;
