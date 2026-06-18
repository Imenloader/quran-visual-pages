## 2024-05-24 - Pre-computed Maps for Surah Lookups
**Learning:** In a heavily data-driven React app, performing `Array.find()` inside loops or frequent renders (like finding surahs by name or number) blocks the main thread and impacts performance.
**Action:** Use pre-computed ES6 `Map` lookups (`surahByName`, `surahByNumber`) to achieve O(1) time complexity instead of O(N) array iteration.
