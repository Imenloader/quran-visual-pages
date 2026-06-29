
## 2024-06-25 - Replace O(N) array lookups with O(1) Map lookups for Surah lookups
**Learning:** O(N) array `.find()` calls on `surahIndex` inside rendering loops (like `.map` on `juz.surahs` in `JuzCard`) create a significant O(N^2) performance bottleneck.
**Action:** When performing repeated lookups on constant static data arrays, pre-compute O(1) hash maps (e.g. `surahByName`, `surahByNumber`) and use map `.get()` instead to avoid redundant iteration overhead. Document the optimizations explicitly in code comments.
