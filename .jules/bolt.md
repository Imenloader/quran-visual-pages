## 2024-06-05 - Optimize Surah Lookups
**Learning:** `[...array].reverse().find()` creates a shallow copy of the entire array and reverses it on every invocation, causing unnecessary memory allocation and garbage collection overhead.
**Action:** Replace `[...array].reverse().find()` with a simple backward `for` loop, especially for frequently accessed arrays. Also, use pre-computed O(1) Maps (`surahByName`, `surahByNumber`, etc.) instead of O(N) array `.find()` for lookups on static data.
