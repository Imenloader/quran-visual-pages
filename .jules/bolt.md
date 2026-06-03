## 2024-05-30 - O(1) Lookups for Quran Surahs
**Learning:** The codebase frequently uses `surahIndex.find(s => s.name === name)` and `surahIndex.find(s => s.number === num)`, which results in O(N) linear searches. Since the Quran has 114 surahs and this operation is performed inside `.map()` loops and during renders (e.g. `JuzCard.tsx`), it causes unnecessary overhead.
**Action:** Created pre-computed ES6 `Map` lookups (`surahByName` and `surahByNumber`) in `quranData.ts` to convert O(N) operations to O(1) lookups, providing a measurable performance boost.
