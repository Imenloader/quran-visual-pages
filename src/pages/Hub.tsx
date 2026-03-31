import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
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
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import ReadingProgress from "@/components/ReadingProgress";
import { dailyVerses } from "@/data/dailyVersesData";
import { juzData, toArabicNumber, getQuranPageImageUrl } from "@/data/quranData";

const Hub = () => {
  const { t, i18n } = useTranslation();
  const [verseOfDay, setVerseOfDay] = useState<{ text: string; surah: string; number: number } | null>(null);
  
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
    const batchSize = 6;
    const juzDownloadState = JSON.parse(localStorage.getItem("juz-download-state") || "{}");

    try {
      for (let i = startFrom + 1; i <= totalPages; i += batchSize) {
        if (controller.signal.aborted) break;
        const batch = Array.from({ length: Math.min(batchSize, totalPages - i + 1) }, (_, k) => i + k);
        await Promise.all(
          batch.map(async (page) => {
            try {
              const res = await fetch(getQuranPageImageUrl(page), { cache: "force-cache" });
              if (res.ok) await res.blob();
            } catch { /* skip */ }
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
          })
        );
      }
      if (!controller.signal.aborted) {
        setDownloadAllState("done");
        dlLoadedRef.current = 0;
        localStorage.setItem("quran-download-all-loaded", "0");
        const finalState = juzData.reduce((acc, j) => ({ ...acc, [j.number]: true }), {});
        localStorage.setItem("juz-download-state", JSON.stringify(finalState));
        setTimeout(() => setDownloadAllState("idle"), 5000);
      }
    } catch { /* aborted */ }
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
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-deep/10 text-emerald-deep mb-4"
          >
            <LayoutGrid className="w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl font-bold font-naskh text-foreground">{t("hub.title")}</h1>
          <p className="text-sm text-muted-foreground font-naskh mt-1">{t("hub.subtitle")}</p>
        </header>

        <div className="space-y-8">
          {/* Reading Progress Section */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bento-card !p-6 bg-card/40 backdrop-blur-2xl border border-border/40"
          >
            <ReadingProgress />
          </motion.section>

          {/* Quick Recitations Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 px-2">
                <Headphones className="w-5 h-5 text-purple-500" />
                <h2 className="font-bold font-naskh text-foreground">{t("hub.quickRecitations")}</h2>
              </div>
              <Link to="/recitations" className="text-xs text-accent hover:underline">{t("index.quickRecitations.viewAll")}</Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: "سورة يس", reciter: "مشاري العفاسي", id: 36 },
                { name: "سورة الملك", reciter: "عبد الباسط عبد الصمد", id: 67 },
                { name: "سورة الكهف", reciter: "سعد الغامدي", id: 18 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 5 }}
                  className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Play size={16} fill="currentColor" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-primary">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground font-naskh">{item.reciter}</div>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white transition-all">
                    <Zap size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Offline Access Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bento-card !p-6 border-none relative overflow-hidden group ${
              downloadAllState === "done" 
                ? "!bg-emerald-deep text-white shadow-emerald-500/20" 
                : "!bg-accent text-accent-foreground shadow-accent/20"
            }`}
          >
            <div className="absolute inset-0 pattern-islamic opacity-[0.05] group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl shadow-inner ${downloadAllState === "done" ? "bg-white/10" : "bg-black/10"}`}>
                  <DownloadCloud strokeWidth={1.5} className={`size-[20px] ${downloadAllState === "done" ? "text-white" : "text-accent-foreground"}`} />
                </div>
                {downloadAllState === "downloading" && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 backdrop-blur-sm border border-black/5 animate-pulse">
                    <Loader2 className="size-[10px] animate-spin text-accent-foreground" />
                    <span className="text-[8px] font-bold tracking-widest uppercase text-accent-foreground">{t("hub.offline.downloading")}</span>
                  </div>
                )}
              </div>
              
              <h3 className={`font-serif text-xl font-medium mb-2 ${downloadAllState === "done" ? "text-white" : "text-accent-foreground"}`}>
                {downloadAllState === "done" ? t("hub.offline.ready") : t("hub.offline.title")}
              </h3>
              <p className={`text-xs font-naskh leading-relaxed mb-6 ${downloadAllState === "done" ? "text-white" : "text-accent-foreground"}`}>
                {downloadAllState === "done" 
                  ? t("hub.offline.readyDesc")
                  : t("hub.offline.notReadyDesc")}
              </p>
              
              {downloadAllState === "idle" ? (
                <button 
                  onClick={downloadAll}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-serif font-bold text-sm flex items-center justify-center gap-3 active:scale-95 border border-white/10 text-white"
                >
                  <DownloadCloud size={18} />
                  {t("hub.offline.download")}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className={`flex justify-between text-[10px] font-bold tracking-widest uppercase ${downloadAllState === "done" ? "text-white" : "text-accent-foreground"}`}>
                      <span>{t("hub.offline.progress")}: {i18n.language === "ar" ? toArabicNumber(downloadAllProgress) : downloadAllProgress}%</span>
                      <span>{i18n.language === "ar" ? toArabicNumber(Math.round((downloadAllProgress / 100) * 604)) : Math.round((downloadAllProgress / 100) * 604)} / {i18n.language === "ar" ? toArabicNumber(604) : 604}</span>
                    </div>
                    <div className="h-1.5 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        className={`h-full rounded-full ${downloadAllState === "done" ? "bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadAllProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {downloadAllState === "downloading" ? (
                      <button 
                        onClick={pauseDownload}
                        className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all font-serif text-xs flex items-center justify-center gap-2 border border-white/10 text-white"
                      >
                        <Pause size={14} />
                        {t("hub.offline.pause")}
                      </button>
                    ) : downloadAllState === "paused" ? (
                      <button 
                        onClick={downloadAll}
                        className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all font-serif text-xs flex items-center justify-center gap-2 border border-white/10 text-white"
                      >
                        <Play size={14} />
                        {t("hub.offline.resume")}
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {categories.map((category, idx) => (
            <motion.section
              key={category.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 px-2">
                {category.icon}
                <h2 className="font-bold font-naskh text-foreground">{category.title}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {category.tools.map((tool) => {
                  const isExternal = tool.path.startsWith('http');
                  const Content = (
                    <>
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {tool.icon}
                      </div>
                      <span className="text-xs font-bold font-naskh text-foreground text-center">{tool.name}</span>
                    </>
                  );

                  if (isExternal) {
                    return (
                      <a
                        key={tool.name}
                        href={tool.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-2xl shadow-soft hover:bg-accent/5 transition-colors group"
                      >
                        {Content}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={tool.name}
                      to={tool.path}
                      className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-2xl shadow-soft hover:bg-accent/5 transition-colors group"
                    >
                      {Content}
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hub;
