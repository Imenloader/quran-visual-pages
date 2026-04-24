/**
 * Normalizes Arabic text by removing diacritics and unifying similar characters.
 */
export const normalizeArabic = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, "") // Remove all diacritics, small signs, and ornaments
    .replace(/[أإآٱ]/g, "ا") // Normalize all Alefs including Wasla
    .replace(/[ة]/g, "ه")
    .replace(/[ىي]/g, "ي")
    .replace(/[ؤئ]/g, "ء")
    .replace(/ـ/g, "") // Remove kashida
    .replace(/\s+/g, " ") // Normalize spaces
    .toLowerCase()
    .trim();
};
