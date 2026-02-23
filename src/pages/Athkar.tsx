import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Home, Search, X, Shield, BookOpen, ChevronDown, ChevronUp, Copy, Check, Sunrise, Sunset, Moon, AlarmClock, Building, House, UtensilsCrossed, Plane, Shirt, Volume2, Heart, Stethoscope, Compass, Droplets, DoorOpen, Cloud, Share2 } from "lucide-react";
import { ATHKAR_DATA, type AthkarCategory } from "@/data/athkarData";

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
        <div className="flex justify-end items-center pt-3 pb-1">
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

        {filteredData.map(category => (
          <div key={category.id} className="bg-card border border-border rounded-xl overflow-hidden">
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

            {(isSearching || expandedCategory === category.id) && (
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-naskh">{dhikr.reference}</span>
                          <button onClick={() => copyText(dhikr.text, dhikr.id)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground" title="نسخ">
                            {copiedId === dhikr.id ? <Check size={14} className="text-gold" /> : <Copy size={14} />}
                          </button>
                          <button onClick={() => shareWhatsApp(dhikr.text, dhikr.reference)} className="p-1.5 rounded-md hover:bg-green-500/10 transition-colors text-muted-foreground hover:text-green-600" title="مشاركة عبر واتساب">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          </button>
                          <button onClick={() => shareTelegram(dhikr.text, dhikr.reference)} className="p-1.5 rounded-md hover:bg-blue-500/10 transition-colors text-muted-foreground hover:text-blue-500" title="مشاركة عبر تليجرام">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                          </button>
                        </div>

                        {dhikr.count > 0 && (
                          <button
                            onClick={() => incrementCounter(dhikr.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-naskh text-sm font-bold transition-all active:scale-95 ${
                              isDone
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "gradient-islamic text-primary-foreground shadow-sm"
                            }`}
                          >
                            <span>{isDone ? "✓" : currentCount}/{dhikr.count}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </main>

      <footer className="text-center py-4 pb-24 text-muted-foreground text-xs font-naskh border-t border-border">
        المصدر: حصن المسلم - صحيح البخاري - صحيح مسلم - من أذكار الكتاب والسنة
      </footer>
    </div>
  );
};

export default Athkar;
