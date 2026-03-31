import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { juzData, toArabicNumber, getQuranPageImageUrl, surahIndex, SurahInfo } from "@/data/quranData";
import JuzCard from "@/components/JuzCard";
import JuzIndex from "@/components/JuzIndex";
import QuranHeader from "@/components/QuranHeader";
import { Search, Bookmark, List, Download, Headphones, BookOpen, MoonStar, Shield, Loader2, Check, X, Pause, Play, Settings, Moon, Award, Heart, Sparkles, Zap, BookMarked, ChevronLeft, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "motion/react";

const BOOKMARK_KEY = "quran-bookmark";

interface BookmarkData {
  juz: number;
  page: number;
  readingMode: "image" | "text";
}

interface AyahMatch {
  text: string;
  number: number;
  page: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
  };
  numberInSurah: number;
}

const getBookmark = (): BookmarkData | null => {
  try {
    const data = localStorage.getItem(BOOKMARK_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [surahResults, setSurahResults] = useState<SurahInfo[]>([]);
  const [showIndex, setShowIndex] = useState(false);
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
  const [cachingEmbed, setCachingEmbed] = useState<Record<string, boolean>>({});
  const { setReadingMode } = useTheme();
  const navigate = useNavigate();
  const bookmark = getBookmark();
  const [verseOfDay, setVerseOfDay] = useState<{ text: string; surah: string; number: number } | null>(null);
  const [readingStats, setReadingStats] = useState({ completedJuz: 0, totalPagesRead: 0 });

  useEffect(() => {
    // Generate a pseudo-random verse of the day based on the date
    const date = new Date();
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const verses = [
      { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", surah: "الشرح", number: 6 },
      { text: "وَقُل رَّبِّ زِدْنِي عِلْمًا", surah: "طه", number: 114 },
      { text: "فَاذْكُرُونِي أَذْكُرْكُمْ", surah: "البقرة", number: 152 },
      { text: "وَاللَّهُ مَعَ الصَّابِرِينَ", surah: "البقرة", number: 249 },
      { text: "إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", surah: "البقرة", number: 20 },
      { text: "وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَىٰ", surah: "البقرة", number: 197 },
      { text: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", surah: "البقرة", number: 286 },
    ];
    setVerseOfDay(verses[seed % verses.length]);

    // Calculate reading stats from localStorage
    const history = JSON.parse(localStorage.getItem("quran-reading-history") || "{}");
    const completed = Object.keys(history).length;
    const pagesRead = Object.values(history).reduce((acc: number, val: unknown) => {
      const v = val as { pagesRead?: number };
      return acc + (v.pagesRead || 0);
    }, 0);
    setReadingStats({ completedJuz: completed, totalPagesRead: pagesRead });
  }, []);

  const totalPages = 604;

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

            // Update Juz download states as we go
            juzData.forEach(j => {
              if (page >= j.startPage && page <= j.endPage) {
                // If this is the last page of the Juz, mark it as done
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
        // Mark all as done
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

  const handleResumeReading = () => {
    if (bookmark) {
      if (bookmark.readingMode) {
        setReadingMode(bookmark.readingMode);
      }
      navigate(`/juz/${bookmark.juz}#page-${bookmark.page}`);
    }
  };

  const bookmarkJuzName = bookmark
    ? juzData.find((j) => j.number === bookmark.juz)?.nameAr
    : null;

  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return juzData;
    const query = searchQuery.toLowerCase();
    return juzData.filter(
      (j) =>
        j.nameAr.includes(query) ||
        j.nameEn.toLowerCase().includes(query) ||
        String(j.number ?? "").includes(query) ||
        j.surahs.some(s => s.includes(query))
    );
  }, [searchQuery]);

  useEffect(() => {
    const searchQuran = async () => {
      if (searchQuery.trim().length < 2) {
        setSurahResults([]);
        return;
      }

      // Search Surahs locally
      const matchedSurahs = surahIndex.filter(s => 
        s.name.includes(searchQuery) || 
        s.number.toString() === searchQuery
      );
      setSurahResults(matchedSurahs);
    };

    const timer = setTimeout(searchQuran, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSurahClick = (surah: SurahInfo) => {
    const juz = juzData.find(j => surah.startPage >= j.startPage && surah.startPage <= j.endPage);
    if (juz) {
      navigate(`/juz/${juz.number}#page-${surah.startPage}`);
      setSearchQuery("");
      setSurahResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 -mt-16 md:-mt-24 relative z-30">
        {/* Immersive Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-12 md:mb-16">
          
          {/* Hero Section - The "Heart" of the App */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-card/40 backdrop-blur-2xl border border-border/40 p-6 md:p-12 group shadow-islamic"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.05, 0.1, 0.05],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute -top-1/2 -right-1/4 w-[120%] h-[120%] bg-gold/20 rounded-full blur-[120px]" 
              />
              <div className="absolute inset-0 pattern-islamic opacity-[0.03] scale-150" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[350px]">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4 mb-10"
                >
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                    <Sparkles size={22} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">بوابة النور الرقمية</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-0.5">Digital Gateway to Light</span>
                  </div>
                </motion.div>
                
                <h1 className="text-4xl md:text-7xl font-serif font-light mb-6 md:mb-8 text-primary leading-[1.1] tracking-tight">
                  مصحف <span className="italic font-medium text-accent drop-shadow-sm">المدينة المنورة</span>
                  <br />
                  <span className="text-2xl md:text-4xl text-primary font-naskh mt-3 md:mt-4 block">الإصدار الرقمي الفاخر</span>
                </h1>
                
                <p className="text-muted-foreground font-naskh text-lg md:text-xl max-w-2xl leading-relaxed border-r-2 border-accent/20 pr-4 md:pr-6">
                  انغمس في تجربة قراءة استثنائية تجمع بين أصالة الخط العثماني وأحدث تقنيات العرض الرقمي، لتكون رفيقك الدائم في رحلة التدبر.
                </p>
              </div>

              <div className="mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-8">
                {bookmark ? (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResumeReading}
                    className="group relative flex items-center gap-4 bg-primary text-primary-foreground px-10 py-5 rounded-[2.5rem] font-serif text-xl font-medium shadow-2xl hover:shadow-gold-glow transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <BookMarked size={24} strokeWidth={1.5} className="relative z-10" />
                    <span className="relative z-10">استئناف التلاوة</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowIndex(true)}
                    className="group relative flex items-center gap-4 bg-primary text-primary-foreground px-10 py-5 rounded-[2.5rem] font-serif text-xl font-medium shadow-2xl hover:shadow-gold-glow transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <List size={24} strokeWidth={1.5} className="relative z-10" />
                    <span className="relative z-10">ابدأ القراءة</span>
                  </motion.button>
                )}

                {bookmark && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">آخر موضع قراءة</span>
                    </div>
                    <span className="text-xl font-naskh font-bold text-primary group-hover:text-accent transition-colors">
                      {bookmarkJuzName} • صفحة {toArabicNumber(bookmark.page)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar Bento Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
            {/* Reading Stats Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="bento-card !p-6 md:!p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20"
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <Award className="size-[20px] md:size-[22px]" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] md:text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">إحصائيات القراءة</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xl md:text-2xl font-serif font-bold text-primary">{toArabicNumber(readingStats.completedJuz)}</div>
                  <div className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider">أجزاء مكتملة</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xl md:text-2xl font-serif font-bold text-primary">{toArabicNumber(readingStats.totalPagesRead)}</div>
                  <div className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider">صفحات مقروءة</div>
                </div>
              </div>
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-indigo-500/10">
                <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-muted-foreground mb-2">
                  <span>تقدم الختمة</span>
                  <span>{toArabicNumber(Math.round((readingStats.totalPagesRead / 604) * 100))}%</span>
                </div>
                <div className="h-1.5 bg-indigo-500/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(readingStats.totalPagesRead / 604) * 100}%` }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Verse of the Day Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="bento-card !p-6 md:!p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20"
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                  <Sparkles className="size-[20px] md:size-[22px]" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] md:text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">آية اليوم</span>
              </div>
              {verseOfDay && (
                <div className="space-y-3 md:space-y-4">
                  <p className="text-xl md:text-2xl font-quran text-primary leading-relaxed text-center">
                    {verseOfDay.text}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">
                    <span>سورة {verseOfDay.surah}</span>
                    <span className="w-1 h-1 rounded-full bg-amber-600/30" />
                    <span>آية {toArabicNumber(verseOfDay.number)}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Search Card */}
            <motion.div 
              id="search-section"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="bento-card !p-6 ring-2 ring-accent/10 focus-within:ring-accent/40 transition-all relative z-20"
            >
              <div className="relative mb-6">
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في الأجزاء والسور..."
                  className="w-full bg-muted/30 border border-border/40 rounded-2xl pr-12 pl-4 py-4 text-sm font-naskh text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["البقرة", "يس", "الكهف", "الملك", "الرحمن"].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="text-[10px] font-medium bg-muted/50 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Offline Access Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className={`bento-card !p-6 md:!p-8 border-none relative overflow-hidden group ${
                downloadAllState === "done" 
                  ? "!bg-emerald-deep text-white shadow-emerald-500/20" 
                  : "!bg-accent text-accent-foreground shadow-accent/20"
              }`}
            >
              <div className="absolute inset-0 pattern-islamic opacity-[0.05] group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className={`p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] shadow-inner ${downloadAllState === "done" ? "bg-white/10" : "bg-black/10"}`}>
                    <Download strokeWidth={1.5} className={`size-[20px] md:size-[24px] ${downloadAllState === "done" ? "text-white" : "text-accent-foreground"}`} />
                  </div>
                  {downloadAllState === "downloading" && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 backdrop-blur-sm border border-black/5 animate-pulse">
                      <Loader2 className="size-[10px] md:size-[12px] animate-spin text-accent-foreground" />
                      <span className="text-[8px] md:text-[9px] font-bold tracking-widest uppercase text-accent-foreground">جاري التحميل</span>
                    </div>
                  )}
                </div>
                
                <h3 className={`font-serif text-xl md:text-2xl font-medium mb-2 md:mb-3 ${downloadAllState === "done" ? "text-white" : "text-accent-foreground"}`}>
                  {downloadAllState === "done" ? "المصحف متاح أوفلاين" : "الوصول بدون إنترنت"}
                </h3>
                <p className={`text-xs md:text-sm font-naskh leading-relaxed mb-6 md:mb-8 ${downloadAllState === "done" ? "text-white" : "text-accent-foreground"}`}>
                  {downloadAllState === "done" 
                    ? "تم تحميل جميع صفحات المصحف بنجاح، يمكنك الآن القراءة دون الحاجة للاتصال بالإنترنت."
                    : "قم بتحميل صفحات المصحف كاملة (٦٠٤ صفحة) لتتمكن من القراءة في أي وقت دون اتصال."}
                </p>
                
                {downloadAllState === "idle" ? (
                  <button 
                    onClick={downloadAll}
                    className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-serif font-bold text-sm flex items-center justify-center gap-3 active:scale-95 border border-white/10 text-white"
                  >
                    <Download size={18} />
                    تحميل كامل المصحف
                  </button>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className={`flex justify-between text-[10px] font-bold tracking-widest uppercase ${downloadAllState === "done" ? "text-white" : "text-accent-foreground"}`}>
                        <span>التقدم: {toArabicNumber(downloadAllProgress)}%</span>
                        <span>{toArabicNumber(Math.round((downloadAllProgress / 100) * 604))} / {toArabicNumber(604)}</span>
                      </div>
                      <div className="h-2 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                          className={`h-full rounded-full ${downloadAllState === "done" ? "bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${downloadAllProgress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {downloadAllState === "downloading" ? (
                        <button 
                          onClick={pauseDownload}
                          className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-serif text-xs flex items-center justify-center gap-2 border border-white/10 text-white"
                        >
                          <Pause size={14} />
                          إيقاف مؤقت
                        </button>
                      ) : downloadAllState === "paused" ? (
                        <button 
                          onClick={downloadAll}
                          className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-serif text-xs flex items-center justify-center gap-2 border border-white/10 text-white"
                        >
                          <Play size={14} />
                          استئناف
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Editorial Quick Access */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-20">
          {[
            { to: "/prayer-times", icon: Zap, label: "مواقيت الصلاة", color: "text-blue-500" },
            { to: "/recitations", icon: Headphones, label: "تلاوات عطرة", color: "text-purple-500" },
            { to: "/embed/qiyam", icon: Moon, label: "قيام الليل", color: "text-indigo-500" },
            { to: "/embed/khatma", icon: Award, label: "ختمة القرآن", color: "text-amber-500" },
            { to: "/how-to-use", icon: BookOpen, label: "دليل الاستخدام", color: "text-emerald-500" },
            { to: "/tajweed", icon: Sparkles, label: "أحكام التجويد", color: "text-amber-600" },
            { to: "/install", icon: Shield, label: "تثبيت التطبيق", color: "text-rose-500" },
          ].map((item, i) => (
            <ScrollReveal key={item.to} index={i}>
              <Link
                to={item.to}
                className="group flex flex-col items-center justify-center gap-4 bg-card/40 backdrop-blur-sm border border-border/40 rounded-[2rem] p-6 hover:bg-card hover:shadow-islamic transition-all duration-500"
              >
                <div className={`w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-500`}>
                  <item.icon size={22} className={`${item.color}`} strokeWidth={1.5} />
                </div>
                <span className="text-xs font-serif font-medium text-primary group-hover:text-primary transition-colors">{item.label}</span>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* Quick Recitations Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8 ornament-border pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Headphones size={24} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-serif font-medium text-primary">تلاوات سريعة</h2>
            </div>
            <Link to="/recitations" className="text-sm font-serif text-accent hover:underline">عرض الكل</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "سورة يس", reciter: "مشاري العفاسي", id: 36 },
              { name: "سورة الملك", reciter: "عبد الباسط عبد الصمد", id: 67 },
              { name: "سورة الكهف", reciter: "سعد الغامدي", id: 18 },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-6 rounded-[2.5rem] bg-card/40 backdrop-blur-sm border border-border/40 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Play size={18} fill="currentColor" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-primary">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground font-naskh">{item.reciter}</div>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white transition-all">
                  <Zap size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search Results - Editorial Style */}
        <AnimatePresence>
          {surahResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="mb-24 space-y-16"
            >
              <div className="space-y-8">
                <div className="flex items-center gap-4 px-2 ornament-border pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Sparkles size={24} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-3xl font-serif font-medium text-primary">نتائج السور</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {surahResults.map((surah) => (
                    <motion.button
                      key={surah.number}
                      whileHover={{ scale: 1.02, translateY: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSurahClick(surah)}
                      className="flex items-center gap-6 p-6 rounded-[3rem] bg-card/60 backdrop-blur-md border border-border/40 hover:border-accent/40 hover:shadow-islamic transition-all text-right group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
                      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-serif text-xl group-hover:bg-primary group-hover:text-white transition-all shadow-inner relative z-10">
                        {toArabicNumber(surah.number)}
                      </div>
                      <div className="flex-1 relative z-10">
                        <div className="font-serif font-bold text-primary text-xl">سورة {surah.name}</div>
                        <div className="text-xs text-muted-foreground font-naskh mt-1">تبدأ من صفحة {toArabicNumber(surah.startPage)}</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-white transition-all relative z-10">
                        <ChevronLeft size={18} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Juz Grid Section - Refined */}
        <div className="flex items-center justify-between mb-12 ornament-border pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
              <List size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-serif font-medium text-primary">أجزاء القرآن الكريم</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/favorites" className="w-12 h-12 rounded-2xl bg-card border border-border/60 text-destructive flex items-center justify-center hover:bg-destructive/5 transition-all">
              <Heart size={20} fill={filteredJuz.length > 0 ? "none" : "currentColor"} strokeWidth={1.5} />
            </Link>
            <button onClick={() => setShowIndex(true)} className="w-12 h-12 rounded-2xl bg-card border border-border/60 text-primary flex items-center justify-center hover:bg-muted/50 transition-all">
              <Settings size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {filteredJuz.length === 0 ? (
          <div className="text-center py-32 bg-card/40 backdrop-blur-sm border border-dashed border-border/60 rounded-[3rem]">
            <Search size={64} className="mx-auto mb-6 text-muted-foreground opacity-10" />
            <p className="text-muted-foreground font-serif text-xl italic">لم نجد نتائج تطابق بحثك...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredJuz.map((juz, index) => (
              <JuzCard 
                key={juz.number} 
                juz={juz} 
                index={index} 
                isBookmarked={bookmark?.juz === juz.number} 
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-32 py-20 border-t border-border/40 bg-card/30 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 pattern-islamic opacity-[0.02]" />
        <div className="container max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="w-16 h-16 bg-emerald-deep rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-lg">
            <MoonStar size={32} className="text-gold" strokeWidth={1} />
          </div>
          <h2 className="font-serif text-3xl font-light text-primary mb-4">القرآن الكريم</h2>
          <p className="text-muted-foreground font-naskh text-sm mb-8">
            مصحف المدينة المنورة الإلكتروني - وقف لله تعالى
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.5em] font-light">
              Digital Quran Experience • 2026
            </p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showIndex && <JuzIndex onClose={() => setShowIndex(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
