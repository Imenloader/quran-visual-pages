/**
 * Normalizes Arabic text by removing diacritics and unifying similar characters.
 */
export const normalizeArabic = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670\u06E1\u06D6-\u06ED]/g, "") // Remove all diacritics and small signs
    .replace(/[أإآٱ]/g, "ا") // Normalize all Alefs including Wasla
    .replace(/ة/g, "ه")
    .replace(/[ىي]/g, "ي")
    .replace(/[ؤئ]/g, "ء")
    .replace(/ـ/g, "") // Remove kashida
    .replace(/\s+/g, " ") // Normalize spaces
    .toLowerCase()
    .trim();
};
