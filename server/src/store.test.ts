import { describe, expect, it, afterAll } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rmSync } from 'node:fs';
import { Store } from './store.js';

const path = join(tmpdir(), `ordduellen-store-test-${Date.now()}.json`);
const store = new Store(path);

afterAll(() => {
  try {
    rmSync(path);
  } catch {
    /* ignore */
  }
});

describe('Store', () => {
  it('creates guests with default rating and empty record', () => {
    const p = store.getOrCreateGuest('Alice');
    expect(p.rating).toBe(1000);
    expect(p.wins).toBe(0);
    expect(p.matches).toBe(0);
    expect(p.guest).toBe(true);
  });

  it('records a ranked match, updating ratings and stats', () => {
    const a = store.getOrCreateGuest('Winner');
    const b = store.getOrCreateGuest('Loser');
    store.recordMatch({ playerA: a.id, playerB: b.id, scoreA: 5, scoreB: 3, chainLength: 7, ranked: true });
    expect(store.getPlayer(a.id)!.rating).toBe(1016);
    expect(store.getPlayer(b.id)!.rating).toBe(984);
    expect(store.getPlayer(a.id)!.wins).toBe(1);
    expect(store.getPlayer(b.id)!.losses).toBe(1);
    expect(store.getPlayer(a.id)!.longestChain).toBe(7);
  });

  it('does not change ratings for unranked matches but still tracks record', () => {
    const a = store.getOrCreateGuest('CasualA');
    const b = store.getOrCreateGuest('CasualB');
    store.recordMatch({ playerA: a.id, playerB: b.id, scoreA: 5, scoreB: 1, chainLength: 3, ranked: false });
    expect(store.getPlayer(a.id)!.rating).toBe(1000);
    expect(store.getPlayer(a.id)!.wins).toBe(1);
  });

  it('honours an explicit winner (forfeit) regardless of score', () => {
    const a = store.getOrCreateGuest('Quitter');
    const b = store.getOrCreateGuest('Stayer');
    store.recordMatch({ playerA: a.id, playerB: b.id, scoreA: 2, scoreB: 0, chainLength: 2, ranked: true, winnerId: b.id });
    expect(store.getPlayer(b.id)!.wins).toBe(1);
    expect(store.getPlayer(a.id)!.losses).toBe(1);
    expect(store.getPlayer(b.id)!.rating).toBeGreaterThan(1000);
  });

  it('builds a ranked, ordered leaderboard with ranks', () => {
    const board = store.leaderboard(10, 0);
    expect(board.rows.length).toBeGreaterThan(0);
    expect(board.rows[0].rank).toBe(1);
    for (let i = 1; i < board.rows.length; i += 1) {
      expect(board.rows[i - 1].rating).toBeGreaterThanOrEqual(board.rows[i].rating);
    }
  });
});
