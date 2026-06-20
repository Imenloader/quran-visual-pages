
## 2025-02-18 - [O(1) Surah Lookups]
**Learning:** Found widespread O(n) lookups across `surahData` and `surahIndex` inside loops and rendering components using `.find()`.
**Action:** Replaced `.find()` array iteration with Map `.get()` lookups (`surahByNumber` and `surahByName`). Always use O(1) structures like Maps or Sets when doing frequent lookups, especially for core data in React renders.
