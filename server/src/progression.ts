// Calendar-correct streak logic and XP/level maths. Pure functions so they are
// easy to test and reuse. Streaks use real calendar days in a fixed timezone
// (not rolling 24h windows).

export const STREAK_TIMEZONE = 'Europe/Stockholm';
export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 365];

/** Calendar date key "YYYY-MM-DD" for a timestamp in the given timezone. */
export function dateKey(ts: number = Date.now(), tz: string = STREAK_TIMEZONE): string {
  // sv-SE formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ts));
}

/** The calendar date key immediately before `key`. */
export function previousDateKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const prev = new Date(Date.UTC(y, m - 1, d) - 86_400_000);
  const yy = prev.getUTCFullYear();
  const mm = String(prev.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(prev.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function isConsecutive(prev: string, next: string): boolean {
  return previousDateKey(next) === prev;
}

export interface StreakState {
  current: number;
  longest: number;
  lastDate: string | null;
  milestones: number[];
}

export interface StreakUpdate extends StreakState {
  changed: boolean;
  newMilestones: number[];
  isRecord: boolean;
}

/** Apply a qualifying activity on `day` to a streak state. */
export function updateStreak(state: StreakState, day: string): StreakUpdate {
  if (state.lastDate === day) {
    // Already counted today — no change.
    return { ...state, changed: false, newMilestones: [], isRecord: false };
  }
  const current = state.lastDate && isConsecutive(state.lastDate, day) ? state.current + 1 : 1;
  const longest = Math.max(state.longest, current);
  const isRecord = current > state.longest && current > 1;
  const newMilestones = STREAK_MILESTONES.filter((m) => current >= m && !state.milestones.includes(m));
  const milestones = [...state.milestones, ...newMilestones];
  return { current, longest, lastDate: day, milestones, changed: true, newMilestones, isRecord };
}

/** Whether the streak is still alive (played today or yesterday). */
export function streakAlive(state: StreakState, today: string = dateKey()): boolean {
  if (!state.lastDate) return false;
  return state.lastDate === today || isConsecutive(state.lastDate, today);
}

// --- XP / levels ----------------------------------------------------------

/** Cumulative XP required to *reach* a level (level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return 50 * (l - 1) * l; // L2=100, L3=300, L4=600, L5=1000 …
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level += 1;
  return level;
}

export interface LevelProgress {
  level: number;
  xp: number;
  levelStartXp: number;
  nextLevelXp: number;
  intoLevel: number;
  neededForNext: number;
  progress: number; // 0..1
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const levelStartXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const intoLevel = xp - levelStartXp;
  const neededForNext = nextLevelXp - levelStartXp;
  return {
    level,
    xp,
    levelStartXp,
    nextLevelXp,
    intoLevel,
    neededForNext,
    progress: neededForNext > 0 ? intoLevel / neededForNext : 1,
  };
}
