## 2024-05-19 - Surah Lookups
**Learning:** O(n) array searches on `surahIndex.find(...)` are an anti-pattern when rendering many items (like JuzViewer which renders multiple Surahs per Juz), leading to unnecessary main-thread blocking. This codebase has a specific pattern of mapping `surahIndex.find(si => si.name === s)` multiple times per Juz in `JuzCard.tsx` and `JuzViewer.tsx`.
**Action:** Replace `surahIndex.find()` with O(1) Map lookups using `surahByName` or `surahByNumber` from `src/data/quranData.ts`.
