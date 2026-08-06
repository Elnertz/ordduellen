// Client-side DTOs mirroring the server API responses.

export type GameMode = 'twoPlayer' | 'vsComputer';
export type WinCondition = 'points' | 'endless';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'finished';
export type Verdict = 'approved' | 'rejected';

export interface Stats {
  power: number;
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
  verdict: Verdict;
  confidence: number;
  explanation: string;
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
  aliases: string[];
  categories: string[];
  power: number;
  speed: number;
  range: number;
  intelligence: number;
  tags: string[];
  defeatsTags: string[];
  vulnerableToTags: string[];
  description: string;
  scale: number;
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
