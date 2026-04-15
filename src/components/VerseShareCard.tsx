import React, { useState, useEffect, useCallback } from 'react';
import { Download, Share2, X, Sparkles, MoonStar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toArabicNumber } from '@/data/quranData';
import { useTheme } from '@/contexts/ThemeContext';
import { applyTajweedColors } from '@/lib/tajweedParser';
import { toast } from 'sonner';
import { renderVerseToBlob } from '@/lib/verseRenderer';

interface VerseShareCardProps {
  verse: {
    text: string;
    surahName: string;
    ayahNumber: number;
  };
  translation?: string;
  onClose: () => void;
}

const VerseShareCard: React.FC<VerseShareCardProps> = ({ verse, translation, onClose }) => {
  const { tajweedMode } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'gold' | 'emerald' | 'night'>('gold');
  const [preRenderedBlob, setPreRenderedBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const themes = {
    gold: "bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-gold/30 text-gold",
    emerald: "bg-gradient-to-br from-[#064e3b] to-[#065f46] border-emerald-400/30 text-emerald-50",
    night: "bg-black border-white/10 text-white"
  };

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Pre-render the image with a debounce and lower scale for mobile stability
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      if (!isMounted) return;
      
      try {
        // Wait for fonts to be ready
        if (document.fonts) {
          await document.fonts.ready;
        }

        const blob = await renderVerseToBlob({
          verse,
          translation,
          theme: selectedTheme
        });
        
        if (blob && isMounted) {
          setPreRenderedBlob(blob);
          setBlobUrl(prev => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
        }
      } catch (error) {
        console.error("Pre-render failed:", error);
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedTheme, verse, translation]);

  const handleDownload = useCallback(async () => {
    if (blobUrl) {
      const link = document.createElement('a');
      link.download = `Ayah-${verse.surahName}-${verse.ayahNumber}.png`;
      link.href = blobUrl;
      link.click();
      toast.success("تم تحميل الصورة بنجاح");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await renderVerseToBlob({
        verse,
        translation,
        theme: selectedTheme
      });
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Ayah-${verse.surahName}-${verse.ayahNumber}.png`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
        toast.success("تم تحميل الصورة بنجاح");
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("فشل في تحميل الصورة");
    } finally {
      setIsGenerating(false);
    }
  }, [blobUrl, verse, translation, selectedTheme]);

  const handleShare = useCallback(async () => {
    if (isGenerating) return;

    const performShare = async (blob: Blob) => {
      const file = new File([blob], `Ayah-${verse.surahName}-${verse.ayahNumber}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          await navigator.share({
            files: [file],
            title: `آية من سورة ${verse.surahName}`,
            text: `آية ${toArabicNumber(verse.ayahNumber)} من سورة ${verse.surahName}`,
          });
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            console.error("Share failed:", error);
            if (!(error as Error).message.includes('earlier share')) {
              toast.error("فشل في المشاركة");
            }
          }
        }
      } else {
        handleDownload();
      }
    };

    if (preRenderedBlob) {
      await performShare(preRenderedBlob);
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await renderVerseToBlob({
        verse,
        translation,
        theme: selectedTheme
      });

      if (!blob) {
        toast.error("فشل في توليد الصورة");
        return;
      }

      await performShare(blob);
    } catch (error) {
      console.error("Failed to generate image for sharing:", error);
      toast.error("فشل في توليد الصورة للمشاركة");
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, preRenderedBlob, verse, translation, selectedTheme, handleDownload]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl bg-card rounded-[2.5rem] border border-border/40 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <h3 className="font-serif text-xl text-primary flex items-center gap-2">
            <Share2 size={20} className="text-accent" />
            مشاركة الآية
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent/10 text-muted-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Card Preview */}
          <div className="flex justify-center">
            <div 
              className={`w-[300px] aspect-[4/5] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden border-4 shadow-xl ${themes[selectedTheme]}`}
              dir="rtl"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
                <div className="absolute inset-0 pattern-islamic scale-150" />
              </div>
              <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 pointer-events-none">
                <div className="absolute inset-0 pattern-islamic scale-150" />
              </div>

              <div className="flex justify-center mb-4">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${selectedTheme === 'gold' ? 'border-gold/40' : 'border-white/20'}`}>
                  <MoonStar size={20} strokeWidth={1} />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-4 text-center overflow-hidden">
                <p 
                  className="font-quran leading-relaxed"
                  style={{ 
                    fontSize: verse.text.length > 200 ? '1.25rem' : verse.text.length > 100 ? '1.5rem' : '1.875rem' 
                  }}
                >
                  {tajweedMode ? applyTajweedColors(verse.text) : verse.text}
                </p>
                {translation && (
                  <p 
                    className="font-naskh opacity-80 leading-loose italic"
                    style={{ 
                      fontSize: translation.length > 200 ? '0.65rem' : '0.75rem' 
                    }}
                  >
                    {translation}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-current/20 flex flex-col items-center gap-1">
                <div className="font-serif font-bold text-base">
                  {verse.surahName} • آية {toArabicNumber(verse.ayahNumber)}
                </div>
                <div className="text-[6px] uppercase tracking-[0.4em] opacity-50">
                  Quran Kareem App
                </div>
              </div>
              
              {!preRenderedBlob && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex justify-center gap-4">
            {(['gold', 'emerald', 'night'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTheme(t)}
                className={`w-12 h-12 rounded-2xl transition-all border-2 ${
                  selectedTheme === t ? 'border-accent scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                } ${themes[t]}`}
              />
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleShare}
              disabled={isGenerating || !preRenderedBlob}
              className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-serif font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg transition-all disabled:opacity-50"
              title="مشاركة"
            >
              {isGenerating ? (
                <Sparkles className="animate-spin" size={24} />
              ) : (
                <Share2 size={24} />
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating || !preRenderedBlob}
              className="flex-1 py-4 rounded-2xl bg-accent text-accent-foreground font-serif font-bold text-lg flex items-center justify-center gap-3 hover:shadow-gold-glow transition-all disabled:opacity-50"
              title="تحميل الصورة"
            >
              {isGenerating ? (
                <Sparkles className="animate-spin" size={24} />
              ) : (
                <Download size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerseShareCard;
