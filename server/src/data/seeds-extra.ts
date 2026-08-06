// Extra curated data package ("extra" source) with real, playable Swedish words
// across many additional categories. These are pure verified entries (no
// artificial variants) so the database grows in quality, not just quantity.

import type { Stats } from '../types.js';
import { type SeedCategory, type SeedItem } from './seeds.js';

const S = (power: number, speed: number, range: number, intelligence: number): Stats => ({
  power,
  speed,
  range,
  intelligence,
});

function normalize(items: SeedItem[]) {
  return items.map((i) => (typeof i === 'string' ? { name: i } : i));
}

const insects: SeedItem[] = [
  'Myra', 'Humla', 'Fluga', 'Loppa', 'Lus', 'Fästing', 'Kackerlacka', 'Skalbagge', 'Nyckelpiga',
  'Trollslända', 'Fjäril', 'Nattfjäril', 'Larv', 'Daggmask', 'Termit', 'Gräshoppa',
  'Syrsa', 'Bönsyrsa', 'Tusenfoting', 'Gråsugga', 'Vägglus', 'Dyngbagge', 'Silverfisk',
  'Mal', 'Öronvive', { name: 'Bålgeting', tags: ['poison'], power: 24 },
];

const fish: SeedItem[] = [
  'Lax', 'Torsk', 'Sill', 'Makrill', 'Tonfisk', { name: 'Gädda', tags: ['predator'], power: 34 },
  'Mört', 'Karp', 'Ål', 'Rocka', 'Sardin', 'Ansjovis', 'Kolja', 'Flundra', 'Röding',
  'Öring', 'Braxen', 'Hälleflundra', 'Guldfisk', 'Sjöhäst',
  { name: 'Piraya', tags: ['predator'], power: 38 },
  { name: 'Svärdfisk', tags: ['predator'], power: 42, speed: 70 },
  { name: 'Muräna', tags: ['predator'], power: 40 },
  { name: 'Marulk', tags: ['predator'], power: 36 },
  { name: 'Megalodon', englishName: 'Megalodon', tags: ['predator', 'giant'], power: 84, size: 78, scale: 60 },
];

const birds: SeedItem[] = [
  'Kråka', 'Skata', 'Kaja', 'Mås', 'Trut', 'Tärna', 'Hackspett', 'Gök', 'Svala', 'Lärka',
  'Näktergal', 'Koltrast', 'Blåmes', 'Talgoxe', 'Domherre', 'Steglits', 'Kanariefågel',
  'Undulat', 'Tukan', 'Kolibri', 'Kondor', 'Gam', 'Fasan', 'Orre', 'Tjäder', 'Ripa',
  'Stork', 'Häger', 'Trana', 'Ejder',
];

const dinosaurs: SeedItem[] = [
  { name: 'Tyrannosaurus', aliases: ['T-Rex'], tags: ['predator'], power: 84, size: 80, scale: 55 },
  { name: 'Velociraptor', aliases: ['Raptor'], tags: ['predator'], power: 58, speed: 78 },
  { name: 'Triceratops', tags: ['armored'], power: 70, size: 74 },
  { name: 'Stegosaurus', tags: ['armored'], power: 64, size: 72 },
  { name: 'Brachiosaurus', tags: ['giant'], power: 66, size: 88 },
  'Diplodocus', 'Allosaurus', 'Ankylosaurus', 'Iguanodon', 'Carnotaurus', 'Gallimimus',
  'Dilophosaurus', 'Utahraptor', 'Compsognathus', 'Archaeopteryx',
  { name: 'Spinosaurus', tags: ['predator', 'aquatic'], power: 82, size: 82 },
  { name: 'Pteranodon', tags: ['flying'], power: 46, speed: 60 },
  { name: 'Mosasaurus', tags: ['predator', 'aquatic', 'giant'], power: 80, size: 84 },
];

