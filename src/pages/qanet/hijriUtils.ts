/**
 * Hijri date utilities using Intl.DateTimeFormat with islamic-umalqura calendar.
 * Zero external dependencies.
 */

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Thania', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhul Qi\'dah', 'Dhul Hijjah'
];

const WEEKDAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const WEEKDAYS_AR_SHORT = ['أ', 'إ', 'ث', 'أ', 'خ', 'ج', 'س'];

const toArabicDigits = (num: number | string): string => {
  return String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
};

interface HijriDate {
  day: number;
  month: number; // 1-12
  year: number;
  monthNameAr: string;
  monthNameEn: string;
  weekdayAr: string;
}

/**
 * Convert a Gregorian date to Hijri using Intl.DateTimeFormat.
 * The offset parameter adjusts the result by +/- days.
 */
export const toHijri = (date: Date, offset: number = 0): HijriDate => {
  const adjusted = new Date(date);
  adjusted.setDate(adjusted.getDate() + offset);

  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  const parts = formatter.formatToParts(adjusted);
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1');
  const yearStr = parts.find(p => p.type === 'year')?.value || '1447';
  const year = parseInt(yearStr.replace(/[^0-9]/g, ''));

  return {
    day,
    month,
    year,
    monthNameAr: HIJRI_MONTHS_AR[month - 1] || '',
    monthNameEn: HIJRI_MONTHS_EN[month - 1] || '',
    weekdayAr: WEEKDAYS_AR[adjusted.getDay()],
  };
};

/**
 * Format a Hijri date to a display string like "١٢ ذو القعدة ١٤٤٧ هـ"
 */
export const formatHijriDate = (date: Date, offset: number = 0): string => {
  const h = toHijri(date, offset);
  return `${toArabicDigits(h.day)} ${h.monthNameAr} ${toArabicDigits(h.year)} هـ`;
};

/**
 * Format with weekday: "الأربعاء، ١٢ ذو القعدة ١٤٤٧ هـ"
 */
export const formatHijriDateFull = (date: Date, offset: number = 0): string => {
  const h = toHijri(date, offset);
  return `${h.weekdayAr}، ${toArabicDigits(h.day)} ${h.monthNameAr} ${toArabicDigits(h.year)} هـ`;
};

/**
 * Get the number of days in a Hijri month.
 * Uses a scanning approach: iterate forward from day 1 until the month changes.
 */
export const getHijriMonthDays = (hijriYear: number, hijriMonth: number): number => {
  // Find a Gregorian date that falls in this Hijri month
  // Start from an approximate date and scan
  const approxDate = hijriToApproxGregorian(hijriYear, hijriMonth, 1);
  
  let count = 0;
  const testDate = new Date(approxDate);
  
  for (let i = 0; i < 35; i++) {
    const h = toHijri(testDate);
    if (h.month === hijriMonth && h.year === hijriYear) {
      count++;
    } else if (count > 0) {
      break; // We've moved past the month
    }
    testDate.setDate(testDate.getDate() + 1);
  }
  
  return count || 30; // Fallback to 30
};

/**
 * Get the Gregorian weekday (0=Sun) of the first day of a Hijri month.
 */
export const getHijriMonthStartDay = (hijriYear: number, hijriMonth: number): number => {
  const approxDate = hijriToApproxGregorian(hijriYear, hijriMonth, 1);
  const testDate = new Date(approxDate);
  
  for (let i = -5; i < 35; i++) {
    const d = new Date(testDate);
    d.setDate(d.getDate() + i);
    const h = toHijri(d);
    if (h.month === hijriMonth && h.year === hijriYear && h.day === 1) {
      return d.getDay();
    }
  }
  
  return 0; // Fallback
};

/**
 * Convert a Hijri date to an approximate Gregorian date.
 * Uses the fact that the Islamic calendar is ~354.37 days/year.
 */
const hijriToApproxGregorian = (hijriYear: number, hijriMonth: number, hijriDay: number): Date => {
  // Approximate: each Hijri year ≈ 354.367 days
  // Islamic epoch in Julian days: July 16, 622 CE
  const hijriEpoch = new Date(622, 6, 16).getTime();
  const yearDays = (hijriYear - 1) * 354.367;
  const monthDays = (hijriMonth - 1) * 29.5306;
  const totalDays = yearDays + monthDays + hijriDay;
  const msPerDay = 86400000;
  
  return new Date(hijriEpoch + totalDays * msPerDay);
};

/**
 * Get a Gregorian Date object for a specific day in a Hijri month.
 */
export const hijriDayToGregorian = (hijriYear: number, hijriMonth: number, hijriDay: number): Date => {
  const approxDate = hijriToApproxGregorian(hijriYear, hijriMonth, 1);
  const testDate = new Date(approxDate);
  
  for (let i = -5; i < 35; i++) {
    const d = new Date(testDate);
    d.setDate(d.getDate() + i);
    const h = toHijri(d);
    if (h.month === hijriMonth && h.year === hijriYear && h.day === hijriDay) {
      return d;
    }
  }
  
  return new Date(); // Fallback
};

export { HIJRI_MONTHS_AR, HIJRI_MONTHS_EN, WEEKDAYS_AR, WEEKDAYS_AR_SHORT, toArabicDigits };
