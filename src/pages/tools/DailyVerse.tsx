import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Share2, Heart, BookOpen, Quote, RefreshCw, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { dailyVerses, DailyVerseData } from "@/data/dailyVersesData";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { applyTajweedColors } from "@/lib/tajweedParser";

const DailyVerse = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { tajweedMode } = useTheme();
  const [verse, setVerse] = useState<DailyVerseData | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const getDailyVerse = (isRandom = false) => {
    if (isRandom) {
      const randomIndex = Math.floor(Math.random() * dailyVerses.length);
      return dailyVerses[randomIndex];
    }
    
    // Use date as seed for daily consistency
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % dailyVerses.length;
    return dailyVerses[index];
  };

  useEffect(() => {
    setVerse(getDailyVerse());
    
    // Check if liked from local storage
    const likedVerses = JSON.parse(localStorage.getItem("liked-verses") || "[]");
    const currentVerse = getDailyVerse();
    setIsLiked(likedVerses.some((v: DailyVerseData) => v.text === currentVerse.text));
  }, []);

  const handleRefresh = () => {
    setVerse(getDailyVerse(true));
    setIsLiked(false);
  };

  const toggleLike = () => {
    if (!verse) return;
    const likedVerses = JSON.parse(localStorage.getItem("liked-verses") || "[]");
    let newLiked;
    if (isLiked) {
      newLiked = likedVerses.filter((v: DailyVerseData) => v.text !== verse.text);
      toast.success(i18n.language === 'ar' ? "تمت الإزالة من المفضلة" : "Removed from favorites");
    } else {
      newLiked = [...likedVerses, verse];
      toast.success(i18n.language === 'ar' ? "تمت الإضافة إلى المفضلة" : "Added to favorites");
    }
    localStorage.setItem("liked-verses", JSON.stringify(newLiked));
    setIsLiked(!isLiked);
  };

  const handleCopy = () => {
    if (!verse) return;
    const textToCopy = `"${verse.text}"\nسورة ${verse.surah} - آية ${verse.number}\n\n${verse.tafsir}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(i18n.language === 'ar' ? "تم نسخ الآية والتفسير" : "Verse and Tafsir copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!verse) return;
    const shareData = {
      title: t("hub.dailyVerse"),
      text: `"${verse.text}"\nسورة ${verse.surah} - آية ${verse.number}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (!verse) return null;

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-emerald-deep/5 -skew-y-6 -translate-y-32 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-64 bg-accent/5 skew-y-6 translate-y-32 pointer-events-none" />

      <div className="max-w-md mx-auto relative z-10">
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/hub")}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground shadow-sm active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </button>
          <h1 className="text-xl font-bold font-naskh text-foreground">{t("hub.dailyVerse")}</h1>
          <button 
            onClick={handleRefresh}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground shadow-sm active:rotate-180 transition-transform"
            title={i18n.language === 'ar' ? "آية عشوائية" : "Random Verse"}
          >
            <RefreshCw className="w-5 h-5 text-emerald-deep" />
          </button>
        </header>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={verse.text}
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-10 md:p-14 bg-card border border-border rounded-[3.5rem] shadow-islamic text-center space-y-10 overflow-hidden group"
            >
              <div className="absolute top-0 left-0 p-8 opacity-[0.05] pointer-events-none transition-transform duration-700 group-hover:scale-110">
                <Quote className="w-40 h-40 text-emerald-deep" />
              </div>
              
              <div className="relative z-10 space-y-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-emerald-deep/10 text-emerald-deep mb-4 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <BookOpen className="w-8 h-8" />
                </div>
                
                <p className="text-3xl md:text-4xl font-bold font-naskh text-foreground leading-[1.6] px-2">
                  {tajweedMode ? applyTajweedColors(verse.text) : verse.text}
                </p>
                
                <div className="space-y-2 pt-6 border-t border-border/50">
                  <p className="text-xl font-bold font-naskh text-emerald-deep">سورة {verse.surah}</p>
                  <p className="text-sm text-muted-foreground font-mono tracking-widest uppercase">
                    {i18n.language === 'ar' ? `الآية ${verse.number}` : `Ayah ${verse.number}`}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={toggleLike}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-soft transition-all active:scale-90 ${
                isLiked ? "bg-accent text-white" : "bg-card border border-border text-foreground hover:bg-accent/10 hover:text-accent"
              }`}
            >
              <Heart className={`w-7 h-7 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button 
              onClick={handleCopy}
              className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground shadow-soft hover:bg-emerald-deep/10 hover:text-emerald-deep transition-all active:scale-90"
            >
              {copied ? <Check className="w-7 h-7 text-emerald-600" /> : <Copy className="w-7 h-7" />}
            </button>
            <button 
              onClick={handleShare}
              className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground shadow-soft hover:bg-emerald-deep/10 hover:text-emerald-deep transition-all active:scale-90"
            >
              <Share2 className="w-7 h-7" />
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-8 bg-muted/30 backdrop-blur-sm rounded-[2.5rem] border border-border/50 space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-deep/5 rounded-full -translate-y-12 translate-x-12" />
            <h3 className="text-sm font-bold font-naskh text-emerald-deep flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-deep" />
              التفسير الميسر
            </h3>
            <p className="text-sm text-muted-foreground font-naskh leading-relaxed text-right">
              {verse.tafsir}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DailyVerse;
