import React, { useState, useEffect } from "react";
import { DownloadCloud, Loader2, Trash2, Music } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SURAHS } from "@/data/audioData";
import { fetchReciters, type Reciter, type Moshaf } from "@/services/quranService";
import { toArabicNumber } from "@/data/quranData";

const AUDIO_CACHE_NAME = 'quran-audio-cache';

const AudioDownloadManager: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [selectedMoshaf, setSelectedMoshaf] = useState<Moshaf | null>(null);
  const [downloadingSurah, setDownloadingSurah] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedSurahs, setCachedSurahs] = useState<string[]>([]);
  const [isLoadingReciters, setIsLoadingReciters] = useState(true);
  const [recitersError, setRecitersError] = useState<string | null>(null);

  const buildAudioUrl = (server: string, surahId: number) => {
    let base = (server || "").trim();
    if (base.startsWith("//")) base = `https:${base}`;
    if (base.startsWith("http://")) base = base.replace("http://", "https://");
    if (!base.startsWith("https://")) base = `https://${base}`;
    if (!base.endsWith("/")) base += "/";
    return `${base}${String(surahId).padStart(3, "0")}.mp3`;
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    fetchReciters()
      .then((items) => {
        setReciters(items);
        if (items.length === 0) {
          setRecitersError(t("hub.offline.fetchError"));
        }
      })
      .catch(() => setRecitersError(t("hub.offline.fetchError")))
      .finally(() => setIsLoadingReciters(false));

    checkCacheStatus();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkCacheStatus = async () => {
    if (!('caches' in window)) return;
    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const keys = await cache.keys();
      setCachedSurahs(keys.map(key => key.url));
    } catch (error) {
      console.error("Error checking cache status:", error);
    }
  };

  const downloadSurah = async (surahId: number) => {
    if (!selectedMoshaf) return;
    if (!navigator.onLine) {
      toast.error(t("hub.offline.connectToStart"));
      return;
    }

    const audioUrl = buildAudioUrl(selectedMoshaf.server, surahId);

    setDownloadingSurah(surahId);
    setDownloadProgress(0);

    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const response = await fetch(audioUrl);
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      // Since we can't easily track progress of a simple fetch, 
      // we'll simulate it for the UI until the file is stored.
      // For real progress, we'd need a readable stream.
      const reader = response.body?.getReader();
      const contentLength = +(response.headers.get('Content-Length') || 0);
      
      let receivedLength = 0;
      const chunks = [];
      
      if (reader && contentLength) {
        while(true) {
          const {done, value} = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedLength += value.length;
          setDownloadProgress(Math.round((receivedLength / contentLength) * 100));
        }
        
        const blob = new Blob(chunks);
        await cache.put(audioUrl, new Response(blob));
      } else {
        await cache.put(audioUrl, response);
      }

      toast.success(t("player.downloadComplete") || "تم تحميل السورة بنجاح");
      await checkCacheStatus();
    } catch (error) {
      console.error("Audio download failed:", error);
      toast.error(t("hub.offline.clearError"));
    } finally {
      setDownloadingSurah(null);
      setDownloadProgress(0);
    }
  };

  const deleteFromCache = async (url: string) => {
    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      await cache.delete(url);
      await checkCacheStatus();
      toast.success(t("hub.offline.clearSuccess"));
    } catch (error) {
      toast.error(t("hub.offline.clearError"));
    }
  };

  const isCached = (surahId: number) => {
    if (!selectedMoshaf) return false;
    const audioUrl = buildAudioUrl(selectedMoshaf.server, surahId);
    return cachedSurahs.includes(audioUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <label className="text-sm font-serif font-bold text-primary/80">{t("player.reciter")}</label>
        {isLoadingReciters && <p className="text-xs text-muted-foreground">{t("hub.offline.downloading", { progress: 0 })}</p>}
        {!isLoadingReciters && recitersError && <p className="text-xs text-destructive">{recitersError}</p>}
        <select 
          className="w-full h-12 rounded-xl bg-card border border-border/40 px-4 font-serif text-sm focus:ring-2 focus:ring-accent outline-none"
          disabled={isLoadingReciters || reciters.length === 0}
          onChange={(e) => {
            const r = reciters.find(rec => rec.id === parseInt(e.target.value));
            setSelectedReciter(r || null);
            setSelectedMoshaf(r?.moshaf[0] || null);
          }}
        >
          <option value="">{t("player.selectReciter") || "اختر القارئ"}</option>
          {reciters.map(rec => (
            <option key={rec.id} value={rec.id}>{rec.name}</option>
          ))}
        </select>
      </div>

      {selectedReciter && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {SURAHS.map(surah => {
            const cached = isCached(surah.id);
            const downloading = downloadingSurah === surah.id;
            
            return (
              <div key={surah.id} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-primary">{surah.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {cached ? "محملة وصالحة للاستماع أوفلاين" : "غير محملة"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {downloading ? (
                    <div className="flex flex-col items-end gap-1">
                      <Loader2 size={16} className="animate-spin text-accent" />
                      <span className="text-[8px] font-mono text-accent">{downloadProgress}%</span>
                    </div>
                  ) : cached ? (
                    <button 
                      onClick={() => {
                        if (!selectedMoshaf) return;
                        deleteFromCache(buildAudioUrl(selectedMoshaf.server, surah.id));
                      }}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => downloadSurah(surah.id)}
                      className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      disabled={!isOnline}
                    >
                      <DownloadCloud size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cachedSurahs.length > 0 && (
         <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-accent">
                <Music size={16} />
                <span className="text-xs font-bold font-serif">إحصائيات الملفات المحملة</span>
            </div>
            <p className="text-[10px] text-primary/70">
              لديك {i18n.language === 'ar' ? toArabicNumber(cachedSurahs.length) : cachedSurahs.length} سورة محملة في الذاكرة المؤقتة.
            </p>
         </div>
      )}
    </div>
  );
};

export default AudioDownloadManager;
