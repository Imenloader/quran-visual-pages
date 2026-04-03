import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
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
  prePrayerNotification: boolean;
  prePrayerMinutes: number;
  enabledPrayers: (keyof PrayerTimesData)[];
  manualOverrides: Partial<PrayerTimesData>;
  timeFormat: "12h" | "24h";
}

export const DEFAULT_SETTINGS: PrayerSettings = {
  latitude: 29.9602, // Maadi, Cairo
  longitude: 31.2569,
  cityName: "المعادي، القاهرة (تلقائي)",
  method: 5, // Egyptian General Authority of Survey
  adhanSound: "tts_arabic",
  notificationsEnabled: false,
  prePrayerNotification: false,
  prePrayerMinutes: 10,
  enabledPrayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
  manualOverrides: {},
  timeFormat: "12h",
};

export const ADHAN_SOUNDS: { id: string; label: string; url: string }[] = [
  {
    id: "makkah",
    label: "أذان الحرم المكي",
    url: "/Adhan%20Sounds/Adhan-Makkah.mp3",
  },
  {
    id: "madinah",
    label: "أذان المسجد النبوي",
    url: "/Adhan%20Sounds/Adhan-Madinah.mp3",
  },
  {
    id: "alaqsa",
    label: "أذان المسجد الأقصى",
    url: "/Adhan%20Sounds/Adhan-Alaqsa.mp3",
  },
  {
    id: "egypt",
    label: "أذان مصر (القاهرة)",
    url: "/Adhan%20Sounds/Adhan-Egypt.mp3",
  },
  {
    id: "abdulbaset",
    label: "عبدالباسط عبدالصمد",
    url: "/Adhan%20Sounds/Abdul-Basit.mp3",
  },
  {
    id: "minshawi",
    label: "محمد صديق المنشاوي",
    url: "/Adhan%20Sounds/Minshawi.mp3",
  },
  {
    id: "naghshbandi",
    label: "سيد النقشبندي",
    url: "/Adhan%20Sounds/Naghshbandi.mp3",
  },
  {
    id: "yusuf",
    label: "يوسف إسلام",
    url: "/Adhan%20Sounds/Yusuf-Islam.mp3",
  },
  {
    id: "halab",
    label: "أذان حلب",
    url: "/Adhan%20Sounds/Adhan-Halab.mp3",
  },
  {
    id: "abdulghaffar",
    label: "عبدالغفار",
    url: "/Adhan%20Sounds/Abdul-Ghaffar.mp3",
  },
  {
    id: "abdulhakam",
    label: "عبدالحكم",
    url: "/Adhan%20Sounds/Abdul-Hakam.mp3",
  },
  {
    id: "hussaini",
    label: "الحسيني",
    url: "/Adhan%20Sounds/Al-Hussaini.mp3",
  },
  {
    id: "bakir",
    label: "بكر باش",
    url: "/Adhan%20Sounds/Bakir-Bash.mp3",
  },
  {
    id: "hafez",
    label: "حافظ",
    url: "/Adhan%20Sounds/Hafez.mp3",
  },
  {
    id: "hafizmurad",
    label: "حافظ مراد",
    url: "/Adhan%20Sounds/Hafiz-Murad.mp3",
  },
  {
    id: "saber",
    label: "صابر",
    url: "/Adhan%20Sounds/Saber.mp3",
  },
  {
    id: "sharif",
    label: "شريف دومان",
    url: "/Adhan%20Sounds/Sharif-Doman.mp3",
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
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);
  const notifTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const optionsRef = useRef(options);

  const getNow = useCallback(() => {
    return getEffectiveNow(settings);
  }, [settings]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Function to unlock audio on first interaction
  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return;
    
    // Unlock standard audio
    const audio = new Audio();
    audio.play().then(() => {
      // Don't pause immediately to avoid interruption error
      // Just let it be, it's an empty audio anyway
      setAudioUnlocked(true);
      console.log("Audio unlocked");
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        console.log("Audio unlock failed - waiting for interaction", err);
      }
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
    
    const playAudio = async (audioUrl: string, isFallback = false) => {
      try {
        if (optionsRef.current?.onAdhanStart && !isFallback) {
          optionsRef.current.onAdhanStart();
        }
        
        // Cleanup previous audio
        if (audioRef.current) {
          if (playPromiseRef.current) {
            try { await playPromiseRef.current; } catch (e) { /* ignore interruption */ }
          }
          audioRef.current.pause();
          audioRef.current.removeAttribute("src");
          audioRef.current.load();
        }
        
        const audio = new Audio();
        // Ensure the URL is clean and has protocol if it's external
        let finalUrl = audioUrl;
        if (finalUrl.startsWith("//")) {
          finalUrl = "https:" + finalUrl;
        } else if (finalUrl.startsWith("http://")) {
          finalUrl = finalUrl.replace("http://", "https://");
        }

        audio.src = finalUrl;
        audio.preload = "auto";
        audioRef.current = audio;
        
        audio.onplay = () => setIsAdhanPlaying(true);
        audio.onended = () => setIsAdhanPlaying(false);
        audio.onpause = () => setIsAdhanPlaying(false);

        audio.onerror = () => {
          const err = audio.error;
          let message = "خطأ في تشغيل صوت التنبيه";
          
          if (err) {
            console.error(`Audio error [${err.code}] for ${isFallback ? "fallback" : "primary"} sound: ${err.message} | URL: ${finalUrl}`);
            switch (err.code) {
              case 1: return; // Aborted
              case 2: message = "خطأ في الشبكة أثناء تحميل الأذان. تحقق من اتصالك."; break;
              case 3: message = "خطأ في فك تشفير ملف الأذان. قد يكون الملف تالفاً."; break;
              case 4: message = "ملف الأذان غير مدعوم أو غير موجود حالياً."; break;
            }
          }

          if (!isFallback) {
            console.log("Attempting fallback sound...");
            playAudio(FALLBACK_SOUND, true);
          } else {
            toast.error(message, {
              description: finalUrl.split('/').slice(0, 3).join('/') + "..."
            });
          }
        };

        const promise = audio.play();
        if (promise !== undefined) {
          playPromiseRef.current = promise;
          promise.catch((err) => {
            if (err.name !== "AbortError") {
              console.error("Playback failed:", err);
              if (!isFallback) {
                playAudio(FALLBACK_SOUND, true);
              }
            }
          }).finally(() => {
            if (playPromiseRef.current === promise) {
              playPromiseRef.current = null;
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

  const stopAdhan = useCallback(async () => {
    if (audioRef.current) {
      if (playPromiseRef.current) {
        try { await playPromiseRef.current; } catch (e) { /* ignore interruption */ }
      }
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAdhanPlaying(false);
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

  // Listen for STOP_ADHAN message from service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'STOP_ADHAN') {
        console.log("Received STOP_ADHAN from service worker");
        stopAdhan();
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [stopAdhan]);

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
    unlockAudio,
    audioUnlocked,
    isAdhanPlaying,
  };
}
