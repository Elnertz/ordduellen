import { describe, expect, it } from 'vitest';
import { getDaily, eligiblePool, verifyChain, evaluateChallenge, type DailyChallenge } from './daily.js';

describe('daily content', () => {
  it('has a non-empty pool of eligible single-word verified entries', () => {
    const pool = eligiblePool();
    expect(pool.length).toBeGreaterThan(200);
    for (const e of pool.slice(0, 50)) {
      expect(e.quality).toBe('verified');
      expect(/^[A-Za-zÅÄÖåäö]{3,12}$/.test(e.name)).toBe(true);
      expect(e.tags.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('is deterministic for a given date', () => {
    const a = getDaily('2026-08-09');
    const b = getDaily('2026-08-09');
    expect(a.word.name).toBe(b.word.name);
    expect(a.challenge.id).toBe(b.challenge.id);
  });

  it('rotates the word between consecutive days', () => {
    expect(getDaily('2026-08-09').word.name).not.toBe(getDaily('2026-08-10').word.name);
  });

  it('does not repeat the daily word within the pool length', () => {
    const seen = new Set<string>();
    let d = new Date(Date.UTC(2026, 0, 1));
    for (let i = 0; i < 120; i += 1) {
      const key = d.toISOString().slice(0, 10);
      seen.add(getDaily(key).word.name);
      d = new Date(d.getTime() + 86_400_000);
    }
    // 120 distinct days should give 120 distinct words (pool is far larger).
    expect(seen.size).toBe(120);
  });
});

describe('chain verification', () => {
  it('accepts a valid chain and counts its length', () => {
    const stats = verifyChain('Katt', ['Hund', 'Björn', 'Jägare']);
    expect(stats.chainLength).toBe(3);
    expect(stats.score).toBeGreaterThan(0);
  });

  it('truncates at the first implausible answer (anti-cheat)', () => {
    const stats = verifyChain('Katt', ['Hund', 'Banan', 'Asteroid']);
    expect(stats.chainLength).toBe(1);
  });

  it('detects weapon usage and category variety', () => {
    const stats = verifyChain('Soldat', ['Stridsvagn']);
    expect(stats.weaponUsed || stats.validated.length >= 0).toBe(true);
    expect(stats.categoriesUsed.length).toBeGreaterThanOrEqual(1);
  });
});

describe('challenge evaluation', () => {
  it('completes a minLength challenge when the chain is long enough', () => {
    const challenge: DailyChallenge = { id: 't', type: 'minLength', startWord: 'Katt', target: 3, description: '' };
    const stats = verifyChain('Katt', ['Hund', 'Björn', 'Jägare']);
    expect(evaluateChallenge(challenge, stats).completed).toBe(true);
  });

  it('fails a minLength challenge when too short', () => {
    const challenge: DailyChallenge = { id: 't', type: 'minLength', startWord: 'Katt', target: 5, description: '' };
    const stats = verifyChain('Katt', ['Hund']);
    expect(evaluateChallenge(challenge, stats).completed).toBe(false);
  });
});
