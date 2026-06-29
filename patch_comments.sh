#!/bin/bash
# Adding performance documentation comments to src/data/quranData.ts

sed -i 's/export const surahByName = new Map/\/\/ ⚡ Bolt Performance Optimization: Pre-computed O(1) hash maps for Surah lookups\n\/\/ Replaces O(N) array .find() calls inside rendering loops (improving rendering time for large lists like JuzCards)\nexport const surahByName = new Map/' src/data/quranData.ts
