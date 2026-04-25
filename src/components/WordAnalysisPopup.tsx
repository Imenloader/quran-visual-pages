import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book, FileText, Activity, Loader2, Info } from 'lucide-react';
import { toArabicNumber } from '@/data/quranData';

interface WordAnalysisPopupProps {
  word: string;
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
  onClose: () => void;
}

interface QuranWordData {
  text_uthmani: string;
  location: string;
  translation?: { text: string };
  root?: { text: string };
}

const WordAnalysisPopup: React.FC<WordAnalysisPopupProps> = ({ 
  word, 
  surahNumber, 
  ayahNumber, 
  wordIndex, 
  onClose 
}) => {
  const [wordData, setWordData] = useState<QuranWordData | null>(null);
  const [ayahIrab, setAyahIrab] = useState<string>('');
  const [ayahTafsir, setAyahTafsir] = useState<string>('');
  const [juzNumber, setJuzNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeArabicWord = (value: string = "") =>
    value
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/[^\u0621-\u063A\u0641-\u064A]/g, "");

  const formatArabicLocation = (location?: string, juz?: number | null) => {
    if (!location) return "غير متوفر";
    const [surah, ayah, wordAtAyah] = location.split(":").map((v) => Number(v));
    if (![surah, ayah, wordAtAyah].every((value) => Number.isFinite(value) && value > 0)) {
      return location;
    }

    const parts = [
      juz ? `الجزء ${toArabicNumber(juz)}` : null,
      `سورة ${toArabicNumber(surah)}`,
      `آية ${toArabicNumber(ayah)}`,
      `الكلمة ${toArabicNumber(wordAtAyah)}`,
    ].filter(Boolean);

    return parts.join(" • ");
  };

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setLoading(true);
      setError(null);
      try {
        const verseKey = `${surahNumber}:${ayahNumber}`;

        // 1. جلب بيانات الكلمة (الترجمة العربية والجذر) من quran.com
        const quranRes = fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,location,root&word_translation_language=ar`);
        
        // 2. جلب الإعراب النحوي الموثوق من alquran.cloud
        const irabRes = fetch(`https://api.alquran.cloud/v1/ayah/${verseKey}/ar.irab`);
        
        // 3. جلب التفسير الميسر لإضافة قيمة علمية
        const tafsirRes = fetch(`https://api.alquran.cloud/v1/ayah/${verseKey}/ar.muyassar`);

        const [quranResponse, irabResponse, tafsirResponse] = await Promise.all([quranRes, irabRes, tafsirRes]);

        if (!quranResponse.ok) throw new Error("فشل في جلب بيانات الكلمة");

        const quranJson = await quranResponse.json();
        const irabJson = irabResponse.ok ? await irabResponse.json() : null;
        const tafsirJson = tafsirResponse.ok ? await tafsirResponse.json() : null;

        // --- معالجة الكلمة ---
        const words: QuranWordData[] = Array.isArray(quranJson?.verse?.words) ? quranJson.verse.words : [];
        const normalizedClickedWord = normalizeArabicWord(word);

        let targetWord = words[wordIndex];

        // مطابقة الكلمة في حال اختلاف الـ Index
        if (!targetWord || normalizeArabicWord(targetWord.text_uthmani) !== normalizedClickedWord) {
          targetWord = words.find((w) => normalizeArabicWord(w?.text_uthmani) === normalizedClickedWord) || targetWord;
          if (!targetWord) {
            targetWord = words.find((w) => {
              const normalizedApiWord = normalizeArabicWord(w?.text_uthmani);
              return normalizedApiWord && (normalizedApiWord.includes(normalizedClickedWord) || normalizedClickedWord.includes(normalizedApiWord));
            }) || words[0];
          }
        }

        setWordData(targetWord || null);
        setJuzNumber(Number(quranJson?.verse?.juz_number) || null);
        setAyahIrab(irabJson?.data?.text || 'الإعراب غير متوفر لهذه الآية حالياً.');
        setAyahTafsir(tafsirJson?.data?.text || 'التفسير غير متوفر حالياً.');

      } catch (err) {
        console.error(err);
        setError("تعذر جلب البيانات اللغوية. تأكد من اتصالك بالإنترنت.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [surahNumber, ayahNumber, wordIndex, word]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-x-4 bottom-20 z-[1000] max-h-[85vh] flex flex-col max-w-lg mx-auto bg-card/95 backdrop-blur-2xl rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2 shrink-0">
          <div className="flex-1">
            <h3 className="text-3xl font-quran text-primary">{word}</h3>
            <p className="text-xs text-muted-foreground mt-2 font-naskh font-bold">
              {formatArabicLocation(wordData?.location, juzNumber)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground self-start">
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 pt-4 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground font-naskh">جاري جلب التحليل اللغوي...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-destructive font-naskh bg-destructive/10 rounded-2xl border border-destructive/20">{error}</div>
          ) : (
            <div className="space-y-4 pb-4">
              
              {/* قسم معنى الكلمة والجذر */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Info size={16} />
                    <span className="text-xs font-bold font-naskh">معنى الكلمة</span>
                  </div>
                  <p className="text-lg font-naskh font-bold text-foreground">
                    {wordData?.translation?.text && wordData.translation.text !== wordData.text_uthmani 
                      ? wordData.translation.text 
                      : "أداة / حرف"}
                  </p>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Book size={16} />
                    <span className="text-xs font-bold font-naskh">الجذر اللغوي</span>
                  </div>
                  <p className="text-xl font-quran text-foreground">
                    {wordData?.root?.text || "غير متوفر"}
                  </p>
                </div>
              </div>

              {/* قسم الإعراب */}
              <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-amber-600" />
                  <span className="text-sm font-bold font-naskh text-amber-700">إعراب الآية</span>
                </div>
                <p className="text-[15px] font-naskh text-foreground leading-loose text-justify">
                  {ayahIrab}
                </p>
              </div>

              {/* قسم التفسير */}
              <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={18} className="text-emerald-600" />
                  <span className="text-sm font-bold font-naskh text-emerald-700">التفسير الميسر</span>
                </div>
                <p className="text-[15px] font-naskh text-foreground leading-loose text-justify">
                  {ayahTafsir}
                </p>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WordAnalysisPopup;
