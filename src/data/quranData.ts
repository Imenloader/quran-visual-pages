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
  startPage: number;
}

export const surahIndex: SurahInfo[] = [
  { number: 1, name: "الفاتحة", startPage: 1 },
  { number: 2, name: "البقرة", startPage: 2 },
  { number: 3, name: "آل عمران", startPage: 50 },
  { number: 4, name: "النساء", startPage: 77 },
  { number: 5, name: "المائدة", startPage: 106 },
  { number: 6, name: "الأنعام", startPage: 128 },
  { number: 7, name: "الأعراف", startPage: 151 },
  { number: 8, name: "الأنفال", startPage: 177 },
  { number: 9, name: "التوبة", startPage: 187 },
  { number: 10, name: "يونس", startPage: 208 },
  { number: 11, name: "هود", startPage: 221 },
  { number: 12, name: "يوسف", startPage: 235 },
  { number: 13, name: "الرعد", startPage: 249 },
  { number: 14, name: "إبراهيم", startPage: 255 },
  { number: 15, name: "الحجر", startPage: 262 },
  { number: 16, name: "النحل", startPage: 267 },
  { number: 17, name: "الإسراء", startPage: 282 },
  { number: 18, name: "الكهف", startPage: 293 },
  { number: 19, name: "مريم", startPage: 305 },
  { number: 20, name: "طه", startPage: 312 },
  { number: 21, name: "الأنبياء", startPage: 322 },
  { number: 22, name: "الحج", startPage: 332 },
  { number: 23, name: "المؤمنون", startPage: 342 },
  { number: 24, name: "النور", startPage: 350 },
  { number: 25, name: "الفرقان", startPage: 359 },
  { number: 26, name: "الشعراء", startPage: 367 },
  { number: 27, name: "النمل", startPage: 377 },
  { number: 28, name: "القصص", startPage: 385 },
  { number: 29, name: "العنكبوت", startPage: 396 },
  { number: 30, name: "الروم", startPage: 404 },
  { number: 31, name: "لقمان", startPage: 411 },
  { number: 32, name: "السجدة", startPage: 415 },
  { number: 33, name: "الأحزاب", startPage: 418 },
  { number: 34, name: "سبأ", startPage: 428 },
  { number: 35, name: "فاطر", startPage: 434 },
  { number: 36, name: "يس", startPage: 440 },
  { number: 37, name: "الصافات", startPage: 446 },
  { number: 38, name: "ص", startPage: 453 },
  { number: 39, name: "الزمر", startPage: 458 },
  { number: 40, name: "غافر", startPage: 467 },
  { number: 41, name: "فصلت", startPage: 477 },
  { number: 42, name: "الشورى", startPage: 483 },
  { number: 43, name: "الزخرف", startPage: 489 },
  { number: 44, name: "الدخان", startPage: 496 },
  { number: 45, name: "الجاثية", startPage: 499 },
  { number: 46, name: "الأحقاف", startPage: 502 },
  { number: 47, name: "محمد", startPage: 507 },
  { number: 48, name: "الفتح", startPage: 511 },
  { number: 49, name: "الحجرات", startPage: 515 },
  { number: 50, name: "ق", startPage: 518 },
  { number: 51, name: "الذاريات", startPage: 520 },
  { number: 52, name: "الطور", startPage: 523 },
  { number: 53, name: "النجم", startPage: 526 },
  { number: 54, name: "القمر", startPage: 528 },
  { number: 55, name: "الرحمن", startPage: 531 },
  { number: 56, name: "الواقعة", startPage: 534 },
  { number: 57, name: "الحديد", startPage: 537 },
  { number: 58, name: "المجادلة", startPage: 542 },
  { number: 59, name: "الحشر", startPage: 545 },
  { number: 60, name: "الممتحنة", startPage: 549 },
  { number: 61, name: "الصف", startPage: 551 },
  { number: 62, name: "الجمعة", startPage: 553 },
  { number: 63, name: "المنافقون", startPage: 554 },
  { number: 64, name: "التغابن", startPage: 556 },
  { number: 65, name: "الطلاق", startPage: 558 },
  { number: 66, name: "التحريم", startPage: 560 },
  { number: 67, name: "الملك", startPage: 562 },
  { number: 68, name: "القلم", startPage: 564 },
  { number: 69, name: "الحاقة", startPage: 566 },
  { number: 70, name: "المعارج", startPage: 568 },
  { number: 71, name: "نوح", startPage: 570 },
  { number: 72, name: "الجن", startPage: 572 },
  { number: 73, name: "المزمل", startPage: 574 },
  { number: 74, name: "المدثر", startPage: 575 },
  { number: 75, name: "القيامة", startPage: 577 },
  { number: 76, name: "الإنسان", startPage: 578 },
  { number: 77, name: "المرسلات", startPage: 580 },
  { number: 78, name: "النبأ", startPage: 582 },
  { number: 79, name: "النازعات", startPage: 583 },
  { number: 80, name: "عبس", startPage: 585 },
  { number: 81, name: "التكوير", startPage: 586 },
  { number: 82, name: "الانفطار", startPage: 587 },
  { number: 83, name: "المطففين", startPage: 587 },
  { number: 84, name: "الانشقاق", startPage: 589 },
  { number: 85, name: "البروج", startPage: 590 },
  { number: 86, name: "الطارق", startPage: 591 },
  { number: 87, name: "الأعلى", startPage: 591 },
  { number: 88, name: "الغاشية", startPage: 592 },
  { number: 89, name: "الفجر", startPage: 593 },
  { number: 90, name: "البلد", startPage: 594 },
  { number: 91, name: "الشمس", startPage: 595 },
  { number: 92, name: "الليل", startPage: 595 },
  { number: 93, name: "الضحى", startPage: 596 },
  { number: 94, name: "الشرح", startPage: 596 },
  { number: 95, name: "التين", startPage: 597 },
  { number: 96, name: "العلق", startPage: 597 },
  { number: 97, name: "القدر", startPage: 598 },
  { number: 98, name: "البينة", startPage: 598 },
  { number: 99, name: "الزلزلة", startPage: 599 },
  { number: 100, name: "العاديات", startPage: 599 },
  { number: 101, name: "القارعة", startPage: 600 },
  { number: 102, name: "التكاثر", startPage: 600 },
  { number: 103, name: "العصر", startPage: 601 },
  { number: 104, name: "الهمزة", startPage: 601 },
  { number: 105, name: "الفيل", startPage: 601 },
  { number: 106, name: "قريش", startPage: 602 },
  { number: 107, name: "الماعون", startPage: 602 },
  { number: 108, name: "الكوثر", startPage: 602 },
  { number: 109, name: "الكافرون", startPage: 603 },
  { number: 110, name: "النصر", startPage: 603 },
  { number: 111, name: "المسد", startPage: 603 },
  { number: 112, name: "الإخلاص", startPage: 604 },
  { number: 113, name: "الفلق", startPage: 604 },
  { number: 114, name: "الناس", startPage: 604 },
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

export const toArabicNumber = (num: number | string | undefined | null): string => {
  const n = String(num ?? "");
  if (!n) return "";
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return n.split('').map(d => {
    const digit = parseInt(d);
    return isNaN(digit) ? d : arabicDigits[digit];
  }).join('');
};

export const getQuranPageImageUrl = (pageNumber: number | string | undefined | null): string => {
  if (!pageNumber) return "";
  const paddedPage = String(pageNumber).padStart(3, '0');
  return `https://jahedev.github.io/tajweed-quran-pages/hafs/tajweed-${paddedPage}.jpg`;
};
