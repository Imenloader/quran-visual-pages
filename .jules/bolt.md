## 2024-05-18 - [Optimizing Array lookups to Maps]
**Learning:** Avoid `Array.find()` when doing frequent lookups in large iteration cycles such as `QanetCalculator` loops. These are O(n) lookups.
**Action:** Use precomputed Map lookups (`surahByNumber` / `surahByName`) directly from memory context for O(1) time complexity.
