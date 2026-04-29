
import { describe, it, expect } from 'vitest';
import { parseJuzTextToVerses } from './quranTextParser';
import { juz22Text } from '../data/juz/juz22';

describe('quranTextParser', () => {
  it('should correctly strip Surah Saba header and Basmalah from Juz 22', () => {
    const verses = parseJuzTextToVerses(juz22Text, 22);
    
    // Find the first verse of Surah Saba (Surah 34)
    const saba1 = verses.find(v => v.surahNumber === 34 && v.ayahNumber === 1);
    
    expect(saba1).toBeDefined();
    expect(saba1?.text).not.toContain('سورة');
    expect(saba1?.text).not.toContain('بسم الله');
    expect(saba1?.showBasmalah).toBe(false);
    
    // The text should start with "الحمد لله"
    expect(saba1?.text).toMatch(/^ٱلۡحَمۡدُ لِلَّهِ/);
  });
});
