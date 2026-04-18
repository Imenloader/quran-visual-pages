import { useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const useGoalNotifications = () => {
  useEffect(() => {
    const checkNotifications = async () => {
      const saved = localStorage.getItem("hijri_goals");
      if (!saved) return;
      
      try {
        const goals = JSON.parse(saved);
        const todayStr = format(new Date(), 'dd-MM-yyyy');
        
        const todayGoals = goals[todayStr];
        if (!todayGoals || !Array.isArray(todayGoals)) return;

        const now = new Date();
        const currentTime = format(now, 'HH:mm');

        let updated = false;
        const newTodayGoals = await Promise.all(todayGoals.map(async (goal: { completed: boolean; notifyTime: string; notified: boolean; text: string }) => {
          if (!goal.completed && goal.notifyTime === currentTime && !goal.notified) {
            
            if (Capacitor.isNativePlatform()) {
              const status = await LocalNotifications.checkPermissions();
              if (status.display === 'granted') {
                await LocalNotifications.schedule({
                  notifications: [
                    {
                      title: 'تذكير بالهدف',
                      body: goal.text,
                      id: Math.floor(Math.random() * 100000),
                      schedule: { at: new Date() },
                      extra: { url: "/hijri" }
                    }
                  ]
                });
              }
            } else {
              const winNotif = (window as unknown as { Notification: typeof Notification }).Notification;
              if (winNotif && winNotif.permission === 'granted') {
                new winNotif('تذكير بالهدف', { body: goal.text, icon: '/icon-192x192.png' });
              }
            }
            
            toast.info(`تذكير بهدف اليوم: ${goal.text}`);
            updated = true;
            return { ...goal, notified: true };
          }
          return goal;
        }));

        if (updated) {
          goals[todayStr] = newTodayGoals;
          localStorage.setItem("hijri_goals", JSON.stringify(goals));
          window.dispatchEvent(new Event('hijri_goals_updated'));
        }
      } catch (e) {
        console.error("Error parsing goals for notifications", e);
      }
    };

    const interval = setInterval(checkNotifications, 60000);
    checkNotifications(); // Check immediately on mount

    return () => clearInterval(interval);
  }, []);
};
