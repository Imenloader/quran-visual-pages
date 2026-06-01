## 2024-06-01 - O(N^2) Array Searches in Render Loops
**Learning:** Found instances of `surahIndex.find(...)` inside `.map` blocks (like rendering Juz surahs) which results in O(N*M) lookup times on every render or filter stroke. Even for small datasets like 114 surahs, this adds up on low-end mobile devices when lists are long.
**Action:** Always pre-compute ES6 Map structures for static reference data (like `surahData`) to enable O(1) lookups during render cycles. Avoid `Array.find` inside React components whenever a key-value Map can be used.
