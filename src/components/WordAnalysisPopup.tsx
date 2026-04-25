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

const normalizeSpaces = (value: string) => value.replace(/\s+/g, " ").trim();

const toArabicGrammarLabel = (value: string) => {
  const replacements: Array<[RegExp, string]> = [
    [/noun/gi, "اسم"],
    [/verb/gi, "فعل"],
    [/particle/gi, "حرف"],
    [/preposition/gi, "حرف جر"],
    [/pronoun/gi, "ضمير"],
    [/imperative/gi, "أمر"],
    [/perfect/gi, "ماضٍ"],
    [/imperfect/gi, "مضارع"],
    [/genitive/gi, "مجرور"],
    [/accusative/gi, "منصوب"],
    [/nominative/gi, "مرفوع"],
    [/masculine/gi, "مذكر"],
    [/feminine/gi, "مؤنث"],
    [/singular/gi, "مفرد"],
    [/plural/gi, "جمع"],
    [/dual/gi, "مثنى"],
    [/active participle/gi, "اسم فاعل"],
    [/passive participle/gi, "اسم مفعول"],
  ];

  return replacements.reduce((text, [pattern, ar]) => text.replace(pattern, ar), value);
};

const parseCorpusMorphology = (content: string) => {
  const rootMatch =
    content.match(/(?:الجذر|Root)\s*[:：]\s*([^\n\r]+)/i) ||
    content.match(/root is[^()]*\(([^)]+)\)/i);

  const rootTextRaw = rootMatch?.[1] || "";
  const rootText = normalizeSpaces(rootTextRaw.replace(/[^\u0621-\u063A\u0641-\u064A\s]/g, "")) || null;

  const grammarMatch =
    content.match(/(?:الإعراب|Grammar|Morphology)\s*[:：]\s*([^\n\r]+)/i) ||
    content.match(/(noun|verb|particle|preposition|pronoun|imperative|perfect|imperfect)[^.\n\r]{0,120}/i);

  const grammarTextRaw = grammarMatch?.[1] || grammarMatch?.[0] || "";
  const grammarText = grammarTextRaw ? normalizeSpaces(toArabicGrammarLabel(grammarTextRaw)) : null;

  return { rootText, grammarText };
};

const fetchArabicCorpusMorphology = async (location: string) => {
  const baseUrl = `http://corpus.quran.com/wordmorphology.jsp?location=(${location})`;
  const proxies = [
    `https://r.jina.ai/http://corpus.quran.com/wordmorphology.jsp?location=(${location})`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(baseUrl)}`,
  ];

  for (const url of proxies) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      const parsed = parseCorpusMorphology(text);
      if (parsed.rootText || parsed.grammarText) {
        return {
          ...parsed,
          sourceUrl: `https://corpus.quran.com/wordmorphology.jsp?location=(${location})`,
        };
      }
    } catch {
      // try next proxy
    }
  }

  throw new Error("Failed to load Arabic corpus morphology");
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
            const morphology = await fetchArabicCorpusMorphology(wordData.location);
            wordData = {
              ...wordData,
              root: wordData.root?.text ? wordData.root : { text: morphology.rootText || "غير متوفر" },
              grammar: wordData.grammar?.text || wordData.grammar?.type
                ? wordData.grammar
                : { text: morphology.grammarText || "تحليل نحوي غير متوفر لهذه الكلمة" },
              corpusUrl: morphology.sourceUrl,
            };
          } catch {
            // Keep Quran.com data as-is if Arabic corpus fallback is unavailable.
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
