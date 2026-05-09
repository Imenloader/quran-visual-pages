
## 2026-05-09 - [Optimize O(n) array searches inside map functions]
**Learning:** Avoid using array `.find()` inside `.map()` loops when rendering lists (like 30 Juz cards), as it can result in O(N*M) time complexity and block the main thread.
**Action:** Always prefer pre-computing lookup tables with ES6 `Map`s (e.g. `surahByName`, `surahByNumber`) to turn O(N) array searches into O(1) hash map lookups.
