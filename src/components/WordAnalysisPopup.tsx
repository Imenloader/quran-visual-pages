import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book, FileText, Activity, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toArabicNumber } from '@/data/quranData';

interface WordAnalysisPopupProps {
  word: string;
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
  onClose: () => void;
}

interface QuranWordAnalysisData {
  text_uthmani?: string;
  location?: string;
  root?: { text?: string };
  grammar?: { text?: string; type?: string };
  corpusUrl?: string;
}

interface VerseByKeyResponse {
  verse?: {
    juz_number?: number;
    words?: QuranWordAnalysisData[];
  };
}

interface QuraniTag {
  code?: string;
  meaning?: string;
  user_meaning?: string;
}

interface QuraniMorphologyResponse {
  code?: number;
  data?: {
    morphology?: {
      tags_by_category?: {
        Root?: QuraniTag[];
        Irab?: QuraniTag[];
        Sarf?: QuraniTag[];
      };
    };
  };
}

const pickTagText = (tags: QuraniTag[] = []) =>
  tags
    .map((tag) => tag.user_meaning || tag.meaning || tag.code || "")
    .map((text) => text.trim())
    .filter(Boolean);

const fetchQuraniMorphology = async (location: string) => {
  const url = `https://api.qurani.ai/gw/qh/v1/morphology/word/${location}?include_meaning=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load Qurani morphology");
  const json: QuraniMorphologyResponse = await res.json();
  const tags = json?.data?.morphology?.tags_by_category;
  const rootCandidates = pickTagText(tags?.Root || []);
  const grammarCandidates = [
    ...pickTagText(tags?.Irab || []),
    ...pickTagText(tags?.Sarf || []),
  ];

  return {
    rootText: rootCandidates[0] || null,
    grammarText: grammarCandidates.length ? grammarCandidates.join(" • ") : null,
    sourceUrl: `https://qurani.ai/en/morphology/${location}`,
  };
};

const WordAnalysisPopup: React.FC<WordAnalysisPopupProps> = ({ word, surahNumber, ayahNumber, wordIndex, onClose }) => {
  const { i18n } = useTranslation();
  const [data, setData] = useState<QuranWordAnalysisData | null>(null);
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
      `السورة ${toArabicNumber(surah)}`,
      `الآية ${toArabicNumber(ayah)}`,
      `الكلمة ${toArabicNumber(wordAtAyah)}`,
    ].filter(Boolean);

    return parts.join(" • ");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const verseKey = `${surahNumber}:${ayahNumber}`;
        const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,location,root,grammar`);
        if (!res.ok) throw new Error("Failed to fetch word data");
        const json: VerseByKeyResponse = await res.json();

        const words = Array.isArray(json?.verse?.words) ? json.verse.words : [];
        const normalizedClickedWord = normalizeArabicWord(word);

        // 1) Try exact index first
        let wordData = words[wordIndex];

        // 2) If index mismatch, try by normalized text match
        if (!wordData || normalizeArabicWord(wordData.text_uthmani) !== normalizedClickedWord) {
          wordData = words.find((w) => normalizeArabicWord(w?.text_uthmani) === normalizedClickedWord);

          // 3) Last fallback: partial normalized match
          if (!wordData) {
            wordData = words.find((w) => {
              const normalizedApiWord = normalizeArabicWord(w?.text_uthmani);
              return normalizedApiWord && (normalizedApiWord.includes(normalizedClickedWord) || normalizedClickedWord.includes(normalizedApiWord));
            });
          }
        }

        if (!wordData) {
          throw new Error("No matching word found");
        }

        const missingRoot = !wordData?.root?.text;
        const missingGrammar = !wordData?.grammar?.text && !wordData?.grammar?.type;
        if ((missingRoot || missingGrammar) && wordData.location) {
          try {
            const morphology = await fetchQuraniMorphology(wordData.location);
            wordData = {
              ...wordData,
              root: wordData.root?.text ? wordData.root : { text: morphology.rootText || "غير متوفر" },
              grammar: wordData.grammar?.text || wordData.grammar?.type
                ? wordData.grammar
                : { text: morphology.grammarText || "تحليل نحوي غير متوفر لهذه الكلمة" },
              corpusUrl: morphology.sourceUrl,
            };
          } catch {
            // Keep Quran.com data as-is if Qurani API fallback is unavailable.
          }
        }

        setJuzNumber(Number(json?.verse?.juz_number) || null);
        setData(wordData);
      } catch (err) {
        setError("تعذر جلب بيانات الكلمة");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [surahNumber, ayahNumber, wordIndex, word]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-x-4 bottom-24 z-[1000] max-w-lg mx-auto bg-card/95 backdrop-blur-2xl rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <X size={20} />
        </button>
        <div className="text-center">
          <h3 className="text-3xl font-quran text-primary">{word}</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">تحليل الكلمة</p>
        </div>
        <div className="w-10" />
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs text-muted-foreground font-naskh">جاري التحليل اللغوي...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-destructive font-naskh">{error}</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Root Section */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-3 mb-2">
                <Book size={16} className="text-primary" />
                <span className="text-xs font-bold font-naskh text-primary">الجذر اللغوي</span>
              </div>
              <p className="text-2xl font-quran text-foreground">{data?.root?.text || "غير متوفر"}</p>
            </div>

            {/* Grammar Section */}
            <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
              <div className="flex items-center gap-3 mb-2">
                <FileText size={16} className="text-amber-600" />
                <span className="text-xs font-bold font-naskh text-amber-700">التحليل النحوي</span>
              </div>
              <p className="text-sm font-naskh text-foreground leading-loose">
                {data?.grammar?.text || data?.grammar?.type || "تحليل نحوي غير متوفر لهذه الكلمة"}
              </p>
            </div>

            {/* Stats/Occurrences Section */}
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={16} className="text-emerald-600" />
                <span className="text-xs font-bold font-naskh text-emerald-700">الموقع</span>
              </div>
              <p className="text-sm font-naskh text-muted-foreground leading-relaxed">
                {formatArabicLocation(data?.location, juzNumber)}
              </p>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground font-naskh italic">
            تم الاستعانة ببيانات Quran.com للتحليل اللغوي
          </p>
          {data?.corpusUrl && (
            <a
              href={data.corpusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[11px] font-naskh text-primary hover:underline"
            >
              عرض التحليل الكامل من مصدر الصرف
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default WordAnalysisPopup;
