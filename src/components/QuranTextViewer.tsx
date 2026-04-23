import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Loader2, AlertCircle, RefreshCw, BookOpen, GraduationCap, Sparkles, Share2, Info, Play, Pause, SkipBack, SkipForward, Music, Settings2, Volume2, Heart, Check } from "lucide-react";
import { juzData, toArabicNumber } from "@/data/quranData";
import { juzTextData } from "@/data/juzTextData";
import { applyTajweedColors } from "@/lib/tajweedParser";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useFavorites } from "@/hooks/useFavorites";
import VerseShareCard from "@/components/VerseShareCard";
import { fetchTafsir } from "@/services/tafsirService";
import { cn } from "@/lib/utils";
import { parseJuzTextToVerses, type ParsedVerseData } from "@/lib/quranTextParser";

import TajweedLegend from "@/components/TajweedLegend";
import FontSizeAdjuster from "@/components/FontSizeAdjuster";

interface VerseData {
  text: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  fullKey: string; // "surah:ayah"
}

type VerseDataWithBasmalah = VerseData & Pick<ParsedVerseData, "isFirstAyah" | "showBasmalah">;

interface QuranTextViewerProps {
  pageNumber?: number;
  juzNumber?: number;
  hifzMode?: boolean;
  initialVerseKey?: string;
  onVerseInView?: (key: string) => void;
  readOnly?: boolean;
}