const fungi: SeedItem[] = [
  { name: 'Flugsvamp', tags: ['fungus', 'poison'], power: 30 },
  { name: 'Lömsk flugsvamp', tags: ['fungus', 'poison'], power: 34 },
  'Champinjon', 'Kantarell', 'Karljohan', 'Stensopp', 'Murkla', 'Tryffel', 'Trattkantarell',
  'Skivling', 'Röksvamp', 'Ticka', 'Fnöske',
  { name: 'Jäst', tags: ['fungus'], power: 14 },
  { name: 'Mögelsvamp', tags: ['fungus'], power: 26 },
  { name: 'Slemsvamp', tags: ['fungus'], power: 18 },
];

const bodyparts: SeedItem[] = [
  { name: 'Hjärna', tags: ['organic'], intelligence: 80, power: 10 },
  { name: 'Hjärta', tags: ['organic'], power: 16 },
  { name: 'Näve', tags: ['organic'], power: 26 },
  'Hand', 'Fot', 'Öga', 'Öra', 'Tand', 'Käke', 'Muskel', 'Skelett', 'Nerv',
  { name: 'Blod', tags: ['organic'], power: 12 },
  'Lunga', 'Lever', 'Njure', 'Mage', 'Tunga', 'Hud', 'Hår',
];

const drinks: SeedItem[] = [
  'Te', 'Vin', 'Öl', 'Vodka', 'Whisky', 'Läsk', 'Juice', 'Mjölk',
  { name: 'Energidryck', tags: ['energy'], speed: 60 }, 'Cola', 'Champagne', 'Rom',
  'Absint', 'Saft', 'Kakao', 'Smoothie',
];

const scifi: SeedItem[] = [
  { name: 'Laserpistol', tags: ['laser', 'weapon', 'energy'], power: 58, range: 70 },
  { name: 'Ljussabel', aliases: ['Lasersvärd'], englishName: 'Lightsaber', tags: ['blade', 'laser', 'energy'], power: 72, range: 20 },
  { name: 'Plasmagevär', tags: ['laser', 'weapon', 'energy'], power: 66, range: 75 },
  { name: 'Dödsstjärnan', englishName: 'Death Star', tags: ['space', 'weapon', 'technology'], power: 96, range: 95, scale: 90, size: 90 },
  { name: 'Rymdstation', tags: ['space', 'technology', 'building'], power: 50, scale: 70, size: 78 },
  { name: 'Kraftfält', aliases: ['Sköld'], tags: ['energy', 'technology'], power: 40, toughness: 85 },
  { name: 'Terminator', tags: ['robot', 'machine', 'technology'], power: 78, toughness: 82 },
  { name: 'Xenomorf', aliases: ['Alien'], tags: ['monster', 'predator'], power: 76, speed: 74 },
  { name: 'Predatorn', englishName: 'Predator', tags: ['monster', 'predator', 'technology'], power: 78 },
  { name: 'Dalek', tags: ['robot', 'machine'], power: 70 },
  { name: 'Replikant', tags: ['robot', 'human', 'technology'], power: 58, intelligence: 78 },
  'Teleportör', 'Warpmotor', 'Hologram', 'Jetpack', 'Rymdvarelse', 'Utomjording',
  { name: 'Nanosvärm', tags: ['robot', 'tiny', 'technology'], power: 62, scale: 55 },
];

const characters: SeedItem[] = [
  { name: 'Godzilla', tags: ['monster', 'giant'], power: 92, size: 88, scale: 78 },
  { name: 'King Kong', tags: ['animal', 'giant'], power: 84, size: 82, scale: 68 },
  { name: 'Mario', tags: ['human'], power: 40, speed: 55 },
  { name: 'Sonic', tags: ['animal'], power: 40, speed: 98 },
  { name: 'Kratos', tags: ['god', 'human'], power: 90, scale: 82 },
  { name: 'Gandalf', tags: ['wizard', 'magic'], power: 82, intelligence: 88, scale: 74 },
  { name: 'Aragorn', tags: ['human', 'soldier', 'blade'], power: 60 },
  { name: 'Yoda', tags: ['wizard', 'magic'], power: 84, intelligence: 92, scale: 76 },
  { name: 'Gollum', tags: ['monster'], power: 26, speed: 60 },
  { name: 'Geralt', aliases: ['Häxkarlen'], tags: ['human', 'blade', 'magic'], power: 68 },
  { name: 'Lara Croft', tags: ['human', 'firearm', 'hunter'], power: 52 },
  { name: 'Master Chief', tags: ['soldier', 'human', 'firearm', 'armored', 'technology'], power: 74 },
  { name: 'Samus', tags: ['soldier', 'firearm', 'armored', 'technology'], power: 76 },
  { name: 'Doomslayer', aliases: ['Doomguy'], tags: ['soldier', 'firearm'], power: 82 },
  'Pac-Man', 'Donkey Kong', 'Kirby', 'Luigi', 'Zelda', 'Ganondorf',
  { name: 'Cloud', tags: ['human', 'blade'], power: 66 },
];

