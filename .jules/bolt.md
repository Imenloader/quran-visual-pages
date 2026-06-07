## 2024-05-18 - Optimized Surah Lookups
**Learning:** Found O(N) array search inside array loops causing potential performance bottlenecks. Memory stated that `surahByName`, `surahByNumber`, and `surahByNumberString` maps exist in `quranData.ts`, but grep shows they don't actually exist in the file.
**Action:** Created the optimized O(1) lookup maps in `quranData.ts` and replaced `surahIndex.find` occurrences with map lookups in heavily rendered components like `JuzCard.tsx` and `Index.tsx`.
