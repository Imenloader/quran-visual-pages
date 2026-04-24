import { fetchWithCache } from "@/lib/apiClient";

export interface TafsirResponse {
  text: string;
  source: string;
}

export async function fetchTafsir(surah: number, ayah: number, signal?: AbortSignal): Promise<TafsirResponse> {
  const verseKey = `${surah}:${ayah}`;
  
  // Try multiple Arabic tafsirs in order of quality/reliability
  const tafsirIds = [16, 169, 14]; // 16: Muyassar, 169: Jalalayn (Arabic), 14: Jalalayn (Alternate)
  
  for (const id of tafsirIds) {
    try {
      const data = await fetchWithCache(`https://api.quran.com/api/v4/tafsirs/${id}/by_ayah/${verseKey}`, { signal, timeout: 5000 });
      if (data && data.tafsir && data.tafsir.text) {
        // Clean text from HTML and any potential non-Arabic remnants (though these are Arabic tafsirs)
        const cleanText = data.tafsir.text.replace(/<[^>]*>?/gm, '').trim();
        if (cleanText) {
          return { text: cleanText, source: `Quran.com (${id === 16 ? "الميسر" : "الجلالين"})` };
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message === "Request aborted") throw e;
      continue;
    }
  }

  // Fallback to QuranEnc.com (Arabic Muyassar)
  try {
    const data = await fetchWithCache(`https://quranenc.com/api/v1/translation/ayah/arabic_moyassar/${surah}/${ayah}`, { signal, timeout: 5000 });
    if (data && data.result && data.result.translation) {
      return { text: data.result.translation, source: "QuranEnc.com (الميسر)" };
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Request aborted") throw e;
  }

  throw new Error("Failed to fetch Arabic tafsir from all available sources");
}

export async function fetchAyahText(surah: number, ayah: number, signal?: AbortSignal): Promise<string> {
  const verseKey = `${surah}:${ayah}`;
  
  try {
    const data = await fetchWithCache(`https://api.quran.com/api/v4/quran/verses/uthmani?verse_key=${verseKey}`, { signal, timeout: 8000 });
    if (data && data.verses && data.verses.length > 0) {
      return data.verses[0].text_uthmani;
    }
  } catch (e) {
    if (e instanceof Error && e.message === "Request aborted") throw e;
    console.warn("Quran.com Ayah text fetch failed, trying fallback...", e);
  }

  try {
    const data = await fetchWithCache(`https://quranenc.com/api/v1/translation/ayah/arabic_moyassar/${surah}/${ayah}`, { signal, timeout: 8000 });
    if (data && data.result && data.result.translation) {
      return data.result.translation;
    }
  } catch (e) {
    console.warn("QuranEnc fallback failed", e);
  }

  return "";
}
