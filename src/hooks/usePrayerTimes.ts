import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toZonedTime } from "date-fns-tz";
import { speakPrayerName } from "@/services/ttsService";
import { useAdhan } from "@/contexts/AdhanContext";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { storage } from "@/lib/storage";
import { 
  PRAYER_SETTINGS_KEY, 
  DEFAULT_SETTINGS, 
  ADHAN_SOUNDS, 
  CALCULATION_METHODS, 
  PRAYER_NAMES,
  type PrayerTimesData, 
  type PrayerSettings 
} from "@/data/prayerConstants";

export { 
  PRAYER_SETTINGS_KEY, 
  DEFAULT_SETTINGS, 
  ADHAN_SOUNDS, 
  CALCULATION_METHODS, 
  PRAYER_NAMES,
  type PrayerTimesData, 
  type PrayerSettings 
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
  return { name: "Fajr", time: times.Fajr };
};

const syncToNativeWidget = async (times: PrayerTimesData, city: string) => {
  if (Capacitor.getPlatform() !== "android") return;
  try {
    // Send full schedule so the widget can switch prayers autonomously
    await Preferences.set({ key: "prayer_times_json", value: JSON.stringify(times) });
    await Preferences.set({ key: "city_name", value: city || "Quraaniat" });
    if ((times as any).hijri) {
      await Preferences.set({ key: "hijri_date", value: (times as any).hijri });
    }
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
  const [settings, setSettings] = useState<PrayerSettings>(DEFAULT_SETTINGS);
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const { isAdhanPlaying, playAdhan, stopAdhan } = useAdhan();
  const optionsRef = useRef(options);

  // Update tick every minute to refresh nextPrayer and remainingTime
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const loadSettings = async () => {
      const stored = await storage.get(PRAYER_SETTINGS_KEY);
      if (stored) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        } catch (e) {
          console.error("Failed to parse settings", e);
        }
      }
    };
    loadSettings();
  }, []);

  const getNow = useCallback(() => {
    return getEffectiveNow(settings);
  }, [settings]);

  const fetchTimes = useCallback(async (lat: number, lng: number, method: number) => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const dateKey = `${dd}-${mm}-${yyyy}`;
      const cacheKey = `prayer_times_${lat.toFixed(2)}_${lng.toFixed(2)}_${method}_${dateKey}`;
      
      const cached = await storage.get(cacheKey);
      if (cached) {
        setTimes(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const res = await fetch(`https://api.aladhan.com/v1/timings/${dateKey}?latitude=${lat}&longitude=${lng}&method=${method}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const t = data.data.timings;
      const prayerTimes: PrayerTimesData = { 
        Fajr: t.Fajr, 
        Sunrise: t.Sunrise, 
        Dhuhr: t.Dhuhr, 
        Asr: t.Asr, 
        Maghrib: t.Maghrib, 
        Isha: t.Isha,
        Midnight: t.Midnight,
        LastThird: t.Lastthird
      };

      if (data.data.date?.hijri) {
        const h = data.data.date.hijri;
        (prayerTimes as any).hijri = `${h.day} ${h.month.ar} ${h.year}`;
      }
      
      // Calculate Duha (Sunrise + 15 mins)
      const [sH, sM] = t.Sunrise.split(":").map(Number);
      const duhaDate = new Date();
      duhaDate.setHours(sH, sM, 0, 0);
      duhaDate.setMinutes(duhaDate.getMinutes() + 15);
      prayerTimes.Duha = `${String(duhaDate.getHours()).padStart(2, "0")}:${String(duhaDate.getMinutes()).padStart(2, "0")}`;

      setTimes(prayerTimes);
      await storage.set(cacheKey, JSON.stringify(prayerTimes));
    } catch {
      setError("تعذر جلب مواقيت الصلاة");
    } finally {
      setLoading(false);
    }
  }, []);

  const detectLocation = useCallback(async () => {
    setLocationLoading(true);
    setError(null);
    try {
      let latitude: number, longitude: number;
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') await Geolocation.requestPermissions();
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } else {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }

      let cityName = "موقعك الحالي";
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          cityName = geoData.city || geoData.locality || cityName;
        }
      } catch {}

      const newSettings = { ...settings, latitude, longitude, cityName };
      setSettings(newSettings);
      await storage.set(PRAYER_SETTINGS_KEY, JSON.stringify(newSettings));
      fetchTimes(latitude, longitude, settings.method);
    } catch {
      setError("تعذر تحديد الموقع");
    } finally {
      setLocationLoading(false);
    }
  }, [settings, fetchTimes]);

  const effectiveTimes = useMemo(() => times ? { ...times, ...settings.manualOverrides } : null, [times, settings.manualOverrides]);

  useEffect(() => {
    if (settings.latitude && settings.longitude) {
      fetchTimes(settings.latitude, settings.longitude, settings.method);
    }
  }, [settings.latitude, settings.longitude, settings.method, fetchTimes]);

  useEffect(() => {
    if (effectiveTimes && settings.cityName) {
      syncToNativeWidget(effectiveTimes, settings.cityName);
    }
  }, [effectiveTimes, settings.cityName]);

  const playAdhanSound = useCallback(async (soundId: string, prayerNameAr?: string) => {
    if (optionsRef.current?.onAdhanStart) optionsRef.current.onAdhanStart();
    return playAdhan(soundId, prayerNameAr || "");
  }, [playAdhan]);

  const updateSettings = useCallback(async (partial: Partial<PrayerSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    const serialized = JSON.stringify(next);
    await storage.set(PRAYER_SETTINGS_KEY, serialized);
    
    // Manually trigger storage event for the same window so usePrayerNotifications can catch it
    window.dispatchEvent(new StorageEvent('storage', { 
      key: PRAYER_SETTINGS_KEY, 
      newValue: serialized 
    }));

    if ((partial.method !== undefined || partial.latitude !== undefined) && next.latitude) {
      fetchTimes(next.latitude, next.longitude, next.method);
    }
  }, [settings, fetchTimes]);

  const testPrayerNotification = useCallback((prayer: keyof PrayerTimesData) => {
    const prayerNameAr = PRAYER_NAMES[prayer];
    const title = `🕌 حان الآن موعد صلاة ${prayerNameAr}`;
    const body = `تجربة تنبيه صلاة ${prayerNameAr}`;
    
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(reg => reg.showNotification(title, { body, icon: "/pwa-192x192.png", tag: `test-${prayer}`, dir: "rtl" }));
    } else {
      const winNotif = (window as any).Notification;
      if (winNotif?.permission === "granted") new winNotif(title, { body, icon: "/pwa-192x192.png" });
    }
    const soundId = settings.adhanSounds?.[prayer] || settings.adhanSound;
    playAdhanSound(soundId, prayerNameAr);
    setTimeout(() => stopAdhan(), 20000);
  }, [settings.adhanSound, playAdhanSound, stopAdhan]);

  return {
    settings, updateSettings, times: effectiveTimes, loading, error, locationLoading, detectLocation,
    nextPrayer: effectiveTimes ? getNextPrayer(effectiveTimes, getNow()) : null,
    tick, // Expose tick if needed for internal forcing
    getRemainingTime: (timeStr: string) => getRemainingTime(timeStr, getNow()),
    previewAdhan: (soundId: string) => {
      playAdhanSound(soundId, "العصر");
      setTimeout(() => stopAdhan(), 15000);
    },
    stopAdhan, testPrayerNotification,
    speakPrayer: (prayer: keyof PrayerTimesData) => speakPrayerName(prayer),
    isAdhanPlaying,
  };
}
