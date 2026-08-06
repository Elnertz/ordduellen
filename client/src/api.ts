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

const BASE = '/api';

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

export const exportUrl = `${BASE}/admin/export`;
