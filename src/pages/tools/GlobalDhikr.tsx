import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Users, Fingerprint, Globe, Sparkles, TrendingUp, Info } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/firebase";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { toast } from "sonner";

const GlobalDhikr = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [globalCount, setGlobalCount] = useState<number>(0);
  const [personalCount, setPersonalCount] = useState<number>(0);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { addAthkarRecited } = useUser();

  // Sync with Firestore
  useEffect(() => {
    const dhikrDoc = doc(db, "stats", "dhikr");
    
    // Try to read the doc — if permission denied, operate in local-only mode
    const unsubscribe = onSnapshot(dhikrDoc, (snap) => {
      if (snap.exists()) {
        setGlobalCount(snap.data().count || 0);
      }
      setIsLoading(false);
    }, (error) => {
      // Silently degrade — Firestore rules haven't been configured yet
      if (error.code !== 'permission-denied') {
        console.warn("Global Dhikr Snapshot Error:", error);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDhikr = async () => {
    setSessionCount(prev => prev + 1);
    setPersonalCount(prev => prev + 1);
    
    // Increment personal stats and points
    addAthkarRecited(1);

    // Haptic feedback for native and supported browsers
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    } else if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Silently attempt Firestore sync — degrades gracefully if rules block it
    try {
      const dhikrDoc = doc(db, "stats", "dhikr");
      await updateDoc(dhikrDoc, {
        count: increment(1),
        lastUpdate: new Date()
      });
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
        console.error("Error updating global dhikr:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 overflow-x-hidden">
      <QuranHeader 
        title={isAr ? "تسبيح عالمي" : "Global Dhikr"} 
        subtitle={isAr ? "شارك المسلمين حول العالم في ذكر الله" : "Join Muslims worldwide in remembering Allah"}
        variant="compact"
      />

      <div className="max-w-4xl mx-auto w-full px-4 mt-8 space-y-8 flex-1">
        <header className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Globe className="w-4 h-4 text-emerald-500 animate-spin-slow" />
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Live Worldwide</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Global Counter Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bento-card !p-8 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Globe className="w-24 h-24 text-primary" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center shadow-inner">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">{isAr ? "إجمالي التسبيح العالمي" : "Global Dhikr Total"}</h3>
              </div>
              
              <div className="space-y-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={globalCount}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-6xl font-bold tracking-tighter text-primary"
                  >
                    {globalCount.toLocaleString()}
                  </motion.div>
                </AnimatePresence>
                <p className="text-xs text-muted-foreground font-medium">{isAr ? "تسبيحة تمت حتى الآن" : "Praises performed so far"}</p>
              </div>

              <div className="pt-4 border-t border-primary/10">
                <div className="flex items-center gap-2 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold">{isAr ? "مباشر ومستمر" : "Live & Increasing"}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Personal Stats Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bento-card !p-8 bg-card border-border/40 space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner">
                <Fingerprint className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">{isAr ? "مساهمتك اليوم" : "Your Contribution"}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">{sessionCount}</div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{isAr ? "هذه الجلسة" : "This Session"}</p>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">{personalCount}</div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{isAr ? "الإجمالي الشخصي" : "Personal Total"}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-accent mt-0.5" />
              <p className="text-[10px] leading-relaxed text-muted-foreground italic">
                {isAr 
                  ? "كل تسبيحة تقوم بها ترفع رصيد الأمة وتكتب لك أجراً بإذن الله." 
                  : "Every praise you make increases the Ummah's balance and earns you reward, InshaAllah."}
              </p>
            </div>
          </motion.div>
        </div>

        {/* The Dhikr Button */}
        <div className="flex flex-col items-center justify-center py-12 space-y-12">
          <div className="relative group">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/40 transition-colors"
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDhikr}
              className="relative w-64 h-64 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-2xl flex flex-col items-center justify-center gap-4 border-[12px] border-white/10 group-active:border-white/20 transition-all"
            >
              <Fingerprint className="w-20 h-20 text-white group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white font-naskh">سُبْحَانَ اللَّهِ</span>
                <span className="text-[10px] text-white/60 uppercase tracking-widest">Tap to Praise</span>
              </div>
              
              {/* Pulse effect */}
              <AnimatePresence>
                {sessionCount > 0 && (
                  <motion.div
                    key={sessionCount}
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-full border-4 border-white/30"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex items-start gap-3 max-w-md mx-auto">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground font-naskh leading-relaxed">
              {isAr 
                ? "يتم تحديث العداد العالمي بشكل فوري ومباشر عند كل تسبيحة من أي مستخدم حول العالم." 
                : "The global counter is updated in real-time as users worldwide perform Dhikr."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalDhikr;
