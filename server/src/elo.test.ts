import { describe, expect, it } from 'vitest';
import { applyMatch, updateRating, DEFAULT_RATING } from './elo.js';

describe('elo', () => {
  it('gives the winner points and the loser an equal loss for even ratings', () => {
    const { deltaA, deltaB } = applyMatch(DEFAULT_RATING, DEFAULT_RATING, 'win');
    expect(deltaA).toBe(16);
    expect(deltaB).toBe(-16);
  });

  it('rewards beating a higher-rated opponent more', () => {
    const upset = updateRating(1000, 1400, 'win') - 1000;
    const expected = updateRating(1400, 1000, 'win') - 1400;
    expect(upset).toBeGreaterThan(expected);
  });

  it('is a draw-neutral zero-sum for equal ratings', () => {
    const { deltaA, deltaB } = applyMatch(DEFAULT_RATING, DEFAULT_RATING, 'draw');
    expect(deltaA).toBe(0);
    expect(deltaB).toBe(0);
  });

  it('penalises losing to a lower-rated opponent', () => {
    const drop = updateRating(1400, 1000, 'loss') - 1400;
    expect(drop).toBeLessThan(-16);
  });
});
