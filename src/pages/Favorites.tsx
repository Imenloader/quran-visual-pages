import { Link } from "react-router-dom";
import { Heart, BookOpen, Shield, Trash2, Copy, Check } from "lucide-react";
import { useFavorites, type FavoriteItem } from "@/hooks/useFavorites";
import { juzData, toArabicNumber } from "@/data/quranData";
import { ATHKAR_DATA } from "@/data/athkarData";
import { useState } from "react";

const Favorites = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const favJuzIds = favorites.filter(f => f.type === "juz").map(f => f.id);
  const favDhikrItems = favorites.filter(f => f.type === "dhikr") as Extract<FavoriteItem, { type: "dhikr" }>[];

  const favJuzList = juzData.filter(j => favJuzIds.includes(j.number));

  const favDhikrList = favDhikrItems.map(item => {
    const cat = ATHKAR_DATA.find(c => c.id === item.categoryId);
    const dhikr = cat?.athkar.find(d => d.id === item.id);
    return dhikr ? { ...dhikr, categoryTitle: cat!.title, categoryId: item.categoryId } : null;
  }).filter(Boolean) as (typeof ATHKAR_DATA[0]["athkar"][0] & { categoryTitle: string; categoryId: string })[];

  const copyText = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const isEmpty = favJuzList.length === 0 && favDhikrList.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="gradient-islamic pattern-islamic px-4 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />
        <div className="py-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl gradient-gold flex items-center justify-center shadow-lg mx-auto mb-2">
            <Heart size={20} className="text-foreground sm:w-6 sm:h-6" />
          </div>
          <h1 className="font-amiri text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">
            المفضلة
          </h1>
          <p className="font-naskh text-primary-foreground/60 text-xs sm:text-sm mt-1">
            أجزاءك وأذكارك المحفوظة
          </p>
        </div>
      </header>

      <main className="flex-1 container max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
        {isEmpty ? (
          <div className="text-center py-16 space-y-4">
            <Heart size={48} className="mx-auto text-muted-foreground/30" />
            <p className="font-naskh text-muted-foreground text-lg">لا توجد مفضلات بعد</p>
            <p className="font-naskh text-muted-foreground/60 text-sm">
              اضغط على أيقونة القلب في أي جزء أو ذكر لإضافته هنا
            </p>
          </div>
        ) : (
          <>
            {/* Favorite Juz */}
            {favJuzList.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-accent" />
                  <h2 className="font-amiri text-lg font-bold text-foreground">الأجزاء المفضلة</h2>
                  <span className="text-xs text-muted-foreground font-naskh">({favJuzList.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {favJuzList.map(juz => (
                    <div key={juz.number} className="relative group">
                      <Link
                        to={`/juz/${juz.number}`}
                        className="block bg-card border border-border rounded-xl p-4 hover:shadow-islamic hover:border-gold-light transition-all text-center"
                      >
                        <div className="w-10 h-10 rounded-full gradient-islamic flex items-center justify-center mx-auto mb-2">
                          <span className="text-sm font-bold font-amiri text-primary-foreground">
                            {toArabicNumber(juz.number)}
                          </span>
                        </div>
                        <p className="font-amiri text-sm font-bold text-foreground">{juz.nameAr}</p>
                        <p className="text-xs text-muted-foreground font-naskh mt-1">{juz.startSurah}</p>
                      </Link>
                      <button
                        onClick={() => toggleFavorite({ type: "juz", id: juz.number })}
                        className="absolute top-2 left-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm text-red-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        title="إزالة من المفضلة"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Favorite Athkar */}
            {favDhikrList.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={18} className="text-accent" />
                  <h2 className="font-amiri text-lg font-bold text-foreground">الأذكار المفضلة</h2>
                  <span className="text-xs text-muted-foreground font-naskh">({favDhikrList.length})</span>
                </div>
                <div className="space-y-3">
                  {favDhikrList.map(dhikr => (
                    <div
                      key={dhikr.id}
                      className="relative group bg-card border border-border rounded-xl p-4"
                    >
                      <span className="inline-block text-[10px] font-naskh text-accent bg-accent/10 rounded-md px-2 py-0.5 mb-2">
                        {dhikr.categoryTitle}
                      </span>
                      <p className="font-amiri text-base leading-loose text-foreground mb-2">
                        {dhikr.text}
                      </p>
                      {dhikr.virtue && (
                        <p className="text-xs font-naskh text-gold mb-2 bg-gold/10 rounded-lg px-3 py-1.5 inline-block">
                          ✨ {dhikr.virtue}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-naskh">{dhikr.reference}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyText(dhikr.text, dhikr.id)}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                            title="نسخ"
                          >
                            {copiedId === dhikr.id ? <Check size={14} className="text-gold" /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => toggleFavorite({ type: "dhikr", id: dhikr.id, categoryId: dhikr.categoryId })}
                            className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-red-400 hover:text-red-500"
                            title="إزالة من المفضلة"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Favorites;
