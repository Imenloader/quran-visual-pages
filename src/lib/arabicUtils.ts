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
/**
 * Checks if two Arabic words/phrases are similar enough to be considered correct.
 * This handles minor variations that aren't memorization errors.
 */
export const areArabicWordsSimilar = (a: string, b: string): boolean => {
  const normA = normalizeArabic(a);
  const normB = normalizeArabic(b);
  
  if (normA === normB) return true;
  
  // Allow missing leading "wa" (و) or other minor prefixes if the core word is long enough
  if (normA.length > 4 && normB.length > 4) {
    if (normA.startsWith("و") && normA.substring(1) === normB) return true;
    if (normB.startsWith("و") && normB.substring(1) === normA) return true;
  }

  // Jaro-Winkler or Levenshtein distance could be used here for even smarter matching
  // For now, simple substring check for phrases
  if (normA.length > 10 && normB.length > 10) {
     return normA.includes(normB) || normB.includes(normA);
  }

  return false;
};
