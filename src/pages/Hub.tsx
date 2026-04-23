import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { 
  Compass, 
  Fingerprint, 
  Calculator, 
  Heart, 
  Calendar, 
  MapPin, 
  Book,
  BookOpen, 
  Brain,
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
  ChevronRight,
  Users,
  Globe,
  Wifi,
  WifiOff,
  GraduationCap as GradIcon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { dailyVerses } from "@/data/dailyVersesData";
import { juzData, toArabicNumber, getQuranPageImageUrl } from "@/data/quranData";
import { useFavorites } from "@/hooks/useFavorites";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import QuranHeader from "@/components/QuranHeader";
import { offlineOrchestrator } from "@/services/offlineOrchestrator";
import { toast } from "sonner";
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const ReadingProgress = lazy(() => import("@/components/ReadingProgress"));

const Hub = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { playSurah: globalPlaySurah } = useAudioPlayer();
  const [verseOfDay, setVerseOfDay] = useState<{ text: string; surah: string; number: number } | null>(null);
  
  const [downloadAllState, setDownloadAllState] = useState<"idle" | "downloading" | "paused" | "done">("idle");
  const [downloadAllProgress, setDownloadAllProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hubSettings, setHubSettings] = useState<any>(null);

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

    // Fetch Hub Settings
    const unsub = onSnapshot(doc(db, "settings", "hub"), (snap) => {
      if (snap.exists()) setHubSettings(snap.data().sections);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const bootstrap = async () => {
      try {
        const status = await offlineOrchestrator.getBundleStatus("quran-pages");
        setDownloadAllProgress(status.progress);
        if (status.state === "running") setDownloadAllState("downloading");
        else if (status.state === "paused") setDownloadAllState("paused");
        else if (status.state === "completed") setDownloadAllState("done");
        else setDownloadAllState("idle");
      } catch (error) {
        console.error("Failed to bootstrap Hub offline status:", error);
      }
    };

    void bootstrap();

    const unsubscribe = offlineOrchestrator.subscribe((event) => {
      if (event.bundleId !== "quran-pages" || !event.bundleStatus) return;
      
      const status = event.bundleStatus;
      setDownloadAllProgress(status.progress);
      
      if (status.state === "running") setDownloadAllState("downloading");
      else if (status.state === "paused") setDownloadAllState("paused");
      else if (status.state === "completed") setDownloadAllState("done");
      else if (status.state === "error") setDownloadAllState("paused");
      else setDownloadAllState("idle");
    });

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const downloadAll = useCallback(async () => {
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
      console.error("Hub download failed:", error);
      toast.error(t("hub.offline.clearError"));
    }
  }, [isOnline, t]);

  const pauseDownload = useCallback(async () => {
    try {
      await offlineOrchestrator.pauseBundle("quran-pages");
    } catch (error) {
      console.error("Hub pause failed:", error);
    }
  }, []);

  const categories = useMemo(() => {
    const base = [
      {
        id: 'spiritual',
        title: t("hub.spiritual"),
        icon: <Heart className="w-5 h-5 text-rose-500" />,
        tools: [
          { id: 'recitations', name: t("nav.recitations"), icon: <Headphones className="w-5 h-5" />, path: "/recitations" },
          { id: 'prayer-times', name: t("hub.prayerTimes"), icon: <Zap className="w-5 h-5" />, path: "/prayer-times" },
          { id: 'qibla', name: t("hub.qibla"), icon: <Compass className="w-5 h-5" />, path: "/qibla" },
          { id: 'tasbih', name: t("hub.tasbih"), icon: <Fingerprint className="w-5 h-5" />, path: "/tasbih" },
          { id: 'global-dhikr', name: t("hub.globalDhikr"), icon: <Globe className="w-5 h-5" />, path: "/global-dhikr" },
          { id: 'zakat', name: t("hub.zakat"), icon: <Calculator className="w-5 h-5" />, path: "/zakat" },
          { id: 'sadaqah', name: t("hub.sadaqahLogger"), icon: <Heart className="w-5 h-5" />, path: "/sadaqah-logger" },
          { id: 'dua', name: t("hub.duaLibrary"), icon: <Sparkles className="w-5 h-5" />, path: "/dua-library" },
          { id: 'names', name: t("hub.namesOfAllah"), icon: <Heart className="w-5 h-5" />, path: "/names-of-allah" },
        ]
      },
      {
        id: 'planning',
        title: t("hub.planning"),
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        tools: [
          { id: 'khatma', name: t("hub.khatma"), icon: <BookOpen className="w-5 h-5" />, path: "/khatma" },
          { id: 'collab-khatma', name: t("hub.collaborativeKhatma"), icon: <Users className="w-5 h-5" />, path: "/khatma-jamaaiya" },
          { id: 'hifz', name: t("hub.hifzTester"), icon: <GradIcon className="w-5 h-5" />, path: "/tools/hifz-tester" },
          { id: 'routine', name: t("hub.routineBuilder"), icon: <Zap className="w-5 h-5" />, path: "/routine-builder" },
          { id: 'fasting', name: t("hub.fastingTracker"), icon: <Moon className="w-5 h-5" />, path: "/fasting-tracker" },
          { id: 'friday', name: t("hub.fridaySunan"), icon: <Sparkles className="w-5 h-5" />, path: "/friday-sunan" },
          { id: 'prayer-tracker', name: t("hub.prayerTracker"), icon: <CheckCircle2 className="w-5 h-5" />, path: "/prayer-tracker" },
          { id: 'qiyam', name: t("hub.qiyam"), icon: <Moon className="w-5 h-5" />, path: "/embed/qiyam" },
          { id: 'khatma-ext', name: t("hub.khatma_external"), icon: <BookOpen className="w-5 h-5" />, path: "/embed/khatma" },
        ]
      },
      {
        id: 'location',
        title: t("hub.location"),
        icon: <MapPin className="w-5 h-5 text-blue-500" />,
        tools: [
          { id: 'mosque', name: t("hub.mosqueFinder"), icon: <MapPin className="w-5 h-5" />, path: "/mosque-finder" },
          { id: 'halal', name: t("hub.halalPlaces"), icon: <MapPin className="w-5 h-5" />, path: "/halal-places" },
          { id: 'moon', name: t("hub.moonTracker"), icon: <Moon className="w-5 h-5" />, path: "/moon-tracker" },
        ]
      },
      {
        id: 'knowledge',
        title: t("hub.knowledge"),
        icon: <BookOpen className="w-5 h-5 text-amber-500" />,
        tools: [
          { id: 'ramadan', name: t("ramadan.title"), icon: <Moon className="w-5 h-5" />, path: "/ramadan" },
          { id: 'library', name: t("hub.library"), icon: <BookOpen className="w-5 h-5" />, path: "/library" },
          { id: 'seerah', name: t("hub.seerahTimeline"), icon: <Calendar className="w-5 h-5" />, path: "/seerah-timeline" },
          { id: 'quiz', name: t("hub.islamicQuiz"), icon: <Brain className="w-5 h-5" />, path: "/islamic-quiz" },
          { id: 'inheritance', name: t("hub.inheritanceCalculator"), icon: <Calculator className="w-5 h-5" />, path: "/inheritance-calculator" },
          { id: 'hajj', name: t("hub.hajjUmrahGuide"), icon: <MapPin className="w-5 h-5" />, path: "/hajj-guide" },
          { id: 'stories', name: t("hub.prophetStories"), icon: <BookOpen className="w-5 h-5" />, path: "/prophet-stories" },
          { id: 'names-dir', name: t("hub.namesDirectory"), icon: <Fingerprint className="w-5 h-5" />, path: "/names-directory" },
          { id: 'sunan', name: t("hub.propheticSunnan"), icon: <Sparkles className="w-5 h-5" />, path: "/daily-adhkar" },
          { id: 'hadith', name: t("hub.hadith"), icon: <Book className="w-5 h-5" />, path: "/hadith" },
          { id: 'hijri', name: t("hub.hijri"), icon: <Calendar className="w-5 h-5" />, path: "/hijri" },
          { id: 'daily-verse', name: t("hub.dailyVerse"), icon: <BookOpen className="w-5 h-5" />, path: "/daily-verse" },
          { id: 'tafsir', name: t("hub.tafsir"), icon: <BookOpen className="w-5 h-5" />, path: "/tafsir" },
          { id: 'search', name: t("hub.search"), icon: <Search className="w-5 h-5" />, path: "/search" },
          { id: 'tajweed', name: t("hub.tajweed"), icon: <Sparkles className="w-5 h-5" />, path: "/tajweed" },
          { id: 'guide', name: t("hub.guide"), icon: <BookOpen className="w-5 h-5" />, path: "/how-to-use" },
        ]
      },
      {
        id: 'technical',
        title: t("hub.technical"),
        icon: <Download className="w-5 h-5 text-indigo-500" />,
        tools: [
          { id: 'offline', name: t("hub.offline.title"), icon: <Download className="w-5 h-5" />, path: "/offline" },
          { id: 'install', name: t("hub.install"), icon: <Shield className="w-5 h-5" />, path: "/install" },
        ]
      }
    ];

    if (!hubSettings) return base;

    return base.map(section => {
      const remoteSection = hubSettings.find((s: any) => s.id === section.id);
      if (!remoteSection) return section;

      return {
        ...section,
        tools: section.tools.map(tool => {
          const remoteTool = remoteSection.tools.find((t: any) => t.id === tool.id);
          if (!remoteTool) return tool;
          return { ...tool, name: remoteTool.name || tool.name, visible: remoteTool.visible !== false };
        }).filter(t => t.visible !== false)
      };
    });
  }, [t, hubSettings]);

  return (
    <div className="relative min-h-screen bg-background pb-24 overflow-x-hidden">
      <QuranHeader title={t("hub.title")} subtitle={t("hub.subtitle")} variant="compact" />
      <div className="max-w-7xl mx-auto px-4 mt-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Progress & Offline */}
          <div className="lg:col-span-4 space-y-8">
            <ScrollReveal>
              <section className="bento-card !p-8 bg-card/40 backdrop-blur-2xl border border-border/40 shadow-islamic h-fit hover:shadow-emerald-deep/5 transition-all duration-500 min-h-[300px]">
                <Suspense fallback={<div className="h-[240px] flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>}>
                  <ReadingProgress />
                </Suspense>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <section
                className={`bento-card !p-8 border-none relative overflow-hidden group shadow-islamic transition-all duration-500 ${
                  downloadAllState === "done" 
                    ? "!bg-primary text-primary-foreground shadow-primary/20" 
                    : "!bg-accent/5 text-accent-foreground shadow-accent/5 border border-accent/10"
                }`}
              >
                <div className="absolute inset-0 pattern-islamic opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`p-4 rounded-2xl shadow-inner ${downloadAllState === "done" ? "bg-primary/10" : "bg-accent/10"}`}>
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
                            className="flex-1 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all font-serif text-sm flex items-center justify-center gap-2 border border-primary/10 text-white"
                          >
                            <Pause size={16} />
                            {t("hub.offline.pause")}
                          </button>
                        ) : downloadAllState === "paused" ? (
                          <button 
                            onClick={downloadAll}
                            className="flex-1 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all font-serif text-sm flex items-center justify-center gap-2 border border-primary/10 text-white"
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

          {/* Right Column: Categories */}
          <div className="lg:col-span-8 space-y-12">
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

      {/* Footer / Knowledge Base */}
      <footer className="mt-20 py-12 border-t border-border/40 relative">
        <div className="absolute inset-0 pattern-islamic opacity-[0.02]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className={`text-center ${i18n.language === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
            <h3 className="text-lg font-serif font-bold text-primary mb-2">Quraaniat — قرآنيات</h3>
            <p className="text-xs text-muted-foreground font-serif leading-relaxed italic max-w-sm">
              {t("hub.footerDescription")}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/privacy" className="text-xs font-serif text-muted-foreground hover:text-accent transition-colors flex items-center gap-2">
              <Shield size={14} />
              {t("hub.privacyPolicy")}
            </Link>
            <Link to="/how-to-use" className="text-xs font-serif text-muted-foreground hover:text-accent transition-colors flex items-center gap-2">
              <BookOpen size={14} />
              {t("hub.userGuide")}
            </Link>
            <a href="mailto:GreenFeeda@gmail.com" className="text-xs font-serif text-muted-foreground hover:text-accent transition-colors flex items-center gap-2">
              <Sparkles size={14} />
              {t("hub.contactUs")}
            </a>
          </div>
          
          <div className="text-center md:text-left">
            <p className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">
              Version 1.0.0 • 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hub;
