export interface JuzInfo {
  number: number;
  nameAr: string;
  nameEn: string;
  startPage: number;
  endPage: number;
  startSurah: string;
  surahs: string[];
}

export interface SurahInfo {
  number: number;
  name: string;
  nameEn: string;
  englishName: string;
  ayahs: number;
  startPage: number;
}

export const surahData: SurahInfo[] = [
  { number: 1, name: "الفاتحة", nameEn: "Al-Fatihah", englishName: "Al-Fatihah", ayahs: 7, startPage: 1 },
  { number: 2, name: "البقرة", nameEn: "Al-Baqarah", englishName: "Al-Baqarah", ayahs: 286, startPage: 2 },
  { number: 3, name: "آل عمران", nameEn: "Al-Imran", englishName: "Al-Imran", ayahs: 200, startPage: 50 },
  { number: 4, name: "النساء", nameEn: "An-Nisa'", englishName: "An-Nisa'", ayahs: 176, startPage: 77 },
  { number: 5, name: "المائدة", nameEn: "Al-Ma'idah", englishName: "Al-Ma'idah", ayahs: 120, startPage: 106 },
  { number: 6, name: "الأنعام", nameEn: "Al-An'am", englishName: "Al-An'am", ayahs: 165, startPage: 128 },
  { number: 7, name: "الأعراف", nameEn: "Al-A'raf", englishName: "Al-A'raf", ayahs: 206, startPage: 151 },
  { number: 8, name: "الأنفال", nameEn: "Al-Anfal", englishName: "Al-Anfal", ayahs: 75, startPage: 177 },
  { number: 9, name: "التوبة", nameEn: "At-Tawbah", englishName: "At-Tawbah", ayahs: 129, startPage: 187 },
  { number: 10, name: "يونس", nameEn: "Yunus", englishName: "Yunus", ayahs: 109, startPage: 208 },
  { number: 11, name: "هود", nameEn: "Hud", englishName: "Hud", ayahs: 123, startPage: 221 },
  { number: 12, name: "يوسف", nameEn: "Yusuf", englishName: "Yusuf", ayahs: 111, startPage: 235 },
  { number: 13, name: "الرعد", nameEn: "Ar-Ra'd", englishName: "Ar-Ra'd", ayahs: 43, startPage: 249 },
  { number: 14, name: "إبراهيم", nameEn: "Ibrahim", englishName: "Ibrahim", ayahs: 52, startPage: 255 },
  { number: 15, name: "الحجر", nameEn: "Al-Hijr", englishName: "Al-Hijr", ayahs: 99, startPage: 262 },
  { number: 16, name: "النحل", nameEn: "An-Nahl", englishName: "An-Nahl", ayahs: 128, startPage: 267 },
  { number: 17, name: "الإسراء", nameEn: "Al-Isra'", englishName: "Al-Isra'", ayahs: 111, startPage: 282 },
  { number: 18, name: "الكهف", nameEn: "Al-Kahf", englishName: "Al-Kahf", ayahs: 110, startPage: 293 },
  { number: 19, name: "مريم", nameEn: "Maryam", englishName: "Maryam", ayahs: 98, startPage: 305 },
  { number: 20, name: "طه", nameEn: "Ta-Ha", englishName: "Ta-Ha", ayahs: 135, startPage: 312 },
  { number: 21, name: "الأنبياء", nameEn: "Al-Anbiya'", englishName: "Al-Anbiya'", ayahs: 112, startPage: 322 },
  { number: 22, name: "الحج", nameEn: "Al-Hajj", englishName: "Al-Hajj", ayahs: 78, startPage: 332 },
  { number: 23, name: "المؤمنون", nameEn: "Al-Mu'minun", englishName: "Al-Mu'minun", ayahs: 118, startPage: 342 },
  { number: 24, name: "النور", nameEn: "An-Nur", englishName: "An-Nur", ayahs: 64, startPage: 350 },
  { number: 25, name: "الفرقان", nameEn: "Al-Furqan", englishName: "Al-Furqan", ayahs: 77, startPage: 359 },
  { number: 26, name: "الشعراء", nameEn: "Ash-Shu'ara'", englishName: "Ash-Shu'ara'", ayahs: 227, startPage: 367 },
  { number: 27, name: "النمل", nameEn: "An-Naml", englishName: "An-Naml", ayahs: 93, startPage: 377 },
  { number: 28, name: "القصص", nameEn: "Al-Qasas", englishName: "Al-Qasas", ayahs: 88, startPage: 385 },
  { number: 29, name: "العنكبوت", nameEn: "Al-'Ankabut", englishName: "Al-'Ankabut", ayahs: 69, startPage: 396 },
  { number: 30, name: "الروم", nameEn: "Ar-Rum", englishName: "Ar-Rum", ayahs: 60, startPage: 404 },
  { number: 31, name: "لقمان", nameEn: "Luqman", englishName: "Luqman", ayahs: 34, startPage: 411 },
  { number: 32, name: "السجدة", nameEn: "As-Sajdah", englishName: "As-Sajdah", ayahs: 30, startPage: 415 },
  { number: 33, name: "الأحزاب", nameEn: "Al-Ahzab", englishName: "Al-Ahzab", ayahs: 73, startPage: 418 },
  { number: 34, name: "سبأ", nameEn: "Saba'", englishName: "Saba'", ayahs: 54, startPage: 428 },
  { number: 35, name: "فاطر", nameEn: "Fatir", englishName: "Fatir", ayahs: 45, startPage: 434 },
  { number: 36, name: "يس", nameEn: "Ya-Sin", englishName: "Ya-Sin", ayahs: 83, startPage: 440 },
  { number: 37, name: "الصافات", nameEn: "As-Saffat", englishName: "As-Saffat", ayahs: 182, startPage: 446 },
  { number: 38, name: "ص", nameEn: "Sad", englishName: "Sad", ayahs: 88, startPage: 453 },
  { number: 39, name: "الزمر", nameEn: "Az-Zumar", englishName: "Az-Zumar", ayahs: 75, startPage: 458 },
  { number: 40, name: "غافر", nameEn: "Ghafir", englishName: "Ghafir", ayahs: 85, startPage: 467 },
  { number: 41, name: "فصلت", nameEn: "Fussilat", englishName: "Fussilat", ayahs: 54, startPage: 477 },
  { number: 42, name: "الشورى", nameEn: "Ash-Shura", englishName: "Ash-Shura", ayahs: 53, startPage: 483 },
  { number: 43, name: "الزخرف", nameEn: "Az-Zukhruf", englishName: "Az-Zukhruf", ayahs: 89, startPage: 489 },
  { number: 44, name: "الدخان", nameEn: "Ad-Dukhan", englishName: "Ad-Dukhan", ayahs: 59, startPage: 496 },
  { number: 45, name: "الجاثية", nameEn: "Al-Jathiyah", englishName: "Al-Jathiyah", ayahs: 37, startPage: 499 },
  { number: 46, name: "الأحقاف", nameEn: "Al-Ahqaf", englishName: "Al-Ahqaf", ayahs: 35, startPage: 502 },
  { number: 47, name: "محمد", nameEn: "Muhammad", englishName: "Muhammad", ayahs: 38, startPage: 507 },
  { number: 48, name: "الفتح", nameEn: "Al-Fath", englishName: "Al-Fath", ayahs: 29, startPage: 511 },
  { number: 49, name: "الحجرات", nameEn: "Al-Hujurat", englishName: "Al-Hujurat", ayahs: 18, startPage: 515 },
  { number: 50, name: "ق", nameEn: "Qaf", englishName: "Qaf", ayahs: 45, startPage: 518 },
  { number: 51, name: "الذاريات", nameEn: "Adh-Dhariyat", englishName: "Adh-Dhariyat", ayahs: 60, startPage: 520 },
  { number: 52, name: "الطور", nameEn: "At-Tur", englishName: "At-Tur", ayahs: 49, startPage: 523 },
  { number: 53, name: "النجم", nameEn: "An-Najm", englishName: "An-Najm", ayahs: 62, startPage: 526 },
  { number: 54, name: "القمر", nameEn: "Al-Qamar", englishName: "Al-Qamar", ayahs: 55, startPage: 528 },
  { number: 55, name: "الرحمن", nameEn: "Ar-Rahman", englishName: "Ar-Rahman", ayahs: 78, startPage: 531 },
  { number: 56, name: "الواقعة", nameEn: "Al-Waqi'ah", englishName: "Al-Waqi'ah", ayahs: 96, startPage: 534 },
  { number: 57, name: "الحديد", nameEn: "Al-Hadid", englishName: "Al-Hadid", ayahs: 29, startPage: 537 },
  { number: 58, name: "المجادلة", nameEn: "Al-Mujadilah", englishName: "Al-Mujadilah", ayahs: 22, startPage: 542 },
  { number: 59, name: "الحشر", nameEn: "Al-Hashr", englishName: "Al-Hashr", ayahs: 24, startPage: 545 },
  { number: 60, name: "الممتحنة", nameEn: "Al-Mumtahanah", englishName: "Al-Mumtahanah", ayahs: 13, startPage: 549 },
  { number: 61, name: "الصف", nameEn: "As-Saff", englishName: "As-Saff", ayahs: 14, startPage: 551 },
  { number: 62, name: "الجمعة", nameEn: "Al-Jumu'ah", englishName: "Al-Jumu'ah", ayahs: 11, startPage: 553 },
  { number: 63, name: "المنافقون", nameEn: "Al-Munafiqun", englishName: "Al-Munafiqun", ayahs: 11, startPage: 554 },
  { number: 64, name: "التغابن", nameEn: "At-Taghabun", englishName: "At-Taghabun", ayahs: 18, startPage: 556 },
  { number: 65, name: "الطلاق", nameEn: "At-Talaq", englishName: "At-Talaq", ayahs: 12, startPage: 558 },
  { number: 66, name: "التحريم", nameEn: "At-Tahrim", englishName: "At-Tahrim", ayahs: 12, startPage: 560 },
  { number: 67, name: "الملك", nameEn: "Al-Mulk", englishName: "Al-Mulk", ayahs: 30, startPage: 562 },
  { number: 68, name: "القلم", nameEn: "Al-Qalam", englishName: "Al-Qalam", ayahs: 52, startPage: 564 },
  { number: 69, name: "الحاقة", nameEn: "Al-Haqqah", englishName: "Al-Haqqah", ayahs: 52, startPage: 566 },
  { number: 70, name: "المعارج", nameEn: "Al-Ma'arij", englishName: "Al-Ma'arij", ayahs: 44, startPage: 568 },
  { number: 71, name: "نوح", nameEn: "Nuh", englishName: "Nuh", ayahs: 28, startPage: 570 },
  { number: 72, name: "الجن", nameEn: "Al-Jinn", englishName: "Al-Jinn", ayahs: 28, startPage: 572 },
  { number: 73, name: "المزمل", nameEn: "Al-Muzzammil", englishName: "Al-Muzzammil", ayahs: 20, startPage: 574 },
  { number: 74, name: "المدثر", nameEn: "Al-Muddaththir", englishName: "Al-Muddaththir", ayahs: 56, startPage: 575 },
  { number: 75, name: "القيامة", nameEn: "Al-Qiyamah", englishName: "Al-Qiyamah", ayahs: 40, startPage: 577 },
  { number: 76, name: "الإنسان", nameEn: "Al-Insan", englishName: "Al-Insan", ayahs: 31, startPage: 578 },
  { number: 77, name: "المرسلات", nameEn: "Al-Mursalat", englishName: "Al-Mursalat", ayahs: 50, startPage: 580 },
  { number: 78, name: "النبأ", nameEn: "An-Naba'", englishName: "An-Naba'", ayahs: 40, startPage: 582 },
  { number: 79, name: "النازعات", nameEn: "An-Nazi'at", englishName: "An-Nazi'at", ayahs: 46, startPage: 583 },
  { number: 80, name: "عبس", nameEn: "'Abasa", englishName: "'Abasa", ayahs: 42, startPage: 585 },
  { number: 81, name: "التكوير", nameEn: "At-Takwir", englishName: "At-Takwir", ayahs: 29, startPage: 586 },
  { number: 82, name: "الانفطار", nameEn: "Al-Infitar", englishName: "Al-Infitar", ayahs: 19, startPage: 587 },
  { number: 83, name: "المطففين", nameEn: "Al-Mutaffifin", englishName: "Al-Mutaffifin", ayahs: 36, startPage: 587 },
  { number: 84, name: "الانشقاق", nameEn: "Al-Inshiqaq", englishName: "Al-Inshiqaq", ayahs: 25, startPage: 589 },
  { number: 85, name: "البروج", nameEn: "Al-Buruj", englishName: "Al-Buruj", ayahs: 22, startPage: 590 },
  { number: 86, name: "الطارق", nameEn: "At-Tariq", englishName: "At-Tariq", ayahs: 17, startPage: 591 },
  { number: 87, name: "الأعلى", nameEn: "Al-A'la", englishName: "Al-A'la", ayahs: 19, startPage: 591 },
  { number: 88, name: "الغاشية", nameEn: "Al-Ghashiyah", englishName: "Al-Ghashiyah", ayahs: 26, startPage: 592 },
  { number: 89, name: "الفجر", nameEn: "Al-Fajr", englishName: "Al-Fajr", ayahs: 30, startPage: 593 },
  { number: 90, name: "البلد", nameEn: "Al-Balad", englishName: "Al-Balad", ayahs: 20, startPage: 594 },
  { number: 91, name: "الشمس", nameEn: "Ash-Shams", englishName: "Ash-Shams", ayahs: 15, startPage: 595 },
  { number: 92, name: "الليل", nameEn: "Al-Layl", englishName: "Al-Layl", ayahs: 21, startPage: 595 },
  { number: 93, name: "الضحى", nameEn: "Ad-Duha", englishName: "Ad-Duha", ayahs: 11, startPage: 596 },
  { number: 94, name: "الشرح", nameEn: "Ash-Sharh", englishName: "Ash-Sharh", ayahs: 8, startPage: 596 },
  { number: 95, name: "التين", nameEn: "At-Tin", englishName: "At-Tin", ayahs: 8, startPage: 597 },
  { number: 96, name: "العلق", nameEn: "Al-'Alaq", englishName: "Al-'Alaq", ayahs: 19, startPage: 597 },
  { number: 97, name: "القدر", nameEn: "Al-Qadr", englishName: "Al-Qadr", ayahs: 5, startPage: 598 },
  { number: 98, name: "البينة", nameEn: "Al-Bayyinah", englishName: "Al-Bayyinah", ayahs: 8, startPage: 598 },
  { number: 99, name: "الزلزلة", nameEn: "Az-Zalzalah", englishName: "Az-Zalzalah", ayahs: 8, startPage: 599 },
  { number: 100, name: "العاديات", nameEn: "Al-'Adiyat", englishName: "Al-'Adiyat", ayahs: 11, startPage: 599 },
  { number: 101, name: "القارعة", nameEn: "Al-Qari'ah", englishName: "Al-Qari'ah", ayahs: 11, startPage: 600 },
  { number: 102, name: "التكاثر", nameEn: "At-Takathur", englishName: "At-Takathur", ayahs: 8, startPage: 600 },
  { number: 103, name: "العصر", nameEn: "Al-'Asr", englishName: "Al-'Asr", ayahs: 3, startPage: 601 },
  { number: 104, name: "الهمزة", nameEn: "Al-Humazah", englishName: "Al-Humazah", ayahs: 9, startPage: 601 },
  { number: 105, name: "الفيل", nameEn: "Al-Fil", englishName: "Al-Fil", ayahs: 5, startPage: 601 },
  { number: 106, name: "قريش", nameEn: "Quraysh", englishName: "Quraysh", ayahs: 4, startPage: 602 },
  { number: 107, name: "الماعون", nameEn: "Al-Ma'un", englishName: "Al-Ma'un", ayahs: 7, startPage: 602 },
  { number: 108, name: "الكوثر", nameEn: "Al-Kawthar", englishName: "Al-Kawthar", ayahs: 3, startPage: 602 },
  { number: 109, name: "الكافرون", nameEn: "Al-Kafirun", englishName: "Al-Kafirun", ayahs: 6, startPage: 603 },
  { number: 110, name: "النصر", nameEn: "An-Nasr", englishName: "An-Nasr", ayahs: 3, startPage: 603 },
  { number: 111, name: "المسد", nameEn: "Al-Masad", englishName: "Al-Masad", ayahs: 5, startPage: 603 },
  { number: 112, name: "الإخلاص", nameEn: "Al-Ikhlas", englishName: "Al-Ikhlas", ayahs: 4, startPage: 604 },
  { number: 113, name: "الفلق", nameEn: "Al-Falaq", englishName: "Al-Falaq", ayahs: 5, startPage: 604 },
  { number: 114, name: "الناس", nameEn: "An-Nas", englishName: "An-Nas", ayahs: 6, startPage: 604 },
];

