import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const useKhatmaNotifications = () => {
  const { i18n } = useTranslation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scheduleNotification = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const saved = localStorage.getItem("khatma-settings");
      if (!saved) return;

      try {
        const { notificationsEnabled, reminderTime } = JSON.parse(saved);
        if (!notificationsEnabled || !reminderTime) return;

        const winNotif = (window as any).Notification;
        if (!winNotif || winNotif.permission !== "granted") return;

        const [hours, minutes] = reminderTime.split(":").map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);

        if (target.getTime() <= now.getTime()) {
          target.setDate(target.getDate() + 1);
        }

        const delay = target.getTime() - now.getTime();

        timerRef.current = setTimeout(() => {
          const title = i18n.language === 'ar' ? "📖 وردك اليومي" : "📖 Your Daily Wird";
          const body = i18n.language === 'ar' 
            ? "حان الوقت لقراءة وردك اليومي من القرآن الكريم. لا تنسَ نصيبك من الذكر."
            : "It's time for your daily Quran reading. Don't forget your portion of remembrance.";

          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, {
                body,
                icon: "/pwa-192x192.png",
                tag: "khatma-reminder",
                dir: "rtl",
                lang: "ar",
                renotify: true,
              });
            });
          } else {
            const winNotif2 = (window as any).Notification;
            if (winNotif2) {
              new winNotif2(title, {
                body,
                icon: "/pwa-192x192.png",
              });
            }
          }

          // Reschedule for next day
          scheduleNotification();
        }, delay);
      } catch (e) {
        console.error("Error parsing khatma settings:", e);
      }
    };

    scheduleNotification();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [i18n.language]);
};
