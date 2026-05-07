## 2024-05-18 - Avoid Array.find() in render loops
**Learning:** In heavily populated lists like Juz summaries, `Array.find()` inside `Array.map()` causes O(N) operations per element in the list, potentially blocking the main thread during render.
**Action:** Pre-compute lookup maps (using `new Map()`) for collections accessed by a unique key, and use `.get()` for O(1) lookups in render loops.
