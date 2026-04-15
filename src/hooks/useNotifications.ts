import { useState, useEffect, useCallback, useRef } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { addDays, isBefore } from "date-fns";
import { dailyVerses } from "../data/dailyVersesData";
import { ATHKAR_DATA } from "../data/athkarData";

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

const getSettings = (): NotificationSettings => {
  try {
    const stored = localStorage.getItem(NOTIF_SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings: NotificationSettings) => {
  localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
};

const getPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};

const showNotification = (title: string, body: string, tag: string, url: string = "/") => {
  if (Notification.permission !== "granted") return;

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

  // Try service worker notification first (works in background)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, options);
    });
  } else {
    new Notification(title, options);
  }
};

const getMsUntilTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  // Get current time in Cairo
  const now = new Date();
  const nowInCairoStr = formatInTimeZone(now, CAIRO_TZ, "yyyy-MM-dd HH:mm:ss");
  const cairoNow = new Date(nowInCairoStr);

  // Create target time in Cairo
  let targetCairo = new Date(cairoNow);
  targetCairo.setHours(hours, minutes, 0, 0);

  // If time has passed today in Cairo, schedule for tomorrow
  if (isBefore(targetCairo, cairoNow)) {
    targetCairo = addDays(targetCairo, 1);
  }

  // The delay is the difference between target Cairo time and current Cairo time
  return targetCairo.getTime() - cairoNow.getTime();
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(getSettings);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const scheduleNotification = useCallback(
    (timeStr: string, tag: string, getNotifData: () => { title: string; body: string; url: string }) => {
      const ms = getMsUntilTime(timeStr);
      const timer = setTimeout(() => {
        const { title, body, url } = getNotifData();
        showNotification(title, body, tag, url);
        // Reschedule for next day
        const nextTimer = setTimeout(() => {
          scheduleNotification(timeStr, tag, getNotifData);
        }, 100);
        timersRef.current.push(nextTimer);
      }, ms);
      timersRef.current.push(timer);
    },
    []
  );

  const setupTimers = useCallback(() => {
    clearAllTimers();
    if (permissionState !== "granted") return;

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
  }, [settings, permissionState, clearAllTimers, scheduleNotification]);

  useEffect(() => {
    setupTimers();
    return clearAllTimers;
  }, [setupTimers, clearAllTimers]);

  const updateSettings = useCallback(
    (partial: Partial<NotificationSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  const requestPermission = useCallback(async () => {
    const granted = await getPermission();
    setPermissionState(granted ? "granted" : "denied");
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
    isSupported: "Notification" in window,
  };
}
