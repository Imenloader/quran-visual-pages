export interface Surah {
  id: number;
  name: string;
  type: "meccan" | "medinan";
}

export interface ReciterInfo {
  id: number;
  name: string;
}

export interface MoshafInfo {
  id: number;
  name: string;
  server: string;
  surah_list: string;
}

export interface PlaylistTrackGlobal {
  surahId: number;
  surahName: string;
  reciterId: number;
  reciterName: string;
  moshafId: number;
  moshafServer: string;
}

export const SURAHS: Surah[] = [
  { id: 1, name: "الفاتحة", type: "meccan" }, { id: 2, name: "البقرة", type: "medinan" }, { id: 3, name: "آل عمران", type: "medinan" },
  { id: 4, name: "النساء", type: "medinan" }, { id: 5, name: "المائدة", type: "medinan" }, { id: 6, name: "الأنعام", type: "meccan" },
  { id: 7, name: "الأعراف", type: "meccan" }, { id: 8, name: "الأنفال", type: "medinan" }, { id: 9, name: "التوبة", type: "medinan" },
  { id: 10, name: "يونس", type: "meccan" }, { id: 11, name: "هود", type: "meccan" }, { id: 12, name: "يوسف", type: "meccan" },
  { id: 13, name: "الرعد", type: "medinan" }, { id: 14, name: "إبراهيم", type: "meccan" }, { id: 15, name: "الحجر", type: "meccan" },
  { id: 16, name: "النحل", type: "meccan" }, { id: 17, name: "الإسراء", type: "meccan" }, { id: 18, name: "الكهف", type: "meccan" },
  { id: 19, name: "مريم", type: "meccan" }, { id: 20, name: "طه", type: "meccan" }, { id: 21, name: "الأنبياء", type: "meccan" },
  { id: 22, name: "الحج", type: "medinan" }, { id: 23, name: "المؤمنون", type: "meccan" }, { id: 24, name: "النور", type: "medinan" },
  { id: 25, name: "الفرقان", type: "meccan" }, { id: 26, name: "الشعراء", type: "meccan" }, { id: 27, name: "النمل", type: "meccan" },
  { id: 28, name: "القصص", type: "meccan" }, { id: 29, name: "العنكبوت", type: "meccan" }, { id: 30, name: "الروم", type: "meccan" },
  { id: 31, name: "لقمان", type: "meccan" }, { id: 32, name: "السجدة", type: "meccan" }, { id: 33, name: "الأحزاب", type: "medinan" },
  { id: 34, name: "سبأ", type: "meccan" }, { id: 35, name: "فاطر", type: "meccan" }, { id: 36, name: "يس", type: "meccan" },
  { id: 37, name: "الصافات", type: "meccan" }, { id: 38, name: "ص", type: "meccan" }, { id: 39, name: "الزمر", type: "meccan" },
  { id: 40, name: "غافر", type: "meccan" }, { id: 41, name: "فصلت", type: "meccan" }, { id: 42, name: "الشورى", type: "meccan" },
  { id: 43, name: "الزخرف", type: "meccan" }, { id: 44, name: "الدخان", type: "meccan" }, { id: 45, name: "الجاثية", type: "meccan" },
  { id: 46, name: "الأحقاف", type: "meccan" }, { id: 47, name: "محمد", type: "medinan" }, { id: 48, name: "الفتح", type: "medinan" },
  { id: 49, name: "الحجرات", type: "medinan" }, { id: 50, name: "ق", type: "meccan" }, { id: 51, name: "الذاريات", type: "meccan" },
  { id: 52, name: "الطور", type: "meccan" }, { id: 53, name: "النجم", type: "meccan" }, { id: 54, name: "القمر", type: "meccan" },
  { id: 55, name: "الرحمن", type: "meccan" }, { id: 56, name: "الواقعة", type: "meccan" }, { id: 57, name: "الحديد", type: "medinan" },
  { id: 58, name: "المجادلة", type: "medinan" }, { id: 59, name: "الحشر", type: "medinan" }, { id: 60, name: "الممتحنة", type: "medinan" },
  { id: 61, name: "الصف", type: "medinan" }, { id: 62, name: "الجمعة", type: "medinan" }, { id: 63, name: "المنافقون", type: "medinan" },
  { id: 64, name: "التغابن", type: "medinan" }, { id: 65, name: "الطلاق", type: "medinan" }, { id: 66, name: "التحريم", type: "medinan" },
  { id: 67, name: "الملك", type: "meccan" }, { id: 68, name: "القلم", type: "meccan" }, { id: 69, name: "الحاقة", type: "meccan" },
  { id: 70, name: "المعارج", type: "meccan" }, { id: 71, name: "نوح", type: "meccan" }, { id: 72, name: "الجن", type: "meccan" },
  { id: 73, name: "المزمل", type: "meccan" }, { id: 74, name: "المدثر", type: "meccan" }, { id: 75, name: "القيامة", type: "meccan" },
  { id: 76, name: "الإنسان", type: "medinan" }, { id: 77, name: "المرسلات", type: "meccan" }, { id: 78, name: "النبأ", type: "meccan" },
  { id: 79, name: "النازعات", type: "meccan" }, { id: 80, name: "عبس", type: "meccan" }, { id: 81, name: "التكوير", type: "meccan" },
  { id: 82, name: "الانفطار", type: "meccan" }, { id: 83, name: "المطففين", type: "meccan" }, { id: 84, name: "الانشقاق", type: "meccan" },
  { id: 85, name: "البروج", type: "meccan" }, { id: 86, name: "الطارق", type: "meccan" }, { id: 87, name: "الأعلى", type: "meccan" },
  { id: 88, name: "الغاشية", type: "meccan" }, { id: 89, name: "الفجر", type: "meccan" }, { id: 90, name: "البلد", type: "meccan" },
  { id: 91, name: "الشمس", type: "meccan" }, { id: 92, name: "الليل", type: "meccan" }, { id: 93, name: "الضحى", type: "meccan" },
  { id: 94, name: "الشرح", type: "meccan" }, { id: 95, name: "التين", type: "meccan" }, { id: 96, name: "العلق", type: "meccan" },
  { id: 97, name: "القدر", type: "meccan" }, { id: 98, name: "البينة", type: "medinan" }, { id: 99, name: "الزلزلة", type: "medinan" },
  { id: 100, name: "العاديات", type: "meccan" }, { id: 101, name: "القارعة", type: "meccan" }, { id: 102, name: "التكاثر", type: "meccan" },
  { id: 103, name: "العصر", type: "meccan" }, { id: 104, name: "الهمزة", type: "meccan" }, { id: 105, name: "الفيل", type: "meccan" },
  { id: 106, name: "قريش", type: "meccan" }, { id: 107, name: "الماعون", type: "meccan" }, { id: 108, name: "الكوثر", type: "meccan" },
  { id: 109, name: "الكافرون", type: "meccan" }, { id: 110, name: "النصر", type: "medinan" }, { id: 111, name: "المسد", type: "meccan" },
  { id: 112, name: "الإخلاص", type: "meccan" }, { id: 113, name: "الفلق", type: "meccan" }, { id: 114, name: "الناس", type: "meccan" },
];
