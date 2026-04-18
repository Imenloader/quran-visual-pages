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
  startPage: number;
}

export const surahIndex: SurahInfo[] = [
  { number: 1, name: "الفاتحة", nameEn: "Al-Fatihah", startPage: 1 },
  { number: 2, name: "البقرة", nameEn: "Al-Baqarah", startPage: 2 },
  { number: 3, name: "آل عمران", nameEn: "Al-Imran", startPage: 50 },
  { number: 4, name: "النساء", nameEn: "An-Nisa'", startPage: 77 },
  { number: 5, name: "المائدة", nameEn: "Al-Ma'idah", startPage: 106 },
  { number: 6, name: "الأنعام", nameEn: "Al-An'am", startPage: 128 },
  { number: 7, name: "الأعراف", nameEn: "Al-A'raf", startPage: 151 },
  { number: 8, name: "الأنفال", nameEn: "Al-Anfal", startPage: 177 },
  { number: 9, name: "التوبة", nameEn: "At-Tawbah", startPage: 187 },
  { number: 10, name: "يونس", nameEn: "Yunus", startPage: 208 },
  { number: 11, name: "هود", nameEn: "Hud", startPage: 221 },
  { number: 12, name: "يوسف", nameEn: "Yusuf", startPage: 235 },
  { number: 13, name: "الرعد", nameEn: "Ar-Ra'd", startPage: 249 },
  { number: 14, name: "إبراهيم", nameEn: "Ibrahim", startPage: 255 },
  { number: 15, name: "الحجر", nameEn: "Al-Hijr", startPage: 262 },
  { number: 16, name: "النحل", nameEn: "An-Nahl", startPage: 267 },
  { number: 17, name: "الإسراء", nameEn: "Al-Isra'", startPage: 282 },
  { number: 18, name: "الكهف", nameEn: "Al-Kahf", startPage: 293 },
  { number: 19, name: "مريم", nameEn: "Maryam", startPage: 305 },
  { number: 20, name: "طه", nameEn: "Ta-Ha", startPage: 312 },
  { number: 21, name: "الأنبياء", nameEn: "Al-Anbiya'", startPage: 322 },
  { number: 22, name: "الحج", nameEn: "Al-Hajj", startPage: 332 },
  { number: 23, name: "المؤمنون", nameEn: "Al-Mu'minun", startPage: 342 },
  { number: 24, name: "النور", nameEn: "An-Nur", startPage: 350 },
  { number: 25, name: "الفرقان", nameEn: "Al-Furqan", startPage: 359 },
  { number: 26, name: "الشعراء", nameEn: "Ash-Shu'ara'", startPage: 367 },
  { number: 27, name: "النمل", nameEn: "An-Naml", startPage: 377 },
  { number: 28, name: "القصص", nameEn: "Al-Qasas", startPage: 385 },
  { number: 29, name: "العنكبوت", nameEn: "Al-'Ankabut", startPage: 396 },
  { number: 30, name: "الروم", nameEn: "Ar-Rum", startPage: 404 },
  { number: 31, name: "لقمان", nameEn: "Luqman", startPage: 411 },
  { number: 32, name: "السجدة", nameEn: "As-Sajdah", startPage: 415 },
  { number: 33, name: "الأحزاب", nameEn: "Al-Ahzab", startPage: 418 },
  { number: 34, name: "سبأ", nameEn: "Saba'", startPage: 428 },
  { number: 35, name: "فاطر", nameEn: "Fatir", startPage: 434 },
  { number: 36, name: "يس", nameEn: "Ya-Sin", startPage: 440 },
  { number: 37, name: "الصافات", nameEn: "As-Saffat", startPage: 446 },
  { number: 38, name: "ص", nameEn: "Sad", startPage: 453 },
  { number: 39, name: "الزمر", nameEn: "Az-Zumar", startPage: 458 },
  { number: 40, name: "غافر", nameEn: "Ghafir", startPage: 467 },
  { number: 41, name: "فصلت", nameEn: "Fussilat", startPage: 477 },
  { number: 42, name: "الشورى", nameEn: "Ash-Shura", startPage: 483 },
  { number: 43, name: "الزخرف", nameEn: "Az-Zukhruf", startPage: 489 },
  { number: 44, name: "الدخان", nameEn: "Ad-Dukhan", startPage: 496 },
  { number: 45, name: "الجاثية", nameEn: "Al-Jathiyah", startPage: 499 },
  { number: 46, name: "الأحقاف", nameEn: "Al-Ahqaf", startPage: 502 },
  { number: 47, name: "محمد", nameEn: "Muhammad", startPage: 507 },
  { number: 48, name: "الفتح", nameEn: "Al-Fath", startPage: 511 },
  { number: 49, name: "الحجرات", nameEn: "Al-Hujurat", startPage: 515 },
  { number: 50, name: "ق", nameEn: "Qaf", startPage: 518 },
  { number: 51, name: "الذاريات", nameEn: "Adh-Dhariyat", startPage: 520 },
  { number: 52, name: "الطور", nameEn: "At-Tur", startPage: 523 },
  { number: 53, name: "النجم", nameEn: "An-Najm", startPage: 526 },
  { number: 54, name: "القمر", nameEn: "Al-Qamar", startPage: 528 },
  { number: 55, name: "الرحمن", nameEn: "Ar-Rahman", startPage: 531 },
  { number: 56, name: "الواقعة", nameEn: "Al-Waqi'ah", startPage: 534 },
  { number: 57, name: "الحديد", nameEn: "Al-Hadid", startPage: 537 },
  { number: 58, name: "المجادلة", nameEn: "Al-Mujadilah", startPage: 542 },
  { number: 59, name: "الحشر", nameEn: "Al-Hashr", startPage: 545 },
  { number: 60, name: "الممتحنة", nameEn: "Al-Mumtahanah", startPage: 549 },
  { number: 61, name: "الصف", nameEn: "As-Saff", startPage: 551 },
  { number: 62, name: "الجمعة", nameEn: "Al-Jumu'ah", startPage: 553 },
  { number: 63, name: "المنافقون", nameEn: "Al-Munafiqun", startPage: 554 },
  { number: 64, name: "التغابن", nameEn: "At-Taghabun", startPage: 556 },
  { number: 65, name: "الطلاق", nameEn: "At-Talaq", startPage: 558 },
  { number: 66, name: "التحريم", nameEn: "At-Tahrim", startPage: 560 },
  { number: 67, name: "الملك", nameEn: "Al-Mulk", startPage: 562 },
  { number: 68, name: "القلم", nameEn: "Al-Qalam", startPage: 564 },
  { number: 69, name: "الحاقة", nameEn: "Al-Haqqah", startPage: 566 },
  { number: 70, name: "المعارج", nameEn: "Al-Ma'arij", startPage: 568 },
  { number: 71, name: "نوح", nameEn: "Nuh", startPage: 570 },
  { number: 72, name: "الجن", nameEn: "Al-Jinn", startPage: 572 },
  { number: 73, name: "المزمل", nameEn: "Al-Muzzammil", startPage: 574 },
  { number: 74, name: "المدثر", nameEn: "Al-Muddaththir", startPage: 575 },
  { number: 75, name: "القيامة", nameEn: "Al-Qiyamah", startPage: 577 },
  { number: 76, name: "الإنسان", nameEn: "Al-Insan", startPage: 578 },
  { number: 77, name: "المرسلات", nameEn: "Al-Mursalat", startPage: 580 },
  { number: 78, name: "النبأ", nameEn: "An-Naba'", startPage: 582 },
  { number: 79, name: "النازعات", nameEn: "An-Nazi'at", startPage: 583 },
  { number: 80, name: "عبس", nameEn: "'Abasa", startPage: 585 },
  { number: 81, name: "التكوير", nameEn: "At-Takwir", startPage: 586 },
  { number: 82, name: "الانفطار", nameEn: "Al-Infitar", startPage: 587 },
  { number: 83, name: "المطففين", nameEn: "Al-Mutaffifin", startPage: 587 },
  { number: 84, name: "الانشقاق", nameEn: "Al-Inshiqaq", startPage: 589 },
  { number: 85, name: "البروج", nameEn: "Al-Buruj", startPage: 590 },
  { number: 86, name: "الطارق", nameEn: "At-Tariq", startPage: 591 },
  { number: 87, name: "الأعلى", nameEn: "Al-A'la", startPage: 591 },
  { number: 88, name: "الغاشية", nameEn: "Al-Ghashiyah", startPage: 592 },
  { number: 89, name: "الفجر", nameEn: "Al-Fajr", startPage: 593 },
  { number: 90, name: "البلد", nameEn: "Al-Balad", startPage: 594 },
  { number: 91, name: "الشمس", nameEn: "Ash-Shams", startPage: 595 },
  { number: 92, name: "الليل", nameEn: "Al-Layl", startPage: 595 },
  { number: 93, name: "الضحى", nameEn: "Ad-Duha", startPage: 596 },
  { number: 94, name: "الشرح", nameEn: "Ash-Sharh", startPage: 596 },
  { number: 95, name: "التين", nameEn: "At-Tin", startPage: 597 },
  { number: 96, name: "العلق", nameEn: "Al-'Alaq", startPage: 597 },
  { number: 97, name: "القدر", nameEn: "Al-Qadr", startPage: 598 },
  { number: 98, name: "البينة", nameEn: "Al-Bayyinah", startPage: 598 },
  { number: 99, name: "الزلزلة", nameEn: "Az-Zalzalah", startPage: 599 },
  { number: 100, name: "العاديات", nameEn: "Al-'Adiyat", startPage: 599 },
  { number: 101, name: "القارعة", nameEn: "Al-Qari'ah", startPage: 600 },
  { number: 102, name: "التكاثر", nameEn: "At-Takathur", startPage: 600 },
  { number: 103, name: "العصر", nameEn: "Al-'Asr", startPage: 601 },
  { number: 104, name: "الهمزة", nameEn: "Al-Humazah", startPage: 601 },
  { number: 105, name: "الفيل", nameEn: "Al-Fil", startPage: 601 },
  { number: 106, name: "قريش", nameEn: "Quraysh", startPage: 602 },
  { number: 107, name: "الماعون", nameEn: "Al-Ma'un", startPage: 602 },
  { number: 108, name: "الكوثر", nameEn: "Al-Kawthar", startPage: 602 },
  { number: 109, name: "الكافرون", nameEn: "Al-Kafirun", startPage: 603 },
  { number: 110, name: "النصر", nameEn: "An-Nasr", startPage: 603 },
  { number: 111, name: "المسد", nameEn: "Al-Masad", startPage: 603 },
  { number: 112, name: "الإخلاص", nameEn: "Al-Ikhlas", startPage: 604 },
  { number: 113, name: "الفلق", nameEn: "Al-Falaq", startPage: 604 },
  { number: 114, name: "الناس", nameEn: "An-Nas", startPage: 604 },
];

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
  const surah = surahIndex.find(s => s.number === surahNumber);
  if (!surah) return { juz: 1, page: 1 };
  
  const juz = juzData.find(j => surah.startPage >= j.startPage && surah.startPage <= j.endPage);
  return {
    juz: juz ? juz.number : 1,
    page: surah.startPage
  };
};

export const getQuranPageImageUrl = (pageNumber: number | string | undefined | null, isTajweed: boolean = true): string => {
  return getQuranPageFallbackImageUrl(pageNumber, 0, isTajweed);
};

export const getQuranPageFallbackImageUrl = (pageNumber: number | string | undefined | null, level: number = 0, isTajweed: boolean = true): string => {
  if (!pageNumber) return "";
  const paddedPage = String(pageNumber).padStart(3, '0');
  
  const sources: string[] = [];
  
  if (isTajweed) {
    sources.push(`https://jahedev.github.io/tajweed-quran-pages/hafs/tajweed-${paddedPage}.jpg`);
    sources.push(`https://raw.githubusercontent.com/Jahedev/tajweed-quran-pages/main/hafs/tajweed-${paddedPage}.jpg`);
  }
  
  // Standard fallback sources (always add these as lower priority)
  sources.push(`https://android.quran.com/data/width_1260/page${paddedPage}.png`);
  sources.push(`https://android.quran.com/data/width_1024/page${paddedPage}.png`);
  sources.push(`https://madinah-quran.com/pages/${paddedPage}.png`);

  return sources[level % sources.length];
};
