import { Preferences } from '@capacitor/preferences';

export interface WidgetData {
  dailyVerse?: string;
  dailyVerseTranslation?: string;
  dailyVerseSurah?: string;
  nextPrayerName?: string;
  nextPrayerTime?: string;
  hijriDate?: string;
}

export const widgetBridge = {
  /**
   * Syncs app data into native SharedPreferences/UserDefaults
   * so that native widgets (Android/iOS) can read it without booting the webview.
   */
  async syncWidgetData(data: Partial<WidgetData>) {
    try {
      if (data.dailyVerse) await Preferences.set({ key: 'widget_dailyVerse', value: data.dailyVerse });
      if (data.dailyVerseTranslation) await Preferences.set({ key: 'widget_dailyVerseTranslation', value: data.dailyVerseTranslation });
      if (data.dailyVerseSurah) await Preferences.set({ key: 'widget_dailyVerseSurah', value: data.dailyVerseSurah });
      if (data.nextPrayerName) await Preferences.set({ key: 'widget_nextPrayerName', value: data.nextPrayerName });
      if (data.nextPrayerTime) await Preferences.set({ key: 'widget_nextPrayerTime', value: data.nextPrayerTime });
      if (data.hijriDate) await Preferences.set({ key: 'widget_hijriDate', value: data.hijriDate });
      
      console.log('Widget data synced to native preferences successfully');
    } catch (error) {
      console.error('Failed to sync widget data:', error);
    }
  }
};
