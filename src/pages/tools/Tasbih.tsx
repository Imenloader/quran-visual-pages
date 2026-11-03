import { useState, useCallback, useEffect, useMemo } from "react";
import { RotateCcw, Settings2, Plus, Check, Flame, TrendingUp, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { storage } from "@/lib/storage";
import { useUser } from "@/contexts/UserContext";
import { toArabicNumber } from "@/data/quranData";

// Preset dhikr the user can count — each tap counts toward that dhikr.
const DHIKR_PRESETS = [
  { id: "subhanallah", ar: "سُبْحَانَ اللَّهِ", en: "SubhanAllah", target: 33 },
  { id: "alhamdulillah", ar: "الْحَمْدُ لِلَّهِ", en: "Alhamdulillah", target: 33 },
  { id: "allahuakbar", ar: "اللَّهُ أَكْبَرُ", en: "Allahu Akbar", target: 34 },
  { id: "lailaha", ar: "لَا إِلَٰهَ إِلَّا اللَّهُ", en: "La ilaha illa Allah", target: 100 },
  { id: "astaghfirullah", ar: "أَسْتَغْفِرُ اللَّهَ", en: "Astaghfirullah", target: 100 },
  { id: "salawat", ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّد", en: "Salawat", target: 100 },
];

interface SessionEntry { date: string; dhikrId: string; count: number }

const Tasbih = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");
  const navigate = useNavigate();
  const { addAthkarRecited } = useUser();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [total, setTotal] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeDhikr, setActiveDhikr] = useState(DHIKR_PRESETS[0].id);
  const [rounds, setRounds] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [last7Days, setLast7Days] = useState<SessionEntry[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const savedCount = await storage.get("tasbih_count");
      const savedTotal = await storage.get("tasbih_total");
      const savedTarget = await storage.get("tasbih_target");
      const savedDhikr = await storage.get("tasbih_dhikr");
      const savedRounds = await storage.get("tasbih_rounds");
      const savedHistory = await storage.get("tasbih_history");
      if (savedCount) setCount(parseInt(savedCount));
      if (savedTotal) setTotal(parseInt(savedTotal));
      if (savedTarget) setTarget(parseInt(savedTarget));
      if (savedDhikr) setActiveDhikr(savedDhikr);
      if (savedRounds) setRounds(parseInt(savedRounds));
      if (savedHistory) {
        try { setLast7Days(JSON.parse(savedHistory)); } catch { /* corrupt history ignored */ }
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.set("tasbih_count", count.toString());
      storage.set("tasbih_total", total.toString());
      storage.set("tasbih_target", target.toString());
      storage.set("tasbih_dhikr", activeDhikr);
      storage.set("tasbih_rounds", rounds.toString());
      storage.set("tasbih_history", JSON.stringify(last7Days.slice(-60)));
    }
  }, [count, total, target, isLoaded, activeDhikr, rounds, last7Days]);

  const triggerHaptic = useCallback((pattern: number | number[] = 20) => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  }, []);

  const activePreset = useMemo(() => DHIKR_PRESETS.find(d => d.id === activeDhikr) || DHIKR_PRESETS[0], [activeDhikr]);

  // 7-day mini history for the sparkline
  const weeklyData = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const dayCount = last7Days.filter(e => e.date === key).reduce((sum, e) => sum + e.count, 0);
      days.push({ label: isAr ? d.toLocaleDateString("ar-EG", { weekday: "narrow" }) : d.toLocaleDateString("en", { weekday: "narrow" }), count: dayCount });
    }
    return days;
  }, [last7Days, isAr]);

  const weekMax = Math.max(1, ...weeklyData.map(d => d.count));

  const celebrate = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1600);
  };

  const handleIncrement = () => {
    const next = count + 1;
    const today = new Date().toISOString().split("T")[0];
    setLast7Days(prev => {
      const existing = prev.find(e => e.date === today && e.dhikrId === activeDhikr);
      if (existing) {
        return prev.map(e => e === existing ? { ...e, count: e.count + 1 } : e);
      }
      return [...prev, { date: today, dhikrId: activeDhikr, count: 1 }];
    });
    if (next >= target) {
      triggerHaptic([50, 30, 50]);
      setCount(0);
      setRounds(r => r + 1);
      celebrate();
    } else {
      setCount(next);
      triggerHaptic(15);
    }
    setTotal(t => t + 1);
    addAthkarRecited(1);
  };

  const handleReset = () => {
    setCount(0);
    triggerHaptic(50);
  };

  const handleResetTotal = async () => {
    setTotal(0);
    setCount(0);
    setRounds(0);
    setLast7Days([]);
    await storage.set("tasbih_total", "0");
    await storage.set("tasbih_count", "0");
    await storage.set("tasbih_rounds", "0");
    await storage.set("tasbih_history", "[]");
    setShowSettings(false);
    triggerHaptic([100, 50, 100]);
  };

  const shareToday = async () => {
    const text = isAr
      ? `${activePreset.ar} — ${toArabicNumber(total.toString())} مرة اليوم 🕌`
      : `${activePreset.en} — ${total} counts today 🕌`;
    if (navigator.share) {
      navigator.share({ title: isAr ? "تسبيحي" : "My Tasbih", text }).catch(() => null);
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  const progress = Math.min(1, count / target);
  const R = 130;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center overflow-y-auto overflow-x-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-background to-background" />
        <div className="absolute top-0 left-0 w-full h-full pattern-islamic opacity-[0.02] scale-150" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] opacity-10" />
      </div>

      {/* completion burst */}
      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 rounded-full bg-gold/30 blur-3xl animate-ping" />
        </div>
      )}

      <header className="relative z-10 w-full flex items-center justify-between max-w-md px-6 py-8">
        <BackButton variant="outline" />
        <h1 className="text-2xl font-bold font-naskh text-foreground tracking-tight">{t("hub.tasbih")}</h1>
        <div className="flex gap-2">
          <button
            onClick={shareToday}
            aria-label={isAr ? "مشاركة" : "Share"}
            className="w-12 h-12 rounded-2xl bg-card/50 backdrop-blur-md border border-border/40 flex items-center justify-center text-foreground shadow-sm hover:bg-card transition-all active:scale-95"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            aria-label={isAr ? "الإعدادات" : "Settings"}
            className="w-12 h-12 rounded-2xl bg-card/50 backdrop-blur-md border border-border/40 flex items-center justify-center text-foreground shadow-sm hover:bg-card transition-all active:scale-95"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Dhikr selector chips */}
      <div className="relative z-10 w-full max-w-md px-4 mb-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 justify-start">
          {DHIKR_PRESETS.map(d => (
            <button
              key={d.id}
              onClick={() => { setActiveDhikr(d.id); setTarget(d.target); setCount(0); }}
              className={`shrink-0 px-4 py-2 rounded-2xl font-naskh text-sm font-bold border transition-all active:scale-95 ${
                activeDhikr === d.id
                  ? "bg-gold border-gold text-white shadow-lg shadow-gold/20"
                  : "bg-card/50 border-border/40 text-foreground hover:bg-card"
              }`}
            >
              {isAr ? d.ar : d.en}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-start w-full max-w-md px-4 sm:px-6 gap-2.5 sm:gap-4 py-3 pb-36 overflow-y-auto">
        {/* Progress Ring */}
        <div className="relative w-[min(52vw,32vh)] max-w-[210px] aspect-square flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 288 288">
            <circle cx="144" cy="144" r={R} className="stroke-muted/20 fill-none" strokeWidth="12" />
            <circle
              cx="144" cy="144" r={R}
              className="stroke-gold fill-none transition-all duration-300"
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC - CIRC * progress}
            />
          </svg>

          <div className="text-center space-y-1">
            <span key={count} className="text-5xl sm:text-7xl font-bold font-mono text-foreground block animate-in zoom-in-50 duration-200">
              {isAr ? toArabicNumber(count.toString()) : count}
            </span>
            <span className="text-lg sm:text-xl font-medium text-muted-foreground font-naskh opacity-60">
              / {isAr ? toArabicNumber(target.toString()) : target}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
          <div className="p-3 sm:p-5 bg-card/50 backdrop-blur-md rounded-2xl border border-border/40 text-center shadow-sm">
            <p className="text-[10px] text-muted-foreground font-naskh mb-1 opacity-70">{t("tasbih.total")}</p>
            <p className="text-lg sm:text-2xl font-bold font-mono text-gold">{isAr ? toArabicNumber(total.toString()) : total}</p>
          </div>
          <div className="p-3 sm:p-5 bg-card/50 backdrop-blur-md rounded-2xl border border-border/40 text-center shadow-sm">
            <p className="text-[10px] text-muted-foreground font-naskh mb-1 opacity-70 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              {isAr ? "دورات" : "Rounds"}
            </p>
            <p className="text-lg sm:text-2xl font-bold font-mono text-orange-400">{isAr ? toArabicNumber(rounds.toString()) : rounds}</p>
          </div>
          <button
            onClick={handleReset}
            aria-label={t("tasbih.reset")}
            className="p-3 sm:p-5 bg-card/50 backdrop-blur-md rounded-2xl border border-border/40 text-center shadow-sm hover:bg-card transition-all group active:scale-95"
          >
            <p className="text-[10px] text-muted-foreground font-naskh mb-1 opacity-70">{t("tasbih.reset")}</p>
            <RotateCcw className="w-5 h-5 text-foreground mx-auto group-active:rotate-[-180deg] transition-transform duration-500" />
          </button>
        </div>

        {/* Weekly sparkline */}
        <div className="w-full p-4 bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 hidden min-[700px]:block">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {isAr ? "آخر ٧ أيام" : "Last 7 days"}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {isAr ? toArabicNumber(weeklyData.reduce((s, d) => s + d.count, 0).toString()) : weeklyData.reduce((s, d) => s + d.count, 0)}
            </span>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-12">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${i === weeklyData.length - 1 ? "bg-gold" : "bg-primary/30"}`}
                  style={{ height: `${Math.max(6, (d.count / weekMax) * 40)}px` }}
                />
                <span className="text-[9px] text-muted-foreground font-bold">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Button */}
        <button
          onClick={handleIncrement}
          aria-label={isAr ? "عد تسبيحة" : "Count dhikr"}
          className="w-[min(62vw,34vh)] max-w-[210px] aspect-square rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border-[8px] sm:border-[12px] border-card shadow-islamic flex items-center justify-center relative group active:scale-95 transition-all duration-200"
        >
          <div className="absolute inset-2 sm:inset-4 rounded-full border border-gold/20" />
          <div className="absolute inset-0 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-active:scale-110 transition-transform">
              <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-gold" />
            </div>
            <span className="text-sm sm:text-lg font-bold font-naskh text-foreground tracking-wide">{isAr ? activePreset.ar : activePreset.en}</span>
          </div>
        </button>
      </div>

      {/* Settings Dialog */}
      {showSettings && (
        <>
          <div onClick={() => setShowSettings(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-[3rem] p-8 z-50 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8" />
            <h2 className="text-2xl font-bold font-naskh mb-8 text-center">{isAr ? "الإعدادات" : "Settings"}</h2>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-medium font-naskh px-2">{isAr ? "عدد مخصص" : "Custom target"}</label>
                <div className="grid grid-cols-3 gap-3">
                  {[33, 99, 100, 1000, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      onClick={() => { setTarget(val); setCount(0); }}
                      className={`py-4 rounded-2xl border transition-all font-mono font-bold ${
                        target === val
                          ? "bg-gold border-gold text-white shadow-lg shadow-gold/20"
                          : "bg-muted/50 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {isAr ? toArabicNumber(val.toString()) : val}
                      {target === val && <Check className="inline w-3 h-3 mr-1" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleResetTotal}
                className="w-full py-5 rounded-[1.5rem] bg-destructive/10 text-destructive font-bold font-naskh hover:bg-destructive/20 transition-all flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-5 h-5" />
                {isAr ? "تصفير كل العدادات والسجل" : "Reset all counters & history"}
              </button>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-5 rounded-[1.5rem] bg-primary text-primary-foreground font-bold font-naskh shadow-lg shadow-primary/20"
              >
                {isAr ? "حفظ الإعدادات" : "Save settings"}
              </button>
            </div>
          </div>
        </>
      )}

      <footer className="relative z-10 w-full max-w-md p-6 pb-12">
        <p className="text-center text-xs text-muted-foreground font-naskh opacity-60">
          {isAr ? "اهتزاز عند كل تسبيحة، وإشعار احتفالي عند إكمال العدد" : "Haptic on each count, celebration on completing the target"}
        </p>
      </footer>
    </div>
  );
};

export default Tasbih;
