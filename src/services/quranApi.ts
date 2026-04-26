export const fetchVerseWords = async (verseKey: string, lang: 'en' | 'ar') => {
  const res = await fetch(
    `https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_translation_language=${lang}`
  );

  if (!res.ok) throw new Error("Failed to fetch verse");

  return res.json();
};

export const fetchTafsir = async (verseKey: string) => {
  // Tafsir Al-Muyassar (ID: 169 is commonly used)
  const res = await fetch(
    `https://api.quran.com/api/v4/tafsirs/169/by_ayah/${verseKey}`
  );

  if (!res.ok) throw new Error("Failed to fetch tafsir");

  return res.json();
};