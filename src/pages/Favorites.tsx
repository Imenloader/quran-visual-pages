import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Heart, BookOpen, Shield, Trash2, Copy, Check, Headphones, Music, Star, User, Search, X, GripVertical, Edit2, Save, Bookmark } from "lucide-react";
import { useFavorites, type FavoriteItem } from "@/hooks/useFavorites";
import { useTheme } from "@/contexts/ThemeContext";
import { applyTajweedColors, rules } from "@/lib/tajweedParser";
import { juzData, toArabicNumber } from "@/data/quranData";
import { ATHKAR_DATA } from "@/data/athkarData";
import { useState, useMemo, useCallback } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { motion, AnimatePresence, Reorder } from "motion/react";
import QuranHeader from "@/components/QuranHeader";
import { toast } from "sonner";

type TabKey = "all" | "juz" | "athkar" | "recitations" | "reciters" | "hadith";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "الكل", icon: <Heart size={14} /> },
  { key: "juz", label: "الأجزاء", icon: <BookOpen size={14} /> },
  { key: "athkar", label: "الأذكار", icon: <Shield size={14} /> },
  { key: "hadith", label: "الأحاديث", icon: <Bookmark size={14} /> },
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
  const { favorites, toggleFavorite, reorderFavorites, updateFavorite, collections, addCollection, removeCollection } = useFavorites();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingItem, setEditingItem] = useState<{ id: number; type: string; nickname: string; collectionId?: string } | null>(null);

  const counts = useMemo(() => {
    return {
      all: favorites.length,
      juz: favorites.filter(f => f.type === "juz").length,
      athkar: favorites.filter(f => f.type === "dhikr").length,
      recitations: favorites.filter(f => f.type === "recitation").length,
      reciters: favorites.filter(f => f.type === "reciter").length,
      hadith: favorites.filter(f => f.type === "hadith").length,
    };
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    let list = favorites;
    if (activeTab !== "all") {
      list = list.filter(f => {
        if (activeTab === "juz") return f.type === "juz";
        if (activeTab === "athkar") return f.type === "dhikr";
        if (activeTab === "recitations") return f.type === "recitation";
        if (activeTab === "reciters") return f.type === "reciter";
        if (activeTab === "hadith") return f.type === "hadith";
        return true;
      });
    }
    if (selectedCollectionId) {
      list = list.filter(f => f.collectionId === selectedCollectionId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(f => {
        if (f.nickname?.toLowerCase().includes(q)) return true;
        if (f.type === "juz") {
          const juz = juzData.find(j => j.number === f.id);
          return juz?.nameAr.includes(q) || juz?.startSurah.includes(q);
        }
        if (f.type === "dhikr") {
          const cat = ATHKAR_DATA.find(c => c.id === f.categoryId);
          const dhikr = cat?.athkar.find(d => d.id === f.id);
          return dhikr?.text.includes(q) || cat?.title.includes(q);
        }
        if (f.type === "hadith") {
          return f.text.includes(q) || f.bookName.includes(q);
        }
        if (f.type === "recitation") {
          return f.surahName?.toLowerCase().includes(q) || f.reciterName?.toLowerCase().includes(q);
        }
        if (f.type === "reciter") {
          return f.name?.toLowerCase().includes(q);
        }
        return false;
      });
    }
    return list;
  }, [favorites, activeTab, searchQuery]);

  const handleReorder = (newOrder: FavoriteItem[]) => {
    // If we are in a filtered tab, we need to merge the new order back into the full favorites list
    if (activeTab === "all" && !searchQuery.trim()) {
      reorderFavorites(newOrder);
    } else {
      // This is more complex: we only reorder the items currently visible
      const newFullList = [...favorites];
      const visibleIds = filteredFavorites.map(f => `${f.type}-${f.id}`);
      
      let visibleIdx = 0;
      for (let i = 0; i < newFullList.length; i++) {
        const item = newFullList[i];
        if (visibleIds.includes(`${item.type}-${item.id}`)) {
          newFullList[i] = newOrder[visibleIdx++];
        }
      }
      reorderFavorites(newFullList);
    }
  };

  const handleUpdateNickname = () => {
    if (editingItem) {
      const originalItem = favorites.find(f => f.type === editingItem.type && f.id === editingItem.id);
      if (originalItem) {
        updateFavorite(originalItem, { 
          nickname: editingItem.nickname,
          collectionId: editingItem.collectionId === "none" ? undefined : editingItem.collectionId 
        });
        setEditingItem(null);
        toast.success(t("profile.successUpdate"));
      }
    }
  };

  const handleAddCollection = async () => {
    if (newCollectionName.trim()) {
      await addCollection(newCollectionName.trim());
      setNewCollectionName("");
      setShowAddCollection(false);
      toast.success(isArabic ? "تم إنشاء المجموعة" : "Collection created!");
    }
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
            {favorites.length > 0 && (
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
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSelectedCollectionId(null);
                  }}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-serif font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.key && !selectedCollectionId
                      ? "bg-emerald-deep text-gold shadow-lg" 
                      : "text-foreground/70 hover:bg-foreground/5"
                  }`}
                >
                  <span className={activeTab === tab.key && !selectedCollectionId ? "text-gold" : "text-foreground/20"}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {counts[tab.key] > 0 && (
                    <span className={`min-w-[20px] h-[20px] rounded-full text-[10px] flex items-center justify-center ${
                      activeTab === tab.key && !selectedCollectionId ? "bg-primary/10 text-gold" : "bg-foreground/5 text-foreground/40"
                    }`}>{toArabicNumber(counts[tab.key])}</span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Collections Bar */}
            <div className="flex items-center gap-2 p-1 pt-0 overflow-x-auto no-scrollbar border-t border-border/5">
              <button
                onClick={() => setShowAddCollection(true)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 text-primary/60 hover:text-primary transition-all shrink-0"
              >
                <Plus size={18} />
              </button>
              
              {collections.map(coll => (
                <motion.button
                  key={coll.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCollectionId(coll.id);
                    setActiveTab("all");
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedCollectionId === coll.id
                      ? "bg-accent text-white shadow-md"
                      : "bg-primary/5 text-primary/60 hover:bg-primary/10"
                  }`}
                >
                  <Bookmark size={12} />
                  <span>{coll.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container max-w-4xl mx-auto px-6 py-12 space-y-12 pb-32">
        <AnimatePresence mode="wait">
          {favorites.length === 0 ? (
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
              {searchQuery && filteredFavorites.length === 0 && (
                <div className="text-center py-24 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                    <Search size={32} className="text-primary/10" strokeWidth={1} />
                  </div>
                  <p className="font-serif italic text-primary/70 text-xl">{t('favorites.noResults', { query: searchQuery })}</p>
                </div>
              )}

              {tajweedMode && favorites.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8"
                >
                  <TajweedLegend />
                </motion.div>
              )}

              <Reorder.Group axis="y" values={filteredFavorites} onReorder={handleReorder} className="space-y-4">
                {filteredFavorites.map((item, idx) => {
                  const itemKey = `${item.type}-${item.id}-${idx}`;
                  
                  return (
                    <Reorder.Item key={itemKey} value={item} className="relative group">
                      <div className="flex items-center gap-4 bg-card/60 backdrop-blur-sm border border-border/5 rounded-[2rem] p-4 hover:bg-card hover:shadow-islamic transition-all">
                        <div className="cursor-grab active:cursor-grabbing text-primary/20 hover:text-primary/40 transition-colors px-2">
                          <GripVertical size={20} />
                        </div>

                        {item.type === "juz" && (() => {
                          const juz = juzData.find(j => j.number === item.id);
                          if (!juz) return null;
                          
                          let isCompleted = false;
                          try {
                            const history = JSON.parse(localStorage.getItem("quran-reading-history") || "{}");
                            isCompleted = history[juz.number]?.completed || false;
                          } catch (e) {
                            console.error("Error reading reading history:", e);
                          }

                          return (
                            <div className="flex-1 flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg shrink-0 ${
                                isCompleted ? "bg-emerald-500 text-white" : "bg-emerald-deep text-gold"
                              }`}>
                                {isCompleted ? (
                                  <Check size={20} strokeWidth={3} />
                                ) : (
                                  <span className="text-lg font-bold font-serif">{isArabic ? toArabicNumber(juz.number) : juz.number}</span>
                                )}
                              </div>
                              <Link to={`/juz/${juz.number}`} className="flex-1 text-right">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-serif text-lg font-bold text-primary">{item.nickname || juz.nameAr}</h3>
                                  {isCompleted && (
                                    <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">مكتمل</span>
                                  )}
                                </div>
                                <p className="text-xs text-primary/70 font-serif italic">{juz.startSurah}</p>
                              </Link>
                            </div>
                          );
                        })()}

                        {item.type === "dhikr" && (() => {
                          const cat = ATHKAR_DATA.find(c => c.id === item.categoryId);
                          const dhikr = cat?.athkar.find(d => d.id === item.id);
                          return dhikr ? (
                            <div className="flex-1 flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                <Shield size={20} />
                              </div>
                              <div className="flex-1 text-right">
                                <span className="inline-block px-2 py-0.5 rounded-lg bg-accent/10 text-[8px] font-bold text-accent uppercase tracking-widest mb-1">{cat?.title}</span>
                                <p className="font-amiri text-lg leading-relaxed text-primary line-clamp-1">{item.nickname || dhikr.text}</p>
                              </div>
                            </div>
                          ) : null;
                        })()}

                        {item.type === "reciter" && (
                          <div className="flex-1 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                              <User size={20} />
                            </div>
                            <Link to="/recitations" className="flex-1 text-right">
                              <p className="font-serif text-lg font-bold text-primary truncate">{item.nickname || item.name}</p>
                              <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest mt-1">{t('favorites.reciter')}</p>
                            </Link>
                          </div>
                        )}

                        {item.type === "recitation" && (
                          <div className="flex-1 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                              <Headphones size={20} />
                            </div>
                            <Link to="/recitations" className="flex-1 text-right">
                              <p className="font-serif text-lg font-bold text-primary truncate">{item.nickname || `${t('index.verseOfDay.surah')} ${item.surahName}`}</p>
                              <p className="text-xs text-primary/70 font-serif italic truncate mt-1">{item.reciterName}</p>
                            </Link>
                          </div>
                        )}

                        {item.type === "hadith" && (
                          <div className="flex-1 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                              <Bookmark size={20} />
                            </div>
                            <div className="flex-1 text-right">
                              <span className="inline-block px-2 py-0.5 rounded-lg bg-amber-500/10 text-[8px] font-bold text-amber-600 uppercase tracking-widest mb-1">{item.bookName}</span>
                              <p className="font-amiri text-lg leading-relaxed text-primary line-clamp-1">{item.nickname || item.text}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => setEditingItem({ 
                              id: item.id, 
                              type: item.type, 
                              nickname: item.nickname || "",
                              collectionId: item.collectionId
                            })}
                            className="w-9 h-9 rounded-xl bg-primary/5 text-primary/40 hover:text-accent hover:bg-accent/10 flex items-center justify-center transition-all"
                            title="تعديل"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => toggleFavorite(item)}
                            className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                            title={t('favorites.remove')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Nickname Modal */}
        <AnimatePresence>
          {editingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-card rounded-[2.5rem] border border-border/20 shadow-2xl p-6 space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif font-bold text-primary">تعديل المسمى</h3>
                  <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-primary/5 rounded-xl">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary/40 uppercase tracking-widest px-2">الاسم المخصص</label>
                  <input
                    type="text"
                    value={editingItem.nickname}
                    onChange={(e) => setEditingItem({ ...editingItem, nickname: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-primary/5 border border-primary/10 focus:border-accent outline-none font-serif text-lg transition-all text-right"
                    placeholder="أدخل اسماً مخصصاً..."
                    autoFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary/40 uppercase tracking-widest px-2">المجموعة</label>
                  <select
                    value={editingItem.collectionId || "none"}
                    onChange={(e) => setEditingItem({ ...editingItem, collectionId: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-primary/5 border border-primary/10 focus:border-accent outline-none font-serif text-lg transition-all text-right appearance-none"
                  >
                    <option value="none">بدون مجموعة</option>
                    {collections.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleUpdateNickname}
                  className="w-full py-4 rounded-2xl bg-emerald-deep text-gold font-serif font-bold text-lg shadow-lg shadow-emerald-deep/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Save size={20} />
                  حفظ التعديلات
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Collection Modal */}
        <AnimatePresence>
          {showAddCollection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-card rounded-[2.5rem] border border-border/20 shadow-2xl p-6 space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif font-bold text-primary">إنشاء مجموعة جديدة</h3>
                  <button onClick={() => setShowAddCollection(false)} className="p-2 hover:bg-primary/5 rounded-xl">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary/40 uppercase tracking-widest px-2">اسم المجموعة</label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-primary/5 border border-primary/10 focus:border-accent outline-none font-serif text-lg transition-all text-right"
                    placeholder="مثال: أذكار الصباح، آيات مختارة..."
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCollection()}
                  />
                </div>
                <button
                  onClick={handleAddCollection}
                  className="w-full py-4 rounded-2xl bg-emerald-deep text-gold font-serif font-bold text-lg shadow-lg shadow-emerald-deep/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={20} />
                  إنشاء المجموعة
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Favorites;
