import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { Entry, EntryRef } from './types.js';
import { generateEntries, normalizeName } from './generator.js';
import { computeDefeatsTags, computeVulnerableTags } from './taxonomy.js';
import { inferFromWord } from './infer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
const CUSTOM_PATH = resolve(DATA_DIR, 'custom-entities.json');

interface CustomOverrides {
  version: number;
  created: Entry[];
  edited: Record<string, Partial<Entry>>;
  deleted: string[];
}

const EMPTY_OVERRIDES: CustomOverrides = { version: 1, created: [], edited: {}, deleted: [] };

export interface ResolveOutcome {
  entry: Entry;
  ref: EntryRef;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

export class Database {
  private entries: Entry[] = [];
  private generated: Entry[] = [];
  private overrides: CustomOverrides = structuredClone(EMPTY_OVERRIDES);
  private byId = new Map<string, Entry>();
  private byName = new Map<string, Entry>();
  private tagIndex = new Map<string, Entry[]>();
  private firstCharIndex = new Map<string, Entry[]>();

  constructor(seedGenerated?: Entry[]) {
    this.generated = seedGenerated ?? generateEntries();
    this.overrides = loadOverrides();
    this.rebuild();
  }

  private rebuild(): void {
    const deleted = new Set(this.overrides.deleted);
    const effective: Entry[] = [];
    for (const base of this.generated) {
      if (deleted.has(base.id)) continue;
      const edit = this.overrides.edited[base.id];
      effective.push(edit ? recompute({ ...base, ...edit, id: base.id }) : base);
    }
    for (const created of this.overrides.created) {
      if (deleted.has(created.id)) continue;
      effective.push(recompute(created));
    }

    this.entries = effective;
    this.byId = new Map();
    this.byName = new Map();
    this.tagIndex = new Map();
    this.firstCharIndex = new Map();

    for (const e of effective) {
      this.byId.set(e.id, e);
      this.byName.set(normalizeName(e.name), e);
      for (const alias of e.aliases) {
        const key = normalizeName(alias);
        if (!this.byName.has(key)) this.byName.set(key, e);
      }
      for (const tag of e.tags) {
        (this.tagIndex.get(tag) ?? this.tagIndex.set(tag, []).get(tag)!).push(e);
      }
      const fc = normalizeName(e.name).charAt(0);
      (this.firstCharIndex.get(fc) ?? this.firstCharIndex.set(fc, []).get(fc)!).push(e);
    }
  }

  get size(): number {
    return this.entries.length;
  }

  get curatedCount(): number {
    return this.entries.filter((e) => e.curated).length;
  }

  all(): Entry[] {
    return this.entries;
  }

  getById(id: string): Entry | undefined {
    return this.byId.get(id);
  }

  entriesWithTag(tag: string): Entry[] {
    return this.tagIndex.get(tag) ?? [];
  }

  categoryCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const e of this.entries) {
      for (const c of e.categories) counts[c] = (counts[c] ?? 0) + 1;
    }
    return counts;
  }

  randomEntry(filter?: (e: Entry) => boolean): Entry {
    const pool = filter ? this.entries.filter(filter) : this.entries;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Resolve a free-text word to an entry (or an inferred pseudo-entry).
  resolve(query: string): ResolveOutcome {
    const norm = normalizeName(query);
    const exact = this.byName.get(norm);
    if (exact) {
      const match: EntryRef['matchType'] =
        normalizeName(exact.name) === norm ? 'exact' : 'alias';
      return { entry: exact, ref: refOf(exact, match, true) };
    }

    const fuzzy = this.fuzzyMatch(norm);
    if (fuzzy) {
      return { entry: fuzzy, ref: refOf(fuzzy, 'fuzzy', true) };
    }

    // Fall back to heuristic inference so any word can be reasoned about.
    const inf = inferFromWord(query);
    const pseudo: Entry = recompute({
      id: `inferred:${norm}`,
      name: query.trim(),
      aliases: [],
      categories: ['concepts'],
      power: inf.power,
      speed: inf.speed,
      range: inf.range,
      intelligence: inf.intelligence,
      tags: inf.tags,
      defeatsTags: [],
      vulnerableToTags: [],
      description: `${query.trim()} är okänt för domaren och bedöms utifrån gissade egenskaper.`,
      scale: inf.scale,
      curated: false,
    });
    return { entry: pseudo, ref: refOf(pseudo, 'inferred', false) };
  }

  private fuzzyMatch(norm: string): Entry | undefined {
    if (norm.length < 3) return undefined;
    const fc = norm.charAt(0);
    const candidates = [
      ...(this.firstCharIndex.get(fc) ?? []),
      // Also consider entries whose name contains the query as a substring.
    ];
    let best: Entry | undefined;
    let bestDist = Infinity;
    const maxDist = norm.length <= 5 ? 1 : 2;
    for (const e of candidates) {
      const name = normalizeName(e.name);
      if (Math.abs(name.length - norm.length) > maxDist) continue;
      const d = levenshtein(norm, name, maxDist);
      if (d < bestDist) {
        bestDist = d;
        best = e;
      }
    }
    if (best && bestDist <= maxDist) return best;

    // Substring containment as a looser fallback.
    for (const e of this.entries) {
      const name = normalizeName(e.name);
      if (name.length > norm.length && (name.startsWith(norm) || name.includes(norm))) {
        if (norm.length >= 4) return e;
      }
    }
    return undefined;
  }

  search(filters: SearchFilters): { total: number; items: Entry[] } {
    const q = filters.query ? normalizeName(filters.query) : '';
    let items = this.entries;
    if (filters.category) items = items.filter((e) => e.categories.includes(filters.category!));
    if (filters.tag) items = items.filter((e) => e.tags.includes(filters.tag!));
    if (q) {
      items = items.filter(
        (e) =>
          normalizeName(e.name).includes(q) ||
          e.aliases.some((a) => normalizeName(a).includes(q)),
      );
    }
    const total = items.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 50;
    return { total, items: items.slice(offset, offset + limit) };
  }

  // --- Admin mutations (persisted to the custom overrides file) ------------

  createEntry(input: Partial<Entry> & { name: string }): Entry {
    const id = input.id && !this.byId.has(input.id) ? input.id : uniqueId(input.name, this.byId);
    const entry = recompute({
      id,
      name: input.name,
      aliases: input.aliases ?? [],
      categories: input.categories ?? ['concepts'],
      power: input.power ?? 50,
      speed: input.speed ?? 50,
      range: input.range ?? 50,
      intelligence: input.intelligence ?? 50,
      tags: input.tags ?? [],
      defeatsTags: [],
      vulnerableToTags: [],
      description: input.description ?? '',
      scale: input.scale ?? 50,
      curated: true,
    });
    this.overrides.created.push(entry);
    this.overrides.deleted = this.overrides.deleted.filter((d) => d !== id);
    this.persist();
    this.rebuild();
    return this.byId.get(id)!;
  }

  updateEntry(id: string, patch: Partial<Entry>): Entry | null {
    if (!this.byId.has(id)) return null;
    const createdIdx = this.overrides.created.findIndex((c) => c.id === id);
    if (createdIdx >= 0) {
      this.overrides.created[createdIdx] = recompute({
        ...this.overrides.created[createdIdx],
        ...patch,
        id,
      });
    } else {
      this.overrides.edited[id] = { ...this.overrides.edited[id], ...patch };
    }
    this.persist();
    this.rebuild();
    return this.byId.get(id) ?? null;
  }

  deleteEntry(id: string): boolean {
    if (!this.byId.has(id)) return false;
    const createdIdx = this.overrides.created.findIndex((c) => c.id === id);
    if (createdIdx >= 0) {
      this.overrides.created.splice(createdIdx, 1);
    } else {
      if (!this.overrides.deleted.includes(id)) this.overrides.deleted.push(id);
      delete this.overrides.edited[id];
    }
    this.persist();
    this.rebuild();
    return true;
  }

  // Import a list of entries as custom created entries (upserting by id).
  importEntries(list: Entry[]): number {
    let count = 0;
    for (const raw of list) {
      if (!raw?.name) continue;
      const id = raw.id && typeof raw.id === 'string' ? raw.id : uniqueId(raw.name, this.byId);
      const existing = this.overrides.created.findIndex((c) => c.id === id);
      const entry = recompute({ ...blankEntry(), ...raw, id, curated: true });
      if (existing >= 0) this.overrides.created[existing] = entry;
      else this.overrides.created.push(entry);
      this.overrides.deleted = this.overrides.deleted.filter((d) => d !== id);
      count += 1;
    }
    this.persist();
    this.rebuild();
    return count;
  }

  // Validate the whole database and report structural problems.
  validate(): { ok: boolean; issues: string[]; checked: number } {
    const issues: string[] = [];
    const seen = new Set<string>();
    for (const e of this.entries) {
      if (seen.has(e.id)) issues.push(`Duplicerat id: ${e.id}`);
      seen.add(e.id);
      if (!e.name?.trim()) issues.push(`Post ${e.id} saknar namn`);
      if (!e.categories?.length) issues.push(`${e.name} saknar kategori`);
      for (const s of [e.power, e.speed, e.range, e.intelligence, e.scale]) {
        if (typeof s !== 'number' || s < 0 || s > 100) {
          issues.push(`${e.name} har ogiltigt statvärde`);
          break;
        }
      }
    }
    return { ok: issues.length === 0, issues: issues.slice(0, 100), checked: this.entries.length };
  }

  private persist(): void {
    try {
      if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(CUSTOM_PATH, JSON.stringify(this.overrides, null, 2), 'utf8');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ordduellen] Failed to persist custom entities:', err);
    }
  }
}

