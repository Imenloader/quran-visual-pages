import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book, FileText, Activity, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WordAnalysisPopupProps {
  word: string;
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
  onClose: () => void;
}

const WordAnalysisPopup: React.FC<WordAnalysisPopupProps> = ({ word, surahNumber, ayahNumber, wordIndex, onClose }) => {
  const { i18n } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const verseKey = `${surahNumber}:${ayahNumber}`;
        const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,location,root,grammar`);
        if (!res.ok) throw new Error("Failed to fetch word data");
        const json = await res.json();
        // Find the word by index first, but verify with text matching as a fallback
        let wordData = json.verse.words[wordIndex];
        if (!wordData || !word.includes(wordData.text_uthmani)) {
          wordData = json.verse.words.find((w: any) => w.text_uthmani && (w.text_uthmani.includes(word) || word.includes(w.text_uthmani)));
        }
        setData(wordData || json.verse.words[wordIndex]);
      } catch (err) {
        setError("تعذر جلب بيانات الكلمة");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [surahNumber, ayahNumber, wordIndex]);

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
              <p className="text-2xl font-quran text-foreground">{data?.root || "غير متوفر"}</p>
            </div>

            {/* Grammar Section */}
            <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
              <div className="flex items-center gap-3 mb-2">
                <FileText size={16} className="text-amber-600" />
                <span className="text-xs font-bold font-naskh text-amber-700">التحليل النحوي</span>
              </div>
              <p className="text-sm font-naskh text-foreground leading-loose">
                {data?.grammar || "تحليل نحوي غير متوفر لهذه الكلمة"}
              </p>
            </div>

            {/* Stats/Occurrences Section */}
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={16} className="text-emerald-600" />
                <span className="text-xs font-bold font-naskh text-emerald-700">الموقع</span>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                Location: {data?.location}
              </p>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground font-naskh italic">
            تم الاستعانة ببيانات Quran.com للتحليل اللغوي
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WordAnalysisPopup;
