import React, { useState, useEffect } from "react";
import { ChevronRight, Eye, EyeOff, CheckCircle2, RotateCcw, BookOpen, Search, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { surahIndex, toArabicNumber } from "@/data/quranData";
import { dailyVerses } from "@/data/dailyVersesData";
import { motion, AnimatePresence } from "motion/react";
import QuranHeader from "@/components/QuranHeader";
import { toast } from "sonner";
import { syncService } from "@/services/syncService";

interface MemorizationProgress {
  [surahNumber: number]: {
    masteredAyahs: number[];
    lastPracticed: string;
  };
}

const Memorization: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<typeof surahIndex[0] | null>(null);
  const [ayahs, setAyahs] = useState<{ text: string; number: number; hidden: boolean }[]>([]);
  const [progress, setProgress] = useState<MemorizationProgress>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const saved = await syncService.loadData<MemorizationProgress>("quran-memorization-progress", {});
    setProgress(saved);
    setLoading(false);
  };

  const saveProgress = async (newProgress: MemorizationProgress) => {
    setProgress(newProgress);
    await syncService.saveData("quran-memorization-progress", newProgress);
  };

  const startSurah = async (surah: typeof surahIndex[0]) => {
    setSelectedSurah(surah);
    // Mocking fetching ayahs (in a real app, we'd fetch from an API or local data)
    // For now, let's use some dailyVerses or mock data
    const mockAyahs = Array.from({ length: 10 }, (_, i) => ({
      text: `آية رقم ${i + 1} من سورة ${surah.name}`,
      number: i + 1,
      hidden: true
    }));
    setAyahs(mockAyahs);
  };

  const toggleAyah = (index: number) => {
    const newAyahs = [...ayahs];
    newAyahs[index].hidden = !newAyahs[index].hidden;
    setAyahs(newAyahs);
  };

  const markAsMastered = (ayahNumber: number) => {
    if (!selectedSurah) return;
    const currentMastered = progress[selectedSurah.number]?.masteredAyahs || [];
    if (currentMastered.includes(ayahNumber)) return;

    const newProgress = {
      ...progress,
      [selectedSurah.number]: {
        masteredAyahs: [...currentMastered, ayahNumber],
        lastPracticed: new Date().toISOString()
      }
    };
    saveProgress(newProgress);
    toast.success(isAr ? "تم تمييز الآية كـ مُتقنة" : "Ayah marked as mastered");
  };

  const filteredSurahs = surahIndex.filter(s => 
    s.name.includes(searchQuery) || s.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader />
      
      <main className="container-responsive py-8 space-y-8">
        {!selectedSurah ? (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-serif font-bold text-primary">{isAr ? "مساعد الحفظ" : "Memorization Assistant"}</h1>
              <p className="text-muted-foreground font-naskh">{isAr ? "تتبع تقدمك في حفظ القرآن الكريم بطريقة تفاعلية" : "Track your Quran memorization progress interactively"}</p>
            </div>

            <div className="relative max-w-md mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
              <input
                type="text"
                placeholder={isAr ? "بحث عن سورة..." : "Search Surah..."}
                className="w-full h-14 pr-12 pl-6 rounded-2xl bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 font-naskh text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSurahs.map(surah => {
                const masteredCount = progress[surah.number]?.masteredAyahs.length || 0;
                return (
                  <motion.button
                    key={surah.number}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startSurah(surah)}
                    className="p-6 rounded-[2rem] bg-card border border-border/40 hover:border-primary/30 transition-all text-right flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-serif font-bold group-hover:bg-primary group-hover:text-white transition-all">
                        {isAr ? toArabicNumber(surah.number) : surah.number}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg">{isAr ? surah.name : surah.nameEn}</h3>
                        <p className="text-[10px] text-muted-foreground font-naskh">
                          {masteredCount > 0 ? (isAr ? `تم حفظ ${toArabicNumber(masteredCount)} آيات` : `${masteredCount} ayahs memorized`) : (isAr ? "لم يبدأ بعد" : "Not started")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-primary/20 group-hover:text-primary transition-colors" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between bg-card/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-border/40 sticky top-24 z-40">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedSurah(null)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                  <RotateCcw size={18} />
                </button>
                <h2 className="text-2xl font-serif font-bold">{isAr ? selectedSurah.name : selectedSurah.nameEn}</h2>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                <Trophy size={16} className="text-gold" />
                <span className="text-xs font-bold text-primary">{toArabicNumber(progress[selectedSurah.number]?.masteredAyahs.length || 0)}</span>
              </div>
            </div>

            <div className="space-y-6">
              {ayahs.map((ayah, idx) => (
                <motion.div
                  key={idx}
                  layout
                  className="p-8 rounded-[2rem] bg-card border border-border/40 space-y-6 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {isAr ? toArabicNumber(ayah.number) : ayah.number}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleAyah(idx)}
                        className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                      >
                        {ayah.hidden ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button 
                        onClick={() => markAsMastered(ayah.number)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          progress[selectedSurah.number]?.masteredAyahs.includes(ayah.number)
                            ? "bg-emerald-500 text-white"
                            : "bg-muted hover:bg-emerald-500/10 hover:text-emerald-500"
                        }`}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`text-3xl font-quran leading-relaxed text-right transition-all duration-700 ${ayah.hidden ? "blur-md opacity-20 select-none" : "blur-0 opacity-100"}`}>
                    {ayah.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Memorization;
