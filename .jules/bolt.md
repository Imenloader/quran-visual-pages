## 2024-05-13 - [Pre-compute surah lookup map]
**Learning:** Pre-computing ES6 Maps for surah lookups (`surahByName` and `surahByNumber`) makes finding surahs O(1) instead of O(n) using `.find()`. This avoids a performance bottleneck when looking up surahs in heavily populated lists.
**Action:** Use pre-computed ES6 Maps (`surahByName`, `surahByNumber`) in `quranData.ts` and replace `.find()` usage throughout the app.
