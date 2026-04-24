import { useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { toArabicNumber } from '@/data/quranData';

export const useNativeWidgets = (verseOfDay: { text: string; surah: string; number: number } | null) => {
  useEffect(() => {
    const syncVerseToNative = async () => {
      if (!verseOfDay || !Capacitor.isNativePlatform()) return;

      try {
        const text = verseOfDay.text || "";
        const surah = verseOfDay.surah || "";
        const num = verseOfDay.number || 0;
        
        await Preferences.set({
          key: 'daily_verse_text',
          value: text
        });
        
        await Preferences.set({
          key: 'daily_verse_ref',
          value: `[${surah}: ${toArabicNumber(num)}]`
        });
        
        console.log('Synced daily verse to native widget:', surah, num);
      } catch (error) {
        console.error('Error syncing verse to native:', error);
      }
    };

    syncVerseToNative();
  }, [verseOfDay]);
};
