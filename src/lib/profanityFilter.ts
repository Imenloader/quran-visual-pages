/**
 * Profanity Filter Utility
 * Contains a foundational list of Arabic and Egyptian bad words.
 * Masks words and returns a flag indicating if profanity was found.
 */

const badWords = [
  // General Arabic Bad Words
  "شرموط", "شرموطة", "قحبة", "عرص", "متناك", "منيوك", "خول", "شاذ", "مخنث",
  "ابن الكلب", "ابن الوسخة", "ابن الشرموطة", "ابن القحبة", "ابن العرص",
  "كس", "زب", "طيز", "خرا", "نيك", "ينيك", "تناك", "عاهر", "عاهرة",
  
  // Egyptian Slang
  "احا", "أحا", "خخخ", "خخخخ", "يعم الغبي", "غبي", "حمار", "حيوان",
  "علق", "جلنف", "سيس", "مغفل", "عبيط", "اهبل", "أهبل", "ابن الاحبة", "ابن الأحبة",
  "شخاخ", "بضان", "بيض", "معرص", "سافل", "واطي", "زبالة", "ابن المتناكة"
];

// Create a regex from the bad words list
// Using \b to match exact words, but Arabic word boundaries can be tricky.
// We'll use a simpler matching that looks for the word surrounded by spaces or punctuation.
const escapedBadWords = badWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const profanityRegex = new RegExp(`(?:^|\\s|[.,!?;:])(${escapedBadWords.join('|')})(?=$|\\s|[.,!?;:])`, 'gi');

export const profanityFilter = {
  /**
   * Checks text for profanity and returns the masked text and a boolean flag.
   * @param text The input text to filter
   * @returns { maskedText: string, hasProfanity: boolean }
   */
  filter(text: string): { maskedText: string; hasProfanity: boolean } {
    if (!text) return { maskedText: text, hasProfanity: false };
    
    let hasProfanity = false;
    
    // We do a manual check to be safer with Arabic text
    let maskedText = text;
    for (const word of badWords) {
      // Regex to match the word exactly or as part of a larger word (optional depending on strictness)
      // For now, we do a global case-insensitive replace of the exact string.
      const regex = new RegExp(word, 'gi');
      if (regex.test(maskedText)) {
        hasProfanity = true;
        // Replace with asterisks of the same length
        maskedText = maskedText.replace(regex, '*'.repeat(word.length));
      }
    }

    return { maskedText, hasProfanity };
  }
};
