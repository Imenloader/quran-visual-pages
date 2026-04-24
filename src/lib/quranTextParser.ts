import { juzData, surahIndex } from "@/data/quranData";

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
    // Remove Surah headers completely to avoid leakage
    .replace(/^سُ?ورَةُ?.*$/gm, "");

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

        if (ayahNumber === 1 && result.length > 0) {
          currentSurahIdx++;
        }

        const surahName = surahNames[currentSurahIdx] || surahNames[surahNames.length - 1];
        const surahInfo = surahIndex.find(s => s.name === surahName);
        const surahNumber = surahInfo ? surahInfo.number : 0;

        let hasBasmalah = false;
        
        // Exclude Al-Fatihah (1) and At-Tawbah (9) from basmalah stripping
        if (ayahNumber === 1 && surahNumber !== 1 && surahNumber !== 9) {
          if (BASMALAH_REGEX.test(text)) {
            text = text.replace(BASMALAH_REGEX, "").trim();
            hasBasmalah = true;
          }
        }

        result.push({
          text: `${text} (${ayahNumber})`,
          surahNumber,
          ayahNumber,
          surahName,
          fullKey: `${surahNumber}:${ayahNumber}`,
          isFirstAyah: ayahNumber === 1,
          showBasmalah: hasBasmalah
        });
      } else if (text) {
        if (/^سُ?ورَةُ?\s+/u.test(text)) {
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
