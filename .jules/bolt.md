
## $(date +%Y-%m-%d) - Replaced array find with O(1) Map lookups for Surah lookups
**Learning:** O(N) array finds on relatively small datasets like the 114 Surahs (`surahData.find()`) can add up when executed in loops or render cycles. Maps provide a scalable, fast O(1) replacement.
**Action:** Always pre-compute and export Map data structures (`surahByNumber`, `surahByName`) alongside array datasets in constants files to ensure O(1) access right out of the box.
