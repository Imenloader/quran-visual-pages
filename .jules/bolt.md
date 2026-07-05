## 2024-05-30 - Optimize Surah lookups
**Learning:** Using `surahIndex.find()` for frequent surah lookups is O(N) and can be a performance bottleneck when rendering lists like JuzCard (which renders 30 cards, each looking up its constituent surahs multiple times). Pre-computed maps offer an O(1) lookup.
**Action:** Use Map objects (e.g., `surahByName`, `surahByNumber`) constructed once at module load time for O(1) lookups instead of repeating `array.find()` operations.