export const surahIndex = surahData;

export const surahByName = new Map<string, SurahInfo>();
export const surahByNumber = new Map<number, SurahInfo>();
export const surahByNumberString = new Map<string, SurahInfo>();

surahData.forEach(surah => {
  surahByName.set(surah.name, surah);
  surahByNumber.set(surah.number, surah);
  surahByNumberString.set(surah.number.toString(), surah);
});

export const juzData: JuzInfo[] = [
  { number: 1, nameAr: "الجزء الأول", nameEn: "Juz 1", startPage: 1, endPage: 21, startSurah: "الفاتحة", surahs: ["الفاتحة", "البقرة"] },
  { number: 2, nameAr: "الجزء الثاني", nameEn: "Juz 2", startPage: 22, endPage: 41, startSurah: "البقرة 142", surahs: ["البقرة"] },
  { number: 3, nameAr: "الجزء الثالث", nameEn: "Juz 3", startPage: 42, endPage: 61, startSurah: "البقرة 253", surahs: ["البقرة", "آل عمران"] },
  { number: 4, nameAr: "الجزء الرابع", nameEn: "Juz 4", startPage: 62, endPage: 81, startSurah: "آل عمران 93", surahs: ["آل عمران", "النساء"] },
  { number: 5, nameAr: "الجزء الخامس", nameEn: "Juz 5", startPage: 82, endPage: 101, startSurah: "النساء 24", surahs: ["النساء"] },
  { number: 6, nameAr: "الجزء السادس", nameEn: "Juz 6", startPage: 102, endPage: 121, startSurah: "النساء 148", surahs: ["النساء", "المائدة"] },
  { number: 7, nameAr: "الجزء السابع", nameEn: "Juz 7", startPage: 122, endPage: 141, startSurah: "المائدة 82", surahs: ["المائدة", "الأنعام"] },
  { number: 8, nameAr: "الجزء الثامن", nameEn: "Juz 8", startPage: 142, endPage: 161, startSurah: "الأنعام 111", surahs: ["الأنعام", "الأعراف"] },
  { number: 9, nameAr: "الجزء التاسع", nameEn: "Juz 9", startPage: 162, endPage: 181, startSurah: "الأعراف 88", surahs: ["الأعراف", "الأنفال"] },
  { number: 10, nameAr: "الجزء العاشر", nameEn: "Juz 10", startPage: 182, endPage: 201, startSurah: "الأنفال 41", surahs: ["الأنفال", "التوبة"] },
  { number: 11, nameAr: "الجزء الحادي عشر", nameEn: "Juz 11", startPage: 202, endPage: 221, startSurah: "التوبة 93", surahs: ["التوبة", "يونس", "هود"] },
  { number: 12, nameAr: "الجزء الثاني عشر", nameEn: "Juz 12", startPage: 222, endPage: 241, startSurah: "هود 6", surahs: ["هود", "يوسف"] },
  { number: 13, nameAr: "الجزء الثالث عشر", nameEn: "Juz 13", startPage: 242, endPage: 261, startSurah: "يوسف 53", surahs: ["يوسف", "الرعد", "إبراهيم", "الحجر"] },
  { number: 14, nameAr: "الجزء الرابع عشر", nameEn: "Juz 14", startPage: 262, endPage: 281, startSurah: "الحجر 1", surahs: ["الحجر", "النحل"] },
  { number: 15, nameAr: "الجزء الخامس عشر", nameEn: "Juz 15", startPage: 282, endPage: 301, startSurah: "الإسراء 1", surahs: ["الإسراء", "الكهف"] },
  { number: 16, nameAr: "الجزء السادس عشر", nameEn: "Juz 16", startPage: 302, endPage: 321, startSurah: "الكهف 75", surahs: ["الكهف", "مريم", "طه"] },
  { number: 17, nameAr: "الجزء السابع عشر", nameEn: "Juz 17", startPage: 322, endPage: 341, startSurah: "الأنبياء 1", surahs: ["الأنبياء", "الحج"] },
  { number: 18, nameAr: "الجزء الثامن عشر", nameEn: "Juz 18", startPage: 342, endPage: 361, startSurah: "المؤمنون 1", surahs: ["المؤمنون", "النور", "الفرقان"] },
  { number: 19, nameAr: "الجزء التاسع عشر", nameEn: "Juz 19", startPage: 362, endPage: 381, startSurah: "الفرقان 21", surahs: ["الفرقان", "الشعراء", "النمل"] },
  { number: 20, nameAr: "الجزء العشرون", nameEn: "Juz 20", startPage: 382, endPage: 401, startSurah: "النمل 56", surahs: ["النمل", "القصص", "العنكبوت"] },
  { number: 21, nameAr: "الجزء الحادي والعشرون", nameEn: "Juz 21", startPage: 402, endPage: 421, startSurah: "العنكبوت 46", surahs: ["العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب"] },
  { number: 22, nameAr: "الجزء الثاني والعشرون", nameEn: "Juz 22", startPage: 422, endPage: 441, startSurah: "الأحزاب 31", surahs: ["الأحزاب", "سبأ", "فاطر", "يس"] },
  { number: 23, nameAr: "الجزء الثالث والعشرون", nameEn: "Juz 23", startPage: 442, endPage: 461, startSurah: "يس 28", surahs: ["يس", "الصافات", "ص", "الزمر"] },
  { number: 24, nameAr: "الجزء الرابع والعشرون", nameEn: "Juz 24", startPage: 462, endPage: 481, startSurah: "الزمر 32", surahs: ["الزمر", "غافر", "فصلت"] },
  { number: 25, nameAr: "الجزء الخامس والعشرون", nameEn: "Juz 25", startPage: 482, endPage: 501, startSurah: "فصلت 47", surahs: ["فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية"] },
  { number: 26, nameAr: "الجزء السادس والعشرون", nameEn: "Juz 26", startPage: 502, endPage: 521, startSurah: "الأحقاف 1", surahs: ["الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات"] },
  { number: 27, nameAr: "الجزء السابع والعشرون", nameEn: "Juz 27", startPage: 522, endPage: 541, startSurah: "الذاريات 31", surahs: ["الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد"] },
  { number: 28, nameAr: "الجزء الثامن والعشرون", nameEn: "Juz 28", startPage: 542, endPage: 561, startSurah: "المجادلة 1", surahs: ["المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم"] },
  { number: 29, nameAr: "الجزء التاسع والعشرون", nameEn: "Juz 29", startPage: 562, endPage: 581, startSurah: "الملك 1", surahs: ["الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات"] },
  { number: 30, nameAr: "الجزء الثلاثون", nameEn: "Juz 30", startPage: 582, endPage: 604, startSurah: "النبأ 1", surahs: ["النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"] },
];

