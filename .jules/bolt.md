## 2024-06-21 - [Pre-compute map for surah list]
**Learning:** In heavily used components like lists/render loops, using `Array.find()` adds O(N) overhead during renders, leading to main-thread blocking.
**Action:** Avoid `Array.find()` inside `Array.map()` or renders. Pre-compute lookup maps (ES6 `Map`) for O(1) lookups.
