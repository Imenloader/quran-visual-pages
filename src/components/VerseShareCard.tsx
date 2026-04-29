
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, Share2, X, Sparkles, MoonStar, Loader2, LayoutGrid, Smartphone, Check } from 'lucide-react';
import { toArabicNumber } from '@/data/quranData';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { renderVerseToBlob } from '@/lib/verseRenderer';
import { shareContent } from '@/services/shareService';
import { cn } from '@/lib/utils';

interface VerseShareCardProps {
  verse: {
    text: string;
    surahName: string;
    ayahNumber: number;
  };
  translation?: string;
  onClose: () => void;
}

type ShareTheme = 'gold' | 'emerald' | 'night' | 'rose' | 'ocean';
type ShareLayout = 'square' | 'story';

const VerseShareCard: React.FC<VerseShareCardProps> = ({ verse, translation, onClose }) => {
  const { tajweedMode } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ShareTheme>('gold');
  const [selectedLayout, setSelectedLayout] = useState<ShareLayout>('square');
  const [preRenderedBlob, setPreRenderedBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const themes: Record<ShareTheme, string> = {
    gold: "bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-gold/30 text-gold",
    emerald: "bg-gradient-to-br from-[#064e3b] to-[#065f46] border-emerald-400/30 text-emerald-50",
    night: "bg-black border-white/10 text-white",
    rose: "bg-gradient-to-br from-[#4c0519] to-[#831843] border-rose-400/30 text-rose-50",
    ocean: "bg-gradient-to-br from-[#0c4a6e] to-[#075985] border-sky-400/30 text-sky-50"
  };

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  // Pre-render the image
  useEffect(() => {
    let isMounted = true;
    const generate = async () => {
      setPreRenderedBlob(null);
      try {
        const blob = await renderVerseToBlob({
          verse,
          translation,
          theme: selectedTheme,
          layout: selectedLayout
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
    };

    const timer = setTimeout(generate, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedTheme, selectedLayout, verse, translation]);

  const handleShare = async () => {
    if (!preRenderedBlob || isGenerating) return;

    setIsGenerating(true);
    try {
      const success = await shareContent({
        title: `آية من سورة ${verse.surahName}`,
        text: `${verse.text}\n\n${translation || ''}\n\nسورة ${verse.surahName} - آية ${verse.ayahNumber}`,
        blob: preRenderedBlob,
        fileName: `Ayah-${verse.surahName}-${verse.ayahNumber}.png`
      });
      
      if (success) toast.success("تمت المشاركة بنجاح");
    } catch (error) {
      toast.error("فشل في المشاركة");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl bg-card rounded-[3rem] border border-border/40 overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Preview Section */}
        <div className="flex-1 bg-muted/30 p-6 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 pattern-islamic opacity-5 pointer-events-none" />
          
          <div 
            className={cn(
              "relative shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden border-2 border-white/10",
              selectedLayout === 'square' ? "aspect-square w-full max-w-[320px]" : "aspect-[9/16] h-full max-h-[450px]"
            )}
          >
            {blobUrl ? (
              <img src={blobUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center", themes[selectedTheme])}>
                <Loader2 className="w-8 h-8 animate-spin opacity-50" />
              </div>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full md:w-80 p-8 space-y-8 bg-card flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-primary flex items-center gap-2">
              <Sparkles size={20} className="text-accent" />
              تخصيص المشاركة
            </h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent/10 text-muted-foreground transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Layout Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">تنسيق الصورة</label>
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedLayout('square')}
                className={cn(
                  "flex-1 py-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                  selectedLayout === 'square' ? "border-accent bg-accent/5 text-accent shadow-lg" : "border-border/40 hover:border-border"
                )}
              >
                <LayoutGrid size={20} />
                <span className="text-[10px] font-bold">مربع (Post)</span>
              </button>
              <button 
                onClick={() => setSelectedLayout('story')}
                className={cn(
                  "flex-1 py-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                  selectedLayout === 'story' ? "border-accent bg-accent/5 text-accent shadow-lg" : "border-border/40 hover:border-border"
                )}
              >
                <Smartphone size={20} />
                <span className="text-[10px] font-bold">طولي (Story)</span>
              </button>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">السمة والألوان</label>
            <div className="grid grid-cols-5 gap-3">
              {(Object.keys(themes) as ShareTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTheme(t)}
                  className={cn(
                    "w-full aspect-square rounded-xl transition-all border-2 flex items-center justify-center relative",
                    selectedTheme === t ? 'border-accent scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100',
                    themes[t]
                  )}
                >
                  {selectedTheme === t && <Check size={14} className="text-current" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 space-y-4">
            <button
              onClick={handleShare}
              disabled={isGenerating || !preRenderedBlob}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-serif font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Share2 size={24} />
                  <span>مشاركة الآية</span>
                </>
              )}
            </button>
            
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
              سيتم توليد صورة عالية الجودة للآية بالتنسيق المختار
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerseShareCard;
