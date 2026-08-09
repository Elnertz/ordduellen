// Standard Elo rating maths for ranked matches.

export const DEFAULT_RATING = 1000;
const K_FACTOR = 32;

export type Outcome = 'win' | 'loss' | 'draw';

function expectedScore(rating: number, opponentRating: number): number {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400));
}

function scoreOf(outcome: Outcome): number {
  return outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0;
}

/** New rating for a player after a match against `opponentRating`. */
export function updateRating(rating: number, opponentRating: number, outcome: Outcome): number {
  const expected = expectedScore(rating, opponentRating);
  const next = rating + K_FACTOR * (scoreOf(outcome) - expected);
  return Math.round(next);
}

/** Convenience: compute both players' new ratings for a head-to-head result. */
export function applyMatch(
  ratingA: number,
  ratingB: number,
  resultForA: Outcome,
): { ratingA: number; ratingB: number; deltaA: number; deltaB: number } {
  const resultForB: Outcome = resultForA === 'win' ? 'loss' : resultForA === 'loss' ? 'win' : 'draw';
  const newA = updateRating(ratingA, ratingB, resultForA);
  const newB = updateRating(ratingB, ratingA, resultForB);
  return { ratingA: newA, ratingB: newB, deltaA: newA - ratingA, deltaB: newB - ratingB };
}
