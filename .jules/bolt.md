## 2024-05-24 - Pre-computing maps for Array lookups
**Learning:** When performing frequent O(n) array lookups (like `surahIndex.find(...)`) inside rendering loops (like `.map()`) or filtering operations, the overhead adds up, especially on lower-end devices.
**Action:** Always pre-compute ES6 Maps (e.g., `surahByName`, `surahByNumber`) during initialization for static datasets and use `.get()` for O(1) lookups instead.
