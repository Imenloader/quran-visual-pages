import { describe, expect, it } from "vitest";
import { juzTextData } from "@/data/juzTextData";
import { parseJuzTextToVerses } from "@/lib/quranTextParser";

describe("parseJuzTextToVerses", () => {
  it("preserves Al-Fatihah ayat correctly including basmalah and اهدنا", () => {
    const verses = parseJuzTextToVerses(juzTextData[1], 1);
    const fatiha = verses.filter(v => v.surahNumber === 1).slice(0, 7);

    expect(fatiha).toHaveLength(7);
    expect(fatiha[0].text).toContain("بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ");
    expect(fatiha[0].text.endsWith("(1)")).toBe(true);
    expect(fatiha[5].text).toContain("ٱهۡدِنَا");
    expect(fatiha[5].text.endsWith("(6)")).toBe(true);
  });

  it("parses all 30 ajzaa without leaking surah headers into ayah text", () => {
    for (let juz = 1; juz <= 30; juz++) {
      const verses = parseJuzTextToVerses(juzTextData[juz], juz);
      expect(verses.length).toBeGreaterThan(0);
      const hasSurahHeaderLeak = verses.some(v => /^سُ?ورَةُ?\s+/u.test(v.text));
      expect(hasSurahHeaderLeak).toBe(false);
    }
  });

  it("normalizes accidental percent signs to dammatan in Arabic-context Quran text", () => {
    const sample = "سُورَةُ الفَاتِحَةِ\nغِشَٰوَة٪ۖ وَلَهُمۡ (1)";
    const verses = parseJuzTextToVerses(sample, 1);
    expect(verses[0].text).toContain("غِشَٰوَةٌۖ وَلَهُمۡ");
  });

  it("normalizes accidental U+0657 to standard fathatan in Quran text", () => {
    const sample = "سُورَةُ البَقَرَةِ\nأُوْلَـٰٓئِكَ عَلَىٰ هُدٗى مِّن رَّبِّهِمۡۖ (5)";
    const verses = parseJuzTextToVerses(sample, 1);
    expect(verses[0].text).toContain("هُدًى");
    expect(verses[0].text).not.toContain("هُدٗى");
  });
});
