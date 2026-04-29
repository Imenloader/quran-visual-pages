import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Search as SearchIcon, X, Shield, BookOpen, ChevronDown, ChevronUp, Copy, Check, Sunrise, Sunset, Moon, AlarmClock, Building, House, UtensilsCrossed, Plane, Shirt, Volume2, Heart, Stethoscope, Compass, Droplets, DoorOpen, Cloud, Share2 } from "lucide-react";
import { ATHKAR_DATA, type AthkarCategory } from "@/data/athkarData";
import { useFavorites } from "@/hooks/useFavorites";
import { toArabicNumber } from "@/data/quranData";
import ScrollReveal from "@/components/ScrollReveal";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

import { useTheme } from "@/contexts/ThemeContext";
import { applyTajweedColors, rules } from "@/lib/tajweedParser";
import FontSizeAdjuster from "@/components/FontSizeAdjuster";

import { useUser } from "@/contexts/UserContext";

const ICON_MAP: Record<string, React.ReactNode> = {
  sunrise: <Sunrise size={20} />,
  sunset: <Sunset size={20} />,
  moon: <Moon size={20} />,
  alarm: <AlarmClock size={20} />,
  prayer: <Shield size={20} />,
  building: <Building size={20} />,
  home: <House size={20} />,
  utensils: <UtensilsCrossed size={20} />,
  plane: <Plane size={20} />,
  shirt: <Shirt size={20} />,
  volume: <Volume2 size={20} />,
  heart: <Heart size={20} />,
  stethoscope: <Stethoscope size={20} />,
  compass: <Compass size={20} />,
  droplets: <Droplets size={20} />,
  door: <DoorOpen size={20} />,
  cloud: <Cloud size={20} />,
  book: <BookOpen size={20} />,
  shield: <Shield size={20} />,
};

const COUNTER_KEY = "athkar-counters";

