import { LocalNotifications } from '@capacitor/local-notifications';

export const notificationService = {
  async requestPermission() {
    try {
      // Try Capacitor first
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') return true;
    } catch (e) {
      console.warn('Capacitor notifications not available, falling back to Web API');
    }

    // Fallback to Web Notification API
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  },

  async scheduleReminder(title: string, body: string, date: Date, id: number) {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule: { at: date },
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  },

  async cancelAll() {
    await LocalNotifications.cancel({ notifications: [] });
  }
};
