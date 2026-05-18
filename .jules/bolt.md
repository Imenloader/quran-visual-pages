
## 2025-02-18 - [O(1) Surah Data Lookups]
**Learning:** Found multiple instances of `Array.prototype.find()` being used inside rendering loops (like `JuzCard.tsx` mapping over Surahs) and deep inside parser loops (`quranTextParser.ts`). Array lookups are O(n), and running them per-item in a list creates a hidden O(n*m) complexity.
**Action:** Always pre-compute ES6 `Map` instances (`surahByName`, `surahByNumber`) in data files (`quranData.ts`) during module initialization. Use `.get()` for O(1) lookups instead of `.find()` whenever reading from static, widely-used configuration arrays.
