// The AI judge — the heart of Ordduellen. It decides whether an answer word can
// realistically defeat the current target, reasoning in layers:
//   1. self guard          2. special rules (curated, high-confidence)
//   3. type advantage (tags/weaknesses)   4. category/scale hierarchy
//   5. size   6. combat stats   7. logical probability / borderline handling
// It never exposes internal tag ids to the player — only natural Swedish.

import type { Entry, JudgeReason, JudgeResult, EntryRef, RuleType } from './types.js';
import { TAG_BEATS, tagLabel } from './taxonomy.js';
import { matchSpecialRule } from './special-rules.js';

const APPROVE_THRESHOLD = 0.5;
const BORDERLINE_BAND = 1.3;

function toRef(entry: Entry, matchType: EntryRef['matchType'], resolved: boolean): EntryRef {
  return {
    id: resolved ? entry.id : null,
    name: entry.name,
    categories: entry.categories,
    tags: entry.tags,
    resolved,
    matchType,
  };
}

function typeMatches(attacker: Entry, victim: Entry): Array<{ atk: string; vic: string }> {
  const matches: Array<{ atk: string; vic: string }> = [];
  const victimTags = new Set(victim.tags);
  for (const a of attacker.tags) {
    const beats = TAG_BEATS[a];
    if (!beats) continue;
    for (const t of beats) {
      if (victimTags.has(t)) matches.push({ atk: a, vic: t });
    }
  }
  return matches;
}

function combatRating(e: Entry): number {
  return e.power * 0.45 + e.toughness * 0.15 + e.range * 0.2 + e.speed * 0.1 + e.intelligence * 0.1;
}

function listTags(tags: string[]): string {
  const labels = [...new Set(tags)].map(tagLabel);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} och ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')} och ${labels[labels.length - 1]}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function normalizeId(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function judge(
  target: Entry,
  answer: Entry,
  answerMatch: EntryRef['matchType'],
  answerResolved: boolean,
): JudgeResult {
  const targetRef = toRef(target, 'exact', true);
  const answerRef = toRef(answer, answerMatch, answerResolved);
  const warnings: string[] = [];
  if (!answerResolved) {
    warnings.push('Ordet finns inte i databasen och bedömdes utifrån gissade egenskaper.');
  }

  const finish = (
    verdict: 'approved' | 'rejected',
    confidence: number,
    reason: string,
    ruleType: RuleType,
    reasons: JudgeReason[],
    concepts: string[],
    score: number,
  ): JudgeResult => ({
    approved: verdict === 'approved',
    verdict,
    confidence: Math.round(Math.max(1, Math.min(99, confidence))),
    reason,
    explanation: reason,
    ruleType,
    attacker: answer.name,
    matchingConcepts: [...new Set(concepts)],
    warnings,
    reasons: reasons.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
    target: targetRef,
    answer: answerRef,
    score: Math.round(score * 100) / 100,
  });

  // Layer 1: self guard.
  if (normalizeId(answer.name) === normalizeId(target.name)) {
    return finish(
      'rejected',
      96,
      `Nekat. ${answer.name} kan inte besegra sig självt.`,
      'self',
      [{ kind: 'reverse', text: 'Ett ord kan inte besegra sig självt.', weight: -5 }],
      [],
      -5,
    );
  }

  // Layer 2: curated special rules (highest confidence).
  const special = matchSpecialRule(answer, target);
  if (special) {
    const reasonWithWarn = appendWarnings(special.reason, warnings);
    return finish(
      special.verdict,
      special.confidence,
      reasonWithWarn,
      special.ruleType,
      [{ kind: 'special', text: special.reason, weight: special.verdict === 'approved' ? 6 : -6 }],
      special.concepts,
      special.verdict === 'approved' ? 6 : -6,
    );
  }

  // Layers 3–6: general weighted reasoning.
  const reasons: JudgeReason[] = [];
  let score = 0;

  const forward = typeMatches(answer, target);
  const forwardAtk = [...new Set(forward.map((m) => m.atk))];
  const forwardVic = [...new Set(forward.map((m) => m.vic))];
  if (forwardVic.length > 0) {
    const w = Math.min(forwardVic.length * 2.4, 6.5);
    score += w;
    reasons.push({
      kind: 'counter',
      weight: w,
      text: `${answer.name} utnyttjar sin ${listTags(forwardAtk)} mot ${target.name}s ${listTags(forwardVic)}`,
    });
  }

  const reverse = typeMatches(target, answer);
  const reverseAtk = [...new Set(reverse.map((m) => m.atk))];
  const reverseVic = [...new Set(reverse.map((m) => m.vic))];
  if (reverseVic.length > 0) {
    const w = Math.min(reverseVic.length * 2.4, 6.5);
    score -= w;
    reasons.push({
      kind: 'reverse',
      weight: -w,
      text: `${target.name} är starkare tack vare sin ${listTags(reverseAtk)}`,
    });
  }

  // Scale of existence (cosmic hierarchy).
  const scaleDiff = answer.scale - target.scale;
  if (Math.abs(scaleDiff) >= 12) {
    const w = Math.max(-5, Math.min(5, scaleDiff * 0.08));
    score += w;
    reasons.push({
      kind: 'scale',
      weight: w,
      text:
        scaleDiff > 0
          ? `${answer.name} verkar på en helt annan storleksordning än ${target.name}`
          : `${target.name} är på en mycket större skala än ${answer.name}`,
    });
  }

  // Physical size: only reinforces an existing physical advantage.
  const sizeDiff = answer.size - target.size;
  if (forwardVic.length > 0 && sizeDiff >= 25) {
    score += 0.6;
    reasons.push({
      kind: 'size',
      weight: 0.6,
      text: `${answer.name} är dessutom betydligt större och pressar sitt övertag`,
    });
  }

  // Raw combat stats (power/toughness/range/speed/intelligence).
  const ratingDiff = combatRating(answer) - combatRating(target);
  if (Math.abs(ratingDiff) >= 10) {
    const w = Math.max(-3, Math.min(3, ratingDiff * 0.05));
    score += w;
    reasons.push({
      kind: 'stat',
      weight: w,
      text:
        ratingDiff > 0
          ? `${answer.name} har överlägsen kraft, tålighet och räckvidd`
          : `${target.name} överträffar ${answer.name} i ren stridsförmåga`,
    });
  }

  // Benefit of the doubt for peer matchups with at least an even counter.
  if (forwardVic.length > 0 && forwardVic.length >= reverseVic.length) {
    score += 0.7;
  }

  const verdict = score >= APPROVE_THRESHOLD ? 'approved' : 'rejected';
  const borderline = Math.abs(score) <= BORDERLINE_BAND;
  const concepts = (verdict === 'approved' ? forwardVic : reverseVic).map(tagLabel);
  const ruleType: RuleType = borderline
    ? 'borderline'
    : dominantRuleType(reasons, verdict);

  let confidence = Math.min(95, 45 + Math.abs(score) * 6);
  if (borderline) confidence = Math.max(52, Math.min(60, confidence));
  if (!answerResolved) confidence = Math.min(confidence, 66);

  const reason = buildReason(verdict, borderline, target, answer, reasons, warnings);
  return finish(verdict, confidence, reason, ruleType, reasons, concepts, score);
}

