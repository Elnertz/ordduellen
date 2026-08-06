// Core domain model for Ordduellen — a reasoning duel where players name
// something that could realistically defeat the current target word.

export interface Stats {
  /** Raw destructive/offensive capability, 0–100. */
  power: number;
  /** How fast it can act, 0–100. */
  speed: number;
  /** Reach/area of influence, 0–100. */
  range: number;
  /** Cunning / adaptability, 0–100. */
  intelligence: number;
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
  /**
   * Abstract "scale of existence" 0–100 used for the cosmic hierarchy
   * (an ant is ~2, a nuke ~70, a black hole ~97, a reality-warper ~99).
   */
  scale: number;
  /** True for hand-authored entries, false for programmatically generated ones. */
  curated?: boolean;
}

export type Verdict = 'approved' | 'rejected';

export interface JudgeReason {
  kind:
    | 'vulnerability'
    | 'counter'
    | 'tag-advantage'
    | 'scale'
    | 'stat'
    | 'reverse'
    | 'fallback';
  /** Human-readable Swedish sentence fragment explaining this signal. */
  text: string;
  weight: number;
}

export interface JudgeResult {
  verdict: Verdict;
  /** 0–1 confidence in the verdict. */
  confidence: number;
  /** Full Swedish explanation shown to the player. */
  explanation: string;
  reasons: JudgeReason[];
  target: EntryRef;
  answer: EntryRef;
  /** Numeric battle score; > 0 favours the answer. */
  score: number;
}

/** Lightweight reference to the resolved entity (or an inferred pseudo-entry). */
export interface EntryRef {
  id: string | null;
  name: string;
  categories: string[];
  tags: string[];
  resolved: boolean;
  /** How the word was matched: exact/alias/fuzzy/inferred. */
  matchType: 'exact' | 'alias' | 'fuzzy' | 'inferred';
}
