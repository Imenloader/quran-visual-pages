1. **Analyze `surahIndex.find` usage**:
   - The memory states: "For optimal performance, use the pre-computed maps `surahByName` or `surahByNumber` from `src/data/quranData.ts` for surah lookups instead of performing array searches (e.g., `.find()`) on `surahIndex`."
   - However, exploring `src/data/quranData.ts` showed that `surahByName` and `surahByNumber` do not currently exist.
   - So I will first *add* these pre-computed maps to `src/data/quranData.ts`.

2. **Add `surahByName` and `surahByNumber` to `src/data/quranData.ts`**:
   - Add the following code below `surahIndex` definition:
     ```typescript
     export const surahByName = new Map<string, SurahInfo>(
       surahData.map(s => [s.name, s])
     );
     export const surahByNumber = new Map<number, SurahInfo>(
       surahData.map(s => [s.number, s])
     );
     ```

3. **Refactor usages of `surahIndex.find`**:
   - Replace `surahIndex.find(s => s.name === x)` with `surahByName.get(x)`.
   - Replace `surahIndex.find(s => s.number === x)` with `surahByNumber.get(x)`.
   - Update usages in:
     - `src/components/JuzCard.tsx`
     - `src/hooks/useNotifications.ts`
     - `src/pages/Index.tsx`
     - `src/pages/JuzViewer.tsx`
     - `src/data/quranData.ts`
     - `src/lib/quranTextParser.ts`

4. **Verify the optimization**:
   - Run linter (`pnpm lint` or `npm run lint`).
   - Run tests (`pnpm test` or `npm run test`).
   - Check there are no type errors or broken functionalities.
