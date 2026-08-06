export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'finished';
export type Winner = 'player' | 'ai' | 'tie';

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

export interface MoveResponse {
  round: RoundResult;
  state: GameState;
}
