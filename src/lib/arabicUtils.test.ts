import { describe, it, expect } from 'vitest';
import { normalizeArabic, areArabicWordsSimilar } from './arabicUtils';

describe('normalizeArabic', () => {
  it('should remove diacritics', () => {
    expect(normalizeArabic('بِسْمِ اللَّهِ')).toBe('بسم الله');
    expect(normalizeArabic('قُلْ هُوَ اللَّهُ أَحَدٌ')).toBe('قل هو الله احد');
  });

  it('should normalize different forms of Alef', () => {
    expect(normalizeArabic('أحمد إبراهيم آمنة ٱهدنا')).toBe('احمد ابراهيم امنه اهدنا');
  });

  it('should normalize Ta Marbuta to Ha', () => {
    expect(normalizeArabic('مكتبة')).toBe('مكتبه');
    expect(normalizeArabic('فاطمة')).toBe('فاطمه');
  });

  it('should normalize Alif Maqsura to Ya', () => {
    expect(normalizeArabic('على')).toBe('علي');
    expect(normalizeArabic('يسعى')).toBe('يسعي');
  });

  it('should normalize Hamza on Waw and Hamza on Ya to Hamza', () => {
    expect(normalizeArabic('مؤمن')).toBe('مءمن');
    expect(normalizeArabic('بئر')).toBe('بءر');
  });

  it('should remove Kashida', () => {
    expect(normalizeArabic('بــــسم')).toBe('بسم');
  });

  it('should normalize spaces and trim', () => {
    expect(normalizeArabic('  كلمة   أخرى  ')).toBe('كلمه اخري');
  });

  it('should return empty string for null/undefined/empty input', () => {
    expect(normalizeArabic('')).toBe('');
    // @ts-ignore
    expect(normalizeArabic(null)).toBe('');
  });
});

describe('areArabicWordsSimilar', () => {
  it('should return true for identical strings', () => {
    expect(areArabicWordsSimilar('محمد', 'محمد')).toBe(true);
  });

  it('should return true for strings identical after normalization', () => {
    expect(areArabicWordsSimilar('بِسْمِ', 'بسم')).toBe(true);
    expect(areArabicWordsSimilar('فاطمة', 'فاطمه')).toBe(true);
  });

  it('should handle leading "wa" (و) prefix correctly', () => {
    // Lengths must be > 4
    expect(areArabicWordsSimilar('والكتاب', 'الكتاب')).toBe(true);
    expect(areArabicWordsSimilar('الكتاب', 'والكتاب')).toBe(true);

    // Length <= 4, should be false
    expect(areArabicWordsSimilar('ورد', 'رد')).toBe(false);
  });

  it('should handle substring matches for long phrases', () => {
    // Lengths must be > 10
    const phrase1 = 'الحمد لله رب العالمين';
    const phrase2 = 'الحمد لله رب';
    expect(areArabicWordsSimilar(phrase1, phrase2)).toBe(true);
    expect(areArabicWordsSimilar(phrase2, phrase1)).toBe(true);

    // Length <= 10, should be false
    expect(areArabicWordsSimilar('الحمد لله', 'الحمد')).toBe(false);
  });

  it('should return false for dissimilar words', () => {
    expect(areArabicWordsSimilar('سماء', 'ارض')).toBe(false);
    expect(areArabicWordsSimilar('كتاب', 'كاتب')).toBe(false);
  });
});
