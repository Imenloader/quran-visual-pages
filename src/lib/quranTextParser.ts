import { juzData, surahIndex , surahByName} from '@/data/quranData';
import { normalizeArabic } from "./arabicUtils";

export interface ParsedVerseData {
  text: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  fullKey: string;
  isFirstAyah?: boolean;
  showBasmalah?: boolean;
}

export const parseJuzTextToVerses = (localText: string | null, currentJuz: number | null): ParsedVerseData[] => {
  if (!localText || !currentJuz) return [];

  const juzInfo = juzData[currentJuz - 1];
  if (!juzInfo) return [];

  const surahNames = juzInfo.surahs;
  
  // Defensive normalization: in some environments/fonts, a few Quran diacritics
  // are accidentally persisted as visually-similar but incorrect glyphs.
  // 1) Convert Arabic-context %/٪ back to standard dammatan (ٌ).
  // 2) Convert accidental U+065E (ٞ) back to standard dammatan (ٌ).
  // 3) Convert accidental U+0657 (ٗ) usage back to standard fathatan (ً).
  // 4) Convert accidental U+0656 (ٖ) usage back to standard kasratan (ٍ).
  const normalizedText = localText
    .replace(/[%٪]/gu, "\u064C")
    .replace(/\u065E/gu, "\u064C")
    .replace(/\u0657/gu, "\u064B")
    .replace(/\u0656/gu, "\u064D")
    // Remove standalone Surah header lines (handling potential \r and trailing spaces)
    .replace(/^\s*سُ?ورَ[ةه]ُ?.*$/gm, "")
    // Remove Surah headers that are on the same line as the Basmalah or verse
    .replace(/سُ?ورَ[ةه]ُ?\s+[^\n(]{1,40}?(?=\s+ب[ِـِّ]*سۡمِ|\s+ب[ِـِّ]*سم|\s*بِسۡمِ|\s*بِّسۡمِ|[\(\[﴿])/gu, "");

  const lines = normalizedText.split("\n").filter(line => line.trim().length > 0);
  const result: ParsedVerseData[] = [];
  let currentSurahIdx = 0;

  const BASMALAH_REGEX = /^\s*ب[\u0650\u06EA-\u06ED]*س[\u0652\u06EA-\u06ED]*م[\u0650\u06EA-\u06ED]*\s+[\u0671\u0627]ل[\u0651\u06EA-\u06ED]*ل[\u064E\u064F\u0650\u0652\u06EA-\u06ED]*ه[\u0650\u064F\u064E\u0652\u06EA-\u06ED]*\s+ٱ?لر[\u0651\u06EA-\u06ED]*ح[\u0652\u06EA-\u06ED]*م[\u064E\u064F\u0650\u06EA-\u06ED]*ن[\u0650\u064E\u064F\u0652\u0670\u06EA-\u06ED]*\s+ٱ?لر[\u0651\u06EA-\u06ED]*ح[\u0652\u06EA-\u06ED]*ي[\u0650\u064E\u064F\u0652\u06EA-\u06ED]*م[\u0650\u064E\u064F\u0652\u06EA-\u06ED]*\s*/u;
  const splitRegex = /(۝\s*[\u0660-\u0669\u06F0-\u06F9\d]+|[([﴿][\u0660-\u0669\u06F0-\u06F9\d]+[)\]﴾])/g;

  const appendFragmentToVerseText = (verseText: string, fragment: string): string => {
    const markerMatch = verseText.match(/\s\((\d+)\)\s*$/);
    if (!markerMatch) return `${verseText} ${fragment}`.trim();
    const marker = markerMatch[0];
    const base = verseText.slice(0, -marker.length).trim();
    return `${base} ${fragment}${marker}`.trim();
  };

  const cleanHeaderAndBasmalah = (text: string, surahNum: number, ayahNum: number): { cleaned: string, hasBasmalah: boolean } => {
    let cleaned = text.trim();
    let hasBasmalah = false;

    // 1. Remove Surah header if present anywhere in the start of the text for ayah 1
    if (ayahNum === 1) {
      cleaned = cleaned.replace(/^\s*سُ?ورَ[ةه]ُ?\s+[^\n(]{1,40}?(?=\s+ب[ِـِّ]*سۡمِ|\s+ب[ِـِّ]*سم|\s*بِسۡمِ|\s*بِّسۡمِ|[\(\[﴿]|$)/u, "").trim();
    }

    // 2. Remove Basmalah if present (except for Al-Fatihah and At-Tawbah)
    if (ayahNum === 1 && surahNum !== 1 && surahNum !== 9) {
      const normalizedBasmalah = "بسم الله الرحمن الرحيم";
      const normalizedContent = normalizeArabic(cleaned);
      
      if (normalizedContent.startsWith(normalizedBasmalah)) {
        const words = cleaned.split(/\s+/);
        // Try to find the exact word boundary where the Basmalah ends
        for (let i = 1; i <= Math.min(words.length, 6); i++) {
          const prefix = words.slice(0, i).join(" ");
          if (normalizeArabic(prefix) === normalizedBasmalah) {
            cleaned = words.slice(i).join(" ").trim();
            hasBasmalah = true;
            break;
          }
        }
      }
      
      // Fallback to regex if word check didn't catch it
      if (!hasBasmalah && BASMALAH_REGEX.test(cleaned)) {
        cleaned = cleaned.replace(BASMALAH_REGEX, "").trim();
        hasBasmalah = true;
      }
    }

    return { cleaned, hasBasmalah };
  };

  let carryOverText = "";
  lines.forEach((rawLine) => {
    const line = `${carryOverText} ${rawLine}`.trim();
    carryOverText = "";
    const parts = line.split(splitRegex);

    for (let i = 0; i < parts.length; i += 2) {
      let text = parts[i]?.trim();
      const marker = parts[i + 1] || "";

      if (marker && text !== undefined) {
        const numMatch = marker.match(/[\d\u0660-\u0669\u06F0-\u06F9]+/);
        if (!numMatch) continue;

        const westernNum = numMatch[0].replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
        const ayahNumber = parseInt(westernNum);

        // More robust surah transition: ayah 1 OR ayah number decreased
        const lastAyah = result.length > 0 ? result[result.length - 1].ayahNumber : 0;
        if (result.length > 0 && (ayahNumber === 1 || ayahNumber < lastAyah) && currentSurahIdx < surahNames.length - 1) {
          // Verify it's not just a duplicate marker for the same surah
          if (ayahNumber !== lastAyah) {
            currentSurahIdx++;
          }
        }

        const surahName = surahNames[currentSurahIdx];
        const surahInfo = surahByName.get(surahName);
        const surahNumber = surahInfo ? surahInfo.number : 0;

        const { cleaned, hasBasmalah } = cleanHeaderAndBasmalah(text, surahNumber, ayahNumber);

        result.push({
          text: `${cleaned} (${ayahNumber})`,
          surahNumber,
          ayahNumber,
          surahName,
          fullKey: `${surahNumber}:${ayahNumber}`,
          isFirstAyah: ayahNumber === 1,
          showBasmalah: hasBasmalah
        });
      } else if (text) {
        // If it looks like a surah header, skip it
        if (/^\s*سُ?ورَ[ةه]ُ?\s+[^\n(]{1,40}$/u.test(text)) {
          continue;
        }
        carryOverText = `${carryOverText} ${text}`.trim();
      }
    }
  });

  if (carryOverText && result.length > 0) {
    const lastIndex = result.length - 1;
    result[lastIndex].text = appendFragmentToVerseText(result[lastIndex].text, carryOverText);
  }

  return result;
};
