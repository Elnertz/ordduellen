// Swedish-facing labels for categories and tags, plus the dynamic
// "tag beats tag" relationship graph that powers the reasoning judge.
// Nothing here hardcodes specific word pairs — only general tag relationships.

export const CATEGORY_LABELS: Record<string, string> = {
  animals: 'Djur',
  weapons: 'Vapen',
  military: 'Militär',
  technology: 'Teknologi',
  vehicles: 'Fordon',
  nature: 'Natur',
  weather: 'Väder',
  space: 'Rymden',
  science: 'Vetenskap',
  medicine: 'Medicin',
  diseases: 'Sjukdomar',
  plants: 'Växter',
  buildings: 'Byggnader',
  places: 'Platser',
  history: 'Historia',
  mythology: 'Mytologi',
  fantasy: 'Fantasy',
  magic: 'Magi',
  heroes: 'Superhjältar',
  villains: 'Skurkar',
  pokemon: 'Pokémon',
  food: 'Mat',
  professions: 'Yrken',
  sports: 'Sport',
  music: 'Musik',
  internet: 'Internet',
  materials: 'Material',
  elements: 'Grundämnen',
  energy: 'Energi',
  concepts: 'Koncept',
  cosmic: 'Kosmiska entiteter',
  people: 'Personer',
};

export const TAG_LABELS: Record<string, string> = {
  animal: 'djur',
  predator: 'rovdjur',
  prey: 'bytesdjur',
  insect: 'insekt',
  reptile: 'reptil',
  bird: 'fågel',
  fish: 'fisk',
  mammal: 'däggdjur',
  dinosaur: 'dinosaurie',
  weapon: 'vapen',
  firearm: 'skjutvapen',
  blade: 'eggvapen',
  explosive: 'sprängämne',
  projectile: 'projektil',
  nuclear: 'kärnvapen',
  military: 'militär',
  soldier: 'soldat',
  vehicle: 'fordon',
  aircraft: 'flygfarkost',
  ship: 'fartyg',
  tank: 'stridsvagn',
  technology: 'teknologi',
  machine: 'maskin',
  robot: 'robot',
  ai: 'artificiell intelligens',
  computer: 'dator',
  electronic: 'elektronik',
  emp: 'elektromagnetisk puls',
  nature: 'natur',
  plant: 'växt',
  tree: 'träd',
  water: 'vatten',
  fire: 'eld',
  ice: 'is',
  earth: 'jord',
  wind: 'luft',
  lightning: 'blixt',
  poison: 'gift',
  acid: 'syra',
  weather: 'väder',
  storm: 'storm',
  disaster: 'naturkatastrof',
  earthquake: 'jordbävning',
  volcano: 'vulkan',
  space: 'rymden',
  planet: 'planet',
  star: 'stjärna',
  asteroid: 'asteroid',
  comet: 'komet',
  cosmic: 'kosmisk',
  blackhole: 'svart hål',
  gravity: 'gravitation',
  radiation: 'strålning',
  science: 'vetenskap',
  chemical: 'kemikalie',
  element: 'grundämne',
  disease: 'sjukdom',
  virus: 'virus',
  bacteria: 'bakterie',
  medicine: 'medicin',
  human: 'människa',
  profession: 'yrke',
  hunter: 'jägare',
  building: 'byggnad',
  city: 'stad',
  country: 'land',
  history: 'historia',
  mythology: 'mytologi',
  god: 'gud',
  titan: 'titan',
  monster: 'monster',
  dragon: 'drake',
  undead: 'odöd',
  demon: 'demon',
  fantasy: 'fantasy',
  magic: 'magi',
  wizard: 'trollkarl',
  superhero: 'superhjälte',
  villain: 'skurk',
  mutant: 'mutant',
  pokemon: 'pokémon',
  food: 'mat',
  sport: 'sport',
  music: 'musik',
  internet: 'internet',
  hacker: 'hackare',
  material: 'material',
  metal: 'metall',
  energy: 'energi',
  concept: 'koncept',
  time: 'tid',
  reality: 'verklighet',
  abstract: 'abstrakt',
  entity: 'kosmisk entitet',
  giant: 'jätte',
  tiny: 'pytteliten',
  flying: 'flygande',
  armored: 'pansrad',
  legendary: 'legendarisk',
  aquatic: 'vattenlevande',
  organic: 'organisk',
  living: 'levande',
};

export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag;
}

export function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

