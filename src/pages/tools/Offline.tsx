import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DownloadCloud, Info, CheckCircle2, Trash2, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

const Offline = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [downloadedSize, setDownloadedSize] = useState("0 MB");
  const [quranCacheSize, setQuranCacheSize] = useState("0 MB");
  const [apiCacheSize, setApiCacheSize] = useState("0 MB");

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
  }, []);

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
        toast.success(t("hub.offline.clearSuccess"));
      } catch (err) {
        toast.error(t("hub.offline.clearError"));
      }
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
          </div>

          <div className="space-y-4">
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
