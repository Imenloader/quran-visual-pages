## 2024-05-18 - [Optimizing Arrays Lookups in React Renders]
**Learning:** Performing `Array.find()` lookups on arrays (even relatively small ones like the 114 Surahs) inside `Array.map()` calls during component render loops can cause main-thread blocking and impact rendering performance, especially when filtering long lists or rendering complex components like `JuzCard`.
**Action:** Always pre-compute ES6 `Map` lookups (e.g. `surahByName`, `surahByNumber`) for O(1) retrieval instead of using O(N) `.find()` when accessing static or semi-static data within render cycles.
