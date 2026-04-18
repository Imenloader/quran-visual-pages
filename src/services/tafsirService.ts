import { fetchWithCache } from "@/lib/apiClient";

export interface TafsirResponse {
  text: string;
  source: string;
}

export async function fetchTafsir(surah: number, ayah: number, signal?: AbortSignal): Promise<TafsirResponse> {
  const verseKey = `${surah}:${ayah}`;
  
  // Source 1: AlQuran.cloud (Primary)
  try {
    const data = await fetchWithCache(`https://api.alquran.cloud/v1/ayah/${verseKey}/ar.muyassar`, { signal, timeout: 8000 });
    if (data && data.code === 200 && data.data && data.data.text) {
      return { text: data.data.text, source: "AlQuran.cloud" };
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Request aborted") throw e;
    console.warn("AlQuran.cloud Tafsir fetch failed, trying fallback...", e);
  }

  // Source 2: Quran.com API (Fallback 1)
  try {
    const data = await fetchWithCache(`https://api.quran.com/api/v4/tafsirs/169/by_ayah/${verseKey}`, { signal, timeout: 8000 });
    if (data && data.tafsir && data.tafsir.text) {
      return { text: data.tafsir.text.replace(/<[^>]*>?/gm, ''), source: "Quran.com" };
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Request aborted") throw e;
    console.warn("Quran.com Tafsir fetch failed, trying next fallback...", e);
  }

  // Source 3: QuranEnc.com (Fallback 2)
  try {
    const data = await fetchWithCache(`https://quranenc.com/api/v1/translation/ayah/arabic_moyassar/${surah}/${ayah}`, { signal, timeout: 8000 });
    if (data && data.result && data.result.translation) {
      return { text: data.result.translation, source: "QuranEnc.com" };
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Request aborted") throw e;
    console.warn("QuranEnc Tafsir fetch failed", e);
  }

  throw new Error("Failed to fetch tafsir from all available sources");
}

export async function fetchAyahText(surah: number, ayah: number, signal?: AbortSignal): Promise<string> {
  const verseKey = `${surah}:${ayah}`;
  
  try {
    const data = await fetchWithCache(`https://api.alquran.cloud/v1/ayah/${verseKey}/ar.quran-simple`, { signal, timeout: 8000 });
    if (data && data.code === 200 && data.data && data.data.text) {
      return data.data.text;
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Request aborted") throw e;
    console.warn("AlQuran.cloud Ayah text fetch failed, trying fallback...", e);
  }

  try {
    const data = await fetchWithCache(`https://api.quran.com/api/v4/quran/verses/uthmani?verse_key=${verseKey}`, { signal, timeout: 8000 });
    if (data && data.verses && data.verses.length > 0) {
      return data.verses[0].text_uthmani;
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Request aborted") throw e;
    console.warn("Quran.com Ayah text fetch failed", e);
  }

  return "";
}
