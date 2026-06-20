## 2024-11-20 - Array.find in Render Loops
**Learning:** Found multiple instances where `surahIndex.find` (an O(N) operation) was being used inside `map` and `filter` functions inside React components like `JuzCard` and `Index`. While the array is small (114 items), running it hundreds of times during a single render cycle creates unnecessary CPU overhead.
**Action:** When working with static or infrequently changing arrays that are accessed often (especially inside render loops), pre-compute a `Map` structure for O(1) lookups and replace the `.find()` calls with `.get()`.
