import { LocalNotifications } from '@capacitor/local-notifications';

export const notificationService = {
  async requestPermission() {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
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
