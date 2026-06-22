const { performance } = require('perf_hooks');

const RUNS = 10000;

async function run() {
  const quranData = await import('./src/data/quranData.ts');

  console.log("Benchmarking forward mapping (new approach) vs reverse mapping (old approach)...");

  let start = performance.now();
  for (let i = 0; i < RUNS; i++) {
    // Simulating old approach
    [...quranData.surahIndex].reverse().find(s => s.startPage <= 300);
  }
  let end = performance.now();
  console.log(`Old backward search took ${end - start}ms`);

  start = performance.now();
  for (let i = 0; i < RUNS; i++) {
    quranData.getSurahByPage(300);
  }
  end = performance.now();
  console.log(`New backward search took ${end - start}ms`);

  console.log("\nBenchmarking array find (old approach) vs map get (new approach)...");

  start = performance.now();
  for (let i = 0; i < RUNS; i++) {
    // Simulating old approach
    quranData.surahIndex.find(s => s.name === "الناس");
  }
  end = performance.now();
  console.log(`Old map lookup took ${end - start}ms`);

  start = performance.now();
  for (let i = 0; i < RUNS; i++) {
    quranData.surahByName.get("الناس");
  }
  end = performance.now();
  console.log(`New map lookup took ${end - start}ms`);

}

run().catch(console.error);
