import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, Clock, Bell, BellOff, Volume2, VolumeX,
  Settings, Loader2, RefreshCw, Edit3, Check, X,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import {
  usePrayerTimes,
  getCairoDate,
  formatTime,
  ADHAN_SOUNDS,
  CALCULATION_METHODS,
  PRAYER_NAMES,
  type PrayerTimesData,
} from "@/hooks/usePrayerTimes";

const NextPrayerCountdown = ({
  prayerName,
  prayerTime,
  prayerIcon,
  timeFormat = "12h",
}: {
  prayerName: keyof PrayerTimesData;
  prayerTime: string;
  prayerIcon: string;
  timeFormat?: "12h" | "24h";
}) => {
  const [remaining, setRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const [h, m] = prayerTime.split(":").map(Number);
      const now = getCairoDate();
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
  }, [prayerTime]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="bg-card border-2 border-gold rounded-2xl p-5 shadow-gold-glow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-naskh text-muted-foreground">الصلاة القادمة</span>
        <span className="text-xs font-naskh text-gold">{PRAYER_NAMES[prayerName]}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-islamic flex items-center justify-center">
          <span className="text-2xl">{prayerIcon}</span>
        </div>
        <div className="flex-1">
          <p className="font-amiri text-lg font-bold text-foreground mb-1">
            {PRAYER_NAMES[prayerName]} — {formatTime(prayerTime, timeFormat)}
          </p>
          <div className="flex items-center gap-1.5 justify-start" dir="ltr">
            {[
              { value: pad(remaining.hours), label: "ساعة" },
              { value: pad(remaining.minutes), label: "دقيقة" },
              { value: pad(remaining.seconds), label: "ثانية" },
            ].map((unit, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-gold font-bold text-lg">:</span>
                )}
                <div className="flex flex-col items-center">
                  <span className="bg-muted border border-border rounded-lg px-2.5 py-1 font-mono text-lg font-bold text-foreground tabular-nums min-w-[2.5rem] text-center transition-all">
                    {unit.value}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-naskh mt-0.5">{unit.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const CairoClock = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = getCairoDate();
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setTime(new Intl.DateTimeFormat("en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center bg-white/5 backdrop-blur-md border border-white/10 px-8 py-4 rounded-3xl shadow-2xl mt-4">
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-1">توقيت القاهرة الآن</span>
      <span className="font-mono text-3xl font-bold text-white tabular-nums">{time}</span>
    </div>
  );
};

const PrayerTimes = () => {
  const { stopPlayer, isPlaying: isQuranPlaying } = useAudioPlayer();
  const {
    settings, updateSettings, times, loading, error,
    locationLoading, detectLocation, nextPrayer, getRemainingTime,
    previewAdhan, stopAdhan, testPrayerNotification, unlockAudio, audioUnlocked
  } = usePrayerTimes({
    onAdhanStart: () => {
      if (isQuranPlaying) stopPlayer();
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<keyof PrayerTimesData | null>(null);
  const [editValue, setEditValue] = useState("");
  const [playingAdhan, setPlayingAdhan] = useState<string | null>(null);

  const handleEnableNotifications = useCallback(async () => {
    unlockAudio(); // Unlock audio on interaction
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
    unlockAudio(); // Unlock audio on interaction
    if (playingAdhan === soundId) {
      stopAdhan();
      setPlayingAdhan(null);
    } else {
      previewAdhan(soundId);
      setPlayingAdhan(soundId);
      setTimeout(() => setPlayingAdhan(null), 15000);
    }
  }, [playingAdhan, previewAdhan, stopAdhan, unlockAudio]);

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
      {/* Header */}
      <header className="relative overflow-hidden bg-emerald-deep min-h-[40vh] flex items-center justify-center">
        {/* Immersive Background Layer */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 pattern-islamic scale-150 opacity-20" 
          />
          
          {/* Atmospheric Gradients & Light Rays */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-deep/40 to-emerald-deep" />
          
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/4 -right-1/4 w-[100%] h-[100%] bg-gold/10 rounded-full blur-[120px]" 
          />
          
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              scale: [1.2, 1, 1.2],
              rotate: [0, -5, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1/4 -left-1/4 w-[80%] h-[80%] bg-emerald-light/10 rounded-full blur-[100px]" 
          />
        </div>

        <div className="relative z-10 container max-w-4xl mx-auto px-6 py-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="h-px w-12 bg-gold/40" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold">
              مواقيت الصلاة والأذان
            </span>
            <div className="h-px w-12 bg-gold/40" />
          </motion.div>

            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-white mb-6 tracking-tight drop-shadow-lg"
            >
              مواقيت الصلاة
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CairoClock />
            </motion.div>

            {settings.cityName && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-xl"
            >
              <MapPin size={16} className="text-gold" />
              <span className="font-naskh text-white text-sm tracking-wide">
                {settings.cityName}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-light animate-pulse" />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 flex flex-col items-center gap-2"
          >
            <div className="w-px h-12 bg-gradient-to-b from-gold/40 to-transparent" />
          </motion.div>
        </div>

        {/* Elegant bottom transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20" />
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Location setup */}
        {!settings.latitude ? (
          <section className="bg-card border border-border rounded-2xl p-6 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full gradient-islamic flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} className="text-primary-foreground" />
            </div>
            <h2 className="font-naskh text-lg font-bold text-foreground mb-2">حدد موقعك</h2>
            <p className="text-sm text-muted-foreground font-naskh mb-4">
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
            {/* Next prayer banner with live countdown */}
            {nextPrayer && times && (
              <NextPrayerCountdown
                prayerName={nextPrayer.name}
                prayerTime={nextPrayer.time}
                prayerIcon={prayerIcons[nextPrayer.name]}
                timeFormat={settings.timeFormat}
              />
            )}

            {/* Prayer times list */}
            <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="font-naskh text-base font-bold text-foreground">مواقيت اليوم</h2>
                <button
                  onClick={() => {
                    if (settings.latitude && settings.longitude) {
                      updateSettings({ method: settings.method }); // re-fetch
                    }
                  }}
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
                      <div
                        key={prayer}
                        className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                          isNext ? "bg-accent/10" : ""
                        }`}
                      >
                        <span className="text-xl w-8 text-center">{prayerIcons[prayer]}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-naskh text-sm font-bold ${
                            isNext ? "text-accent" : "text-foreground"
                          }`}>
                            {PRAYER_NAMES[prayer]}
                          </p>
                          {isOverridden && (
                            <button
                              onClick={() => resetOverride(prayer)}
                              className="text-[10px] text-gold font-naskh hover:underline"
                            >
                              معدّل يدوياً • إعادة ضبط
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="text-sm font-naskh bg-muted border border-border rounded-lg px-2 py-1 text-foreground w-24"
                              autoFocus
                            />
                            <button onClick={saveEdit} className="text-accent"><Check size={16} /></button>
                            <button onClick={() => setEditingPrayer(null)} className="text-muted-foreground"><X size={16} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`font-naskh text-base font-bold ${
                              isNext ? "text-accent" : "text-foreground"
                            }`}>
                              {formatTime(times[prayer], settings.timeFormat)}
                            </span>
                            {prayer !== "Sunrise" && (
                              <button
                                onClick={() => {
                                  testPrayerNotification(prayer);
                                  toast.success(`تم إرسال تنبيه تجريبي لصلاة ${PRAYER_NAMES[prayer]}`);
                                }}
                                className="text-gold hover:text-accent transition-colors p-1"
                                title="تجربة الإشعار"
                              >
                                <Bell size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditPrayer(prayer)}
                              className="text-muted-foreground hover:text-foreground transition-colors p-1"
                              title="تعديل يدوي"
                            >
                              <Edit3 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>

            {/* Notifications toggle */}
            <section className="bg-card border border-border rounded-2xl p-5 shadow-soft">
              {settings.notificationsEnabled && Notification.permission !== "granted" && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
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
              {!audioUnlocked && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                  <Volume2 size={18} className="text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[11px] text-amber-600 font-naskh font-bold">تفعيل الصوت مطلوب</p>
                    <p className="text-[10px] text-amber-600 font-naskh">اضغط على أي زر لتفعيل صوت الأذان في المتصفح</p>
                  </div>
                  <button 
                    onClick={unlockAudio}
                    className="px-3 py-1 bg-amber-500 text-white text-[10px] font-naskh rounded-lg font-bold"
                  >
                    تفعيل الآن
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                  <Bell size={18} className="text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-naskh text-sm font-bold text-foreground">تنبيه الأذان</h2>
                  <p className="text-[11px] text-muted-foreground font-naskh">إشعار مع صوت الأذان عند كل صلاة</p>
                </div>
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
            </section>

            {/* Adhan sound selector */}
            <section className="bg-card border-2 border-emerald-light/20 rounded-[2.5rem] p-8 shadow-islamic relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-light/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl gradient-islamic flex items-center justify-center shadow-emerald-deep/20 shadow-lg">
                  <Volume2 size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground">صوت الأذان</h2>
                  <p className="text-xs text-muted-foreground font-serif italic">اختر المؤذن المفضل للتنبيهات</p>
                </div>
              </div>
 
              <div className="grid gap-3 relative z-10">
                {ADHAN_SOUNDS.map((sound) => (
                  <motion.div
                    key={sound.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      settings.adhanSound === sound.id
                        ? "border-emerald-deep bg-emerald-deep/5 shadow-md"
                        : "border-border/40 hover:border-emerald-light/40 hover:bg-muted/30"
                    }`}
                    onClick={() => updateSettings({ adhanSound: sound.id })}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      settings.adhanSound === sound.id ? "border-emerald-deep bg-emerald-deep" : "border-border"
                    }`}>
                      {settings.adhanSound === sound.id && (
                        <div className="w-2 h-2 rounded-full bg-gold" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <span className={`font-serif text-base transition-colors ${
                        settings.adhanSound === sound.id ? "text-emerald-deep font-bold" : "text-foreground"
                      }`}>
                        {sound.label}
                      </span>
                      {playingAdhan === sound.id && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-1 mt-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-deep animate-pulse" />
                          <span className="text-[10px] text-emerald-deep font-serif font-bold">جاري المعاينة...</span>
                        </motion.div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(sound.id);
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        playingAdhan === sound.id 
                          ? "bg-emerald-deep text-gold shadow-lg" 
                          : "bg-muted text-muted-foreground hover:bg-emerald-light/20 hover:text-emerald-deep"
                      }`}
                      title="معاينة"
                    >
                      {playingAdhan === sound.id ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-5 shadow-soft hover:border-accent/40 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Settings size={18} className="text-muted-foreground" />
              </div>
              <div className="flex-1 text-right">
                <h2 className="font-naskh text-sm font-bold text-foreground">إعدادات متقدمة</h2>
                <p className="text-[11px] text-muted-foreground font-naskh">طريقة الحساب والموقع</p>
              </div>
            </button>

            {showSettings && (
              <section className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4">
                {/* Calculation method */}
                <div>
                  <label className="font-naskh text-sm font-bold text-foreground mb-2 block">طريقة الحساب</label>
                  <select
                    value={settings.method}
                    onChange={(e) => updateSettings({ method: parseInt(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm font-naskh text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CALCULATION_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Time format */}
                <div>
                  <label className="font-naskh text-sm font-bold text-foreground mb-2 block">نظام الوقت</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSettings({ timeFormat: "12h" })}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all font-naskh text-sm ${
                        settings.timeFormat === "12h"
                          ? "border-emerald-deep bg-emerald-deep/5 text-emerald-deep font-bold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      12 ساعة
                    </button>
                    <button
                      onClick={() => updateSettings({ timeFormat: "24h" })}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all font-naskh text-sm ${
                        settings.timeFormat === "24h"
                          ? "border-emerald-deep bg-emerald-deep/5 text-emerald-deep font-bold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      24 ساعة
                    </button>
                  </div>
                </div>

                {/* Location info */}
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

                {/* Manual coordinates */}
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
};

export default PrayerTimes;