export const toArabicNumber = (num: number | string | undefined | null, force: boolean = false): string => {
  const n = String(num ?? "");
  if (!n) return "";
  
  // If not forced, we assume the caller handles language check
  // But for convenience, we can check if it's already Arabic digits
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return n.replace(/[0-9]/g, (w) => arabicDigits[parseInt(w)]);
};

export const getJuzAndPageForSurah = (surahNumber: number): { juz: number; page: number } => {
  const surah = surahByNumber.get(surahNumber);
  if (!surah) return { juz: 1, page: 1 };
  
  const juz = juzData.find(j => surah.startPage >= j.startPage && surah.startPage <= j.endPage);
  return {
    juz: juz ? juz.number : 1,
    page: surah.startPage
  };
};

/**
 * Returns the surah that covers a specific page.
 */
export const getSurahByPage = (pageNumber: number): SurahInfo | undefined => {
  for (let i = surahIndex.length - 1; i >= 0; i--) {
    if (surahIndex[i].startPage <= pageNumber) {
      return surahIndex[i];
    }
  }
  return undefined;
};

export const getJuzByPage = (pageNumber: number): number => {
  const juz = juzData.find(j => pageNumber >= j.startPage && pageNumber <= j.endPage);
  return juz ? juz.number : 1;
};

