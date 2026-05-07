
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
import { isBefore, addDays } from 'date-fns';
import { useAdhan } from '@/contexts/AdhanContext';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { storage } from '@/lib/storage';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { DateTime } from 'luxon';

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
      // Clear existing timers (Web)
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      const settings = await getSettings();
      if (!settings.notificationsEnabled || !settings.latitude || !settings.longitude) return;

      console.log("[PrayerNotif] Starting scheduling...", { lat: settings.latitude, lng: settings.longitude });

      // Request permissions & Setup Channels
      if (Capacitor.isNativePlatform()) {
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
          const request = await LocalNotifications.requestPermissions();
          if (request.display !== 'granted') {
            console.warn("[PrayerNotif] Permission denied");
            return;
          }
        }

        // Create/Update Channel for Adhan
        await LocalNotifications.createChannel({
          id: 'adhan-notifications',
          name: 'تنبيهات الأذان',
          description: 'تنبيهات مواقيت الصلاة مع صوت الأذان',
          importance: 5,
          visibility: 1,
          sound: Capacitor.getPlatform() === 'android' ? 'adhan' : 'adhan.mp3', 
          vibration: true,
        });
      } else {
        const winNotif = (window as any).Notification;
        if (winNotif && winNotif.permission !== "granted") {
          await winNotif.requestPermission();
        }
      }

      try {
        const now = getEffectiveNow(settings);
        const prayerOrder: (keyof PrayerTimesData)[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

        // Helper to calculate times locally using 'adhan' library
        const calculateLocalTimes = (date: Date) => {
          const coords = new Coordinates(settings.latitude!, settings.longitude!);
          const methodMap: Record<number, any> = {
            1: CalculationMethod.Karachi(),
            2: CalculationMethod.NorthAmerica(),
            3: CalculationMethod.MuslimWorldLeague(),
            4: CalculationMethod.UmmAlQura(),
            5: CalculationMethod.Egyptian(),
            7: CalculationMethod.Tehran(),
            8: CalculationMethod.Dubai(),
            10: CalculationMethod.Qatar(),
            11: CalculationMethod.Singapore(),
            12: CalculationMethod.Other(),
            13: CalculationMethod.Turkey(),
            14: CalculationMethod.Dubai(),
            15: CalculationMethod.MoonsightingCommittee(),
            16: CalculationMethod.Singapore(),
            99: CalculationMethod.UmmAlQura(),
          };
          
          const params = methodMap[settings.method] || CalculationMethod.UmmAlQura();
          const prayerTimes = new PrayerTimes(coords, date, params);
          
          return {
            Fajr: DateTime.fromJSDate(prayerTimes.fajr).toFormat('HH:mm'),
            Sunrise: DateTime.fromJSDate(prayerTimes.sunrise).toFormat('HH:mm'),
            Dhuhr: DateTime.fromJSDate(prayerTimes.dhuhr).toFormat('HH:mm'),
            Asr: DateTime.fromJSDate(prayerTimes.asr).toFormat('HH:mm'),
            Maghrib: DateTime.fromJSDate(prayerTimes.maghrib).toFormat('HH:mm'),
            Isha: DateTime.fromJSDate(prayerTimes.isha).toFormat('HH:mm'),
          };
        };

        const scheduleForDate = async (date: Date) => {
          let times: any;
          
          try {
            const dd = String(date.getDate()).padStart(2, "0");
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const yyyy = date.getFullYear();
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const res = await fetch(
              `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.method}`,
              { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            
            if (res.ok) {
              const data = await res.json();
              times = data.data.timings;
              await storage.set(`prayer_cache_${dd}_${mm}_${yyyy}`, JSON.stringify(times));
            } else {
              throw new Error("API failed");
            }
          } catch (e) {
            console.warn("[PrayerNotif] API failed, falling back to local calculation or cache");
            const dd = String(date.getDate()).padStart(2, "0");
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const yyyy = date.getFullYear();
            const cached = await storage.get(`prayer_cache_${dd}_${mm}_${yyyy}`);
            times = cached ? JSON.parse(cached) : calculateLocalTimes(date);
          }

          if (Capacitor.isNativePlatform()) {
            const pendingNotifications: any[] = [];

            prayerOrder.forEach((prayer, index) => {
              if (!settings.enabledPrayers.includes(prayer)) return;

              const timeStr = settings.manualOverrides[prayer] || times[prayer];
              const [hours, minutes] = timeStr.split(":").map(Number);
              const target = new Date(date);
              target.setHours(hours, minutes, 0, 0);

              if (isBefore(target, now)) return;

              const prayerID = (date.getDate() * 10) + index; 

              pendingNotifications.push({
                title: `🕌 حان الآن وقت صلاة ${PRAYER_NAMES[prayer]}`,
                body: `حان موعد أذان صلاة ${PRAYER_NAMES[prayer]} بتوقيت ${settings.cityName || 'موقعك'}`,
                id: prayerID + 1000,
                schedule: { at: target, allowPause: false, alwaysShow: true, repeats: false },
                sound: Capacitor.getPlatform() === 'android' ? 'adhan' : 'adhan.mp3', // Android usually expects resource name without extension
                channelId: 'adhan-notifications',
                smallIcon: 'ic_launcher',
                extra: { prayer, type: 'adhan', url: "/prayer-times" }
              });

              if (settings.prePrayerNotification && prayer !== "Sunrise") {
                const preTarget = new Date(target);
                preTarget.setMinutes(preTarget.getMinutes() - settings.prePrayerMinutes);
                
                if (!isBefore(preTarget, now)) {
                  pendingNotifications.push({
                    title: `🔔 اقترب موعد صلاة ${PRAYER_NAMES[prayer]}`,
                    body: `بقي ${settings.prePrayerMinutes} دقائق على أذان صلاة ${PRAYER_NAMES[prayer]}`,
                    id: prayerID + 2000,
                    schedule: { at: preTarget, allowPause: false, alwaysShow: true },
                    smallIcon: 'ic_launcher',
                    extra: { prayer, type: 'pre', url: "/prayer-times" }
                  });
                }
              }
            });

            if (pendingNotifications.length > 0) {
              await LocalNotifications.schedule({ notifications: pendingNotifications });
            }
          } else {
            prayerOrder.forEach((prayer) => {
              if (!settings.enabledPrayers.includes(prayer)) return;

              const timeStr = settings.manualOverrides[prayer] || times[prayer];
              const [hours, minutes] = timeStr.split(":").map(Number);
              const target = new Date(date);
              target.setHours(hours, minutes, 0, 0);

              if (isBefore(target, now)) return;

              const delay = target.getTime() - now.getTime();
              const timer = setTimeout(() => {
                const title = `🕌 صلاة ${PRAYER_NAMES[prayer]}`;
                const body = `حان الآن موعد أذان صلاة ${PRAYER_NAMES[prayer]}`;

                if ("serviceWorker" in navigator) {
                  navigator.serviceWorker.ready.then((reg) => {
                    reg.showNotification(title, {
                      body,
                      icon: "/pwa-192x192.png",
                      badge: "/pwa-192x192.png",
                      tag: `prayer-${prayer}-${date.toDateString()}`,
                      dir: "rtl",
                      lang: "ar",
                      renotify: true,
                      vibrate: [200, 100, 200, 100, 200],
                      data: { url: "/prayer-times" }
                    } as any);
                  });
                } else {
                  const winNotif = (window as any).Notification;
                  if (winNotif?.permission === "granted") {
                    new winNotif(title, { body, icon: "/pwa-192x192.png", dir: "rtl" });
                  }
                }
                playAdhan(settings.adhanSound, PRAYER_NAMES[prayer]);
              }, delay);
              timersRef.current.push(timer);
            });
          }
        };

        if (Capacitor.isNativePlatform()) {
          const pending = await LocalNotifications.getPending();
          if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
          }
        }

        for (let i = 0; i < 7; i++) {
          await scheduleForDate(addDays(now, i));
        }

        console.log("[PrayerNotif] Scheduling completed successfully");
      } catch (e) {
        console.error("[PrayerNotif] Critical error in scheduling:", e);
      }
    };

    scheduleNotifications();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PRAYER_SETTINGS_KEY) scheduleNotifications();
    };
    window.addEventListener('storage', handleStorageChange);

    // Listen for app state changes to ensure notifications are up to date when returning to foreground
    let appStateListener: any;
    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          console.log("[PrayerNotif] App became active, refreshing schedule...");
          scheduleNotifications();
        }
      }).then(l => appStateListener = l);
    }

    const refreshInterval = setInterval(scheduleNotifications, 12 * 60 * 60 * 1000); 

    return () => {
      timersRef.current.forEach(clearTimeout);
      clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
      if (appStateListener) appStateListener.remove();
    };
  }, [i18n.language, playAdhan]);
};
