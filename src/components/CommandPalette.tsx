import { useState, useEffect, useCallback } from "react";
import { Search, Command, Book, Sparkles, User, Settings, Calculator, Compass, Fingerprint, Moon, Sun, Bell, Globe, Brain, Heart, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CommandPalette = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  
  const isAr = i18n.language === "ar";

  const actions = [
    { id: "quran", titleAr: "القرآن الكريم", titleEn: "Holy Quran", icon: <Book className="w-4 h-4" />, path: "/" },
    { id: "prayer", titleAr: "أوقات الصلاة", titleEn: "Prayer Times", icon: <Bell className="w-4 h-4" />, path: "/prayer-times" },
    { id: "tasbih", titleAr: "المسبحة", titleEn: "Tasbih", icon: <Fingerprint className="w-4 h-4" />, path: "/tasbih" },
    { id: "global-dhikr", titleAr: "التسبيح العالمي", titleEn: "Global Dhikr", icon: <Globe className="w-4 h-4" />, path: "/global-dhikr" },
    { id: "qibla", titleAr: "القبلة", titleEn: "Qibla Finder", icon: <Compass className="w-4 h-4" />, path: "/qibla" },
    { id: "zakat", titleAr: "حساب الزكاة", titleEn: "Zakat Calculator", icon: <Calculator className="w-4 h-4" />, path: "/zakat" },
    { id: "dua", titleAr: "مكتبة الأدعية", titleEn: "Dua Library", icon: <Sparkles className="w-4 h-4" />, path: "/dua-library" },
    { id: "tajweed", titleAr: "التجويد الملون", titleEn: "Tajweed Rules", icon: <Sparkles className="w-4 h-4" />, path: "/tajweed" },
    { id: "seerah", titleAr: "السيرة النبوية", titleEn: "Seerah Timeline", icon: <Calendar className="w-4 h-4" />, path: "/seerah-timeline" },
    { id: "names-allah", titleAr: "أسماء الله الحسنى", titleEn: "Names of Allah", icon: <Heart className="w-4 h-4" />, path: "/names-of-allah" },
    { id: "hijri", titleAr: "التقويم الهجري", titleEn: "Hijri Calendar", icon: <Calendar className="w-4 h-4" />, path: "/hijri" },
    { id: "mosque", titleAr: "البحث عن مساجد", titleEn: "Mosque Finder", icon: <Compass className="w-4 h-4" />, path: "/mosque-finder" },
    { id: "halal", titleAr: "أماكن حلال", titleEn: "Halal Places", icon: <Compass className="w-4 h-4" />, path: "/halal-places" },
    { id: "quiz", titleAr: "المسابقة الإسلامية", titleEn: "Islamic Quiz", icon: <Brain className="w-4 h-4" />, path: "/islamic-quiz" },
    { id: "profile", titleAr: "الملف الشخصي", titleEn: "Profile", icon: <User className="w-4 h-4" />, path: "/profile" },
    { id: "settings", titleAr: "الإعدادات", titleEn: "Settings", icon: <Settings className="w-4 h-4" />, path: "/profile" },
  ];

  const filteredActions = actions.filter(a => 
    (isAr ? a.titleAr : a.titleEn).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAction = useCallback((path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery("");
  }, [navigate]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center z-[100] md:hidden active:scale-95 transition-all"
      >
        <Command size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] px-4 transition-all duration-300 opacity-100">
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <div
            className="relative w-full max-w-xl bg-card rounded-3xl border border-border/40 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 scale-100 opacity-100 translate-y-0"
          >
            <div className="flex items-center gap-4 px-6 py-4 border-b border-border/10">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input 
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAr ? "ابحث عن ميزة، أداة، أو إعداد..." : "Search for a feature, tool, or setting..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-naskh outline-none"
                dir={isAr ? "rtl" : "ltr"}
              />
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-muted text-[10px] font-bold text-muted-foreground border border-border/20">
                <span className="text-[12px]">ESC</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {filteredActions.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground">
                    <Search size={20} />
                  </div>
                  <p className="text-sm text-muted-foreground font-naskh">
                    {isAr ? "لم يتم العثور على نتائج" : "No results found"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1" dir={isAr ? "rtl" : "ltr"}>
                  {filteredActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.path)}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 transition-all group active:scale-[0.99]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                         {action.icon}
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-serif font-bold text-primary">{isAr ? action.titleAr : action.titleEn}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{action.path}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <Command size={12} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-muted/30 border-t border-border/10 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-muted border border-border/20">↑↓</span>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-muted border border-border/20">ENTER</span>
                  <span>Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Command className="w-3 h-3" />
                <span>Quraaniat Pro</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommandPalette;
