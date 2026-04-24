
import { juzData } from './src/data/quranData';
import { parseJuzTextToVerses } from './src/lib/quranTextParser';
import * as fs from 'fs';
import * as path from 'path';

async function testAllJuz() {
  for (let i = 1; i <= 30; i++) {
    const filePath = `./src/data/juz/juz${i}.ts`;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      // Extract the string content
      const match = content.match(/`([\s\S]*)`/);
      if (match) {
        const text = match[1];
        const verses = parseJuzTextToVerses(text, i);
        
        const problematic = verses.filter(v => v.text.includes("سورة") || (v.text.includes("بسم الله") && v.surahNumber !== 1));
        
        if (problematic.length > 0) {
          console.log(`Juz ${i} has issues in ${problematic.length} verses:`);
          problematic.slice(0, 3).forEach(v => {
            console.log(`  [${v.fullKey}] ${v.text.substring(0, 100)}...`);
          });
        }
      }
    }
  }
}

testAllJuz();
