import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import {
  MapPin, Clock, Bell, BellOff, Volume2, VolumeX,
  Settings, Loader2, RefreshCw, Edit3, Check, X,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useTranslation } from "react-i18next";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import {
  usePrayerTimes,
  getCairoDate,
  getEffectiveNow,
  formatTime,
  type PrayerTimesData,
  type PrayerSettings,
} from "@/hooks/usePrayerTimes";
import {
  ADHAN_SOUNDS,
  CALCULATION_METHODS,
  PRAYER_NAMES,
} from "@/data/prayerConstants";
import QuranHeader from "@/components/QuranHeader";
import { Button } from "@/components/ui/button";

const CairoClock = lazy(() => import("@/components/CairoClock"));

// --- تم تحويل const إلى function لتفادي مشكلة الـ Initialization في الـ APK ---
function CustomSelect({ 
  value, 
  onChange, 
  options, 
  label 
}: { 
  value: string | number; 
  onChange: (val: string | number) => void; 
  options: { id: string | number; label: string }[];
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="font-naskh text-sm font-bold text-foreground mb-2 block">{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-muted/50 backdrop-blur-sm border border-border/40 rounded-2xl px-4 py-3 text-sm font-naskh text-foreground flex items-center justify-between hover:bg-muted transition-all group"
      >
        <span className="truncate">{selectedOption?.label || "اختر..."}</span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] w-full mt-2 bg-card border border-border/40 rounded-2xl shadow-islamic overflow-hidden backdrop-blur-md"
          >
            <div className="max-h-60 overflow-y-auto py-2">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-right px-4 py-2.5 text-sm font-naskh transition-colors hover:bg-primary/10 ${
                    value === opt.id ? "text-primary font-bold bg-primary/5" : "text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NextPrayerCountdown({
  prayerName,
  prayerTime,
  prayerIcon,
  settings,
  timeFormat = "12h",
}: {
  prayerName: keyof PrayerTimesData;
  prayerTime: string;
  prayerIcon: string;
  settings: PrayerSettings;
  timeFormat?: "12h" | "24h";
}) {
  const [remaining, setRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const calc = () => {
      const [h, m] = prayerTime.split(":").map(Number);
      const now = getEffectiveNow(settings);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      setRemaining({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [prayerTime, settings]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { value: pad(remaining.hours), label: isAr ? "ساعات" : "Hours" },
    { value: pad(remaining.minutes), label: isAr ? "دقائق" : "Min" },
    { value: pad(remaining.seconds), label: isAr ? "ثواني" : "Sec" },
  ];

  return (
    <section className="relative overflow-hidden bg-card border border-border/40 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-islamic group min-h-[200px] md:min-h-[240px] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gold/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-60 h-60 md:w-80 md:h-80 bg-gold/15 rounded-full -mr-30 md:-mr-40 -mt-30 md:-mt-40 blur-[80px] md:blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-60 h-60 md:w-80 md:h-80 bg-primary/15 rounded-full -ml-30 md:-ml-40 -mb-30 md:-mb-40 blur-[80px] md:blur-[120px] animate-pulse-slow" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: Math.random() * 200 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.5
            }}
            className="absolute w-1 h-1 bg-gold/30 rounded-full"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/30 to-transparent rotate-12 blur-md opacity-50" />
      <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-gold/20 to-transparent -rotate-12 blur-md opacity-50" />
      
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-8 relative z-10">
        <div className="flex items-center gap-4 md:gap-6">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] gradient-islamic flex items-center justify-center text-3xl md:text-5xl shadow-2xl shadow-primary/30 border border-primary/10"
          >
            {prayerIcon}
          </motion.div>
          <div>
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] font-bold text-accent drop-shadow-sm">الصلاة القادمة</span>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent animate-ping" />
            </div>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-0.5 md:mb-1 tracking-tight">
              {PRAYER_NAMES[prayerName]}
            </h2>
            <p className="text-xs md:text-base text-white/80 font-serif italic opacity-80">
              في تمام الساعة {formatTime(prayerTime, timeFormat)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4" dir="ltr">
          {units.map((unit, i) => (
            <div key={i} className="flex items-center gap-2 md:gap-4">
              {i > 0 && (
                <div className="flex flex-col gap-1.5 md:gap-2 opacity-40">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-gold" />
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-gold" />
                </div>
              )}
              <div className="flex flex-col items-center">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-card/40 backdrop-blur-xl border border-primary/10 flex items-center justify-center shadow-2xl relative group/unit overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  <span className="font-mono text-2xl md:text-4xl font-bold text-primary tabular-nums drop-shadow-md relative z-10">
                    {unit.value}
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent scale-x-0 group-hover/unit:scale-x-100 transition-transform duration-500" />
                </motion.div>
                <span className={`text-[8px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] md:tracking-[0.2em] mt-2 md:mt-3 ${isAr ? "font-naskh" : ""}`}>
                  {unit.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// تم تحويلها أيضاً لـ function
export default function PrayerTimes() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { stopPlayer, isPlaying: isQuranPlaying } = useAudioPlayer();
  const {
    settings, updateSettings, times, loading, error,
    locationLoading, detectLocation, nextPrayer, getRemainingTime,
    previewAdhan, stopAdhan, testPrayerNotification, speakPrayer, isAdhanPlaying
  } = usePrayerTimes({
    onAdhanStart: () => {
      if (isQuranPlaying) stopPlayer();
    }
  });

  const { isAudioUnlocked, unlockAudio } = useAudioUnlock();

  const [showSettings, setShowSettings] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<keyof PrayerTimesData | null>(null);
  const [editValue, setEditValue] = useState("");
  const [playingAdhan, setPlayingAdhan] = useState<string | null>(null);

  const handleEnableNotifications = useCallback(async () => {
    unlockAudio();
    if (!("Notification" in window)) {
      toast.error("متصفحك لا يدعم التنبيهات");
      return;
    }
    if (Notification.permission === "denied") {
      toast.error("تم رفض إذن التنبيهات. فعّلها من إعدادات المتصفح");
      return;
    }
    if (Notification.permission !== "granted") {
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        toast.error("تم رفض إذن التنبيهات");
        return;
      }
    }
    updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
    toast.success(settings.notificationsEnabled ? "تم إيقاف تنبيهات الصلاة" : "تم تفعيل تنبيهات الصلاة");
  }, [settings.notificationsEnabled, updateSettings, unlockAudio]);

  const handleEditPrayer = useCallback((prayer: keyof PrayerTimesData) => {
    setEditingPrayer(prayer);
    setEditValue(times?.[prayer] || "");
  }, [times]);

  const saveEdit = useCallback(() => {
    if (!editingPrayer || !editValue) return;
    updateSettings({
      manualOverrides: { ...settings.manualOverrides, [editingPrayer]: editValue },
    });
    setEditingPrayer(null);
    toast.success(`تم تعديل وقت ${PRAYER_NAMES[editingPrayer]}`);
  }, [editingPrayer, editValue, settings.manualOverrides, updateSettings]);

  const resetOverride = useCallback((prayer: keyof PrayerTimesData) => {
    const overrides = { ...settings.manualOverrides };
    delete overrides[prayer];
    updateSettings({ manualOverrides: overrides });
    toast.success(`تم إعادة وقت ${PRAYER_NAMES[prayer]} للافتراضي`);
  }, [settings.manualOverrides, updateSettings]);

  const handlePreview = useCallback((soundId: string) => {
    unlockAudio();
    if (playingAdhan === soundId) {
      stopAdhan();
      setPlayingAdhan(null);
    } else {
      previewAdhan(soundId);
      setPlayingAdhan(soundId);
      setTimeout(() => setPlayingAdhan(null), 15000);
    }
  }, [playingAdhan, previewAdhan, stopAdhan, unlockAudio]);

  const handleSpeakPrayer = useCallback((prayer: keyof PrayerTimesData) => {
    unlockAudio();
    const voiceFound = speakPrayer(prayer);
    if (!voiceFound) {
      toast.warning("No English voice found on your device. It may not sound correct.");
    } else {
      toast.success(`Playing English notification for ${prayer} prayer`);
    }
  }, [speakPrayer, unlockAudio]);

  const prayerOrder: (keyof PrayerTimesData)[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const prayerIcons: Record<keyof PrayerTimesData, string> = {
    Fajr: "🌅",
    Sunrise: "☀️",
    Dhuhr: "🕐",
    Asr: "🌤️",
    Maghrib: "🌇",
    Isha: "🌙",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={t("prayerTimes.title")} 
        variant="compact"
        showBack
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Suspense fallback={<div className="h-32 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
            <CairoClock />
          </Suspense>
        </motion.div>

        {settings.cityName && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 bg-primary/5 backdrop-blur-md border border-primary/10 px-6 py-3 rounded-full shadow-xl mt-6 mx-auto w-fit"
          >
            <MapPin size={16} className="text-gold" />
            <span className="font-naskh text-white text-sm tracking-wide">
              {settings.cityName}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </motion.div>
        )}
      </QuranHeader>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-5">
        <AnimatePresence>
          {isAdhanPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="bg-destructive/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Volume2 className="animate-pulse" size={20} />
                </div>
                <div>
                  <p className="font-naskh font-bold text-sm">الأذان يعمل الآن</p>
                  <p className="text-[10px] opacity-80">يمكنك إيقافه من هنا أو بالضغط على الإشعار</p>
                </div>
              </div>
              <button
                onClick={stopAdhan}
                className="bg-white text-destructive px-6 py-2 rounded-xl font-naskh text-sm font-bold hover:bg-white/90 transition-all shadow-lg"
              >
                إيقاف
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!settings.latitude ? (
          <section className="bg-card border border-border rounded-2xl p-6 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full gradient-islamic flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} className="text-primary-foreground" />
            </div>
            <h2 className="font-naskh text-lg font-bold text-foreground mb-2">حدد موقعك</h2>
            <p className="text-sm text-primary/70 font-naskh mb-4">
              لعرض مواقيت الصلاة الصحيحة حسب منطقتك
            </p>
            <button
              onClick={detectLocation}
              disabled={locationLoading}
              className="w-full py-3 rounded-xl gradient-islamic text-primary-foreground font-naskh text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {locationLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <MapPin size={18} />
              )}
              {locationLoading ? "جاري تحديد الموقع..." : "تحديد الموقع تلقائياً"}
            </button>
            {error && (
              <p className="text-xs text-destructive font-naskh mt-3">{error}</p>
            )}
          </section>
        ) : (
          <>
            {nextPrayer && times && (
              <NextPrayerCountdown
                prayerName={nextPrayer.name}
                prayerTime={nextPrayer.time}
                prayerIcon={prayerIcons[nextPrayer.name]}
                settings={settings}
                timeFormat={settings.timeFormat}
              />
            )}

            <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="font-naskh text-base font-bold text-foreground">مواقيت اليوم</h2>
                <button
                  onClick={() => {
                    if (settings.latitude && settings.longitude) {
                      updateSettings({ method: settings.method }); 
                    }
                  }}
                  aria-label={isAr ? "تحديث المواقيت" : "Refresh prayer times"}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="تحديث"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-accent" />
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <p className="text-sm text-destructive font-naskh">{error}</p>
                </div>
              ) : times ? (
                <div className="divide-y divide-border">
                  {prayerOrder.map((prayer) => {
                    const isNext = nextPrayer?.name === prayer;
                    const isOverridden = !!settings.manualOverrides[prayer];
                    const isEditing = editingPrayer === prayer;

                    return (
                      <motion.div
                        key={prayer}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: prayerOrder.indexOf(prayer) * 0.05 }}
                        className={`group relative flex items-center gap-4 md:gap-6 px-6 md:px-8 py-5 md:py-7 transition-all duration-500 border-b border-border/40 last:border-0 ${
                          isNext 
                            ? "bg-primary/[0.03] shadow-[inset_0_0_40px_rgba(var(--primary),0.05)]" 
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <div className="absolute left-10 md:left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />
                        
                        <div className={`relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-xl transition-all duration-700 ${
                          isNext 
                            ? "bg-primary text-white scale-110 shadow-primary/40 rotate-3 ring-4 ring-primary/10" 
                            : "bg-card border border-border/40 text-muted-foreground group-hover:bg-muted group-hover:scale-105 group-hover:-rotate-2"
                        }`}>
                          {prayerIcons[prayer]}
                          {isNext && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-gold rounded-full border-2 border-white animate-bounce" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-1.5">
                            <p className={`font-serif text-xl md:text-2xl font-bold transition-colors tracking-tight ${
                              isNext ? "text-primary" : "text-foreground"
                            }`}>
                              {PRAYER_NAMES[prayer]}
                            </p>
                            {isNext && (
                              <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-primary text-white text-[8px] md:text-[10px] font-bold shadow-lg shadow-primary/20"
                              >
                                <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-white animate-pulse" />
                                {isAr ? "الصلاة القادمة" : "Next"}
                              </motion.div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2 text-primary/70 font-serif italic text-xs md:text-sm opacity-70">
                            <Clock size={12} className="text-gold/60 md:w-3.5 md:h-3.5" />
                            <span>{formatTime(times[prayer], settings.timeFormat)}</span>
                          </div>
                          {isOverridden && (
                            <button
                              onClick={() => resetOverride(prayer)}
                              className="mt-1.5 md:mt-2 flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] text-gold font-serif font-bold hover:underline bg-gold/5 px-2 py-0.5 rounded-full w-fit"
                            >
                              <RefreshCw size={8} className="md:w-2.5 md:h-2.5" />
                              {isAr ? "معدّل يدوياً • إعادة ضبط" : "Modified • Reset"}
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 md:gap-3 relative z-10">
                            <input
                              type="time"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="text-xs md:text-sm font-serif bg-card border-2 border-primary/20 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-foreground w-24 md:w-32 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                              autoFocus
                            />
                            <button 
                              onClick={saveEdit} 
                              aria-label={isAr ? "حفظ" : "Save"}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-transform"
                            >
                              <Check size={16} className="md:w-5 md:h-5" />
                            </button>
                            <button 
                              onClick={() => setEditingPrayer(null)} 
                              aria-label={isAr ? "إلغاء" : "Cancel"}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                            >
                              <X size={16} className="md:w-5 md:h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 md:gap-6 relative z-10">
                            <div className="text-right">
                              <span className={`font-mono text-2xl md:text-3xl font-bold tabular-nums transition-colors tracking-tighter ${
                                isNext ? "text-primary drop-shadow-sm" : "text-foreground/80"
                              }`}>
                                {formatTime(times[prayer], settings.timeFormat)}
                              </span>
                            </div>
                            
                            <div className="flex flex-col gap-1 md:gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                              {prayer !== "Sunrise" && (
                                <>
                                  <button
                                    onClick={() => {
                                      testPrayerNotification(prayer);
                                      toast.success(`تم إرسال تنبيه تجريبي لصلاة ${PRAYER_NAMES[prayer]}`);
                                    }}
                                    aria-label={isAr ? `تجربة تنبيه ${PRAYER_NAMES[prayer]}` : `Test notification for ${prayer}`}
                                    className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gold/10 text-gold hover:bg-gold hover:text-white transition-all flex items-center justify-center shadow-sm"
                                    title="تجربة الإشعار"
                                  >
                                    <Bell size={14} className="md:w-4 md:h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleSpeakPrayer(prayer)}
                                    aria-label={isAr ? `نطق وقت ${PRAYER_NAMES[prayer]}` : `Speak time for ${prayer}`}
                                    className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-sm"
                                    title="نطق اسم الصلاة"
                                  >
                                    <Volume2 size={14} className="md:w-4 md:h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleEditPrayer(prayer)}
                                aria-label={isAr ? `تعديل وقت ${PRAYER_NAMES[prayer]}` : `Edit time for ${prayer}`}
                                className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-muted text-muted-foreground hover:bg-foreground hover:text-white transition-all flex items-center justify-center shadow-sm"
                                title="تعديل يدوي"
                              >
                                <Edit3 size={14} className="md:w-4 md:h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : null}
            </section>

            <section className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4">
              {settings.notificationsEnabled && Notification.permission !== "granted" && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                  <BellOff size={18} className="text-destructive shrink-0" />
                  <div className="flex-1">
                    <p className="text-[11px] text-destructive font-naskh font-bold">إذن التنبيهات مطلوب</p>
                    <p className="text-[10px] text-destructive font-naskh">التنبيهات مفعلة ولكن المتصفح يمنعها. يرجى تفعيل الإذن.</p>
                  </div>
                  <button 
                    onClick={handleEnableNotifications}
                    className="px-3 py-1 bg-destructive text-white text-[10px] font-naskh rounded-lg font-bold"
                  >
                    تفعيل الإذن
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                  <Bell size={18} className="text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-naskh text-sm font-bold text-foreground">تنبيه الأذان</h2>
                  <p className="text-[11px] text-primary/70 font-naskh">إشعار مع صوت الأذان عند كل صلاة</p>
                </div>
                <div className="flex items-center gap-2">
                  {settings.notificationsEnabled && (
                    <button
                      onClick={() => {
                        unlockAudio();
                        testPrayerNotification("Dhuhr");
                        toast.success(`تم إرسال تنبيه تجريبي لصلاة الظهر`);
                      }}
                      className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-[10px] font-naskh rounded-lg font-bold hover:bg-gold/20 transition-all"
                      title="تجربة التنبيه"
                    >
                      تجربة
                    </button>
                  )}
                  <button
                    onClick={handleEnableNotifications}
                    className={`w-12 h-7 rounded-full transition-all relative ${
                      settings.notificationsEnabled ? "bg-accent" : "bg-muted border border-border"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm transition-all ${
                      settings.notificationsEnabled ? "left-0.5" : "left-[calc(100%-1.625rem)]"
                    }`} />
                  </button>
                </div>
              </div>

              {!isAudioUnlocked && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Volume2 size={20} className="text-amber-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-amber-700 font-bold font-naskh">تفعيل صوت الأذان</p>
                      <p className="text-[10px] text-amber-600 font-naskh leading-tight">
                        تتطلب المتصفحات تفاعلاً من المستخدم لتشغيل الصوت. اضغط على الزر أدناه لضمان عمل الأذان.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-9 rounded-xl border-amber-500/30 text-amber-700 hover:bg-amber-500 hover:text-white transition-all text-[10px] font-bold"
                    onClick={() => {
                      unlockAudio();
                      toast.success("تم تفعيل الصوت بنجاح");
                    }}
                  >
                    تفعيل الصوت الآن
                  </Button>
                </div>
              )}
            </section>

            <section className="bg-card border-2 border-primary/20 rounded-[2.5rem] p-8 shadow-islamic relative z-30">
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              </div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl gradient-islamic flex items-center justify-center shadow-primary/20 shadow-lg">
                  <Volume2 size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground">صوت الأذان</h2>
                  <p className="text-xs text-primary/70 font-serif italic">اختر المؤذن المفضل للتنبيهات</p>
                </div>
              </div>
 
              <div className="flex items-center gap-3 relative z-10">
                <div className="flex-1">
                  <CustomSelect
                    value={settings.adhanSound}
                    onChange={(val) => updateSettings({ adhanSound: val as string })}
                    options={ADHAN_SOUNDS}
                  />
                </div>
                <button
                  onClick={() => handlePreview(settings.adhanSound)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    playingAdhan === settings.adhanSound 
                      ? "bg-primary text-gold shadow-lg" 
                      : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                  }`}
                  title="معاينة"
                >
                  {playingAdhan === settings.adhanSound ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
            </section>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-5 shadow-soft hover:border-accent/40 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Settings size={18} className="text-muted-foreground" />
              </div>
              <div className="flex-1 text-right">
                <h2 className="font-naskh text-sm font-bold text-foreground">إعدادات متقدمة</h2>
                <p className="text-[11px] text-primary/70 font-naskh">طريقة الحساب والموقع</p>
              </div>
            </button>

            {showSettings && (
              <section className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4">
                <div className="space-y-4">
                  <div>
                    <CustomSelect
                      label="طريقة الحساب"
                      value={settings.method}
                      onChange={(val) => updateSettings({ method: val })}
                      options={CALCULATION_METHODS}
                    />
                  </div>

                  <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-naskh text-sm font-bold text-foreground">تنبيه قبل الصلاة</p>
                        <p className="text-[10px] text-muted-foreground font-naskh">تنبيه إضافي قبل موعد الأذان ببضع دقائق</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ prePrayerNotification: !settings.prePrayerNotification })}
                        className={`w-10 h-6 rounded-full transition-all relative ${
                          settings.prePrayerNotification ? "bg-accent" : "bg-muted-foreground/20"
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-all ${
                          settings.prePrayerNotification ? "left-0.5" : "left-[calc(100%-1.375rem)]"
                        }`} />
                      </button>
                    </div>
                    
                    {settings.prePrayerNotification && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                        <span className="text-[11px] font-naskh text-muted-foreground">قبل الأذان بـ:</span>
                        <div className="w-32">
                          <CustomSelect
                            value={settings.prePrayerMinutes}
                            onChange={(val) => updateSettings({ prePrayerMinutes: val })}
                            options={[5, 10, 15, 20, 30].map(m => ({ id: m, label: `${m} دقائق` }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-naskh text-sm font-bold text-foreground mb-3 block">تفعيل التنبيهات لـ:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(PRAYER_NAMES) as (keyof PrayerTimesData)[]).map((prayer) => (
                        <button
                          key={prayer}
                          onClick={() => {
                            const current = settings.enabledPrayers;
                            const next = current.includes(prayer)
                              ? current.filter(p => p !== prayer)
                              : [...current, prayer];
                            updateSettings({ enabledPrayers: next });
                          }}
                          className={`py-2 px-1 rounded-xl border-2 transition-all font-naskh text-[11px] ${
                            settings.enabledPrayers.includes(prayer)
                              ? "border-primary bg-primary/5 text-primary font-bold"
                              : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {PRAYER_NAMES[prayer]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-naskh text-sm font-bold text-foreground mb-2 block">نظام الوقت</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSettings({ timeFormat: "12h" })}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all font-naskh text-sm ${
                        settings.timeFormat === "12h"
                          ? "border-primary bg-primary/5 text-primary font-bold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      12 ساعة
                    </button>
                    <button
                      onClick={() => updateSettings({ timeFormat: "24h" })}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all font-naskh text-sm ${
                        settings.timeFormat === "24h"
                          ? "border-primary bg-primary/5 text-primary font-bold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      24 ساعة
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-naskh text-sm font-bold text-foreground mb-2 block">الموقع</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5">
                      <p className="text-sm font-naskh text-foreground">{settings.cityName || "غير محدد"}</p>
                      <p className="text-[10px] text-muted-foreground font-naskh">
                        {settings.latitude?.toFixed(4)}, {settings.longitude?.toFixed(4)}
                      </p>
                    </div>
                    <button
                      onClick={detectLocation}
                      disabled={locationLoading}
                      className="w-10 h-10 rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      {locationLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-naskh text-[11px] text-muted-foreground mb-1 block">خط العرض</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.latitude || ""}
                      onChange={(e) => updateSettings({ latitude: parseFloat(e.target.value) || null })}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-naskh text-foreground"
                      placeholder="مثال: 30.044"
                    />
                  </div>
                  <div>
                    <label className="font-naskh text-[11px] text-muted-foreground mb-1 block">خط الطول</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.longitude || ""}
                      onChange={(e) => updateSettings({ longitude: parseFloat(e.target.value) || null })}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-naskh text-foreground"
                      placeholder="مثال: 31.235"
                    />
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}