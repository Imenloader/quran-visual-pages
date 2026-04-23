import { fetchWithCache } from "@/lib/apiClient";

export interface TajweedVerse {
  id: number;
  verse_key: string;
  text_uthmani_tajweed: string;
}

export interface TajweedResponse {
  verses: TajweedVerse[];
}

/**
 * Service to fetch pre-annotated Tajweed text from Quran.com API
 */
export const tajweedService = {
  /**
   * Fetches Tajweed-encoded verses for a specific Juz
   */
  getJuzTajweed: async (juzNumber: number): Promise<Record<string, string>> => {
    try {
      const url = `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?juz_number=${juzNumber}`;
      const data = await fetchWithCache(url) as TajweedResponse;
      
      const verseMap: Record<string, string> = {};
      data.verses.forEach(v => {
        verseMap[v.verse_key] = v.text_uthmani_tajweed;
      });
      
      return verseMap;
    } catch (error) {
      console.error("Failed to fetch Tajweed data:", error);
      return {};
    }
  },

  /**
   * Fetches Tajweed-encoded verses for a specific Page
   */
  getPageTajweed: async (pageNumber: number): Promise<Record<string, string>> => {
    try {
      const url = `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?page_number=${pageNumber}`;
      const data = await fetchWithCache(url) as TajweedResponse;
      
      const verseMap: Record<string, string> = {};
      data.verses.forEach(v => {
        verseMap[v.verse_key] = v.text_uthmani_tajweed;
      });
      
      return verseMap;
    } catch (error) {
      console.error("Failed to fetch Tajweed data for page:", error);
      return {};
    }
  }
};
