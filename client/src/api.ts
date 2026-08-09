import type {
  AdminMeta,
  AdminStats,
  Difficulty,
  Entry,
  GameMode,
  GameState,
  TurnResponse,
  WinCondition,
} from './types';

// Same-origin by default (web). For a packaged native app, set VITE_API_BASE
// at build time to the absolute URL of the deployed backend.
export const API_ORIGIN = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');
const BASE = `${API_ORIGIN}/api`;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string }).error ?? `Fel ${res.status}`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

// --- Game ---------------------------------------------------------------

export interface NewGameOptions {
  mode: GameMode;
  winCondition: WinCondition;
  difficulty: Difficulty;
  targetScore: number;
  startWord?: string;
  playerNames?: string[];
}

export const createGame = (options: NewGameOptions) =>
  request<GameState>('/games', { method: 'POST', body: JSON.stringify(options) });

export const playTurn = (id: string, word: string) =>
  request<TurnResponse>(`/games/${id}/turns`, { method: 'POST', body: JSON.stringify({ word }) });

export const getRandomWord = () =>
  request<{ word: string; description: string }>('/random-word');

// --- Admin --------------------------------------------------------------

export const getAdminStats = () => request<AdminStats>('/admin/stats');
export const getAdminMeta = () => request<AdminMeta>('/admin/meta');

export const searchEntries = (params: {
  query?: string;
  category?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}) => {
  const q = new URLSearchParams();
  if (params.query) q.set('query', params.query);
  if (params.category) q.set('category', params.category);
  if (params.tag) q.set('tag', params.tag);
  q.set('limit', String(params.limit ?? 30));
  q.set('offset', String(params.offset ?? 0));
  return request<{ total: number; items: Entry[] }>(`/admin/entries?${q.toString()}`);
};

export const createEntry = (entry: Partial<Entry>) =>
  request<Entry>('/admin/entries', { method: 'POST', body: JSON.stringify(entry) });

export const updateEntry = (id: string, patch: Partial<Entry>) =>
  request<Entry>(`/admin/entries/${id}`, { method: 'PUT', body: JSON.stringify(patch) });

export const deleteEntry = (id: string) =>
  request<{ ok: boolean }>(`/admin/entries/${id}`, { method: 'DELETE' });

export const importEntries = (entries: Entry[]) =>
  request<{ imported: number; total: number }>('/admin/import', {
    method: 'POST',
    body: JSON.stringify({ entries }),
  });

export const generateEntries = (count: number) =>
  request<{ generated: number; total: number; sample: string[] }>('/admin/generate', {
    method: 'POST',
    body: JSON.stringify({ count }),
  });

export const validateDatabase = () =>
  request<{ ok: boolean; issues: string[]; checked: number }>('/admin/validate');

export const reportJudgment = (payload: {
  target: string;
  answer: string;
  verdict: 'approved' | 'rejected';
  confidence?: number;
  reason?: string;
  note?: string;
}) => request<{ ok: boolean; id: string }>('/judge/report', { method: 'POST', body: JSON.stringify(payload) });

export interface JudgmentReport {
  id: string;
  target: string;
  answer: string;
  verdict: 'approved' | 'rejected';
  confidence?: number;
  reason?: string;
  note?: string;
  votesAgree: number;
  votesDisagree: number;
  status: 'open' | 'resolved';
  resolution?: string;
  createdAt: number;
}

export const getReports = (status?: 'open' | 'resolved') =>
  request<{ stats: { total: number; open: number; resolved: number }; reports: JudgmentReport[] }>(
    `/admin/reports${status ? `?status=${status}` : ''}`,
  );

export const resolveReport = (id: string, resolution: string) =>
  request<{ ok: boolean }>(`/admin/reports/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  });

export const exportUrl = `${API_ORIGIN}/api/admin/export`;

// --- Online ---------------------------------------------------------------

import type { LeaderboardRow, Player } from './types';

export const getLeaderboard = (me?: string, limit = 50, offset = 0) => {
  const q = new URLSearchParams();
  q.set('limit', String(limit));
  q.set('offset', String(offset));
  if (me) q.set('me', me);
  return request<{ total: number; rows: LeaderboardRow[]; me: (LeaderboardRow | null) }>(
    `/online/leaderboard?${q.toString()}`,
  );
};

export const getPlayer = (id: string) =>
  request<{ player: Player; rank: number | null }>(`/online/player/${id}`);
