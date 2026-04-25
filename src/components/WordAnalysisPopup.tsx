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

// 💡 خطة الطوارئ الأخيرة: إذا فشل جوجل والإنترنت تماماً
const translateEnglishToArabicFallback = (text: string) => {
  if (!text) return "غير متوفر";
  if (/[\u0600-\u06FF]/.test(text)) return text;

  const fallbackDict: Record<string, string> = {
    "the": "الـ", "and": "و", "in": "في", "of": "من", "to": "إلى",
    "for": "لـ", "on": "على", "from": "من", "with": "مع", "by": "بـ",
    "as": "كـ", "but": "لكن", "or": "أو", "not": "لا", "no": "لا",
    "is": "يكون", "that": "ذلك", "this": "هذا", "he": "هو",
    "she": "هي", "they": "هم", "we": "نحن", "you": "أنت / أنتم",
    "i": "أنا", "master": "مالك", "allah": "الله", "god": "إله"
  };

  const cleanText = text.toLowerCase().trim();
  return fallbackDict[cleanText] || "كلمة / أداة";
};

// 💡 المترجم الديناميكي باستخدام Google Translate
const translateWithGoogle = async (text: string): Promise<string> => {
  if (!text) return "";
  // إذا كان النص عربياً بالفعل، نرجعه كما هو
  if (/[\u0600-\u06FF]/.test(text)) return text;

  try {
    // محاولة الاتصال بخدمة ترجمة بديلة وموثوقة (تدعم CORS ومجانية)
    // نستخدم MyMemory API كبديل سريع يعتمد على محركات جوجل للترجمة المباشرة
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    throw new Error("Translation not found in response");
  } catch (error) {
    console.error("Google Translate via Proxy failed, using fallback dict.", error);
    // العودة للقاموس المحلي في حال فشل جلب الترجمة
    return translateEnglishToArabicFallback(text);
  }
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
  const [wordMeaning, setWordMeaning] = useState<string>('جاري الترجمة...');
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

        const quranRes = fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,location&word_translation_language=ar`);
        const tafsirRes = fetch(`https://api.alquran.cloud/v1/ayah/${verseKey}/ar.muyassar`);

        const [quranResponse, tafsirResponse] = await Promise.all([quranRes, tafsirRes].map(p => p.catch(() => null)));

        if (!quranResponse || !quranResponse.ok) throw new Error("فشل في جلب بيانات الكلمة");

        const quranJson = await quranResponse.json();
        const tafsirJson = tafsirResponse?.ok ? await tafsirResponse.json() : null;

        const words: QuranWordData[] = Array.isArray(quranJson?.verse?.words) ? quranJson.verse.words : [];
        const normalizedClickedWord = normalizeArabicWord(word);

        let targetWord = words[wordIndex];

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

        // 💡 استخدام مترجم جوجل للمتغيرات القادمة بالإنجليزية
        if (targetWord?.translation?.text) {
          const translated = await translateWithGoogle(targetWord.translation.text);
          setWordMeaning(translated);
        } else {
          setWordMeaning("غير متوفر");
        }

      } catch (err) {
        console.error(err);
        setError("تعذر جلب البيانات. تأكد من اتصالك بالإنترنت.");
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
        className="fixed inset-x-4 bottom-24 z-[1000] max-h-[85vh] flex flex-col max-w-lg mx-auto bg-card/95 backdrop-blur-2xl rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden"
        dir="rtl"
      >
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
              
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={18} className="text-primary" />
                  <span className="text-sm font-bold font-naskh text-primary">معنى الكلمة</span>
                </div>
                <p className="text-[18px] font-naskh font-bold text-foreground leading-loose text-right">
                  {wordMeaning}
                </p>
              </div>

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
