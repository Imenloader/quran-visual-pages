import { toast } from "sonner";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Info, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWithCache, CACHE_EXPIRY } from "@/lib/apiClient";
import { fetchTafsir, fetchAyahText } from "@/services/tafsirService";
import { normalizeArabic } from "@/lib/arabicUtils";
import { useTheme } from "@/contexts/ThemeContext";
import { applyTajweedColors } from "@/lib/tajweedParser";
import BackButton from "@/components/BackButton";
import FontSizeAdjuster from "@/components/FontSizeAdjuster";

interface Surah {
  number: number;
  name: string;
  numberOfAyahs: number;
}

const Tafsir = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tajweedMode, fontSizes } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedAyah, setSelectedAyah] = useState(1);
  const [ayahCount, setAyahCount] = useState(7);
  const [tafsir, setTafsir] = useState("");
  const [ayahText, setAyahText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWithCache("https://api.alquran.cloud/v1/surah", { expiry: CACHE_EXPIRY })
      .then(data => {
        if (data.status === "OK") {
          setSurahs(data.data);
        }
      })
      .catch(err => console.error("Error fetching surahs:", err));
  }, []);

  useEffect(() => {
    if (surahs.length > 0) {
      const surah = surahs.find(s => s.number === selectedSurah);
      if (surah) {
        setAyahCount(surah.numberOfAyahs);
        if (selectedAyah > surah.numberOfAyahs) {
          setSelectedAyah(1);
        }
      }
    }
  }, [selectedSurah, surahs, selectedAyah]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    
    const loadData = async () => {
      try {
        const [text, tafsirData] = await Promise.all([
          fetchAyahText(selectedSurah, selectedAyah, controller.signal),
          fetchTafsir(selectedSurah, selectedAyah, controller.signal)
        ]);
        
        setAyahText(text);
        setTafsir(tafsirData.text);
      } catch (err) {
        if (err instanceof Error && err.message === "Request aborted") return;
        
        console.error("Error fetching tafsir:", err);
        setAyahText("");
        const errorMessage = (err instanceof Error ? err.message : "") || "";
        if (errorMessage && (errorMessage.includes("Failed to fetch") || errorMessage.includes("network") || errorMessage.includes("aborted"))) {
          setTafsir("فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
        } else {
          setTafsir(t("hub.tafsirContent.error"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => controller.abort();
  }, [selectedSurah, selectedAyah, t]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const normalizedQuery = normalizeArabic(searchQuery);
    const encodedQuery = encodeURIComponent(searchQuery);
    
    fetchWithCache(`https://api.alquran.cloud/v1/search/${encodedQuery}/all/ar.quran-simple`, { expiry: CACHE_EXPIRY })
      .then(data => {
        if (data.status === "OK" && data.data.count > 0) {
          const firstResult = data.data.matches[0];
          setSelectedSurah(firstResult.surah.number);
          setSelectedAyah(firstResult.numberInSurah);
          toast.success(t("search.ayahMatches") + `: ${data.data.count}`);
        } else {
          toast.error(t("search.noResults", { query: searchQuery }));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Search error:", err);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <BackButton />
          <h1 className="text-xl font-bold font-naskh">{t("hub.tafsir")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="space-y-6">
          <div className="relative mb-6">
            <button 
              onClick={handleSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-accent"
            >
              <Search className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder={t("hub.tafsirContent.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-card border border-border rounded-2xl py-4 pr-12 pl-4 text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-soft text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-naskh text-foreground">{t("hub.tafsirContent.title")}</h2>
              <p className="text-sm text-muted-foreground font-naskh leading-relaxed">
                {t("hub.tafsirContent.description")}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <select 
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
                className="bg-muted border border-border rounded-xl px-4 py-3 text-sm font-naskh focus:outline-none"
              >
                {surahs.map(s => (
                  <option key={s.number} value={s.number}>{s.name}</option>
                ))}
              </select>
              <select 
                value={selectedAyah}
                onChange={(e) => setSelectedAyah(parseInt(e.target.value))}
                className="bg-muted border border-border rounded-xl px-4 py-3 text-sm font-naskh focus:outline-none"
              >
                {Array.from({ length: ayahCount }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>{t("hub.tafsirContent.ayahLabel")} {i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <FontSizeAdjuster context="tafsir" min={14} max={40} />
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key={`${selectedSurah}-${selectedAyah}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl">
                  <p className="text-lg font-naskh text-primary text-center leading-loose mb-4">
                    {tajweedMode ? applyTajweedColors(ayahText) : ayahText}
                  </p>
                  <div className="h-px bg-primary/10 w-full mb-4" />
                  <p 
                    className="font-naskh text-foreground leading-relaxed text-right"
                    style={{ fontSize: `${fontSizes.tafsir || 18}px` }}
                  >
                    {tafsir}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex items-start gap-3">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground font-naskh leading-relaxed">
              {t("hub.tafsirContent.info")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tafsir;
