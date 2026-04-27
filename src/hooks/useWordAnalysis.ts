import { useQuery } from "@tanstack/react-query";
import { fetchVerseWords } from "@/services/quranApi";

import { normalizeArabic as normalize } from "@/utils/arabicUtils";

export const useWordAnalysis = (
  surah: number,
  ayah: number,
  word: string,
  index: number
) => {
  return useQuery({
    queryKey: ['word-analysis', surah, ayah, index],
    queryFn: async () => {
      const verseKey = `${surah}:${ayah}`;

      const [en, ar] = await Promise.all([
        fetchVerseWords(verseKey, 'en'),
        fetchVerseWords(verseKey, 'ar')
      ]);

      const enWords = en.verse.words;
      const arWords = ar.verse.words;

      const normalized = normalize(word);

      const match = (arr: any[]) => {
        if (!arr || arr.length === 0) return null;
        const textToMatch = (w: any) => normalize(w.text_uthmani || w.text);
        if (arr[index] && textToMatch(arr[index]) === normalized) {
          return arr[index];
        }
        return arr.find((w: any) => textToMatch(w) === normalized) || arr[0];
      };

      const enWord = match(enWords);
      const arWord = match(arWords);

      return {
        verseKey,
        word: enWord,
        arabicMeaning: arWord?.translation?.text,
        englishMeaning: enWord?.translation?.text,
        juz: en.verse.juz_number
      };
    },
    staleTime: 1000 * 60 * 60
  });
};