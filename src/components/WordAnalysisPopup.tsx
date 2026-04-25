import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Book, Info, Loader2, Volume2, Copy, 
  Share2, Sparkles, Hash, AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { toArabicNumber } from '@/data/quranData';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

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
  audio_url?: string;
  translation?: { text: string };
}

interface TafsirData {
  data: {
    text: string;
  };
}

// --- Utilities ---

const normalizeArabicWord = (value: string = "") =>
  value
    .replace(/[\u064B-\u065F\u0670\u0654\u0655]/g, "")
    .replace(/[^\u0621-\u063A\u0641-\u064A]/g, "");

const fallbackDict: Record<string, string> = {
  "the": "الـ", "and": "و", "in": "في", "of": "من", "to": "إلى",
  "for": "لـ", "on": "على", "from": "من", "with": "مع", "by": "بـ",
  "as": "كـ", "but": "لكن", "or": "أو", "not": "لا", "no": "لا",
  "is": "يكون", "that": "ذلك", "this": "هذا", "he": "هو",
  "she": "هي", "they": "هم", "we": "نحن", "you": "أنت / أنتم",
  "i": "أنا", "master": "مالك", "allah": "الله", "god": "إله",
  "lord": "رب", "merciful": "رحيم", "compassionate": "رحمن",
  "praise": "حمد", "worlds": "عالمين", "king": "ملك", "day": "يوم"
};

const translateEnglishToArabicFallback = (text: string) => {
  if (!text) return "غير متوفر";
  if (/[\u0600-\u06FF]/.test(text)) return text;
  const cleanText = text.toLowerCase().replace(/[.,!?;:]/g, "").trim();
  return fallbackDict[cleanText] || text;
};

// --- API Functions ---

const fetchWordAnalysis = async (surah: number, ayah: number, word: string, index: number) => {
  const verseKey = `${surah}:${ayah}`;
  const response = await fetch(
    `https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,location,audio_url&word_translation_language=en`
  );
  if (!response.ok) throw new Error("Failed to fetch word data");
  
  const data = await response.json();
  const words: QuranWordData[] = data.verse.words;
  const normalizedWord = normalizeArabicWord(word);

  let target = words[index];
  if (!target || normalizeArabicWord(target.text_uthmani) !== normalizedWord) {
    target = words.find(w => normalizeArabicWord(w.text_uthmani) === normalizedWord) || target || words[0];
  }
  
  return {
    word: target,
    juz: data.verse.juz_number,
    verseKey
  };
};

const fetchTafsir = async (verseKey: string): Promise<TafsirData> => {
  const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verseKey}/ar.muyassar`);
  if (!response.ok) throw new Error("Failed to fetch tafsir");
  return response.json();
};

const translateText = async (text: string): Promise<string> => {
  if (!text || /[\u0600-\u06FF]/.test(text)) return text;
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`);
    const data = await res.json();
    return data.responseData?.translatedText || translateEnglishToArabicFallback(text);
  } catch {
    return translateEnglishToArabicFallback(text);
  }
};

const SectionHeader = ({ icon: Icon, title, colorClass = "text-primary" }: { icon: any, title: string, colorClass?: string }) => (
  <div className="flex items-center gap-2 mb-2">
    <div className={`p-1 rounded-lg bg-current/10 ${colorClass}`}>
      <Icon size={14} />
    </div>
    <span className={`text-xs font-bold font-naskh ${colorClass}`}>{title}</span>
  </div>
);

