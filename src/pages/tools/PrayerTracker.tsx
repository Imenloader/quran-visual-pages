import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Calendar, Trophy, Flame, MinusCircle, PlusCircle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, subDays } from "date-fns";
import { ar } from "date-fns/locale";
import BackButton from "@/components/BackButton";
import QuranHeader from "@/components/QuranHeader";
import { syncService } from "@/services/syncService";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

const PRAYERS = [
  { id: "fajr",    nameAr: "الفجر",   nameEn: "Fajr" },
  { id: "dhuhr",   nameAr: "الظهر",   nameEn: "Dhuhr" },
  { id: "asr",     nameAr: "العصر",   nameEn: "Asr" },
  { id: "maghrib", nameAr: "المغرب",  nameEn: "Maghrib" },
  { id: "isha",    nameAr: "العشاء",  nameEn: "Isha" },
];

const PrayerTracker = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const today = format(new Date(), "yyyy-MM-dd");

  const [history, setHistory] = useState<Record<string, string[]>>({});
  const [qada, setQada] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"today" | "qada">("today");

  useEffect(() => {
    const loadInitialData = async () => {
      const savedHistory = await syncService.loadData<Record<string, string[]>>("prayer_history", {});
      setHistory(savedHistory);
      const savedQada = await syncService.loadData<Record<string, number>>("prayer_qada", {});
      setQada(savedQada);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadInitialData();
      }
    });

    loadInitialData();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (Object.keys(history).length > 0) {
      syncService.saveData("prayer_history", history);
    }
  }, [history]);

  useEffect(() => {
    if (Object.keys(qada).length > 0) {
      syncService.saveData("prayer_qada", qada);
    }
  }, [qada]);

  const togglePrayer = (prayerId: string) => {
    setHistory(prev => {
      const dayPrayers = prev[today] || [];
      const next = dayPrayers.includes(prayerId)
        ? dayPrayers.filter(p => p !== prayerId)
        : [...dayPrayers, prayerId];
      return { ...prev, [today]: next };
    });
  };

  const adjustQada = (prayerId: string, delta: number) => {
    setQada(prev => {
      const current = prev[prayerId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [prayerId]: next };
    });
  };

  const completedToday = history[today]?.length || 0;

  // Real streak calculation
  const streak = (() => {
    let count = 0;
    let d = new Date();
    // Don't count today in streak — only full past days
    d = subDays(d, 1);
    while (true) {
      const key = format(d, "yyyy-MM-dd");
      const dayPrayers = history[key] || [];
      if (dayPrayers.length === 5) {
        count++;
        d = subDays(d, 1);
      } else break;
    }
    return count;
  })();

  const totalQada = Object.values(qada).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader
        title={isAr ? "متابعة الصلوات" : "Prayer Tracker"}
        subtitle={isAr ? "تابع صلواتك اليومية والقضاء" : "Track your daily prayers and makeup"}
        variant="compact"
      />

      <div className="max-w-md mx-auto px-4 mt-8 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground font-naskh">{isAr ? "اليوم" : "Today"}</p>
            <p className="text-xl font-bold text-primary">{completedToday}<span className="text-xs font-normal">/5</span></p>
          </div>
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground font-naskh">{isAr ? "الاستمرارية" : "Streak"}</p>
            <p className="text-xl font-bold text-orange-500">{streak}<span className="text-xs font-normal"> {isAr ? "يوم" : "d"}</span></p>
          </div>
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl text-center">
            <Calendar className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground font-naskh">{isAr ? "التاريخ" : "Date"}</p>
            <p className="text-sm font-bold text-foreground font-naskh">
              {format(new Date(), "d MMM", { locale: isAr ? ar : undefined })}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-muted/50 rounded-2xl p-1 border border-border/40">
          {(["today", "qada"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold font-naskh transition-all ${
                activeTab === tab
                  ? "bg-card shadow text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {tab === "today"
                ? (isAr ? "صلوات اليوم" : "Today's Prayers")
                : (isAr ? `القضاء${totalQada > 0 ? ` (${totalQada})` : ""}` : `Makeup${totalQada > 0 ? ` (${totalQada})` : ""}`)}
            </button>
          ))}
        </div>

        {activeTab === "today" ? (
          <div
            key="today"
            className="bg-card border border-border rounded-3xl p-6 space-y-3 shadow-soft"
          >
            <h2 className="font-bold font-naskh text-foreground mb-2">
              {isAr ? "الصلوات الخمس" : "Five Daily Prayers"}
            </h2>
            {PRAYERS.map(prayer => {
              const isCompleted = history[today]?.includes(prayer.id);
              return (
                <button
                  key={prayer.id}
                  onClick={() => togglePrayer(prayer.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    isCompleted
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted active:scale-98"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted
                      ? <CheckCircle2 className="w-6 h-6" />
                      : <Circle className="w-6 h-6" />}
                    <span className="font-bold font-naskh">
                      {isAr ? prayer.nameAr : prayer.nameEn}
                    </span>
                  </div>
                  {isCompleted && (
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {isAr ? "تمت" : "Done"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            key="qada"
            className="space-y-3"
          >
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground font-naskh leading-relaxed">
                {isAr
                  ? "سجّل عدد صلوات القضاء المتبقية عليك وتابع تقدمك في أدائها."
                  : "Track the number of makeup prayers you owe and your progress repaying them."}
              </p>
            </div>
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-soft">
              <h2 className="font-bold font-naskh text-foreground">
                {isAr ? "صلوات القضاء" : "Makeup Prayers"}
              </h2>
              {PRAYERS.map(prayer => {
                const count = qada[prayer.id] || 0;
                return (
                  <div key={prayer.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <span className="font-bold font-naskh text-foreground">
                      {isAr ? prayer.nameAr : prayer.nameEn}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => adjustQada(prayer.id, -1)}
                        disabled={count === 0}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-30"
                      >
                        <MinusCircle className="w-5 h-5" />
                      </button>
                      <span className={`w-10 text-center font-bold text-lg ${count > 0 ? "text-primary" : "text-muted-foreground"}`}>
                        {count}
                      </span>
                      <button
                        onClick={() => adjustQada(prayer.id, 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {totalQada > 0 && (
                <div className="pt-2 flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground font-naskh">{isAr ? "الإجمالي" : "Total"}</span>
                  <span className="text-primary">{totalQada} {isAr ? "صلاة" : "prayers"}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 text-center">
          <p className="text-xs text-muted-foreground font-naskh">
            {isAr
              ? "﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾"
              : '"Indeed, prayer has been decreed upon the believers a decree of specified times." [4:103]'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrayerTracker;
