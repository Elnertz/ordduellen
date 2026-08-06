import type { Entry, JudgeResult } from './types.js';
import { Database } from './database.js';
import { judge } from './judge.js';
import { categoryLabel, tagLabel } from './taxonomy.js';

export type GameMode = 'twoPlayer' | 'vsComputer';
export type WinCondition = 'points' | 'endless';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'finished';

export interface Player {
  name: string;
  score: number;
  isComputer: boolean;
}

export interface TargetView {
  id: string | null;
  name: string;
  categories: string[];
  categoryLabels: string[];
  tags: string[];
  tagLabels: string[];
  abilities: string[];
  weaknesses: string[];
  quality: string;
  description: string;
  scale: number;
  stats: { power: number; toughness: number; speed: number; range: number; intelligence: number };
}

export interface ChainLink {
  turn: number;
  playerIndex: number;
  playerName: string;
  fromTarget: string;
  word: string;
  verdict: 'approved' | 'rejected';
  confidence: number;
  explanation: string;
  matchType: string;
  awardedPoint: boolean;
}

export interface GameStats {
  turns: number;
  approvals: number;
  rejections: number;
  longestChain: number;
  strongestWord: { name: string; scale: number } | null;
}

export interface GameState {
  id: string;
  mode: GameMode;
  winCondition: WinCondition;
  difficulty: Difficulty;
  targetScore: number;
  players: Player[];
  currentPlayerIndex: number;
  target: TargetView;
  chain: ChainLink[];
  status: GameStatus;
  winner: number | null;
  stats: GameStats;
}

export interface CreateGameOptions {
  mode?: GameMode;
  winCondition?: WinCondition;
  difficulty?: Difficulty;
  targetScore?: number;
  playerNames?: string[];
  startWord?: string;
}

export interface TurnResult {
  ok: boolean;
  error?: string;
  judgements: JudgeResult[];
  state: GameState;
}

interface InternalGame extends GameState {
  targetEntry: Entry;
  usedNames: Set<string>;
  currentChainRun: number;
}

const DEFAULT_TARGET_SCORE = 5;

export class GameManager {
  private games = new Map<string, InternalGame>();

  constructor(private db: Database) {}

  createGame(options: CreateGameOptions = {}): GameState {
    const mode = options.mode ?? 'vsComputer';
    const winCondition = options.winCondition ?? 'points';
    const difficulty = options.difficulty ?? 'medium';
    const targetScore = clampInt(options.targetScore ?? DEFAULT_TARGET_SCORE, 1, 50);

    const names = options.playerNames ?? (mode === 'vsComputer' ? ['Du', 'Datorn'] : ['Spelare 1', 'Spelare 2']);
    const players: Player[] = [
      { name: names[0] ?? 'Spelare 1', score: 0, isComputer: false },
      {
        name: names[1] ?? (mode === 'vsComputer' ? 'Datorn' : 'Spelare 2'),
        score: 0,
        isComputer: mode === 'vsComputer',
      },
    ];

    const startEntry = this.pickStart(options.startWord);
    const game: InternalGame = {
      id: Math.random().toString(36).slice(2, 10),
      mode,
      winCondition,
      difficulty,
      targetScore: winCondition === 'points' ? targetScore : 0,
      players,
      currentPlayerIndex: 0,
      target: toTargetView(startEntry),
      targetEntry: startEntry,
      chain: [],
      status: 'playing',
      winner: null,
      stats: { turns: 0, approvals: 0, rejections: 0, longestChain: 0, strongestWord: null },
      usedNames: new Set([normalize(startEntry.name)]),
      currentChainRun: 0,
    };
    this.games.set(game.id, game);
    return publicState(game);
  }

  getGame(id: string): GameState | null {
    const g = this.games.get(id);
    return g ? publicState(g) : null;
  }

  private pickStart(startWord?: string): Entry {
    if (startWord && startWord.trim()) {
      return this.db.resolve(startWord).entry;
    }
    // Prefer a curated, mid-scale starting concept for a fair first duel.
    return this.db.randomEntry((e) => e.curated === true && e.scale >= 20 && e.scale <= 70);
  }

  playTurn(id: string, word: string): TurnResult {
    const game = this.games.get(id);
    if (!game) throw new GameNotFoundError(id);
    if (game.status !== 'playing') {
      return { ok: false, error: 'Spelet är avslutat.', judgements: [], state: publicState(game) };
    }
    if (currentPlayer(game).isComputer) {
      return { ok: false, error: 'Det är datorns tur.', judgements: [], state: publicState(game) };
    }

    const clean = word.trim();
    if (!clean) {
      return { ok: false, error: 'Skriv ett ord.', judgements: [], state: publicState(game) };
    }
    if (game.usedNames.has(normalize(clean))) {
      return { ok: false, error: 'Det ordet har redan använts i den här duellen.', judgements: [], state: publicState(game) };
    }

    const judgements: JudgeResult[] = [];
    const humanJudgement = this.applyMove(game, clean);
    judgements.push(humanJudgement);

    // Auto-play the computer while it is its turn and the game continues.
    let guard = 0;
    while (game.status === 'playing' && currentPlayer(game).isComputer && guard < 4) {
      const aiWord = this.chooseAiWord(game);
      const aiJudgement = this.applyMove(game, aiWord);
      judgements.push(aiJudgement);
      guard += 1;
    }

    return { ok: true, judgements, state: publicState(game) };
  }

