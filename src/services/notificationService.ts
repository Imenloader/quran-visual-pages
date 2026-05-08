import { LocalNotifications } from '@capacitor/local-notifications';

export const notificationService = {
  async requestPermission() {
    try {
      const perm = await LocalNotifications.requestPermissions();
      return perm.display === 'granted';
    } catch (e) {
      console.warn('Capacitor notifications not available, falling back to Web API');
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }
    return false;
  },

  async scheduleReminder(title: string, body: string, date: Date, id: string) {
    try {
      const numericId = Math.abs(this.hashCode(id));
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: numericId,
            schedule: { at: date },
            sound: 'default',
            actionTypeId: 'OPEN_APP',
          },
        ],
      });
      return true;
    } catch (e) {
      console.error('Failed to schedule notification:', e);
      return false;
    }
  },

  async triggerPeerNudge(title: string, body: string, sound: string = 'adhan.mp3') {
    try {
      // For Capacitor (Android/iOS)
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 1000000),
            schedule: { at: new Date(Date.now() + 100) },
            sound: sound,
            actionTypeId: 'OPEN_APP',
          },
        ],
      });

      // For Web (if in foreground)
      if (typeof window !== 'undefined' && 'Audio' in window) {
        const audio = new Audio(`/assets/audio/${sound}`);
        audio.play().catch(e => console.warn('Sound play failed:', e));
      }

      return true;
    } catch (e) {
      console.error('Failed to trigger peer nudge:', e);
      return false;
    }
  },

  async cancelReminder(id: string) {
    try {
      const numericId = Math.abs(this.hashCode(id));
      await LocalNotifications.cancel({ notifications: [{ id: numericId }] });
    } catch (e) {
      console.error('Failed to cancel notification:', e);
    }
  },

  hashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
};
