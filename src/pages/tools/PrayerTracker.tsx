import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle2, Circle, Calendar, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const PRAYERS = [
  { id: "fajr", name: "الفجر" },
  { id: "dhuhr", name: "الظهر" },
  { id: "asr", name: "العصر" },
  { id: "maghrib", name: "المغرب" },
  { id: "isha", name: "العشاء" },
];

const PrayerTracker = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const today = format(new Date(), "yyyy-MM-dd");
  const [history, setHistory] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("prayer_history");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("prayer_history", JSON.stringify(history));
  }, [history]);

  const togglePrayer = (prayerId: string) => {
    setHistory(prev => {
      const dayPrayers = prev[today] || [];
      const next = dayPrayers.includes(prayerId)
        ? dayPrayers.filter(p => p !== prayerId)
        : [...dayPrayers, prayerId];
      return { ...prev, [today]: next };
    });
  };

  const completedToday = history[today]?.length || 0;
  const streak = 0; // Placeholder for streak calculation

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/hub")}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-naskh">{t("hub.prayerTracker")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-deep/10 border border-emerald-deep/20 rounded-2xl text-center">
              <Trophy className="w-6 h-6 text-emerald-deep mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-naskh">صلاة اليوم</p>
              <p className="text-2xl font-bold text-emerald-deep">{completedToday} / 5</p>
            </div>
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl text-center">
              <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-naskh">التاريخ</p>
              <p className="text-sm font-bold text-foreground font-naskh">{format(new Date(), "d MMMM", { locale: ar })}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-soft">
            <h2 className="font-bold font-naskh text-foreground mb-4">الصلوات الخمس</h2>
            <div className="space-y-3">
              {PRAYERS.map((prayer) => {
                const isCompleted = history[today]?.includes(prayer.id);
                return (
                  <button
                    key={prayer.id}
                    onClick={() => togglePrayer(prayer.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      isCompleted 
                        ? "border-emerald-deep bg-emerald-deep/5 text-emerald-deep" 
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      <span className="font-bold font-naskh">{prayer.name}</span>
                    </div>
                    {isCompleted && <span className="text-[10px] font-bold uppercase tracking-widest">تمت</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 text-center">
            <p className="text-xs text-muted-foreground font-naskh">
              "إن الصلاة كانت على المؤمنين كتاباً موقوتاً"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTracker;
