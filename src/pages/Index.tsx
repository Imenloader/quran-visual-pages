import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { juzData, toArabicNumber, surahIndex, surahByNumber, SurahInfo } from "@/data/quranData";
import { dailyVerses } from "@/data/dailyVersesData";
import JuzCard from "@/components/JuzCard";
import JuzIndex from "@/components/JuzIndex";
import QuranHeader from "@/components/QuranHeader";
import { Search, List, Headphones, BookOpen, MoonStar, Settings, BookMarked, ChevronLeft, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { normalizeArabic } from "@/lib/arabicUtils";
import { applyTajweedColors } from "@/lib/tajweedParser";
import { syncService } from "@/services/syncService";
import { useNativeWidgets } from "@/hooks/useNativeWidgets";
import { usePrayerTimes, formatTime, PRAYER_NAMES } from "@/hooks/usePrayerTimes";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Clock, Sun } from "lucide-react";
import { sunnahActions } from "@/data/sunnahData";
import GlobalKhatmaBanner from "@/components/GlobalKhatmaBanner";

const BOOKMARK_KEY = "quran-bookmark";

interface BookmarkData {
  juz: number;
  page: number;
  readingMode: "image" | "text";
  verseKey?: string;
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

function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [surahResults, setSurahResults] = useState<SurahInfo[]>([]);
  const [showIndex, setShowIndex] = useState(false);
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { setReadingMode, tajweedMode } = useTheme();
  const navigate = useNavigate();
  const { nextPrayer, settings } = usePrayerTimes();
  const [bookmark, setBookmark] = useState<BookmarkData | null>(null);
  const [verseOfDay, setVerseOfDay] = useState<{ text: string; surah: string; number: number } | null>(null);
  const [sunnahOfDay, setSunnahOfDay] = useState<{ textAr: string; textEn: string } | null>(null);
  
  // Sync to native widgets
  useNativeWidgets(verseOfDay);

  useEffect(() => {
    // Load bookmark from cloud/local
    const loadBookmark = async () => {
      const data = await syncService.loadData<BookmarkData | null>(BOOKMARK_KEY, null);
      setBookmark(data);
    };
    loadBookmark();

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

    const sunnahIndex = Math.abs(hash) % sunnahActions.length;
    const sunnah = sunnahActions[sunnahIndex];
    setSunnahOfDay({ textAr: sunnah.textAr, textEn: sunnah.textEn });
  }, []);

  const handleResumeReading = () => {
    if (bookmark) {
      if (bookmark.readingMode) {
        setReadingMode(bookmark.readingMode);
      }
      const hash = bookmark.readingMode === "text" && bookmark.verseKey 
        ? `#verse-${bookmark.verseKey}` 
        : `#page-${bookmark.page}`;
      navigate(`/juz/${bookmark.juz}${hash}`);
    }
  };

  const bookmarkInfo = useMemo(() => {
    if (!bookmark) return null;
    const juz = juzData.find((j) => j.number === bookmark.juz);
    const juzName = juz?.nameAr;
    
    if (bookmark.verseKey && bookmark.readingMode === "text") {
      const [surahNum, ayahNum] = bookmark.verseKey.split(":").map(Number);
      const surah = surahByNumber.get(surahNum);
      return {
        juzName,
        detail: `${surah?.name || ""} • ${t("index.hero.ayah")} ${i18n.language === "ar" ? toArabicNumber(ayahNum) : ayahNum}`
      };
    }
    
    return {
      juzName,
      detail: `${t("index.hero.page") || "صفحة"} ${i18n.language === "ar" ? toArabicNumber(bookmark.page) : bookmark.page}`
    };
  }, [bookmark, i18n.language, t]);

  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return juzData;
    const query = searchQuery.toLowerCase().trim();
    const normalizedQuery = normalizeArabic(query);
    
