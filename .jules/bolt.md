## 2024-05-18 - [Optimize Surah Lookups]
**Learning:** Calling `Array.find()` inside an `Array.map()` loop (such as `juz.surahs.map(s => surahIndex.find(...))`) creates an O(N*M) or O(N^2) complexity bottleneck, especially when repeated across UI renders like in `JuzCard` for a heavily populated list.
**Action:** Next time, pre-compute lookup maps (e.g., `surahByName` and `surahByNumber` via ES6 `Map`) and use `.get()` for O(1) lookups to flatten complexity and reduce main-thread blocking during expensive renders.
