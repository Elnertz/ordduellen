import type { Difficulty, GameState, MoveResponse } from './types';

const BASE = '/api';

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string }).error ?? `Fel ${res.status}`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

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

export interface NewGameOptions {
  rounds: number;
  rackSize: number;
  difficulty: Difficulty;
}

export async function createGame(options: NewGameOptions): Promise<GameState> {
  const res = await fetch(`${BASE}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  return parse<GameState>(res);
}

export async function submitWord(id: string, word: string): Promise<MoveResponse> {
  const res = await fetch(`${BASE}/games/${id}/moves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word }),
  });
  return parse<MoveResponse>(res);
}

export async function getHint(id: string): Promise<string | null> {
  const res = await fetch(`${BASE}/games/${id}/hint`);
  const data = await parse<{ hint: string | null }>(res);
  return data.hint;
}
