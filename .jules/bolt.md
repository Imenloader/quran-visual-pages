## 2024-05-19 - Replacing Surah Arrays with Maps
**Learning:** Found array `.find()` lookups on `surahData` and `surahIndex` being used repeatedly in React renders and data logic.
**Action:** Created `surahByName` and `surahByNumber` Maps in `src/data/quranData.ts` to upgrade O(n) array lookups to O(1) map lookups, removing unnecessary iteration over 114 Surahs per lookup.
