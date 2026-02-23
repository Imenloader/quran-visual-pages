export interface JuzInfo {
  number: number;
  nameAr: string;
  startPage: number;
  endPage: number;
  startSurah: string;
}

export const juzData: JuzInfo[] = [
  { number: 1, nameAr: "الجزء الأول", startPage: 1, endPage: 21, startSurah: "الفاتحة" },
  { number: 2, nameAr: "الجزء الثاني", startPage: 22, endPage: 41, startSurah: "البقرة 142" },
  { number: 3, nameAr: "الجزء الثالث", startPage: 42, endPage: 61, startSurah: "البقرة 253" },
  { number: 4, nameAr: "الجزء الرابع", startPage: 62, endPage: 81, startSurah: "آل عمران 93" },
  { number: 5, nameAr: "الجزء الخامس", startPage: 82, endPage: 101, startSurah: "النساء 24" },
  { number: 6, nameAr: "الجزء السادس", startPage: 102, endPage: 121, startSurah: "النساء 148" },
  { number: 7, nameAr: "الجزء السابع", startPage: 122, endPage: 141, startSurah: "المائدة 82" },
  { number: 8, nameAr: "الجزء الثامن", startPage: 142, endPage: 161, startSurah: "الأنعام 111" },
  { number: 9, nameAr: "الجزء التاسع", startPage: 162, endPage: 181, startSurah: "الأعراف 88" },
  { number: 10, nameAr: "الجزء العاشر", startPage: 182, endPage: 201, startSurah: "الأنفال 41" },
  { number: 11, nameAr: "الجزء الحادي عشر", startPage: 202, endPage: 221, startSurah: "التوبة 93" },
  { number: 12, nameAr: "الجزء الثاني عشر", startPage: 222, endPage: 241, startSurah: "هود 6" },
  { number: 13, nameAr: "الجزء الثالث عشر", startPage: 242, endPage: 261, startSurah: "يوسف 53" },
  { number: 14, nameAr: "الجزء الرابع عشر", startPage: 262, endPage: 281, startSurah: "الحجر 1" },
  { number: 15, nameAr: "الجزء الخامس عشر", startPage: 282, endPage: 301, startSurah: "الإسراء 1" },
  { number: 16, nameAr: "الجزء السادس عشر", startPage: 302, endPage: 321, startSurah: "الكهف 75" },
  { number: 17, nameAr: "الجزء السابع عشر", startPage: 322, endPage: 341, startSurah: "الأنبياء 1" },
  { number: 18, nameAr: "الجزء الثامن عشر", startPage: 342, endPage: 361, startSurah: "المؤمنون 1" },
  { number: 19, nameAr: "الجزء التاسع عشر", startPage: 362, endPage: 381, startSurah: "الفرقان 21" },
  { number: 20, nameAr: "الجزء العشرون", startPage: 382, endPage: 401, startSurah: "النمل 56" },
  { number: 21, nameAr: "الجزء الحادي والعشرون", startPage: 402, endPage: 421, startSurah: "العنكبوت 46" },
  { number: 22, nameAr: "الجزء الثاني والعشرون", startPage: 422, endPage: 441, startSurah: "الأحزاب 31" },
  { number: 23, nameAr: "الجزء الثالث والعشرون", startPage: 442, endPage: 461, startSurah: "يس 28" },
  { number: 24, nameAr: "الجزء الرابع والعشرون", startPage: 462, endPage: 481, startSurah: "الزمر 32" },
  { number: 25, nameAr: "الجزء الخامس والعشرون", startPage: 482, endPage: 501, startSurah: "فصلت 47" },
  { number: 26, nameAr: "الجزء السادس والعشرون", startPage: 502, endPage: 521, startSurah: "الأحقاف 1" },
  { number: 27, nameAr: "الجزء السابع والعشرون", startPage: 522, endPage: 541, startSurah: "الذاريات 31" },
  { number: 28, nameAr: "الجزء الثامن والعشرون", startPage: 542, endPage: 561, startSurah: "المجادلة 1" },
  { number: 29, nameAr: "الجزء التاسع والعشرون", startPage: 562, endPage: 581, startSurah: "الملك 1" },
  { number: 30, nameAr: "الجزء الثلاثون", startPage: 582, endPage: 604, startSurah: "النبأ 1" },
];

export const toArabicNumber = (num: number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicDigits[parseInt(d)]).join('');
};

export const getQuranPageImageUrl = (pageNumber: number): string => {
  const paddedPage = pageNumber.toString().padStart(3, '0');
  return `https://jahedev.github.io/tajweed-quran-pages/hafs/tajweed-${paddedPage}.jpg`;
};