const getCounters = (): Record<number, number> => {
  try {
    const data = localStorage.getItem(COUNTER_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};

const TajweedLegend = ({ className }: { className?: string }) => {
  return (
    <div className={`flex flex-wrap justify-center gap-2 sm:gap-4 p-4 rounded-2xl bg-muted/30 backdrop-blur-md border border-border/20 ${className}`}>
      {rules.map((rule) => (
        <div key={rule.name} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full shadow-sm" 
            style={{ backgroundColor: rule.color }}
          />
          <span className="text-[10px] sm:text-xs font-serif font-bold text-primary/80">
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const Athkar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { tajweedMode, fontSizes } = useTheme();
  const isArabic = i18n.language === 'ar';
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [counters, setCounters] = useState<Record<number, number>>(getCounters());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addAthkarRecited } = useUser();
  const [categories, setCategories] = useState<AthkarCategory[]>(ATHKAR_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemoteAthkar = async () => {
      try {
        const snap = await getDocs(collection(db, "content_athkar"));
        const firestoreData = snap.docs.map(d => d.data() as AthkarCategory);
        
        // Merge strategy: Firestore overrides local if ID matches
        const localData = ATHKAR_DATA;
        const combined = [...firestoreData];
        localData.forEach(local => {
          if (!combined.find(c => c.id === local.id)) {
            combined.push(local);
          }
        });
        setCategories(combined);
      } catch (err) {
        console.error("Athkar fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRemoteAthkar();
  }, []);

  // Strip Arabic diacritics for search
  const stripDiacritics = (s: string) => s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "");

  const filteredData = useMemo(() => {
    const q = stripDiacritics(searchQuery.trim());
    if (!q) return categories;
    return categories.map(cat => {
      const matchingAthkar = cat.athkar.filter(
        d => (d.text && stripDiacritics(d.text).includes(q)) || 
             (d.reference && d.reference.includes(q)) || 
             (d.virtue && stripDiacritics(d.virtue).includes(q))
      );
      const categoryMatches = (cat.title && cat.title.includes(q)) || (cat.description && cat.description.includes(q));
      if (categoryMatches) return cat;
      if (matchingAthkar.length === 0) return null;
      return { ...cat, athkar: matchingAthkar };
    }).filter(Boolean) as AthkarCategory[];
  }, [searchQuery, categories]);

  const isSearching = searchQuery.trim().length > 0;

  const incrementCounter = useCallback((dhikrId: number) => {
    setCounters(prev => {
      const updated = { ...prev, [dhikrId]: (prev[dhikrId] || 0) + 1 };
      localStorage.setItem(COUNTER_KEY, JSON.stringify(updated));
      return updated;
    });
    addAthkarRecited(1);
  }, [addAthkarRecited]);

  const resetCounters = useCallback(() => {
    setCounters({});
    localStorage.removeItem(COUNTER_KEY);
  }, []);

  const copyText = useCallback((text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const shareWhatsApp = useCallback((text: string, reference: string) => {
    const msg = `${text}\n\n📖 ${reference}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const totalAthkar = ATHKAR_DATA.reduce((sum, cat) => sum + cat.athkar.length, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent/20">
      {/* Immersive Header */}
      <header className="relative overflow-hidden bg-emerald-deep min-h-[50vh] flex items-center justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald/10 rounded-full blur-[100px] opacity-30" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px] opacity-20" />
        </div>

        <div className="relative z-10 container max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center mb-16">
            <BackButton variant="ghost" />
            
            <div className="flex items-center gap-4">
              <Link 
                to="/favorites" 
                className="h-12 px-6 rounded-full bg-primary/5 backdrop-blur-md flex items-center gap-3 text-xs font-sans font-bold tracking-widest text-white/70 hover:text-white hover:bg-primary/10 transition-all border border-primary/10 uppercase"
              >
                <Heart size={16} strokeWidth={1.5} />
                <span>{t("hub.favorites")}</span>
              </Link>
              <button 
                onClick={resetCounters}
                className="h-12 px-6 rounded-full bg-gold/10 backdrop-blur-md flex items-center gap-3 text-xs font-sans font-bold tracking-widest text-gold border border-gold/20 uppercase"
              >
                <span>{t("athkar.resetCounters")}</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <div
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 backdrop-blur-md mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-white/80 uppercase">{t("athkar.spiritualFortress")}</span>
            </div>
            
            <h1 
              className="text-6xl sm:text-8xl font-serif font-light text-white mb-8 tracking-tighter"
            >
              {t("athkar.title").split('&')[0]} <span className="italic font-light text-gold/80">&</span> {t("athkar.title").split('&')[1]}
            </h1>
            
            <p 
              className="text-white/80 font-serif italic text-xl max-w-2xl mx-auto leading-relaxed mb-12"
            >
              {t("athkar.subtitle")}
            </p>

            <div 
              className="flex items-center justify-center gap-12"
            >
              <div className="flex flex-col items-center">
                <span className="text-4xl font-serif text-gold mb-1">{isArabic ? toArabicNumber(ATHKAR_DATA.length) : ATHKAR_DATA.length}</span>
                <span className="text-[10px] font-sans font-bold text-white/60 uppercase tracking-[0.3em]">{t("athkar.sections")}</span>
              </div>
              <div className="w-px h-12 bg-primary/10" />
              <div className="flex flex-col items-center">
                <span className="text-4xl font-serif text-gold mb-1">{isArabic ? toArabicNumber(totalAthkar) : totalAthkar}</span>
                <span className="text-[10px] font-sans font-bold text-white/60 uppercase tracking-[0.3em]">{t("athkar.remembrances")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Ornament */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
      </header>

      <main className="flex-1 container max-w-4xl mx-auto px-6 -mt-12 pb-32 relative z-20">
        {/* Search - Exquisite Style */}
        <div>
          {/* Search & Stats Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-12">
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
              <input
                type="text"
                placeholder={t("athkar.searchPlaceholder")}
                className="w-full h-14 pr-12 pl-6 rounded-2xl bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 font-naskh text-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <FontSizeAdjuster context="athkar" />
          </div>
        </div>

        {tajweedMode && (
          <div className="mb-12">
            <TajweedLegend />
          </div>
        )}

        {isSearching && (
          <div className="mb-8 px-4">
            <span className="text-xs font-serif italic text-primary/80">
              {filteredData.length > 0
                ? t("athkar.resultsFound", { count: toArabicNumber(filteredData.reduce((s, c) => s + c.athkar.length, 0)), sections: toArabicNumber(filteredData.length) })
                : t("athkar.noResults", { query: searchQuery })}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {filteredData.map((category, idx) => {
            const isExpanded = isSearching || expandedCategories.includes(category.id);
            return (
              <ScrollReveal key={category.id} index={idx}>
                <div 
                  className={`group rounded-[2.5rem] overflow-hidden ${isExpanded ? "bg-card shadow-islamic ring-1 ring-primary/5" : "bg-card/60 shadow-soft"}`}
                >
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-6 px-6 py-8 text-right"
                  >
                    <div 
                      className="w-16 h-16 rounded-[1.5rem] bg-primary text-gold flex items-center justify-center shrink-0 shadow-lg border border-primary/10"
                    >
                      {ICON_MAP[category.iconName] || <BookOpen size={28} strokeWidth={1.5} />}
                    </div>
                    
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-xl font-bold text-primary group-hover:text-accent transition-colors">{category.title}</h3>
                          <p className="text-sm text-primary/70 font-serif italic mt-1 line-clamp-1">
                            {category.description} • {isArabic ? toArabicNumber(category.athkar.length) : category.athkar.length} {t("athkar.remembrances")}
                          </p>
                        </div>

                    <div
                      className={`w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary/20 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <ChevronDown size={20} strokeWidth={1.5} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="overflow-hidden">
                      <div className="px-6 pb-8 space-y-6">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                        
                        {category.athkar.map((dhikr, dIdx) => {
                          const currentCount = counters[dhikr.id] || 0;
                          const isDone = dhikr.count > 0 && currentCount >= dhikr.count;
                          return (
                            <div 
                              key={dhikr.id} 
                              className={`relative p-8 rounded-[2rem] border ${isDone ? "bg-emerald-deep/5 border-emerald-deep/10" : "bg-primary/5 border-primary/5"}`}
                            >
                              <p 
                                className="font-quran leading-[1.8] text-primary text-center mb-8 selection:bg-accent/20"
                                style={{ fontSize: `${fontSizes.athkar || 22}px` }}
                              >
                                {tajweedMode ? applyTajweedColors(dhikr.text) : dhikr.text}
                              </p>
                              
                              {dhikr.virtue && (
                                <div className="flex items-start gap-4 mb-8 p-6 rounded-2xl bg-accent/5 border border-accent/10 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-12 h-12 ornament-border opacity-10 pointer-events-none" />
                                  <span className="text-accent shrink-0 mt-1">
                                    <BookOpen size={18} strokeWidth={1.5} />
                                  </span>
                                  <p className="text-sm font-serif italic text-accent leading-relaxed">
                                    {dhikr.virtue}
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                  {dhikr.count > 0 && (
                                    <button
                                      onClick={() => incrementCounter(dhikr.id)}
                                      className={`h-12 min-w-[120px] px-6 rounded-2xl text-sm font-serif font-bold flex items-center justify-center gap-3 shadow-sm ${
                                        isDone
                                          ? "bg-emerald-deep text-white"
                                          : "bg-accent text-accent-foreground"
                                      }`}
                                    >
                                      {isDone ? (
                                        <>
                                          <Check size={18} strokeWidth={2} />
                                          <span>{t("athkar.done")}</span>
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">{isArabic ? toArabicNumber(currentCount) : currentCount}</span>
                                          <span className="text-muted-foreground">/</span>
                                          <span>{isArabic ? toArabicNumber(dhikr.count) : dhikr.count}</span>
                                        </div>
                                      )}
                                    </button>
                                  )}
                                  <span className="px-4 py-2 rounded-xl bg-primary/5 text-[10px] font-bold text-primary/70 uppercase tracking-widest border border-primary/5">
                                    {dhikr.reference}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card/80 shadow-soft border border-primary/5">
                                  <button
                                    onClick={() => toggleFavorite({ type: "dhikr", id: dhikr.id, categoryId: category.id })}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFavorite("dhikr", dhikr.id) ? "text-red-500 bg-red-50" : "text-primary/60"}`}
                                    title="إضافة للمفضلة"
                                  >
                                    <Heart size={18} strokeWidth={1.5} fill={isFavorite("dhikr", dhikr.id) ? "currentColor" : "none"} />
                                  </button>
                                  
                                  <button 
                                    onClick={() => copyText(dhikr.text, dhikr.id)} 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-primary/60" 
                                    title="نسخ"
                                  >
                                    {copiedId === dhikr.id ? <Check size={18} className="text-accent" strokeWidth={2} /> : <Copy size={18} strokeWidth={1.5} />}
                                  </button>
                                  
                                  <button 
                                    onClick={() => shareWhatsApp(dhikr.text, dhikr.reference)} 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-primary/60" 
                                    title="مشاركة"
                                  >
                                    <Share2 size={18} strokeWidth={1.5} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </main>

      <footer className="relative py-20 text-center border-t border-primary/5 bg-card/40 overflow-hidden">
        <div className="absolute inset-0 pattern-islamic opacity-[0.02] pointer-events-none" />
        <div className="relative z-10 container max-w-lg mx-auto px-6">
          <div className="w-12 h-12 ornament-border opacity-20 mx-auto mb-8" />
          <p className="font-serif italic text-primary/70 text-sm leading-relaxed">
            {t("athkar.source")}
          </p>
          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-primary/10" />
            <span className="text-[10px] font-bold text-primary/50 uppercase tracking-[0.4em]">{t("athkar.charity")}</span>
            <div className="h-px w-12 bg-primary/10" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Athkar;
