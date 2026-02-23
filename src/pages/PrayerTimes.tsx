import { useState, useEffect, useRef } from "react";
import {
  MapPin, Clock, Bell, BellOff, Volume2, VolumeX,
  Settings, Loader2, RefreshCw, Edit3, Check, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePrayerTimes,
  ADHAN_SOUNDS,
  CALCULATION_METHODS,
  PRAYER_NAMES,
  type PrayerTimesData,
} from "@/hooks/usePrayerTimes";

const NextPrayerCountdown = ({
  prayerName,
  prayerTime,
  prayerIcon,
}: {
  prayerName: keyof PrayerTimesData;
  prayerTime: string;
  prayerIcon: string;
}) => {
  const [remaining, setRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const [h, m] = prayerTime.split(":").map(Number);
      const now = new Date();
      const target = new Date();
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
    <section className="bg-card border-2 border-gold rounded-2xl p-5 shadow-gold-glow animate-slide-up">
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
            {PRAYER_NAMES[prayerName]} — {prayerTime}
          </p>
          <div className="flex items-center gap-1.5 justify-start" dir="ltr">
            {[
              { value: pad(remaining.hours), label: "ساعة" },
              { value: pad(remaining.minutes), label: "دقيقة" },
              { value: pad(remaining.seconds), label: "ثانية" },
            ].map((unit, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-gold font-bold text-lg animate-pulse">:</span>
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

const PrayerTimes = () => {
  const {
    settings, updateSettings, times, loading, error,
    locationLoading, detectLocation, nextPrayer, getRemainingTime,
    previewAdhan, stopAdhan, testPrayerNotification,
  } = usePrayerTimes();

  const [showSettings, setShowSettings] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<keyof PrayerTimesData | null>(null);
  const [editValue, setEditValue] = useState("");
  const [playingAdhan, setPlayingAdhan] = useState<string | null>(null);

  const handleEnableNotifications = async () => {
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
  };

  const handleEditPrayer = (prayer: keyof PrayerTimesData) => {
    setEditingPrayer(prayer);
    setEditValue(times?.[prayer] || "");
  };

  const saveEdit = () => {
    if (!editingPrayer || !editValue) return;
    updateSettings({
      manualOverrides: { ...settings.manualOverrides, [editingPrayer]: editValue },
    });
    setEditingPrayer(null);
    toast.success(`تم تعديل وقت ${PRAYER_NAMES[editingPrayer]}`);
  };

  const resetOverride = (prayer: keyof PrayerTimesData) => {
    const overrides = { ...settings.manualOverrides };
    delete overrides[prayer];
    updateSettings({ manualOverrides: overrides });
    toast.success(`تم إعادة وقت ${PRAYER_NAMES[prayer]} للافتراضي`);
  };

  const handlePreview = (soundId: string) => {
    if (playingAdhan === soundId) {
      stopAdhan();
      setPlayingAdhan(null);
    } else {
      previewAdhan(soundId);
      setPlayingAdhan(soundId);
      setTimeout(() => setPlayingAdhan(null), 15000);
    }
  };

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
      <header className="gradient-islamic pattern-islamic px-4 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />
        <div className="pb-6 pt-4">
          <p className="font-amiri text-gold text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-primary-foreground">مواقيت الصلاة</h1>
          {settings.cityName && (
            <p className="font-naskh text-primary-foreground/70 text-sm mt-2 flex items-center justify-center gap-1">
              <MapPin size={14} />
              {settings.cityName}
            </p>
          )}
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Location setup */}
        {!settings.latitude ? (
          <section className="bg-card border border-border rounded-2xl p-6 text-center shadow-soft animate-slide-up">
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
              />
            )}

            {/* Prayer times list */}
            <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft animate-slide-up" style={{ animationDelay: "80ms" }}>
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
                              {times[prayer]}
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
            <section className="bg-card border border-border rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: "120ms" }}>
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
            <section className="bg-card border border-border rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: "160ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-islamic flex items-center justify-center">
                  <Volume2 size={18} className="text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-naskh text-sm font-bold text-foreground">صوت الأذان</h2>
                  <p className="text-[11px] text-muted-foreground font-naskh">اختر المؤذن المفضل</p>
                </div>
              </div>

              <div className="space-y-2">
                {ADHAN_SOUNDS.map((sound) => (
                  <div
                    key={sound.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      settings.adhanSound === sound.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/40"
                    }`}
                    onClick={() => updateSettings({ adhanSound: sound.id })}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      settings.adhanSound === sound.id ? "border-accent" : "border-border"
                    }`}>
                      {settings.adhanSound === sound.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                      )}
                    </div>
                    <span className="font-naskh text-sm text-foreground flex-1">{sound.label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(sound.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                      title="معاينة"
                    >
                      {playingAdhan === sound.id ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-5 shadow-soft animate-slide-up hover:border-accent/40 transition-all"
              style={{ animationDelay: "200ms" }}
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
              <section className="bg-card border border-border rounded-2xl p-5 shadow-soft animate-fade-in space-y-4">
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
