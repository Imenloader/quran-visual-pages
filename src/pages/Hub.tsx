import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from "react";
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
  Dumbbell,
  ChevronRight,
  Users,
  Globe,
  Wifi,
  WifiOff,
  MessageSquare,
  GraduationCap as GradIcon,
  Pin
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
import HubHeroBanner from "@/components/HubHeroBanner";
import { usePersistentState } from "@/hooks/usePersistentState";
import DashboardCustomizer from "@/components/DashboardCustomizer";

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
  
  const [pinnedToolIds, setPinnedToolIds] = usePersistentState<string[]>("hub-pinned-tools", []);

  const handlePinChange = useCallback((toolId: string) => {
    setPinnedToolIds(prev => {
      if (prev.includes(toolId)) return prev.filter(id => id !== toolId);
      if (prev.length >= 6) return prev;
      return [...prev, toolId];
    });
  }, [setPinnedToolIds]);

  interface HubTool {
    id: string;
    name: string;
    icon: React.ReactNode;
    path: string;
    visible?: boolean;
  }

  interface HubCategory {
    id: string;
    title: string;
    icon: React.ReactNode;
    tools: HubTool[];
  }

  const totalPages = 604;

  useEffect(() => {
    // Restore scroll position
    const savedPosition = sessionStorage.getItem("hubScrollPosition");
    if (savedPosition) {
      // Delay slightly to allow content to render
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedPosition),
          behavior: "instant" as any
        });
      }, 100);
    }

    const handleScroll = () => {
      // Save scroll position with a small debounce/throttle effect implicitly by just saving
      sessionStorage.setItem("hubScrollPosition", window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);

    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % dailyVerses.length;
    const verse = dailyVerses[index];
    setVerseOfDay({ text: verse.text, surah: verse.surah, number: verse.number });

    const unsub = onSnapshot(doc(db, "settings", "hub"), (snap) => {
      if (snap.exists()) setHubSettings(snap.data().sections);
    });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsub();
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const bootstrap = async () => {
      try {
        const pagesStatus = await offlineOrchestrator.getBundleStatus("quran-pages");
        const textStatus = await offlineOrchestrator.getBundleStatus("quran-text");
        
        const combinedProgress = (pagesStatus.progress + textStatus.progress) / 2;
        setDownloadAllProgress(combinedProgress);
        
        const combinedState = (pagesStatus.state === "running" || textStatus.state === "running") ? "running" 
                            : (pagesStatus.state === "completed" && textStatus.state === "completed") ? "completed"
                            : (pagesStatus.state === "paused" || textStatus.state === "paused") ? "paused"
                            : "idle";

        if (combinedState === "running") setDownloadAllState("downloading");
        else if (combinedState === "paused") setDownloadAllState("paused");
        else if (combinedState === "completed") setDownloadAllState("done");
        else setDownloadAllState("idle");
      } catch (error) {
        console.error("Failed to bootstrap Hub offline status:", error);
      }
    };

    bootstrap();

    const unsubscribe = offlineOrchestrator.subscribe((event) => {
      if (!["quran-pages", "quran-text"].includes(event.bundleId as string) || !event.globalStatus) return;
      
      const status = event.globalStatus;
      const pages = status.bundles.find(b => b.bundleId === "quran-pages");
      const text = status.bundles.find(b => b.bundleId === "quran-text");

      if (!pages || !text) return;

      const combinedProgress = (pages.progress + text.progress) / 2;
      setDownloadAllProgress(combinedProgress);
      
      const combinedState = (pages.state === "running" || text.state === "running") ? "running" 
                          : (pages.state === "completed" && text.state === "completed") ? "completed"
                          : (pages.state === "error" || text.state === "error") ? "error"
                          : (pages.state === "paused" || text.state === "paused") ? "paused"
                          : "idle";

      if (combinedState === "running") setDownloadAllState("downloading");
      else if (combinedState === "paused") setDownloadAllState("paused");
      else if (combinedState === "completed") setDownloadAllState("done");
      else if (combinedState === "error") setDownloadAllState("paused");
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
      const pagesStatus = await offlineOrchestrator.getBundleStatus("quran-pages");
      const textStatus = await offlineOrchestrator.getBundleStatus("quran-text");

      if (pagesStatus.state === "paused") await offlineOrchestrator.resumeBundle("quran-pages");
      else await offlineOrchestrator.prepareBundle("quran-pages");

      if (textStatus.state === "paused") await offlineOrchestrator.resumeBundle("quran-text");
      else await offlineOrchestrator.prepareBundle("quran-text");
    } catch (error) {
      console.error("Hub download failed:", error);
      toast.error(t("hub.offline.clearError"));
    }
  }, [isOnline, t]);

  const pauseDownload = useCallback(async () => {
    try {
      await offlineOrchestrator.pauseBundle("quran-pages");
      await offlineOrchestrator.pauseBundle("quran-text");
    } catch (error) {
      console.error("Hub pause failed:", error);
    }
  }, []);

  const categories = useMemo(() => {
    const base: HubCategory[] = [
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
          { id: 'qanet', name: t("hub.qiyam") || "من القانتين", icon: <Moon className="w-5 h-5" />, path: "/qanet" },
          { id: 'qiyam-100', name: t("hub.qiyam100") || "١٠٠ آية", icon: <Sparkles className="w-5 h-5" />, path: "/qiyam" },
          { id: 'strong-believer', name: "المؤمن القوي", icon: <Dumbbell className="w-5 h-5" />, path: "/strong-believer" },
          { id: 'salah-guide', name: i18n.language === 'ar' ? 'دليل الصلاة' : 'Salah Guide', icon: <BookOpen className="w-5 h-5" />, path: "/salah-guide" },
          { id: 'names', name: t("hub.namesOfAllah"), icon: <Heart className="w-5 h-5" />, path: "/names-of-allah" },
          { id: 'islamic-roadmap', name: i18n.language === 'ar' ? 'خارطة الطريق' : 'Islamic Roadmap', icon: <Sparkles className="w-5 h-5" />, path: "/islamic-roadmap" },
        ]
      },
      {
        id: 'planning',
        title: t("hub.planning"),
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        tools: [
          { id: 'community-hub', name: i18n.language === 'ar' ? 'مركز المجتمع' : 'Community Hub', icon: <Users className="w-5 h-5 text-gold" />, path: "/community/hub" },
          { id: 'khatma', name: t("hub.khatma"), icon: <BookOpen className="w-5 h-5" />, path: "/khatma" },
          { id: 'hifz', name: t("hub.hifzTester"), icon: <GradIcon className="w-5 h-5" />, path: "/tools/hifz-tester" },
          { id: 'routine', name: t("hub.routineBuilder"), icon: <Zap className="w-5 h-5" />, path: "/routine-builder" },
          { id: 'fasting', name: t("hub.fastingTracker"), icon: <Moon className="w-5 h-5" />, path: "/fasting-tracker" },
          { id: 'friday', name: t("hub.fridaySunan"), icon: <Sparkles className="w-5 h-5" />, path: "/friday-sunan" },
          { id: 'prayer-tracker', name: t("hub.prayerTracker"), icon: <CheckCircle2 className="w-5 h-5" />, path: "/prayer-tracker" },
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
          { id: 'stories-hub', name: i18n.language === 'ar' ? 'مكتبة القصص' : 'Stories Hub', icon: <BookOpen className="w-5 h-5" />, path: "/stories" },
          { id: 'sahaba', name: i18n.language === 'ar' ? 'موسوعة الصحابة' : 'Sahaba Encyclopedia', icon: <Users className="w-5 h-5" />, path: "/sahaba" },
          { id: 'stories', name: t("hub.prophetStories"), icon: <BookOpen className="w-5 h-5" />, path: "/prophet-stories" },
          { id: 'names-dir', name: t("hub.namesDirectory"), icon: <Fingerprint className="w-5 h-5" />, path: "/names-directory" },
          { id: 'sunan', name: t("hub.propheticSunnan"), icon: <Sparkles className="w-5 h-5" />, path: "/daily-adhkar" },
          { id: 'hadith', name: t("hub.hadith"), icon: <Book className="w-5 h-5" />, path: "/hadith" },
          { id: 'hijri', name: t("hub.hijri"), icon: <Calendar className="w-5 h-5" />, path: "/hijri" },
          { id: 'daily-verse', name: t("hub.dailyVerse"), icon: <BookOpen className="w-5 h-5" />, path: "/daily-verse" },
          { id: 'marriage-guide', name: "دليل الزواج", icon: <Heart className="w-5 h-5" />, path: "/marriage-guide" },
          { id: 'tafsir', name: t("hub.tafsir"), icon: <BookOpen className="w-5 h-5" />, path: "/tafsir" },
          { id: 'search', name: t("hub.search"), icon: <Search className="w-5 h-5" />, path: "/search" },
          { id: 'tajweed', name: t("hub.tajweed"), icon: <Sparkles className="w-5 h-5" />, path: "/tajweed" },
          { id: 'tajweed-games', name: i18n.language === 'ar' ? 'ألعاب التجويد' : 'Tajweed Games', icon: <Sparkles className="w-5 h-5" />, path: "/tajweed-games" },
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
        tools: section.tools.map((tool): HubTool => {
          const remoteTool = remoteSection.tools.find((t: any) => t.id === tool.id);
          if (!remoteTool) return tool;
          return { ...tool, name: remoteTool.name || tool.name, visible: remoteTool.visible !== false };
        }).filter(t => t.visible !== false)
      };
    });
  }, [t, hubSettings, i18n.language]);

  return (
    <div className="relative min-h-screen bg-background pb-24 overflow-x-hidden">
      <QuranHeader title={t("hub.title")} subtitle={t("hub.subtitle")} variant="compact" />
      <div className="max-w-7xl mx-auto px-3 md:px-6 mt-6">
        <HubHeroBanner />
      </div>
      <div className="max-w-7xl mx-auto px-3 md:px-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <ScrollReveal>
              <section className="bento-card !p-8 bg-card/40 backdrop-blur-2xl border border-border/40 shadow-islamic h-fit min-h-[300px]">
                <Suspense fallback={<div className="h-[240px] flex items-center justify-center"><Loader2 className="text-accent" /></div>}>
                  <ReadingProgress />
                </Suspense>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section
                className={`bento-card !p-8 border-none relative overflow-hidden group shadow-islamic ${
                  downloadAllState === "done" 
                    ? "!bg-primary text-primary-foreground shadow-primary/20" 
                    : "!bg-accent/5 text-accent-foreground shadow-accent/5 border border-accent/10"
                }`}
              >
                <div className="absolute inset-0 pattern-islamic opacity-[0.03]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`p-4 rounded-2xl shadow-inner ${downloadAllState === "done" ? "bg-primary/10" : "bg-accent/10"}`}>
                      <DownloadCloud strokeWidth={1.5} className={`size-[24px] ${downloadAllState === "done" ? "text-white" : "text-accent"}`} />
                    </div>
                    {downloadAllState === "downloading" && (
                      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/5 backdrop-blur-sm border border-black/5">
                        <Loader2 className="size-[12px] text-accent" />
                        <span className="text-[10px] font-bold uppercase text-accent">{t("hub.offline.downloading")}</span>
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
                    <button 
                      onClick={downloadAll}
                      className="w-full py-4 rounded-2xl bg-accent text-white hover:bg-accent/90 transition-all font-serif font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-accent/20"
                    >
                      <DownloadCloud size={20} />
                      {t("hub.offline.download")}
                    </button>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className={`flex justify-between text-[11px] font-bold uppercase ${downloadAllState === "done" ? "text-white" : "text-muted-foreground"}`}>
                          <span>{t("hub.offline.progress")}: {i18n.language === "ar" ? toArabicNumber(downloadAllProgress) : downloadAllProgress}%</span>
                          <span>{i18n.language === "ar" ? toArabicNumber(Math.round((downloadAllProgress / 100) * 604)) : Math.round((downloadAllProgress / 100) * 604)} / {i18n.language === "ar" ? toArabicNumber(604) : 604}</span>
                        </div>
                        <div className="h-2.5 bg-black/5 rounded-full overflow-hidden p-0.5 border border-black/5">
                          <div 
                            className={`h-full rounded-full ${downloadAllState === "done" ? "bg-white" : "bg-accent"}`}
                            style={{ width: `${downloadAllProgress}%` }}
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

          <div className="lg:col-span-8 space-y-12">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-bold font-naskh text-foreground hidden md:block"></h2>
              <DashboardCustomizer 
                categories={categories} 
                pinnedTools={pinnedToolIds} 
                onPinChange={handlePinChange} 
              />
            </div>

            <div className="space-y-12">
              {pinnedToolIds.length > 0 && (
                <ScrollReveal>
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm border border-accent/20">
                        <Pin className="w-5 h-5 text-accent" />
                      </div>
                      <h2 className="text-2xl font-bold font-naskh text-accent">{t("hub.pinnedTools")}</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                      {pinnedToolIds.map((toolId) => {
                        const tool = categories.flatMap(c => c.tools).find(t => t.id === toolId);
                        if (!tool) return null;
                        
                        const isExternal = tool.path.startsWith('http');
                        const Content = (
                          <div
                            className="p-6 rounded-[2rem] glass-card flex flex-col items-center text-center group h-full relative overflow-hidden hover:-translate-y-1 hover:shadow-accent/10"
                          >
                            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 right-4">
                              <Pin size={12} className="text-accent/40" />
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 text-accent transition-all duration-300 shadow-inner z-10">
                              {tool.icon}
                            </div>
                            <span className="font-bold text-sm font-naskh text-foreground group-hover:text-accent transition-colors z-10">
                              {tool.name}
                            </span>
                          </div>
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
              )}

              {categories.map((category) => (
                <ScrollReveal key={category.title}>
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
                          <div
                            className="p-6 rounded-[2rem] glass-card flex flex-col items-center text-center group h-full hover:-translate-y-1"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-5 group-hover:bg-accent/10 group-hover:text-accent transition-all duration-300 shadow-inner">
                              {tool.icon}
                            </div>
                            <span className="font-bold text-sm font-naskh text-foreground group-hover:text-accent transition-colors">
                              {tool.name}
                            </span>
                          </div>
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

