## 2024-05-17 - O(1) Map Lookups for UI Rendering
**Learning:** Performing `Array.find()` inside React render loops (especially inside `.map()` array operations) is an O(n^2) performance bottleneck for large datasets or frequent renders. In `JuzCard.tsx`, computing English surah names involved array searching across 114 items recursively during rendering.
**Action:** Always pre-compute ES6 `Map` lookups (e.g. `surahByName`, `surahByNumber`) for static or slowly changing datasets, and use `.get()` for O(1) lookups in render functions to prevent main-thread blocking.
