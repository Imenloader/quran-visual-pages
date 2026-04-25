import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book, Info, Loader2 } from 'lucide-react';
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
}

// 💡 مترجم احتياطي: في حال أعاد السيرفر الكلمة باللغة الإنجليزية
const translateEnglishToArabicFallback = (text: string) => {
  if (!text) return "غير متوفر";
  
  // إذا كان النص يحتوي على حروف عربية، فهو مترجم وجاهز
  if (/[\u0600-\u06FF]/.test(text)) return text;

  // قاموس للكلمات الإنجليزية المتكررة التي يعجز السيرفر أحياناً عن ترجمتها
  const fallbackDict: Record<string, string> = {
    "the": "الـ (أداة تعريف)",
    "and": "حرف عطف (و)",
    "in": "في (حرف جر)",
    "of": "من (حرف جر)",
    "to": "إلى (حرف جر)",
    "for": "لـ (حرف جر)",
    "on": "على (حرف جر)",
    "from": "من (حرف جر)",
    "with": "مع",
    "by": "بـ (حرف جر)",
    "as": "كـ (حرف تشبيه)",
    "but": "لكن",
    "or": "أو",
    "not": "أداة نفي (لا / لم)",
    "no": "لا",
    "is": "يكون",
    "that": "ذلك",
    "this": "هذا",
    "he": "هو",
    "she": "هي",
    "they": "هم",
    "we": "نحن",
    "you": "أنت / أنتم",
    "i": "أنا",
    "master": "مالك / سيّد",
    "allah": "الله",
    "god": "إله"
  };

  const cleanText = text.toLowerCase().trim();
  
  // إذا كانت الكلمة موجودة في القاموس نعيدها، وإلا نكتب "أداة / حرف" بدلاً من تركها بالإنجليزية
  return fallbackDict[cleanText] || "كلمة / أداة (لا يوجد ترجمة مستقلة)";
};

const WordAnalysisPopup: React.FC<WordAnalysisPopupProps> = ({ 
  word, 
  surahNumber, 
  ayahNumber, 
  wordIndex, 
  onClose 
}) => {
  const [wordData, setWordData] = useState<QuranWordData | null>(null);
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

        // 1. جلب معنى الكلمة (ونجبر الـ API على إرجاع العربية باستخدام word_translation_language=ar)
        const quranRes = fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,location&word_translation_language=ar`);
        
        // 2. جلب التفسير الميسر للآية كاملة
        const tafsirRes = fetch(`https://api.alquran.cloud/v1/ayah/${verseKey}/ar.muyassar`);

        const [quranResponse, tafsirResponse] = await Promise.all([quranRes, tafsirRes].map(p => p.catch(() => null)));

        if (!quranResponse || !quranResponse.ok) throw new Error("فشل في جلب بيانات الكلمة");

        const quranJson = await quranResponse.json();
        const tafsirJson = tafsirResponse?.ok ? await tafsirResponse.json() : null;

        const words: QuranWordData[] = Array.isArray(quranJson?.verse?.words) ? quranJson.verse.words : [];
        const normalizedClickedWord = normalizeArabicWord(word);

        let targetWord = words[wordIndex];

        // المطابقة الاحتياطية في حال اختلاف الترتيب
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
        setAyahTafsir(tafsirJson?.data?.text || 'التفسير غير متوفر حالياً.');

      } catch (err) {
        console.error(err);
        setError("تعذر جلب البيانات. تأكد من اتصالك بالإنترنت.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [surahNumber, ayahNumber, wordIndex, word]);

  // معالجة معنى الكلمة لضمان ظهوره باللغة العربية
  const wordMeaning = wordData?.translation?.text 
    ? translateEnglishToArabicFallback(wordData.translation.text) 
    : "غير متوفر";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-x-4 bottom-24 z-[1000] max-h-[85vh] flex flex-col max-w-lg mx-auto bg-card/95 backdrop-blur-2xl rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* رأس النافذة */}
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

        {/* المحتوى */}
        <div className="p-6 pt-4 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground font-naskh">جاري جلب المعنى والتفسير...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-destructive font-naskh bg-destructive/10 rounded-2xl border border-destructive/20">{error}</div>
          ) : (
            <div className="space-y-4 pb-4">
              
              {/* قسم معنى الكلمة */}
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={18} className="text-primary" />
                  <span className="text-sm font-bold font-naskh text-primary">معنى الكلمة</span>
                </div>
                <p className="text-[18px] font-naskh font-bold text-foreground leading-loose text-right">
                  {wordMeaning}
                </p>
              </div>

              {/* قسم التفسير */}
              <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Book size={18} className="text-emerald-600" />
                  <span className="text-sm font-bold font-naskh text-emerald-700">تفسير الآية (الميسر)</span>
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
