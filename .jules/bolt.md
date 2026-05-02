## 2024-05-18 - [Optimize Surah Lookups]
**Learning:** Calling `Array.find()` inside an `Array.map()` loop (such as `juz.surahs.map(s => surahIndex.find(...))`) creates an O(N*M) or O(N^2) complexity bottleneck, especially when repeated across UI renders like in `JuzCard` for a heavily populated list.
**Action:** Next time, pre-compute lookup maps (e.g., `surahByName` and `surahByNumber` via ES6 `Map`) and use `.get()` for O(1) lookups to flatten complexity and reduce main-thread blocking during expensive renders.
## 2024-05-18 - [Fix Android CI Build]
**Learning:** Android adaptive icons rely on `ic_launcher_background.png` resources. Deleting these files during CI workflows (e.g., in `.github/workflows/android-build.yml` via `find . -name "ic_launcher_background.png" -delete`) causes AAPT (Android Asset Packaging Tool) resource linking to fail because it cannot find the referenced backgrounds in `ic_launcher.xml` and `ic_launcher_round.xml`.
**Action:** Next time, avoid deleting essential Android adaptive icon resources in build scripts unless their references in XML files are also appropriately removed or replaced.
