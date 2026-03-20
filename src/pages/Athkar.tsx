import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Home, Search, X, Shield, BookOpen, ChevronDown, ChevronUp, Copy, Check, Sunrise, Sunset, Moon, AlarmClock, Building, House, UtensilsCrossed, Plane, Shirt, Volume2, Heart, Stethoscope, Compass, Droplets, DoorOpen, Cloud, Share2, ArrowRight } from "lucide-react";
import { ATHKAR_DATA, type AthkarCategory } from "@/data/athkarData";
import { useFavorites } from "@/hooks/useFavorites";
import { toArabicNumber } from "@/data/quranData";
import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

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

const Athkar = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("morning");
  const [counters, setCounters] = useState<Record<number, number>>(getCounters());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleFavorite, isFavorite } = useFavorites();

  // Strip Arabic diacritics for search
  const stripDiacritics = (s: string) => s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "");

  const filteredData = useMemo(() => {
    const q = stripDiacritics(searchQuery.trim());
    if (!q) return ATHKAR_DATA;
    return ATHKAR_DATA.map(cat => {
      const matchingAthkar = cat.athkar.filter(
        d => stripDiacritics(d.text).includes(q) || d.reference.includes(q) || (d.virtue && stripDiacritics(d.virtue).includes(q))
      );
      const categoryMatches = cat.title.includes(q) || cat.description.includes(q);
      if (categoryMatches) return cat;
      if (matchingAthkar.length === 0) return null;
      return { ...cat, athkar: matchingAthkar };
    }).filter(Boolean) as AthkarCategory[];
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const incrementCounter = useCallback((dhikrId: number) => {
    setCounters(prev => {
      const updated = { ...prev, [dhikrId]: (prev[dhikrId] || 0) + 1 };
      localStorage.setItem(COUNTER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

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
    setExpandedCategory(prev => prev === id ? null : id);
  }, []);

  const totalAthkar = ATHKAR_DATA.reduce((sum, cat) => sum + cat.athkar.length, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent/20">
      {/* Immersive Header */}
      <header className="relative overflow-hidden bg-emerald-deep min-h-[50vh] flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald/10 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]" 
          />
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                y: -150,
                x: Math.sin(i) * 50
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity, 
                delay: Math.random() * 5,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-gold/40 rounded-full"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${80 + Math.random() * 20}%` 
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center mb-16">
            <Link 
              to="/" 
              className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10"
            >
              <ArrowRight size={24} strokeWidth={1.5} />
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/favorites" 
                className="h-12 px-6 rounded-full bg-white/5 backdrop-blur-md flex items-center gap-3 text-xs font-sans font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10 uppercase"
              >
                <Heart size={16} strokeWidth={1.5} />
                <span>Favorites</span>
              </Link>
              <button 
                onClick={resetCounters}
                className="h-12 px-6 rounded-full bg-gold/10 backdrop-blur-md flex items-center gap-3 text-xs font-sans font-bold tracking-widest text-gold hover:bg-gold/20 transition-all border border-gold/20 uppercase"
              >
                <span>Reset Counters</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-white/80 uppercase">Spiritual Fortress</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl sm:text-8xl font-serif font-light text-white mb-8 tracking-tighter"
            >
              الأذكار <span className="italic font-light text-gold/80">&</span> الأدعية
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 font-serif italic text-xl max-w-2xl mx-auto leading-relaxed mb-12"
            >
              مجموعة مختارة من صحيح السنة النبوية المطهرة، لتكون حصناً للمسلم في يومه وليله
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-12"
            >
              <div className="flex flex-col items-center">
                <span className="text-4xl font-serif text-gold mb-1">{toArabicNumber(ATHKAR_DATA.length)}</span>
                <span className="text-[10px] font-sans font-bold text-white/60 uppercase tracking-[0.3em]">Sections</span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-4xl font-serif text-gold mb-1">{toArabicNumber(totalAthkar)}</span>
                <span className="text-[10px] font-sans font-bold text-white/60 uppercase tracking-[0.3em]">Remembrances</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Bottom Ornament */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
      </header>

      <main className="flex-1 container max-w-4xl mx-auto px-6 -mt-12 pb-32 relative z-20">
        {/* Search - Exquisite Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl rounded-[2.5rem] shadow-islamic -z-10" />
          <Search size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في كنوز الأذكار..."
            className="w-full bg-transparent border-none rounded-[2.5rem] pr-16 pl-16 py-6 text-lg font-serif text-primary placeholder:text-primary/60 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery("")} 
                className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary/5 text-primary/40 hover:text-primary flex items-center justify-center transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {isSearching && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 px-4"
          >
            <span className="text-xs font-serif italic text-primary/80">
              {filteredData.length > 0
                ? `تم العثور على ${toArabicNumber(filteredData.reduce((s, c) => s + c.athkar.length, 0))} نتيجة في ${toArabicNumber(filteredData.length)} أقسام`
                : `لم نجد نتائج للبحث عن "${searchQuery}"`}
            </span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {filteredData.map((category, idx) => {
            const isExpanded = isSearching || expandedCategory === category.id;
            return (
              <ScrollReveal key={category.id} index={idx}>
                <motion.div 
                  layout
                  className={`group rounded-[2.5rem] overflow-hidden transition-all duration-500 ${isExpanded ? "bg-card shadow-islamic ring-1 ring-primary/5" : "bg-card/60 hover:bg-card shadow-soft hover:shadow-islamic"}`}
                >
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-6 px-6 py-8 text-right transition-all"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 rounded-[1.5rem] bg-emerald-deep text-gold flex items-center justify-center shrink-0 shadow-lg border border-white/10"
                    >
                      {ICON_MAP[category.iconName] || <BookOpen size={28} strokeWidth={1.5} />}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-xl font-bold text-primary group-hover:text-accent transition-colors">{category.title}</h3>
                      <p className="text-sm text-primary/70 font-serif italic mt-1 line-clamp-1">
                        {category.description} • {toArabicNumber(category.athkar.length)} ذكر
                      </p>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary/20 group-hover:text-primary/40 transition-colors"
                    >
                      <ChevronDown size={20} strokeWidth={1.5} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-8 space-y-6">
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                          
                          {category.athkar.map((dhikr, dIdx) => {
                            const currentCount = counters[dhikr.id] || 0;
                            const isDone = dhikr.count > 0 && currentCount >= dhikr.count;
                            return (
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: dIdx * 0.05 }}
                                key={dhikr.id} 
                                className={`relative p-8 rounded-[2rem] border transition-all duration-500 ${isDone ? "bg-emerald-deep/5 border-emerald-deep/10" : "bg-primary/5 border-primary/5 hover:bg-primary/[0.07]"}`}
                              >
                                <p className="font-amiri text-2xl sm:text-3xl leading-[1.8] text-primary mb-8 text-right">
                                  {dhikr.text}
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
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => incrementCounter(dhikr.id)}
                                        className={`h-12 min-w-[120px] px-6 rounded-2xl text-sm font-serif font-bold transition-all flex items-center justify-center gap-3 shadow-sm ${
                                          isDone
                                            ? "bg-emerald-deep text-white"
                                            : "bg-accent text-accent-foreground hover:shadow-lg"
                                        }`}
                                      >
                                        {isDone ? (
                                          <>
                                            <Check size={18} strokeWidth={2} />
                                            <span>تم الذكر</span>
                                          </>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">{toArabicNumber(currentCount)}</span>
                                            <span className="opacity-40">/</span>
                                            <span>{toArabicNumber(dhikr.count)}</span>
                                          </div>
                                        )}
                                      </motion.button>
                                    )}
                                    <span className="px-4 py-2 rounded-xl bg-primary/5 text-[10px] font-bold text-primary/70 uppercase tracking-widest border border-primary/5">
                                      {dhikr.reference}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card/80 shadow-soft border border-primary/5">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => toggleFavorite({ type: "dhikr", id: dhikr.id, categoryId: category.id })}
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isFavorite("dhikr", dhikr.id) ? "text-red-500 bg-red-50" : "text-primary/60 hover:bg-primary/5"}`}
                                      title="إضافة للمفضلة"
                                    >
                                      <Heart size={18} strokeWidth={1.5} fill={isFavorite("dhikr", dhikr.id) ? "currentColor" : "none"} />
                                    </motion.button>
                                    
                                    <motion.button 
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => copyText(dhikr.text, dhikr.id)} 
                                      className="w-10 h-10 rounded-xl flex items-center justify-center text-primary/60 hover:bg-primary/5 transition-all" 
                                      title="نسخ"
                                    >
                                      {copiedId === dhikr.id ? <Check size={18} className="text-accent" strokeWidth={2} /> : <Copy size={18} strokeWidth={1.5} />}
                                    </motion.button>
                                    
                                    <motion.button 
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => shareWhatsApp(dhikr.text, dhikr.reference)} 
                                      className="w-10 h-10 rounded-xl flex items-center justify-center text-primary/60 hover:bg-primary/5 transition-all" 
                                      title="مشاركة"
                                    >
                                      <Share2 size={18} strokeWidth={1.5} />
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
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
            المصدر: حصن المسلم، صحيح البخاري ومسلم، ومن أذكار الكتاب والسنة النبوية المطهرة
          </p>
          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-primary/10" />
            <span className="text-[10px] font-bold text-primary/50 uppercase tracking-[0.4em]">صدقة جارية</span>
            <div className="h-px w-12 bg-primary/10" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Athkar;
