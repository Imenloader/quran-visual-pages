:::writing{variant="standard" id="84219"}
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Info, Loader2, Volume2, Copy,
  Share2, Hash, Sparkles, AlertCircle,
  CheckCircle2, BookOpen
} from 'lucide-react';

import { toArabicNumber } from '@/data/quranData';
import { useWordAnalysis } from '@/hooks/useWordAnalysis';
import { useTafsir } from '@/hooks/useTafsir';
import { useTranslation } from '@/hooks/useTranslation';
import { useWordTafsir } from '@/hooks/useWordTafsir';

import { toast } from 'sonner';

// ---------------- Types ----------------

interface Props {
  word: string;
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
  onClose: () => void;
}

// ---------------- UI Helpers ----------------

const Section = ({ title, children }: any) => (
  <div className="p-4 rounded-2xl border border-border/30 bg-muted/20 space-y-2">
    <h4 className="text-xs font-bold text-primary">{title}</h4>
    {children}
  </div>
);

// ---------------- Component ----------------

const WordAnalysisPopup: React.FC<Props> = ({
  word,
  surahNumber,
  ayahNumber,
  wordIndex,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ---------------- Data ----------------

  const {
    data: analysis,
    isLoading,
    error
  } = useWordAnalysis(surahNumber, ayahNumber, word, wordIndex);

  const { data: tafsir } = useTafsir(analysis?.verseKey);

  const { data: meaning, isLoading: translating } = useTranslation(
    analysis?.englishMeaning,
    analysis?.arabicMeaning
  );

  const wordTafsir = useWordTafsir(word);

  // ---------------- Actions ----------------

  const handleAudio = useCallback(() => {
    if (!analysis?.word?.audio_url || isPlaying) return;

    let url = analysis.word.audio_url;

    if (url.startsWith('//')) url = `https:${url}`;
    if (!url.startsWith('http')) url = `https://audio.quran.com/${url}`;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    setIsPlaying(true);

    audio.play().catch(() => setIsPlaying(false));

    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  }, [analysis, isPlaying]);

  const handleCopy = (text: string) => {
    if (!text) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("تم النسخ", {
        icon: <CheckCircle2 size={16} />
      });
    }
  };

  const handleShare = async () => {
    const text = `${word}\n${meaning || ''}`;

    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        handleCopy(text);
      }
    } catch {
      handleCopy(text);
    }
  };

  // ---------------- Render ----------------

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">

        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Popup */}
        <motion.div
          className="relative w-full max-w-md bg-card rounded-2xl shadow-xl p-4 space-y-4 max-h-[85vh] overflow-y-auto"
          dir="rtl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{word}</h2>

            <div className="flex items-center gap-2">
              <button onClick={handleAudio}>
                {isPlaying ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>

              <button onClick={onClose}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          {error ? (
            <div className="text-center space-y-2">
              <AlertCircle className="mx-auto" />
              <p>تعذر تحميل البيانات</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">

              {/* Meaning */}
              <Section title="معنى الكلمة">
                {translating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <p className="text-lg font-bold">
                    {meaning || "غير متوفر"}
                  </p>
                )}
              </Section>

              {/* Word Tafsir */}
              {wordTafsir && (
                <Section title="شرح الكلمة">
                  {wordTafsir.root && (
                    <p>الجذر: {wordTafsir.root}</p>
                  )}
                  {wordTafsir.meaning && (
                    <p>{wordTafsir.meaning}</p>
                  )}
                  {wordTafsir.notes && (
                    <p className="text-sm text-muted-foreground">
                      {wordTafsir.notes}
                    </p>
                  )}
                </Section>
              )}

              {/* Ayah Tafsir */}
              <Section title="تفسير الآية">
                <p className="text-sm leading-relaxed">
                  {tafsir || "غير متوفر"}
                </p>
              </Section>

              {/* Meta */}
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Hash size={14} />
                  <span>آية {toArabicNumber(ayahNumber)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Sparkles size={14} />
                  <span>
                    جزء {analysis ? toArabicNumber(analysis.juz) : "..."}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white"
            >
              <Share2 size={16} />
              مشاركة
            </button>

            <button
              onClick={() => handleCopy(`${word} - ${meaning}`)}
              className="p-2 border rounded-xl"
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
:::