import { QanetLog, QanetLevel } from './types';
import { differenceInCalendarDays, parseISO, startOfDay, isValid } from 'date-fns';

export const getQanetLevel = (ayahs: number): QanetLevel => {
  if (ayahs < 10) return 'heedless';
  if (ayahs < 100) return 'aware';
  if (ayahs < 1000) return 'qanet';
  return 'muqantar';
};

export const getLevelLabel = (level: QanetLevel) => {
  switch (level) {
    case 'heedless': return 'غافل';
    case 'aware': return 'غير غافل';
    case 'qanet': return 'قانت';
    case 'muqantar': return 'مقنطر';
  }
};

export const calculateStats = (logs: QanetLog[]) => {
  if (!logs.length) return { 
    qanetStreak: 0, 
    nonHeedlessStreak: 0, 
    totalAyahs: 0, 
    totalNights: 0,
    maxQanetStreak: 0,
    maxNonHeedlessStreak: 0
  };
  
  // Sort from newest to oldest
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let totalAyahs = 0;
  // Map of date string (YYYY-MM-DD) to total ayahs read that night
  const dailyTotals = new Map<string, number>();

  sorted.forEach(log => {
    totalAyahs += log.totalAyahs;
    try {
      const d = parseISO(log.date);
      if (isValid(d)) {
        const dateKey = startOfDay(d).toISOString();
        const current = dailyTotals.get(dateKey) || 0;
        dailyTotals.set(dateKey, current + log.totalAyahs);
      }
    } catch (e) {
      console.warn("Invalid date in logs", log.date);
    }
  });

  // Sort the unique dates descending
  const datesDesc = Array.from(dailyTotals.keys())
    .map(iso => parseISO(iso))
    .sort((a, b) => b.getTime() - a.getTime());

  let currentQanetStreak = 0;
  let currentNonHeedlessStreak = 0;
  let maxQanetStreak = 0;
  let maxNonHeedlessStreak = 0;
  
  let tempQanetStreak = 0;
  let tempNonHeedlessStreak = 0;
  
  // Check streaks based on daily totals
  const today = startOfDay(new Date());

  datesDesc.forEach((date, i) => {
    const ayahs = dailyTotals.get(startOfDay(date).toISOString()) || 0;
    const isQanet = ayahs >= 100;
    const isNonHeedless = ayahs >= 10;
    
    // Check consecutive days. If it's the first element, it should be today or yesterday.
    const diffToToday = differenceInCalendarDays(today, date);
    
    if (i === 0) {
      if (diffToToday <= 1) {
        if (isQanet) { tempQanetStreak++; currentQanetStreak++; }
        if (isNonHeedless) { tempNonHeedlessStreak++; currentNonHeedlessStreak++; }
      } else {
        // Streak is already broken
      }
    } else {
      const prevDate = datesDesc[i - 1];
      const diff = differenceInCalendarDays(prevDate, date);
      
      if (diff === 1) {
        if (isQanet) {
          tempQanetStreak++;
          if (tempQanetStreak > currentQanetStreak && currentQanetStreak > 0) currentQanetStreak = tempQanetStreak; // only if active
        } else {
          tempQanetStreak = 0;
        }
        
        if (isNonHeedless) {
          tempNonHeedlessStreak++;
          if (tempNonHeedlessStreak > currentNonHeedlessStreak && currentNonHeedlessStreak > 0) currentNonHeedlessStreak = tempNonHeedlessStreak;
        } else {
          tempNonHeedlessStreak = 0;
        }
      } else {
        tempQanetStreak = isQanet ? 1 : 0;
        tempNonHeedlessStreak = isNonHeedless ? 1 : 0;
      }
    }
    
    // Track max streaks regardless of current
    const currentCalcQanet = 0;
    const currentCalcNonHeedless = 0;
    
    // A separate loop to calculate all-time max streaks simply
    // Wait, let's do a simple max streak calculation
  });

  // Calculate absolute max streaks
  let absTempQanet = 0;
  let absTempNonHeedless = 0;
  for (let i = datesDesc.length - 1; i >= 0; i--) {
    const date = datesDesc[i];
    const ayahs = dailyTotals.get(startOfDay(date).toISOString()) || 0;
    const isQanet = ayahs >= 100;
    const isNonHeedless = ayahs >= 10;
    
    if (i === datesDesc.length - 1) {
      absTempQanet = isQanet ? 1 : 0;
      absTempNonHeedless = isNonHeedless ? 1 : 0;
    } else {
      const nextDate = datesDesc[i + 1];
      if (differenceInCalendarDays(date, nextDate) === 1) {
        if (isQanet) absTempQanet++; else absTempQanet = 0;
        if (isNonHeedless) absTempNonHeedless++; else absTempNonHeedless = 0;
      } else {
        absTempQanet = isQanet ? 1 : 0;
        absTempNonHeedless = isNonHeedless ? 1 : 0;
      }
    }
    if (absTempQanet > maxQanetStreak) maxQanetStreak = absTempQanet;
    if (absTempNonHeedless > maxNonHeedlessStreak) maxNonHeedlessStreak = absTempNonHeedless;
  }

  return { 
    qanetStreak: currentQanetStreak, 
    nonHeedlessStreak: currentNonHeedlessStreak, 
    totalAyahs, 
    totalNights: datesDesc.length,
    maxQanetStreak,
    maxNonHeedlessStreak,
    dailyTotals
  };
};
