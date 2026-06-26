
## 2024-05-18 - [Optimize Surah Lookups]
**Learning:** Found several places where `surahIndex.find(...)` was being used inside `.map(...)` or `.filter(...)` loops to lookup surahs by name, number, or number string. This results in an O(n^2) operation because `surahIndex` is an array of 114 items.
**Action:** Created pre-computed ES6 Maps (`surahByName`, `surahByNumber`, `surahByNumberString`) in `src/data/quranData.ts` to provide O(1) lookups and replaced the array searches with `.get()`. Also replaced `surahIndex.filter` with `surahData.filter` in places where it made sense because `surahIndex` is just an alias for `surahData`.