    return juzData.filter(
      (j) =>
        normalizeArabic(j.nameAr).includes(normalizedQuery) ||
        j.nameEn.toLowerCase().includes(query) ||
        String(j.number ?? "").includes(query) ||
        j.surahs.some(s => {
          const normalizedS = normalizeArabic(s);
          if (normalizedS.includes(normalizedQuery)) return true;
          // Look up English name in surahIndex
          const surah = surahIndex.find(si => si.name === s);
          return surah?.nameEn.toLowerCase().includes(query);
        })
    );
  }, [searchQuery]);

  useEffect(() => {
    const searchQuran = async () => {
      if (searchQuery.trim().length < 2) {
        setSurahResults([]);
        return;
      }

      const query = searchQuery.toLowerCase().trim();
      const normalizedQuery = normalizeArabic(query);
      
      // Search Surahs locally
      const matchedSurahs = surahIndex.filter(s => {
        const normalizedName = normalizeArabic(s.name);
        return normalizedName.includes(normalizedQuery) || 
               s.nameEn.toLowerCase().includes(query) ||
               s.number.toString() === query ||
               // Handle "سورة" prefix
               (normalizedQuery.startsWith("سوره ") && normalizedName.includes(normalizedQuery.replace("سوره ", "")))
      });
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
      <QuranHeader showBack={false} />
      
      <main className="container-responsive pb-32 -mt-12 md:-mt-24 relative z-30">
        {/* Global Community Challenge */}
        <div className="mb-8">
           <GlobalKhatmaBanner />
        </div>

        {/* Immersive Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-16">
          
          {/* Hero Section - The "Heart" of the App */}
          <div 
            className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-card/40 backdrop-blur-2xl border border-border/40 p-6 md:p-12 group shadow-islamic lg:col-span-2"
          >
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-1/2 -right-1/4 w-[120%] h-[120%] bg-gold/20 rounded-full blur-[80px] md:blur-[120px] opacity-10" />
              <div className="absolute inset-0 pattern-islamic opacity-[0.03] scale-150" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[300px] md:min-h-[350px]">
              <div>
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                    <Sparkles size={20} strokeWidth={1.5} className="md:w-[22px] md:h-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[10px] font-bold text-accent uppercase tracking-[0.3em] md:tracking-[0.4em]">{t("index.hero.badge")}</span>
                  </div>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-7xl font-serif font-light mb-4 md:mb-8 text-primary leading-[1.1] tracking-tight">
                  {t("index.hero.title")}
                  <br />
                  <span className="text-xl sm:text-2xl md:text-4xl text-primary font-naskh mt-2 md:mt-4 block">{t("index.hero.subtitle")}</span>
                </h1>
                
                <p className="text-muted-foreground font-naskh text-base md:text-xl max-w-2xl leading-relaxed border-r-2 border-accent/20 pr-4 md:pr-6">
                  {t("index.hero.description")}
                </p>
              </div>

              <div className="mt-8 md:mt-14 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                  {bookmark ? (
                    <button
                      onClick={() => {
                        import("@capacitor/haptics").then(({ Haptics, ImpactStyle }) => {
                          Haptics.impact({ style: ImpactStyle.Medium });
                        });
                        handleResumeReading();
                      }}
                      className="group relative flex items-center gap-3 md:gap-4 bg-accent text-accent-foreground px-6 md:px-10 py-3 md:py-4 rounded-2xl md:rounded-[2rem] font-naskh text-sm md:text-lg font-bold shadow-islamic hover:shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent opacity-0 group-hover:opacity-100" />
                      <BookMarked size={20} strokeWidth={1.5} className="relative z-10 md:w-6 md:h-6" />
                      <span className="relative z-10">{t("index.hero.resume")}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        Haptics.impact({ style: ImpactStyle.Medium });
                        setShowIndex(true);
                      }}
                      className="group relative flex items-center gap-3 md:gap-4 bg-primary text-primary-foreground px-6 md:px-10 py-3 md:py-4 rounded-2xl md:rounded-[2rem] font-naskh text-sm md:text-lg font-bold shadow-islamic hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent opacity-0 group-hover:opacity-100" />
                      <List size={20} strokeWidth={1.5} className="relative z-10 md:w-6 md:h-6" />
                      <span className="relative z-10">{t("index.hero.start")}</span>
                    </button>
                  )}

                  {bookmark && (
                    <div className="flex flex-col gap-1 md:gap-2 text-center sm:text-right">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold">{t("index.hero.lastRead")}</span>
                      </div>
                      <span className="text-lg md:text-xl font-naskh font-bold text-primary group-hover:text-accent">
                        {bookmarkInfo?.juzName} • {bookmarkInfo?.detail}
                      </span>
                    </div>
                  )}
                </div>

                {/* Integrated Search Bar */}
                <div className="flex-1 w-full max-w-md relative group">
                  <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors pointer-events-none md:w-[18px] md:h-[18px]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("index.search.placeholder")}
                    className="w-full bg-muted/30 backdrop-blur-md border border-border/40 rounded-xl md:rounded-2xl pr-12 pl-4 py-3 md:py-4 text-sm font-naskh text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Verse of the Day Section */}
          <section
            className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-card/40 backdrop-blur-2xl border border-border/40 p-6 md:p-8 shadow-islamic group lg:col-span-1 flex flex-col justify-between min-h-[300px] md:min-h-full"
          >
            <div className="absolute inset-0 pattern-islamic opacity-[0.02] scale-150" />
            <div className="relative z-10 text-center space-y-4 md:space-y-6">
              <div className="flex flex-col items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                  <Sparkles size={20} strokeWidth={1.5} className="md:w-6 md:h-6" />
                </div>
                <span className="text-[8px] md:text-[10px] font-bold text-accent uppercase tracking-[0.3em] md:tracking-[0.4em]">{t("hub.verseOfDay")}</span>
              </div>

              {verseOfDay && (
                <div className="space-y-3 md:space-y-4">
                  <p className="text-xl md:text-3xl font-quran text-primary leading-[1.8] px-2">
                    {tajweedMode ? applyTajweedColors(verseOfDay.text) : verseOfDay.text}
                  </p>
                  <div className="flex items-center justify-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-bold text-accent/60 uppercase tracking-[0.1em] md:tracking-[0.2em] font-serif italic">
                    <span>{t("index.verseOfDay.surah")} {verseOfDay.surah}</span>
                    <span className="w-1 h-1 rounded-full bg-accent/30" />
                    <span>{t("index.verseOfDay.ayah")} {i18n.language === "ar" ? toArabicNumber(verseOfDay.number) : verseOfDay.number}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative z-10 pt-4 md:pt-6 border-t border-border/20 text-center">
              <Link 
                to="/daily-verse"
                className="text-[8px] md:text-[10px] font-bold text-primary/40 hover:text-accent transition-colors uppercase tracking-widest"
              >
                عرض جميع آيات التدبر
              </Link>
            </div>
          </section>

          {/* Next Prayer Mini-Widget */}
          {nextPrayer && (
            <section
              onClick={() => {
                Haptics.impact({ style: ImpactStyle.Light });
                navigate("/prayer-times");
              }}
              className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-emerald-900/10 backdrop-blur-2xl border border-emerald-900/20 p-6 md:p-8 shadow-islamic group lg:col-span-1 flex flex-col justify-center cursor-pointer hover:bg-emerald-900/20 transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">الصلاة القادمة</span>
                  </div>
                  <h3 className="text-2xl font-naskh font-bold text-primary">{PRAYER_NAMES[nextPrayer.name]}</h3>
                  <p className="text-xs text-muted-foreground">موعد الأذان: <span className="font-bold text-primary">{formatTime(nextPrayer.time, settings.timeFormat)}</span></p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                   <Clock size={32} strokeWidth={1.5} />
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sunnah of the Day Card */}
        {sunnahOfDay && (
          <section className="mb-8 md:mb-16">
            <div 
              className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-gold/5 to-primary/5 border border-gold/10 p-6 md:p-10 shadow-sm"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4 md:gap-6">
                   <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gold/10 flex items-center justify-center text-gold shadow-inner">
                      <Sun size={32} strokeWidth={1.5} className="md:w-10 md:h-10" />
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gold uppercase tracking-[0.4em]">سنة اليوم</span>
                      <h3 className="text-xl md:text-3xl font-naskh font-bold text-primary">
                        {isAr ? sunnahOfDay.textAr : sunnahOfDay.textEn}
                      </h3>
                   </div>
                </div>
                <button 
                  onClick={() => navigate("/daily-adhkar")}
                  className="bg-gold text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {isAr ? "اكتشف السنن النبوية" : "Explore Sunnah"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Search Results - Editorial Style */}
        {surahResults.length > 0 && (
          <div className="mb-24 space-y-16">
            <div className="space-y-8">
              <div className="flex items-center gap-4 px-2 ornament-border pb-6">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Sparkles size={24} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-serif font-medium text-primary">{t("index.juzSection.surahResults")}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {surahResults.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => handleSurahClick(surah)}
                    className="flex items-center gap-6 p-6 rounded-[3rem] bg-card/60 backdrop-blur-md border border-border/40 hover:border-accent/40 hover:shadow-islamic transition-all text-right group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-serif text-xl group-hover:bg-primary group-hover:text-white transition-all shadow-inner relative z-10">
                      {i18n.language === "ar" ? toArabicNumber(surah.number) : surah.number}
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="font-serif font-bold text-primary text-xl">{t("index.verseOfDay.surah")} {i18n.language === "ar" ? surah.name : surah.nameEn}</div>
                      <div className="text-xs text-muted-foreground font-naskh mt-1">{t("index.hero.ayah")} {i18n.language === "ar" ? toArabicNumber(surah.startPage) : surah.startPage}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-white transition-all relative z-10" aria-hidden="true">
                      <ChevronLeft size={18} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Juz Grid Section - Refined */}
        <div className="flex items-center justify-between mb-12 ornament-border pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
              <List size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-serif font-medium text-primary">{t("index.juzSection.title")}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/favorites" 
              aria-label={t("nav.favorites") || "Favorites"}
              className="w-12 h-12 rounded-2xl bg-card border border-border/60 text-destructive flex items-center justify-center hover:bg-destructive/5 transition-all"
            >
              <Heart size={20} fill={filteredJuz.length > 0 ? "none" : "currentColor"} strokeWidth={1.5} />
            </Link>
            <button 
              onClick={() => setShowIndex(true)} 
              aria-label={t("index.hero.start") || "Open Index"}
              className="w-12 h-12 rounded-2xl bg-card border border-border/60 text-primary flex items-center justify-center hover:bg-muted/50 transition-all"
            >
              <Settings size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {filteredJuz.length === 0 ? (
          <div className="text-center py-32 bg-card/40 backdrop-blur-sm border border-dashed border-border/60 rounded-[3rem]">
            <Search size={64} className="mx-auto mb-6 text-muted-foreground opacity-10" />
            <p className="text-muted-foreground font-serif text-xl italic">{t("index.search.noResults")}</p>
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
          <h2 className="font-serif text-3xl font-light text-primary mb-4">{t("index.footer.title")}</h2>
          <p className="text-muted-foreground font-naskh text-sm mb-8">
            {t("index.footer.subtitle")}
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.5em] font-light">
              Digital Quran Experience • 2026
            </p>
          </div>
        </div>
      </footer>

      {showIndex && <JuzIndex onClose={() => setShowIndex(false)} />}
    </div>
  );
};

export default Index;
