## 2025-02-12 - Prevented O(N) array scans and Array instance cloning
**Learning:** Performance overhead in frequent renders due to `Array.find` inside `.map` or array copying (`[...array].reverse()`).
**Action:** Replace `Array.find` in iteration blocks with O(1) Map lookups. Avoid using array clone and reverse syntax, instead loop backwards directly for O(1) memory overhead and O(N) processing.
