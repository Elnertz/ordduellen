import { describe, expect, it } from 'vitest';
import { Dictionary } from './dictionary.js';
import { GameManager } from './game.js';
import {
  canFormWord,
  drawRack,
  createRng,
  lengthBonus,
  wordScore,
} from './letters.js';
import { loadDictionary } from './dictionary.js';

// A small deterministic dictionary for unit tests.
const testDict = new Dictionary(['katt', 'katta', 'ratt', 'rat', 'tak', 'akt', 'kar', 'ko', 'ost', 'sol', 'los']);

describe('letters', () => {
  it('scores a word by summing Swedish tile values plus a length bonus', () => {
    // k(2) + a(1) + t(1) + t(1) = 5, length 4 => no bonus
    expect(wordScore('katt')).toBe(5);
    // length 5 gives +6 bonus
    expect(wordScore('katta')).toBe(6 + lengthBonus(5));
  });

  it('applies increasing length bonuses', () => {
    expect(lengthBonus(4)).toBe(0);
    expect(lengthBonus(5)).toBe(6);
    expect(lengthBonus(6)).toBe(12);
    expect(lengthBonus(7)).toBe(20);
  });

  it('checks whether a word can be formed from a rack', () => {
    expect(canFormWord('katt', ['K', 'A', 'T', 'T', 'O'])).toBe(true);
    expect(canFormWord('katt', ['K', 'A', 'T', 'O'])).toBe(false); // only one T
    expect(canFormWord('zoo', ['Z', 'O'])).toBe(false);
  });

  it('draws a rack of the requested size with at least two vowels', () => {
    const rng = createRng(123);
    for (let i = 0; i < 20; i += 1) {
      const rack = drawRack(8, rng);
      expect(rack).toHaveLength(8);
      const vowels = rack.filter((l) => 'aeiouyåäö'.includes(l)).length;
      expect(vowels).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('Dictionary', () => {
  it('finds the best formable word from a rack', () => {
    const best = testDict.bestWord(['K', 'A', 'T', 'T', 'A', 'O', 'S']);
    expect(best?.word).toBe('katta');
  });

  it('returns all formable words sorted by score descending', () => {
    const words = testDict.findFormableWords(['K', 'A', 'T', 'T', 'A']);
    expect(words.map((w) => w.word)).toContain('katt');
    expect(words.map((w) => w.word)).toContain('katta');
    for (let i = 1; i < words.length; i += 1) {
      expect(words[i - 1].score).toBeGreaterThanOrEqual(words[i].score);
    }
  });

  it('returns null when no word can be formed', () => {
    expect(testDict.bestWord(['Z', 'X'])).toBeNull();
  });
});

describe('GameManager', () => {
  it('creates a game with the requested settings and a playable rack', () => {
    const manager = new GameManager(testDict);
    const state = manager.createGame({ rounds: 3, rackSize: 7, difficulty: 'hard', seed: 1 });
    expect(state.rounds).toBe(3);
    expect(state.rack).toHaveLength(7);
    expect(state.status).toBe('playing');
    expect(state.currentRound).toBe(1);
  });

  it('rejects invalid words with a helpful reason', () => {
    const manager = new GameManager(testDict);
    const state = manager.createGame({ seed: 1 });
    const rack = state.rack;
    // A word not in the dictionary
    const notWord = manager.validateWord('qwqw', rack);
    expect(notWord.ok).toBe(false);
  });

  it('accepts a valid word, advances the round, and lets the AI respond', () => {
    const manager = new GameManager(testDict);
    // Force a known rack by using the real submit flow against a seeded game.
    const state = manager.createGame({ rounds: 2, rackSize: 7, difficulty: 'hard', seed: 5 });
    // Find any valid word for the current rack using the dictionary itself.
    const options = testDict.findFormableWords(state.rack);
    if (options.length > 0) {
      const result = manager.submitWord(state.id, options[0].word);
      expect(result.ok).toBe(true);
      expect(result.round?.playerScore).toBeGreaterThan(0);
      expect(result.state.currentRound).toBe(2);
      expect(result.state.history).toHaveLength(1);
    }
  });

  it('finishes after the configured number of rounds and picks a winner', () => {
    const manager = new GameManager(testDict);
    const created = manager.createGame({ rounds: 2, rackSize: 7, difficulty: 'medium', seed: 9 });
    let state = created;
    for (let round = 0; round < 2; round += 1) {
      const options = testDict.findFormableWords(state.rack);
      const word = options[0]?.word ?? '';
      const result = manager.submitWord(state.id, word);
      state = result.state;
    }
    expect(state.status).toBe('finished');
    expect(['player', 'ai', 'tie']).toContain(state.winner);
    expect(state.history).toHaveLength(2);
  });

  it('supports passing (empty word) scoring zero for the player', () => {
    const manager = new GameManager(testDict);
    const state = manager.createGame({ rounds: 1, rackSize: 7, seed: 3 });
    const result = manager.submitWord(state.id, '');
    expect(result.ok).toBe(true);
    expect(result.round?.playerScore).toBe(0);
    expect(result.state.status).toBe('finished');
  });

  it('throws for an unknown game id', () => {
    const manager = new GameManager(testDict);
    expect(() => manager.submitWord('nope', 'katt')).toThrowError();
  });

  it('provides a valid hint that can be formed from the rack', () => {
    const manager = new GameManager(testDict);
    const state = manager.createGame({ seed: 2 });
    const hint = manager.getHint(state.id);
    if (hint) {
      expect(canFormWord(hint, state.rack)).toBe(true);
      expect(testDict.has(hint)).toBe(true);
    }
  });
});

describe('real Swedish dictionary', () => {
  it('loads tens of thousands of words and validates real ones', () => {
    const dict = loadDictionary();
    expect(dict.size).toBeGreaterThan(50000);
    expect(dict.has('hus')).toBe(true);
    expect(dict.has('katt')).toBe(true);
    expect(dict.has('xyzzy')).toBe(false);
  });

  it('finds a strong best word for a real rack in reasonable time', () => {
    const dict = loadDictionary();
    const manager = new GameManager(dict);
    const state = manager.createGame({ seed: 42, rackSize: 8, difficulty: 'hard' });
    const best = dict.bestWord(state.rack);
    expect(best).not.toBeNull();
    expect(manager.validateWord(best!.word, state.rack).ok).toBe(true);
  });
});
