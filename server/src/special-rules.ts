// Layer 1 of the judge: curated high-confidence "special rules" that encode the
// clearest real-world relationships and produce natural, tailored Swedish
// motivations. These are checked before the general tag/scale/stat reasoning.
// Rules match on tags (any-of) and/or exact names — never on a single hardcoded
// word pair, so they generalise across the whole database.

import type { Entry, RuleType, Verdict } from './types.js';

export interface SpecialRuleHit {
  verdict: Verdict;
  confidence: number;
  reason: string;
  ruleType: RuleType;
  concepts: string[];
}

interface SpecialRule {
  id: string;
  attackerTags?: string[];
  attackerNames?: string[];
  targetTags?: string[];
  targetNames?: string[];
  /** Extra predicate for finer control (e.g. stat/level thresholds). */
  when?: (attacker: Entry, target: Entry) => boolean;
  verdict: Verdict;
  confidence: number;
  concepts: string[];
  reason: (attacker: string, target: string) => string;
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hasAny(tags: string[], wanted?: string[]): boolean {
  if (!wanted || wanted.length === 0) return true;
  const set = new Set(tags);
  return wanted.some((t) => set.has(t));
}

function nameMatches(entry: Entry, names?: string[]): boolean {
  if (!names || names.length === 0) return true;
  const candidates = new Set(
    [entry.name, ...(entry.aliases ?? []), entry.englishName ?? '', ...(entry.aliasesEn ?? [])]
      .filter(Boolean)
      .map(norm),
  );
  return names.some((n) => candidates.has(norm(n)));
}

const RULES: SpecialRule[] = [
  {
    id: 'water-extinguishes-fire',
    attackerTags: ['water'],
    targetTags: ['fire'],
    verdict: 'approved',
    confidence: 92,
    concepts: ['vatten', 'eld'],
    reason: (a, t) => `Godkänt. ${a} släcker ${t} genom att kyla ner materialet och strypa syretillförseln.`,
  },
  {
    id: 'fire-melts-ice',
    attackerTags: ['fire'],
    targetTags: ['ice'],
    verdict: 'approved',
    confidence: 88,
    concepts: ['eld', 'is'],
    reason: (a, t) => `Godkänt. ${a} smälter ${t} och förvandlar den till harmlöst vatten.`,
  },
  {
    id: 'emp-disables-electronics',
    attackerTags: ['emp'],
    targetTags: ['robot', 'computer', 'electronic', 'ai', 'technology', 'machine', 'vehicle', 'aircraft'],
    verdict: 'approved',
    confidence: 90,
    concepts: ['elektromagnetisk puls', 'elektronik'],
    reason: (a, t) => `Godkänt. ${a} slår ut all elektronik och gör ${t} helt obrukbar på ett ögonblick.`,
  },
  {
    id: 'hacker-takes-over-systems',
    attackerTags: ['hacker'],
    targetTags: ['computer', 'ai', 'robot', 'internet', 'technology', 'electronic'],
    verdict: 'approved',
    confidence: 86,
    concepts: ['hackare', 'system'],
    reason: (a, t) => `Godkänt. ${a} tar kontroll över ${t} inifrån och stänger av den.`,
  },
  {
    id: 'medicine-cures-disease',
    attackerTags: ['medicine'],
    targetTags: ['disease', 'virus', 'bacteria'],
    verdict: 'approved',
    confidence: 88,
    concepts: ['medicin', 'sjukdom'],
    reason: (a, t) => `Godkänt. ${a} stoppar ${t} innan den hinner sprida sig i kroppen.`,
  },
  {
    id: 'firearm-hunter-beats-animal',
    attackerTags: ['firearm', 'hunter'],
    targetTags: ['animal', 'predator', 'prey'],
    verdict: 'approved',
    confidence: 82,
    concepts: ['skjutvapen', 'djur'],
    reason: (a, t) => `Godkänt. ${a} fäller ${t} på avstånd innan djuret ens hinner attackera.`,
  },
  {
    id: 'poison-kills-living',
    attackerTags: ['poison'],
    targetTags: ['animal', 'human', 'plant', 'organic', 'living'],
    verdict: 'approved',
    confidence: 80,
    concepts: ['gift', 'levande varelse'],
    reason: (a, t) => `Godkänt. ${a} förgiftar ${t} och bryter ner kroppen inifrån.`,
  },
  {
    id: 'blackhole-swallows-space',
    attackerTags: ['blackhole'],
    targetTags: ['planet', 'star', 'asteroid', 'comet', 'space', 'building', 'city'],
    verdict: 'approved',
    confidence: 93,
    concepts: ['svart hål', 'gravitation'],
    reason: (a, t) => `Godkänt. ${a}s ofattbara gravitation slukar ${t} fullständigt.`,
  },
  {
    id: 'reality-rewrites-everything',
    attackerTags: ['reality', 'entity'],
    targetTags: ['cosmic', 'blackhole', 'god', 'planet', 'star', 'space', 'time'],
    verdict: 'approved',
    confidence: 88,
    concepts: ['verklighetsmanipulation'],
    reason: (a, t) => `Godkänt. ${a} skriver helt enkelt om verkligheten och utplånar ${t}.`,
  },
  {
    id: 'acid-dissolves-material',
    attackerTags: ['acid'],
    targetTags: ['metal', 'material', 'machine', 'robot', 'armored'],
    verdict: 'approved',
    confidence: 80,
    concepts: ['syra', 'material'],
    reason: (a, t) => `Godkänt. ${a} fräter sönder ${t} tills ingenting återstår.`,
  },
  {
    id: 'wizard-beats-dragon-monster',
    attackerTags: ['wizard', 'magic'],
    targetTags: ['dragon', 'monster', 'undead', 'demon'],
    verdict: 'approved',
    confidence: 78,
    concepts: ['magi'],
    reason: (a, t) => `Godkänt. ${a} binder ${t} med kraftfull magi som råstyrka inte kan stå emot.`,
  },
  // Guardrails: clearly implausible attempts.
  {
    id: 'food-vs-cosmos',
    attackerTags: ['food'],
    targetTags: ['cosmic', 'reality', 'entity', 'blackhole', 'star', 'planet', 'space'],
    when: (a) => !a.tags.some((t) => ['magic', 'cosmic', 'reality', 'nuclear'].includes(t)),
    verdict: 'rejected',
    confidence: 90,
    concepts: [],
    reason: (a, t) => `Nekat. ${a} är bara mat och har ingen rimlig chans mot ${t}.`,
  },
  {
    id: 'tiny-blade-vs-heavy-armor',
    attackerTags: ['blade'],
    targetTags: ['tank', 'armored', 'ship'],
    when: (a, t) => a.techLevel < 40 && t.toughness >= 70 && !a.tags.some((x) => ['explosive', 'magic', 'nuclear'].includes(x)),
    verdict: 'rejected',
    confidence: 78,
    concepts: [],
    reason: (a, t) => `Nekat. ${a} biter inte på ${t}s tunga pansar.`,
  },
];

/** Return the first matching special rule, or null. */
export function matchSpecialRule(attacker: Entry, target: Entry): SpecialRuleHit | null {
  for (const rule of RULES) {
    const attackerOk = hasAny(attacker.tags, rule.attackerTags) && nameMatches(attacker, rule.attackerNames);
    const targetOk = hasAny(target.tags, rule.targetTags) && nameMatches(target, rule.targetNames);
    if (!attackerOk || !targetOk) continue;
    if (rule.when && !rule.when(attacker, target)) continue;
    return {
      verdict: rule.verdict,
      confidence: rule.confidence,
      reason: rule.reason(attacker.name, target.name),
      ruleType: 'special',
      concepts: rule.concepts,
    };
  }
  return null;
}

export const SPECIAL_RULE_COUNT = RULES.length;
