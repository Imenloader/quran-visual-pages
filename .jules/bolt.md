## 2025-02-28 - Surah Lookup Optimization
**Learning:** O(N) array lookups using `find` inside rendering loops or derived state mappings (like in `JuzCard.tsx`) can block the main thread and impact Core Web Vitals, especially when repeatedly querying relatively static data like the 114 Surahs.
**Action:** Always pre-compute static data into Maps (`surahByName`, `surahByNumber`) for O(1) retrieval to ensure smooth React rendering cycles, rather than iterating array arrays.
