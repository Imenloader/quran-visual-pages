import { useQuery } from "@tanstack/react-query";
import { fetchTafsir } from "@/services/quranApi";

export const useTafsir = (verseKey?: string) => {
  return useQuery({
    queryKey: ['tafsir', verseKey],
    enabled: !!verseKey,
    queryFn: async () => {
      if (!verseKey) throw new Error("Missing verseKey");
      const res = await fetchTafsir(verseKey);
      return res.tafsir?.text || "غير متوفر";
    },
    staleTime: 1000 * 60 * 60 * 24 // cache tafsir longer
  });
};