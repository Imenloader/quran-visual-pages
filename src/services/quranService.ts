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
  try {
    const data = await fetchWithCache("https://api.quran.com/api/v4/resources/recitations?language=ar", {});
    if (data && data.recitations) {
      return data.recitations.map((r: any) => ({
        identifier: r.id.toString(),
        name: r.translated_name?.name || r.reciter_name,
        englishName: r.reciter_name,
        format: "audio",
        type: "versebyverse"
      }));
    }
  } catch (e) {
    console.error("Quran.com API error:", e);
  }
  return [];
};

export const fetchSurahAudio = async (surahId: number, edition: string) => {
  return await fetchWithCache(`https://api.quran.com/api/v4/chapter_recitations/${edition}/${surahId}?per_page=300`, {});
};

export const fetchChapterAudio = async (chapterId: number, recitationId: string) => {
  return await fetchWithCache(`https://api.quran.com/api/v4/recitations/${recitationId}/by_chapter/${chapterId}?per_page=300`, {});
};

export const fetchJuzAudio = async (juzId: number, recitationId: string) => {
  return await fetchWithCache(`https://api.quran.com/api/v4/recitations/${recitationId}/by_juz/${juzId}?per_page=300`, {});
};

export const fetchSurahText = async (surahId: number) => {
  const data = await fetchWithCache(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}&per_page=300`, {});
  return { code: 200, data: { ayahs: data.verses.map((v: any) => ({ text: v.text_uthmani, numberInSurah: v.verse_number })) } };
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

export const fetchPageVerses = async (pageNumber: number) => {
  const url = `https://api.quran.com/api/v4/quran/verses/uthmani?page_number=${pageNumber}`;
  
  // Try Cache API first (Offline Bundle)
  if ("caches" in window) {
    try {
      const cache = await caches.open("quran-text-cache");
      const match = await cache.match(url);
      if (match) {
        const data = await match.json();
        if (data && data.verses) {
          return data.verses.map((v: any) => ({ 
            text: v.text_uthmani, 
            numberInSurah: v.verse_number,
            verseKey: v.verse_key 
          }));
        }
      }
    } catch (e) {
      console.warn("Offline text cache check failed", e);
    }
  }

  const data = await fetchWithCache(url, {
    expiry: 30 * 24 * 60 * 60 * 1000 // Cache for 30 days
  });
  if (data && data.verses) {
    return data.verses.map((v: any) => ({ 
      text: v.text_uthmani, 
      numberInSurah: v.verse_number,
      verseKey: v.verse_key 
    }));
  }
  return [];
};

/**
 * Gets a stable audio URL for a specific verse.
 * Uses everyayah.com for high reliability and consistent naming.
 */
export const getVerseAudioUrl = (verseKey: string, reciter = "Alafasy_128kbps") => {
  const [surah, ayah] = verseKey.split(":").map(n => n.padStart(3, "0"));
  return `https://everyayah.com/data/${reciter}/${surah}${ayah}.mp3`;
};
