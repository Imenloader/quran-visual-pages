/**
 * Normalizes Arabic text by removing diacritics and unifying similar characters.
 */
export const normalizeArabic = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/[ًٌٍَُِّْ]/g, "") // Remove diacritics
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىي]/g, "ي")
    .replace(/[ؤئ]/g, "ء")
    .replace(/ـ/g, "") // Remove kashida
    .replace(/\s+/g, " ") // Normalize spaces
    .toLowerCase()
    .trim();
};
