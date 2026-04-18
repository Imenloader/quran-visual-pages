import { useState, useEffect, useCallback, useRef } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { addDays, isBefore } from "date-fns";
import { dailyVerses } from "../data/dailyVersesData";
import { ATHKAR_DATA } from "../data/athkarData";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { storage } from '@/lib/storage';

const CAIRO_TZ = "Africa/Cairo";
const NOTIF_SETTINGS_KEY = "quran-notification-settings";

export interface NotificationSettings {
  athkarMorning: boolean;
  athkarEvening: boolean;
  quranReading: boolean;
  athkarMorningTime: string; // HH:MM
  athkarEveningTime: string;
  quranReadingTime: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  athkarMorning: false,
  athkarEvening: false,
  quranReading: false,
  athkarMorningTime: "06:00",
  athkarEveningTime: "17:00",
  quranReadingTime: "21:00",
};

// ... constants ...

const ATHKAR_MORNING_MESSAGES = [
  "🌅 حان وقت أذكار الصباح - ابدأ يومك بذكر الله",
  "☀️ أذكار الصباح - أصبحنا وأصبح الملك لله",
  "🤲 لا تنسَ أذكار الصباح - حصّن نفسك بذكر الله",
];

const ATHKAR_EVENING_MESSAGES = [
  "🌙 حان وقت أذكار المساء - أمسينا وأمسى الملك لله",
  "🌆 أذكار المساء - ختم يومك بذكر الله",
  "🤲 لا تنسَ أذكار المساء - حصّن نفسك بذكر الله",
];

const QURAN_READING_MESSAGES = [
  "📖 حان وقت ورد القرآن اليومي - اقرأ ولو آية",
  "🕌 لا تنسَ ورد القرآن - إن هذا القرآن يهدي للتي هي أقوم",
  "📖 وقت القراءة - خير ما تقضي فيه وقتك هو كتاب الله",
];

const getRandomMessage = (messages: string[]) =>
  messages[Math.floor(Math.random() * messages.length)];

const getRandomDailyVerse = () => {
  const verse = dailyVerses[Math.floor(Math.random() * dailyVerses.length)];
  return {
    title: `آية اليوم: ${verse.surahName}`,
    body: `${verse.text}\n\n${verse.translation}`,
    url: `/quran?surah=${verse.surahNumber}&verse=${verse.verseNumber}`,
  };
};

const getRandomAthkar = (type: "morning" | "evening") => {
  const category = ATHKAR_DATA.find((c) => c.id === type);
  if (!category) return { title: "أذكار", body: "حان وقت الأذكار", url: "/athkar" };
  const dhikr = category.athkar[Math.floor(Math.random() * category.athkar.length)];
  return {
    title: category.title,
    body: dhikr.text.length > 100 ? dhikr.text.substring(0, 97) + "..." : dhikr.text,
    url: `/athkar/${type}`,
  };
};

const getSettings = async (): Promise<NotificationSettings> => {
  try {
    const stored = await storage.get(NOTIF_SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = async (settings: NotificationSettings) => {
  await storage.set(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
};

const getPermission = async (): Promise<boolean> => {
  if (Capacitor.isNativePlatform()) {
    const status = await LocalNotifications.checkPermissions();
    if (status.display === 'granted') return true;
    const request = await LocalNotifications.requestPermissions();
    return request.display === 'granted';
  }

  const winNotif = (window as unknown as { Notification: typeof Notification }).Notification;
  if (!winNotif) return false;
  if (winNotif.permission === "granted") return true;
  if (winNotif.permission === "denied") return false;
  const result = await winNotif.requestPermission();
  return result === "granted";
};

const showNotification = async (title: string, body: string, tag: string, url: string = "/") => {
  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Math.floor(Math.random() * 10000),
          schedule: { at: new Date() },
          extra: { url }
        }
      ]
    });
    return;
  }

  const winNotif = (window as unknown as { Notification: typeof Notification }).Notification;
  if (!winNotif || winNotif.permission !== "granted") return;

  const options: NotificationOptions = {
    body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag,
    dir: "rtl",
    lang: "ar",
    renotify: true,
    data: { url },
  };

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, options);
  } else {
    new winNotif(title, options);
  }
};

const getMsUntilTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const nowInCairoStr = formatInTimeZone(now, CAIRO_TZ, "yyyy-MM-dd HH:mm:ss");
  const cairoNow = new Date(nowInCairoStr);
  let targetCairo = new Date(cairoNow);
  targetCairo.setHours(hours, minutes, 0, 0);
  if (isBefore(targetCairo, cairoNow)) {
    targetCairo = addDays(targetCairo, 1);
  }
  return targetCairo.getTime() - cairoNow.getTime();
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const init = async () => {
      const s = await getSettings();
      setSettings(s);
      
      if (Capacitor.isNativePlatform()) {
        const status = await LocalNotifications.checkPermissions();
        setPermissionState(status.display === 'granted' ? 'granted' : (status.display === 'denied' ? 'denied' : 'default'));
      } else {
        const winNotif = (window as unknown as { Notification: typeof Notification }).Notification;
        setPermissionState(winNotif ? winNotif.permission : "denied");
      }
    };
    init();
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const scheduleLocalNotification = useCallback(
    async (timeStr: string, id: number, title: string, body: string, url: string) => {
      if (!Capacitor.isNativePlatform()) return;

      const [hours, minutes] = timeStr.split(":").map(Number);
      const now = new Date();
      let target = new Date(now);
      target.setHours(hours, minutes, 0, 0);
      if (isBefore(target, now)) {
        target = addDays(target, 1);
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: target, repeats: true, every: 'day' },
            extra: { url }
          }
        ]
      });
    },
    []
  );

  const scheduleNotification = useCallback(
    (timeStr: string, tag: string, getNotifData: () => { title: string; body: string; url: string }) => {
      if (Capacitor.isNativePlatform()) return; // Native uses system scheduler

      const ms = getMsUntilTime(timeStr);
      const timer = setTimeout(() => {
        const { title, body, url } = getNotifData();
        showNotification(title, body, tag, url);
        const nextTimer = setTimeout(() => {
          scheduleNotification(timeStr, tag, getNotifData);
        }, 100);
        timersRef.current.push(nextTimer);
      }, ms);
      timersRef.current.push(timer);
    },
    []
  );

  const setupTimers = useCallback(async () => {
    clearAllTimers();
    if (permissionState !== "granted") return;

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.cancel({ notifications: [{ id: 1001 }, { id: 1002 }, { id: 1003 }] });
      
      if (settings.athkarMorning) {
        const data = getRandomAthkar("morning");
        await scheduleLocalNotification(settings.athkarMorningTime, 1001, data.title, data.body, data.url);
      }
      if (settings.athkarEvening) {
        const data = getRandomAthkar("evening");
        await scheduleLocalNotification(settings.athkarEveningTime, 1002, data.title, data.body, data.url);
      }
      if (settings.quranReading) {
        const data = getRandomDailyVerse();
        await scheduleLocalNotification(settings.quranReadingTime, 1003, data.title, data.body, data.url);
      }
    } else {
      if (settings.athkarMorning) {
        scheduleNotification(
          settings.athkarMorningTime,
          "athkar-morning",
          () => getRandomAthkar("morning")
        );
      }
      if (settings.athkarEvening) {
        scheduleNotification(
          settings.athkarEveningTime,
          "athkar-evening",
          () => getRandomAthkar("evening")
        );
      }
      if (settings.quranReading) {
        scheduleNotification(
          settings.quranReadingTime,
          "quran-reading",
          getRandomDailyVerse
        );
      }
    }
  }, [settings, permissionState, clearAllTimers, scheduleNotification, scheduleLocalNotification]);

  useEffect(() => {
    setupTimers();
    return clearAllTimers;
  }, [setupTimers, clearAllTimers]);

  const updateSettings = useCallback(
    async (partial: Partial<NotificationSettings>) => {
      // Check if any notification is being enabled
      const beingEnabled = 
        (partial.athkarMorning === true && !settings.athkarMorning) ||
        (partial.athkarEvening === true && !settings.athkarEvening) ||
        (partial.quranReading === true && !settings.quranReading);

      if (beingEnabled) {
        const granted = await getPermission();
        if (!granted) {
          // Force set all that were requested as true back to false or current state
          if (partial.athkarMorning === true) partial.athkarMorning = false;
          if (partial.athkarEvening === true) partial.athkarEvening = false;
          if (partial.quranReading === true) partial.quranReading = false;
        }
      }

      setSettings((prev) => {
        const next = { ...prev, ...partial };
        saveSettings(next);
        return next;
      });
    },
    [settings]
  );

  const requestPermission = useCallback(async () => {
    const granted = await getPermission();
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      setPermissionState(status.display === 'granted' ? 'granted' : (status.display === 'denied' ? 'denied' : 'default'));
    } else {
      const winNotif = (window as unknown as { Notification: typeof Notification }).Notification;
      setPermissionState(winNotif ? winNotif.permission : "denied");
    }
    return granted;
  }, []);

  const testNotification = useCallback(
    (type: "athkarMorning" | "athkarEvening" | "quranReading") => {
      if (type === "athkarMorning") {
        const { title, body, url } = getRandomAthkar("morning");
        showNotification(title, body, "test-morning", url);
      } else if (type === "athkarEvening") {
        const { title, body, url } = getRandomAthkar("evening");
        showNotification(title, body, "test-evening", url);
      } else if (type === "quranReading") {
        const { title, body, url } = getRandomDailyVerse();
        showNotification(title, body, "test-quran", url);
      }
    },
    []
  );

  return {
    settings,
    updateSettings,
    permissionState,
    requestPermission,
    testNotification,
    isSupported: Capacitor.isNativePlatform() || !!(window as unknown as { Notification: typeof Notification }).Notification,
  };
}
