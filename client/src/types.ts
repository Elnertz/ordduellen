// Client-side DTOs mirroring the server API responses.

export type GameMode = 'twoPlayer' | 'vsComputer';
export type WinCondition = 'points' | 'endless';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'finished';
export type Verdict = 'approved' | 'rejected';

export interface Stats {
  power: number;
  toughness: number;
  speed: number;
  range: number;
  intelligence: number;
}

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
  stats: Stats;
}

export interface ChainLink {
  turn: number;
  playerIndex: number;
  playerName: string;
  fromTarget: string;
  word: string;
  verdict: Verdict;
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

export interface JudgeReason {
  kind: string;
  text: string;
  weight: number;
}

export interface JudgeResult {
  approved: boolean;
  verdict: Verdict;
  /** 0–100. */
  confidence: number;
  reason: string;
  explanation: string;
  ruleType: string;
  attacker: string;
  matchingConcepts: string[];
  warnings: string[];
  reasons: JudgeReason[];
  target: { name: string };
  answer: { name: string; matchType: string; resolved: boolean };
  score: number;
}

export interface TurnResponse {
  judgements: JudgeResult[];
  state: GameState;
}

export interface Entry {
  id: string;
  name: string;
  englishName?: string;
  aliases: string[];
  aliasesEn?: string[];
  categories: string[];
  power: number;
  toughness: number;
  speed: number;
  range: number;
  intelligence: number;
  size: number;
  techLevel: number;
  cosmicLevel: number;
  tags: string[];
  defeatsTags: string[];
  vulnerableToTags: string[];
  abilities: string[];
  weaknesses: string[];
  description: string;
  scale: number;
  source: string;
  quality: 'verified' | 'generated';
  curated?: boolean;
}

export interface AdminStats {
  total: number;
  curated: number;
  generated: number;
  categories: Record<string, number>;
}

export interface MetaOption {
  id: string;
  label: string;
}

export interface AdminMeta {
  categories: MetaOption[];
  tags: MetaOption[];
}

// --- Online / multiplayer -------------------------------------------------

export interface Player {
  id: string;
  name: string;
  guest: boolean;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  matches: number;
  longestChain: number;
}

export interface LeaderboardRow extends Player {
  rank: number;
}

export interface RoomPlayerView {
  name: string;
  index: number;
  connected: boolean;
  rating: number;
  wantsRematch: boolean;
}

export interface RoomView {
  code: string;
  status: 'lobby' | 'playing' | 'finished';
  hostId: string;
  isHost: boolean;
  settings: { winCondition: WinCondition; targetScore: number; startWord?: string; ranked: boolean };
  players: RoomPlayerView[];
  youIndex: number;
}

export interface RatingDelta {
  index: number;
  rating: number;
  delta: number;
}

export interface MatchResult {
  winnerIndex: number | null;
  ranked: boolean;
  forfeit?: boolean;
  ratings: RatingDelta[];
}
