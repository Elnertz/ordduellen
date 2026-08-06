// Persistent store for online players, ratings, stats and match history.
// File-backed JSON for a self-contained dev/prod-lite deployment. The same
// interface maps cleanly onto Postgres/Supabase for production (see STATUS.md).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { DEFAULT_RATING, applyMatch, type Outcome } from './elo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
const STORE_PATH = resolve(DATA_DIR, 'online-store.json');

export interface Player {
  id: string;
  name: string;
  guest: boolean;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  matches: number;
  longestChain: number;
  createdAt: number;
  lastActive: number;
}

export interface MatchRecord {
  id: string;
  playerA: string;
  playerB: string;
  scoreA: number;
  scoreB: number;
  winner: string | null;
  ranked: boolean;
  chainLength: number;
  ratedAt: number;
}

interface StoreShape {
  version: number;
  players: Record<string, Player>;
  matches: MatchRecord[];
}

export interface LeaderboardRow extends Player {
  rank: number;
}

export interface MatchResultInput {
  playerA: string;
  playerB: string;
  scoreA: number;
  scoreB: number;
  chainLength: number;
  ranked: boolean;
  /** Explicit winner id (e.g. forfeit); otherwise derived from scores. */
  winnerId?: string | null;
}

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export class Store {
  private data: StoreShape;
  private path: string;

  constructor(path: string = STORE_PATH) {
    this.path = path;
    this.data = load(path);
  }

  getOrCreateGuest(name: string): Player {
    const now = Date.now();
    const player: Player = {
      id: randomId('guest'),
      name: sanitizeName(name),
      guest: true,
      rating: DEFAULT_RATING,
      wins: 0,
      losses: 0,
      draws: 0,
      matches: 0,
      longestChain: 0,
      createdAt: now,
      lastActive: now,
    };
    this.data.players[player.id] = player;
    this.persist();
    return player;
  }

  getPlayer(id: string): Player | undefined {
    return this.data.players[id];
  }

  /** Ensure a player exists (used on reconnect with a known id). */
  ensurePlayer(id: string | undefined, name: string): Player {
    if (id && this.data.players[id]) {
      const p = this.data.players[id];
      if (name) p.name = sanitizeName(name);
      p.lastActive = Date.now();
      this.persist();
      return p;
    }
    return this.getOrCreateGuest(name);
  }

  setName(id: string, name: string): Player | undefined {
    const p = this.data.players[id];
    if (!p) return undefined;
    p.name = sanitizeName(name);
    this.persist();
    return p;
  }

  touch(id: string): void {
    const p = this.data.players[id];
    if (p) {
      p.lastActive = Date.now();
    }
  }

  /** Record a finished match, updating ratings (if ranked) and stats. */
  recordMatch(input: MatchResultInput): MatchRecord {
    const a = this.data.players[input.playerA];
    const b = this.data.players[input.playerB];
    const winner =
      input.winnerId !== undefined
        ? input.winnerId
        : input.scoreA > input.scoreB
          ? input.playerA
          : input.scoreB > input.scoreA
            ? input.playerB
            : null;

    if (a && b) {
      const outcomeA: Outcome = winner === a.id ? 'win' : winner === b.id ? 'loss' : 'draw';
      if (input.ranked) {
        const res = applyMatch(a.rating, b.rating, outcomeA);
        a.rating = res.ratingA;
        b.rating = res.ratingB;
      }
      a.matches += 1;
      b.matches += 1;
      if (outcomeA === 'win') {
        a.wins += 1;
        b.losses += 1;
      } else if (outcomeA === 'loss') {
        a.losses += 1;
        b.wins += 1;
      } else {
        a.draws += 1;
        b.draws += 1;
      }
      a.longestChain = Math.max(a.longestChain, input.chainLength);
      b.longestChain = Math.max(b.longestChain, input.chainLength);
      a.lastActive = Date.now();
      b.lastActive = Date.now();
    }

    const record: MatchRecord = {
      id: randomId('m'),
      playerA: input.playerA,
      playerB: input.playerB,
      scoreA: input.scoreA,
      scoreB: input.scoreB,
      winner,
      ranked: input.ranked,
      chainLength: input.chainLength,
      ratedAt: Date.now(),
    };
    this.data.matches.unshift(record);
    this.data.matches = this.data.matches.slice(0, 5000);
    this.persist();
    return record;
  }

  leaderboard(limit = 50, offset = 0): { total: number; rows: LeaderboardRow[] } {
    const ranked = Object.values(this.data.players)
      .filter((p) => p.matches > 0)
      .sort((x, y) => y.rating - x.rating || y.wins - x.wins || x.name.localeCompare(y.name, 'sv'));
    const rows = ranked
      .slice(offset, offset + limit)
      .map((p, i) => ({ ...p, rank: offset + i + 1 }));
    return { total: ranked.length, rows };
  }

  rankOf(id: string): number | null {
    const ranked = Object.values(this.data.players)
      .filter((p) => p.matches > 0)
      .sort((x, y) => y.rating - x.rating || y.wins - x.wins);
    const idx = ranked.findIndex((p) => p.id === id);
    return idx >= 0 ? idx + 1 : null;
  }

  recentMatches(playerId: string, limit = 20): MatchRecord[] {
    return this.data.matches.filter((m) => m.playerA === playerId || m.playerB === playerId).slice(0, limit);
  }

  private persist(): void {
    try {
      const dir = dirname(this.path);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(this.path, JSON.stringify(this.data), 'utf8');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ordduellen] Failed to persist online store:', err);
    }
  }
}

function sanitizeName(name: string): string {
  const clean = (name ?? '').trim().replace(/\s+/g, ' ').slice(0, 24);
  return clean || 'Spelare';
}

function load(path: string): StoreShape {
  try {
    if (!existsSync(path)) return { version: 1, players: {}, matches: [] };
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as StoreShape;
    return {
      version: parsed.version ?? 1,
      players: parsed.players ?? {},
      matches: Array.isArray(parsed.matches) ? parsed.matches : [],
    };
  } catch {
    return { version: 1, players: {}, matches: [] };
  }
}

let cached: Store | null = null;
export function getStore(): Store {
  if (!cached) cached = new Store();
  return cached;
}
