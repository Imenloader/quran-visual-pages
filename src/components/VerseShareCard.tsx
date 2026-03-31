import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, X, Sparkles, MoonStar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toArabicNumber } from '@/data/quranData';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'gold' | 'emerald' | 'night'>('gold');

  const themes = {
    gold: "bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-gold/30 text-gold",
    emerald: "bg-gradient-to-br from-[#064e3b] to-[#065f46] border-emerald-400/30 text-emerald-50",
    night: "bg-black border-white/10 text-white"
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `Ayah-${verse.surahName}-${verse.ayahNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

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
              ref={cardRef}
              className={`w-[400px] aspect-[4/5] rounded-[2rem] p-10 flex flex-col justify-between relative overflow-hidden border-4 shadow-2xl ${themes[selectedTheme]}`}
              dir="rtl"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                <div className="absolute inset-0 pattern-islamic scale-150" />
              </div>
              <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10 pointer-events-none">
                <div className="absolute inset-0 pattern-islamic scale-150" />
              </div>

              <div className="flex justify-center mb-6">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${selectedTheme === 'gold' ? 'border-gold/40' : 'border-white/20'}`}>
                  <MoonStar size={24} strokeWidth={1} />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-8 text-center">
                <p className="text-3xl md:text-4xl font-quran leading-relaxed">
                  {verse.text}
                </p>
                {translation && (
                  <p className="text-sm font-naskh opacity-80 leading-loose italic">
                    {translation}
                  </p>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-current/20 flex flex-col items-center gap-2">
                <div className="font-serif font-bold text-lg">
                  {verse.surahName} • آية {toArabicNumber(verse.ayahNumber)}
                </div>
                <div className="text-[8px] uppercase tracking-[0.4em] opacity-50">
                  Quran Kareem App
                </div>
              </div>
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

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-5 rounded-[2rem] bg-accent text-accent-foreground font-serif font-bold text-lg flex items-center justify-center gap-3 hover:shadow-gold-glow transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Sparkles className="animate-spin" size={20} />
            ) : (
              <Download size={20} />
            )}
            {isGenerating ? "جاري التوليد..." : "تحميل الصورة"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VerseShareCard;
