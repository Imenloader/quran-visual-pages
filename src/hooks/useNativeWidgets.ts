import { useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

export const useNativeWidgets = (verseOfDay: { text: string; surah: string; number: number } | null) => {
  useEffect(() => {
    const syncVerseToNative = async () => {
      if (!verseOfDay) return;

      try {
        await Preferences.set({
          key: 'daily_verse_text',
          value: verseOfDay.text
        });
        await Preferences.set({
          key: 'daily_verse_ref',
          value: `[${verseOfDay.surah}: ${verseOfDay.number}]`
        });
        console.log('Synced daily verse to native widget');
      } catch (error) {
        console.error('Error syncing verse to native:', error);
      }
    };

    syncVerseToNative();
  }, [verseOfDay]);
};
