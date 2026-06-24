## 2023-10-27 - [Optimize getSurahByPage Array Search]
**Learning:** In React components and utility functions that map deeply nested array structures or need to find an element starting from the end, using `[...array].reverse().find()` has O(N) allocation and CPU overhead.
**Action:** When searching from the end of an array, prefer a backward `for` loop to avoid overhead of array cloning and reversal.
