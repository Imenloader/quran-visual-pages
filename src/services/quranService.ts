import { fetchWithCache } from "@/lib/apiClient";

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction: string | null;
}

export interface Moshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  surah_list: string;
}

export interface Reciter {
  id: number;
  name: string;
  letter: string;
  moshaf: Moshaf[];
}

export const fetchAudioEditions = async (): Promise<Edition[]> => {
  const data = await fetchWithCache("https://api.alquran.cloud/v1/edition?format=audio&type=versebyverse", {});
  if (data.code === 200) {
    return data.data;
  }
  return [];
};

export const fetchSurahAudio = async (surahId: number, edition: string) => {
  return await fetchWithCache(`https://api.alquran.cloud/v1/surah/${surahId}/${edition}?audio=1`, {});
};

export const fetchSurahText = async (surahId: number) => {
  return await fetchWithCache(`https://api.alquran.cloud/v1/surah/${surahId}`, {});
};

interface RecitersApiResponse {
  reciters?: Reciter[];
}

export const fetchReciters = async (language = "ar"): Promise<Reciter[]> => {
  try {
    const data = await fetchWithCache(`https://mp3quran.net/api/v3/reciters?language=${language}`, {
      expiry: 7 * 24 * 60 * 60 * 1000 // Cache for 7 days
    });
    return (data.reciters ?? []).filter((reciter: any) => Array.isArray(reciter.moshaf) && reciter.moshaf.length > 0);
  } catch (error) {
    console.error("Error fetching reciters:", error);
    return [];
  }
};
