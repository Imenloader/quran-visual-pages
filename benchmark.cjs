const { performance } = require('perf_hooks');

const surahIndex = Array.from({ length: 114 }, (_, i) => ({
  number: i + 1,
  name: `Surah ${i + 1}`,
  startPage: i * 5 + 1
}));

function getSurahByPageOld(pageNumber) {
  return [...surahIndex].reverse().find(s => s.startPage <= pageNumber);
}

function getSurahByPageNew(pageNumber) {
  for (let i = surahIndex.length - 1; i >= 0; i--) {
    if (surahIndex[i].startPage <= pageNumber) {
      return surahIndex[i];
    }
  }
  return undefined;
}

const N = 100000;
let start = performance.now();
for (let i = 0; i < N; i++) {
  getSurahByPageOld(500);
}
let oldTime = performance.now() - start;

start = performance.now();
for (let i = 0; i < N; i++) {
  getSurahByPageNew(500);
}
let newTime = performance.now() - start;

console.log(`Old: ${oldTime.toFixed(2)}ms`);
console.log(`New: ${newTime.toFixed(2)}ms`);
console.log(`Improvement: ${(oldTime / newTime).toFixed(2)}x faster`);
