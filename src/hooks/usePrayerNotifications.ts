import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PRAYER_SETTINGS_KEY, 
  DEFAULT_SETTINGS, 
  PRAYER_NAMES, 
  type PrayerSettings, 
  type PrayerTimesData,
  getEffectiveNow,
  ADHAN_SOUNDS
} from './usePrayerTimes';
import { isBefore } from 'date-fns';
import { speakPrayerName } from '@/services/ttsService';

export const usePrayerNotifications = () => {
  const { i18n } = useTranslation();
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getSettings = (): PrayerSettings => {
    try {
      const stored = localStorage.getItem(PRAYER_SETTINGS_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  };

  const playAdhan = (soundId: string, prayerNameAr: string) => {
    if (soundId === "tts_arabic") {
      const prayerKey = (Object.keys(PRAYER_NAMES) as (keyof PrayerTimesData)[]).find(
        key => PRAYER_NAMES[key] === prayerNameAr
      );
      if (prayerKey) speakPrayerName(prayerKey);
      return;
    }

    const soundUrl = ADHAN_SOUNDS.find(s => s.id === soundId)?.url || ADHAN_SOUNDS[0].url;
    
    // Clean URL
    let finalUrl = soundUrl;
    if (finalUrl.startsWith("//")) {
      finalUrl = "https:" + finalUrl;
    } else if (finalUrl.startsWith("http://")) {
      finalUrl = finalUrl.replace("http://", "https://");
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(finalUrl);
    audioRef.current = audio;
    audio.play().catch(err => console.error("Global Adhan Playback failed:", err));
  };

  useEffect(() => {
    const scheduleNotifications = async () => {
      // Clear existing timers
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      const settings = getSettings();
      if (!settings.notificationsEnabled || !settings.latitude || !settings.longitude) return;
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      try {
        // Fetch times for today
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.method}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const times = data.data.timings;

        const prayerOrder: (keyof PrayerTimesData)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const now = getEffectiveNow(settings);

        prayerOrder.forEach(prayer => {
          if (!settings.enabledPrayers.includes(prayer)) return;

          const timeStr = settings.manualOverrides[prayer] || times[prayer];
          const [hours, minutes] = timeStr.split(":").map(Number);
          const target = new Date(now);
          target.setHours(hours, minutes, 0, 0);

          if (isBefore(target, now)) {
            // Already passed today
            return;
          }

          const delay = target.getTime() - now.getTime();
          const timer = setTimeout(() => {
            const title = `🕌 حان الآن وقت صلاة ${PRAYER_NAMES[prayer]}`;
            const body = `الله أكبر، الله أكبر.. حان الآن موعد أذان صلاة ${PRAYER_NAMES[prayer]}`;

            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(title, {
                  body,
                  icon: "/pwa-192x192.png",
                  tag: `prayer-${prayer}`,
                  dir: "rtl",
                  lang: "ar",
                  renotify: true,
                  vibrate: [200, 100, 200],
                  data: { url: "/prayer-times" }
                } as NotificationOptions);
              });
            } else {
              new Notification(title, { 
                body, 
                icon: "/pwa-192x192.png", 
                tag: `prayer-${prayer}`, 
                dir: "rtl", 
                lang: "ar" 
              });
            }

            playAdhan(settings.adhanSound, PRAYER_NAMES[prayer]);
          }, delay);

          timersRef.current.push(timer);
        });
      } catch (e) {
        console.error("Error scheduling global prayer notifications:", e);
      }
    };

    scheduleNotifications();

    // Re-schedule every 12 hours to stay updated
    const refreshInterval = setInterval(scheduleNotifications, 12 * 60 * 60 * 1000);

    // Listen for STOP_ADHAN message from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'STOP_ADHAN') {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      }
    };
    
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      if (audioRef.current) audioRef.current.pause();
      clearInterval(refreshInterval);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, [i18n.language]);
};
