import { useEffect, useState } from 'react';
import { usePrayerTimes } from './usePrayerTimes';
import { useTheme } from '@/contexts/ThemeContext';
import { parseTime } from '@/lib/utils';

export type DayPhase = 'fajr' | 'day' | 'asr' | 'maghrib' | 'isha';

export const useDynamicTheme = (forceEnable: boolean = false) => {
  const { times } = usePrayerTimes();
  const { atmosphericBackground } = useTheme();
  const [phase, setPhase] = useState<DayPhase>('day');
  const active = atmosphericBackground || forceEnable;

  useEffect(() => {
    if (!times || !active) return;

    const updatePhase = () => {
      const now = new Date();
      const fajr = parseTime(times.Fajr, now);
      const sunrise = parseTime(times.Sunrise, now);
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
    const interval = setInterval(updatePhase, 60000);
    return () => clearInterval(interval);
  }, [times, active]);

  useEffect(() => {
    if (!active) {
      document.documentElement.style.removeProperty('--dynamic-bg-top');
      document.documentElement.style.removeProperty('--dynamic-bg-bottom');
      document.documentElement.style.removeProperty('--dynamic-accent');
      return;
    }

    const themeColors: Record<DayPhase, { top: string; bottom: string; accent: string }> = {
      fajr: { top: '#ffecd2', bottom: '#fcb69f', accent: '#f6ad55' },
      day: { top: '#e0f2f1', bottom: '#ffffff', accent: '#10b981' },
      asr: { top: '#fef3c7', bottom: '#fbbf24', accent: '#d97706' },
      maghrib: { top: '#4c1d95', bottom: '#db2777', accent: '#f472b6' },
      isha: { top: '#0f172a', bottom: '#1e293b', accent: '#38bdf8' },
    };

    const colors = themeColors[phase];
    document.documentElement.style.setProperty('--dynamic-bg-top', colors.top);
    document.documentElement.style.setProperty('--dynamic-bg-bottom', colors.bottom);
    document.documentElement.style.setProperty('--dynamic-accent', colors.accent);
    
    document.documentElement.classList.add('theme-transitioning');
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [phase, active]);

  return { phase };
};
