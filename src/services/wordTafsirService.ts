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
  // Verb plural endings with pronouns
  "وهما", "وهم", "وهن", "وها", "وه",
  "ونهم", "ونها", "ونه",
  "تموهم", "تموها", "تموه", "تموهن",
  // Common verb endings
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

const MIN_STEM = 2; // don't reduce a word below 2 chars

// ─── Pre-build a normalised key → entry map once (avoid re-scanning on every lookup) ───
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

for (const [key, val] of Object.entries(mujamData)) {
  const normKey = normalizeArabic(key);
  _normalisedIndex.set(normKey, val as WordTafsir);
  
  // Create a stemmed version of the dictionary key to catch suffix/prefix variations
  const stemmedKey = basicStem(normKey);
  if (stemmedKey !== normKey && !_normalisedIndex.has(stemmedKey) && !_stemmedIndex.has(stemmedKey)) {
    _stemmedIndex.set(stemmedKey, val as WordTafsir);
  }
}

function lookupNorm(norm: string): WordTafsir | null {
  return _normalisedIndex.get(norm) ?? _stemmedIndex.get(norm) ?? null;
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

  // Pass 5 — strip prefix then suffix (handles ال + verb + ون etc.)
  for (const prefix of PREFIXES) {
    if (!norm.startsWith(prefix)) continue;
    const afterPrefix = norm.slice(prefix.length);
    if (afterPrefix.length < MIN_STEM) continue;
    // direct lookup on stem after prefix
    const hit5a = lookupNorm(afterPrefix);
    if (hit5a) return hit5a;
    // suffix strip on what remains after prefix
    const hit5b = stripAndLookup(afterPrefix, SUFFIXES, "end");
    if (hit5b) return hit5b;
  }

  return null;
};