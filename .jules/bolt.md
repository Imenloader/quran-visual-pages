## 2024-05-25 - Replace Array.find within maps with ES6 Maps for O(1) Lookups
**Learning:** In React components that iterate over lists to render items (e.g., `JuzCard.tsx` rendering surahs), executing an `Array.find()` inside the `.map()` loop results in an O(n*m) time complexity which causes main-thread blocking and dropped frames during heavy renders.
**Action:** Always pre-compute static data like `surahData` into an ES6 `Map` (e.g., `surahByName` or `surahByNumber`) and use `.get()` for O(1) lookups during render cycles.
