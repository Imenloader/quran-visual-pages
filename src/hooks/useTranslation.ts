import { useQuery } from "@tanstack/react-query";
import { translateIslamic } from "@/services/translationService";

export const useTranslation = (
  english?: string,
  arabic?: string
) => {
  return useQuery({
    queryKey: ['translation', english, arabic],
    enabled: !!english || !!arabic,
    queryFn: () => translateIslamic(english, arabic),
    staleTime: Infinity, // 🔥 offline caching
  });
};