  // Resolve + judge a single word for the current player, then advance state.
  private applyMove(game: InternalGame, word: string): JudgeResult {
    const { entry: answer, ref } = this.db.resolve(word);
    const result = judge(game.targetEntry, answer, ref.matchType, ref.resolved);
    const playerIndex = game.currentPlayerIndex;
    const player = game.players[playerIndex];
    const approved = result.verdict === 'approved';

    game.stats.turns += 1;
    if (approved) {
      game.stats.approvals += 1;
      player.score += 1;
      game.currentChainRun += 1;
      game.stats.longestChain = Math.max(game.stats.longestChain, game.currentChainRun);
      if (!game.stats.strongestWord || answer.scale > game.stats.strongestWord.scale) {
        game.stats.strongestWord = { name: answer.name, scale: answer.scale };
      }
    } else {
      game.stats.rejections += 1;
      game.currentChainRun = 0;
    }

    game.chain.unshift({
      turn: game.stats.turns,
      playerIndex,
      playerName: player.name,
      fromTarget: game.target.name,
      word: answer.name,
      verdict: result.verdict,
      confidence: result.confidence,
      explanation: result.explanation,
      matchType: ref.matchType,
      awardedPoint: approved,
    });

    game.usedNames.add(normalize(answer.name));
    game.usedNames.add(normalize(word));

    if (approved) {
      game.targetEntry = answer;
      game.target = toTargetView(answer);
    }

    // Win check.
    if (game.winCondition === 'points' && player.score >= game.targetScore) {
      game.status = 'finished';
      game.winner = playerIndex;
    } else {
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    }

    return result;
  }

  // Forfeit the current player's turn (e.g. timeout in online play): record a
  // rejected "timeout" link and pass the turn without changing the score.
  forfeitTurn(id: string): TurnResult {
    const game = this.games.get(id);
    if (!game) throw new GameNotFoundError(id);
    if (game.status !== 'playing') {
      return { ok: false, error: 'Spelet är avslutat.', judgements: [], state: publicState(game) };
    }
    const playerIndex = game.currentPlayerIndex;
    const player = game.players[playerIndex];
    game.stats.turns += 1;
    game.stats.rejections += 1;
    game.currentChainRun = 0;
    game.chain.unshift({
      turn: game.stats.turns,
      playerIndex,
      playerName: player.name,
      fromTarget: game.target.name,
      word: '',
      verdict: 'rejected',
      confidence: 0,
      explanation: 'Tiden gick ut – turen går vidare.',
      matchType: 'timeout',
      awardedPoint: false,
    });
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    return { ok: true, judgements: [], state: publicState(game) };
  }

  // Choose a word for the computer that beats the current target.
  private chooseAiWord(game: InternalGame): string {
    const target = game.targetEntry;
    const candidatePool = new Map<string, Entry>();
    for (const tag of target.vulnerableToTags) {
      for (const e of this.db.entriesWithTag(tag)) {
        if (!game.usedNames.has(normalize(e.name))) candidatePool.set(e.id, e);
      }
    }
    // Add a few heavy hitters for tough targets.
    if (candidatePool.size < 20) {
      for (const e of this.db.all()) {
        if (e.scale >= target.scale + 10 && !game.usedNames.has(normalize(e.name))) {
          candidatePool.set(e.id, e);
          if (candidatePool.size > 200) break;
        }
      }
    }

    const candidates = [...candidatePool.values()].slice(0, 500);
    const scored = candidates
      .map((e) => ({ e, r: judge(target, e, 'exact', true) }))
      .filter((x) => x.r.verdict === 'approved')
      .sort((a, b) => b.r.score - a.r.score);

    if (scored.length === 0) {
      // No approved counter found: play the highest-scale unused entry (likely rejected, passes turn).
      const fallback = this.db.randomEntry((e) => !game.usedNames.has(normalize(e.name)));
      return fallback.name;
    }

    const pick = pickByDifficulty(scored, game.difficulty);
    return pick.e.name;
  }
}

function pickByDifficulty<T>(scored: T[], difficulty: Difficulty): T {
  if (difficulty === 'hard') return scored[0];
  if (difficulty === 'easy') {
    const start = Math.floor((scored.length * 2) / 3);
    const pool = scored.slice(start);
    return pool[Math.floor(Math.random() * pool.length)] ?? scored[scored.length - 1];
  }
  const top = Math.max(1, Math.floor(scored.length / 3));
  return scored[Math.floor(Math.random() * top)];
}

export class GameNotFoundError extends Error {
  constructor(id: string) {
    super(`Game ${id} not found`);
    this.name = 'GameNotFoundError';
  }
}

function currentPlayer(game: InternalGame): Player {
  return game.players[game.currentPlayerIndex];
}

function toTargetView(entry: Entry): TargetView {
  return {
    id: entry.id.startsWith('inferred:') ? null : entry.id,
    name: entry.name,
    categories: entry.categories,
    categoryLabels: entry.categories.map(categoryLabel),
    tags: entry.tags,
    tagLabels: entry.tags.map(tagLabel),
    abilities: entry.abilities ?? [],
    weaknesses: entry.weaknesses ?? [],
    quality: entry.quality ?? (entry.curated ? 'verified' : 'generated'),
    description: entry.description,
    scale: entry.scale,
    stats: {
      power: entry.power,
      toughness: entry.toughness,
      speed: entry.speed,
      range: entry.range,
      intelligence: entry.intelligence,
    },
  };
}

function publicState(game: InternalGame): GameState {
  const { targetEntry: _t, usedNames: _u, currentChainRun: _c, ...rest } = game;
  return {
    ...rest,
    players: game.players.map((p) => ({ ...p })),
    target: { ...game.target, stats: { ...game.target.stats } },
    chain: game.chain.map((l) => ({ ...l })),
    stats: { ...game.stats },
  };
}

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function clampInt(v: number, min: number, max: number): number {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, Math.round(v)));
}
