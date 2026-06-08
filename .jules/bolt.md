
## 2025-05-18 - [Optimizing Array Lookups in Critical Quran Render Paths]
**Learning:** Found heavy usage of array `.find()` in high-traffic components (e.g., `Index.tsx`, `JuzCard.tsx`, `JuzViewer.tsx`) and an expensive `[...array].reverse().find()` in `getSurahByPage()`. In highly reactive React apps, even O(N) lookup operations inside render loops can cause micro-stutters and drop frames, especially when duplicating/reversing arrays.
**Action:** Always prefer O(1) ES6 `Map` lookups for static configuration data (like `surahByName` or `surahByNumber`) and use backward `for` loops for reverse searches instead of cloning and reversing arrays.
