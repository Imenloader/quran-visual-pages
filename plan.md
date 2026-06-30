1. Add `surahByName`, `surahByNumber`, and `surahByNumberString` Maps to `src/data/quranData.ts`.
2. Optimize `getSurahByPage` in `src/data/quranData.ts` to use a backward `for` loop instead of `[...surahIndex].reverse().find()`.
3. Update `getJuzAndPageForSurah` in `src/data/quranData.ts` to use `surahByNumber.get(surahNumber)`.
4. Update `src/components/JuzCard.tsx` to use `surahByName.get(s)` instead of `.find()`.
5. Complete pre commit steps to ensure proper testing, verification, review, and reflection are done.
6. Submit with standard Bolt PR format.
