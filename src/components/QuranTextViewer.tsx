import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw, BookOpen } from "lucide-react";
import { juzData, toArabicNumber } from "@/data/quranData";
import { juzTextData } from "@/data/juzTextData";

interface QuranTextViewerProps {
  pageNumber?: number;
  juzNumber?: number;
}

const QuranTextViewer: React.FC<QuranTextViewerProps> = ({ pageNumber, juzNumber }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [localText, setLocalText] = useState<string | null>(null);
  const [currentJuz, setCurrentJuz] = useState<number | null>(null);

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
        try {
          // Priority 1: LocalStorage (for real-time updates)
          const savedText = localStorage.getItem(`quran-juz-text-${targetJuz}`);
          
          // Priority 2: Static Code Data (for persistence across deployments)
          const staticText = juzTextData[targetJuz];
          
          setLocalText(savedText || staticText || null);
        } catch (e) {
          console.error("Failed to load text from localStorage", e);
          setLocalText(juzTextData[targetJuz as number] || null);
        }
      }
      
      setLoading(false);
    };

    loadText();

    // Listen for updates from the importer
    const handleUpdate = () => loadText();
    window.addEventListener("storage", handleUpdate);
    
    // Custom event for same-tab updates
    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem("quran-text-updated");
      if (lastUpdate) loadText();
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, [pageNumber, juzNumber]);

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
      className="w-full max-w-5xl mx-auto px-8 py-16 font-quran text-center"
      dir="rtl"
    >
      <div 
        className="text-3xl md:text-5xl text-primary text-center whitespace-pre-wrap break-words selection:bg-accent/30"
        style={{ 
          lineHeight: "2.2", 
          wordSpacing: "-0.05em",
          paddingBottom: "4rem",
          fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1'
        }}
      >
        {localText}
      </div>
      
      <div className="mt-16 flex flex-col items-center gap-4 border-t border-border/40 pt-12">
        <div className="w-12 h-12 rounded-full border-2 border-accent/20 flex items-center justify-center text-accent font-serif text-lg">
          {toArabicNumber(currentJuz)}
        </div>
        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">نهاية الجزء</span>
      </div>
    </motion.div>
  );
};

export default QuranTextViewer;
