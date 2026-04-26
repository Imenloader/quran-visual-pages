import { useQuery } from "@tanstack/react-query";
import { fetchVerseWords } from "@/services/quranApi";

const normalize = (t: string) =>
  t.replace(/[\u064B-\u065F]/g, "").replace(/[^\u0621-\u064A]/g, "");

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

      const match = (arr: any[]) =>
        arr[index] && normalize(arr[index].text_uthmani) === normalized
          ? arr[index]
          : arr.find(w => normalize(w.text_uthmani) === normalized) || arr[0];

      const enWord = match(enWords);
      const arWord = match(arWords);

      return {
        verseKey,
        word: enWord,
        arabicMeaning: arWord.translation?.text,
        englishMeaning: enWord.translation?.text,
        juz: en.verse.juz_number
      };
    },
    staleTime: 1000 * 60 * 60
  });
};