const WordAnalysisPopup: React.FC<WordAnalysisPopupProps> = ({ 
  word, surahNumber, ayahNumber, wordIndex, onClose 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: analysis, isLoading: isMainLoading, error: mainError } = useQuery({
    queryKey: ['word-analysis', surahNumber, ayahNumber, word, wordIndex],
    queryFn: () => fetchWordAnalysis(surahNumber, ayahNumber, word, wordIndex),
    staleTime: 1000 * 60 * 60,
  });

  const { data: tafsir, isLoading: isTafsirLoading } = useQuery({
    queryKey: ['tafsir', analysis?.verseKey],
    queryFn: () => fetchTafsir(analysis!.verseKey),
    enabled: !!analysis?.verseKey,
    staleTime: 1000 * 60 * 60,
  });

  const { data: translatedMeaning, isLoading: isTranslating } = useQuery({
    queryKey: ['translate', analysis?.word?.translation?.text],
    queryFn: () => translateText(analysis!.word!.translation!.text!),
    enabled: !!analysis?.word?.translation?.text,
    staleTime: 1000 * 60 * 60,
  });

  const handleAudio = useCallback(() => {
    if (!analysis?.word?.audio_url || isPlaying) return;
    
    let audioUrl = analysis.word.audio_url;
    if (audioUrl.startsWith('//')) {
      audioUrl = `https:${audioUrl}`;
    } else if (!audioUrl.startsWith('http')) {
      audioUrl = `https://audio.quran.com/${audioUrl}`;
    }

    const audio = new Audio(audioUrl);
    const cleanup = () => setIsPlaying(false);
    setIsPlaying(true);
    audio.play().then(() => { audio.onended = cleanup; }).catch(cleanup);
    audio.onerror = cleanup;
  }, [analysis, isPlaying]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`, {
      icon: <CheckCircle2 className="text-emerald-500" size={16} />,
      position: "top-center"
    });
  };

  const handleShare = async () => {
    if (!analysis) return;
    try {
      await navigator.share({
        title: 'تحليل كلمة قرآنية',
        text: `الكلمة: ${word}\nالمعنى: ${translatedMeaning}`,
        url: window.location.href,
      });
    } catch (e) {
      handleCopy(`${word}: ${translatedMeaning}`, "بيانات الكلمة");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm bg-card/95 backdrop-blur-3xl rounded-[2rem] border border-border/40 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="p-5 pb-2 flex items-start justify-between bg-gradient-to-b from-primary/10 to-transparent">
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-quran text-primary leading-tight">{word}</h3>
              <button 
                onClick={handleAudio}
                disabled={!analysis?.word?.audio_url || isPlaying}
                className="p-2 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-all disabled:opacity-30 active:scale-90 mt-1"
                aria-label="استمع"
              >
                {isPlaying ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
              </button>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 pt-1 overflow-y-auto custom-scrollbar flex-1">
            {mainError ? (
              <div className="py-8 text-center space-y-3">
                <AlertCircle size={24} className="mx-auto text-destructive" />
                <h4 className="text-base font-bold font-naskh">تعذر تحميل البيانات</h4>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                
                {/* 1. معنى الكلمة */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-primary/[0.04] rounded-2xl border border-primary/10"
                >
                  <SectionHeader icon={Info} title="معنى الكلمة" />
                  {isTranslating ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 size={14} className="animate-spin text-primary/40" />
                    </div>
                  ) : (
                    <p className="text-lg font-naskh font-bold text-foreground leading-relaxed">
                      {translatedMeaning}
                    </p>
                  )}
                </motion.div>

                {/* 2. تفسير الآية (الميسر) */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-emerald-500/[0.04] rounded-2xl border border-emerald-500/10"
                >
                  <SectionHeader icon={Book} title="تفسير الآية (الميسر)" colorClass="text-emerald-600 dark:text-emerald-400" />
                  {isTafsirLoading ? (
                    <div className="space-y-2 py-1">
                      <div className="h-3 bg-emerald-500/10 rounded animate-pulse w-full" />
                    </div>
                  ) : (
                    <p className="text-sm font-naskh text-foreground/80 leading-relaxed text-justify">
                      {tafsir?.data?.text || 'تعذر جلب التفسير.'}
                    </p>
                  )}
                </motion.div>

                {/* 3 & 4. الآية والموقع */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/30 flex items-center gap-2">
                    <Hash size={14} className="text-orange-500" />
                    <div>
                      <p className="text-[8px] text-muted-foreground font-bold uppercase">الآية</p>
                      <p className="text-xs font-bold font-naskh">{toArabicNumber(ayahNumber)}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/30 flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-500" />
                    <div>
                      <p className="text-[8px] text-muted-foreground font-bold uppercase">الموقع</p>
                      <p className="text-xs font-bold font-naskh">الجزء {analysis ? toArabicNumber(analysis.juz) : '...'}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-3 bg-muted/40 border-t border-border/30 flex items-center gap-2">
            <button 
              onClick={handleShare}
              disabled={!analysis}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs active:scale-95 transition-all"
            >
              <Share2 size={16} />
              <span>مشاركة</span>
            </button>
            <button 
              onClick={() => handleCopy(`${word}: ${translatedMeaning}`, "بيانات الكلمة")}
              disabled={!analysis}
              className="p-2.5 rounded-xl bg-background border border-border/50 text-foreground active:scale-95 transition-all"
            >
              <Copy size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WordAnalysisPopup;
