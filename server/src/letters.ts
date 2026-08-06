// Swedish Scrabble letter point values and tile distribution.
// Blanks are intentionally excluded so that every drawn tile has a fixed value.

export const LETTER_VALUES: Record<string, number> = {
  a: 1, e: 1, i: 1, n: 1, r: 1, s: 1, t: 1,
  d: 1, l: 1, o: 2, g: 2, k: 2, m: 2, u: 4,
  h: 2, f: 3, v: 3, p: 3, b: 3, j: 7, y: 7,
  c: 8, x: 8, z: 10,
  å: 4, ä: 4, ö: 4,
};

// Number of tiles of each letter in a standard Swedish Scrabble set (minus blanks).
export const LETTER_FREQUENCIES: Record<string, number> = {
  a: 8, b: 2, c: 1, d: 5, e: 7, f: 2, g: 3, h: 2, i: 5,
  j: 1, k: 3, l: 5, m: 3, n: 6, o: 5, p: 2, r: 8, s: 8,
  t: 8, u: 3, v: 2, x: 1, y: 1, z: 1, å: 2, ä: 2, ö: 2,
};

export const SWEDISH_ALPHABET = Object.keys(LETTER_FREQUENCIES);

export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y', 'å', 'ä', 'ö']);

export function letterValue(letter: string): number {
  return LETTER_VALUES[letter.toLowerCase()] ?? 0;
}

// Base word score is the sum of the tile values of its letters, plus a length
// bonus that rewards longer (harder to build) words. This is the "strategic"
// incentive: reaching for a longer word pays off disproportionately.
export function lengthBonus(length: number): number {
  if (length >= 7) return 20;
  if (length >= 6) return 12;
  if (length >= 5) return 6;
  return 0;
}

export function wordScore(word: string): number {
  let sum = 0;
  for (const ch of word.toLowerCase()) {
    sum += letterValue(ch);
  }
  return sum + lengthBonus(word.length);
}

// A shared, seedable pseudo-random generator so games can be made deterministic
// in tests while still feeling random in normal play.
export type Rng = () => number;

export function createRng(seed?: number): Rng {
  if (seed === undefined) {
    return Math.random;
  }
  // Mulberry32 — small, fast, good enough for shuffling tiles.
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBag(): string[] {
  const bag: string[] = [];
  for (const [letter, count] of Object.entries(LETTER_FREQUENCIES)) {
    for (let i = 0; i < count; i += 1) bag.push(letter);
  }
  return bag;
}

// Draw `size` tiles from the Swedish tile bag using weighted distribution.
// Guarantees at least two vowels so racks are almost always playable.
export function drawRack(size: number, rng: Rng): string[] {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const bag = buildBag();
    // Fisher–Yates shuffle.
    for (let i = bag.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    const rack = bag.slice(0, size);
    const vowelCount = rack.filter((l) => VOWELS.has(l)).length;
    if (vowelCount >= 2 && vowelCount <= size - 1) {
      return rack;
    }
  }
  return buildBag().slice(0, size);
}

// Count how many of each letter are present, for multiset subset checks.
export function letterCounts(letters: Iterable<string>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const ch of letters) {
    const l = ch.toLowerCase();
    counts.set(l, (counts.get(l) ?? 0) + 1);
  }
  return counts;
}

// True when `word` can be built from the multiset of `rack` letters.
export function canFormWord(word: string, rack: string[]): boolean {
  const available = letterCounts(rack);
  for (const ch of word.toLowerCase()) {
    const remaining = available.get(ch);
    if (!remaining) return false;
    available.set(ch, remaining - 1);
  }
  return true;
}
