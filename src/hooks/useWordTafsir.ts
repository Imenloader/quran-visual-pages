import { useQuery } from "@tanstack/react-query";
import { getWordTafsir } from "@/services/wordTafsirService";

export const useWordTafsir = (word: string) => {
  return useQuery({
    queryKey: ['word-tafsir', word],
    queryFn: () => getWordTafsir(word),
    enabled: !!word,
    staleTime: Infinity,
  });
};
