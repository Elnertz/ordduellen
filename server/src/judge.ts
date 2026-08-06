// The AI judge. Given a target entry and an answer entry it reasons — purely
// from tags, the TAG_BEATS relationship graph, scale and stats — about whether
// the answer could realistically defeat the target, and explains why in Swedish.
// No specific word pairs are hardcoded; everything is derived dynamically.

import type { Entry, JudgeReason, JudgeResult, EntryRef } from './types.js';
import { TAG_BEATS, tagLabel } from './taxonomy.js';

const APPROVE_THRESHOLD = 0.5;

export interface Combatant extends Entry {}

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

/** Distinct attacker tags on `attacker` whose TAG_BEATS list hits a tag on `victim`. */
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
  return e.power * 0.5 + e.range * 0.2 + e.speed * 0.15 + e.intelligence * 0.15;
}

function listTags(tags: string[]): string {
  const labels = [...new Set(tags)].map(tagLabel);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} och ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')} och ${labels[labels.length - 1]}`;
}

export function judge(
  target: Entry,
  answer: Entry,
  answerMatch: EntryRef['matchType'],
  answerResolved: boolean,
): JudgeResult {
  const reasons: JudgeReason[] = [];
  const targetRef = toRef(target, 'exact', true);
  const answerRef = toRef(answer, answerMatch, answerResolved);

  // Guard: nothing beats itself.
  if (normalizeId(answer.name) === normalizeId(target.name)) {
    return {
      verdict: 'rejected',
      confidence: 0.95,
      explanation: `Nekat. ${answer.name} kan inte besegra sig självt.`,
      reasons: [{ kind: 'reverse', text: 'Ett ord kan inte besegra sig självt.', weight: -5 }],
      target: targetRef,
      answer: answerRef,
      score: -5,
    };
  }

  let score = 0;

  // 1. Type advantage (answer's tags beat target's tags). Weighted by how many
  // of the target's distinct traits the answer neutralises.
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

  // 2. Reverse advantage (target's tags beat answer's tags).
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

  // 3. Scale of existence.
  const scaleDiff = answer.scale - target.scale;
  if (Math.abs(scaleDiff) >= 12) {
    const w = Math.max(-5, Math.min(5, scaleDiff * 0.08));
    score += w;
    if (scaleDiff > 0) {
      reasons.push({
        kind: 'scale',
        weight: w,
        text: `${answer.name} verkar på en helt annan storleksordning än ${target.name}`,
      });
    } else {
      reasons.push({
        kind: 'scale',
        weight: w,
        text: `${target.name} är på en mycket större skala än ${answer.name}`,
      });
    }
  }

  // 4. Raw combat stats.
  const ratingDiff = combatRating(answer) - combatRating(target);
  if (Math.abs(ratingDiff) >= 10) {
    const w = Math.max(-3, Math.min(3, ratingDiff * 0.05));
    score += w;
    reasons.push({
      kind: 'stat',
      weight: w,
      text:
        ratingDiff > 0
          ? `${answer.name} har överlägsen kraft, räckvidd och snabbhet`
          : `${target.name} överträffar ${answer.name} i ren stridsförmåga`,
    });
  }

  // 5. Small nudge so a plausible matchup with an edge can pass. When the answer
  // has at least as many counter-paths as the target, give it the benefit of the
  // doubt (e.g. two peer animals — either could realistically win).
  if (forwardVic.length > 0 && forwardVic.length >= reverseVic.length) {
    score += 0.7;
  }

  const verdict = score >= APPROVE_THRESHOLD ? 'approved' : 'rejected';
  const confidence = Math.max(0.35, Math.min(0.98, Math.abs(score) / 8 + 0.35));

  return {
    verdict,
    confidence,
    explanation: buildExplanation(verdict, target, answer, reasons, score),
    reasons: reasons.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
    target: targetRef,
    answer: answerRef,
    score: Math.round(score * 100) / 100,
  };
}

function buildExplanation(
  verdict: 'approved' | 'rejected',
  target: Entry,
  answer: Entry,
  reasons: JudgeReason[],
  score: number,
): string {
  if (verdict === 'approved') {
    const positives = reasons.filter((r) => r.weight > 0).sort((a, b) => b.weight - a.weight);
    if (positives.length === 0) {
      return `Godkänt! ${answer.name} lyckas övermanna ${target.name} med marginal.`;
    }
    const main = positives.slice(0, 2).map((r) => r.text.toLowerCase());
    return `Godkänt! ${capitalize(main[0])}${main[1] ? `, och dessutom ${main[1]}` : ''}. ${answer.name} besegrar ${target.name}.`;
  }

  const negatives = reasons.filter((r) => r.weight < 0).sort((a, b) => a.weight - b.weight);
  if (negatives.length > 0) {
    const main = negatives.slice(0, 2).map((r) => r.text.toLowerCase());
    return `Nekat. ${capitalize(main[0])}${main[1] ? `, och ${main[1]}` : ''}. ${answer.name} besegrar inte ${target.name}.`;
  }
  // No clear relationship at all.
  const _ = score;
  return `Nekat. Det finns inget trovärdigt sätt för ${answer.name} att besegra ${target.name}.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function normalizeId(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}