const anime: SeedItem[] = [
  { name: 'Goku', tags: ['legendary', 'cosmic'], power: 97, scale: 84 },
  { name: 'Vegeta', tags: ['legendary'], power: 94, scale: 80 },
  { name: 'Naruto', tags: ['magic'], power: 84, scale: 66 },
  { name: 'Sasuke', tags: ['magic'], power: 82 },
  { name: 'Luffy', tags: ['legendary'], power: 82 },
  { name: 'Ichigo', tags: ['blade', 'magic'], power: 84 },
  { name: 'Saitama', aliases: ['One Punch Man'], tags: ['legendary'], power: 99, scale: 80 },
  { name: 'Light Yagami', tags: ['human'], power: 30, intelligence: 92 },
  'Eren', 'Levi', 'Gojo', 'Tanjiro',
];

const tools: SeedItem[] = [
  { name: 'Motorsåg', tags: ['blade', 'machine'], power: 52 },
  { name: 'Såg', tags: ['blade'], power: 34 },
  { name: 'Skruvmejsel', tags: ['tool'], power: 18 },
  { name: 'Borr', tags: ['tool', 'machine'], power: 30 },
  { name: 'Lie', tags: ['blade'], power: 40 },
  { name: 'Skära', tags: ['blade'], power: 34 },
  { name: 'Städ', tags: ['material'], power: 30, toughness: 80 },
  'Skiftnyckel', 'Tång', 'Rep', 'Kätting', 'Vinkelslip', 'Räfsa', 'Kofot', 'Spade',
  'Hacka', 'Hyvel', 'Fil', 'Mejsel',
  { name: 'Svetslåga', tags: ['fire', 'tool'], power: 44 },
];

const conceptsExtra: SeedItem[] = [
  { name: 'Turen', tags: ['concept', 'abstract'], power: 55 },
  { name: 'Ödet', aliases: ['Öde'], tags: ['concept', 'abstract'], power: 72, scale: 78 },
  { name: 'Sanningen', tags: ['concept', 'abstract'], power: 60 },
  { name: 'Lögnen', tags: ['concept', 'abstract'], power: 50, intelligence: 70 },
  { name: 'Rädslan', tags: ['concept', 'abstract'], power: 58 },
  { name: 'Hoppet', tags: ['concept', 'abstract'], power: 54 },
  { name: 'Vishet', tags: ['concept', 'abstract'], intelligence: 90, power: 50 },
  { name: 'Galenskap', tags: ['concept', 'abstract'], power: 56 },
  { name: 'Tystnaden', tags: ['concept', 'abstract'], power: 48 },
  { name: 'Minnet', tags: ['concept', 'abstract'], power: 46 },
  { name: 'Glömskan', tags: ['concept', 'abstract'], power: 58 },
  { name: 'Berättaren', aliases: ['Författaren'], tags: ['reality', 'entity', 'concept', 'abstract'], power: 100, scale: 100 },
  { name: 'Fantasin', tags: ['concept', 'abstract', 'magic'], power: 70, scale: 70 },
];

