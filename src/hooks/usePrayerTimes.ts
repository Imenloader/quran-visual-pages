import { useState, useEffect, useCallback, useRef } from "react";

const PRAYER_SETTINGS_KEY = "prayer-times-settings";

export interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerSettings {
  latitude: number | null;
  longitude: number | null;
  cityName: string;
  method: number; // calculation method
  adhanSound: string;
  notificationsEnabled: boolean;
  manualOverrides: Partial<PrayerTimesData>;
}

const DEFAULT_SETTINGS: PrayerSettings = {
  latitude: null,
  longitude: null,
  cityName: "",
  method: 5, // Egyptian General Authority of Survey (common for Arab countries)
  adhanSound: "makkah",
  notificationsEnabled: false,
  manualOverrides: {},
};

export const ADHAN_SOUNDS: { id: string; label: string; url: string }[] = [
  {
    id: "makkah",
    label: "أذان الحرم المكي",
    url: "https://cdn.aladhan.com/audio/adhans/1.mp3",
  },
  {
    id: "madinah",
    label: "أذان المسجد النبوي",
    url: "https://cdn.aladhan.com/audio/adhans/2.mp3",
  },
  {
    id: "alaqsa",
    label: "أذان المسجد الأقصى",
    url: "https://cdn.aladhan.com/audio/adhans/3.mp3",
  },
  {
    id: "mishary",
    label: "مشاري العفاسي",
    url: "https://cdn.aladhan.com/audio/adhans/6.mp3",
  },
  {
    id: "abdulbaset",
    label: "عبدالباسط عبدالصمد",
    url: "https://cdn.aladhan.com/audio/adhans/5.mp3",
  },
];

export const CALCULATION_METHODS: { id: number; label: string }[] = [
  { id: 5, label: "الهيئة المصرية العامة للمساحة" },
  { id: 4, label: "أم القرى (مكة)" },
  { id: 3, label: "رابطة العالم الإسلامي" },
  { id: 2, label: "الجمعية الإسلامية لأمريكا الشمالية" },
  { id: 1, label: "جامعة العلوم الإسلامية بكراتشي" },
  { id: 7, label: "معهد الجيوفيزياء - جامعة طهران" },
];

export const PRAYER_NAMES: Record<keyof PrayerTimesData, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

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

const parseTime = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
};

const getNextPrayer = (
  times: PrayerTimesData
): { name: keyof PrayerTimesData; time: string } | null => {
  const now = new Date();
  const prayerOrder: (keyof PrayerTimesData)[] = [
    "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha",
  ];
  for (const name of prayerOrder) {
    const prayerTime = parseTime(times[name]);
    if (prayerTime > now) {
      return { name, time: times[name] };
    }
  }
  // All prayers passed, next is Fajr tomorrow
  return { name: "Fajr", time: times.Fajr };
};

const getRemainingTime = (timeStr: string): string => {
  const now = new Date();
  const target = parseTime(timeStr);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة`;
  return `${minutes} دقيقة`;
};

export function usePrayerTimes() {
  const [settings, setSettings] = useState<PrayerSettings>(getSettings);
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const notifTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  }, []);

  // Apply manual overrides
  const effectiveTimes: PrayerTimesData | null = times
    ? { ...times, ...settings.manualOverrides }
    : null;

  // Schedule notifications
  useEffect(() => {
    notifTimersRef.current.forEach(clearTimeout);
    notifTimersRef.current = [];

    if (!settings.notificationsEnabled || !effectiveTimes) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const adhanUrl = ADHAN_SOUNDS.find((s) => s.id === settings.adhanSound)?.url || ADHAN_SOUNDS[0].url;
    const prayersToNotify: (keyof PrayerTimesData)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    prayersToNotify.forEach((prayer) => {
      const timeStr = effectiveTimes[prayer];
      const [hours, minutes] = timeStr.split(":").map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      const now = new Date();
      if (target <= now) return; // already passed today

      const ms = target.getTime() - now.getTime();
      const timer = setTimeout(() => {
        // Show notification
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(`🕌 حان وقت صلاة ${PRAYER_NAMES[prayer]}`, {
              body: `حان الآن موعد أذان ${PRAYER_NAMES[prayer]} - ${timeStr}`,
              icon: "/pwa-192x192.png",
              tag: `prayer-${prayer}`,
              dir: "rtl",
              lang: "ar",
              renotify: true,
            } as NotificationOptions);
          });
        } else {
          new Notification(`🕌 حان وقت صلاة ${PRAYER_NAMES[prayer]}`, {
            body: `حان الآن موعد أذان ${PRAYER_NAMES[prayer]} - ${timeStr}`,
            icon: "/pwa-192x192.png",
            tag: `prayer-${prayer}`,
            dir: "rtl",
            lang: "ar",
          });
        }
        // Play adhan
        try {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          audioRef.current = new Audio(adhanUrl);
          audioRef.current.play().catch(() => {});
        } catch { /* ignore */ }
      }, ms);
      notifTimersRef.current.push(timer);
    });

    return () => {
      notifTimersRef.current.forEach(clearTimeout);
      notifTimersRef.current = [];
    };
  }, [effectiveTimes, settings.notificationsEnabled, settings.adhanSound]);

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
    const url = ADHAN_SOUNDS.find((s) => s.id === soundId)?.url;
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    audioRef.current = new Audio(url);
    audioRef.current.play().catch(() => {});
    // Stop after 15 seconds
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }, 15000);
  }, []);

  const stopAdhan = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const testPrayerNotification = useCallback((prayer: keyof PrayerTimesData) => {
    if (!effectiveTimes) return;
    const timeStr = effectiveTimes[prayer];
    const title = `🕌 حان وقت صلاة ${PRAYER_NAMES[prayer]}`;
    const body = `حان الآن موعد أذان ${PRAYER_NAMES[prayer]} - ${timeStr}`;
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body, icon: "/pwa-192x192.png", tag: `test-${prayer}`, dir: "rtl", lang: "ar", renotify: true,
        } as NotificationOptions);
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/pwa-192x192.png", tag: `test-${prayer}`, dir: "rtl", lang: "ar" });
    }
    // Play adhan
    const adhanUrl = ADHAN_SOUNDS.find((s) => s.id === settings.adhanSound)?.url || ADHAN_SOUNDS[0].url;
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(adhanUrl);
    audioRef.current.play().catch(() => {});
    setTimeout(() => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } }, 15000);
  }, [effectiveTimes, settings.adhanSound]);

  return {
    settings,
    updateSettings,
    times: effectiveTimes,
    loading,
    error,
    locationLoading,
    detectLocation,
    nextPrayer: effectiveTimes ? getNextPrayer(effectiveTimes) : null,
    getRemainingTime,
    previewAdhan,
    stopAdhan,
    testPrayerNotification,
  };
}