function blankEntry(): Entry {
  return {
    id: '',
    name: '',
    aliases: [],
    categories: ['concepts'],
    power: 50,
    speed: 50,
    range: 50,
    intelligence: 50,
    tags: [],
    defeatsTags: [],
    vulnerableToTags: [],
    description: '',
    scale: 50,
    curated: true,
  };
}

// Recompute derived tag relationships so admin edits stay consistent.
function recompute(entry: Entry): Entry {
  const tags = [...new Set(entry.tags)];
  return {
    ...entry,
    tags,
    defeatsTags: computeDefeatsTags(tags),
    vulnerableToTags: computeVulnerableTags(tags),
  };
}

function refOf(entry: Entry, matchType: EntryRef['matchType'], resolved: boolean): EntryRef {
  return {
    id: resolved ? entry.id : null,
    name: entry.name,
    categories: entry.categories,
    tags: entry.tags,
    resolved,
    matchType,
  };
}

function uniqueId(name: string, taken: Map<string, Entry>): string {
  const base =
    name
      .toLowerCase()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'entry';
  let id = base;
  let n = 2;
  while (taken.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

function loadOverrides(): CustomOverrides {
  try {
    if (!existsSync(CUSTOM_PATH)) return structuredClone(EMPTY_OVERRIDES);
    const parsed = JSON.parse(readFileSync(CUSTOM_PATH, 'utf8')) as CustomOverrides;
    return {
      version: parsed.version ?? 1,
      created: Array.isArray(parsed.created) ? parsed.created : [],
      edited: parsed.edited ?? {},
      deleted: Array.isArray(parsed.deleted) ? parsed.deleted : [],
    };
  } catch {
    return structuredClone(EMPTY_OVERRIDES);
  }
}

// Bounded Levenshtein distance (early-exits above `max`).
function levenshtein(a: string, b: string, max: number): number {
  const al = a.length;
  const bl = b.length;
  if (Math.abs(al - bl) > max) return max + 1;
  let prev = new Array(bl + 1);
  let curr = new Array(bl + 1);
  for (let j = 0; j <= bl; j += 1) prev[j] = j;
  for (let i = 1; i <= al; i += 1) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= bl; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > max) return max + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[bl];
}

let cached: Database | null = null;

export function getDatabase(): Database {
  if (!cached) cached = new Database();
  return cached;
}
