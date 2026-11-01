export type QanetLevel = 'heedless' | 'aware' | 'qanet' | 'muqantar';

export interface ReadingRange {
  startSurah?: number;
  startAyah?: number;
  endSurah?: number;
  endAyah?: number;
  startPage?: number;
  endPage?: number;
}

export interface QanetLog {
  id: string;
  date: string; // ISO String for exact logging time
  hijriDate: string;
  shafaWitr: boolean;
  totalAyahs: number;
  ranges: ReadingRange[];
  pages?: number[];
  // Legacy single-range fields (kept for backward compat; optional now that
  // logs record real page ranges instead of a fabricated full-Quran range)
  startSurah?: number;
  startAyah?: number;
  endSurah?: number;
  endAyah?: number;
}

export interface QanetSettings {
  interactiveColors: boolean;
  hijriCalendar: boolean;
  hijriOffset: number;
}

export interface QanetState {
  hasCompletedOnboarding: boolean;
  language: 'ar' | 'en';
  gender: 'male' | 'female' | null;
  dailyTarget: number;
  notificationsEnabled: boolean;
  reminderTime: string;
  logs: QanetLog[];
  totalJuzTracked: number;
  settings: QanetSettings;
}
