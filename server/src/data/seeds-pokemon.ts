// Pokémon data package — the full national dex as real, verified entries.

import type { Stats } from '../types.js';
import type { SeedCategory } from './seeds.js';
import { POKEMON_NAMES } from './pokemon-names.js';

const S = (power: number, speed: number, range: number, intelligence: number): Stats => ({
  power,
  speed,
  range,
  intelligence,
});

export const POKEMON_CATEGORIES: SeedCategory[] = [
  {
    source: 'pokemon',
    profile: {
      category: 'pokemon',
      baseTags: ['pokemon', 'animal'],
      stats: S(58, 58, 40, 40),
      scale: 50,
      variants: [],
      flavor: [
        '{name} är en Pokémon redo för strid.',
        '{name} kan utvecklas och lära sig kraftfulla attacker.',
        '{name} tränas av Pokémon-tränare världen över.',
      ],
    },
    items: POKEMON_NAMES.map((name) => ({ name })),
  },
];
