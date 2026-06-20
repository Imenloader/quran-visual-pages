## 2024-05-24 - Pre-compute Lookup Maps for Array Searches

**Learning:** When performing frequent array `.find()` lookups on static data sets (like `surahIndex` in this application) inside render loops or component rendering paths (like `map` and `filter`), it introduces unnecessary O(N) operations that can scale poorly as the component tree deepens or list size increases.
**Action:** Replace `Array.prototype.find()` operations with O(1) lookups by leveraging pre-computed `Map` structures exported directly alongside the static data (e.g., `surahByName` and `surahByNumber`).
