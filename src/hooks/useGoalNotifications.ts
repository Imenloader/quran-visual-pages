import { useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const useGoalNotifications = () => {
  useEffect(() => {
    const checkNotifications = () => {
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
        const newTodayGoals = todayGoals.map((goal: { completed: boolean; notifyTime: string; notified: boolean; text: string }) => {
          if (!goal.completed && goal.notifyTime === currentTime && !goal.notified) {
            if (Notification.permission === 'granted') {
              new Notification('تذكير بالهدف', { body: goal.text, icon: '/icon-192x192.png' });
            }
            toast.info(`تذكير بهدف اليوم: ${goal.text}`);
            updated = true;
            return { ...goal, notified: true };
          }
          return goal;
        });

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