export interface QuranImageSource {
  id: string;
  nameAr: string;
  nameEn: string;
  isTajweed: boolean;
  getUrl: (page: string) => string;
}

export const QURAN_IMAGE_SOURCES: QuranImageSource[] = [
  {
    id: "madinah-alt",
    nameAr: "مصحف المدينة (مصدر بديل - GitHub)",
    nameEn: "Madinah (GitHub)",
    isTajweed: false,
    getUrl: (p) => `https://raw.githubusercontent.com/zeyadetman/quran-pages-images/master/images/${p}.jpg`
  },
  {
    id: "tajweed",
    nameAr: "مصحف التجويد (GitHub)",
    nameEn: "Tajweed Quran",
    isTajweed: true,
    getUrl: (p) => `https://jahedev.github.io/tajweed-quran-pages/hafs/tajweed-${p}.jpg`
  },
  {
    id: "madinah-high",
    nameAr: "مصحف المدينة (دقة عالية)",
    nameEn: "Madinah (High Res)",
    isTajweed: false,
    getUrl: (p) => `https://android.quran.com/data/width_1260/page${p}.png`
  },
  {
    id: "madinah-classic",
    nameAr: "مصحف المدينة (كلاسيكي)",
    nameEn: "Madinah (Classic)",
    isTajweed: false,
    getUrl: (p) => `https://madinah-quran.com/pages/${p}.png`
  },
  {
    id: "mushaf-standard",
    nameAr: "المصحف القياسي",
    nameEn: "Standard Mushaf",
    isTajweed: false,
    getUrl: (p) => `https://quran.com/images/quran_pages/${p}.png`
  }
];

