import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Book, Info, Loader2, Volume2, Copy, 
  Share2, ChevronLeft, Sparkles, Hash,
  AlertCircle, CheckCircle2, History, ExternalLink
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
  transliteration?: { text: string };
}

interface TafsirData {
  data: {
    text: string;
    surah: {
      name: string;
      number: number;
    };
    numberInSurah: number;
  };
}

// --- Utilities ---

const normalizeArabicWord = (value: string = "") =>
  value
    .replace(/[\u064B-\u065F\u0670]/g, "")
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
    `https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,location,audio_url,transliteration&word_translation_language=en`
  );
  if (!response.ok) throw new Error("Failed to fetch word data");
  
  const data = await response.json();
  const words: QuranWordData[] = data.verse.words;
  const normalizedWord = normalizeArabicWord(word);

  // Match logic: Priority to index, then normalization
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

// --- Components ---

const SectionHeader = ({ icon: Icon, title, colorClass = "text-primary" }: { icon: any, title: string, colorClass?: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className={`p-1.5 rounded-lg bg-current/10 ${colorClass}`}>
      <Icon size={16} />
    </div>
    <span className={`text-sm font-bold font-naskh ${colorClass}`}>{title}</span>
  </div>
);

const WordAnalysisPopup: React.FC<WordAnalysisPopupProps> = ({ 
  word, surahNumber, ayahNumber, wordIndex, onClose 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. Fetch Main Data
  const { data: analysis, isLoading: isMainLoading, error: mainError } = useQuery({
    queryKey: ['word-analysis', surahNumber, ayahNumber, word, wordIndex],
    queryFn: () => fetchWordAnalysis(surahNumber, ayahNumber, word, wordIndex),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // 2. Fetch Tafsir (depends on analysis)
  const { data: tafsir, isLoading: isTafsirLoading } = useQuery({
    queryKey: ['tafsir', analysis?.verseKey],
    queryFn: () => fetchTafsir(analysis!.verseKey),
    enabled: !!analysis?.verseKey,
    staleTime: 1000 * 60 * 60,
  });

  // 3. Translate Word (depends on analysis)
  const { data: translatedMeaning, isLoading: isTranslating } = useQuery({
    queryKey: ['translate', analysis?.word?.translation?.text],
    queryFn: () => translateText(analysis!.word!.translation!.text!),
    enabled: !!analysis?.word?.translation?.text,
    staleTime: 1000 * 60 * 60,
  });

  const locationText = useMemo(() => {
    if (!analysis) return "";
    const [s, a, w] = analysis.word.location.split(":").map(toArabicNumber);
    return `الجزء ${toArabicNumber(analysis.juz)} • سورة ${s} • آية ${a} • الكلمة ${w}`;
  }, [analysis]);

  const handleAudio = useCallback(() => {
    if (!analysis?.word?.audio_url || isPlaying) return;
    const audio = new Audio(`https:${analysis.word.audio_url}`);
    setIsPlaying(true);
    audio.play().finally(() => {
      audio.onended = () => setIsPlaying(false);
    });
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
        text: `الكلمة: ${word}\nالمعنى: ${translatedMeaning}\nالموقع: ${locationText}`,
        url: window.location.href,
      });
    } catch (e) {
      handleCopy(`${word}: ${translatedMeaning}`, "بيانات الكلمة");
    }
  };

  const isLoading = isMainLoading || isTafsirLoading || isTranslating;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-card/90 backdrop-blur-2xl rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="p-6 pb-2 flex items-start justify-between bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-4xl font-quran text-primary drop-shadow-sm leading-tight">{word}</h3>
                <button 
                  onClick={handleAudio}
                  disabled={!analysis?.word?.audio_url || isPlaying}
                  className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-30 active:scale-95 mt-1"
                  aria-label="استمع للكلمة"
                >
                  {isPlaying ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold uppercase tracking-wider">
                  {analysis?.word?.transliteration?.text || '...'}
                </span>
                <p className="text-[11px] text-muted-foreground/80 font-naskh font-bold">
                  {locationText || "جاري التحميل..."}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 pt-2 overflow-y-auto custom-scrollbar flex-1">
            {mainError ? (
              <div className="py-12 px-6 text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle size={32} />
                </div>
                <h4 className="text-lg font-bold font-naskh">حدث خطأ أثناء جلب البيانات</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  تأكد من اتصالك بالإنترنت وحاول مرة أخرى لاحقاً.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <div className="space-y-4 pb-6">
                
                {/* Meaning Section */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group relative p-5 bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] rounded-3xl border border-primary/10 hover:border-primary/20 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleCopy(translatedMeaning || "", "المعنى")}
                      className="p-1.5 rounded-lg bg-white/50 dark:bg-black/20 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  
                  <SectionHeader icon={Info} title="معنى الكلمة" />
                  
                  <div className="space-y-2">
                    {isTranslating ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 size={16} className="animate-spin text-primary/50" />
                        <span className="text-sm text-muted-foreground font-naskh">جاري استخراج المعنى...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xl font-naskh font-bold text-foreground leading-relaxed">
                          {translatedMeaning}
                        </p>
                        {analysis?.word?.translation?.text && analysis.word.translation.text !== translatedMeaning && (
                          <p className="text-xs text-muted-foreground font-medium italic mt-1 ltr opacity-60">
                            ({analysis.word.translation.text})
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Tafsir Section */}
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-5 bg-gradient-to-br from-emerald-500/[0.03] to-emerald-500/[0.08] rounded-3xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all"
                >
                  <SectionHeader icon={Book} title="تفسير الآية (الميسر)" colorClass="text-emerald-600 dark:text-emerald-400" />
                  
                  {isTafsirLoading ? (
                    <div className="space-y-2 py-2">
                      <div className="h-4 bg-emerald-500/10 rounded animate-pulse w-full" />
                      <div className="h-4 bg-emerald-500/10 rounded animate-pulse w-[90%]" />
                      <div className="h-4 bg-emerald-500/10 rounded animate-pulse w-[80%]" />
                    </div>
                  ) : (
                    <p className="text-[15px] font-naskh text-foreground/90 leading-[1.8] text-justify">
                      {tafsir?.data?.text || 'تعذر جلب التفسير لهذه الآية.'}
                    </p>
                  )}
                </motion.div>

                {/* Analysis Footer / Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                      <Hash size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">الآية</p>
                      <p className="text-sm font-bold font-naskh">{toArabicNumber(ayahNumber)}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">الموقع</p>
                      <p className="text-sm font-bold font-naskh">الجزء {analysis ? toArabicNumber(analysis.juz) : '...'}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 bg-muted/50 border-t border-border/40 flex items-center gap-3 shrink-0">
            <button 
              onClick={handleShare}
              disabled={!analysis}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Share2 size={18} />
              <span>مشاركة النتائج</span>
            </button>
            <button 
              onClick={() => handleCopy(`${word}: ${translatedMeaning}`, "بيانات الكلمة")}
              disabled={!analysis}
              className="p-3.5 rounded-2xl bg-background border border-border/60 text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-50"
              title="نسخ الكل"
            >
              <Copy size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WordAnalysisPopup;