// General "A tends to beat B" relationships between tags. These are the only
// rules the judge reasons over — everything else is derived from stats/scale.
export const TAG_BEATS: Record<string, string[]> = {
  water: ['fire', 'volcano'],
  fire: ['plant', 'tree', 'ice', 'insect', 'undead', 'organic', 'food'],
  ice: ['plant', 'tree', 'water'],
  lightning: ['water', 'machine', 'robot', 'electronic', 'metal', 'human'],
  poison: ['human', 'animal', 'plant', 'organic', 'living'],
  acid: ['metal', 'material', 'organic', 'machine'],
  radiation: ['human', 'animal', 'plant', 'organic', 'living'],
  wind: ['fire', 'bird', 'aircraft'],
  storm: ['ship', 'aircraft', 'building', 'city'],
  earthquake: ['building', 'city', 'human'],
  volcano: ['city', 'building', 'human', 'animal'],
  disaster: ['building', 'city', 'human', 'animal', 'vehicle'],
  predator: ['prey', 'animal', 'insect'],
  hunter: ['animal', 'predator', 'prey'],
  human: ['animal', 'plant', 'nature'],
  weapon: ['human', 'animal'],
  blade: ['human', 'animal', 'organic'],
  firearm: ['human', 'animal', 'soldier', 'predator'],
  explosive: ['building', 'vehicle', 'tank', 'human', 'animal', 'ship'],
  projectile: ['aircraft', 'vehicle', 'building', 'human', 'animal'],
  tank: ['soldier', 'human', 'vehicle', 'building'],
  nuclear: ['city', 'building', 'human', 'animal', 'tank', 'vehicle', 'military', 'country'],
  military: ['human', 'animal', 'monster'],
  soldier: ['human', 'animal'],
  emp: ['robot', 'computer', 'ai', 'electronic', 'vehicle', 'aircraft', 'technology', 'machine'],
  hacker: ['computer', 'ai', 'robot', 'internet', 'technology', 'electronic'],
  virus: ['human', 'animal', 'organic', 'living'],
  bacteria: ['human', 'animal', 'organic', 'living'],
  disease: ['human', 'animal', 'organic', 'living'],
  medicine: ['disease', 'virus', 'bacteria'],
  robot: ['human', 'animal'],
  machine: ['human', 'animal'],
  ai: ['human', 'computer', 'robot', 'machine'],
  asteroid: ['planet', 'city', 'building', 'human', 'animal', 'dinosaur', 'projectile'],
  comet: ['planet', 'city', 'building', 'human'],
  gravity: ['planet', 'star', 'asteroid', 'human', 'aircraft', 'ship'],
  blackhole: ['planet', 'star', 'asteroid', 'comet', 'space', 'city', 'human', 'machine', 'robot'],
  magic: ['dragon', 'monster', 'robot', 'machine', 'technology', 'human', 'undead'],
  wizard: ['dragon', 'monster', 'human', 'soldier', 'undead'],
  dragon: ['human', 'soldier', 'animal', 'building', 'city', 'monster'],
  god: ['human', 'animal', 'monster', 'dragon', 'titan', 'hero', 'city'],
  titan: ['human', 'building', 'city', 'monster', 'animal'],
  demon: ['human', 'animal', 'soldier'],
  monster: ['human', 'animal', 'soldier'],
  superhero: ['villain', 'monster', 'robot', 'criminal', 'human'],
  villain: ['human', 'city', 'hero'],
  mutant: ['human', 'animal'],
  cosmic: ['planet', 'star', 'human', 'god', 'city', 'country', 'animal', 'machine'],
  entity: ['cosmic', 'god', 'planet', 'star', 'reality', 'human', 'time'],
  reality: ['human', 'god', 'cosmic', 'planet', 'star', 'time', 'concept', 'entity'],
  time: ['human', 'building', 'city', 'country', 'animal', 'material'],
};

// Inverse relationship: which tags beat a given tag.
export const TAG_BEATEN_BY: Record<string, string[]> = (() => {
  const inverse: Record<string, string[]> = {};
  for (const [attacker, targets] of Object.entries(TAG_BEATS)) {
    for (const t of targets) {
      (inverse[t] ??= []).push(attacker);
    }
  }
  return inverse;
})();

export function computeDefeatsTags(tags: string[]): string[] {
  const out = new Set<string>();
  for (const tag of tags) {
    for (const beaten of TAG_BEATS[tag] ?? []) out.add(beaten);
  }
  return [...out];
}

export function computeVulnerableTags(tags: string[]): string[] {
  const out = new Set<string>();
  for (const tag of tags) {
    for (const attacker of TAG_BEATEN_BY[tag] ?? []) out.add(attacker);
  }
  return [...out];
}

export const ALL_TAGS = Object.keys(TAG_LABELS);
export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);

// Player-facing Swedish ability phrases derived from tags.
const ABILITY_BY_TAG: Record<string, string> = {
  flying: 'kan flyga',
  fire: 'attackerar med eld',
  ice: 'fryser sina motståndare',
  lightning: 'slår till med blixtar',
  poison: 'är giftig',
  acid: 'löser upp material med syra',
  radiation: 'sprider dödlig strålning',
  water: 'behärskar vatten',
  magic: 'behärskar magi',
  wizard: 'kastar besvärjelser',
  predator: 'jagar och dödar byten',
  hunter: 'spårar och fäller sitt byte',
  explosive: 'exploderar med enorm kraft',
  nuclear: 'utlöser kärnvapenkraft',
  emp: 'slår ut elektronik med en puls',
  hacker: 'tar kontroll över datorer',
  ai: 'tänker snabbare än en människa',
  robot: 'är en outtröttlig maskin',
  armored: 'är kraftigt pansrad',
  giant: 'är enorm till storleken',
  undead: 'kan inte dö på vanligt sätt',
  dragon: 'spyr eld och flyger',
  god: 'har gudomlig makt',
  cosmic: 'bär på kosmisk kraft',
  blackhole: 'slukar allt med sin gravitation',
  reality: 'kan böja själva verkligheten',
  gravity: 'kontrollerar gravitationen',
  disease: 'smittar och bryter ner kroppen',
  medicine: 'botar sjukdomar',
  aquatic: 'härskar under vattnet',
};

export function abilitiesFromTags(tags: string[]): string[] {
  const out: string[] = [];
  for (const tag of tags) {
    const phrase = ABILITY_BY_TAG[tag];
    if (phrase && !out.includes(phrase)) out.push(phrase);
  }
  return out.slice(0, 5);
}

export function weaknessesFromTags(vulnerableTags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of vulnerableTags) {
    const label = tagLabel(tag);
    if (seen.has(label)) continue;
    seen.add(label);
    out.push(`sårbar mot ${label}`);
  }
  return out.slice(0, 5);
}
