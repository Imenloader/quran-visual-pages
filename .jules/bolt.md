## 2024-05-29 - O(1) Lookups for Surahs
**Learning:** Using Array.find() inside render loops or frequently called functions for surah lookups causes main-thread blocking on large lists.
**Action:** Pre-compute Map objects (like surahByName and surahByNumber) and use .get() for O(1) lookups instead.
