import React, { useState, useCallback, useRef } from 'react';
import {
  X, Loader2, Volume2, Copy,
  Share2, Hash, Sparkles, AlertCircle,
  CheckCircle2
} from 'lucide-react';

import { toArabicNumber } from '@/data/quranData';
import { useWordAnalysis } from '@/hooks/useWordAnalysis';
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

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// ---------------- UI Helpers ----------------

const Section = ({ title, children }: SectionProps) => (
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

  const { data: meaningData, isLoading: translating } = useTranslation(
    analysis?.englishMeaning,
    analysis?.arabicMeaning
  );

  const { data: wordTafsirData, isLoading: loadingWordTafsir } = useWordTafsir(word);
  
  const meaning = wordTafsirData?.meaning || meaningData;

  // ---------------- Actions ----------------

  const handleAudio = useCallback(() => {
    if (!analysis?.word?.audio_url || isPlaying) return;

    let url = analysis.word.audio_url;

    if (url.startsWith('//')) url = `https:${url}`;
    if (!url.startsWith('http')) {
      // Use verses.quran.com for wbw audio
      url = url.startsWith('wbw/') ? `https://verses.quran.com/${url}` : `https://verses.quran.com/${url}`;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    setIsPlaying(true);

    audio.play().catch((err) => {
      console.error("Audio play failed:", err);
      setIsPlaying(false);
      toast.error("تعذر تشغيل الصوت");
    });

    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      toast.error("خطأ في تحميل الملف الصوتي");
    };
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="relative w-full max-w-md bg-card rounded-2xl shadow-xl p-6 space-y-6 max-h-[85vh] overflow-y-auto"
        dir="rtl"
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-3xl font-quran text-primary">{word}</h2>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleAudio}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              title="استماع"
            >
              {isPlaying ? (
                <Loader2 className="animate-spin text-primary" size={20} />
              ) : (
                <Volume2 className="text-muted-foreground hover:text-primary" size={20} />
              )}
            </button>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-10 space-y-4">
            <AlertCircle className="mx-auto text-destructive" size={40} />
            <p className="text-muted-foreground font-medium">تعذر تحميل البيانات. يرجى المحاولة لاحقاً.</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm text-muted-foreground animate-pulse">جاري التحليل...</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Meaning */}
            <Section title="معنى الكلمة">
              {translating || loadingWordTafsir ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="animate-spin" size={14} />
                  <span className="text-sm">جاري البحث...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xl font-bold text-foreground">
                    {meaning || "غير متوفر"}
                  </p>
                  {wordTafsirData?.notes && (
                    <p className="text-sm text-muted-foreground italic border-r-2 border-primary/20 pr-3 py-1 mt-2">
                      {wordTafsirData.notes}
                    </p>
                  )}
                </div>
              )}
            </Section>

            {/* Meta */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg">
                  <Hash size={12} />
                  <span>آية {toArabicNumber(ayahNumber)}</span>
                </div>

                <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg">
                  <Sparkles size={12} />
                  <span>
                    جزء {analysis ? toArabicNumber(analysis.juz) : "..."}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
          >
            <Share2 size={18} />
            مشاركة
          </button>

          <button
            onClick={() => handleCopy(`${word} - ${meaning}`)}
            className="p-3 border border-border bg-background rounded-xl hover:bg-muted transition-colors"
            title="نسخ"
          >
            <Copy size={18} className="text-muted-foreground" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default WordAnalysisPopup;