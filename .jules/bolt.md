## 2024-05-11 - Optimize Surah lookups
**Learning:** O(n) array searches inside `.map()` loops can block the main thread and hurt performance, especially when dealing with nested mappings.
**Action:** Always pre-compute O(1) lookup maps like `surahByName` and `surahByNumber` instead of using `Array.find()` inside `Array.map()` loops.
