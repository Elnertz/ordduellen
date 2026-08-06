import { describe, expect, it } from 'vitest';
import { Database } from './database.js';
import { generateEntries } from './generator.js';

// Use an isolated database instance seeded with generated entries. These tests
// only exercise in-memory resolution/search (no persistence side effects).
const db = new Database(generateEntries());

describe('Database resolution', () => {
  it('resolves an exact name', () => {
    const r = db.resolve('Lejon');
    expect(r.ref.matchType).toBe('exact');
    expect(r.entry.name).toBe('Lejon');
  });

  it('resolves via alias', () => {
    const r = db.resolve('Tank');
    expect(r.entry.name).toBe('Stridsvagn');
    expect(r.ref.matchType).toBe('alias');
  });

  it('resolves a close misspelling via fuzzy matching', () => {
    const r = db.resolve('Lejjon');
    expect(r.entry.name).toBe('Lejon');
    expect(r.ref.matchType).toBe('fuzzy');
  });

  it('infers tags for a completely unknown word', () => {
    const r = db.resolve('Glorbnix');
    expect(r.ref.matchType).toBe('inferred');
    expect(r.ref.resolved).toBe(false);
  });
});

describe('Database search', () => {
  it('filters by category', () => {
    const res = db.search({ category: 'animals', limit: 5 });
    expect(res.items.length).toBeGreaterThan(0);
    for (const e of res.items) expect(e.categories).toContain('animals');
  });

  it('filters by tag', () => {
    const res = db.search({ tag: 'fire', limit: 5 });
    for (const e of res.items) expect(e.tags).toContain('fire');
  });

  it('searches by name substring', () => {
    const res = db.search({ query: 'lejon' });
    expect(res.items.some((e) => e.name.toLowerCase().includes('lejon'))).toBe(true);
  });
});

describe('Database validation', () => {
  it('reports a healthy generated database', () => {
    const report = db.validate();
    expect(report.ok).toBe(true);
    expect(report.checked).toBeGreaterThan(10000);
  });
});
