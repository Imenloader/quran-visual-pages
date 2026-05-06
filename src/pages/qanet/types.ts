export type QanetLevel = 'heedless' | 'aware' | 'qanet' | 'muqantar';

export interface ReadingRange {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export interface QanetLog {
  id: string;
  date: string; // ISO String for exact logging time
  hijriDate: string;
  shafaWitr: boolean;
  totalAyahs: number;
  ranges: ReadingRange[];
  // Legacy single-range fields (kept for backward compat)
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
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
