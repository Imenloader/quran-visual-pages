import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Heart, BookOpen, Shield, Trash2, Copy, Check, Headphones, Music, Star, User, Search, X } from "lucide-react";
import { useFavorites, type FavoriteItem } from "@/hooks/useFavorites";
import { useTheme } from "@/contexts/ThemeContext";
import { applyTajweedColors, rules } from "@/lib/tajweedParser";
import { juzData, toArabicNumber } from "@/data/quranData";
import { ATHKAR_DATA } from "@/data/athkarData";
import { useState, useMemo, useCallback } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "motion/react";
import QuranHeader from "@/components/QuranHeader";

type TabKey = "all" | "juz" | "athkar" | "recitations" | "reciters";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "الكل", icon: <Heart size={14} /> },
  { key: "juz", label: "الأجزاء", icon: <BookOpen size={14} /> },
  { key: "athkar", label: "الأذكار", icon: <Shield size={14} /> },
  { key: "reciters", label: "القراء", icon: <Star size={14} /> },
  { key: "recitations", label: "التلاوات", icon: <Headphones size={14} /> },
];

const TajweedLegend = ({ className }: { className?: string }) => {
  return (
    <div className={`flex flex-wrap justify-center gap-2 sm:gap-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/20 ${className}`}>
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

const Favorites = () => {
  const { t, i18n } = useTranslation();
  const { tajweedMode } = useTheme();
  const isArabic = i18n.language === 'ar';
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
      <QuranHeader 
        title={t("hub.favorites")} 
        subtitle={t("favorites.subtitle")}
        variant="compact"
        showBack
      />

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
                  placeholder={t('favorites.searchPlaceholder')}
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
                <h2 className="font-serif text-2xl font-bold text-primary">{t('favorites.emptyTitle')}</h2>
                <p className="font-serif italic text-primary/70 text-lg max-w-xs mx-auto leading-relaxed">{t('favorites.emptySubtitle')}</p>
              </div>
              <Link to="/" className="inline-flex h-14 px-10 rounded-2xl bg-emerald-deep text-gold font-serif text-lg font-bold shadow-xl hover:shadow-emerald-deep/20 transition-all items-center justify-center">
                {t('favorites.exploreNow')}
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
                  <p className="font-serif italic text-primary/70 text-xl">{t('favorites.noResults', { query: searchQuery })}</p>
                </div>
              )}

              {tajweedMode && !isEmpty && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8"
                >
                  <TajweedLegend />
                </motion.div>
              )}

              {/* Favorite Reciters */}
              {showReciters && filteredReciters.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <Star size={20} strokeWidth={1.5} />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-primary">{t('favorites.reciters')}</h2>
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
                              <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest mt-1">{t('favorites.reciter')}</p>
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
                    <h2 className="font-serif text-2xl font-bold text-primary">{t('favorites.juz')}</h2>
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
                              <span className="text-2xl font-bold font-serif">{isArabic ? toArabicNumber(juz.number) : juz.number}</span>
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
                    <h2 className="font-serif text-2xl font-bold text-primary">{t('favorites.athkar')}</h2>
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
                                title={t('athkar.copy')}
                              >
                                {copiedId === dhikr.id ? <Check size={16} className="text-accent" strokeWidth={2} /> : <Copy size={16} strokeWidth={1.5} />}
                              </button>
                              <button 
                                onClick={() => toggleFavorite({ type: "dhikr", id: dhikr.id, categoryId: dhikr.categoryId })} 
                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all" 
                                title={t('favorites.remove')}
                              >
                                <Trash2 size={16} strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                          <p className="font-amiri text-2xl leading-[1.8] text-primary mb-6 text-right">
                            {tajweedMode ? applyTajweedColors(dhikr.text) : dhikr.text}
                          </p>
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
                    <h2 className="font-serif text-2xl font-bold text-primary">{t('favorites.recitations')}</h2>
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
                            <p className="font-serif text-lg font-bold text-primary truncate">{t('index.verseOfDay.surah')} {item.surahName}</p>
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
                  <p className="font-serif italic text-primary/70 text-xl">{t('favorites.noItemsInSection')}</p>
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
