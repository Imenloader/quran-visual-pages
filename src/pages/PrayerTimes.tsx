import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import {
  MapPin, Clock, Bell, BellOff, Volume2, VolumeX,
  Settings, Loader2, RefreshCw, Edit3, Check, X,
  ChevronDown, ChevronUp, ChevronRight, Sparkles, Navigation, CheckCircle2, Circle, Info
} from "lucide-react";
import { format } from "date-fns";
import { syncService } from "@/services/syncService";
import { toast } from "sonner";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useTranslation } from "react-i18next";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import { useNavigate } from "react-router-dom";
import {
  usePrayerTimes,
  getCairoDate,
  getEffectiveNow,
  formatTime,
  ADHAN_SOUNDS,
  CALCULATION_METHODS,
  PRAYER_NAMES,
  type PrayerTimesData,
  type PrayerSettings,
} from "@/hooks/usePrayerTimes";
import QuranHeader from "@/components/QuranHeader";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

import CairoClock from "@/components/CairoClock";

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
        className="w-full bg-muted/50 backdrop-blur-sm border border-border/40 rounded-2xl px-4 py-3 text-sm font-naskh text-foreground flex items-center justify-between hover:bg-muted transition-all group active:scale-98"
      >
        <span className="truncate">{selectedOption?.label || "اختر..."}</span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute z-[100] w-full mt-2 glass-card hover:-translate-y-1/40 rounded-2xl hover:-translate-y-1 overflow-hidden transition-all duration-300 opacity-100 translate-y-0"
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
        </div>
      )}
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
  const [progress, setProgress] = useState(0);
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  useEffect(() => {
    if (settings.latitude && settings.longitude) {
      const calculateQibla = (lat: number, lng: number) => {
        const kaabaLat = 21.4225;
        const kaabaLng = 39.8262;
        const φ1 = lat * (Math.PI / 180);
        const φ2 = kaabaLat * (Math.PI / 180);
        const Δλ = (kaabaLng - lng) * (Math.PI / 180);
        const y = Math.sin(Δλ);
        const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
        return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
      };
      setQiblaDirection(calculateQibla(settings.latitude, settings.longitude));
    }

    const handleOrientation = (e: any) => {
      let newHeading = null;
      if (e.webkitCompassHeading !== undefined) {
        newHeading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        newHeading = 360 - e.alpha;
      }
      setHeading(newHeading);
    };

    if (window.DeviceOrientationEvent) {
      const DeviceOrientationEventWithPermission = DeviceOrientationEvent as any;
      if (typeof DeviceOrientationEventWithPermission.requestPermission === "function") {
        DeviceOrientationEventWithPermission.requestPermission().then((state: string) => {
          if (state === "granted") (window as any).addEventListener("deviceorientation", handleOrientation);
        });
      } else {
        if ('ondeviceorientationabsolute' in window) {
          (window as any).addEventListener("deviceorientationabsolute", handleOrientation);
        } else {
          (window as any).addEventListener("deviceorientation", handleOrientation);
        }
      }
    }

    return () => {
      (window as any).removeEventListener("deviceorientation", handleOrientation);
      if ('ondeviceorientationabsolute' in window) (window as any).removeEventListener("deviceorientationabsolute", handleOrientation);
    };
  }, [settings.latitude, settings.longitude]);

  const relativeQibla = heading !== null ? (qiblaDirection - heading + 360) % 360 : qiblaDirection;


  useEffect(() => {
    const calc = () => {
      const [h, m] = prayerTime.split(":").map(Number);
      const now = getEffectiveNow(settings);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      
      // Calculate total duration between previous prayer and this one to get progress
      // For simplicity, we'll use a fixed 4-hour window if we don't have the previous time
      const totalWindow = 4 * 60 * 60 * 1000; 

      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      
      setRemaining({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });

      const prog = Math.max(0, Math.min(100, 100 - (diff / totalWindow) * 100));
      setProgress(prog);
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
    <section className="relative overflow-hidden glass-card hover:-translate-y-1/40 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-6 hover:-translate-y-1 group min-h-[180px] md:min-h-[220px] flex items-center transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gold/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-60 h-60 md:w-80 md:h-80 bg-gold/15 rounded-full -mr-30 md:-mr-40 -mt-30 md:-mt-40 blur-[80px] md:blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-60 h-60 md:w-80 md:h-80 bg-primary/15 rounded-full -ml-30 md:-ml-40 -mb-30 md:-mb-40 blur-[80px] md:blur-[120px]" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold/30 rounded-full"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.1
            }}
          />
        ))}
      </div>

      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/30 to-transparent rotate-12 blur-md opacity-50" />
      <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-gold/20 to-transparent -rotate-12 blur-md opacity-50" />
      
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 md:gap-6 relative z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div 
            className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] gradient-islamic flex items-center justify-center text-3xl md:text-5xl shadow-2xl shadow-primary/30 border border-primary/10 transition-transform active:scale-95 relative"
          >
            {prayerIcon}
            {/* Small Qibla Compass */}
            <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 glass-card hover:-translate-y-1 shadow-lg rounded-full flex items-center justify-center overflow-hidden">
               <div 
                className="transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${relativeQibla}deg)` }}
               >
                 <Navigation size={14} className="text-primary fill-primary" />
               </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1 md:mb-2 justify-end">
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] font-bold text-accent drop-shadow-sm">الصلاة القادمة</span>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent" />
            </div>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-0.5 md:mb-1 tracking-tight">
              {PRAYER_NAMES[prayerName]}
            </h2>
            <p className="text-sm md:text-base text-foreground/70 font-naskh">
              موعد الأذان: <span className="font-bold underline decoration-gold/30 underline-offset-4">{formatTime(prayerTime, settings.timeFormat)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3" dir="ltr">
          {units.map((unit, i) => (
            <div key={i} className="flex items-center gap-1.5 md:gap-3">
              {i > 0 && (
                <div className="flex flex-col gap-1 md:gap-1.5 opacity-40">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-gold" />
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-gold" />
                </div>
              )}
              <div className="flex flex-col items-center">
                <div 
                  className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-card/40 border border-primary/10 flex items-center justify-center shadow-2xl relative group/unit overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  <span className="font-mono text-2xl md:text-4xl font-bold text-primary tabular-nums drop-shadow-md relative z-10">
                    {unit.value}
                  </span>
                </div>
                <span className={`text-[8px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] md:tracking-[0.2em] mt-2 md:mt-3 ${isAr ? "font-naskh" : ""}`}>
                  {unit.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-muted/20">
        <div 
          className="h-full bg-gold shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}

export default function PrayerTimes() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
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
  const [showSunnah, setShowSunnah] = useState(false);
  const [history, setHistory] = useState<Record<string, string[]>>({});
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const loadHistory = async () => {
      const saved = await syncService.loadData<Record<string, string[]>>("prayer_history", {});
      setHistory(saved);
    };
    loadHistory();
  }, []);

  const togglePrayerStatus = useCallback(async (prayerId: string) => {
    const dayPrayers = history[today] || [];
    const next = dayPrayers.includes(prayerId)
      ? dayPrayers.filter(p => p !== prayerId)
      : [...dayPrayers, prayerId];
    
    const newHistory = { ...history, [today]: next };
    setHistory(newHistory);
    await syncService.saveData("prayer_history", newHistory);
    toast.success(next.includes(prayerId) ? "تم تسجيل الصلاة" : "تم إلغاء تسجيل الصلاة");
  }, [history, today]);


  const handleEnableNotifications = useCallback(async () => {
    unlockAudio();
    
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== 'granted') {
        const request = await LocalNotifications.requestPermissions();
        if (request.display !== 'granted') {
          toast.error("تم رفض إذن التنبيهات");
          return;
        }
      }
    } else {
      const winNotif = (window as unknown as { Notification: typeof Notification }).Notification;
      if (!winNotif) {
        toast.error("متصفحك لا يدعم التنبيهات");
        return;
      }
      if (winNotif.permission === "denied") {
        toast.error("تم رفض إذن التنبيهات. فعّلها من إعدادات المتصفح");
        return;
      }
      if (winNotif.permission !== "granted") {
        const result = await winNotif.requestPermission();
        if (result !== "granted") {
          toast.error("تم رفض إذن التنبيهات");
          return;
        }
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
    Midnight: "🌌",
    LastThird: "✨",
    Duha: "🌅",
  };

  const sunnahPrayers: (keyof PrayerTimesData)[] = ["Duha", "Midnight", "LastThird"];


  return (
    <div className="min-h-screen bg-background pb-24 transition-opacity duration-500 opacity-100">
      <QuranHeader 
        title={t("prayerTimes.title")} 
        variant="compact"
        showBack
      >
        <div className="mt-8">
          <Suspense fallback={<div className="h-32 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
            <CairoClock />
          </Suspense>
        </div>

        {settings.cityName && (
          <div 
            className="flex items-center gap-3 bg-primary/5 border border-primary/10 px-6 py-3 rounded-full shadow-xl mt-6 mx-auto w-fit"
          >
            <MapPin size={16} className="text-gold" />
            <span className="font-naskh text-white text-sm tracking-wide">
              {settings.cityName}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        )}
      </QuranHeader>

      <main className="container max-w-xl mx-auto px-4 py-4 space-y-4">
        {isAdhanPlaying && (
          <div
            className="bg-destructive/90 text-white p-3 rounded-xl shadow-xl flex items-center justify-between border border-white/20"
          >
            <div className="flex items-center gap-3">
              <Volume2 size={18} />
              <div className="text-right">
                <p className="font-naskh font-bold text-xs">الأذان يعمل الآن</p>
              </div>
            </div>
            <button
              onClick={stopAdhan}
              className="bg-white text-destructive px-4 py-1.5 rounded-lg font-naskh text-xs font-bold"
            >
              إيقاف
            </button>
          </div>
        )}

        {!settings.latitude ? (
          <section className="glass-card rounded-[2rem] p-5 hover:-translate-y-1 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full gradient-islamic flex items-center justify-center mx-auto mb-3">
              <MapPin size={22} className="text-primary-foreground" />
            </div>
            <h2 className="font-naskh text-base font-bold text-foreground mb-1">حدد موقعك</h2>
            <p className="text-xs text-primary/70 font-naskh mb-3">
              لعرض مواقيت الصلاة الصحيحة حسب منطقتك
            </p>
            <button
              onClick={detectLocation}
              disabled={locationLoading}
              className="w-full py-2.5 rounded-lg gradient-islamic text-primary-foreground font-naskh text-xs font-bold flex items-center justify-center gap-2"
            >
              {locationLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <MapPin size={16} />
              )}
              {locationLoading ? "جاري التحديد..." : "تحديد الموقع تلقائياً"}
            </button>
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

            <section className="glass-card rounded-[2rem] overflow-hidden hover:-translate-y-1">
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/50 bg-muted/20">
                <button
                  onClick={() => {
                    if (settings.latitude && settings.longitude) {
                      updateSettings({ method: settings.method }); 
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
                <h2 className="font-naskh text-sm font-bold text-foreground">مواقيت اليوم</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-accent" />
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <p className="text-xs text-destructive font-naskh">{error}</p>
                </div>
              ) : times ? (
                <div className="divide-y divide-border/40">
                  {prayerOrder.map((prayer) => {
                    const isNext = nextPrayer?.name === prayer;
                    const isOverridden = !!settings.manualOverrides[prayer];
                    const isEditing = editingPrayer === prayer;

                    return (
                      <div
                        key={prayer}
                        className={`group relative grid grid-cols-[80px_1fr_100px] md:grid-cols-[100px_1fr_120px] items-center gap-2 px-4 py-4 md:py-5 border-b border-border/20 last:border-0 transition-all ${
                          isNext 
                            ? "bg-primary/[0.04]" 
                            : "hover:bg-muted/30"
                        }`}
                      >
                          {/* Icon & Actions - Right side (Col 1) */}
                          <div className="flex items-center gap-3 justify-start overflow-visible">
                            <button 
                              onClick={() => togglePrayerStatus(prayer.toLowerCase())}
                              className={`relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl shadow-lg transition-all duration-500 ${
                                history[today]?.includes(prayer.toLowerCase())
                                  ? "bg-emerald-500 text-white shadow-emerald-500/30"
                                  : isNext 
                                    ? "bg-primary text-white scale-110 shadow-primary/30 rotate-2 ring-4 ring-primary/10" 
                                    : "glass-card hover:-translate-y-1/40 text-muted-foreground group-hover:scale-105"
                              }`}
                            >
                              {history[today]?.includes(prayer.toLowerCase()) ? <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> : prayerIcons[prayer]}
                              {isNext && !history[today]?.includes(prayer.toLowerCase()) && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full border-2 border-white animate-bounce" />
                              )}
                            </button>

                            <div className="hidden md:flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                              {prayer !== "Sunrise" && (
                                <button
                                  onClick={() => handleSpeakPrayer(prayer)}
                                  className="w-7 h-7 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-sm"
                                  title="نطق"
                                >
                                  <Volume2 size={12} />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditPrayer(prayer)}
                                className="w-7 h-7 rounded-lg bg-muted text-muted-foreground hover:bg-foreground hover:text-white transition-all flex items-center justify-center shadow-sm"
                                title="تعديل"
                              >
                                <Edit3 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Name - Middle (Col 2) */}
                          <div className="flex flex-col items-center justify-center relative z-10 text-center">
                            {isEditing ? (
                              <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-primary/20 shadow-sm">
                                <button 
                                  onClick={() => setEditingPrayer(null)} 
                                  className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                                >
                                  <X size={14} />
                                </button>
                                <button 
                                  onClick={saveEdit} 
                                  className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                                >
                                  <Check size={14} />
                                </button>
                                <input
                                  type="time"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="text-xs bg-transparent font-bold px-2 py-1 w-20 outline-none text-center"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <p className={`font-naskh text-lg md:text-2xl font-bold transition-colors ${
                                  history[today]?.includes(prayer.toLowerCase()) ? "text-emerald-500" : "text-foreground"
                             }`}>
                               {PRAYER_NAMES[prayer]}
                             </p>
                             {history[today]?.includes(prayer.toLowerCase()) && (
                               <button 
                                 onClick={() => navigate("/athkar")}
                                 className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 animate-in fade-in zoom-in"
                               >
                                 <Sparkles size={10} />
                                 أذكار ما بعد الصلاة
                               </button>
                             )}
                             {isNext && (
                                  <div 
                                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-600 text-[9px] md:text-[10px] font-bold border border-emerald-600/20"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                    {isAr ? "الصلاة القادمة" : "Next"}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {isOverridden && !isEditing && (
                              <button
                                onClick={() => resetOverride(prayer)}
                                className="mt-2 text-[8px] text-gold font-bold hover:underline bg-gold/5 px-2 py-0.5 rounded-full flex items-center gap-1"
                              >
                                <RefreshCw size={8} />
                                {isAr ? "معدّل" : "Modified"}
                              </button>
                            )}
                          </div>

                          {/* Time - Left side (Col 3) */}
                          <div className="flex items-center justify-end">
                            <div className={`flex flex-col items-end ${isNext ? "text-primary" : "text-muted-foreground"}`}>
                              <span className="font-bold text-lg md:text-3xl tabular-nums tracking-tighter" dir="ltr">
                                {formatTime(times[prayer], settings.timeFormat)}
                              </span>
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
              ) : null}
              
              <button 
                onClick={() => setShowSunnah(!showSunnah)}
                className="w-full py-4 text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 border-t border-border/20"
              >
                <Sparkles size={14} />
                {showSunnah ? (isAr ? "إخفاء سنن اليوم" : "Hide Sunnah Times") : (isAr ? "عرض سنن اليوم (الضحى والتهجد)" : "Show Sunnah Times")}
                <ChevronDown size={14} className={`transition-transform ${showSunnah ? "rotate-180" : ""}`} />
              </button>

              {showSunnah && times && (
                <div className="bg-muted/10 divide-y divide-border/20 border-t border-border/20 animate-in fade-in slide-in-from-top-2">
                   {sunnahPrayers.map((prayer) => (
                     <div key={prayer} className="grid grid-cols-[60px_1fr_80px] items-center gap-2 px-6 py-4">
                        <div className="w-10 h-10 rounded-xl glass-card hover:-translate-y-1/40 flex items-center justify-center text-xl shadow-sm">
                          {prayerIcons[prayer]}
                        </div>
                        <div className="text-right">
                          <p className="font-naskh text-sm font-bold text-foreground/80">{PRAYER_NAMES[prayer]}</p>
                          {prayer === "LastThird" && (
                            <p className="text-[9px] text-muted-foreground font-naskh">وقت قيام الليل</p>
                          )}
                        </div>
                        <div className="text-left font-bold text-lg tabular-nums text-muted-foreground" dir="ltr">
                          {formatTime(times[prayer] || "--:--", settings.timeFormat)}
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </section>

            {/* Spiritual Inspiration Card */}
            <section className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 text-center space-y-4 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
               <Sparkles className="w-6 h-6 text-gold mx-auto animate-pulse" />
               <div className="space-y-2">
                 <p className="text-sm font-naskh leading-relaxed text-foreground/80 italic">
                   {isAr 
                     ? "«الصلاة هي عماد الدين، من أقامها فقد أقام الدين ومن هدمها فقد هدم الدين»"
                     : '"Prayer is the pillar of religion; whoever establishes it has established religion, and whoever leaves it has destroyed religion."'}
                 </p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">— {isAr ? "حديث شريف" : "Hadith Sharif"}</p>
               </div>
               <button 
                 onClick={() => navigate("/athkar")}
                 className="text-[10px] font-bold text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
               >
                 {isAr ? "استكشف مكتبة الأذكار" : "Explore Adhkar Library"} <ChevronRight size={12} />
               </button>
            </section>

            <section className="glass-card rounded-[2rem] p-5 shadow-soft space-y-4 transition-all">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEnableNotifications}
                  className={`w-12 h-7 rounded-full transition-all relative active:scale-95 ${
                    settings.notificationsEnabled ? "bg-accent" : "bg-muted/50 border border-border/40"
                  }`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm transition-all ${
                    settings.notificationsEnabled ? (isAr ? "right-0.5" : "left-0.5") : (isAr ? "left-0.5" : "right-0.5")
                  }`} />
                </button>
                <div className="flex items-center gap-2 mr-auto">
                  {settings.notificationsEnabled && (
                      <button
                        onClick={() => {
                          unlockAudio();
                          testPrayerNotification("Dhuhr");
                          toast.success(`تم إرسال تنبيه تجريبي لصلاة الظهر`);
                        }}
                        className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-[10px] font-naskh rounded-lg font-bold hover:bg-gold/20 flex items-center gap-1.5 active:scale-95"
                        title="تجربة التنبيه"
                      >
                        <Sparkles size={12} />
                        تجربة
                      </button>
                  )}
                </div>
                <div className="flex-1 text-right">
                  <h2 className="font-naskh text-sm font-bold text-foreground">تنبيه الأذان</h2>
                  <p className="text-[11px] text-primary/70 font-naskh">إشعار مع صوت الأذان عند كل صلاة</p>
                </div>
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                  <Bell size={18} className="text-foreground" />
                </div>
              </div>

              {settings.notificationsEnabled && !Capacitor.isNativePlatform() && (
                (window as unknown as { Notification: typeof Notification }).Notification && 
                (window as unknown as { Notification: typeof Notification }).Notification.permission !== "granted" && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 transition-all">
                    <button 
                      onClick={handleEnableNotifications}
                      className="px-3 py-1 bg-destructive text-white text-[10px] font-naskh rounded-lg font-bold active:scale-95"
                    >
                      تفعيل الإذن
                    </button>
                    <div className="flex-1 text-right">
                      <p className="text-[11px] text-destructive font-naskh font-bold">إذن التنبيهات مطلوب</p>
                      <p className="text-[10px] text-destructive font-naskh">التنبيهات مفعلة ولكن المتصفح يمنعها. يرجى تفعيل الإذن.</p>
                    </div>
                    <BellOff size={18} className="text-destructive shrink-0" />
                  </div>
                )
              )}
              
              {!isAudioUnlocked && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col gap-3 transition-all">
                  <div className="flex items-center gap-3 justify-end">
                    <div className="flex-1 text-right">
                      <p className="text-xs text-amber-700 font-bold font-naskh">تفعيل صوت الأذان</p>
                      <p className="text-[10px] text-amber-600 font-naskh leading-tight">
                        تتطلب المتصفحات تفاعلاً من المستخدم لتشغيل الصوت. اضغط على الزر أدناه لضمان عمل الأذان.
                      </p>
                    </div>
                    <Volume2 size={20} className="text-amber-600 shrink-0" />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-9 rounded-xl border-amber-500/30 text-amber-700 hover:bg-amber-500 hover:text-white transition-all text-[10px] font-bold active:scale-98"
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

            <section className="bg-card border-2 border-primary/20 rounded-[2.5rem] p-8 hover:-translate-y-1 relative z-30 transition-all">
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              </div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10 justify-end">
                <div className="text-right">
                  <h2 className="font-serif text-xl font-bold text-foreground">صوت الأذان</h2>
                  <p className="text-xs text-primary/70 font-serif italic">اختر المؤذن المفضل للتنبيهات</p>
                </div>
                <div className="w-14 h-14 rounded-2xl gradient-islamic flex items-center justify-center shadow-primary/20 shadow-lg">
                  <Volume2 size={24} className="text-white" />
                </div>
              </div>
 
              <div className="flex items-center gap-3 relative z-10">
                <button
                  onClick={() => handlePreview(settings.adhanSound)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                    playingAdhan === settings.adhanSound 
                      ? "bg-primary text-gold shadow-lg" 
                      : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                  }`}
                  title="معاينة"
                >
                  {playingAdhan === settings.adhanSound ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="flex-1">
                  <CustomSelect
                    value={settings.adhanSound}
                    onChange={(val) => {
                      const newAdhanSounds = { ...settings.adhanSounds };
                      // Also update all prayers if they were using the global default
                      prayerOrder.forEach(p => {
                        if (!settings.adhanSounds[p] || settings.adhanSounds[p] === settings.adhanSound) {
                          newAdhanSounds[p] = val as string;
                        }
                      });
                      updateSettings({ adhanSound: val as string, adhanSounds: newAdhanSounds });
                    }}
                    options={ADHAN_SOUNDS}
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/40">
                <h3 className="text-xs font-bold text-muted-foreground mb-4 text-right uppercase tracking-wider">تخصيص صوت كل صلاة</h3>
                <div className="space-y-3">
                  {prayerOrder.map(prayer => (
                    <div key={prayer} className="flex items-center gap-3">
                      <button
                        onClick={() => handlePreview(settings.adhanSounds[prayer] || settings.adhanSound)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          playingAdhan === (settings.adhanSounds[prayer] || settings.adhanSound)
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {playingAdhan === (settings.adhanSounds[prayer] || settings.adhanSound) ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                      <div className="flex-1">
                        <CustomSelect
                          value={settings.adhanSounds[prayer] || settings.adhanSound}
                          onChange={(val) => {
                            updateSettings({ 
                              adhanSounds: { ...settings.adhanSounds, [prayer]: val as string } 
                            });
                          }}
                          options={ADHAN_SOUNDS}
                        />
                      </div>
                      <span className="w-16 text-right font-naskh text-xs font-bold text-foreground/70">{PRAYER_NAMES[prayer]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center gap-3 glass-card rounded-[2rem] p-5 shadow-soft hover:border-accent/40 transition-all active:scale-98"
            >
              <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${showSettings ? "rotate-180" : ""}`} />
              <div className="flex-1 text-right">
                <h2 className="font-naskh text-sm font-bold text-foreground">إعدادات متقدمة</h2>
                <p className="text-[11px] text-primary/70 font-naskh">طريقة الحساب والموقع</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Settings size={18} className="text-muted-foreground" />
              </div>
            </button>

            {showSettings && (
              <section className="glass-card rounded-[2rem] p-5 shadow-soft space-y-4 transition-all duration-300 opacity-100 translate-y-0">
                <div className="space-y-4">
                  <div>
                    <CustomSelect
                      label="طريقة الحساب"
                      value={settings.method}
                      onChange={(val) => updateSettings({ method: Number(val) })}
                      options={CALCULATION_METHODS}
                    />
                  </div>

                  <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => updateSettings({ prePrayerNotification: !settings.prePrayerNotification })}
                        className={`w-10 h-6 rounded-full transition-all relative active:scale-95 ${
                          settings.prePrayerNotification ? "bg-accent" : "bg-muted-foreground/20"
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-all ${
                          settings.prePrayerNotification ? (isAr ? "right-0.5" : "left-0.5") : (isAr ? "left-0.5" : "right-0.5")
                        }`} />
                      </button>
                      <div className="text-right">
                        <p className="font-naskh text-sm font-bold text-foreground">تنبيه قبل الصلاة</p>
                        <p className="text-[10px] text-muted-foreground font-naskh">تنبيه إضافي قبل موعد الأذان ببضع دقائق</p>
                      </div>
                    </div>
                    
                    {settings.prePrayerNotification && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border/30 justify-end transition-all opacity-100">
                        <div className="w-32">
                          <CustomSelect
                            value={settings.prePrayerMinutes}
                            onChange={(val) => updateSettings({ prePrayerMinutes: Number(val) })}
                            options={[5, 10, 15, 20, 30].map(m => ({ id: m, label: `${m} دقائق` }))}
                          />
                        </div>
                        <span className="text-[11px] font-naskh text-muted-foreground">قبل الأذان بـ:</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-naskh text-sm font-bold text-foreground mb-3 block text-right">تفعيل التنبيهات لـ:</label>
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
                          className={`py-2 px-1 rounded-xl border-2 transition-all font-naskh text-[11px] active:scale-95 ${
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
                  <label className="font-naskh text-sm font-bold text-foreground mb-2 block text-right">نظام الوقت</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSettings({ timeFormat: "12h" })}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all font-naskh text-sm active:scale-98 ${
                        settings.timeFormat === "12h"
                          ? "border-primary bg-primary/5 text-primary font-bold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      12 ساعة
                    </button>
                    <button
                      onClick={() => updateSettings({ timeFormat: "24h" })}
                      className={`flex-1 py-2 rounded-xl border-2 transition-all font-naskh text-sm active:scale-98 ${
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
                  <label className="font-naskh text-sm font-bold text-foreground mb-2 block text-right">الموقع</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={detectLocation}
                      disabled={locationLoading}
                      className="w-10 h-10 rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 active:scale-90"
                    >
                      {locationLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                    </button>
                    <div className="flex-1 bg-muted/50 border border-border/40 rounded-xl px-4 py-2.5 text-right">
                      <p className="text-sm font-naskh text-foreground">{settings.cityName || "غير محدد"}</p>
                      <p className="text-[10px] text-muted-foreground font-naskh">
                        {settings.latitude?.toFixed(4)}, {settings.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-right">
                    <label className="font-naskh text-[11px] text-muted-foreground mb-1 block">خط العرض</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.latitude || ""}
                      onChange={(e) => updateSettings({ latitude: parseFloat(e.target.value) || null })}
                      className="w-full bg-muted/50 border border-border/40 rounded-lg px-3 py-2 text-sm font-naskh text-foreground text-right"
                      placeholder="مثال: 30.044"
                    />
                  </div>
                  <div className="text-right">
                    <label className="font-naskh text-[11px] text-muted-foreground mb-1 block">خط الطول</label>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.longitude || ""}
                      onChange={(e) => updateSettings({ longitude: parseFloat(e.target.value) || null })}
                      className="w-full bg-muted/50 border border-border/40 rounded-lg px-3 py-2 text-sm font-naskh text-foreground text-right"
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
