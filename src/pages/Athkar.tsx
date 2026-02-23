import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Home, Search, X, Shield, BookOpen, ChevronDown, ChevronUp, Copy, Check, Sunrise, Sunset, Moon, AlarmClock, Building, House, UtensilsCrossed, Plane, Shirt, Volume2, Heart, Stethoscope, Compass, Droplets, DoorOpen, Cloud, Share2 } from "lucide-react";
import { ATHKAR_DATA, type AthkarCategory } from "@/data/athkarData";
import { useFavorites } from "@/hooks/useFavorites";
import ScrollReveal from "@/components/ScrollReveal";

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
  const [counters, setCounters] = useState<Record<number, number>>({});
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

  const incrementCounter = (dhikrId: number) => {
    setCounters(prev => {
      const updated = { ...prev, [dhikrId]: (prev[dhikrId] || 0) + 1 };
      localStorage.setItem(COUNTER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetCounters = () => {
    setCounters({});
    localStorage.removeItem(COUNTER_KEY);
  };

  const copyText = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const shareWhatsApp = (text: string, reference: string) => {
    const msg = `${text}\n\n📖 ${reference}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareTelegram = (text: string, reference: string) => {
    const msg = `${text}\n\n📖 ${reference}`;
    window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(msg)}`, "_blank");
  };

  const toggleCategory = (id: string) => {
    setExpandedCategory(prev => prev === id ? null : id);
  };

  const totalAthkar = ATHKAR_DATA.reduce((sum, cat) => sum + cat.athkar.length, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="gradient-islamic pattern-islamic px-4 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />
        <div className="flex justify-end items-center gap-2 pt-3 pb-1">
          <Link to="/favorites" className="text-xs font-naskh text-primary-foreground/70 hover:text-primary-foreground transition-colors bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Heart size={13} />
            المفضلة
          </Link>
          <button onClick={resetCounters} className="text-xs font-naskh text-primary-foreground/70 hover:text-primary-foreground transition-colors bg-white/10 px-3 py-1.5 rounded-lg">
            إعادة تعيين العدادات
          </button>
        </div>
        <div className="pb-6">
          <p className="font-amiri text-gold text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-primary-foreground">الأذكار</h1>
          <p className="font-naskh text-primary-foreground/70 text-sm mt-2">من حصن المسلم وصحيح مسلم والبخاري</p>
          <p className="font-naskh text-primary-foreground/50 text-xs mt-1">{ATHKAR_DATA.length} قسم • {totalAthkar} ذكر ودعاء</p>
        </div>
      </header>

      <main className="flex-1 container max-w-3xl mx-auto px-4 py-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأذكار والأدعية..."
            className="w-full bg-card border border-border rounded-xl pr-10 pl-10 py-3 text-sm font-naskh text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>

        {isSearching && (
          <p className="text-xs text-muted-foreground font-naskh">
            {filteredData.length > 0
              ? `${filteredData.reduce((s, c) => s + c.athkar.length, 0)} نتيجة في ${filteredData.length} قسم`
              : `لا توجد نتائج لـ "${searchQuery}"`}
          </p>
        )}

        {filteredData.map((category, idx) => {
          const isExpanded = isSearching || expandedCategory === category.id;
          return (
            <ScrollReveal key={category.id} index={idx}>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full gradient-islamic flex items-center justify-center shrink-0 text-primary-foreground">
                    {ICON_MAP[category.iconName] || <BookOpen size={20} />}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-naskh text-sm font-bold text-foreground">{category.title}</p>
                    <p className="text-xs text-muted-foreground font-naskh">{category.description} • {category.athkar.length} ذكر</p>
                  </div>
                  {expandedCategory === category.id ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border">
                    {category.athkar.map(dhikr => {
                      const currentCount = counters[dhikr.id] || 0;
                      const isDone = dhikr.count > 0 && currentCount >= dhikr.count;
                      return (
                        <div key={dhikr.id} className={`px-4 py-4 transition-colors ${isDone ? "bg-primary/5" : ""}`}>
                          <p className="font-amiri text-base sm:text-lg leading-loose text-foreground mb-3">{dhikr.text}</p>
                          
                          {dhikr.virtue && (
                            <p className="text-xs font-naskh text-gold mb-2 bg-gold/10 rounded-lg px-3 py-1.5 inline-block">
                              ✨ {dhikr.virtue}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5">
                              {dhikr.count > 0 && (
                                <button
                                  onClick={() => incrementCounter(dhikr.id)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-naskh font-bold transition-all ${
                                    isDone
                                      ? "bg-primary/15 text-primary"
                                      : "gradient-gold text-foreground hover:opacity-90 active:scale-95"
                                  }`}
                                >
                                  {isDone ? "✓ تم" : `${currentCount}/${dhikr.count}`}
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground font-naskh ml-2">{dhikr.reference}</span>
                              <button
                                onClick={() => toggleFavorite({ type: "dhikr", id: dhikr.id, categoryId: category.id })}
                                className={`p-1.5 rounded-md transition-colors ${isFavorite("dhikr", dhikr.id) ? "text-red-500" : "text-muted-foreground hover:text-red-400"}`}
                                title="إضافة للمفضلة"
                              >
                                <Heart size={14} fill={isFavorite("dhikr", dhikr.id) ? "currentColor" : "none"} />
                              </button>
                              <button onClick={() => copyText(dhikr.text, dhikr.id)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground" title="نسخ">
                                {copiedId === dhikr.id ? <Check size={14} className="text-gold" /> : <Copy size={14} />}
                              </button>
                              <button onClick={() => shareWhatsApp(dhikr.text, dhikr.reference)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground" title="مشاركة واتساب">
                                <Share2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollReveal>
          );
        })}
      </main>

      <footer className="text-center py-4 pb-24 text-muted-foreground text-xs font-naskh border-t border-border">
        المصدر: حصن المسلم - صحيح البخاري - صحيح مسلم - من أذكار الكتاب والسنة
      </footer>
    </div>
  );
};

export default Athkar;
