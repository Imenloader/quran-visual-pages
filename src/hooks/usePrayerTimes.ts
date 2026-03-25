import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { isBefore, addDays } from "date-fns";
import { toast } from "sonner";
import { speakPrayerName } from "@/services/ttsService";

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
  timeFormat: "12h" | "24h";
}

const DEFAULT_SETTINGS: PrayerSettings = {
  latitude: 29.9602, // Maadi, Cairo
  longitude: 31.2569,
  cityName: "المعادي، القاهرة (تلقائي)",
  method: 5, // Egyptian General Authority of Survey
  adhanSound: "tts_arabic",
  notificationsEnabled: false,
  manualOverrides: {},
  timeFormat: "12h",
};

export const ADHAN_SOUNDS: { id: string; label: string; url: string }[] = [
  {
    id: "makkah",
    label: "أذان الحرم المكي",
    url: "https://everyayah.com/data/Adhan/Adhan_Makkah.mp3",
  },
  {
    id: "madinah",
    label: "أذان المسجد النبوي",
    url: "https://everyayah.com/data/Adhan/Adhan_Madinah.mp3",
  },
  {
    id: "alaqsa",
    label: "أذان المسجد الأقصى",
    url: "https://everyayah.com/data/Adhan/Adhan_Al-Aqsa.mp3",
  },
  {
    id: "egypt",
    label: "أذان مصر (القاهرة)",
    url: "https://everyayah.com/data/Adhan/Adhan_Egypt.mp3",
  },
  {
    id: "turkey",
    label: "أذان تركيا (إسطنبول)",
    url: "https://everyayah.com/data/Adhan/Adhan_Turkey.mp3",
  },
  {
    id: "mishary",
    label: "مشاري العفاسي",
    url: "https://everyayah.com/data/Adhan/Adhan_Mishary_Rashid_Al_Afasy.mp3",
  },
  {
    id: "abdulbaset",
    label: "عبدالباسط عبدالصمد",
    url: "https://everyayah.com/data/Adhan/Adhan_Abdul_Baset_Abdul_Samad.mp3",
  },
  {
    id: "mansour",
    label: "منصور السالمي",
    url: "https://everyayah.com/data/Adhan/Adhan_Mansour_Al_Salimi.mp3",
  },
  {
    id: "naif",
    label: "نايف الفايز",
    url: "https://everyayah.com/data/Adhan/Adhan_Naif_Al_Fayez.mp3",
  },
  {
    id: "yusuf",
    label: "يوسف إسلام",
    url: "https://everyayah.com/data/Adhan/Adhan_Yusuf_Islam.mp3",
  },
  {
    id: "tts_arabic",
    label: "نطق اسم الصلاة (إنجليزي)",
    url: "tts",
  },
  {
    id: "beep",
    label: "تنبيه بسيط (Beep)",
    url: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
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

export const getCairoDate = (): Date => {
  const now = new Date();
  try {
    const cairoString = now.toLocaleString("en-US", { timeZone: "Africa/Cairo" });
    return new Date(cairoString);
  } catch (e) {
    console.error("Error calculating Cairo date:", e);
    return now;
  }
};

const parseTime = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = getCairoDate();
  now.setHours(hours, minutes, 0, 0);
  return now;
};

const getNextPrayer = (
  times: PrayerTimesData
): { name: keyof PrayerTimesData; time: string } | null => {
  const now = getCairoDate();
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
  const now = getCairoDate();
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
    
    // Unlock standard audio
    const audio = new Audio();
    audio.play().then(() => {
      audio.pause();
      setAudioUnlocked(true);
      console.log("Audio unlocked");
    }).catch(() => {
      console.log("Audio unlock failed - waiting for interaction");
    });

    // Unlock SpeechSynthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      // Speak an empty string to unlock TTS on some mobile browsers
      const utterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(utterance);
    }
  }, [audioUnlocked]);

  const playAdhanSound = useCallback(async (soundId: string, prayerNameAr?: string) => {
    const FALLBACK_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
    
    const playAudio = (audioUrl: string, isFallback = false) => {
      try {
        if (optionsRef.current?.onAdhanStart && !isFallback) {
          optionsRef.current.onAdhanStart();
        }
        
        // Cleanup previous audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeAttribute("src");
          audioRef.current.load();
        }
        
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.src = audioUrl;
        audio.preload = "auto";
        audioRef.current = audio;

        audio.onerror = () => {
          console.error(`Audio error for ${isFallback ? "fallback" : "primary"} sound:`, audio.error);
          if (!isFallback) {
            console.log("Attempting fallback sound...");
            playAudio(FALLBACK_SOUND, true);
          } else {
            toast.error("تعذر تشغيل صوت التنبيه");
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (err.name === "AbortError") return;
            console.error("Playback failed:", err);
            if (!isFallback) {
              playAudio(FALLBACK_SOUND, true);
            }
          });
        }
      } catch (err) {
        console.error("Error in playAudio:", err);
        if (!isFallback) playAudio(FALLBACK_SOUND, true);
      }
    };

    if (soundId === "tts_arabic" && prayerNameAr) {
      // Find the key for the prayerNameAr to get the English name
      const prayerKey = (Object.keys(PRAYER_NAMES) as (keyof PrayerTimesData)[]).find(
        key => PRAYER_NAMES[key] === prayerNameAr
      );
      const englishName = prayerKey || prayerNameAr;
      console.log("Calling speakPrayerName for:", englishName);
      speakPrayerName(englishName);
    } else {
      const soundUrl = ADHAN_SOUNDS.find(s => s.id === soundId)?.url || ADHAN_SOUNDS[0].url;
      playAudio(soundUrl);
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

    const prayersToNotify: (keyof PrayerTimesData)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    prayersToNotify.forEach((prayer) => {
      const timeStr = effectiveTimes[prayer];
      const [hours, minutes] = timeStr.split(":").map(Number);
      
      const now = getCairoDate();
      const target = new Date(now);
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
          const title = `🕌 Time for ${prayer} Prayer`;
          const body = `It is now time for ${prayer} prayer - ${timeStr}`;
          
          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, {
                body,
                icon: "/pwa-192x192.png",
                tag: `prayer-${prayer}`,
                dir: "ltr",
                lang: "en",
                renotify: true,
                vibrate: [200, 100, 200],
              } as NotificationOptions);
            });
          } else {
            new Notification(title, {
              body,
              icon: "/pwa-192x192.png",
              tag: `prayer-${prayer}`,
              dir: "ltr",
              lang: "en",
            });
          }

          // Play adhan
          playAdhanSound(settings.adhanSound, PRAYER_NAMES[prayer]);
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
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const previewAdhan = useCallback((soundId: string) => {
    playAdhanSound(soundId, "العصر"); // Use Asr as preview example
    
    // Stop after 15 seconds
    const stopTimer = setTimeout(() => {
      stopAdhan();
    }, 15000);
    
    return () => clearTimeout(stopTimer);
  }, [playAdhanSound, stopAdhan]);

  const testPrayerNotification = useCallback((prayer: keyof PrayerTimesData) => {
    if (!effectiveTimes) return;
    const timeStr = effectiveTimes[prayer];
    const title = `🕌 Time for ${prayer} Prayer`;
    const body = `It is now time for ${prayer} prayer - ${timeStr}`;
    
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body, icon: "/pwa-192x192.png", tag: `test-${prayer}`, dir: "ltr", lang: "en", renotify: true,
        } as NotificationOptions);
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/pwa-192x192.png", tag: `test-${prayer}`, dir: "ltr", lang: "en" });
    }
    
    // Play adhan
    playAdhanSound(settings.adhanSound, PRAYER_NAMES[prayer]);
    
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
    speakPrayer: (prayer: keyof PrayerTimesData) => {
      console.log("speakPrayer hook called for:", prayer);
      return speakPrayerName(prayer);
    },
    unlockAudio,
    audioUnlocked,
  };
}
