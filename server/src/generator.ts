// Deterministic database generator. Turns the curated seeds into a large,
// logically interconnected database by (1) enriching each seed with its
// category profile and (2) multiplying suitable seeds with themed variants.

import type { Entry } from './types.js';
import {
  abilitiesFromTags,
  computeDefeatsTags,
  computeVulnerableTags,
  weaknessesFromTags,
} from './taxonomy.js';
import { SEED_CATEGORIES, type CategoryProfile, type Seed, type VariantGroup } from './data/seeds.js';
import { EXTRA_CATEGORIES } from './data/seeds-extra.js';

const ALL_SEED_CATEGORIES = [...SEED_CATEGORIES, ...EXTRA_CATEGORIES];

// Default physical size (0–100) and technology level (0–100) per category, used
// when a seed does not specify them explicitly.
const CATEGORY_SIZE: Record<string, number> = {
  animals: 30, weapons: 22, military: 60, technology: 28, vehicles: 55, nature: 70,
  weather: 65, space: 92, elements: 8, science: 30, medicine: 12, diseases: 4,
  plants: 30, buildings: 70, places: 90, history: 30, mythology: 55, fantasy: 50,
  magic: 25, heroes: 32, villains: 40, pokemon: 35, food: 8, professions: 30,
  sports: 30, music: 15, internet: 5, materials: 25, energy: 30, concepts: 80, cosmic: 95,
};

const CATEGORY_TECH: Record<string, number> = {
  animals: 0, weapons: 45, military: 75, technology: 92, vehicles: 60, nature: 0,
  weather: 0, space: 5, elements: 5, science: 60, medicine: 65, diseases: 0,
  plants: 0, buildings: 40, places: 40, history: 20, mythology: 5, fantasy: 15,
  magic: 10, heroes: 55, villains: 55, pokemon: 20, food: 5, professions: 40,
  sports: 20, music: 25, internet: 85, materials: 30, energy: 55, concepts: 20, cosmic: 60,
};

interface VariantMod {
  id: string;
  prefix: string;
  desc: string;
  addTags: string[];
  power?: number;
  speed?: number;
  range?: number;
  intelligence?: number;
  scale?: number;
}

// Variant modifiers grouped by the abstract "variant group" a category opts into.
const VARIANTS: Record<VariantGroup, VariantMod[]> = {
  universal: [
    { id: 'jatte', prefix: 'Jätte', desc: 'en gigantisk variant', addTags: ['giant'], power: 16, range: 8, speed: -8, scale: 12 },
    { id: 'mega', prefix: 'Mega', desc: 'en enormt förstärkt variant', addTags: ['giant'], power: 22, scale: 14 },
    { id: 'urtid', prefix: 'Urtids', desc: 'en urtida variant från en svunnen tid', addTags: [], power: 12, scale: 6 },
    { id: 'kung', prefix: 'Kungs', desc: 'en kunglig, legendarisk variant', addTags: ['legendary'], power: 14, intelligence: 8, scale: 8 },
    { id: 'dvarg', prefix: 'Dvärg', desc: 'en pytteliten miniatyrvariant', addTags: ['tiny'], power: -18, speed: 8, scale: -10 },
    { id: 'kosmisk', prefix: 'Kosmos', desc: 'en kosmisk variant laddad med rymdens kraft', addTags: ['cosmic', 'space'], power: 18, range: 12, scale: 22 },
    { id: 'spok', prefix: 'Spök', desc: 'en spöklik och odöd variant', addTags: ['undead', 'magic'], intelligence: 10, scale: 6 },
    { id: 'nano', prefix: 'Nano', desc: 'en mikroskopisk högteknologisk variant', addTags: ['tiny', 'technology'], power: -8, intelligence: 10, speed: 10 },
    { id: 'jarn', prefix: 'Järn', desc: 'en variant smidd av järn och stål', addTags: ['metal', 'armored'], power: 10, speed: -6 },
    { id: 'vild', prefix: 'Vild', desc: 'en vildare och mer aggressiv variant', addTags: [], power: 9, speed: 7 },
  ],
  elemental: [
    { id: 'eld', prefix: 'Eld', desc: 'en brinnande variant insvept i lågor', addTags: ['fire', 'energy'], power: 14 },
    { id: 'is', prefix: 'Is', desc: 'en iskall, frusen variant', addTags: ['ice'], range: 10, power: 6 },
    { id: 'gift', prefix: 'Gift', desc: 'en giftig och dödlig variant', addTags: ['poison'], intelligence: 6, power: 8 },
    { id: 'ask', prefix: 'Åsk', desc: 'en åskladdad variant sprakande av blixtar', addTags: ['lightning', 'energy'], speed: 16, power: 8 },
  ],
  dark: [
    { id: 'skugg', prefix: 'Skugg', desc: 'en variant vävd av skugga och mörk magi', addTags: ['undead', 'magic'], intelligence: 8, power: 8 },
    { id: 'demon', prefix: 'Demon', desc: 'en demonisk variant besatt av ondska', addTags: ['demon', 'magic'], power: 16, scale: 8 },
    { id: 'vampyr', prefix: 'Vampyr', desc: 'en blodtörstig, odöd variant', addTags: ['undead', 'predator'], speed: 10, power: 10 },
  ],
  tech: [
    { id: 'robot', prefix: 'Robot', desc: 'en mekaniserad robotvariant', addTags: ['robot', 'machine', 'technology', 'electronic'], power: 12, intelligence: 6 },
    { id: 'cyber', prefix: 'Cyber', desc: 'en cyberuppgraderad variant', addTags: ['technology', 'electronic', 'ai'], intelligence: 18, speed: 8 },
    { id: 'pansar', prefix: 'Pansar', desc: 'en tungt pansrad variant', addTags: ['armored', 'metal'], power: 12, speed: -6 },
  ],
  stone: [
    { id: 'sten', prefix: 'Sten', desc: 'en förstenad variant av sten och berg', addTags: ['material', 'armored', 'earth'], power: 10, speed: -12 },
  ],
};

