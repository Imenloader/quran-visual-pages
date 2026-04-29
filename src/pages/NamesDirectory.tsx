import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Heart, 
  Baby, 
  History
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import ScrollReveal from "@/components/ScrollReveal";
import BackButton from "@/components/BackButton";
import { islamicNames } from "@/data/islamicNamesData";

const NamesDirectory = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "boy" | "girl">("all");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorite-names");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (name: string) => {
    const newFavs = favorites.includes(name) ? favorites.filter(n => n !== name) : [...favorites, name];
    setFavorites(newFavs);
    localStorage.setItem("favorite-names", JSON.stringify(newFavs));
  };

  const filteredNames = useMemo(() => {
    return islamicNames.filter(n => {
      const matchesSearch = 
        n.name.includes(searchQuery) || 
        n.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.meaning.includes(searchQuery) ||
        n.meaningEn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = genderFilter === "all" || n.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [searchQuery, genderFilter]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={i18n.language === 'ar' ? "دليل الأسماء الإسلامية" : "Islamic Names Directory"} 
        subtitle={i18n.language === 'ar' ? "اختر اسماً مباركاً لمولودك الجديد" : "Choose a blessed name for your newborn"} 
        variant="compact" 
      />

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="mb-8">
          <BackButton variant="outline" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder={i18n.language === 'ar' ? "ابحث عن اسم أو معنى..." : "Search for a name or meaning..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pr-12 pl-6 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg"
            />
          </div>
          <div className="flex p-1 bg-muted/50 rounded-2xl">
            {["all", "boy", "girl"].map((id) => (
              <button
                key={id}
                onClick={() => setGenderFilter(id as "all" | "boy" | "girl")}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${
                  genderFilter === id ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {id === "all" ? (i18n.language === 'ar' ? "الكل" : "All") : id === "boy" ? (i18n.language === 'ar' ? "أولاد" : "Boys") : (i18n.language === 'ar' ? "بنات" : "Girls")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNames.map((item) => (
            <div 
              key={item.name}
              className="p-6 rounded-[2rem] bg-card border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 group relative active:scale-98"
            >
              <button 
                onClick={() => toggleFavorite(item.name)}
                className={`absolute top-4 left-4 p-2 rounded-full transition-all ${
                  favorites.includes(item.name) ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-muted text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                } active:scale-90`}
              >
                <Heart size={16} className={favorites.includes(item.name) ? "fill-current" : ""} />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${item.gender === 'boy' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'} group-hover:scale-110 transition-transform duration-500`}>
                  <Baby size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-serif">{item.name}</h3>
                  <p className="text-primary font-bold text-sm">{item.nameEn}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {i18n.language === 'ar' ? item.meaning : item.meaningEn}
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <History size={12} />
                  {i18n.language === 'ar' ? item.origin : item.originEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NamesDirectory;
