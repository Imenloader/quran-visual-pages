## 2025-02-28 - [Performance: Replace Array.find() with Map.get() for O(1) Lookups]
**Learning:** [Pre-computing Maps for standard data structures like surahs avoids repetitive O(N) array traversals, significantly improving rendering and parsing times across multiple pages and hooks without sacrificing readability.]
**Action:** [Use Map-based lookups instead of Array.find() for static data frequently queried by ID or Name, particularly in list rendering or parsing logic.]
