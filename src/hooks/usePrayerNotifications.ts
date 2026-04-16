import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PRAYER_SETTINGS_KEY, 
  DEFAULT_SETTINGS, 
  PRAYER_NAMES, 
  type PrayerSettings, 
  type PrayerTimesData,
  getEffectiveNow,
} from './usePrayerTimes';
import { isBefore } from 'date-fns';
import { useAdhan } from '@/contexts/AdhanContext';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { storage } from '@/lib/storage';

export const usePrayerNotifications = () => {
  const { i18n } = useTranslation();
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const { playAdhan } = useAdhan();

  const getSettings = async (): Promise<PrayerSettings> => {
    try {
      const stored = await storage.get(PRAYER_SETTINGS_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  };

  useEffect(() => {
    const scheduleNotifications = async () => {
      // Clear existing timers
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      const settings = await getSettings();
      if (!settings.notificationsEnabled || !settings.latitude || !settings.longitude) return;

      // Request permissions for native
      if (Capacitor.isNativePlatform()) {
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      } else {
        const winNotif = (window as any).Notification;
        if (!winNotif) return;
        if (winNotif.permission !== "granted") {
          await winNotif.requestPermission();
        }
      }

      try {
        const now = getEffectiveNow(settings);
        const prayerOrder: (keyof PrayerTimesData)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

        // Helper to fetch and schedule for a specific date
        const fetchAndSchedule = async (date: Date) => {
          const dd = String(date.getDate()).padStart(2, "0");
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const yyyy = date.getFullYear();
          
          const res = await fetch(
            `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.method}`
          );
          if (!res.ok) return;
          const data = await res.json();
          const times = data.data.timings;

          if (Capacitor.isNativePlatform()) {
            // Cancel existing notifications for these prayers
            await LocalNotifications.cancel({
              notifications: prayerOrder.map((_, i) => ({ id: i + 100 }))
            });

            const pendingNotifications = [];

            prayerOrder.forEach((prayer, index) => {
              if (!settings.enabledPrayers.includes(prayer)) return;

              const timeStr = settings.manualOverrides[prayer] || times[prayer];
              const [hours, minutes] = timeStr.split(":").map(Number);
              const target = new Date(date);
              target.setHours(hours, minutes, 0, 0);

              if (isBefore(target, now)) return;

              pendingNotifications.push({
                title: `🕌 حان الآن وقت صلاة ${PRAYER_NAMES[prayer]}`,
                body: `الله أكبر، الله أكبر.. حان الآن موعد أذان صلاة ${PRAYER_NAMES[prayer]}`,
                id: index + 100,
                schedule: { at: target },
                sound: 'adhan.wav', // Assuming adhan.wav is in assets
                attachments: [],
                actionTypeId: '',
                extra: null
              });
            });

            if (pendingNotifications.length > 0) {
              await LocalNotifications.schedule({
                notifications: pendingNotifications
              });
            }
          } else {
            // Web implementation using setTimeout
            prayerOrder.forEach(prayer => {
              if (!settings.enabledPrayers.includes(prayer)) return;

              const timeStr = settings.manualOverrides[prayer] || times[prayer];
              const [hours, minutes] = timeStr.split(":").map(Number);
              const target = new Date(date);
              target.setHours(hours, minutes, 0, 0);

              if (isBefore(target, now)) return;

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
                      vibrate: [200, 100, 200, 100, 200],
                      data: { url: "/prayer-times" }
                    } as NotificationOptions);
                  });
                } else {
                  const winNotif2 = (window as any).Notification;
                  if (winNotif2) {
                    new winNotif2(title, { 
                      body, 
                      icon: "/pwa-192x192.png", 
                      tag: `prayer-${prayer}`, 
                      dir: "rtl", 
                      lang: "ar" 
                    });
                  }
                }

                playAdhan(settings.adhanSound, PRAYER_NAMES[prayer]);
              }, delay);

              timersRef.current.push(timer);
            });
          }
        };

        // Schedule for today and tomorrow
        await fetchAndSchedule(now);
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        await fetchAndSchedule(tomorrow);

      } catch (e) {
        console.error("Error scheduling global prayer notifications:", e);
      }
    };

    scheduleNotifications();

    // Listen for storage changes to update settings
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PRAYER_SETTINGS_KEY) {
        scheduleNotifications();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Re-schedule every 6 hours to stay updated
    const refreshInterval = setInterval(scheduleNotifications, 6 * 60 * 60 * 1000);

    return () => {
      timersRef.current.forEach(clearTimeout);
      clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [i18n.language, playAdhan]);
};
