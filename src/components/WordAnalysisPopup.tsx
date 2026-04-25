import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book, FileText, Activity, Loader2 } from 'lucide-react';
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
  root?: { text: string };
  grammar?: { text?: string; type?: string };
  char_type_name?: string;
}

// 💡 قاموس ذكي لترجمة التحليل النحوي من الإنجليزية إلى العربية
const translateGrammarToArabic = (grammarStr: string) => {
  if (!grammarStr || grammarStr.trim() === '') return "تحليل غير متوفر";
  
  let arText = grammarStr.toLowerCase();
  
  const dict: Record<string, string> = {
    "prefixed preposition": "حرف جر متصل",
    "relative pronoun": "اسم موصول",
    "demonstrative pronoun": "اسم إشارة",
    "personal pronoun": "ضمير منفصل",
    "attached pronoun": "ضمير متصل",
    "interrogative pronoun": "اسم استفهام",
    "vocative particle": "حرف نداء",
    "negative particle": "حرف نفي",
    "prohibition particle": "حرف نهي",
    "restriction particle": "حرف حصر",
    "conditional particle": "حرف شرط",
    "coordinating conjunction": "حرف عطف",
    "subordinating conjunction": "حرف عطف فرعي",
    "conjunction": "حرف عطف",
    "preposition": "حرف جر",
    "active participle": "اسم فاعل",
    "passive participle": "اسم مفعول",
    "verbal noun": "اسم فعل",
    "time adverb": "ظرف زمان",
    "location adverb": "ظرف مكان",
    "adjective": "صفة / نعت",
    "imperative": "فعل أمر",
    "perfect verb": "فعل ماضٍ",
    "imperfect verb": "فعل مضارع",
    "pronoun": "ضمير",
    "proper noun": "اسم علم",
    "noun": "اسم",
    "verb": "فعل",
    "particle": "حرف",
    "genitive": "مجرور",
    "accusative": "منصوب",
    "nominative": "مرفوع",
    "masculine": "مذكر",
    "feminine": "مؤنث",
    "singular": "مفرد",
    "plural": "جمع",
    "dual": "مثنى",
    "1st person": "للمتكلم",
    "2nd person": "للمخاطب",
    "3rd person": "للغائب"
  };

  // ترتيب القاموس من الأطول للأقصر لضمان ترجمة الكلمات المركبة أولاً
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  
  keys.forEach(engKey => {
    // استبدال الكلمة الإنجليزية بمقابلها العربي مع فاصلة نقطية لتجميل العرض
    const regex = new RegExp(`\\b${engKey}\\b`, 'gi');
    if (regex.test(arText)) {
      arText = arText.replace(regex, ` ${dict[engKey]} • `);
    }
  });

  // تنظيف النص النهائي من الفواصل الزائدة
  arText = arText.replace(/^[•\s]+|[•\s]+$/g, '').replace(/•\s*•/g, '•').trim();

  // إذا لم يتم ترجمة أي شيء وعاد النص إنجليزياً، نكتب "غير متوفر"
  if (/[a-z]/i.test(arText)) return "تحليل نحوي غير متوفر لهذه الكلمة";
  
  return arText;
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

        // 1. جلب تفاصيل الكلمة (بدون ترجمة إنجليزية لتخفيف الاستهلاك)
        const quranRes = fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,location,root,grammar`);
        
        // 2. جلب التفسير الميسر فقط
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

  // دمج النصوص النحوية القادمة من السيرفر قبل ترجمتها
  const rawGrammarString = [wordData?.grammar?.text, wordData?.grammar?.type].filter(Boolean).join(" ");
  const translatedGrammar = translateGrammarToArabic(rawGrammarString);

  // معالجة الجذر
  const rootText = typeof wordData?.root === 'string' ? wordData.root : wordData?.root?.text;

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
              <p className="text-sm text-muted-foreground font-naskh">جاري التحليل اللغوي...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-destructive font-naskh bg-destructive/10 rounded-2xl border border-destructive/20">{error}</div>
          ) : (
            <div className="space-y-4 pb-4">
              
              {/* قسم الجذر والنوع - مقسم لقسمين متساويين */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center justify-center text-center min-h-[100px]">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Activity size={16} />
                    <span className="text-xs font-bold font-naskh">نوع الكلمة</span>
                  </div>
                  <p className="text-lg font-naskh font-bold text-foreground">
                    {wordData?.char_type_name === 'word' ? 'كلمة' : 'علامة / أخرى'}
                  </p>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center justify-center text-center min-h-[100px]">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Book size={16} />
                    <span className="text-xs font-bold font-naskh">الجذر اللغوي</span>
                  </div>
                  <p className="text-xl font-quran text-foreground">
                    {rootText || "بدون جذر"}
                  </p>
                </div>
              </div>

              {/* قسم التحليل الصرفي والنحوي */}
              <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-amber-600" />
                  <span className="text-sm font-bold font-naskh text-amber-700">التحليل النحوي والصرفي</span>
                </div>
                <p className="text-[15px] font-naskh font-bold text-foreground leading-loose text-right">
                  {translatedGrammar}
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
