import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { juzData, toArabicNumber, surahIndex, SurahInfo } from "@/data/quranData";
import { dailyVerses } from "@/data/dailyVersesData";
import JuzCard from "@/components/JuzCard";
import JuzIndex from "@/components/JuzIndex";
import SyncStatusIndicator from "@/components/SyncStatusIndicator";
import { Search, List, Settings, BookMarked, ChevronLeft, Heart, Sparkles, Clock, Sun, MoonStar } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { normalizeArabic } from "@/lib/arabicUtils";
import { applyTajweedColors } from "@/lib/tajweedParser";
import { useNativeWidgets } from "@/hooks/useNativeWidgets";
import { usePrayerTimes, formatTime, PRAYER_NAMES } from "@/hooks/usePrayerTimes";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { sunnahActions } from "@/data/sunnahData";
import GlobalKhatmaBanner from "@/components/GlobalKhatmaBanner";

const BOOKMARK_KEY = "quran-bookmark";

interface BookmarkData {
  juz: number;
  page: number;
  readingMode: "image" | "text";
  verseKey?: string;
}

const Index = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();
  
  const [bookmark, setBookmark] = useState<BookmarkData | null>(null);
  const [showIndex, setShowIndex] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [surahResults, setSurahResults] = useState<SurahInfo[]>([]);
  const { tajweedMode } = useTheme();

  // Widget Hooks
  useNativeWidgets();

  const { nextPrayer, settings: prayerSettings } = usePrayerTimes();

  const verseOfDay = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return dailyVerses[dayOfYear % dailyVerses.length];
  }, []);

  const sunnahOfDay = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return sunnahActions[dayOfYear % sunnahActions.length];
  }, []);

  useEffect(() => {
    const savedBookmark = localStorage.getItem(BOOKMARK_KEY);
    if (savedBookmark) {
      try {
        const parsed = JSON.parse(savedBookmark);
        // Handle wrapped syncService payload format: { data: { juz, page }, _syncedAt }
        const bookmarkData = (parsed && typeof parsed === 'object' && '_syncedAt' in parsed) 
          ? parsed.data 
          : parsed;

        // Validate bookmark payload
        if (bookmarkData && typeof bookmarkData.juz === 'number' && typeof bookmarkData.page === 'number') {
          setBookmark(bookmarkData);
        } else {
          localStorage.removeItem(BOOKMARK_KEY);
        }
      } catch (e) {
        console.error("Error parsing bookmark:", e);
        localStorage.removeItem(BOOKMARK_KEY);
      }
    }
  }, []);

  const handleResumeReading = useCallback(() => {
    if (bookmark) {
      navigate(`/juz/${bookmark.juz}#page-${bookmark.page}`);
    }
  }, [bookmark, navigate]);

  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return juzData;
    const normalizedQuery = normalizeArabic(searchQuery.trim());
    const query = normalizedQuery.toLowerCase();

    return juzData.filter(juz => 
      juz.number.toString() === query ||
      normalizeArabic(juz.nameAr).includes(normalizedQuery) ||
      juz.nameEn.toLowerCase().includes(query) ||
      normalizeArabic(juz.startSurah).includes(normalizedQuery)
    );
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSurahResults([]);
      return;
    }

    const searchQuran = () => {
      const normalizedQuery = normalizeArabic(searchQuery.trim());
      const query = normalizedQuery.toLowerCase();
      
      const matchedSurahs = surahIndex.filter(s => {
        const normalizedName = normalizeArabic(s.name);
        return normalizedName.includes(normalizedQuery) || 
               s.nameEn.toLowerCase().includes(query) ||
               s.number.toString() === query ||
               (normalizedQuery.startsWith("سوره ") && normalizedName.includes(normalizedQuery.replace("سوره ", "")));
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
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Hero Section */}
      <section className="relative w-full pt-16 pb-24 px-6 md:px-12 md:pt-24 md:pb-32 flex flex-col items-center justify-center overflow-hidden rounded-b-[3rem] shadow-islamic mb-8">
        {/* Deep, Rich Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-deep to-primary transform-gpu" />
        
        {/* Cinematic Lighting Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-emerald-950/40 to-emerald-deep/90 transform-gpu mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-deep/90 via-transparent to-gold/5 mix-blend-multiply transform-gpu" />
        
        {/* Glowing Orbs for Depth */}
        <div className="absolute -top-[30%] -right-[10%] w-[80%] h-[80%] bg-gold/15 rounded-full blur-[120px] md:blur-[160px] pointer-events-none transform-gpu" />
        <div className="absolute top-[20%] -left-[20%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transform-gpu" />
        
        {/* Subtle Textured Pattern */}
        <div className="absolute inset-0 pattern-islamic opacity-[0.08] scale-[1.2] transform-gpu pointer-events-none mix-blend-soft-light" />
        
        {/* Floating Particles/Dust (CSS illusion) */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-screen" />
        
        {/* Top Floating App Info (Replaces bland top bar) */}
        <div className="relative z-20 w-full max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-6 mb-16 md:mb-24">
          <SyncStatusIndicator darkTheme />
          
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-gradient-to-l from-gold/60 to-transparent" />
            <span className="font-serif font-bold text-xl md:text-2xl text-gold drop-shadow-md">{t('app.title')}</span>
            <MoonStar className="text-gold size-6 md:size-8" strokeWidth={1.5} />
            <div className="h-px w-8 bg-gradient-to-r from-gold/60 to-transparent" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
            <Sparkles size={14} className="text-gold" />
            <span className="text-xs font-bold text-gold tracking-wide uppercase">{t("index.hero.badge")}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight font-light">
            {t("index.hero.title")}
          </h1>
          
          <p className="text-white/80 font-naskh text-lg md:text-2xl max-w-2xl leading-relaxed">
            {t("index.hero.description")}
          </p>

          {/* Floating Action Card (Resume/Start) */}
          <div className="mt-12 w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-4 flex flex-col sm:flex-row items-center justify-between shadow-2xl hover:bg-white/15 transition-all gap-4">
            {bookmark ? (
              <>
                <div className="flex items-center gap-4 text-white text-right w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-gold shadow-inner shrink-0">
                    <BookMarked size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-gold/80">{t("index.hero.lastRead")}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-serif text-lg font-bold">{t("index.hero.juz")} {i18n.language === "ar" ? toArabicNumber(bookmark.juz) : bookmark.juz}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
                      <span className="font-serif text-sm opacity-80">{t("index.hero.page")} {i18n.language === "ar" ? toArabicNumber(bookmark.page) : bookmark.page}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    Haptics.impact({ style: ImpactStyle.Medium });
                    handleResumeReading();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gold text-emerald-950 px-8 py-3 rounded-xl font-naskh text-base font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shrink-0"
                >
                  <span>{t("index.hero.resume")}</span>
                  <ChevronLeft size={18} strokeWidth={2} />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  Haptics.impact({ style: ImpactStyle.Medium });
                  setShowIndex(true);
                }}
                className="w-full flex items-center justify-center gap-3 bg-gold text-emerald-950 px-8 py-4 rounded-xl font-naskh text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                <List size={22} strokeWidth={2} />
                <span>{t("index.hero.start")}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1 container-responsive pb-12 pt-4 md:pb-16 md:pt-8 space-y-8 md:space-y-12 relative z-30">
        {/* Global Community Challenge */}
        <ScrollReveal>
          <GlobalKhatmaBanner />
        </ScrollReveal>

        {/* Refined Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Verse of the Day Section */}
          <ScrollReveal className="lg:col-span-2">
            <section className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-card/60 backdrop-blur-2xl border border-border/40 p-6 md:p-10 shadow-islamic group flex flex-col justify-between h-full hover:bg-card/80 transition-colors">
              <div className="absolute inset-0 pattern-islamic opacity-[0.02] scale-150 pointer-events-none" />
              <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                    <Sparkles size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-bold text-accent font-serif">{t("hub.verseOfDay")}</span>
                </div>

                {verseOfDay && (
                  <div className="space-y-4 md:space-y-6">
                    <p className="text-2xl md:text-4xl font-quran text-primary leading-loose px-2">
                      {tajweedMode ? applyTajweedColors(verseOfDay.text) : verseOfDay.text}
                    </p>
                    <div className="flex items-center gap-3 text-sm font-bold text-accent/80 font-serif">
                      <span>{t("index.verseOfDay.surah")} {verseOfDay.surah}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                      <span>{t("index.verseOfDay.ayah")} {i18n.language === "ar" ? toArabicNumber(verseOfDay.number) : verseOfDay.number}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative z-10 pt-6 mt-6 border-t border-border/20">
                <Link 
                  to="/daily-verse"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary/60 hover:text-accent transition-colors"
                >
                  <span>اقرأ المزيد عن آية اليوم</span>
                  <ChevronLeft size={16} />
                </Link>
              </div>
            </section>
          </ScrollReveal>

          <div className="flex flex-col gap-4 md:gap-6 lg:col-span-1">
            {/* Next Prayer Mini-Widget */}
            {nextPrayer && (
              <ScrollReveal>
                <section
                  onClick={() => {
                    Haptics.impact({ style: ImpactStyle.Light });
                    navigate("/prayer-times");
                  }}
                  className="relative overflow-hidden rounded-[2rem] bg-emerald-900/10 backdrop-blur-2xl border border-emerald-900/20 p-6 shadow-islamic group cursor-pointer hover:bg-emerald-900/15 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-center h-full min-h-[160px]"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-600 font-serif">الصلاة القادمة</span>
                      </div>
                      <h3 className="text-2xl font-naskh font-bold text-primary">{PRAYER_NAMES[nextPrayer.name]}</h3>
                      <p className="text-sm text-muted-foreground">متبقي وقت: <span className="font-bold text-primary">{formatTime(nextPrayer.time, prayerSettings?.timeFormat || "12h")}</span></p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                       <Clock size={28} strokeWidth={1.5} />
                    </div>
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* Sunnah of the Day Card */}
            {sunnahOfDay && (
              <ScrollReveal>
                <section
                  onClick={() => {
                    Haptics.impact({ style: ImpactStyle.Light });
                    navigate("/daily-adhkar");
                  }}
                  className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gold/5 to-primary/5 border border-gold/10 p-6 shadow-sm group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-center h-full min-h-[160px]"
                >
                  <div className="relative z-10 flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                        <Sun size={24} strokeWidth={1.5} />
                     </div>
                     <div className="space-y-2">
                        <span className="text-xs font-bold text-gold font-serif">سنة اليوم</span>
                        <h3 className="text-lg font-naskh font-bold text-primary leading-snug">
                          {isAr ? sunnahOfDay.textAr : sunnahOfDay.textEn}
                        </h3>
                     </div>
                  </div>
                </section>
              </ScrollReveal>
            )}
          </div>
        </div>

        {/* Search Results - Editorial Style */}
        {surahResults.length > 0 && (
          <ScrollReveal>
            <div className="mb-12 space-y-8">
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
                    className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-card/80 backdrop-blur-md border border-border/40 hover:border-accent/40 hover:shadow-islamic transition-all text-right group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors pointer-events-none" />
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-serif text-xl group-hover:bg-primary group-hover:text-white transition-all shadow-inner relative z-10 shrink-0">
                      {i18n.language === "ar" ? toArabicNumber(surah.number) : surah.number}
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="font-serif font-bold text-primary text-xl">{t("index.verseOfDay.surah")} {i18n.language === "ar" ? surah.name : surah.nameEn}</div>
                      <div className="text-sm text-muted-foreground font-naskh mt-1">{t("index.hero.ayah")} {i18n.language === "ar" ? toArabicNumber(surah.startPage) : surah.startPage}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-white transition-all relative z-10 shrink-0" aria-hidden="true">
                      <ChevronLeft size={18} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Juz Grid Section - Refined */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ornament-border pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <List size={24} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-serif font-medium text-primary">{t("index.juzSection.title")}</h2>
            </div>
            
            <div className="flex items-center gap-3 bg-card/50 p-1.5 rounded-3xl border border-border/40 backdrop-blur-sm">
              <div className="relative flex items-center w-full sm:w-64 bg-background rounded-2xl border border-border/40 px-4 h-12 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm">
                <Search size={18} className="text-muted-foreground ml-3" />
                <input 
                  type="text" 
                  placeholder={t("index.search.placeholder") || "بحث..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none text-sm font-naskh placeholder:text-muted-foreground text-primary"
                  dir="rtl"
                />
              </div>

              <Link 
                to="/favorites" 
                aria-label={t("nav.favorites") || "Favorites"}
                className="w-12 h-12 shrink-0 rounded-2xl bg-background border border-border/40 text-destructive flex items-center justify-center hover:bg-destructive/5 hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                <Heart size={20} fill={filteredJuz.length > 0 ? "none" : "currentColor"} strokeWidth={1.5} />
              </Link>
              <button 
                onClick={() => setShowIndex(true)} 
                aria-label={t("index.hero.start") || "Open Index"}
                className="w-12 h-12 shrink-0 rounded-2xl bg-background border border-border/40 text-primary flex items-center justify-center hover:bg-muted/50 hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                <Settings size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {filteredJuz.length === 0 ? (
            <div className="text-center py-32 bg-card/40 backdrop-blur-sm border border-dashed border-border/60 rounded-[3rem]">
              <Search size={64} className="mx-auto mb-6 text-muted-foreground opacity-20" />
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
        </ScrollReveal>
      </main>

      <footer className="mt-auto pt-16 pb-8 border-t border-border/40 bg-card/30 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 pattern-islamic opacity-[0.02] pointer-events-none" />
        <div className="container max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="w-16 h-16 bg-emerald-deep rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-lg">
            <MoonStar size={32} className="text-gold" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-3xl font-light text-primary mb-4">{t("index.footer.title")}</h2>
          <p className="text-muted-foreground font-naskh text-base mb-8">
            {t("index.footer.subtitle")}
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <p className="text-xs text-muted-foreground font-serif font-medium">
              Digital Quran Experience · 2026
            </p>
          </div>
        </div>
      </footer>

      {showIndex && <JuzIndex onClose={() => setShowIndex(false)} />}
    </div>
  );
};

export default Index;
