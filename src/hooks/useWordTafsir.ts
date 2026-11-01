import { useQuery } from "@tanstack/react-query";
import type { WordTafsir } from "@/services/wordTafsirService";

export const useWordTafsir = (word: string) => {
  return useQuery({
    queryKey: ['word-tafsir', word],
    // The 14.8 MB mujam dataset is lazy-loaded on first word lookup only
    queryFn: async (): Promise<WordTafsir | null> => {
      const { getWordTafsir } = await import("@/services/wordTafsirService");
      return getWordTafsir(word);
    },
    enabled: !!word,
    staleTime: Infinity,
  });
};
