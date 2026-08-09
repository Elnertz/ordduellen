// Replay store + short match links. Persists completed chains so any match or
// challenge can be replayed step-by-step and shared read-only via a short URL.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');

export type Visibility = 'private' | 'friends' | 'link';

export interface ReplayMove {
  turn: number;
  playerName: string;
  fromTarget: string;
  word: string;
  verdict: 'approved' | 'rejected';
  confidence: number;
  explanation: string;
  awardedPoint: boolean;
}

export interface Replay {
  id: string;
  mode: string;
  players: string[];
  scores: number[];
  winnerIndex: number | null;
  chainLength: number;
  chain: ReplayMove[];
  date: string;
  visibility: Visibility;
  createdAt: number;
}

export interface CreateReplayInput {
  mode: string;
  players: string[];
  scores?: number[];
  winnerIndex?: number | null;
  chain: ReplayMove[];
  visibility?: Visibility;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class ReplayStore {
  private replays: Record<string, Replay> = {};
  private path: string;

  constructor(path: string = resolve(DATA_DIR, 'replays.json')) {
    this.path = path;
    this.replays = load(path);
  }

  private newId(): string {
    let id = '';
    do {
      id = Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
    } while (this.replays[id]);
    return id;
  }

  create(input: CreateReplayInput): Replay {
    const id = this.newId();
    const chain = (input.chain ?? []).slice(0, 200);
    const replay: Replay = {
      id,
      mode: input.mode,
      players: input.players ?? [],
      scores: input.scores ?? [],
      winnerIndex: input.winnerIndex ?? null,
      chainLength: chain.filter((m) => m.awardedPoint).length,
      chain,
      date: new Date().toISOString().slice(0, 10),
      visibility: input.visibility ?? 'link',
      createdAt: Date.now(),
    };
    this.replays[id] = replay;
    this.prune();
    this.persist();
    return replay;
  }

  /** Fetch a replay for public viewing (private replays are hidden). */
  get(id: string): Replay | undefined {
    const r = this.replays[id?.toUpperCase()];
    if (!r || r.visibility === 'private') return undefined;
    return r;
  }

  get size(): number {
    return Object.keys(this.replays).length;
  }

  private prune(): void {
    const ids = Object.keys(this.replays);
    if (ids.length <= 20000) return;
    const sorted = Object.values(this.replays).sort((a, b) => b.createdAt - a.createdAt);
    this.replays = {};
    for (const r of sorted.slice(0, 15000)) this.replays[r.id] = r;
  }

  private persist(): void {
    try {
      const dir = dirname(this.path);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(this.path, JSON.stringify(this.replays), 'utf8');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ordduellen] Failed to persist replays:', err);
    }
  }
}

function load(path: string): Record<string, Replay> {
  try {
    if (!existsSync(path)) return {};
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

let cached: ReplayStore | null = null;
export function getReplayStore(): ReplayStore {
  if (!cached) cached = new ReplayStore();
  return cached;
}