function dominantRuleType(reasons: JudgeReason[], verdict: 'approved' | 'rejected'): RuleType {
  const relevant = reasons.filter((r) => (verdict === 'approved' ? r.weight > 0 : r.weight < 0));
  const top = relevant.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))[0];
  if (!top) return 'fallback';
  switch (top.kind) {
    case 'counter':
      return 'type-advantage';
    case 'reverse':
      return 'reverse';
    case 'scale':
      return 'scale';
    case 'size':
      return 'size';
    case 'stat':
      return 'stat';
    default:
      return 'fallback';
  }
}

function buildReason(
  verdict: 'approved' | 'rejected',
  borderline: boolean,
  target: Entry,
  answer: Entry,
  reasons: JudgeReason[],
  warnings: string[],
): string {
  let base: string;
  if (verdict === 'approved') {
    const positives = reasons.filter((r) => r.weight > 0).sort((a, b) => b.weight - a.weight);
    const main = positives.slice(0, 2).map((r) => r.text.toLowerCase());
    if (borderline) {
      base = main.length
        ? `Det här är ett gränsfall. Godkänt med låg säkerhet eftersom ${main[0]}.`
        : `Det här är ett gränsfall, men ${answer.name} godkänns med låg säkerhet mot ${target.name}.`;
    } else if (main.length === 0) {
      base = `Godkänt. ${answer.name} lyckas övermanna ${target.name} med marginal.`;
    } else {
      base = `Godkänt. ${capitalize(main[0])}${main[1] ? `, och dessutom ${main[1]}` : ''}. ${answer.name} besegrar ${target.name}.`;
    }
  } else {
    const negatives = reasons.filter((r) => r.weight < 0).sort((a, b) => a.weight - b.weight);
    const main = negatives.slice(0, 2).map((r) => r.text.toLowerCase());
    if (main.length > 0) {
      base = `Nekat. ${capitalize(main[0])}${main[1] ? `, och ${main[1]}` : ''}. ${answer.name} besegrar inte ${target.name}.`;
    } else {
      base = `Nekat. Det finns inget trovärdigt sätt för ${answer.name} att besegra ${target.name}.`;
    }
  }
  return appendWarnings(base, warnings);
}

function appendWarnings(base: string, warnings: string[]): string {
  if (warnings.length === 0) return base;
  return `${base} (${warnings.join(' ')})`;
}
