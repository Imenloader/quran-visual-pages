import mujamData from "@/data/Datasets/mujam.json";

interface WordTafsir {
  root?: string;
  meaning?: string;
  notes?: string;
  type?: string;
}

import { normalizeArabic } from "@/utils/arabicUtils";

// ─── Arabic prefixes (longest first) ─────────────────────────────────────────────────
const PREFIXES = ["وال", "فال", "بال", "كال", "لل", "ال", "و", "ف", "ب", "ك", "ل"];

// ─── Arabic suffixes for verb conjugations / pronouns (longest first) ─────────────────
const SUFFIXES = [
  "وهما", "وهم", "وهن", "وها", "وه",
  "ونهم", "ونها", "ونه",
  "تموهم", "تموها", "تموه", "تموهن",
  "تموا", "تما", "تمو",
  "ونني", "وننا",
  "وني", "ونا",
  "تون", "تين",
  "ناه", "ناها", "ناهم",
  "كموه", "كمها",
  "هما", "هم", "هن",
  "كم", "كن", "نا",
  "ها", "وا", "ون", "ين", "ان",
  "تم", "تن", "وه",
  "ني",
  "ه", "ا", "ت", "ن",
];

const MIN_STEM = 2;

const _normalisedIndex = new Map<string, WordTafsir>();
const _stemmedIndex = new Map<string, WordTafsir>();

function basicStem(word: string): string {
  let stem = word;
  for (const prefix of PREFIXES) {
    if (stem.startsWith(prefix) && stem.length > prefix.length + MIN_STEM) {
      stem = stem.slice(prefix.length);
      break;
    }
  }
  for (const suffix of SUFFIXES) {
    if (stem.endsWith(suffix) && stem.length > suffix.length + MIN_STEM) {
      stem = stem.slice(0, stem.length - suffix.length);
      break;
    }
  }
  return stem;
}

// Pre-fill indices
for (const [key, val] of Object.entries(mujamData)) {
  const normKey = normalizeArabic(key);
  _normalisedIndex.set(normKey, val as WordTafsir);
  
  const stemmedKey = basicStem(normKey);
  if (stemmedKey !== normKey && !_normalisedIndex.has(stemmedKey) && !_stemmedIndex.has(stemmedKey)) {
    _stemmedIndex.set(stemmedKey, val as WordTafsir);
  }
}

function lookupNorm(norm: string): WordTafsir | null {
  // Try exact normalized
  let hit = _normalisedIndex.get(norm) ?? _stemmedIndex.get(norm);
  if (hit) return hit;

  // FALLBACK: Try removing 'ا' if it might be an extra dagger alif (e.g., هاذا -> هذا)
  if (norm.includes('ا')) {
    const altNorm = norm.replace(/ا/g, '');
    hit = _normalisedIndex.get(altNorm) ?? _stemmedIndex.get(altNorm);
    if (hit) return hit;
  }
  
  return null;
}

function stripAndLookup(norm: string, affixes: string[], stripFrom: "start" | "end"): WordTafsir | null {
  for (const affix of affixes) {
    const hasAffix = stripFrom === "start" ? norm.startsWith(affix) : norm.endsWith(affix);
    if (!hasAffix) continue;
    const stem = stripFrom === "start"
      ? norm.slice(affix.length)
      : norm.slice(0, norm.length - affix.length);
    if (stem.length < MIN_STEM) continue;
    const hit = lookupNorm(stem);
    if (hit) return hit;
  }
  return null;
}

export const getWordTafsir = (word: string): WordTafsir | null => {
  // Pass 1 — exact raw key
  const raw = mujamData[word as keyof typeof mujamData];
  if (raw) return raw as WordTafsir;

  // Pass 2 — normalised exact match
  const norm = normalizeArabic(word);
  const hit2 = lookupNorm(norm);
  if (hit2) return hit2;

  // Pass 3 — strip prefix only
  const hit3 = stripAndLookup(norm, PREFIXES, "start");
  if (hit3) return hit3;

  // Pass 4 — strip suffix only
  const hit4 = stripAndLookup(norm, SUFFIXES, "end");
  if (hit4) return hit4;

  // Pass 5 — strip prefix then suffix
  for (const prefix of PREFIXES) {
    if (!norm.startsWith(prefix)) continue;
    const afterPrefix = norm.slice(prefix.length);
    if (afterPrefix.length < MIN_STEM) continue;
    
    const hit5a = lookupNorm(afterPrefix);
    if (hit5a) return hit5a;
    
    const hit5b = stripAndLookup(afterPrefix, SUFFIXES, "end");
    if (hit5b) return hit5b;
  }

  return null;
};