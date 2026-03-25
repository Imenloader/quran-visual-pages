import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { isBefore, addDays } from "date-fns";
import { toast } from "sonner";

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
  latitude: 29.9602, // Maadi, Cairo
  longitude: 31.2569,
  cityName: "المعادي، القاهرة (تلقائي)",
  method: 5, // Egyptian General Authority of Survey
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
    id: "egypt",
    label: "أذان مصر (القاهرة)",
    url: "https://cdn.aladhan.com/audio/adhans/4.mp3",
  },
  {
    id: "turkey",
    label: "أذان تركيا (إسطنبول)",
    url: "https://cdn.aladhan.com/audio/adhans/7.mp3",
  },
  {
    id: "bosnia",
    label: "أذان البوسنة",
    url: "https://cdn.aladhan.com/audio/adhans/8.mp3",
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
  {
    id: "mansour",
    label: "منصور السالمي",
    url: "https://cdn.aladhan.com/audio/adhans/10.mp3",
  },
  {
    id: "naif",
    label: "نايف الفايز",
    url: "https://cdn.aladhan.com/audio/adhans/11.mp3",
  },
  {
    id: "yusuf",
    label: "يوسف إسلام",
    url: "https://cdn.aladhan.com/audio/adhans/9.mp3",
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

export function usePrayerTimes(options?: { onAdhanStart?: () => void }) {
  const [settings, setSettings] = useState<PrayerSettings>(getSettings);
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const notifTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Function to unlock audio on first interaction
  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return;
    const audio = new Audio();
    audio.play().then(() => {
      audio.pause();
      setAudioUnlocked(true);
      console.log("Audio unlocked");
    }).catch(() => {
      console.log("Audio unlock failed - waiting for interaction");
    });
  }, [audioUnlocked]);

  const playAdhanSound = useCallback((url: string) => {
    try {
      if (optionsRef.current?.onAdhanStart) {
        optionsRef.current.onAdhanStart();
      }
      
      // Cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
      
      const audio = new Audio();
      // Use crossOrigin only if needed, but for AlAdhan CDN it's usually better without it
      // unless we're doing Web Audio API processing
      audio.src = url;
      audio.preload = "auto";
      audioRef.current = audio;

      // Add event listeners for debugging and error handling
      audio.oncanplaythrough = () => {
        console.log("Audio can play through:", url);
      };

      audio.onerror = () => {
        const error = audio.error;
        let errorMsg = "حدث خطأ في تشغيل ملف الأذان";
        
        if (error) {
          console.error("Audio element error details:", {
            code: error.code,
            message: error.message,
            url: url
          });
          
          switch (error.code) {
            case 1: errorMsg = "تم إيقاف تحميل الملف"; break;
            case 2: errorMsg = "خطأ في الشبكة أثناء تحميل الأذان"; break;
            case 3: errorMsg = "خطأ في فك تشفير ملف الأذان"; break;
            case 4: 
              errorMsg = "ملف الأذان غير مدعوم أو الرابط غير صالح"; 
              // Try a fallback URL if it's a common sound
              if (url.includes("cdn.aladhan.com")) {
                console.warn("AlAdhan CDN failed, trying fallback...");
                // We could implement a fallback mechanism here if we had alternative URLs
              }
              break;
          }
        }
        
        toast.error(errorMsg);
      };

      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name === "AbortError") return;
          console.error("Adhan playback promise failed:", err);
          
          if (err.name === "NotAllowedError") {
            toast.error("يرجى الضغط على الشاشة لتفعيل الصوت");
          } else if (err.name === "NotSupportedError" || err.message.includes("suitable")) {
            console.warn("Retrying audio load...");
            audio.load();
          }
        });
      }
    } catch (err) {
      console.error("Error in playAdhanSound:", err);
    }
  }, []);

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
      
      const now = new Date();
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (isBefore(target, now)) {
        target.setDate(target.getDate() + 1);
      }

      const ms = target.getTime() - now.getTime();
      
      // Only schedule if it's within the next 24 hours (which it should be)
      if (ms > 0) {
        const timer = setTimeout(() => {
          // Show notification
          const title = `🕌 حان وقت صلاة ${PRAYER_NAMES[prayer]}`;
          const body = `حان الآن موعد أذان ${PRAYER_NAMES[prayer]} - ${timeStr}`;
          
          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, {
                body,
                icon: "/pwa-192x192.png",
                tag: `prayer-${prayer}`,
                dir: "rtl",
                lang: "ar",
                renotify: true,
                vibrate: [200, 100, 200],
              } as NotificationOptions);
            });
          } else {
            new Notification(title, {
              body,
              icon: "/pwa-192x192.png",
              tag: `prayer-${prayer}`,
              dir: "rtl",
              lang: "ar",
            });
          }

          // Play adhan
          playAdhanSound(adhanUrl);
        }, ms);
        notifTimersRef.current.push(timer);
      }
    });

    return () => {
      notifTimersRef.current.forEach(clearTimeout);
      notifTimersRef.current = [];
    };
  }, [effectiveTimes, settings.notificationsEnabled, settings.adhanSound, playAdhanSound]);

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

  const stopAdhan = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const previewAdhan = useCallback((soundId: string) => {
    const url = ADHAN_SOUNDS.find((s) => s.id === soundId)?.url;
    if (!url) return;
    
    playAdhanSound(url);
    
    // Stop after 15 seconds
    const stopTimer = setTimeout(() => {
      stopAdhan();
    }, 15000);
    
    return () => clearTimeout(stopTimer);
  }, [playAdhanSound, stopAdhan]);

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
    playAdhanSound(adhanUrl);
    
    setTimeout(() => stopAdhan(), 15000);
  }, [effectiveTimes, settings.adhanSound, playAdhanSound, stopAdhan]);

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
    unlockAudio,
    audioUnlocked,
  };
}
