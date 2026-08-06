import { describe, expect, it } from 'vitest';
import { ReportStore } from './reports.js';

describe('ReportStore', () => {
  it('creates, votes on and resolves judgment reports', () => {
    const store = new ReportStore();
    const before = store.stats().total;

    const report = store.create({
      target: 'Kärnvapen',
      answer: 'Banan',
      verdict: 'rejected',
      confidence: 90,
      note: 'Konstigt domslut',
    });
    expect(report.id).toBeTruthy();
    expect(report.status).toBe('open');
    expect(store.stats().total).toBe(before + 1);

    store.vote(report.id, true);
    store.vote(report.id, false);
    const voted = store.list('open').find((r) => r.id === report.id)!;
    expect(voted.votesAgree).toBe(1);
    expect(voted.votesDisagree).toBe(1);

    const resolved = store.resolve(report.id, 'Relation korrigerad');
    expect(resolved?.status).toBe('resolved');
    expect(store.list('resolved').some((r) => r.id === report.id)).toBe(true);
  });

  it('returns null for unknown report ids', () => {
    const store = new ReportStore();
    expect(store.vote('nope', true)).toBeNull();
    expect(store.resolve('nope', 'x')).toBeNull();
  });
});
