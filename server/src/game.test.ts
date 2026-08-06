import { describe, expect, it, beforeEach } from 'vitest';
import { getDatabase } from './database.js';
import { GameManager } from './game.js';

const db = getDatabase();

describe('GameManager', () => {
  let manager: GameManager;
  beforeEach(() => {
    manager = new GameManager(db);
  });

  it('creates a vs-computer game with a starting target', () => {
    const state = manager.createGame({ mode: 'vsComputer', startWord: 'Katt' });
    expect(state.target.name).toBe('Katt');
    expect(state.players).toHaveLength(2);
    expect(state.players[1].isComputer).toBe(true);
    expect(state.status).toBe('playing');
  });

  it('awards a point and advances the target on an approved answer', () => {
    const state = manager.createGame({ mode: 'twoPlayer', startWord: 'Missil', winCondition: 'endless' });
    const res = manager.playTurn(state.id, 'Asteroid');
    expect(res.ok).toBe(true);
    expect(res.judgements[0].verdict).toBe('approved');
    expect(res.state.players[0].score).toBe(1);
    expect(res.state.target.name).toBe('Asteroid');
    // Turn passed to player 2.
    expect(res.state.currentPlayerIndex).toBe(1);
  });

  it('does not advance the target on a rejected answer', () => {
    const state = manager.createGame({ mode: 'twoPlayer', startWord: 'Kärnvapen', winCondition: 'endless' });
    const res = manager.playTurn(state.id, 'Banan');
    expect(res.judgements[0].verdict).toBe('rejected');
    expect(res.state.target.name).toBe('Kärnvapen');
    expect(res.state.players[0].score).toBe(0);
  });

  it('rejects reusing a word already played', () => {
    const state = manager.createGame({ mode: 'twoPlayer', startWord: 'Missil', winCondition: 'endless' });
    manager.playTurn(state.id, 'Asteroid');
    // Player 2 tries to reuse "Missil" (the original target, already used).
    const res = manager.playTurn(state.id, 'Missil');
    expect(res.ok).toBe(false);
    expect(res.error).toContain('använts');
  });

  it('lets the computer automatically answer in vs-computer mode', () => {
    const state = manager.createGame({ mode: 'vsComputer', startWord: 'Lejon', winCondition: 'endless', difficulty: 'hard' });
    const res = manager.playTurn(state.id, 'Jägare');
    expect(res.ok).toBe(true);
    // First judgement is the human's, subsequent ones are the computer's.
    expect(res.judgements.length).toBeGreaterThanOrEqual(1);
    // After the computer plays, it should be the human's turn again (or game over).
    expect(res.state.currentPlayerIndex === 0 || res.state.status === 'finished').toBe(true);
  });

  it('finishes when a player reaches the target score', () => {
    const state = manager.createGame({ mode: 'twoPlayer', startWord: 'Katt', winCondition: 'points', targetScore: 1 });
    const res = manager.playTurn(state.id, 'Hund');
    if (res.judgements[0].verdict === 'approved') {
      expect(res.state.status).toBe('finished');
      expect(res.state.winner).toBe(0);
    }
  });

  it('tracks aggregate statistics', () => {
    const state = manager.createGame({ mode: 'twoPlayer', startWord: 'Missil', winCondition: 'endless' });
    const res = manager.playTurn(state.id, 'Asteroid');
    expect(res.state.stats.turns).toBeGreaterThanOrEqual(1);
    expect(res.state.stats.approvals + res.state.stats.rejections).toBe(res.state.stats.turns);
  });
});
