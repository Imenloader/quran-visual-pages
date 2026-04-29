import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Users, Fingerprint, Globe, Sparkles, TrendingUp, Info } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/firebase";
import { doc, onSnapshot, setDoc, increment } from "firebase/firestore";

// Persist personal daily count in localStorage keyed by today's date
const getTodayKey = () => `global-dhikr-personal-${new Date().toISOString().split("T")[0]}`;

// Daily rotating adhkar — same dhikr worldwide on the same day
const DAILY_ADHKAR = [
  { ar: "سُبْحَانَ اللَّهِ",        en: "Subhan Allah",           meaning: { ar: "سبحان الله", en: "Glory be to Allah" } },
  { ar: "الْحَمْدُ لِلَّهِ",       en: "Alhamdulillah",          meaning: { ar: "الحمد لله", en: "All praise is due to Allah" } },
  { ar: "اللَّهُ أَكْبَرُ",        en: "Allahu Akbar",           meaning: { ar: "الله أكبر", en: "Allah is the Greatest" } },
  { ar: "لَا إِلَٰهَ إِلَّا اللَّهُ", en: "La ilaha illallah",    meaning: { ar: "لا إله إلا الله", en: "There is no god but Allah" } },
  { ar: "أَسْتَغْفِرُ اللَّهَ",     en: "Astaghfirullah",        meaning: { ar: "أستغفر الله", en: "I seek forgiveness from Allah" } },
  { ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", en: "Subhan Allahi wa bihamdihi", meaning: { ar: "سبحان الله وبحمده", en: "Glory and praise be to Allah" } },
  { ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", en: "La hawla wala quwwata illa billah", meaning: { ar: "لا حول ولا قوة إلا بالله", en: "No power except with Allah" } },
  { ar: "سُبْحَانَ اللَّهِ الْعَظِيمِ", en: "Subhan Allahil Azim",  meaning: { ar: "سبحان الله العظيم", en: "Glory be to Allah the Magnificent" } },
  { ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", en: "Allahumma salli ala Muhammad", meaning: { ar: "اللهم صل على محمد", en: "O Allah, send blessings upon Muhammad" } },
  { ar: "حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ", en: "Hasbiyallahu wa ni'mal wakil", meaning: { ar: "حسبي الله ونعم الوكيل", en: "Allah is sufficient for me" } },
  { ar: "يَا حَيُّ يَا قَيُّومُ",    en: "Ya Hayyu Ya Qayyum",     meaning: { ar: "يا حي يا قيوم", en: "O Living, O Sustaining" } },
  { ar: "رَبِّ اغْفِرْ لِي",         en: "Rabbi ighfir li",         meaning: { ar: "رب اغفر لي", en: "My Lord, forgive me" } },
  { ar: "تَوَكَّلْتُ عَلَى اللَّهِ",  en: "Tawakkaltu ala Allah",   meaning: { ar: "توكلت على الله", en: "I put my trust in Allah" } },
  { ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", en: "Bismillahir Rahmanir Rahim", meaning: { ar: "بسم الله الرحمن الرحيم", en: "In the name of Allah, the Most Gracious" } },
];

// Deterministic daily pick — same for all users on the same day
const getDailyDhikr = () => {
  const today = new Date().toISOString().split("T")[0]; // "2026-04-22"
  const seed = today.split("-").reduce((acc, n) => acc + parseInt(n), 0);
  return DAILY_ADHKAR[seed % DAILY_ADHKAR.length];
};

const GlobalDhikr = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const dailyDhikr = getDailyDhikr();
  const [globalCount, setGlobalCount] = useState<number>(0);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [personalCount, setPersonalCount] = useState<number>(() => {
    // Restore today's personal count from localStorage
    return parseInt(localStorage.getItem(getTodayKey()) || "0", 10);
  });
  const [isLoading, setIsLoading] = useState(true);
  const { addAthkarRecited } = useUser();

  // Sync with Firestore — read-only on mount, write only on tap
  useEffect(() => {
    const dhikrDoc = doc(db, "stats", "dhikr");

    const unsubscribe = onSnapshot(
      dhikrDoc,
      (snap) => {
        if (snap.exists()) {
          setGlobalCount(snap.data().count || 0);
        }
        setIsLoading(false);
      },
      (error) => {
        if (error.code !== "permission-denied") {
          console.warn("Global Dhikr Snapshot Error:", error);
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDhikr = async () => {
    // Update local counters immediately (optimistic)
    setSessionCount((prev) => prev + 1);
    const newPersonal = personalCount + 1;
    setPersonalCount(newPersonal);

    // Persist personal count for today
    localStorage.setItem(getTodayKey(), String(newPersonal));

    // Increment personal stats and points
    addAthkarRecited(1);

    // Haptic feedback
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    } else if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }

    // Sync to Firestore — use setDoc with merge so it creates the doc if missing
    try {
      const dhikrDoc = doc(db, "stats", "dhikr");
      await setDoc(
        dhikrDoc,
        { count: increment(1), lastUpdate: new Date() },
        { merge: true }
      );
    } catch (error: any) {
      if (error?.code !== "permission-denied") {
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
          <div
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
                <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                  {isAr ? "إجمالي التسبيح العالمي" : "Global Dhikr Total"}
                </h3>
              </div>

              <div className="space-y-1">
                <div
                  className="text-6xl font-bold tracking-tighter text-primary"
                >
                  {isLoading ? (
                    <span className="text-3xl text-muted-foreground animate-pulse">…</span>
                  ) : (
                    globalCount.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {isAr ? "تسبيحة تمت حتى الآن" : "Praises performed so far"}
                </p>
              </div>

              <div className="pt-4 border-t border-primary/10">
                <div className="flex items-center gap-2 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold">{isAr ? "مباشر ومستمر" : "Live & Increasing"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Stats Card */}
          <div
            className="bento-card !p-8 bg-card border-border/40 space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner">
                <Fingerprint className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                {isAr ? "مساهمتك اليوم" : "Your Contribution"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div
                  className="text-3xl font-bold text-foreground"
                >
                  {sessionCount}
                </div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {isAr ? "هذه الجلسة" : "This Session"}
                </p>
              </div>
              <div className="space-y-1">
                <div
                  className="text-3xl font-bold text-foreground"
                >
                  {personalCount}
                </div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {isAr ? "تسبيحاتك اليوم" : "Today's Total"}
                </p>
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
          </div>
        </div>

        {/* The Dhikr Button */}
        <div className="flex flex-col items-center justify-center py-12 space-y-12">
          <div className="relative group">
            <div
              className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/40 transition-colors animate-pulse"
            />

            <button
              onClick={handleDhikr}
              className="relative w-64 h-64 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-2xl flex flex-col items-center justify-center gap-3 border-[12px] border-white/10 group-active:border-white/20 transition-all px-4 active:scale-95"
            >
              <Fingerprint className="w-14 h-14 text-white group-hover:scale-110 transition-transform shrink-0" />
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-xl font-bold text-white font-naskh leading-tight">
                  {dailyDhikr.ar}
                </span>
                <span className="text-[9px] text-white/50 uppercase tracking-widest">
                  {dailyDhikr.en}
                </span>
                <span className="text-[8px] text-white/40 italic">
                  {isAr ? dailyDhikr.meaning.ar : dailyDhikr.meaning.en}
                </span>
              </div>
            </button>
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