export const getQuranPageImageUrl = (
  pageNumber: number | string | undefined | null, 
  isTajweed: boolean = true,
  preferredSourceId?: string
): string => {
  return getQuranPageFallbackImageUrl(pageNumber, 0, isTajweed, preferredSourceId);
};

export const getQuranPageFallbackImageUrl = (
  pageNumber: number | string | undefined | null, 
  level: number = 0, 
  isTajweed: boolean = true,
  preferredSourceId?: string
): string => {
  if (!pageNumber) return "";
  const paddedPage = String(pageNumber).padStart(3, '0');
  
  // Create an ordered list of sources
  let sources: QuranImageSource[] = [];

  if (preferredSourceId) {
    const preferred = QURAN_IMAGE_SOURCES.find(s => s.id === preferredSourceId);
    if (preferred) {
      sources.push(preferred);
    }
  }

  // Add other sources of the same type (tajweed or standard)
  const sameTypeSources = QURAN_IMAGE_SOURCES.filter(s => 
    s.isTajweed === isTajweed && s.id !== preferredSourceId
  );
  sources = [...sources, ...sameTypeSources];

  // Add remaining sources as ultimate fallback
  const remainingSources = QURAN_IMAGE_SOURCES.filter(s => 
    s.isTajweed !== isTajweed && s.id !== preferredSourceId
  );
  sources = [...sources, ...remainingSources];

  const source = sources[level % sources.length];
  return source.getUrl(paddedPage);
};