export const EXTRA_CATEGORIES: SeedCategory[] = [
  {
    source: 'extra',
    profile: {
      category: 'insects',
      baseTags: ['insect', 'animal', 'organic', 'living'],
      stats: S(16, 45, 8, 8),
      scale: 12,
      variants: [],
      flavor: [
        '{name} är en liten men envis insekt.',
        '{name} överlever i det tysta där större varelser misslyckas.',
      ],
    },
    items: normalize(insects),
  },
  {
    source: 'extra',
    profile: {
      category: 'fish',
      baseTags: ['fish', 'animal', 'aquatic', 'organic', 'living'],
      stats: S(28, 52, 12, 10),
      scale: 22,
      variants: [],
      flavor: [
        '{name} rör sig snabbt genom vattnet.',
        '{name} är hemma i havets djup.',
      ],
    },
    items: normalize(fish),
  },
  {
    source: 'extra',
    profile: {
      category: 'birds',
      baseTags: ['bird', 'animal', 'flying', 'organic', 'living'],
      stats: S(22, 70, 30, 20),
      scale: 20,
      variants: [],
      flavor: [
        '{name} svävar fritt i luften.',
        '{name} ser allt från ovan.',
      ],
    },
    items: normalize(birds),
  },
  {
    source: 'extra',
    profile: {
      category: 'dinosaurs',
      baseTags: ['dinosaur', 'animal', 'organic', 'living'],
      stats: S(66, 48, 20, 18),
      scale: 45,
      variants: [],
      flavor: [
        '{name} härskade över jorden för miljoner år sedan.',
        '{name} är en förhistorisk koloss.',
      ],
    },
    items: normalize(dinosaurs),
  },
  {
    source: 'extra',
    profile: {
      category: 'fungi',
      baseTags: ['fungus', 'organic', 'living'],
      stats: S(22, 6, 20, 6),
      scale: 18,
      variants: [],
      flavor: [
        '{name} bryter tyst ner allt organiskt omkring sig.',
        '{name} sprider sina sporer i det fördolda.',
      ],
    },
    items: normalize(fungi),
  },
  {
    source: 'extra',
    profile: {
      category: 'bodyparts',
      baseTags: ['human', 'organic', 'living'],
      stats: S(14, 30, 8, 20),
      scale: 14,
      variants: [],
      flavor: [
        '{name} är en del av kroppen.',
        '{name} fyller sin funktion i det stora hela.',
      ],
    },
    items: normalize(bodyparts),
  },
  {
    source: 'extra',
    profile: {
      category: 'drinks',
      baseTags: ['food', 'organic'],
      stats: S(10, 12, 10, 4),
      scale: 10,
      variants: [],
      flavor: [
        '{name} släcker törsten men vinner sällan dueller.',
        '{name} är en dryck – knappast ett vapen.',
      ],
    },
    items: normalize(drinks),
  },
  {
    source: 'extra',
    profile: {
      category: 'scifi',
      baseTags: ['scifi', 'technology'],
      stats: S(64, 60, 60, 55),
      scale: 62,
      variants: [],
      flavor: [
        '{name} kommer från science fictionens värld.',
        '{name} bygger på teknik långt bortom vår tid.',
      ],
    },
    items: normalize(scifi),
  },
  {
    source: 'extra',
    profile: {
      category: 'characters',
      baseTags: [],
      stats: S(60, 60, 40, 55),
      scale: 55,
      variants: [],
      flavor: [
        '{name} är en ikonisk karaktär från spel och film.',
        '{name} har blivit legendarisk i populärkulturen.',
      ],
    },
    items: normalize(characters),
  },
  {
    source: 'extra',
    profile: {
      category: 'anime',
      baseTags: ['legendary'],
      stats: S(84, 74, 55, 60),
      scale: 72,
      variants: [],
      flavor: [
        '{name} är en mäktig anime-hjälte.',
        '{name} slåss med krafter bortom det mänskliga.',
      ],
    },
    items: normalize(anime),
  },
  {
    source: 'extra',
    profile: {
      category: 'tools',
      baseTags: ['tool'],
      stats: S(30, 30, 15, 10),
      scale: 25,
      variants: [],
      flavor: [
        '{name} är ett verktyg – men i rätt händer ett vapen.',
        '{name} används för att bygga eller förstöra.',
      ],
    },
    items: normalize(tools),
  },
  {
    source: 'extra',
    profile: {
      category: 'concepts',
      baseTags: ['concept', 'abstract'],
      stats: S(58, 60, 60, 70),
      scale: 66,
      variants: [],
      flavor: [
        '{name} är ett abstrakt begrepp som påverkar allt.',
        '{name} kan inte röras, men märks överallt.',
      ],
    },
    items: normalize(conceptsExtra),
  },
];
