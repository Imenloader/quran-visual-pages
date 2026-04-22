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
