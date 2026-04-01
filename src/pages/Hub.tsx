import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { 
  Compass, 
  Fingerprint, 
  Calculator, 
  Heart, 
  Calendar, 
  MapPin, 
  BookOpen, 
  CheckCircle2, 
  Search, 
  Download,
  LayoutGrid,
  Headphones,
  Sparkles,
  DownloadCloud,
  Loader2,
  Pause,
  Play,
  Zap,
  Moon,
  Shield,
  Music,
  ChevronRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ReadingProgress from "@/components/ReadingProgress";
import ScrollReveal from "@/components/ScrollReveal";
import { dailyVerses } from "@/data/dailyVersesData";
import { juzData, toArabicNumber, getQuranPageImageUrl } from "@/data/quranData";
import { useFavorites } from "@/hooks/useFavorites";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

interface Moshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  surah_list: string;
}

interface Reciter {
  id: number;
  name: string;
  letter: string;
  moshaf: Moshaf[];
}

const Hub = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { playSurah: globalPlaySurah } = useAudioPlayer();
  const [verseOfDay, setVerseOfDay] = useState<{ text: string; surah: string; number: number } | null>(null);
  
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loadingReciters, setLoadingReciters] = useState(true);
  
  const [downloadAllState, setDownloadAllState] = useState<"idle" | "downloading" | "paused" | "done">(() => {
    const saved = localStorage.getItem("quran-download-all-state");
    if (saved === "idle" || saved === "downloading" || saved === "paused" || saved === "done") {
      return saved;
    }
    return "idle";
  });
  const [downloadAllProgress, setDownloadAllProgress] = useState(() => {
    const saved = localStorage.getItem("quran-download-all-progress");
    return saved ? parseInt(saved) : 0;
  });
  const dlAbortRef = useRef<AbortController | null>(null);
  const dlLoadedRef = useRef(() => {
    const saved = localStorage.getItem("quran-download-all-loaded");
    return saved ? parseInt(saved) : 0;
  });

  const totalPages = 604;

  useEffect(() => {
    // Fetch verse of the day
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % dailyVerses.length;
    const verse = dailyVerses[index];
    setVerseOfDay({ text: verse.text, surah: verse.surah, number: verse.number });
  }, []);

  useEffect(() => {
    const fetchReciters = async () => {
      try {
        const response = await fetch("https://mp3quran.net/api/v3/reciters?language=ar");
        const data = await response.json() as { reciters: Reciter[] };
        const sortedReciters = data.reciters.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        setReciters(sortedReciters);
        setLoadingReciters(false);
      } catch (error) {
        console.error("Error fetching reciters:", error);
        setLoadingReciters(false);
      }
    };
    fetchReciters();
  }, []);

  const handleQuickPlay = (reciterName: string, surahNumber: number) => {
    const reciter = reciters.find((r) => r.name.includes(reciterName));
    if (reciter) {
      globalPlaySurah(surahNumber, reciter.id.toString(), reciter.name);
    } else {
      navigate("/recitations");
    }
  };

  useEffect(() => {
    localStorage.setItem("quran-download-all-state", downloadAllState);
  }, [downloadAllState]);

  useEffect(() => {
    localStorage.setItem("quran-download-all-progress", downloadAllProgress.toString());
  }, [downloadAllProgress]);

  const downloadAll = useCallback(async () => {
    if (downloadAllState === "downloading") return;
    const startFrom = typeof dlLoadedRef.current === "function" ? dlLoadedRef.current() : dlLoadedRef.current;
    setDownloadAllState("downloading");
    const controller = new AbortController();
    dlAbortRef.current = controller;
    let loaded = startFrom;
    setDownloadAllProgress(Math.round((loaded / totalPages) * 100));
    const batchSize = 4; // Reduced batch size for better stability
    const juzDownloadState = JSON.parse(localStorage.getItem("juz-download-state") || "{}");

    const fetchWithRetry = async (url: string, retries = 3): Promise<Response> => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, { cache: "force-cache", signal: controller.signal });
          if (res.ok) return res;
        } catch (err) {
          if (controller.signal.aborted) throw err;
          console.warn(`Retry ${i + 1} for ${url}`);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      throw new Error(`Failed after ${retries} retries`);
    };

    try {
      for (let i = startFrom + 1; i <= totalPages; i += batchSize) {
        if (controller.signal.aborted) break;
        const batch = Array.from({ length: Math.min(batchSize, totalPages - i + 1) }, (_, k) => i + k);
        
        await Promise.all(
          batch.map(async (page) => {
            try {
              const res = await fetchWithRetry(getQuranPageImageUrl(page));
              await res.blob();
              loaded++;
              dlLoadedRef.current = loaded;
              localStorage.setItem("quran-download-all-loaded", loaded.toString());
              setDownloadAllProgress(Math.round((loaded / totalPages) * 100));

              juzData.forEach(j => {
                if (page >= j.startPage && page <= j.endPage) {
                  if (page === j.endPage) {
                    juzDownloadState[j.number] = true;
                    localStorage.setItem("juz-download-state", JSON.stringify(juzDownloadState));
                  }
                }
              });
            } catch (err) {
              if (!controller.signal.aborted) {
                console.error(`Failed to download page ${page}:`, err);
              }
            }
          })
        );
      }
      
      if (!controller.signal.aborted && loaded >= totalPages) {
        setDownloadAllState("done");
        dlLoadedRef.current = 0;
        localStorage.setItem("quran-download-all-loaded", "0");
        const finalState = juzData.reduce((acc, j) => ({ ...acc, [j.number]: true }), {});
        localStorage.setItem("juz-download-state", JSON.stringify(finalState));
        setTimeout(() => setDownloadAllState("idle"), 5000);
      } else if (controller.signal.aborted) {
        setDownloadAllState("paused");
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("Download all error:", error);
        setDownloadAllState("paused");
      }
    }
  }, [downloadAllState]);

  const pauseDownload = useCallback(() => {
    dlAbortRef.current?.abort();
    setDownloadAllState("paused");
  }, []);

  const categories = [
    {
      title: t("hub.spiritual"),
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      tools: [
        { name: t("nav.recitations"), icon: <Headphones className="w-5 h-5" />, path: "/recitations" },
        { name: t("hub.prayerTimes"), icon: <Zap className="w-5 h-5" />, path: "/prayer-times" },
        { name: t("hub.qibla"), icon: <Compass className="w-5 h-5" />, path: "/qibla" },
        { name: t("hub.tasbih"), icon: <Fingerprint className="w-5 h-5" />, path: "/tasbih" },
        { name: t("hub.zakat"), icon: <Calculator className="w-5 h-5" />, path: "/zakat" },
        { name: t("hub.namesOfAllah"), icon: <Heart className="w-5 h-5" />, path: "/names-of-allah" },
      ]
    },
    {
      title: t("hub.planning"),
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      tools: [
        { name: t("hub.khatma"), icon: <BookOpen className="w-5 h-5" />, path: "/khatma" },
        { name: "سنن الجمعة", icon: <Sparkles className="w-5 h-5" />, path: "/friday-sunan" },
        { name: t("hub.prayerTracker"), icon: <CheckCircle2 className="w-5 h-5" />, path: "/prayer-tracker" },
        { name: t("hub.qiyam"), icon: <Moon className="w-5 h-5" />, path: "/embed/qiyam" },
        { name: t("hub.khatma_external"), icon: <BookOpen className="w-5 h-5" />, path: "/embed/khatma" },
      ]
    },
    {
      title: t("hub.location"),
      icon: <MapPin className="w-5 h-5 text-blue-500" />,
      tools: [
        { name: t("hub.mosqueFinder"), icon: <MapPin className="w-5 h-5" />, path: "/mosque-finder" },
        { name: t("hub.halalPlaces"), icon: <MapPin className="w-5 h-5" />, path: "/halal-places" },
      ]
    },
    {
      title: t("hub.knowledge"),
      icon: <BookOpen className="w-5 h-5 text-amber-500" />,
      tools: [
        { name: t("hub.hijri"), icon: <Calendar className="w-5 h-5" />, path: "/hijri" },
        { name: t("hub.dailyVerse"), icon: <BookOpen className="w-5 h-5" />, path: "/daily-verse" },
        { name: t("hub.tafsir"), icon: <BookOpen className="w-5 h-5" />, path: "/tafsir" },
        { name: t("hub.search"), icon: <Search className="w-5 h-5" />, path: "/search" },
        { name: t("hub.tajweed"), icon: <Sparkles className="w-5 h-5" />, path: "/tajweed" },
        { name: t("hub.guide"), icon: <BookOpen className="w-5 h-5" />, path: "/how-to-use" },
      ]
    },
    {
      title: t("hub.technical"),
      icon: <Download className="w-5 h-5 text-indigo-500" />,
      tools: [
        { name: t("hub.offline.title"), icon: <Download className="w-5 h-5" />, path: "/offline" },
        { name: t("hub.install"), icon: <Shield className="w-5 h-5" />, path: "/install" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-deep/5 blur-3xl rounded-full -z-10" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-deep/10 text-emerald-deep mb-6 shadow-islamic relative group"
          >
            <div className="absolute inset-0 bg-emerald-deep/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <LayoutGrid className="w-10 h-10 relative z-10" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold font-naskh text-foreground tracking-tight">{t("hub.title")}</h1>
          <p className="text-lg text-muted-foreground font-naskh mt-3 max-w-md mx-auto opacity-80">{t("hub.subtitle")}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Progress & Offline */}
          <div className="lg:col-span-4 space-y-8">
            <ScrollReveal>
              <section className="bento-card !p-8 bg-card/40 backdrop-blur-2xl border border-border/40 shadow-islamic h-fit hover:shadow-emerald-deep/5 transition-all duration-500">
                <ReadingProgress />
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section
                className={`bento-card !p-8 border-none relative overflow-hidden group shadow-islamic transition-all duration-500 ${
                  downloadAllState === "done" 
                    ? "!bg-emerald-deep text-white shadow-emerald-500/20" 
                    : "!bg-accent/5 text-accent-foreground shadow-accent/5 border border-accent/10"
                }`}
              >
                <div className="absolute inset-0 pattern-islamic opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`p-4 rounded-2xl shadow-inner ${downloadAllState === "done" ? "bg-white/10" : "bg-accent/10"}`}>
                      <DownloadCloud strokeWidth={1.5} className={`size-[24px] ${downloadAllState === "done" ? "text-white" : "text-accent"}`} />
                    </div>
                    {downloadAllState === "downloading" && (
                      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/5 backdrop-blur-sm border border-black/5 animate-pulse">
                        <Loader2 className="size-[12px] animate-spin text-accent" />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-accent">{t("hub.offline.downloading")}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`font-serif text-2xl font-medium mb-3 ${downloadAllState === "done" ? "text-white" : "text-foreground"}`}>
                    {downloadAllState === "done" ? t("hub.offline.ready") : t("hub.offline.title")}
                  </h3>
                  <p className={`text-sm font-naskh leading-relaxed mb-8 ${downloadAllState === "done" ? "text-white/90" : "text-muted-foreground"}`}>
                    {downloadAllState === "done" 
                      ? t("hub.offline.readyDesc")
                      : t("hub.offline.notReadyDesc")}
                  </p>
                  
                  {downloadAllState === "idle" ? (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={downloadAll}
                      className="w-full py-4 rounded-2xl bg-accent text-white hover:bg-accent/90 transition-all font-serif font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-accent/20"
                    >
                      <DownloadCloud size={20} />
                      {t("hub.offline.download")}
                    </motion.button>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className={`flex justify-between text-[11px] font-bold tracking-widest uppercase ${downloadAllState === "done" ? "text-white" : "text-muted-foreground"}`}>
                          <span>{t("hub.offline.progress")}: {i18n.language === "ar" ? toArabicNumber(downloadAllProgress) : downloadAllProgress}%</span>
                          <span>{i18n.language === "ar" ? toArabicNumber(Math.round((downloadAllProgress / 100) * 604)) : Math.round((downloadAllProgress / 100) * 604)} / {i18n.language === "ar" ? toArabicNumber(604) : 604}</span>
                        </div>
                        <div className="h-2.5 bg-black/5 rounded-full overflow-hidden p-0.5 border border-black/5">
                          <motion.div 
                            className={`h-full rounded-full ${downloadAllState === "done" ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]" : "bg-accent shadow-[0_0_15px_rgba(16,185,129,0.4)]"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${downloadAllProgress}%` }}
                            transition={{ type: "spring", bounce: 0, duration: 1 }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        {downloadAllState === "downloading" ? (
                          <button 
                            onClick={pauseDownload}
                            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-serif text-sm flex items-center justify-center gap-2 border border-white/10 text-white"
                          >
                            <Pause size={16} />
                            {t("hub.offline.pause")}
                          </button>
                        ) : downloadAllState === "paused" ? (
                          <button 
                            onClick={downloadAll}
                            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-serif text-sm flex items-center justify-center gap-2 border border-white/10 text-white"
                          >
                            <Play size={16} />
                            {t("hub.offline.resume")}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </ScrollReveal>
          </div>

          {/* Right Column: Categories & Reciters */}
          <div className="lg:col-span-8 space-y-12">
            {/* Quick Recitations Section */}
            <ScrollReveal delay={0.2}>
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-sm border border-purple-500/10">
                      <Music className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-naskh text-foreground">{t("hub.quickRecitations")}</h2>
                      <p className="text-sm text-muted-foreground font-naskh">{t("index.quickRecitations.subtitle")}</p>
                    </div>
                  </div>
                  <Link to="/recitations" className="group flex items-center gap-1 text-sm font-bold text-accent hover:text-accent/80 transition-colors font-naskh">
                    {t("index.quickRecitations.viewAll")}
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[
                    { name: "سورة يس", reciter: "مشاري العفاسي", id: 36 },
                    { name: "سورة الملك", reciter: "عبد الباسط عبد الصمد", id: 67 },
                    { name: "سورة الكهف", reciter: "سعد الغامدي", id: 18 },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4 }}
                      onClick={() => handleQuickPlay(item.reciter, item.id)}
                      className="p-5 rounded-[2rem] bg-card/50 hover:bg-card border border-border/40 flex items-center justify-between group cursor-pointer transition-all shadow-sm hover:shadow-md hover:border-accent/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
                          <Play size={18} fill="currentColor" />
                        </div>
                        <div>
                          <div className="font-bold text-base text-foreground font-naskh group-hover:text-accent transition-colors">{item.name}</div>
                          <div className="text-xs text-muted-foreground font-naskh opacity-80">{item.reciter}</div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-all">
                        <Zap size={16} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </ScrollReveal>

            {/* Tools Grid */}
            <div className="space-y-12">
              {categories.map((category, idx) => (
                <ScrollReveal key={category.title} delay={0.4 + idx * 0.1}>
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center shadow-sm border border-border/40">
                        {category.icon}
                      </div>
                      <h2 className="text-2xl font-bold font-naskh text-foreground">{category.title}</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                      {category.tools.map((tool) => {
                        const isExternal = tool.path.startsWith('http');
                        const Content = (
                          <motion.div
                            whileHover={{ y: -4, scale: 1.02 }}
                            className="p-6 rounded-[2.5rem] bg-card border border-border/60 flex flex-col items-center text-center group transition-all hover:shadow-xl hover:border-accent/20 h-full"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-accent/10 group-hover:text-accent transition-all duration-300 shadow-inner">
                              {tool.icon}
                            </div>
                            <span className="font-bold text-sm font-naskh text-foreground group-hover:text-accent transition-colors">
                              {tool.name}
                            </span>
                          </motion.div>
                        );

                        return isExternal ? (
                          <a key={tool.name} href={tool.path} target="_blank" rel="noopener noreferrer">
                            {Content}
                          </a>
                        ) : (
                          <Link key={tool.name} to={tool.path}>
                            {Content}
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hub;
