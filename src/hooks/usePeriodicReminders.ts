import { useEffect, useRef } from "react";
import { ATHKAR_DATA } from "@/data/athkarData";
import { useTranslation } from "react-i18next";

const PERIODIC_SETTINGS_KEY = "periodic-reminders-settings";

interface PeriodicSettings {
  enabled: boolean;
  interval: number; // in minutes
}

const defaultSettings: PeriodicSettings = {
  enabled: false,
  interval: 15,
};

export const usePeriodicReminders = () => {
  const { t, i18n } = useTranslation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getSettings = (): PeriodicSettings => {
    try {
      const saved = localStorage.getItem(PERIODIC_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  };

  const showNotification = (title: string, body: string) => {
    const winNotif = (window as any).Notification;
    if (!winNotif) return;

    if (winNotif.permission === "granted") {
      new winNotif(title, {
        body,
        icon: "/pwa-192x192.png",
      });
    } else if (winNotif.permission !== "denied") {
      winNotif.requestPermission().then((permission: string) => {
        if (permission === "granted") {
          new winNotif(title, {
            body,
            icon: "/pwa-192x192.png",
          });
        }
      });
    }
  };

  const triggerReminder = () => {
    const settings = getSettings();
    if (!settings.enabled) return;

    // Pick a random category and then a random dhikr
    const category = ATHKAR_DATA[Math.floor(Math.random() * ATHKAR_DATA.length)];
    const dhikr = category.athkar[Math.floor(Math.random() * category.athkar.length)];

    const title = i18n.language === "ar" ? "تذكير إيماني" : "Spiritual Reminder";
    showNotification(title, dhikr.text);
  };

  useEffect(() => {
    const settings = getSettings();
    
    if (settings.enabled) {
      // Set up the interval
      const intervalMs = settings.interval * 60 * 1000;
      
      timerRef.current = setInterval(() => {
        triggerReminder();
      }, intervalMs);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to update settings and restart timer
  const updateSettings = (newSettings: Partial<PeriodicSettings>) => {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(PERIODIC_SETTINGS_KEY, JSON.stringify(updated));

    // Restart timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (updated.enabled) {
      const intervalMs = updated.interval * 60 * 1000;
      timerRef.current = setInterval(() => {
        triggerReminder();
      }, intervalMs);
    }
  };

  return { getSettings, updateSettings };
};
