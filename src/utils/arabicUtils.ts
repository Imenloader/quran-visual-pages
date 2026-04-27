export const normalizeArabic = (text?: string): string => {
  if (!text) return "";
  
  return text
    // Convert Dagger Alif to regular Alif BEFORE removing diacritics
    .replace(/\u0670/g, "ا")
    // Remove all Arabic diacritics (harakat, sukoon, shadda, maddah, etc.)
    // Note: removed \u0670 from this regex since we handled it above
    .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
    // Unify all forms of Alif into a single bare Alif
    .replace(/[أإآٱ]/g, "ا")
    // Unify Yaa variants (Alef Maksura, Farsi Yaa, Yaa with Hamza) into standard Yaa
    // Note: added ئ to be unified with ي to fix "ملائكة" matching "ملئكة"
    .replace(/[ىيئ]/g, "ي")
    // Unify Taa Marbouta to Haa (optional, makes matching more resilient)
    .replace(/ة/g, "ه")
    // Remove Tatweel (Kashida)
    .replace(/ـ/g, "")
    // Remove any zero-width spaces or formatting characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
};
