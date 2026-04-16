import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { isBefore, addDays } from "date-fns";
import { toast } from "sonner";
import { speakPrayerName } from "@/services/ttsService";
import { useAdhan } from "@/contexts/AdhanContext";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";
// Import constants from the dedicated file to avoid circular dependencies
import { 
  PRAYER_SETTINGS_KEY, 
  DEFAULT_SETTINGS, 
  ADHAN_SOUNDS, 
  CALCULATION_METHODS, 
  PRAYER_NAMES,
  type PrayerTimesData, 
  type PrayerSettings 
} from "@/data/prayerConstants";

const getSettings = (): PrayerSettings => {
  try {
    const stored = localStorage.getItem(PRAYER_SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings: PrayerSettings) => {
  localStorage.setItem(PRAYER_SETTINGS_KEY, JSON.stringify(settings));
};

export const getLocalTime = (): Date => {
  return new Date();
};

export const getCairoDate = (): Date => {
  return toZonedTime(new Date(), "Africa/Cairo");
};

export const getEffectiveNow = (settings: PrayerSettings): Date => {
  const isDefault = !settings.latitude || (
    Math.abs(settings.latitude - DEFAULT_SETTINGS.latitude) < 0.0001 && 
    Math.abs(settings.longitude! - DEFAULT_SETTINGS.longitude!) < 0.0001
  );
  return isDefault ? getCairoDate() : getLocalTime();
};

const parseTime = (timeStr: string, now: Date): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const getNextPrayer = (
  times: PrayerTimesData,
  now: Date
): { name: keyof PrayerTimesData; time: string } | null => {
  const prayerOrder: (keyof PrayerTimesData)[] = [
    "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha",
  ];
  for (const name of prayerOrder) {
    const prayerTime = parseTime(times[name], now);
    if (prayerTime > now) {
      return { name, time: times[name] };
    }
  }
  // All prayers passed, next is Fajr tomorrow
  return { name: "Fajr", time: times.Fajr };
};

const syncToNativeWidget = async (name: string, time: string, city: string) => {
  if (Capacitor.getPlatform() !== "android") return;
  try {
    await Preferences.set({ key: "next_prayer_name", value: PRAYER_NAMES[name as keyof PrayerTimesData] || name });
    await Preferences.set({ key: "next_prayer_time", value: time });
    await Preferences.set({ key: "city_name", value: city });
  } catch (err) {
    console.error("Failed to sync to widget:", err);
  }
};

const getRemainingTime = (timeStr: string, now: Date): string => {
  const target = parseTime(timeStr, now);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة`;
  return `${minutes} دقيقة`;
};

export const formatTime = (timeStr: string, format: "12h" | "24h"): string => {
  if (format === "24h") return timeStr;
  
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "م" : "ص";
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, "0")} ${period}`;
};

export function usePrayerTimes(options?: { onAdhanStart?: () => void }) {
  const [settings, setSettings] = useState<PrayerSettings>(getSettings);
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const { isAdhanPlaying, playAdhan, stopAdhan } = useAdhan();
  const notifTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const optionsRef = useRef(options);

  const getNow = useCallback(() => {
    return getEffectiveNow(settings);
  }, [settings]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const playAdhanSound = useCallback(async (soundId: string, prayerNameAr?: string) => {
    if (optionsRef.current?.onAdhanStart) {
      optionsRef.current.onAdhanStart();
    }
    return playAdhan(soundId, prayerNameAr || "");
  }, [playAdhan]);

  const fetchTimes = useCallback(async (lat: number, lng: number, method: number) => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}`
      );
      if (!res.ok) throw new Error("فشل في جلب المواقيت");
      const data = await res.json();
      const t = data.data.timings;
      const prayerTimes: PrayerTimesData = {
        Fajr: t.Fajr,
        Sunrise: t.Sunrise,
        Dhuhr: t.Dhuhr,
        Asr: t.Asr,
        Maghrib: t.Maghrib,
        Isha: t.Isha,
      };
      setTimes(prayerTimes);
    } catch {
      setError("تعذر جلب مواقيت الصلاة. تحقق من الاتصال بالإنترنت");
    } finally {
      setLoading(false);
    }
  }, []);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode for city name
        let cityName = "موقعك الحالي";
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            cityName = geoData.city || geoData.locality || geoData.principalSubdivision || cityName;
          }
        } catch { /* ignore */ }
        const newSettings = { ...settings, latitude, longitude, cityName };
        setSettings(newSettings);
        saveSettings(newSettings);
        await fetchTimes(latitude, longitude, settings.method);
        setLocationLoading(false);
      },
      () => {
        setError("تم رفض إذن تحديد الموقع. يمكنك إدخال الإحداثيات يدوياً");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [settings, fetchTimes]);

  // Load times on mount if we have coordinates
  useEffect(() => {
    if (settings.latitude && settings.longitude) {
      fetchTimes(settings.latitude, settings.longitude, settings.method);
    }
  }, [settings.latitude, settings.longitude, settings.method, fetchTimes]);

  // Apply manual overrides
  const effectiveTimes = useMemo<PrayerTimesData | null>(() => {
    return times ? { ...times, ...settings.manualOverrides } : null;
  }, [times, settings.manualOverrides]);

  // Sync to widget whenever times or settings change
  useEffect(() => {
    if (effectiveTimes && settings.cityName) {
      const next = getNextPrayer(effectiveTimes, getNow());
      if (next) {
        syncToNativeWidget(next.name, next.time, settings.cityName);
      }
    }
  }, [effectiveTimes, settings.cityName, getNow]);

  // Schedule notifications
  useEffect(() => {
    notifTimersRef.current.forEach(clearTimeout);
    notifTimersRef.current = [];

    if (!settings.notificationsEnabled || !effectiveTimes) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const prayersToNotify = settings.enabledPrayers;

    prayersToNotify.forEach((prayer) => {
      const timeStr = effectiveTimes[prayer];
      const [hours, minutes] = timeStr.split(":").map(Number);
      
      const now = getNow();
      
      // 1. Schedule Main Prayer Notification
      const target = new Date(now);
      target.setHours(hours, minutes, 0, 0);
      if (isBefore(target, now)) target.setDate(target.getDate() + 1);

      const ms = target.getTime() - now.getTime();
      if (ms > 0) {
        const timer = setTimeout(() => {
          const title = `🕌 حان الآن وقت صلاة ${PRAYER_NAMES[prayer]}`;
          const body = `الله أكبر، الله أكبر.. حان الآن موعد أذان صلاة ${PRAYER_NAMES[prayer]} حسب توقيت ${settings.cityName || "القاهرة"}`;
          
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, {
                body,
                icon: "/pwa-192x192.png",
                tag: `prayer-${prayer}`,
                dir: "rtl",
                lang: "ar",
                renotify: true,
                vibrate: [200, 100, 200, 100, 200],
                data: { url: "/prayer-times" }
              } as NotificationOptions).catch(err => {
                console.error("Failed to show notification via SW:", err);
                // Fallback to standard notification
                if ("Notification" in window && Notification.permission === "granted") {
                  new Notification(title, { body, icon: "/pwa-192x192.png", tag: `prayer-${prayer}`, dir: "rtl", lang: "ar" });
                }
              });
            });
          } else if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
              body,
              icon: "/pwa-192x192.png",
              tag: `prayer-${prayer}`,
              dir: "rtl",
              lang: "ar",
            });
          }

          playAdhanSound(settings.adhanSound, PRAYER_NAMES[prayer]);
        }, ms);
        notifTimersRef.current.push(timer);
      }

      // 2. Schedule Pre-Prayer Notification
      if (settings.prePrayerNotification && prayer !== "Sunrise") {
        const preTarget = new Date(target);
        preTarget.setMinutes(preTarget.getMinutes() - settings.prePrayerMinutes);
        
        const preMs = preTarget.getTime() - now.getTime();
        if (preMs > 0) {
          const preTimer = setTimeout(() => {
            const title = `🔔 اقترب موعد صلاة ${PRAYER_NAMES[prayer]}`;
            const body = `بقي ${settings.prePrayerMinutes} دقائق على أذان صلاة ${PRAYER_NAMES[prayer]}`;
            
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(title, {
                  body,
                  icon: "/pwa-192x192.png",
                  tag: `pre-prayer-${prayer}`,
                  dir: "rtl",
                  lang: "ar",
                  renotify: true,
                  data: { url: "/prayer-times" }
                } as NotificationOptions);
              });
            } else {
              new Notification(title, {
                body,
                icon: "/pwa-192x192.png",
                tag: `pre-prayer-${prayer}`,
                dir: "rtl",
                lang: "ar",
              });
            }
          }, preMs);
          notifTimersRef.current.push(preTimer);
        }
      }
    });

    return () => {
      notifTimersRef.current.forEach(clearTimeout);
      notifTimersRef.current = [];
    };
  }, [effectiveTimes, settings.notificationsEnabled, settings.adhanSound, settings.cityName, settings.enabledPrayers, settings.prePrayerMinutes, settings.prePrayerNotification, playAdhanSound, getNow]);

  const updateSettings = useCallback(
    (partial: Partial<PrayerSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        saveSettings(next);
        // Refetch if method or coords changed
        if (
          (partial.method !== undefined || partial.latitude !== undefined || partial.longitude !== undefined) &&
          next.latitude && next.longitude
        ) {
          fetchTimes(next.latitude, next.longitude, next.method);
        }
        return next;
      });
    },
    [fetchTimes]
  );

  const previewAdhan = useCallback((soundId: string) => {
    playAdhanSound(soundId, "العصر"); // Use Asr as preview example
    
    // Stop after 15 seconds
    const stopTimer = setTimeout(() => {
      stopAdhan();
    }, 15000);
    
    return () => clearTimeout(stopTimer);
  }, [playAdhanSound, stopAdhan]);

  const testPrayerNotification = useCallback((prayer: keyof PrayerTimesData) => {
    const timeStr = effectiveTimes ? effectiveTimes[prayer] : "--:--";
    const prayerNameAr = PRAYER_NAMES[prayer];
    const title = `🕌 حان الآن موعد صلاة ${prayerNameAr}`;
    const body = `حان الآن موعد أذان صلاة ${prayerNameAr} في ${settings.cityName} - الوقت: ${timeStr}`;
    
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body, 
          icon: "/pwa-192x192.png", 
          tag: `test-${prayer}`, 
          dir: "rtl", 
          lang: "ar", 
          renotify: true,
          vibrate: [200, 100, 200],
          data: { url: "/prayer-times" }
        } as NotificationOptions);
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { 
        body, 
        icon: "/pwa-192x192.png", 
        tag: `test-${prayer}`, 
        dir: "rtl", 
        lang: "ar" 
      });
    }
    
    // Play adhan
    playAdhanSound(settings.adhanSound, prayerNameAr);
    
    // Stop after 20 seconds
    setTimeout(() => stopAdhan(), 20000);
  }, [effectiveTimes, settings.adhanSound, settings.cityName, playAdhanSound, stopAdhan]);

  return {
    settings,
    updateSettings,
    times: effectiveTimes,
    loading,
    error,
    locationLoading,
    detectLocation,
    nextPrayer: effectiveTimes ? getNextPrayer(effectiveTimes, getNow()) : null,
    getRemainingTime: (timeStr: string) => getRemainingTime(timeStr, getNow()),
    previewAdhan,
    stopAdhan,
    testPrayerNotification,
    speakPrayer: (prayer: keyof PrayerTimesData) => {
      console.log("speakPrayer hook called for:", prayer);
      return speakPrayerName(prayer);
    },
    isAdhanPlaying,
  };
}
