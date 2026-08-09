import { describe, expect, it } from 'vitest';
import { generateEntries, generateExtra, normalizeName } from './generator.js';
import { computeDefeatsTags } from './taxonomy.js';

describe('generateEntries', () => {
  const entries = generateEntries();

  it('produces a massive database of 10 000+ interconnected entries', () => {
    expect(entries.length).toBeGreaterThanOrEqual(10000);
  });

  it('gives every entry a unique id and required fields', () => {
    const ids = new Set<string>();
    for (const e of entries) {
      expect(e.id).toBeTruthy();
      expect(ids.has(e.id)).toBe(false);
      ids.add(e.id);
      expect(e.name.length).toBeGreaterThan(0);
      expect(e.categories.length).toBeGreaterThan(0);
      expect(e.description.length).toBeGreaterThan(0);
      for (const stat of [e.power, e.speed, e.range, e.intelligence, e.scale]) {
        expect(stat).toBeGreaterThanOrEqual(1);
        expect(stat).toBeLessThanOrEqual(100);
      }
    }
  });

  it('derives defeatsTags/vulnerableToTags consistently from tags', () => {
    const sample = entries.find((e) => e.tags.includes('fire'))!;
    expect(sample.defeatsTags).toEqual(expect.arrayContaining(computeDefeatsTags(sample.tags)));
  });

  it('includes curated flagship entries', () => {
    const names = new Set(entries.map((e) => normalizeName(e.name)));
    for (const flagship of ['lejon', 'missil', 'asteroid', 'svart hål', 'virus', 'kärnvapen']) {
      expect(names.has(flagship)).toBe(true);
    }
  });

  it('generates additional novel entries on demand', () => {
    const taken = new Set(entries.map((e) => normalizeName(e.name)));
    const extra = generateExtra(50, taken);
    expect(extra.length).toBe(50);
    for (const e of extra) expect(taken.has(normalizeName(e.name))).toBe(false);
  });
});
