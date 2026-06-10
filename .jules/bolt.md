## 2024-10-24 - [Optimize Array Lookups]
**Learning:** In a codebase with heavily populated lists, mapping over array `.find()` calls can block the main thread and degrade performance.
**Action:** Use ES6 Maps for O(1) lookups to optimize performance when searching static data like `surahIndex`.
