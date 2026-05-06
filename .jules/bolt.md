## 2024-05-15 - [Initial Journal Entry]
**Learning:** Initializing journal for Bolt.
**Action:** Always check memory and existing documentation to identify performance optimization opportunities.

## 2024-05-15 - [O(1) Map Lookups for Surah Data]
**Learning:** Found an anti-pattern: `surahIndex.find()` was being used for lookups in `map`/`forEach` loops which blocking the main thread for long arrays, making it an O(N) operation inside O(N) operations -> O(N^2) time complexity. Pre-computing maps based on `number` and `name` gives an O(1) time complexity.
**Action:** Use pre-computed `Map` objects (`surahByName` and `surahByNumber`) for fast lookups rather than `Array.find()` whenever rendering lists of data involving Surahs.
