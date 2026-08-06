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

/** Whether an entry is hand-authored/verified or programmatically generated. */
export type Quality = 'verified' | 'generated';

export interface Entry {
  id: string;
  name: string;
  /** English name, when relevant. */
  englishName?: string;
  aliases: string[];
  /** English aliases, when relevant. */
  aliasesEn?: string[];
  categories: string[];
  power: number;
  /** Durability / how hard it is to destroy, 0–100. */
  toughness: number;
  speed: number;
  range: number;
  intelligence: number;
  /** Physical size, 0–100 (ant ~3, human ~30, whale ~70, planet ~97). */
  size: number;
  /** Technology level, 0–100 (natural 0, medieval 20, modern 70, sci-fi 100). */
  techLevel: number;
  /** Cosmic power level, 0–100 (mundane <30, planetary 60, stellar 80, reality 100). */
  cosmicLevel: number;
  tags: string[];
  defeatsTags: string[];
  vulnerableToTags: string[];
  /** Human-readable Swedish ability phrases (e.g. "kan flyga", "spyr eld"). */
  abilities: string[];
  /** Human-readable Swedish weakness phrases (e.g. "sårbar mot vatten"). */
  weaknesses: string[];
  description: string;
  /**
   * Abstract "scale of existence" 0–100 used for the cosmic hierarchy
   * (an ant is ~2, a nuke ~70, a black hole ~97, a reality-warper ~99).
   * Kept as the canonical tier the judge reasons over; mirrors cosmicLevel.
   */
  scale: number;
  /** Data package this entry came from (e.g. "core", "extra"). */
  source: string;
  /** Quality status: verified (curated) or generated. */
  quality: Quality;
  /** Back-compat: true for curated entries. Superseded by `quality`. */
  curated?: boolean;
}

export type Verdict = 'approved' | 'rejected';

export type RuleType =
  | 'self'
  | 'special'
  | 'type-advantage'
  | 'scale'
  | 'size'
  | 'stat'
  | 'reverse'
  | 'borderline'
  | 'fallback';

export interface JudgeReason {
  kind:
    | 'vulnerability'
    | 'counter'
    | 'tag-advantage'
    | 'scale'
    | 'size'
    | 'stat'
    | 'reverse'
    | 'special'
    | 'fallback';
  /** Human-readable Swedish sentence fragment explaining this signal. */
  text: string;
  weight: number;
}

export interface JudgeResult {
  approved: boolean;
  verdict: Verdict;
  /** Confidence in the verdict, 0–100. */
  confidence: number;
  /** Full natural-Swedish motivation shown to the player. */
  reason: string;
  /** Back-compat alias of `reason`. */
  explanation: string;
  /** Which reasoning layer decided the verdict. */
  ruleType: RuleType;
  /** Name of the attacking word (the answer). */
  attacker: string;
  /** Player-facing Swedish labels of the concepts that mattered (never tag ids). */
  matchingConcepts: string[];
  /** Non-fatal caveats, e.g. borderline or inferred word. */
  warnings: string[];
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
