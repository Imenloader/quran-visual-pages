## 2024-05-23 - Optimize O(N) array lookups in map loops
**Learning:** Using `Array.find()` inside `Array.map()` or hot rendering loops causes unnecessary O(n^2) or O(n) performance overhead, especially in heavily rendered components like `JuzCard` or `JuzViewer`.
**Action:** Always pre-compute and export O(1) ES6 `Map` structures (like `surahByName` and `surahByNumber`) for static data and replace `.find()` with `.get()` across the codebase to ensure optimal rendering performance and prevent main thread blocking.
