import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { SWEDISH_ALPHABET, wordScore } from './letters.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Map each Swedish letter to an index in the fixed-size count vectors.
const LETTER_INDEX: Record<string, number> = {};
SWEDISH_ALPHABET.forEach((letter, i) => {
  LETTER_INDEX[letter] = i;
});
const ALPHABET_SIZE = SWEDISH_ALPHABET.length;

function countVector(letters: string): Uint8Array {
  const vec = new Uint8Array(ALPHABET_SIZE);
  for (const ch of letters) {
    const idx = LETTER_INDEX[ch];
    if (idx === undefined) return vec.fill(255); // impossible-to-satisfy marker
    vec[idx] += 1;
  }
  return vec;
}

export interface DictionaryEntry {
  word: string;
  score: number;
  counts: Uint8Array;
  length: number;
}

export class Dictionary {
  private readonly set: Set<string>;
  private readonly entries: DictionaryEntry[];

  constructor(words: string[]) {
    this.set = new Set(words);
    this.entries = words.map((word) => ({
      word,
      score: wordScore(word),
      counts: countVector(word),
      length: word.length,
    }));
  }

  get size(): number {
    return this.set.size;
  }

  has(word: string): boolean {
    return this.set.has(word.toLowerCase());
  }

  private rackVector(rack: string[]): Uint8Array {
    return countVector(rack.join('').toLowerCase());
  }

  private isFormable(entry: DictionaryEntry, rackVec: Uint8Array): boolean {
    const c = entry.counts;
    for (let i = 0; i < ALPHABET_SIZE; i += 1) {
      if (c[i] > rackVec[i]) return false;
    }
    return true;
  }

  // Return every dictionary word formable from the rack, sorted by score desc.
  findFormableWords(rack: string[]): DictionaryEntry[] {
    const rackVec = this.rackVector(rack);
    const rackSize = rack.length;
    const matches: DictionaryEntry[] = [];
    for (const entry of this.entries) {
      if (entry.length > rackSize) continue;
      if (this.isFormable(entry, rackVec)) matches.push(entry);
    }
    matches.sort((a, b) => b.score - a.score || a.word.localeCompare(b.word, 'sv'));
    return matches;
  }

  // Highest-scoring formable word, or null when the rack yields nothing.
  bestWord(rack: string[]): DictionaryEntry | null {
    const rackVec = this.rackVector(rack);
    const rackSize = rack.length;
    let best: DictionaryEntry | null = null;
    for (const entry of this.entries) {
      if (entry.length > rackSize) continue;
      if (!this.isFormable(entry, rackVec)) continue;
      if (!best || entry.score > best.score) best = entry;
    }
    return best;
  }
}

let cached: Dictionary | null = null;

export function loadDictionary(path?: string): Dictionary {
  if (cached && !path) return cached;
  const file = path ?? resolve(__dirname, '../../data/swedish-words.txt');
  const words = readFileSync(file, 'utf8')
    .split('\n')
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 2);
  const dict = new Dictionary(words);
  if (!path) cached = dict;
  return dict;
}
