// Prayer-related constants extracted to avoid circular dependencies

export const PRAYER_SETTINGS_KEY = "prayer-times-settings";

export interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  // Sunnah Times
  Midnight?: string;
  LastThird?: string;
  Duha?: string;
}

export interface PrayerSettings {
  latitude: number | null;
  longitude: number | null;
  cityName: string;
  method: number; // calculation method
  adhanSound: string;
  notificationsEnabled: boolean;
  prePrayerNotification: boolean;
  prePrayerMinutes: number;
  enabledPrayers: (keyof PrayerTimesData)[];
  manualOverrides: Partial<PrayerTimesData>;
  timeFormat: "12h" | "24h";
  adhanSounds: Record<string, string>; // Per-prayer sound id
}

export const DEFAULT_SETTINGS: PrayerSettings = {
  latitude: 29.9602, // Maadi, Cairo
  longitude: 31.2569,
  cityName: "المعادي، القاهرة (تلقائي)",
  method: 5, // Egyptian General Authority of Survey
  adhanSound: "minshawi",
  notificationsEnabled: false,
  prePrayerNotification: false,
  prePrayerMinutes: 10,
  enabledPrayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
  manualOverrides: {},
  timeFormat: "12h",
  adhanSounds: {
    Fajr: "minshawi",
    Dhuhr: "minshawi",
    Asr: "minshawi",
    Maghrib: "minshawi",
    Isha: "minshawi",
  },
};

export const ADHAN_SOUNDS: { id: string; label: string; url: string }[] = [
  {
    id: "makkah",
    label: "أذان الحرم المكي",
    url: "/Adhan%20Sounds/Adhan-Makkah.mp3",
  },
  {
    id: "madinah",
    label: "أذان المسجد النبوي",
    url: "/Adhan%20Sounds/Adhan-Madinah.mp3",
  },
  {
    id: "alaqsa",
    label: "أذان المسجد الأقصى",
    url: "/Adhan%20Sounds/Adhan-Alaqsa.mp3",
  },
  {
    id: "egypt",
    label: "أذان مصر (القاهرة)",
    url: "/Adhan%20Sounds/Adhan-Egypt.mp3",
  },
  {
    id: "abdulbaset",
    label: "عبدالباسط عبدالصمد",
    url: "/Adhan%20Sounds/Abdul-Basit.mp3",
  },
  {
    id: "minshawi",
    label: "محمد صديق المنشاوي",
    url: "/Adhan%20Sounds/Minshawi.mp3",
  },
  {
    id: "naghshbandi",
    label: "سيد النقشبندي",
    url: "/Adhan%20Sounds/Naghshbandi.mp3",
  },
  {
    id: "yusuf",
    label: "يوسف إسلام",
    url: "/Adhan%20Sounds/Yusuf-Islam.mp3",
  },
  {
    id: "halab",
    label: "أذان حلب",
    url: "/Adhan%20Sounds/Adhan-Halab.mp3",
  },
  {
    id: "abdulghaffar",
    label: "عبدالغفار",
    url: "/Adhan%20Sounds/Abdul-Ghaffar.mp3",
  },
  {
    id: "abdulhakam",
    label: "عبدالحكم",
    url: "/Adhan%20Sounds/Abdul-Hakam.mp3",
  },
  {
    id: "hussaini",
    label: "الحسيني",
    url: "/Adhan%20Sounds/Al-Hussaini.mp3",
  },
  {
    id: "bakir",
    label: "بكر باش",
    url: "/Adhan%20Sounds/Bakir-Bash.mp3",
  },
  {
    id: "hafez",
    label: "حافظ",
    url: "/Adhan%20Sounds/Hafez.mp3",
  },
  {
    id: "hafizmurad",
    label: "حافظ مراد",
    url: "/Adhan%20Sounds/Hafiz-Murad.mp3",
  },
  {
    id: "saber",
    label: "صابر",
    url: "/Adhan%20Sounds/Saber.mp3",
  },
  {
    id: "sharif",
    label: "شريف دومان",
    url: "/Adhan%20Sounds/Sharif-Doman.mp3",
  },
  {
    id: "tts_arabic",
    label: "نطق اسم الصلاة (إنجليزي)",
    url: "tts",
  },
  {
    id: "beep",
    label: "تنبيه بسيط (Beep)",
    url: "/Adhan%20Sounds/beep.mp3",
  },
];

export const CALCULATION_METHODS: { id: number; label: string }[] = [
  { id: 5, label: "الهيئة المصرية العامة للمساحة" },
  { id: 4, label: "أم القرى (مكة)" },
  { id: 3, label: "رابطة العالم الإسلامي" },
  { id: 2, label: "الجمعية الإسلامية لأمريكا الشمالية" },
  { id: 1, label: "جامعة العلوم الإسلامية بكراتشي" },
  { id: 7, label: "معهد الجيوفيزياء - جامعة طهران" },
];

export const PRAYER_NAMES: Record<keyof PrayerTimesData, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
  Midnight: "منتصف الليل",
  LastThird: "الثلث الأخير",
  Duha: "الضحى",
};
