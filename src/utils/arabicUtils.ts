export const normalizeArabic = (text?: string): string => {
  if (!text) return "";
  
  return text
    // Remove all Arabic diacritics (harakat, sukoon, shadda, maddah, dagger alif, etc.)
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
    // Unify all forms of Alif into a single bare Alif
    .replace(/[أإآٱ]/g, "ا")
    // Unify Yaa variants (Alef Maksura, Farsi Yaa) into standard Yaa
    .replace(/[ىي]/g, "ي")
    // Unify Taa Marbouta to Haa (optional, makes matching more resilient)
    .replace(/ة/g, "ه")
    // Remove Tatweel (Kashida)
    .replace(/ـ/g, "")
    // Remove any zero-width spaces or formatting characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
};
