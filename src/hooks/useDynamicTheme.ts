import { useEffect, useState } from 'react';
import { usePrayerTimes } from './usePrayerTimes';
import { useTheme } from '@/contexts/ThemeContext';
import { parseTime } from '@/lib/utils';

export type DayPhase = 'fajr' | 'day' | 'asr' | 'maghrib' | 'isha';

export const useDynamicTheme = () => {
  const { times, settings } = usePrayerTimes();
  const { atmosphericBackground } = useTheme();
  const [phase, setPhase] = useState<DayPhase>('day');

  useEffect(() => {
    if (!times || !atmosphericBackground) return;

    const updatePhase = () => {
      const now = new Date();
      const fajr = parseTime(times.Fajr, now);
      const sunrise = parseTime(times.Sunrise, now);
      const dhuhr = parseTime(times.Dhuhr, now);
      const asr = parseTime(times.Asr, now);
      const maghrib = parseTime(times.Maghrib, now);
      const isha = parseTime(times.Isha, now);

      if (now >= fajr && now < sunrise) setPhase('fajr');
      else if (now >= sunrise && now < asr) setPhase('day');
      else if (now >= asr && now < maghrib) setPhase('asr');
      else if (now >= maghrib && now < isha) setPhase('maghrib');
      else setPhase('isha');
    };

    updatePhase();
    const interval = setInterval(updatePhase, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [times, atmosphericBackground]);

  useEffect(() => {
    if (!atmosphericBackground) {
      document.documentElement.style.removeProperty('--dynamic-bg-top');
      document.documentElement.style.removeProperty('--dynamic-bg-bottom');
      document.documentElement.style.removeProperty('--dynamic-accent');
      return;
    }

    const themeColors: Record<DayPhase, { top: string; bottom: string; accent: string }> = {
      fajr: { top: '#ffecd2', bottom: '#fcb69f', accent: '#f6ad55' }, // Peach / Gold
      day: { top: '#e0f2f1', bottom: '#ffffff', accent: '#10b981' }, // Bright / Emerald
      asr: { top: '#fef3c7', bottom: '#fbbf24', accent: '#d97706' }, // Warm Gold / Amber
      maghrib: { top: '#4c1d95', bottom: '#db2777', accent: '#f472b6' }, // Purple / Sunset
      isha: { top: '#0f172a', bottom: '#1e293b', accent: '#38bdf8' }, // Deep Blue / Sky
    };

    const colors = themeColors[phase];
    document.documentElement.style.setProperty('--dynamic-bg-top', colors.top);
    document.documentElement.style.setProperty('--dynamic-bg-bottom', colors.bottom);
    document.documentElement.style.setProperty('--dynamic-accent', colors.accent);
    
    // Add a transition class for smooth color shifting
    document.documentElement.classList.add('theme-transitioning');
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [phase, atmosphericBackground]);

  return { phase };
};
