import { describe, expect, it } from 'vitest';
import { getDatabase } from './database.js';
import { judge } from './judge.js';

const db = getDatabase();

function duel(targetWord: string, answerWord: string) {
  const t = db.resolve(targetWord);
  const a = db.resolve(answerWord);
  return judge(t.entry, a.entry, a.ref.matchType, a.ref.resolved);
}

describe('judge — classic believable matchups approve', () => {
  const shouldApprove: Array<[string, string]> = [
    ['Missil', 'Asteroid'],
    ['Människa', 'Virus'],
    ['Stridsvagn', 'Kärnvapen'],
    ['Lejon', 'Jägare'],
    ['Berg', 'Jordbävning'],
    ['Dator', 'Hackare'],
    ['Robot', 'Hackare'],
    ['Drake', 'Trollkarl'],
    ['Asteroid', 'Svart hål'],
    ['Eld', 'Vatten'],
    ['Robot', 'EMP'],
  ];

  it.each(shouldApprove)('%s -> %s is approved', (t, a) => {
    const r = duel(t, a);
    expect(r.verdict).toBe('approved');
    expect(r.explanation).toContain('Godkänt');
  });
});

describe('judge — implausible matchups are rejected', () => {
  const shouldReject: Array<[string, string]> = [
    ['Kärnvapen', 'Banan'],
    ['Lejon', 'Mus'],
    ['Asteroid', 'Myra'],
    ['Vatten', 'Eld'],
  ];

  it.each(shouldReject)('%s -> %s is rejected', (t, a) => {
    const r = duel(t, a);
    expect(r.verdict).toBe('rejected');
    expect(r.explanation).toContain('Nekat');
  });
});

describe('judge — general behaviour', () => {
  it('never lets a word beat itself', () => {
    const r = duel('Lejon', 'Lejon');
    expect(r.verdict).toBe('rejected');
    expect(r.explanation).toContain('sig självt');
  });

  it('always returns a Swedish explanation and confidence', () => {
    const r = duel('Missil', 'Asteroid');
    expect(r.explanation.length).toBeGreaterThan(10);
    expect(r.confidence).toBeGreaterThan(0);
    expect(r.confidence).toBeLessThanOrEqual(1);
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same inputs', () => {
    const a = duel('Stridsvagn', 'Kärnvapen');
    const b = duel('Stridsvagn', 'Kärnvapen');
    expect(a.score).toBe(b.score);
    expect(a.verdict).toBe(b.verdict);
  });

  it('reasons about unknown words via inference', () => {
    const r = duel('Riddare', 'Glorbnix');
    expect(['approved', 'rejected']).toContain(r.verdict);
    expect(r.answer.name).toBe('Glorbnix');
    expect(r.answer.matchType).toBe('inferred');
  });
});
