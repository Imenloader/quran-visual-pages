import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, BookOpen, Search, Info, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWithCache } from "@/lib/apiClient";
import { normalizeArabic } from "@/lib/arabicUtils";
import { useTheme } from "@/contexts/ThemeContext";
import { applyTajweedColors } from "@/lib/tajweedParser";

interface Surah {
  number: number;
  name: string;
  numberOfAyahs: number;
}

const Tafsir = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tajweedMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedAyah, setSelectedAyah] = useState(1);
  const [ayahCount, setAyahCount] = useState(7);
  const [tafsir, setTafsir] = useState("");
  const [ayahText, setAyahText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWithCache("https://api.alquran.cloud/v1/surah")
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
    setLoading(true);
    // Fetch Ayah text and Tafsir
    Promise.all([
      fetchWithCache(`https://api.alquran.cloud/v1/ayah/${selectedSurah}:${selectedAyah}/ar.quran-simple`),
      fetchWithCache(`https://api.alquran.cloud/v1/ayah/${selectedSurah}:${selectedAyah}/ar.muyassar`)
    ])
    .then(([ayahData, tafsirData]) => {
      if (ayahData.status === "OK" && tafsirData.status === "OK") {
        setAyahText(ayahData.data.text);
        setTafsir(tafsirData.data.text);
      } else {
        setAyahText("");
        setTafsir(t("hub.tafsirContent.error"));
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching tafsir:", err);
      setLoading(false);
    });
  }, [selectedSurah, selectedAyah, t]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const normalizedQuery = normalizeArabic(searchQuery);
    const encodedQuery = encodeURIComponent(searchQuery);
    
    fetchWithCache(`https://api.alquran.cloud/v1/search/${encodedQuery}/all/ar.quran-simple`)
      .then(data => {
        if (data.status === "OK" && data.data.count > 0) {
          const firstResult = data.data.matches[0];
          setSelectedSurah(firstResult.surah.number);
          setSelectedAyah(firstResult.numberInSurah);
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
          <button 
            onClick={() => navigate("/hub")}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
          >
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </button>
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
            <div className="w-16 h-16 rounded-2xl bg-emerald-deep/10 text-emerald-deep flex items-center justify-center mx-auto">
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

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <Loader2 className="w-8 h-8 text-emerald-deep animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key={`${selectedSurah}-${selectedAyah}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-6 bg-emerald-deep/5 border border-emerald-deep/10 rounded-3xl">
                  <p className="text-lg font-naskh text-emerald-deep text-center leading-loose mb-4">
                    {tajweedMode ? applyTajweedColors(ayahText) : ayahText}
                  </p>
                  <div className="h-px bg-emerald-deep/10 w-full mb-4" />
                  <p className="text-sm font-naskh text-foreground leading-relaxed text-right">
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