function clamp(n: number): number {
  return Math.max(1, Math.min(100, Math.round(n)));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function finalizeTags(tags: string[]): { defeatsTags: string[]; vulnerableToTags: string[] } {
  const unique = [...new Set(tags)];
  return {
    defeatsTags: computeDefeatsTags(unique),
    vulnerableToTags: computeVulnerableTags(unique),
  };
}

function buildBaseEntry(seed: Seed, profile: CategoryProfile, index: number, source: string): Entry {
  const tags = [...new Set([...profile.baseTags, ...(seed.tags ?? [])])];
  const flavor = pick(profile.flavor, seed.name.length + index).replace('{name}', seed.name);
  const { defeatsTags, vulnerableToTags } = finalizeTags(tags);
  const power = clamp(seed.power ?? profile.stats.power);
  const scale = clamp(seed.scale ?? profile.scale);
  const size = clamp(seed.size ?? CATEGORY_SIZE[profile.category] ?? 30);
  const abilities = [...new Set([...(seed.abilities ?? []), ...abilitiesFromTags(tags)])];
  return {
    id: '',
    name: seed.name,
    englishName: seed.englishName,
    aliases: seed.aliases ?? [],
    aliasesEn: seed.aliasesEn,
    categories: [profile.category],
    power,
    toughness: clamp(seed.toughness ?? Math.round(power * 0.55 + size * 0.25 + 12)),
    speed: clamp(seed.speed ?? profile.stats.speed),
    range: clamp(seed.range ?? profile.stats.range),
    intelligence: clamp(seed.intelligence ?? profile.stats.intelligence),
    size,
    techLevel: clamp(seed.techLevel ?? CATEGORY_TECH[profile.category] ?? 10),
    cosmicLevel: scale,
    tags,
    defeatsTags,
    vulnerableToTags,
    abilities,
    weaknesses: weaknessesFromTags(vulnerableToTags),
    description: flavor,
    scale,
    source,
    quality: 'verified',
    curated: true,
  };
}

const SINGLE_WORD = /^[A-Za-zÅÄÖåäöé]{2,14}$/;

function eligibleForVariants(base: Entry): boolean {
  return SINGLE_WORD.test(base.name);
}

function buildVariant(base: Entry, mod: VariantMod): Entry {
  const name = mod.prefix + base.name.toLowerCase();
  const tags = [...new Set([...base.tags, ...mod.addTags])];
  const { defeatsTags, vulnerableToTags } = finalizeTags(tags);
  const scale = clamp(base.scale + (mod.scale ?? 0));
  // Variants that add tech/cosmic/size tags shift those dimensions too.
  const sizeDelta = mod.addTags.includes('giant') ? 22 : mod.addTags.includes('tiny') ? -22 : 0;
  const techDelta = mod.addTags.some((t) => ['robot', 'technology', 'electronic', 'ai'].includes(t)) ? 30 : 0;
  const power = clamp(base.power + (mod.power ?? 0));
  return {
    id: '',
    name,
    aliases: [],
    categories: base.categories,
    power,
    toughness: clamp(base.toughness + Math.round((mod.power ?? 0) * 0.4)),
    speed: clamp(base.speed + (mod.speed ?? 0)),
    range: clamp(base.range + (mod.range ?? 0)),
    intelligence: clamp(base.intelligence + (mod.intelligence ?? 0)),
    size: clamp(base.size + sizeDelta),
    techLevel: clamp(base.techLevel + techDelta),
    cosmicLevel: scale,
    tags,
    defeatsTags,
    vulnerableToTags,
    abilities: abilitiesFromTags(tags),
    weaknesses: weaknessesFromTags(vulnerableToTags),
    description: `${name} är ${mod.desc} av ${base.name.toLowerCase()}.`,
    scale,
    source: 'variants',
    quality: 'generated',
    curated: false,
  };
}

// Extra descriptor prefixes used by the admin "generate more" tool to spawn
// brand-new, still-logical entries beyond the deterministic base database.
const EXTRA_MODS: VariantMod[] = [
  { id: 'alfa', prefix: 'Alfa', desc: 'en dominant alfa-variant', addTags: ['legendary'], power: 12, intelligence: 6, scale: 8 },
  { id: 'omega', prefix: 'Omega', desc: 'den ultimata omega-variant', addTags: ['legendary'], power: 18, scale: 12 },
  { id: 'ultra', prefix: 'Ultra', desc: 'en ultravariant bortom det normala', addTags: [], power: 16, speed: 8, scale: 10 },
  { id: 'hyper', prefix: 'Hyper', desc: 'en hyperaktiv, överladdad variant', addTags: ['energy'], speed: 18, power: 8 },
  { id: 'neo', prefix: 'Neo', desc: 'en nydanande framtidsvariant', addTags: ['technology'], intelligence: 12, scale: 6 },
  { id: 'blod', prefix: 'Blod', desc: 'en blodtörstig variant', addTags: ['predator'], power: 12 },
  { id: 'storm', prefix: 'Storm', desc: 'en stormpiskad variant', addTags: ['storm', 'wind'], speed: 12, range: 8 },
  { id: 'natt', prefix: 'Natt', desc: 'en nattlig, dold variant', addTags: ['undead'], intelligence: 8 },
  { id: 'sol', prefix: 'Sol', desc: 'en soldriven strålande variant', addTags: ['fire', 'star', 'energy'], power: 12 },
  { id: 'kris', prefix: 'Kris', desc: 'en kristalliserad variant', addTags: ['material', 'armored'], power: 10 },
];

/** Generate `count` novel entries not already present in `taken` names. */
export function generateExtra(count: number, taken: Set<string>): Entry[] {
  const singleWordBases: Array<{ seed: Seed; profile: CategoryProfile }> = [];
  for (const { profile, items } of SEED_CATEGORIES) {
    for (const seed of items) {
      if (SINGLE_WORD.test(seed.name)) singleWordBases.push({ seed, profile });
    }
  }
  const out: Entry[] = [];
  const localTaken = new Set(taken);
  let attempts = 0;
  const maxAttempts = count * 40 + 100;
  while (out.length < count && attempts < maxAttempts) {
    attempts += 1;
    const { seed, profile } = singleWordBases[Math.floor(Math.random() * singleWordBases.length)];
    const mod = EXTRA_MODS[Math.floor(Math.random() * EXTRA_MODS.length)];
    const base = buildBaseEntry(seed, profile, attempts, 'core');
    const variant = buildVariant(base, mod);
    variant.source = 'admin-generated';
    const key = normalizeName(variant.name);
    if (localTaken.has(key)) continue;
    localTaken.add(key);
    out.push(variant);
  }
  return out;
}

export function generateEntries(): Entry[] {
  const byName = new Map<string, Entry>();
  const usedIds = new Set<string>();

  const assignId = (entry: Entry): void => {
    const base = slugify(entry.name) || 'entry';
    let id = base;
    let n = 2;
    while (usedIds.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    usedIds.add(id);
    entry.id = id;
  };

  const add = (entry: Entry): void => {
    const key = normalizeName(entry.name);
    if (byName.has(key)) return;
    assignId(entry);
    byName.set(key, entry);
  };

  // Pass 1: base entries.
  const bases: Array<{ entry: Entry; profile: CategoryProfile }> = [];
  for (const category of ALL_SEED_CATEGORIES) {
    const { profile, items } = category;
    const source = category.source ?? 'core';
    items.forEach((seed, index) => {
      const entry = buildBaseEntry(seed, profile, index, source);
      bases.push({ entry, profile });
      add(entry);
    });
  }

  // Pass 2: variants.
  for (const { entry, profile } of bases) {
    if (!eligibleForVariants(entry)) continue;
    for (const group of profile.variants) {
      for (const mod of VARIANTS[group]) {
        add(buildVariant(entry, mod));
      }
    }
  }

  return [...byName.values()];
}
