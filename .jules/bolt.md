## 2026-05-20 - Replace O(n) Array.find with O(1) Map lookups for surahs
**Learning:** Found multiple instances where `surahIndex.find(...)` (an O(n) operation on a 114-element array) was being called inside `.map` loops, `.filter` loops, and during frequent renders (`useMemo` in Index/JuzCards). This blocks the main thread during heavy list renderings or searches.
**Action:** Use the pre-computed `surahByName` and `surahByNumber` Maps from `src/data/quranData.ts` and use `.get()` to achieve O(1) lookup performance instead of Array `.find()`.
