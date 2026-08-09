import { describe, expect, it } from 'vitest';
import {
  dateKey,
  previousDateKey,
  isConsecutive,
  updateStreak,
  streakAlive,
  levelFromXp,
  xpForLevel,
  levelProgress,
  type StreakState,
} from './progression.js';

describe('calendar dates', () => {
  it('formats a date key as YYYY-MM-DD', () => {
    expect(dateKey(Date.UTC(2026, 7, 9, 12), 'UTC')).toBe('2026-08-09');
  });

  it('computes the previous day across month boundaries', () => {
    expect(previousDateKey('2026-08-01')).toBe('2026-07-31');
    expect(previousDateKey('2026-01-01')).toBe('2025-12-31');
  });

  it('detects consecutive days', () => {
    expect(isConsecutive('2026-08-08', '2026-08-09')).toBe(true);
    expect(isConsecutive('2026-08-07', '2026-08-09')).toBe(false);
  });
});

describe('streak', () => {
  const fresh: StreakState = { current: 0, longest: 0, lastDate: null, milestones: [] };

  it('starts at 1 on first activity', () => {
    const s = updateStreak(fresh, '2026-08-09');
    expect(s.current).toBe(1);
    expect(s.longest).toBe(1);
    expect(s.lastDate).toBe('2026-08-09');
  });

  it('does not double-count the same day', () => {
    const s1 = updateStreak(fresh, '2026-08-09');
    const s2 = updateStreak(s1, '2026-08-09');
    expect(s2.changed).toBe(false);
    expect(s2.current).toBe(1);
  });

  it('increments on consecutive days and resets on a gap', () => {
    let s = updateStreak(fresh, '2026-08-09');
    s = updateStreak(s, '2026-08-10');
    s = updateStreak(s, '2026-08-11');
    expect(s.current).toBe(3);
    const afterGap = updateStreak(s, '2026-08-13');
    expect(afterGap.current).toBe(1);
    expect(afterGap.longest).toBe(3);
  });

  it('awards milestones as they are reached', () => {
    let s: StreakState = fresh;
    let day = new Date(Date.UTC(2026, 0, 1));
    const hits: number[] = [];
    for (let i = 0; i < 8; i += 1) {
      const key = day.toISOString().slice(0, 10);
      const u = updateStreak(s, key);
      hits.push(...u.newMilestones);
      s = u;
      day = new Date(day.getTime() + 86_400_000);
    }
    expect(hits).toContain(3);
    expect(hits).toContain(7);
  });

  it('knows whether a streak is still alive', () => {
    const s = updateStreak(fresh, '2026-08-09');
    expect(streakAlive(s, '2026-08-09')).toBe(true);
    expect(streakAlive(s, '2026-08-10')).toBe(true);
    expect(streakAlive(s, '2026-08-11')).toBe(false);
  });
});

describe('xp / levels', () => {
  it('has an increasing cumulative curve', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(xpForLevel(2)).toBeLessThan(xpForLevel(3));
  });

  it('maps xp to the correct level', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(300)).toBe(3);
  });

  it('reports progress into the current level', () => {
    const p = levelProgress(150);
    expect(p.level).toBe(2);
    expect(p.intoLevel).toBe(50);
    expect(p.neededForNext).toBe(200);
    expect(p.progress).toBeCloseTo(0.25, 5);
  });
});