const QuranTextViewer: React.FC<QuranTextViewerProps> = ({ 
  pageNumber, 
  juzNumber, 
  hifzMode = false,
  initialVerseKey,
  onVerseInView,
  readOnly = false
}) => {
  const { theme, tajweedMode, fontSizes } = useTheme();
  const { 
    currentVerseKey, syncMode, setSyncMode, 
    isPlaying, togglePlay, skipNextAyah, skipPrevAyah,
    playAyah, selectedEdition, setSelectedEdition, editions,
    audioLoading, currentAyahs, currentAyahIndex, currentSurah
  } = useAudioPlayer();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [localText, setLocalText] = useState<string | null>(null);
  const [currentJuz, setCurrentJuz] = useState<number | null>(null);
  const [hiddenVerses, setHiddenVerses] = useState<Set<number>>(new Set());
  
  // Tafsir State
  const [selectedVerse, setSelectedVerse] = useState<VerseData | null>(null);
  const [tafsirContent, setTafsirContent] = useState<string | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const verseRefs = React.useRef<Record<string, HTMLSpanElement | null>>({});
  const lastReportedVerseKey = React.useRef<string | undefined>(undefined);
  const { isFavorite, toggleFavorite, collections } = useFavorites();
  const [showCollections, setShowCollections] = useState(false);

  // Split text into verses based on common markers and associate with Surah/Ayah
  const versesData = React.useMemo(() => {
    return parseJuzTextToVerses(localText, currentJuz) as VerseDataWithBasmalah[];
  }, [localText, currentJuz]);

  // Scroll to initial verse
  useEffect(() => {
    if (!loading && initialVerseKey && verseRefs.current[initialVerseKey]) {
      // Only scroll if it's NOT the one we just reported as being in view
      if (initialVerseKey !== lastReportedVerseKey.current) {
        const timer = setTimeout(() => {
          verseRefs.current[initialVerseKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, initialVerseKey]);

  // Intersection Observer for verse tracking
  useEffect(() => {
    if (loading || !onVerseInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          const key = (visibleEntry.target as HTMLElement).dataset.verseKey;
          if (key) {
            lastReportedVerseKey.current = key;
            onVerseInView(key);
          }
        }
      },
      { threshold: 0.5, rootMargin: "-10% 0px -70% 0px" }
    );

    const currentRefs = verseRefs.current;
    Object.values(currentRefs).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(currentRefs).forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [loading, onVerseInView, versesData]);

  useEffect(() => {
    const loadText = () => {
      setLoading(true);
      
      let targetJuz = juzNumber;
      
      if (!targetJuz && pageNumber) {
        // Find which Juz this page belongs to
        const juz = juzData.find(j => pageNumber >= j.startPage && pageNumber <= j.endPage);
        if (juz) targetJuz = juz.number;
      }

      if (targetJuz) {
        setCurrentJuz(targetJuz);
        setLocalText(juzTextData[targetJuz as number] || null);
      }
      
      setLoading(false);
    };

    loadText();
  }, [pageNumber, juzNumber]);

  // Load hidden verses from localStorage
  useEffect(() => {
    if (currentJuz) {
      const saved = localStorage.getItem(`quran-hidden-verses-${currentJuz}`);
      if (saved) {
        try {
          setHiddenVerses(new Set(JSON.parse(saved)));
        } catch (e) {
          console.error("Failed to parse hidden verses", e);
        }
      } else if (hifzMode) {
        // Default to all hidden if no saved state and hifzMode is on
        setHiddenVerses(new Set(versesData.map((_, i) => i)));
      }
    } else {
      setHiddenVerses(new Set());
    }
  }, [currentJuz, hifzMode, versesData]);

  // Save hidden verses to localStorage
  useEffect(() => {
    if (currentJuz && hifzMode) {
      localStorage.setItem(`quran-hidden-verses-${currentJuz}`, JSON.stringify(Array.from(hiddenVerses)));
    }
  }, [hiddenVerses, currentJuz, hifzMode]);

  // Track reading progress
  useEffect(() => {
    if (currentJuz && !readOnly) {
      const today = new Date().toISOString().split('T')[0];
      const history = JSON.parse(localStorage.getItem("quran-reading-history-daily") || "[]");
      
      const dayIndex = history.findIndex((h: { date: string; pages: number }) => h.date === today);
      if (dayIndex >= 0) {
        // We only increment if it's a new "session" or just once per page view
        // For simplicity, let's just track that they read something today
        // A better way would be to track page turns
      } else {
        history.push({ date: today, pages: 1 });
        localStorage.setItem("quran-reading-history-daily", JSON.stringify(history));
      }
    }
  }, [currentJuz, readOnly]);

  const toggleVerse = (index: number) => {
    setHiddenVerses(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleVerseClick = async (verse: VerseData, index: number) => {
    if (hifzMode) {
      toggleVerse(index);
      return;
    }

    if (syncMode) {
      playAyah(verse.surahNumber, verse.ayahNumber);
    }

    setSelectedVerse(verse);
    setShowTafsir(true);
    setTafsirLoading(true);
    setTafsirContent(null);

    try {
      const data = await fetchTafsir(verse.surahNumber, verse.ayahNumber);
      setTafsirContent(data.text);
    } catch (error) {
      console.error("Tafsir fetch error:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("network") || errorMessage.includes("aborted")) {
        setTafsirContent("فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
      } else {
        setTafsirContent("حدث خطأ أثناء تحميل التفسير. يرجى المحاولة لاحقاً.");
      }
    } finally {
      setTafsirLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-muted-foreground font-naskh">جاري تحميل النص القرآني...</p>
      </div>
    );
  }

  if (!localText) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 px-6 text-center">
        <div className="w-20 h-20 rounded-[2rem] bg-accent/5 flex items-center justify-center text-accent/40">
          <BookOpen size={40} strokeWidth={1} />
        </div>
        <div className="space-y-2">
          <p className="text-primary font-serif text-xl font-bold">نص الجزء غير متوفر حالياً</p>
          <p className="text-muted-foreground font-serif italic text-sm max-w-xs mx-auto">
            يرجى استخدام "المستورد السحري" في الإعدادات لإضافة نص هذا الجزء يدوياً.
          </p>
        </div>
        <Link 
          to="/settings"
          className="px-6 py-3 rounded-xl bg-accent/10 text-accent font-serif font-bold hover:bg-accent/20 transition-all"
        >
          انتقل للإعدادات
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-5xl mx-auto px-4 md:px-8 py-16 font-quran text-center relative"
      dir="rtl"
    >
      {hifzMode && (
        <div className="mb-12 flex flex-col items-center gap-4 sticky top-24 z-30">
          <div className="px-6 py-3 rounded-2xl bg-accent/10 backdrop-blur-md border border-accent/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">وضع التحفيظ مفعل</p>
              <p className="text-[10px] text-muted-foreground">انقر على الآيات لإخفائها أو إظهارها</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setHiddenVerses(new Set(versesData.map((_, i) => i)))}
              className="px-4 py-1.5 rounded-full bg-card border border-border text-xs font-serif hover:bg-accent/5 transition-all"
            >
              إخفاء الكل
            </button>
            <button
              onClick={() => setHiddenVerses(new Set())}
              className="px-4 py-1.5 rounded-full bg-card border border-border text-xs font-serif hover:bg-accent/5 transition-all"
            >
              إظهار الكل
            </button>
          </div>
        </div>
      )}

      {syncMode && !hifzMode && (
        <div className="mb-4 flex justify-center">
          <div className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 flex items-center gap-2 text-accent animate-pulse">
            <Sparkles size={14} />
            <span className="text-[10px] font-bold font-naskh uppercase tracking-wider">تزامن الآيات مفعل</span>
          </div>
        </div>
      )}

      {tajweedMode && !hifzMode && <TajweedLegend />}

      {!readOnly && (
        <div className="flex justify-center mb-8">
          <FontSizeAdjuster context="reading" min={20} max={80} />
        </div>
      )}

      <div 
        className="text-primary text-center whitespace-pre-wrap break-words selection:bg-accent/30"
        style={{ 
          fontSize: `${fontSizes.reading || 32}px`,
          lineHeight: "2.2", 
          wordSpacing: "-0.05em",
          paddingBottom: "4rem",
          fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1'
        }}
      >
        {versesData.map((verse, index) => {
          const verseMeta = verse as VerseDataWithBasmalah;
          const isHidden = hifzMode && hiddenVerses.has(index);
          const isPlaying = currentVerseKey === verse.fullKey;
          const isNewSurah = index === 0 || versesData[index-1].surahNumber !== verse.surahNumber;
          
          return (
            <React.Fragment key={index}>
              {isNewSurah && (
                <div className="w-full my-12 flex flex-col items-center gap-6 no-select" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/30" />
                    <div className="px-8 py-3 rounded-2xl bg-accent/5 border border-accent/20">
                      <h3 className="text-2xl md:text-3xl font-serif text-accent">{verse.surahName}</h3>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/30" />
                  </div>
                  
                  {verseMeta.showBasmalah && (
                    <div className="text-4xl md:text-5xl font-quran text-primary/80 py-4">
                      بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                    </div>
                  )}
                </div>
              )}

              <span
                ref={el => { verseRefs.current[verse.fullKey] = el; }}
                data-verse-key={verse.fullKey}
                onClick={() => handleVerseClick(verse, index)}
                className={`inline-block transition-all duration-500 cursor-pointer rounded-lg px-1 ${
                  isHidden 
                    ? "blur-2xl opacity-5 grayscale scale-95 bg-muted/20" 
                    : isPlaying
                      ? "bg-accent/20 ring-2 ring-accent/30 scale-105 shadow-lg shadow-accent/10"
                      : "blur-0 opacity-100 scale-100 hover:bg-accent/5"
                }`}
              >
                {tajweedMode && !isHidden ? (
                  applyTajweedColors(verse.text)
                ) : (
                  verse.text
                )}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-16 flex flex-col items-center gap-4 border-t border-border/40 pt-12">
        <div className="w-12 h-12 rounded-full border-2 border-accent/20 flex items-center justify-center text-accent font-serif text-lg">
          {toArabicNumber(currentJuz)}
        </div>
        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">نهاية الجزء</span>
      </div>

      {/* Tafsir Slide-up Panel */}
      <Sheet open={showTafsir} onOpenChange={setShowTafsir}>
        <SheetContent side="bottom" className="h-[60vh] sm:h-[50vh] rounded-t-[2.5rem] border-t-accent/20 bg-card/95 backdrop-blur-xl">
          <SheetHeader className="text-right pb-6 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (selectedVerse) {
                      playAyah(selectedVerse.surahNumber, selectedVerse.ayahNumber);
                    }
                  }}
                  className="p-2 rounded-full hover:bg-accent/10 text-accent transition-colors"
                >
                  <Play size={18} />
                </button>
                <button 
                  onClick={() => setShowShareCard(true)}
                  className="p-2 rounded-full hover:bg-accent/10 text-accent transition-colors"
                >
                  <Share2 size={18} />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowCollections(!showCollections)}
                    className={cn(
                      "p-2 rounded-full transition-all",
                      selectedVerse && isFavorite("verse", selectedVerse.fullKey) 
                        ? "bg-red-500/10 text-red-500" 
                        : "hover:bg-accent/10 text-accent"
                    )}
                  >
                    <Heart size={18} fill={selectedVerse && isFavorite("verse", selectedVerse.fullKey) ? "currentColor" : "none"} />
                  </button>
                  
                  <AnimatePresence>
                    {showCollections && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                      >
                        <div className="p-3 border-b border-border/10 bg-muted/30">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("favorites.addToCollection") || "أضف إلى مجموعة"}</p>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          <button 
                            onClick={() => {
                              if (selectedVerse) {
                                toggleFavorite({ 
                                  type: "verse", id: selectedVerse.fullKey, 
                                  surahNumber: selectedVerse.surahNumber, 
                                  verseNumber: selectedVerse.ayahNumber, 
                                  surahName: selectedVerse.surahName,
                                  text: selectedVerse.text
                                });
                                setShowCollections(false);
                              }
                            }}
                            className="w-full px-4 py-3 text-right text-xs font-serif hover:bg-accent/5 flex items-center justify-between"
                          >
                            <span>الكل</span>
                            {!selectedVerse?.collectionId && <Check size={12} />}
                          </button>
                          {collections.map(col => (
                            <button 
                              key={col.id}
                              onClick={() => {
                                if (selectedVerse) {
                                  toggleFavorite({ 
                                    type: "verse", id: selectedVerse.fullKey, 
                                    surahNumber: selectedVerse.surahNumber, 
                                    verseNumber: selectedVerse.ayahNumber, 
                                    surahName: selectedVerse.surahName,
                                    text: selectedVerse.text,
                                    collectionId: col.id
                                  });
                                  setShowCollections(false);
                                }
                              }}
                              className="w-full px-4 py-3 text-right text-xs font-serif hover:bg-accent/5 flex items-center justify-between border-t border-border/5"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                                <span>{col.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button className="p-2 rounded-full hover:bg-accent/10 text-accent transition-colors">
                  <Info size={18} />
                </button>
              </div>
              <SheetTitle className="font-serif text-2xl text-primary">
                {selectedVerse?.surahName} - آية {selectedVerse?.ayahNumber}
              </SheetTitle>
            </div>
            <SheetHeader className="text-right pb-6 border-b border-border/40">
              <SheetDescription className="font-naskh text-accent/60 text-sm">
                التفسير الميسر
              </SheetDescription>
            </SheetHeader>
          </SheetHeader>
          
          <div className="mt-8 overflow-y-auto max-h-[calc(60vh-150px)] px-2 custom-scrollbar" dir="rtl">
            {tafsirLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-muted-foreground font-naskh">جاري تحميل التفسير...</p>
              </div>
            ) : (
              <div className="space-y-8 pb-12">
                <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10">
                  <p className="text-2xl md:text-3xl font-quran leading-relaxed text-primary text-center">
                    {tajweedMode && selectedVerse?.text ? (
                      applyTajweedColors(selectedVerse.text)
                    ) : (
                      selectedVerse?.text
                    )}
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-lg text-accent flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-accent rounded-full" />
                    تفسير الآية:
                  </h4>
                  <p className="text-lg md:text-xl font-naskh leading-loose text-primary/90 text-justify">
                    {tafsirContent}
                  </p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AnimatePresence>
        {showShareCard && selectedVerse && (
          <VerseShareCard 
            verse={selectedVerse} 
            translation={tafsirContent || undefined}
            onClose={() => setShowShareCard(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuranTextViewer;
