import { Link } from "react-router-dom";
import { Heart, BookOpen, Shield, Trash2, Copy, Check, Headphones, Music, Star, User, Search, X } from "lucide-react";
import { useFavorites, type FavoriteItem } from "@/hooks/useFavorites";
import { juzData, toArabicNumber } from "@/data/quranData";
import { ATHKAR_DATA } from "@/data/athkarData";
import { useState, useMemo, useCallback } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

type TabKey = "all" | "juz" | "athkar" | "recitations" | "reciters";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "الكل", icon: <Heart size={14} /> },
  { key: "juz", label: "الأجزاء", icon: <BookOpen size={14} /> },
  { key: "athkar", label: "الأذكار", icon: <Shield size={14} /> },
  { key: "reciters", label: "القراء", icon: <Star size={14} /> },
  { key: "recitations", label: "التلاوات", icon: <Headphones size={14} /> },
];

const Favorites = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const favJuzIds = favorites.filter(f => f.type === "juz").map(f => f.id);
  const favDhikrItems = favorites.filter(f => f.type === "dhikr") as Extract<FavoriteItem, { type: "dhikr" }>[];
  const favRecitationItems = favorites.filter(f => f.type === "recitation") as Extract<FavoriteItem, { type: "recitation" }>[];
  const favReciterItems = favorites.filter(f => f.type === "reciter") as Extract<FavoriteItem, { type: "reciter" }>[];

  const favJuzList = useMemo(() => juzData.filter(j => favJuzIds.includes(j.number)), [favJuzIds]);

  const favDhikrList = useMemo(() => favDhikrItems.map(item => {
    const cat = ATHKAR_DATA.find(c => c.id === item.categoryId);
    const dhikr = cat?.athkar.find(d => d.id === item.id);
    return dhikr ? { ...dhikr, categoryTitle: cat!.title, categoryId: item.categoryId } : null;
  }).filter(Boolean) as (typeof ATHKAR_DATA[0]["athkar"][0] & { categoryTitle: string; categoryId: string })[], [favDhikrItems]);

  // Apply search filter
  const q = searchQuery.trim();
  const filteredJuz = useMemo(() => q ? favJuzList.filter(j => j.nameAr.includes(q) || j.startSurah.includes(q)) : favJuzList, [q, favJuzList]);
  const filteredDhikr = useMemo(() => q ? favDhikrList.filter(d => d.text.includes(q) || d.categoryTitle.includes(q)) : favDhikrList, [q, favDhikrList]);
  const filteredRecitations = useMemo(() => q ? favRecitationItems.filter(r => r.surahName?.includes(q) || r.reciterName?.includes(q)) : favRecitationItems, [q, favRecitationItems]);
  const filteredReciters = useMemo(() => q ? favReciterItems.filter(r => r.name?.includes(q)) : favReciterItems, [q, favReciterItems]);

  const copyText = useCallback((text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const isEmpty = favJuzList.length === 0 && favDhikrList.length === 0 && favRecitationItems.length === 0 && favReciterItems.length === 0;
  const noResults = q && filteredJuz.length === 0 && filteredDhikr.length === 0 && filteredRecitations.length === 0 && filteredReciters.length === 0;

  const showJuz = activeTab === "all" || activeTab === "juz";
  const showAthkar = activeTab === "all" || activeTab === "athkar";
  const showRecitations = activeTab === "all" || activeTab === "recitations";
  const showReciters = activeTab === "all" || activeTab === "reciters";

  const counts: Record<TabKey, number> = {
    all: favJuzList.length + favDhikrList.length + favRecitationItems.length + favReciterItems.length,
    juz: favJuzList.length,
    athkar: favDhikrList.length,
    recitations: favRecitationItems.length,
    reciters: favReciterItems.length,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent/20">
      {/* Immersive Header */}
      <header className="relative overflow-hidden pt-12 pb-20 px-6 text-center">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-emerald-deep z-0" />
        <div className="absolute inset-0 pattern-islamic opacity-10 z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-emerald-deep z-0" />
        
        {/* Decorative Ornament */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 opacity-20 pointer-events-none z-0">
          <div className="w-full h-full ornament-border opacity-30" />
        </div>

        <div className="relative z-10 container max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <Link 
              to="/" 
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
            >
              <X size={20} strokeWidth={1.5} />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-20 h-20 rounded-[2rem] bg-gold/20 backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-gold/30 shadow-gold-glow">
              <Heart size={32} className="text-gold" fill="currentColor" />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
              كنوزي <span className="italic font-light text-gold/80">المفضلة</span>
            </h1>
            
            <p className="text-white/80 font-serif italic text-lg max-w-xl mx-auto leading-relaxed">
              مجموعتك الخاصة من الأجزاء المباركة، الأذكار النبوية، والتلاوات العطرة التي تلامس قلبك
            </p>

            <div className="flex items-center justify-center gap-6 mt-10">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif text-gold">{toArabicNumber(counts.all)}</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">إجمالي المحفوظات</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Tabs & Search - Exquisite Floating Bar */}
      <div className="sticky top-0 z-30 -mt-8">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="bg-card/80 backdrop-blur-2xl rounded-[2.5rem] shadow-islamic border border-border/20 p-2 flex flex-col gap-2">
            {!isEmpty && (
              <div className="relative px-4 pt-2">
                <Search size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none" strokeWidth={1.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في محفوظاتك..."
                  className="w-full bg-primary/5 border-none rounded-2xl pr-12 pl-12 py-3 text-sm font-serif text-primary placeholder:text-primary/60 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute left-8 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}
            
            <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar">
              {TABS.map(tab => (
                <motion.button
                  key={tab.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-serif font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.key 
                      ? "bg-emerald-deep text-gold shadow-lg" 
                      : "text-foreground/70 hover:bg-foreground/5"
                  }`}
                >
                  <span className={activeTab === tab.key ? "text-gold" : "text-foreground/20"}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {counts[tab.key] > 0 && (
                    <span className={`min-w-[20px] h-[20px] rounded-full text-[10px] flex items-center justify-center ${
                      activeTab === tab.key ? "bg-white/10 text-gold" : "bg-foreground/5 text-foreground/40"
                    }`}>{toArabicNumber(counts[tab.key])}</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container max-w-4xl mx-auto px-6 py-12 space-y-12 pb-32">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-24 space-y-8"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center mx-auto border border-primary/5">
                <Heart size={48} className="text-primary/10" strokeWidth={1} />
              </div>
              <div className="space-y-3">
                <h2 className="font-serif text-2xl font-bold text-primary">سجل مفضلاتك فارغ</h2>
                <p className="font-serif italic text-primary/70 text-lg max-w-xs mx-auto leading-relaxed">ابدأ برحلتك الإيمانية وأضف ما يروق لقلبك من كنوز التطبيق</p>
              </div>
              <Link to="/" className="inline-flex h-14 px-10 rounded-2xl bg-emerald-deep text-gold font-serif text-lg font-bold shadow-xl hover:shadow-emerald-deep/20 transition-all items-center justify-center">
                استكشف الآن
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              {/* No search results */}
              {noResults && (
                <div className="text-center py-24 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                    <Search size={32} className="text-primary/10" strokeWidth={1} />
                  </div>
                  <p className="font-serif italic text-primary/70 text-xl">لم نجد نتائج للبحث عن "{searchQuery}"</p>
                </div>
              )}

              {/* Favorite Reciters */}
              {showReciters && filteredReciters.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <Star size={20} strokeWidth={1.5} />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-primary">القراء المفضلون</h2>
                    <div className="h-px flex-1 bg-primary/5" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReciters.map((item, idx) => (
                      <ScrollReveal key={item.id} index={idx}>
                        <motion.div 
                          whileHover={{ y: -4 }}
                          className="relative group"
                        >
                          <Link
                            to="/recitations"
                            className="flex items-center gap-4 bg-card/60 backdrop-blur-sm border border-border/5 rounded-[2rem] p-6 hover:bg-card hover:shadow-islamic transition-all"
                          >
                            <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-deep text-gold flex items-center justify-center shrink-0 shadow-lg">
                              <User size={24} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-lg font-bold text-primary truncate">{item.name}</p>
                              <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest mt-1">Reciter</p>
                            </div>
                          </Link>
                          <button
                            onClick={() => toggleFavorite(item)}
                            className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-red-500 text-white shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10 flex items-center justify-center"
                            title="إزالة من المفضلة"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </motion.div>
                      </ScrollReveal>
                    ))}
                  </div>
                </section>
              )}

              {/* Favorite Juz */}
              {showJuz && filteredJuz.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <BookOpen size={20} strokeWidth={1.5} />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-primary">الأجزاء المفضلة</h2>
                    <div className="h-px flex-1 bg-primary/5" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJuz.map((juz, idx) => (
                      <ScrollReveal key={juz.number} index={idx}>
                        <motion.div 
                          whileHover={{ y: -4 }}
                          className="relative group"
                        >
                          <Link to={`/juz/${juz.number}`} className="block bg-card/60 backdrop-blur-sm border border-border/5 rounded-[2.5rem] p-8 hover:bg-card hover:shadow-islamic transition-all text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-deep text-gold flex items-center justify-center mx-auto mb-6 shadow-xl border border-foreground/10">
                              <span className="text-2xl font-bold font-serif">{toArabicNumber(juz.number)}</span>
                            </div>
                            <h3 className="font-serif text-xl font-bold text-primary mb-2">{juz.nameAr}</h3>
                            <p className="text-sm text-primary/70 font-serif italic">{juz.startSurah}</p>
                          </Link>
                          <button
                            onClick={() => toggleFavorite({ type: "juz", id: juz.number })}
                            className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-red-500 text-white shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10 flex items-center justify-center"
                            title="إزالة من المفضلة"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </motion.div>
                      </ScrollReveal>
                    ))}
                  </div>
                </section>
              )}

              {/* Favorite Athkar */}
              {showAthkar && filteredDhikr.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Shield size={20} strokeWidth={1.5} />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-primary">الأذكار المفضلة</h2>
                    <div className="h-px flex-1 bg-primary/5" />
                  </div>
                  <div className="space-y-6">
                    {filteredDhikr.map((dhikr, idx) => (
                      <ScrollReveal key={dhikr.id} index={idx}>
                        <motion.div 
                          whileHover={{ x: -4 }}
                          className="relative group bg-card/60 backdrop-blur-sm border border-border/5 rounded-[2.5rem] p-8 hover:bg-card hover:shadow-islamic transition-all"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <span className="inline-block px-4 py-1.5 rounded-xl bg-accent/10 text-[10px] font-bold text-accent uppercase tracking-widest">{dhikr.categoryTitle}</span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => copyText(dhikr.text, dhikr.id)} 
                                className="w-10 h-10 rounded-xl bg-primary/5 text-primary/30 hover:text-accent hover:bg-accent/10 flex items-center justify-center transition-all" 
                                title="نسخ"
                              >
                                {copiedId === dhikr.id ? <Check size={16} className="text-accent" strokeWidth={2} /> : <Copy size={16} strokeWidth={1.5} />}
                              </button>
                              <button 
                                onClick={() => toggleFavorite({ type: "dhikr", id: dhikr.id, categoryId: dhikr.categoryId })} 
                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all" 
                                title="إزالة من المفضلة"
                              >
                                <Trash2 size={16} strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                          <p className="font-amiri text-2xl leading-[1.8] text-primary mb-6 text-right">{dhikr.text}</p>
                          {dhikr.virtue && (
                            <div className="bg-accent/5 border border-accent/10 rounded-2xl p-6 mb-6">
                              <p className="text-sm font-serif italic text-accent/80 leading-relaxed">✨ {dhikr.virtue}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between border-t border-primary/5 pt-4">
                            <span className="text-[10px] font-bold text-primary/20 uppercase tracking-widest">{dhikr.reference}</span>
                          </div>
                        </motion.div>
                      </ScrollReveal>
                    ))}
                  </div>
                </section>
              )}

              {/* Favorite Recitations */}
              {showRecitations && filteredRecitations.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <Headphones size={20} strokeWidth={1.5} />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-primary">التلاوات المفضلة</h2>
                    <div className="h-px flex-1 bg-primary/5" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredRecitations.map((item, idx) => (
                      <ScrollReveal key={`${item.reciterId}-${item.moshafId}-${item.id}-${idx}`} index={idx}>
                        <motion.div 
                          whileHover={{ x: -4 }}
                          className="flex items-center gap-6 bg-card/60 backdrop-blur-sm border border-border/5 rounded-[2rem] p-6 group hover:bg-card hover:shadow-islamic transition-all"
                        >
                          <div className="w-16 h-16 rounded-[1.2rem] bg-emerald-deep text-gold flex items-center justify-center shrink-0 shadow-lg">
                            <Music size={28} strokeWidth={1.5} />
                          </div>
                          <Link to="/recitations" className="flex-1 min-w-0 text-right">
                            <p className="font-serif text-lg font-bold text-primary truncate">سورة {item.surahName}</p>
                            <p className="text-sm text-primary/70 font-serif italic truncate mt-1">{item.reciterName}</p>
                          </Link>
                          <button
                            onClick={() => toggleFavorite(item)}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shrink-0 shadow-sm"
                            title="إزالة من المفضلة"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </motion.div>
                      </ScrollReveal>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty state for filtered tab */}
              {!isEmpty && !noResults && (
                (activeTab === "juz" && filteredJuz.length === 0) ||
                (activeTab === "athkar" && filteredDhikr.length === 0) ||
                (activeTab === "recitations" && filteredRecitations.length === 0) ||
                (activeTab === "reciters" && filteredReciters.length === 0)
              ) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                    <Heart size={32} className="text-primary/10" strokeWidth={1} />
                  </div>
                  <p className="font-serif italic text-primary/70 text-xl">لا توجد عناصر في هذا القسم بعد</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Favorites;
