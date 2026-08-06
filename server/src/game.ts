import { Dictionary } from './dictionary.js';
import {
  canFormWord,
  createRng,
  drawRack,
  Rng,
  wordScore,
} from './letters.js';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RoundResult {
  round: number;
  rack: string[];
  playerWord: string;
  playerScore: number;
  aiWord: string;
  aiScore: number;
  bestPossibleWord: string;
  bestPossibleScore: number;
}

export type GameStatus = 'playing' | 'finished';
export type Winner = 'player' | 'ai' | 'tie';

export interface GameState {
  id: string;
  rounds: number;
  currentRound: number;
  rackSize: number;
  difficulty: Difficulty;
  status: GameStatus;
  rack: string[];
  scores: { player: number; ai: number };
  history: RoundResult[];
  winner: Winner | null;
}

export interface CreateGameOptions {
  rounds?: number;
  rackSize?: number;
  difficulty?: Difficulty;
  seed?: number;
}

export interface SubmitResult {
  ok: boolean;
  error?: string;
  round?: RoundResult;
  state: GameState;
}

interface InternalGame extends GameState {
  rng: Rng;
}

const DEFAULT_ROUNDS = 5;
const DEFAULT_RACK_SIZE = 8;
const MIN_WORD_LENGTH = 2;

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function publicState(game: InternalGame): GameState {
  const { rng: _rng, ...rest } = game;
  return {
    ...rest,
    rack: [...game.rack],
    history: game.history.map((h) => ({ ...h, rack: [...h.rack] })),
    scores: { ...game.scores },
  };
}

export class GameManager {
  private readonly games = new Map<string, InternalGame>();

  constructor(private readonly dict: Dictionary) {}

  createGame(options: CreateGameOptions = {}): GameState {
    const rounds = clamp(options.rounds ?? DEFAULT_ROUNDS, 1, 15);
    const rackSize = clamp(options.rackSize ?? DEFAULT_RACK_SIZE, 5, 10);
    const difficulty = options.difficulty ?? 'medium';
    const rng = createRng(options.seed);

    const game: InternalGame = {
      id: newId(),
      rounds,
      currentRound: 1,
      rackSize,
      difficulty,
      status: 'playing',
      rack: this.freshRack(rackSize, rng),
      scores: { player: 0, ai: 0 },
      history: [],
      winner: null,
      rng,
    };
    this.games.set(game.id, game);
    return publicState(game);
  }

  getGame(id: string): GameState | null {
    const game = this.games.get(id);
    return game ? publicState(game) : null;
  }

  // A rack that is guaranteed to allow at least one valid word.
  private freshRack(size: number, rng: Rng): string[] {
    for (let i = 0; i < 30; i += 1) {
      const rack = drawRack(size, rng);
      if (this.dict.bestWord(rack)) return rack.map((l) => l.toUpperCase());
    }
    return drawRack(size, rng).map((l) => l.toUpperCase());
  }

  validateWord(word: string, rack: string[]): { ok: boolean; error?: string } {
    const clean = word.trim().toLowerCase();
    if (clean.length < MIN_WORD_LENGTH) {
      return { ok: false, error: `Ordet måste vara minst ${MIN_WORD_LENGTH} bokstäver.` };
    }
    if (!/^[a-zåäö]+$/.test(clean)) {
      return { ok: false, error: 'Ordet får bara innehålla svenska bokstäver.' };
    }
    if (!canFormWord(clean, rack)) {
      return { ok: false, error: 'Ordet kan inte bildas av bokstäverna i stället.' };
    }
    if (!this.dict.has(clean)) {
      return { ok: false, error: `"${clean}" finns inte i ordlistan.` };
    }
    return { ok: true };
  }

  // Pick the AI's word for a rack based on difficulty. `hard` plays optimally,
  // `medium`/`easy` deliberately hold back so a human can win.
  private chooseAiWord(rack: string[], difficulty: Difficulty, rng: Rng): string {
    const options = this.dict.findFormableWords(rack);
    if (options.length === 0) return '';
    if (difficulty === 'hard') return options[0].word;
    if (difficulty === 'easy') {
      // Pick from the weakest third of available words.
      const start = Math.floor((options.length * 2) / 3);
      const pool = options.slice(start);
      return pool[Math.floor(rng() * pool.length)].word;
    }
    // medium: pick from the top quarter (but rarely the single best word).
    const top = Math.max(1, Math.floor(options.length / 4));
    const pool = options.slice(0, top);
    return pool[Math.floor(rng() * pool.length)].word;
  }

  // Return a valid mid-strength word the player could use, as a hint.
  getHint(id: string): string | null {
    const game = this.games.get(id);
    if (!game || game.status !== 'playing') return null;
    const options = this.dict.findFormableWords(game.rack);
    if (options.length === 0) return null;
    const idx = Math.floor(options.length / 2);
    return options[idx].word;
  }

  // Submit the player's word (empty string = pass) for the current round.
  submitWord(id: string, rawWord: string): SubmitResult {
    const game = this.games.get(id);
    if (!game) {
      throw new GameNotFoundError(id);
    }
    if (game.status !== 'playing') {
      return { ok: false, error: 'Spelet är redan avslutat.', state: publicState(game) };
    }

    const word = rawWord.trim().toLowerCase();
    let playerScore = 0;
    if (word.length > 0) {
      const validation = this.validateWord(word, game.rack);
      if (!validation.ok) {
        return { ok: false, error: validation.error, state: publicState(game) };
      }
      playerScore = wordScore(word);
    }

    const aiWord = this.chooseAiWord(game.rack, game.difficulty, game.rng);
    const aiScore = aiWord ? wordScore(aiWord) : 0;
    const best = this.dict.bestWord(game.rack);

    const result: RoundResult = {
      round: game.currentRound,
      rack: [...game.rack],
      playerWord: word,
      playerScore,
      aiWord,
      aiScore,
      bestPossibleWord: best?.word ?? '',
      bestPossibleScore: best?.score ?? 0,
    };

    game.scores.player += playerScore;
    game.scores.ai += aiScore;
    game.history.push(result);

    if (game.currentRound >= game.rounds) {
      game.status = 'finished';
      game.winner = decideWinner(game.scores.player, game.scores.ai);
    } else {
      game.currentRound += 1;
      game.rack = this.freshRack(game.rackSize, game.rng);
    }

    return { ok: true, round: result, state: publicState(game) };
  }
}

export class GameNotFoundError extends Error {
  constructor(id: string) {
    super(`Game ${id} not found`);
    this.name = 'GameNotFoundError';
  }
}

function decideWinner(player: number, ai: number): Winner {
  if (player > ai) return 'player';
  if (ai > player) return 'ai';
  return 'tie';
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}
