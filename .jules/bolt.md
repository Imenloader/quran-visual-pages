## 2024-05-18 - [Map Lookups to Prevent Main-Thread Blocking]
**Learning:** O(N) array searching inside loops (`.map()` or `.filter()`) and React render cycles blocks the main thread unnecessarily. In `src/components/JuzCard.tsx` and `src/pages/Index.tsx`, `surahIndex.find()` was called inside deeply nested loops. Using ES6 `Map` transforms this to O(1) lookups and significantly improves rendering performance.
**Action:** When finding bottlenecks related to `.find()` in lists, always pre-compute lookups into `Map` objects. Never perform array searches during the render loop.
