import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * useQanetNotifications
 * 
 * Schedules a daily reminder notification for Qiyam Al-Layl.
 * - Native (Android/iOS): Uses @capacitor/local-notifications
 * - Web: Uses setTimeout + Notification API
 * 
 * Mirrors the pattern from usePrayerNotifications.ts
 */
export const useQanetNotifications = (enabled: boolean, reminderTime: string) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduledRef = useRef(false);

  useEffect(() => {
    if (!enabled || !reminderTime) {
      // Clear any existing scheduled notifications
      clearTimeout(timeoutRef.current!);
      scheduledRef.current = false;
      return;
    }

    const scheduleNotification = async () => {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      
      if (Capacitor.isNativePlatform()) {
        // Native: Use Capacitor LocalNotifications
        try {
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          
          // Cancel any existing qanet notifications (IDs 9000-9001)
          await LocalNotifications.cancel({ notifications: [{ id: 9000 }] }).catch(() => {});

          // Schedule the notification
          const now = new Date();
          const scheduledDate = new Date();
          scheduledDate.setHours(hours, minutes, 0, 0);
          
          // If the time has passed today, schedule for tomorrow
          if (scheduledDate <= now) {
            scheduledDate.setDate(scheduledDate.getDate() + 1);
          }

          await LocalNotifications.schedule({
            notifications: [{
              id: 9000,
              title: 'من القانتين 🌙',
              body: 'حان وقت قيام الليل! "من قام بمائة آية كُتب من القانتين"',
              schedule: {
                at: scheduledDate,
                repeats: true,
                every: 'day',
              },
              channelId: 'qanet-reminders',
              sound: 'default',
              smallIcon: 'ic_stat_icon_config_sample',
              largeIcon: 'ic_launcher',
            }],
          });

          // Create notification channel for Android
          try {
            await LocalNotifications.createChannel({
              id: 'qanet-reminders',
              name: 'تذكير قيام الليل',
              description: 'تذكير يومي بقيام الليل',
              importance: 4, // HIGH
              sound: 'default',
              vibration: true,
            });
          } catch {
            // Channel might already exist
          }

          console.log('[Qanet] Native notification scheduled at', reminderTime);
        } catch (e) {
          console.warn('[Qanet] Failed to schedule native notification:', e);
        }
      } else {
        // Web: Use setTimeout + Notification API
        const scheduleWebNotification = () => {
          const now = new Date();
          const target = new Date();
          target.setHours(hours, minutes, 0, 0);
          
          if (target <= now) {
            target.setDate(target.getDate() + 1);
          }
          
          const delay = target.getTime() - now.getTime();
          
          clearTimeout(timeoutRef.current!);
          timeoutRef.current = setTimeout(() => {
            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    title: 'من القانتين 🌙',
                    body: 'حان وقت قيام الليل! "من قام بمائة آية كُتب من القانتين"',
                    tag: 'qanet-reminder',
                  });
                } else {
                  new Notification('من القانتين 🌙', {
                    body: 'حان وقت قيام الليل! "من قام بمائة آية كُتب من القانتين"',
                    icon: '/icon-192x192.png',
                    tag: 'qanet-reminder',
                  });
                }
              } catch (e) {
                console.warn('[Qanet] Web notification failed:', e);
              }
            }

            // Re-schedule for next day
            scheduleWebNotification();
          }, delay);

          console.log('[Qanet] Web notification scheduled in', Math.round(delay / 60000), 'minutes');
        };

        scheduleWebNotification();
      }
    };

    scheduleNotification();

    return () => {
      clearTimeout(timeoutRef.current!);
    };
  }, [enabled, reminderTime]);
};
