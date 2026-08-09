// Deterministic daily/weekly content: everyone gets the same "Dagens ord" and
// "Daglig utmaning" each calendar day, chosen server-side from a curated pool of
// eligible, high-quality words. Also verifies player-submitted chains.

import type { Entry } from './types.js';
import { getDatabase } from './database.js';
import { judge } from './judge.js';
import { categoryLabel } from './taxonomy.js';

const STRIDE = 100_003; // prime → full-cycle rotation, no repeats within pool length
const COSMIC_TAGS = ['cosmic', 'entity', 'reality', 'blackhole', 'space', 'star', 'planet', 'comet', 'asteroid', 'god'];
const WEAPON_TAGS = ['weapon', 'firearm', 'explosive', 'blade', 'nuclear', 'projectile'];

let pool: Entry[] | null = null;

/** Words good enough to be a daily/challenge start: verified, single Swedish
 * word, a few tags, and a "fair" power scale (beatable but not omnipotent). */
export function eligiblePool(): Entry[] {
  if (pool) return pool;
  const db = getDatabase();
  pool = db
    .all()
    .filter(
      (e) =>
        e.quality === 'verified' &&
        /^[A-Za-zÅÄÖåäö]{3,12}$/.test(e.name) &&
        e.tags.length >= 2 &&
        e.scale >= 12 &&
        e.scale <= 82,
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'sv'));
  return pool;
}

function daysSinceEpoch(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

function pickFromPool(date: string, offset: number): Entry {
  const p = eligiblePool();
  const idx = Math.abs(daysSinceEpoch(date) * STRIDE + offset) % p.length;
  return p[idx];
}

export interface DailyWord {
  name: string;
  categories: string[];
  categoryLabels: string[];
  description: string;
  scale: number;
}

function toDailyWord(e: Entry): DailyWord {
  return {
    name: e.name,
    categories: e.categories,
    categoryLabels: e.categories.map(categoryLabel),
    description: e.description,
    scale: e.scale,
  };
}

export type ChallengeType = 'minLength' | 'reachCosmic' | 'categories' | 'noWeapon';

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  startWord: string;
  target: number;
  description: string;
}

const CHALLENGE_TYPES: ChallengeType[] = ['minLength', 'reachCosmic', 'categories', 'noWeapon'];

function buildChallenge(date: string): DailyChallenge {
  const dse = daysSinceEpoch(date);
  const type = CHALLENGE_TYPES[dse % CHALLENGE_TYPES.length];
  const start = pickFromPool(date, Math.floor(eligiblePool().length / 2) + 17);
  const startWord = start.name;
  let target = 0;
  let description = '';
  switch (type) {
    case 'minLength':
      target = [12, 15, 10, 18][dse % 4];
      description = `Bygg en kedja på minst ${target} ord från "${startWord}".`;
      break;
    case 'reachCosmic':
      target = 1;
      description = `Ta dig från "${startWord}" till något kosmiskt – rymden, en stjärna, ett svart hål eller större.`;
      break;
    case 'categories':
      target = [5, 6][dse % 2];
      description = `Använd minst ${target} olika kategorier i en kedja från "${startWord}".`;
      break;
    case 'noWeapon':
      target = 8;
      description = `Bygg en kedja på minst ${target} ord från "${startWord}" – utan att använda något vapen.`;
      break;
  }
  return { id: `${date}:${type}`, type, startWord, target, description };
}

export interface DailyContent {
  date: string;
  word: DailyWord;
  challenge: DailyChallenge;
  weekly: { id: string; description: string };
  countdownMs: number;
}

const WEEKLY = [
  'Veckans utmaning: bygg den längsta kedjan du kan.',
  'Veckans utmaning: använd så många olika kategorier som möjligt.',
  'Veckans utmaning: klara en lång kedja helt utan vapen.',
  'Veckans utmaning: nå en kosmisk varelse så snabbt du kan.',
];

export function getDaily(date: string, tz = 'Europe/Stockholm'): DailyContent {
  const word = toDailyWord(pickFromPool(date, 0));
  const challenge = buildChallenge(date);
  const week = Math.floor(daysSinceEpoch(date) / 7);
  return {
    date,
    word,
    challenge,
    weekly: { id: `w${week}`, description: WEEKLY[week % WEEKLY.length] },
    countdownMs: msUntilNextDay(tz),
  };
}

export function getArchive(dates: string[]): Array<{ date: string; word: string; challenge: string }> {
  return dates.map((d) => {
    const c = getDaily(d);
    return { date: d, word: c.word.name, challenge: c.challenge.description };
  });
}

function msUntilNextDay(tz: string): number {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const secondsToday = get('hour') * 3600 + get('minute') * 60 + get('second');
  return (86_400 - secondsToday) * 1000;
}

// --- chain verification & scoring ----------------------------------------

export interface ChainStats {
  validated: Entry[];
  chainLength: number;
  score: number;
  categoriesUsed: string[];
  cosmicReached: boolean;
  weaponUsed: boolean;
}

function wordValue(e: Entry): number {
  return 10 + Math.round(e.scale / 5) + Math.min(e.tags.length, 6);
}

/** Re-judge a submitted chain from `startName`, accepting the longest valid
 * prefix (anti-cheat) and computing a canonical score. */
export function verifyChain(startName: string, answers: string[]): ChainStats {
  const db = getDatabase();
  let target = db.resolve(startName).entry;
  const validated: Entry[] = [];
  const categories = new Set<string>();
  let score = 0;
  let weaponUsed = false;
  for (const word of answers) {
    const a = db.resolve(word);
    const r = judge(target, a.entry, a.ref.matchType, a.ref.resolved);
    if (!r.approved) break;
    validated.push(a.entry);
    a.entry.categories.forEach((c) => categories.add(c));
    if (a.entry.tags.some((t) => WEAPON_TAGS.includes(t))) weaponUsed = true;
    score += wordValue(a.entry);
    target = a.entry;
  }
  const chainLength = validated.length;
  score += chainLength * 10 + categories.size * 8;
  const last = validated[validated.length - 1];
  const cosmicReached = last ? last.tags.some((t) => COSMIC_TAGS.includes(t)) : false;
  return { validated, chainLength, score, categoriesUsed: [...categories], cosmicReached, weaponUsed };
}

export function evaluateChallenge(challenge: DailyChallenge, stats: ChainStats): { completed: boolean; progress: number } {
  switch (challenge.type) {
    case 'minLength':
      return { completed: stats.chainLength >= challenge.target, progress: clamp01(stats.chainLength / challenge.target) };
    case 'reachCosmic':
      return { completed: stats.cosmicReached, progress: stats.cosmicReached ? 1 : Math.min(0.9, stats.chainLength / 10) };
    case 'categories':
      return { completed: stats.categoriesUsed.length >= challenge.target, progress: clamp01(stats.categoriesUsed.length / challenge.target) };
    case 'noWeapon':
      return {
        completed: stats.chainLength >= challenge.target && !stats.weaponUsed,
        progress: stats.weaponUsed ? 0 : clamp01(stats.chainLength / challenge.target),
      };
    default:
      return { completed: false, progress: 0 };
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
