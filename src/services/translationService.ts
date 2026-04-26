const strictDictionary: Record<string, string> = {
  great: "عظيم",
  almighty: "القدير",
  allah: "الله",
  lord: "رب",
  merciful: "رحيم",
  compassionate: "رحمن",
};

const containsArabic = (text?: string) =>
  !!text && /[\u0600-\u06FF]/.test(text);

export const translateIslamic = async (
  english?: string,
  arabic?: string
): Promise<string> => {
  // ✅ Always trust Quran API Arabic first
  if (containsArabic(arabic)) return arabic!;

  if (!english) return "غير متوفر";

  const clean = english.toLowerCase().trim();

  // ✅ Strict dictionary (prevents bad translations)
  if (strictDictionary[clean]) return strictDictionary[clean];

  // ❌ Avoid external APIs unless absolutely necessary
  return english; // fallback: show original instead of wrong Arabic
};