// Curated seed data for the Ordduellen database. Each category has a profile
// (default stats/tags/scale + which variant groups apply) and a list of real,
// recognisable Swedish-named concepts. The generator enriches these and then
// multiplies them with logical variants to build a database of 10 000+ entries.

import type { Stats } from '../types.js';

export type VariantGroup = 'universal' | 'elemental' | 'dark' | 'tech' | 'stone';

export interface Seed {
  name: string;
  englishName?: string;
  aliases?: string[];
  aliasesEn?: string[];
  tags?: string[];
  power?: number;
  toughness?: number;
  speed?: number;
  range?: number;
  intelligence?: number;
  size?: number;
  techLevel?: number;
  scale?: number;
  abilities?: string[];
}

export interface CategoryProfile {
  category: string;
  baseTags: string[];
  stats: Stats;
  scale: number;
  variants: VariantGroup[];
  flavor: string[];
}

export type SeedItem = string | Seed;

function normalize(items: SeedItem[]): Seed[] {
  return items.map((i) => (typeof i === 'string' ? { name: i } : i));
}

export interface SeedCategory {
  profile: CategoryProfile;
  items: Seed[];
  /** Data package id; defaults to "core". */
  source?: string;
}

// ---------------------------------------------------------------------------
// Raw name lists per category
// ---------------------------------------------------------------------------

const animals: SeedItem[] = [
  { name: 'Lejon', tags: ['predator'], power: 62, speed: 66 },
  { name: 'Tiger', tags: ['predator'], power: 64, speed: 70 },
  { name: 'Björn', tags: ['predator'], power: 68, speed: 48 },
  { name: 'Varg', tags: ['predator'], power: 50, speed: 68 },
  { name: 'Elefant', tags: ['giant'], power: 74, speed: 34, range: 24 },
  { name: 'Noshörning', tags: ['armored'], power: 70, speed: 46 },
  { name: 'Flodhäst', tags: [], power: 66, speed: 40 },
  { name: 'Krokodil', tags: ['reptile', 'predator', 'aquatic'], power: 60, speed: 40 },
  { name: 'Haj', tags: ['fish', 'predator', 'aquatic'], power: 62, speed: 62 },
  { name: 'Späckhuggare', aliases: ['Orca'], tags: ['predator', 'aquatic', 'mammal'], power: 70, speed: 64 },
  { name: 'Val', aliases: ['Blåval'], tags: ['giant', 'aquatic', 'mammal'], power: 76, speed: 40 },
  { name: 'Bläckfisk', aliases: ['Kraken'], tags: ['aquatic'], power: 44, intelligence: 60 },
  { name: 'Örn', tags: ['bird', 'predator', 'flying'], power: 40, speed: 78 },
  { name: 'Falk', tags: ['bird', 'predator', 'flying'], power: 34, speed: 88 },
  { name: 'Uggla', tags: ['bird', 'flying'], power: 26, speed: 60 },
  { name: 'Korp', tags: ['bird', 'flying'], power: 18, intelligence: 62 },
  { name: 'Kobra', tags: ['reptile', 'poison', 'predator'], power: 44, speed: 52 },
  { name: 'Pytonorm', tags: ['reptile', 'predator'], power: 50, speed: 30 },
  { name: 'Skorpion', tags: ['insect', 'poison'], power: 30, speed: 40 },
  { name: 'Skallerorm', tags: ['reptile', 'poison'], power: 40, speed: 46 },
  { name: 'Getingsvärm', aliases: ['Getingar'], tags: ['insect', 'poison', 'flying'], power: 34, speed: 62 },
  { name: 'Myrsvärm', aliases: ['Myror'], tags: ['insect'], power: 30, intelligence: 30, range: 40 },
  { name: 'Bi', tags: ['insect', 'poison', 'flying'], power: 14, speed: 54 },
  { name: 'Mygga', tags: ['insect', 'flying'], power: 8, speed: 50 },
  { name: 'Spindel', tags: ['insect', 'poison'], power: 22, intelligence: 26 },
  { name: 'Råtta', tags: ['prey', 'mammal'], power: 12, speed: 44 },
  { name: 'Mus', tags: ['prey', 'mammal', 'tiny'], power: 6, speed: 46 },
  { name: 'Kanin', tags: ['prey', 'mammal'], power: 8, speed: 58 },
  { name: 'Räv', tags: ['predator', 'mammal'], power: 30, speed: 62, intelligence: 54 },
  'Hjort', 'Älg', 'Ren', 'Get', 'Får', 'Ko', 'Tjur', 'Häst', 'Åsna', 'Gris',
  { name: 'Katt', tags: ['predator', 'mammal'], power: 18, speed: 66 },
  { name: 'Hund', tags: ['predator', 'mammal'], power: 26, speed: 58 },
  'Gepard', 'Leopard', 'Jaguar', 'Puma', 'Panter', 'Hyena', 'Schakal', 'Grävling',
  'Igelkott', 'Ekorre', 'Bäver', 'Utter', 'Säl', 'Valross', 'Pingvin', 'Struts',
  'Papegoja', 'Flamingo', 'Pelikan', 'Svan', 'Gås', 'Anka', 'Höna', 'Tupp',
  'Kalkon', 'Duva', 'Sparv', 'Trast', 'Fladdermus', 'Apa', 'Gorilla', 'Schimpans',
  'Orangutang', 'Babian', 'Lemur', 'Koala', 'Känguru', 'Vombat', 'Pungråtta',
  'Bältdjur', 'Myrslok', 'Sengångare', 'Giraff', 'Zebra', 'Kamel', 'Lama', 'Antilop',
  'Gnu', 'Bison', 'Buffel', 'Vildsvin', 'Groda', 'Padda', 'Salamander', 'Ödla',
  'Kameleont', 'Leguan', 'Sköldpadda', 'Manet', 'Sjöstjärna', 'Krabba', 'Hummer',
  'Räka', 'Musslor', 'Snigel', 'Mask', 'Fluga', 'Fjäril', 'Larv', 'Nyckelpiga',
  'Trollslända', 'Syrsa', 'Gräshoppa', 'Termit', 'Loppa', 'Lus', 'Fästing',
];

const weapons: SeedItem[] = [
  { name: 'Kniv', tags: ['blade'], power: 24, scale: 20 },
  { name: 'Dolk', tags: ['blade'], power: 22 },
  { name: 'Svärd', tags: ['blade'], power: 40 },
  { name: 'Katana', tags: ['blade'], power: 46, speed: 60 },
  { name: 'Yxa', tags: ['blade'], power: 42 },
  { name: 'Spjut', tags: ['blade', 'projectile'], power: 38, range: 40 },
  { name: 'Pilbåge', tags: ['projectile'], power: 34, range: 55 },
  { name: 'Armborst', tags: ['projectile'], power: 40, range: 55 },
  { name: 'Pistol', tags: ['firearm'], power: 48, range: 45 },
  { name: 'Gevär', tags: ['firearm'], power: 58, range: 70 },
  { name: 'Prickskyttegevär', tags: ['firearm'], power: 62, range: 88 },
  { name: 'Kulspruta', tags: ['firearm'], power: 66, range: 60 },
  { name: 'Hagelgevär', tags: ['firearm'], power: 56, range: 35 },
  { name: 'Granat', tags: ['explosive'], power: 62, range: 30 },
  { name: 'Handgranat', tags: ['explosive'], power: 58, range: 28 },
  { name: 'Dynamit', tags: ['explosive'], power: 66, scale: 45 },
  { name: 'Bomb', tags: ['explosive'], power: 74, scale: 55 },
  { name: 'Missil', aliases: ['Robot'], tags: ['explosive', 'projectile'], power: 82, range: 88, scale: 68 },
  { name: 'Kärnvapen', aliases: ['Atombomb', 'Kärnvapenbomb'], tags: ['explosive', 'nuclear'], power: 96, range: 80, scale: 85 },
  { name: 'Vätebomb', tags: ['explosive', 'nuclear'], power: 98, range: 82, scale: 88 },
  { name: 'Laserkanon', tags: ['energy'], power: 78, range: 82, scale: 60 },
  { name: 'Flamkastare', tags: ['fire'], power: 60, range: 30 },
  'Klubba', 'Hammare', 'Slägga', 'Piska', 'Morgonstjärna', 'Hillebard', 'Lans',
  'Slangbella', 'Blåsrör', 'Kastspjut', 'Bazooka', 'Granatgevär', 'Mina', 'Landmina',
  'Napalm', 'Molotovcocktail', 'Rökgranat', 'Chockgranat',
];

const military: SeedItem[] = [
  { name: 'Soldat', tags: ['soldier', 'human'], power: 40, scale: 30 },
  { name: 'Stridsvagn', aliases: ['Tank'], tags: ['tank', 'vehicle', 'armored'], power: 78, range: 60, scale: 62 },
  { name: 'Pansarvagn', tags: ['tank', 'vehicle', 'armored'], power: 72, scale: 60 },
  { name: 'Stridsflygplan', aliases: ['Jaktplan'], tags: ['aircraft', 'vehicle', 'flying'], power: 80, speed: 92, range: 80, scale: 66 },
  { name: 'Bombplan', tags: ['aircraft', 'vehicle', 'flying'], power: 84, range: 85, scale: 70 },
  { name: 'Attackhelikopter', tags: ['aircraft', 'vehicle', 'flying'], power: 74, range: 65, scale: 60 },
  { name: 'Hangarfartyg', tags: ['ship', 'vehicle', 'military'], power: 86, range: 80, scale: 74 },
  { name: 'Ubåt', tags: ['ship', 'vehicle', 'aquatic'], power: 76, range: 78, scale: 66 },
  { name: 'Slagskepp', tags: ['ship', 'vehicle', 'armored'], power: 82, range: 78, scale: 70 },
  { name: 'Drönare', tags: ['aircraft', 'technology', 'flying', 'electronic'], power: 54, speed: 70, range: 70, intelligence: 50, scale: 48 },
  { name: 'Armé', tags: ['military', 'human'], power: 88, range: 70, scale: 78 },
  'General', 'Krigare', 'Legosoldat', 'Prickskytt', 'Kommandosoldat',
  'Artilleri', 'Robotförsvar', 'Missilförsvarssystem', 'Krigsskepp', 'Torped',
];

const technology: SeedItem[] = [
  { name: 'Robot', tags: ['robot', 'machine', 'technology', 'electronic'], power: 60, scale: 55 },
  { name: 'Mecha', aliases: ['Kamprobot', 'Mech'], tags: ['robot', 'machine', 'technology', 'armored'], power: 84, scale: 70 },
  { name: 'Superdator', tags: ['computer', 'technology', 'electronic'], power: 30, intelligence: 92, scale: 55 },
  { name: 'Artificiell intelligens', aliases: ['AI'], tags: ['ai', 'computer', 'technology'], power: 40, intelligence: 96, range: 80, scale: 72 },
  { name: 'Kvantdator', tags: ['computer', 'technology', 'electronic'], power: 24, intelligence: 98, scale: 58 },
  { name: 'Dator', tags: ['computer', 'technology', 'electronic'], power: 12, intelligence: 70 },
  { name: 'Smartphone', aliases: ['Mobiltelefon'], tags: ['computer', 'technology', 'electronic'], power: 8, intelligence: 55 },
  { name: 'Elektromagnetisk puls', aliases: ['EMP'], tags: ['emp', 'energy', 'technology'], power: 40, range: 75, scale: 60 },
  { name: 'Nanorobotar', aliases: ['Nanoteknik'], tags: ['robot', 'technology', 'tiny'], power: 55, intelligence: 70, scale: 58 },
  { name: 'Satellit', tags: ['technology', 'electronic', 'flying', 'space'], power: 30, range: 90, scale: 60 },
  'Server', 'Nätverk', 'Algoritm', 'Databas', 'Krypto', 'Blockkedja', 'Sensor',
  'Kamera', 'Radar', 'Sonar', 'GPS', 'Exoskelett', 'Cyborg', 'Androidrobot',
  'Självkörande bil', 'Övervakningssystem', '3D-skrivare', 'Kärnreaktor',
];

const vehicles: SeedItem[] = [
  { name: 'Bil', tags: ['vehicle'], power: 34, speed: 60, scale: 40 },
  { name: 'Lastbil', tags: ['vehicle'], power: 50, speed: 45, scale: 46 },
  { name: 'Buss', tags: ['vehicle'], power: 46, speed: 44 },
  { name: 'Motorcykel', tags: ['vehicle'], power: 28, speed: 74 },
  { name: 'Tåg', tags: ['vehicle'], power: 66, speed: 66, scale: 55 },
  { name: 'Flygplan', tags: ['aircraft', 'vehicle', 'flying'], power: 54, speed: 88, range: 78, scale: 58 },
  { name: 'Helikopter', tags: ['aircraft', 'vehicle', 'flying'], power: 44, speed: 66 },
  { name: 'Fartyg', aliases: ['Skepp'], tags: ['ship', 'vehicle', 'aquatic'], power: 56, scale: 55 },
  { name: 'Raket', tags: ['vehicle', 'flying', 'space', 'projectile'], power: 70, speed: 96, range: 92, scale: 68 },
  { name: 'Rymdskepp', tags: ['vehicle', 'space', 'flying', 'technology'], power: 72, speed: 94, range: 92, scale: 74 },
  'Traktor', 'Grävmaskin', 'Bulldozer', 'Ambulans', 'Brandbil', 'Segelbåt',
  'Jetski', 'Fyrhjuling', 'Snöskoter', 'Cykel', 'Sportbil', 'Formel 1-bil',
];

const nature: SeedItem[] = [
  { name: 'Vulkan', tags: ['volcano', 'fire', 'disaster', 'earth'], power: 88, range: 60, scale: 80 },
  { name: 'Jordbävning', tags: ['earthquake', 'disaster', 'earth'], power: 86, range: 78, scale: 80 },
  { name: 'Tsunami', tags: ['water', 'disaster'], power: 88, range: 82, scale: 82 },
  { name: 'Lavin', tags: ['ice', 'disaster'], power: 70, range: 50, scale: 62 },
  { name: 'Jordskred', tags: ['earth', 'disaster'], power: 68, range: 48 },
  { name: 'Berg', aliases: ['Fjäll'], tags: ['earth', 'nature'], power: 60, scale: 66, speed: 2 },
  { name: 'Hav', tags: ['water', 'nature', 'aquatic'], power: 78, range: 90, scale: 82 },
  { name: 'Flod', tags: ['water', 'nature'], power: 44, range: 60 },
  { name: 'Skog', tags: ['tree', 'plant', 'nature'], power: 40, range: 70, scale: 55 },
  { name: 'Öken', tags: ['earth', 'nature'], power: 46, range: 70, scale: 60 },
  { name: 'Vatten', tags: ['water'], power: 55, range: 60, scale: 55 },
  { name: 'Eld', aliases: ['Låga'], tags: ['fire', 'energy'], power: 62, scale: 50 },
  { name: 'Is', tags: ['ice'], power: 50, range: 40 },
  { name: 'Vind', aliases: ['Luft'], tags: ['wind'], speed: 82, range: 55 },
  { name: 'Jord', tags: ['earth'], power: 50, scale: 55 },
  { name: 'Sten', tags: ['earth', 'material'], power: 40 },
  { name: 'Ljus', tags: ['energy'], power: 40, speed: 96 },
  { name: 'Mörker', tags: ['abstract'], power: 44, intelligence: 40 },
  { name: 'Sjö', tags: ['water'], power: 40, range: 50 },
  { name: 'Vattenfall', tags: ['water'], power: 46 },
  { name: 'Glaciär', tags: ['ice'], power: 60, scale: 58 },
  { name: 'Träsk', tags: ['water', 'nature'], power: 38 },
  { name: 'Korallrev', tags: ['water', 'aquatic', 'nature'], power: 34 },
  { name: 'Geysir', tags: ['water', 'fire'], power: 44 },
  'Grotta', 'Kanjon', 'Djungel', 'Klippa', 'Sanddyn', 'Regnskog',
];

const weather: SeedItem[] = [
  { name: 'Orkan', aliases: ['Cyklon'], tags: ['storm', 'wind', 'weather', 'disaster'], power: 84, range: 84, scale: 78 },
  { name: 'Tornado', tags: ['storm', 'wind', 'weather', 'disaster'], power: 80, range: 50, speed: 70, scale: 72 },
  { name: 'Åska', aliases: ['Åskväder'], tags: ['lightning', 'storm', 'weather', 'energy'], power: 68, speed: 96, range: 60 },
  { name: 'Blixt', tags: ['lightning', 'energy', 'weather'], power: 66, speed: 99, range: 55 },
  { name: 'Snöstorm', tags: ['ice', 'storm', 'weather'], power: 62, range: 66 },
  { name: 'Hagelstorm', tags: ['ice', 'storm', 'weather'], power: 54, range: 50 },
  'Regn', 'Dimma', 'Torka', 'Köld', 'Värmebölja', 'Monsun', 'Sandstorm', 'Frost',
];

const space: SeedItem[] = [
  { name: 'Asteroid', tags: ['asteroid', 'space'], power: 90, range: 70, scale: 88 },
  { name: 'Meteor', aliases: ['Meteorit'], tags: ['asteroid', 'space'], power: 82, speed: 80, scale: 80 },
  { name: 'Komet', tags: ['comet', 'space'], power: 84, speed: 82, scale: 82 },
  { name: 'Planet', tags: ['planet', 'space'], power: 80, scale: 90 },
  { name: 'Sol', aliases: ['Stjärna'], tags: ['star', 'space', 'fire', 'energy'], power: 96, range: 96, scale: 95 },
  { name: 'Svart hål', tags: ['blackhole', 'space', 'gravity', 'cosmic'], power: 99, range: 95, scale: 97 },
  { name: 'Supernova', tags: ['star', 'space', 'energy', 'cosmic'], power: 99, range: 98, scale: 96 },
  { name: 'Galax', tags: ['space', 'cosmic'], power: 97, scale: 96 },
  { name: 'Neutronstjärna', tags: ['star', 'space', 'gravity', 'cosmic'], power: 95, scale: 94 },
  { name: 'Solstorm', tags: ['star', 'space', 'energy', 'emp'], power: 82, range: 92, scale: 84 },
  'Måne', 'Merkurius', 'Venus', 'Mars', 'Jupiter', 'Saturnus', 'Uranus', 'Neptunus',
  'Pluto', 'Solsystem', 'Vintergatan', 'Nebulosa', 'Kvasar', 'Pulsar', 'Mörk materia',
];

const elements: SeedItem[] = [
  'Väte', 'Helium', 'Litium', 'Beryllium', 'Bor', 'Kol', 'Kväve', 'Syre', 'Fluor',
  'Neon', 'Natrium', 'Magnesium', 'Aluminium', 'Kisel', 'Fosfor', 'Svavel', 'Klor',
  'Argon', 'Kalium', 'Kalcium', 'Skandium', 'Titan', 'Vanadin', 'Krom', 'Mangan',
  'Järn', 'Kobolt', 'Nickel', 'Koppar', 'Zink', 'Gallium', 'Germanium', 'Arsenik',
  'Selen', 'Brom', 'Krypton', 'Rubidium', 'Strontium', 'Yttrium', 'Zirkonium',
  'Niob', 'Molybden', 'Teknetium', 'Rutenium', 'Rodium', 'Palladium', 'Silver',
  'Kadmium', 'Indium', 'Tenn', 'Antimon', 'Tellur', 'Jod', 'Xenon', 'Cesium',
  'Barium', 'Lantan', 'Cerium', 'Neodym', 'Samarium', 'Europium', 'Gadolinium',
  'Terbium', 'Dysprosium', 'Holmium', 'Erbium', 'Tulium', 'Ytterbium', 'Lutetium',
  'Hafnium', 'Tantal', 'Volfram', 'Renium', 'Osmium', 'Iridium', 'Platina', 'Guld',
  'Kvicksilver', 'Tallium', 'Bly', 'Vismut', 'Polonium', 'Astat', 'Radon', 'Francium',
  'Radium', 'Aktinium', 'Torium', 'Uran', 'Neptunium', 'Plutonium', 'Americium',
  'Curium', 'Berkelium', 'Californium', 'Einsteinium', 'Fermium', 'Mendelevium',
  'Nobelium', 'Lawrencium', 'Rutherfordium', 'Dubnium', 'Seaborgium', 'Bohrium',
  'Hassium', 'Meitnerium', 'Darmstadtium', 'Röntgenium', 'Copernicium', 'Nihonium',
  'Flerovium', 'Moskovium', 'Livermorium', 'Tenness', 'Oganesson',
];

const science: SeedItem[] = [
  { name: 'Antimateria', tags: ['energy', 'science', 'cosmic'], power: 94, scale: 88 },
  { name: 'Radioaktivitet', aliases: ['Strålning'], tags: ['radiation', 'energy', 'science'], power: 72, range: 60, scale: 66 },
  { name: 'Plasma', tags: ['energy', 'fire', 'science'], power: 74, scale: 62 },
  { name: 'Elektricitet', tags: ['lightning', 'energy', 'science'], power: 62, speed: 90 },
  { name: 'Magnetism', tags: ['energy', 'science'], power: 48, range: 55 },
  { name: 'Kärnreaktion', tags: ['nuclear', 'energy', 'science'], power: 90, scale: 80 },
  'Syra', 'Bas', 'Gift', 'Nervgas', 'Klorgas', 'Frätande syra', 'Sprängmedel',
  'Superledare', 'Fusion', 'Fission', 'Gravitation', 'Laser', 'Röntgenstrålning',
];

const medicine: SeedItem[] = [
  { name: 'Vaccin', tags: ['medicine'], power: 40, intelligence: 60, scale: 45 },
  { name: 'Antibiotika', tags: ['medicine'], power: 46, scale: 45 },
  { name: 'Läkare', tags: ['medicine', 'human', 'profession'], power: 30, intelligence: 72 },
  { name: 'Immunförsvar', tags: ['medicine', 'organic'], power: 44, intelligence: 50 },
  'Antikropp', 'Penicillin', 'Kemoterapi', 'Kirurg', 'Sjuksköterska', 'Motgift',
  'Antiviralt', 'Serum', 'Insulin', 'Bedövning',
];

const diseases: SeedItem[] = [
  { name: 'Virus', tags: ['virus', 'disease'], power: 60, range: 70, scale: 55 },
  { name: 'Pest', aliases: ['Digerdöden'], tags: ['disease', 'bacteria'], power: 78, range: 82, scale: 74 },
  { name: 'Pandemi', tags: ['disease', 'virus'], power: 82, range: 92, scale: 80 },
  { name: 'Bakterie', tags: ['bacteria', 'disease', 'tiny'], power: 40, range: 55 },
  { name: 'Cancer', tags: ['disease'], power: 74, scale: 60 },
  'Influensa', 'Förkylning', 'Ebola', 'Malaria', 'Kolera', 'Tuberkulos', 'Rabies',
  'Smitta', 'Parasit', 'Svampinfektion', 'Prion', 'Mögel',
];

const plants: SeedItem[] = [
  { name: 'Ek', aliases: ['Eketräd'], tags: ['tree', 'plant', 'organic'], power: 40, scale: 45 },
  { name: 'Jätteträd', aliases: ['Sekvoja'], tags: ['tree', 'plant', 'giant', 'organic'], power: 52, scale: 55 },
  { name: 'Köttätande växt', aliases: ['Flugfälla'], tags: ['plant', 'predator', 'organic'], power: 34 },
  { name: 'Giftsvamp', tags: ['plant', 'poison', 'organic'], power: 40 },
  'Ros', 'Kaktus', 'Tistel', 'Nässla', 'Murgröna', 'Bambu', 'Alger', 'Mossa',
  'Orkidé', 'Solros', 'Tulpan', 'Palm', 'Gran', 'Tall', 'Björk', 'Vinranka',
];

const buildings: SeedItem[] = [
  { name: 'Skyskrapa', tags: ['building', 'city'], power: 40, scale: 60 },
  { name: 'Borg', aliases: ['Slott'], tags: ['building', 'armored'], power: 54, scale: 58 },
  { name: 'Fästning', tags: ['building', 'armored', 'military'], power: 60, scale: 60 },
  { name: 'Pyramid', tags: ['building'], power: 46, scale: 60 },
  { name: 'Bunker', tags: ['building', 'armored', 'military'], power: 58, scale: 55 },
  { name: 'Stad', tags: ['city'], power: 44, scale: 62, size: 80 },
  { name: 'Hus', aliases: ['Byggnad'], tags: ['building'], power: 36, scale: 48 },
  'Fyr', 'Bro', 'Damm', 'Mur', 'Katedral', 'Tempel', 'Torn', 'Stadion', 'Fabrik',
];

const places: SeedItem[] = [
  { name: 'Sverige', tags: ['country'], power: 70, scale: 78 },
  { name: 'USA', tags: ['country'], power: 92, scale: 85 },
  { name: 'Kina', tags: ['country'], power: 90, scale: 85 },
  { name: 'Ryssland', tags: ['country'], power: 88, scale: 84 },
  'Norge', 'Danmark', 'Finland', 'Tyskland', 'Frankrike', 'Storbritannien',
  'Italien', 'Spanien', 'Japan', 'Indien', 'Brasilien', 'Kanada', 'Australien',
  'Egypten', 'Grekland', 'Turkiet', 'Mexiko', 'Sydkorea', 'Nordkorea', 'Iran',
  { name: 'Stockholm', tags: ['city'], power: 40, scale: 60 },
  'Göteborg', 'Malmö', 'London', 'Paris', 'New York', 'Tokyo', 'Berlin', 'Rom',
];

const history: SeedItem[] = [
  { name: 'Vikingar', tags: ['soldier', 'human', 'history'], power: 56 },
  { name: 'Romerska imperiet', tags: ['military', 'history'], power: 84, scale: 78 },
  { name: 'Gladiator', tags: ['soldier', 'human', 'history'], power: 50 },
  { name: 'Samuraj', tags: ['soldier', 'blade', 'human', 'history'], power: 58, speed: 66 },
  { name: 'Ninja', tags: ['human', 'history'], power: 50, speed: 80, intelligence: 66 },
  { name: 'Riddare', tags: ['soldier', 'blade', 'armored'], power: 58 },
  'Farao', 'Kejsare', 'Kung', 'Drottning', 'Korsriddare', 'Mongolarmé', 'Spartan',
  'Pirat', 'Cowboy', 'Riddarorden',
];

const mythology: SeedItem[] = [
  { name: 'Zeus', tags: ['god', 'lightning', 'mythology'], power: 92, range: 80, scale: 90 },
  { name: 'Oden', tags: ['god', 'mythology', 'magic'], power: 90, intelligence: 88, scale: 90 },
  { name: 'Tor', aliases: ['Thor'], tags: ['god', 'lightning', 'mythology'], power: 90, scale: 88 },
  { name: 'Hades', tags: ['god', 'mythology', 'undead'], power: 88, scale: 88 },
  { name: 'Poseidon', tags: ['god', 'water', 'mythology'], power: 88, range: 80, scale: 88 },
  { name: 'Loke', tags: ['god', 'mythology', 'magic'], power: 70, intelligence: 92, scale: 84 },
  { name: 'Kraken', tags: ['monster', 'aquatic', 'mythology', 'giant'], power: 82, scale: 76 },
  { name: 'Medusa', tags: ['monster', 'mythology', 'magic'], power: 66, scale: 60 },
  { name: 'Minotaur', tags: ['monster', 'mythology'], power: 68 },
  { name: 'Fenix', aliases: ['Fågel Fenix'], tags: ['monster', 'fire', 'mythology', 'flying', 'legendary'], power: 80, scale: 72 },
  { name: 'Titan', tags: ['titan', 'mythology', 'giant'], power: 90, scale: 86 },
  'Cyklop', 'Kentaur', 'Sfinx', 'Hydra', 'Cerberus', 'Valkyria', 'Jätte',
  'Troll', 'Nymf', 'Grip', 'Basilisk', 'Banshee', 'Genie', 'Golem', 'Anubis',
];

const fantasy: SeedItem[] = [
  { name: 'Drake', tags: ['dragon', 'fantasy', 'fire', 'flying', 'legendary'], power: 88, scale: 80 },
  { name: 'Vålnad', aliases: ['Spöke'], tags: ['undead', 'fantasy', 'magic'], power: 40, intelligence: 50 },
  { name: 'Zombie', tags: ['undead', 'fantasy'], power: 30, speed: 20 },
  { name: 'Vampyr', tags: ['undead', 'fantasy', 'predator'], power: 62, speed: 70, intelligence: 66 },
  { name: 'Varulv', tags: ['monster', 'fantasy', 'predator'], power: 66, speed: 72 },
  { name: 'Demon', tags: ['demon', 'fantasy', 'magic'], power: 78, scale: 74 },
  { name: 'Ängel', tags: ['fantasy', 'magic', 'flying'], power: 80, scale: 78 },
  { name: 'Enhörning', tags: ['fantasy', 'magic'], power: 52 },
  { name: 'Jätte', tags: ['giant', 'fantasy'], power: 74, scale: 66 },
  'Alv', 'Dvärg', 'Ork', 'Goblin', 'Häxa', 'Nekromant', 'Lich', 'Golem',
  'Gargoyle', 'Feniks', 'Chimera', 'Behemoth', 'Leviatan',
];

const magic: SeedItem[] = [
  { name: 'Trollkarl', aliases: ['Magiker'], tags: ['wizard', 'magic', 'human'], power: 74, intelligence: 84, scale: 70 },
  { name: 'Häxa', tags: ['wizard', 'magic'], power: 68, intelligence: 80 },
  { name: 'Besvärjelse', tags: ['magic'], power: 60, range: 60 },
  { name: 'Förbannelse', tags: ['magic'], power: 64, range: 55 },
  'Magisk stav', 'Kristallkula', 'Trollformel', 'Portal', 'Osynlighet',
  'Teleportering', 'Tidsstopp', 'Själamagi', 'Eldklot', 'Frostnova',
];

const heroes: SeedItem[] = [
  { name: 'Superman', tags: ['superhero', 'flying', 'legendary'], power: 96, scale: 84 },
  { name: 'Hulken', tags: ['superhero', 'giant', 'mutant'], power: 94, scale: 78 },
  { name: 'Thor', tags: ['superhero', 'god', 'lightning'], power: 92, scale: 86 },
  { name: 'Iron Man', tags: ['superhero', 'robot', 'technology', 'flying'], power: 82, intelligence: 88 },
  { name: 'Spindelmannen', aliases: ['Spider-Man'], tags: ['superhero'], power: 68, speed: 80 },
  { name: 'Batman', tags: ['superhero', 'human'], power: 60, intelligence: 90 },
  { name: 'Wonder Woman', tags: ['superhero', 'god'], power: 88 },
  { name: 'Flash', tags: ['superhero'], power: 70, speed: 99 },
  { name: 'Doctor Strange', tags: ['superhero', 'wizard', 'magic'], power: 86, intelligence: 92, scale: 80 },
  'Captain America', 'Black Panther', 'Aquaman', 'Green Lantern', 'Wolverine',
  'Storm', 'Professor X', 'Silver Surfer', 'Captain Marvel', 'Scarlet Witch',
];

const villains: SeedItem[] = [
  { name: 'Thanos', tags: ['villain', 'cosmic', 'titan'], power: 96, scale: 90 },
  { name: 'Joker', tags: ['villain', 'human'], power: 44, intelligence: 84 },
  { name: 'Darth Vader', tags: ['villain', 'magic'], power: 82, intelligence: 80 },
  { name: 'Sauron', tags: ['villain', 'magic', 'legendary'], power: 88, scale: 82 },
  { name: 'Voldemort', tags: ['villain', 'wizard', 'magic'], power: 84, intelligence: 86, scale: 76 },
  { name: 'Galactus', tags: ['villain', 'cosmic', 'entity', 'giant'], power: 98, scale: 94 },
  'Magneto', 'Loki', 'Ultron', 'Doctor Doom', 'Green Goblin', 'Venom', 'Darkseid',
  'Lex Luthor', 'Frieza', 'Bowser', 'Ganon', 'Sephiroth',
];

const pokemon: SeedItem[] = [
  { name: 'Pikachu', tags: ['pokemon', 'lightning'], power: 50, speed: 70 },
  { name: 'Charizard', tags: ['pokemon', 'fire', 'dragon', 'flying'], power: 82, scale: 60 },
  { name: 'Blastoise', tags: ['pokemon', 'water'], power: 78 },
  { name: 'Venusaur', tags: ['pokemon', 'plant', 'poison'], power: 76 },
  { name: 'Mewtwo', tags: ['pokemon', 'legendary'], power: 94, intelligence: 92, scale: 74 },
  { name: 'Mew', tags: ['pokemon', 'legendary'], power: 90, scale: 72 },
  { name: 'Gyarados', tags: ['pokemon', 'water', 'dragon'], power: 80 },
  { name: 'Gengar', tags: ['pokemon', 'undead', 'poison'], power: 70 },
  { name: 'Dragonite', tags: ['pokemon', 'dragon', 'flying'], power: 84 },
  { name: 'Snorlax', tags: ['pokemon', 'giant'], power: 72 },
  'Bulbasaur', 'Ivysaur', 'Charmander', 'Charmeleon', 'Squirtle', 'Wartortle',
  'Caterpie', 'Butterfree', 'Pidgey', 'Rattata', 'Ekans', 'Sandshrew', 'Nidoking',
  'Clefairy', 'Vulpix', 'Ninetales', 'Jigglypuff', 'Zubat', 'Golbat', 'Oddish',
  'Gloom', 'Vileplume', 'Paras', 'Venonat', 'Diglett', 'Meowth', 'Psyduck',
  'Golduck', 'Mankey', 'Primeape', 'Growlithe', 'Arcanine', 'Poliwag', 'Abra',
  'Kadabra', 'Alakazam', 'Machop', 'Machamp', 'Bellsprout', 'Tentacool', 'Geodude',
  'Graveler', 'Golem', 'Ponyta', 'Rapidash', 'Slowpoke', 'Magnemite', 'Doduo',
  'Seel', 'Grimer', 'Muk', 'Shellder', 'Gastly', 'Haunter', 'Onix', 'Drowzee',
  'Krabby', 'Voltorb', 'Electrode', 'Exeggcute', 'Cubone', 'Marowak', 'Hitmonlee',
  'Hitmonchan', 'Lickitung', 'Koffing', 'Weezing', 'Rhyhorn', 'Rhydon', 'Chansey',
  'Tangela', 'Kangaskhan', 'Horsea', 'Goldeen', 'Staryu', 'Starmie', 'Scyther',
  'Jynx', 'Electabuzz', 'Magmar', 'Pinsir', 'Tauros', 'Magikarp', 'Lapras',
  'Ditto', 'Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Porygon', 'Omanyte',
  'Kabuto', 'Aerodactyl', 'Articuno', 'Zapdos', 'Moltres', 'Dratini', 'Dragonair',
];

const food: SeedItem[] = [
  'Pizza', 'Hamburgare', 'Korv', 'Köttbullar', 'Tacos', 'Sushi', 'Pasta', 'Kebab',
  'Banan', 'Äpple', 'Apelsin', 'Chili', 'Vitlök', 'Ost', 'Choklad', 'Kaffe',
  'Glass', 'Ägg', 'Bröd', 'Soppa', 'Ramen', 'Falukorv', 'Surströmming', 'Ketchup',
];

const professions: SeedItem[] = [
  { name: 'Jägare', tags: ['hunter', 'human', 'profession'], power: 50, intelligence: 60 },
  { name: 'Brandman', tags: ['human', 'profession', 'water'], power: 44 },
  { name: 'Polis', tags: ['human', 'profession', 'firearm'], power: 46 },
  { name: 'Hackare', aliases: ['Hacker'], tags: ['hacker', 'human', 'profession', 'internet'], power: 40, intelligence: 84, range: 70 },
  { name: 'Vetenskapsman', tags: ['human', 'profession', 'science'], power: 30, intelligence: 88 },
  'Kock', 'Lärare', 'Advokat', 'Domare', 'Bonde', 'Snickare', 'Pilot', 'Astronaut',
  'Detektiv', 'Spion', 'Boxare', 'Brottare', 'Programmerare', 'Ingenjör',
];

const sports: SeedItem[] = [
  'Boxare', 'MMA-fighter', 'Brottare', 'Sumobrottare', 'Karateka', 'Löpare',
  'Fotbollsspelare', 'Ishockeyspelare', 'Tyngdlyftare', 'Gymnast', 'Fäktare',
];

const music: SeedItem[] = [
  'Rockstjärna', 'Operasångare', 'DJ', 'Trumslagare', 'Basljud', 'Ljudvåg',
  'Ultraljud', 'Infraljud', 'Megafon',
];

const internet: SeedItem[] = [
  { name: 'Datavirus', aliases: ['Datorvirus'], tags: ['virus', 'internet', 'technology', 'electronic'], power: 56, range: 80 },
  { name: 'Trojan', tags: ['internet', 'technology', 'electronic'], power: 50, intelligence: 60 },
  { name: 'Ransomware', tags: ['internet', 'technology', 'electronic'], power: 60, range: 78 },
  'Meme', 'Troll', 'Botnät', 'DDoS-attack', 'Nätfiske', 'Mask', 'Spam',
  'Sociala medier', 'Deepfake',
];

const materials: SeedItem[] = [
  { name: 'Diamant', tags: ['material', 'armored'], power: 40, scale: 40 },
  { name: 'Stål', tags: ['metal', 'material', 'armored'], power: 50 },
  { name: 'Titanlegering', tags: ['metal', 'material', 'armored'], power: 56 },
  { name: 'Adamantium', tags: ['metal', 'material', 'armored', 'legendary'], power: 80 },
  { name: 'Vibranium', tags: ['metal', 'material', 'armored', 'legendary'], power: 82 },
  'Betong', 'Glas', 'Gummi', 'Kevlar', 'Grafen', 'Bly', 'Magma', 'Lava',
];

const energy: SeedItem[] = [
  { name: 'Kärnenergi', tags: ['nuclear', 'energy'], power: 88, scale: 78 },
  { name: 'Solenergi', tags: ['energy', 'star'], power: 60 },
  { name: 'Laserstråle', tags: ['energy'], power: 74, speed: 99, range: 80 },
  'Vindkraft', 'Vattenkraft', 'Fusionsenergi', 'Statisk elektricitet', 'Värme',
];

const concepts: SeedItem[] = [
  { name: 'Tid', tags: ['time', 'concept', 'abstract'], power: 92, scale: 92 },
  { name: 'Rymden', aliases: ['Universum'], tags: ['space', 'cosmic', 'concept'], power: 96, scale: 97 },
  { name: 'Verkligheten', tags: ['reality', 'concept', 'abstract'], power: 98, scale: 98 },
  { name: 'Oändligheten', tags: ['concept', 'abstract', 'cosmic'], power: 97, scale: 97 },
  { name: 'Döden', tags: ['concept', 'abstract', 'entity'], power: 96, scale: 94 },
  { name: 'Kaos', tags: ['concept', 'abstract'], power: 88, scale: 82 },
  { name: 'Kärlek', tags: ['concept', 'abstract'], power: 60, scale: 60 },
  { name: 'Logik', tags: ['concept', 'abstract'], power: 66, intelligence: 90 },
  { name: 'Entropi', tags: ['concept', 'abstract', 'cosmic'], power: 90, scale: 90 },
  'Tanke', 'Idé', 'Sanning', 'Tur', 'Öde', 'Fantasi', 'Drömmar',
];

const cosmic: SeedItem[] = [
  { name: 'Gud', tags: ['god', 'entity', 'cosmic', 'reality'], power: 100, scale: 100 },
  { name: 'Skaparen', aliases: ['Författaren'], tags: ['entity', 'reality', 'cosmic'], power: 100, scale: 100 },
  { name: 'Verklighetsböjare', tags: ['reality', 'entity', 'cosmic', 'magic'], power: 99, scale: 99 },
  { name: 'Kosmisk entitet', tags: ['entity', 'cosmic', 'space'], power: 98, scale: 97 },
  { name: 'Multiversum', tags: ['reality', 'cosmic', 'space'], power: 99, scale: 99 },
  { name: 'Singularitet', tags: ['blackhole', 'cosmic', 'gravity'], power: 98, scale: 96 },
  'Big Bang', 'Big Crunch', 'Tidsparadox', 'Simuleringen',
];

// ---------------------------------------------------------------------------
// Category profiles
// ---------------------------------------------------------------------------

const S = (power: number, speed: number, range: number, intelligence: number): Stats => ({
  power,
  speed,
  range,
  intelligence,
});

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    profile: {
      category: 'animals',
      baseTags: ['animal', 'organic', 'living'],
      stats: S(34, 50, 18, 24),
      scale: 25,
      variants: ['universal', 'elemental', 'dark', 'stone'],
      flavor: [
        '{name} är ett djur som förlitar sig på instinkt och råstyrka.',
        '{name} har överlevt genom evolutionens obarmhärtiga urval.',
        '{name} är en varelse av kött och blod med skarpa sinnen.',
      ],
    },
    items: normalize(animals),
  },
  {
    profile: {
      category: 'weapons',
      baseTags: ['weapon'],
      stats: S(48, 40, 40, 10),
      scale: 40,
      variants: ['universal', 'tech'],
      flavor: [
        '{name} är ett vapen skapat för att skada och förstöra.',
        '{name} ger sin bärare ett övertag i strid.',
      ],
    },
    items: normalize(weapons),
  },
  {
    profile: {
      category: 'military',
      baseTags: ['military'],
      stats: S(64, 55, 55, 45),
      scale: 60,
      variants: ['universal', 'tech'],
      flavor: [
        '{name} är en del av en modern militärmakt.',
        '{name} är byggd för krig och total dominans.',
      ],
    },
    items: normalize(military),
  },
  {
    profile: {
      category: 'technology',
      baseTags: ['technology', 'electronic'],
      stats: S(40, 55, 45, 70),
      scale: 50,
      variants: ['universal', 'tech'],
      flavor: [
        '{name} representerar spjutspetsen av mänsklig teknologi.',
        '{name} drivs av kretsar, kod och beräkningskraft.',
      ],
    },
    items: normalize(technology),
  },
  {
    profile: {
      category: 'vehicles',
      baseTags: ['vehicle', 'machine'],
      stats: S(44, 62, 30, 20),
      scale: 45,
      variants: ['universal', 'tech'],
      flavor: [
        '{name} förflyttar sig snabbt och kan krossa allt i sin väg.',
        '{name} är en maskin byggd för rörelse och kraft.',
      ],
    },
    items: normalize(vehicles),
  },
  {
    profile: {
      category: 'nature',
      baseTags: ['nature'],
      stats: S(58, 20, 55, 10),
      scale: 60,
      variants: ['universal'],
      flavor: [
        '{name} är en naturkraft som människan inte kan tämja.',
        '{name} formar planeten över årtusenden.',
      ],
    },
    items: normalize(nature),
  },
  {
    profile: {
      category: 'weather',
      baseTags: ['weather'],
      stats: S(60, 60, 60, 5),
      scale: 62,
      variants: ['universal'],
      flavor: [
        '{name} sveper fram och lämnar förödelse efter sig.',
        '{name} är en väderkraft utan nåd.',
      ],
    },
    items: normalize(weather),
  },
  {
    profile: {
      category: 'space',
      baseTags: ['space'],
      stats: S(78, 55, 70, 5),
      scale: 85,
      variants: ['universal'],
      flavor: [
        '{name} härskar över den kalla, oändliga rymden.',
        '{name} bär på krafter bortom mänsklig fattning.',
      ],
    },
    items: normalize(space),
  },
  {
    profile: {
      category: 'elements',
      baseTags: ['element', 'chemical', 'material'],
      stats: S(36, 30, 20, 5),
      scale: 35,
      variants: ['universal'],
      flavor: [
        '{name} är ett grundämne i det periodiska systemet.',
        '{name} är en av materiens byggstenar.',
      ],
    },
    items: normalize(elements),
  },
  {
    profile: {
      category: 'science',
      baseTags: ['science', 'energy'],
      stats: S(60, 60, 50, 40),
      scale: 60,
      variants: ['universal'],
      flavor: [
        '{name} är ett fenomen som vetenskapen både fruktar och utnyttjar.',
        '{name} bär på enorm energi.',
      ],
    },
    items: normalize(science),
  },
  {
    profile: {
      category: 'medicine',
      baseTags: ['medicine', 'science'],
      stats: S(36, 40, 40, 60),
      scale: 45,
      variants: ['universal'],
      flavor: [
        '{name} står i frontlinjen mot sjukdom och död.',
        '{name} är mänsklighetens svar på biologiska hot.',
      ],
    },
    items: normalize(medicine),
  },
  {
    profile: {
      category: 'diseases',
      baseTags: ['disease', 'organic'],
      stats: S(58, 45, 65, 15),
      scale: 55,
      variants: ['universal'],
      flavor: [
        '{name} sprider sig obemärkt och skördar liv.',
        '{name} är ett osynligt biologiskt hot.',
      ],
    },
    items: normalize(diseases),
  },
  {
    profile: {
      category: 'plants',
      baseTags: ['plant', 'organic', 'living', 'nature'],
      stats: S(30, 10, 30, 8),
      scale: 30,
      variants: ['universal', 'elemental', 'dark'],
      flavor: [
        '{name} växer tåligt och envist.',
        '{name} är en del av naturens gröna rike.',
      ],
    },
    items: normalize(plants),
  },
  {
    profile: {
      category: 'buildings',
      baseTags: ['building'],
      stats: S(44, 2, 20, 5),
      scale: 55,
      variants: ['universal'],
      flavor: [
        '{name} reser sig som ett monument av sten och stål.',
        '{name} är byggd för att stå emot tidens tand.',
      ],
    },
    items: normalize(buildings),
  },
  {
    profile: {
      category: 'places',
      baseTags: ['country'],
      stats: S(74, 20, 70, 55),
      scale: 78,
      variants: ['universal'],
      flavor: [
        '{name} har enorma resurser och befolkning.',
        '{name} är en mäktig plats på världskartan.',
      ],
    },
    items: normalize(places),
  },
  {
    profile: {
      category: 'history',
      baseTags: ['human', 'history'],
      stats: S(56, 55, 40, 55),
      scale: 50,
      variants: ['universal', 'dark'],
      flavor: [
        '{name} lämnade avtryck i historien.',
        '{name} är känd för mod och styrka genom tiderna.',
      ],
    },
    items: normalize(history),
  },
  {
    profile: {
      category: 'mythology',
      baseTags: ['mythology'],
      stats: S(72, 55, 55, 55),
      scale: 72,
      variants: ['universal', 'dark', 'elemental'],
      flavor: [
        '{name} är en gestalt ur mytologins värld.',
        '{name} bär på uråldrig, övernaturlig kraft.',
      ],
    },
    items: normalize(mythology),
  },
  {
    profile: {
      category: 'fantasy',
      baseTags: ['fantasy'],
      stats: S(64, 55, 45, 45),
      scale: 60,
      variants: ['universal', 'dark', 'elemental'],
      flavor: [
        '{name} kommer från sagornas och fantasins rike.',
        '{name} existerar bortom vår verklighet.',
      ],
    },
    items: normalize(fantasy),
  },
  {
    profile: {
      category: 'magic',
      baseTags: ['magic'],
      stats: S(62, 60, 60, 70),
      scale: 66,
      variants: ['universal', 'dark'],
      flavor: [
        '{name} böjer verklighetens regler med magi.',
        '{name} kanaliserar krafter som trotsar naturlagarna.',
      ],
    },
    items: normalize(magic),
  },
  {
    profile: {
      category: 'heroes',
      baseTags: ['superhero'],
      stats: S(78, 70, 55, 65),
      scale: 74,
      variants: ['universal'],
      flavor: [
        '{name} kämpar för det goda med extraordinära krafter.',
        '{name} är en legendarisk hjälte.',
      ],
    },
    items: normalize(heroes),
  },
  {
    profile: {
      category: 'villains',
      baseTags: ['villain'],
      stats: S(80, 62, 60, 80),
      scale: 78,
      variants: ['universal'],
      flavor: [
        '{name} sprider skräck med sina onda planer.',
        '{name} är en av de mäktigaste skurkarna som finns.',
      ],
    },
    items: normalize(villains),
  },
  {
    profile: {
      category: 'pokemon',
      baseTags: ['pokemon', 'animal'],
      stats: S(58, 58, 40, 40),
      scale: 50,
      variants: ['universal', 'elemental'],
      flavor: [
        '{name} är en Pokémon redo för strid.',
        '{name} kan utvecklas och lära sig kraftfulla attacker.',
      ],
    },
    items: normalize(pokemon),
  },
  {
    profile: {
      category: 'food',
      baseTags: ['food', 'organic'],
      stats: S(10, 10, 10, 2),
      scale: 12,
      variants: ['universal', 'elemental'],
      flavor: [
        '{name} är egentligen bara mat – men allt kan bli ett vapen.',
        '{name} lockar magar men vinner sällan dueller.',
      ],
    },
    items: normalize(food),
  },
  {
    profile: {
      category: 'professions',
      baseTags: ['human', 'profession'],
      stats: S(42, 45, 35, 60),
      scale: 40,
      variants: ['universal'],
      flavor: [
        '{name} bemästrar sitt yrke till fulländning.',
        '{name} löser problem med kunskap och skicklighet.',
      ],
    },
    items: normalize(professions),
  },
  {
    profile: {
      category: 'sports',
      baseTags: ['human', 'sport'],
      stats: S(50, 60, 20, 35),
      scale: 35,
      variants: ['universal'],
      flavor: [
        '{name} har tränat kroppen till perfektion.',
        '{name} är i toppform och redo för utmaningar.',
      ],
    },
    items: normalize(sports),
  },
  {
    profile: {
      category: 'music',
      baseTags: ['music', 'energy'],
      stats: S(30, 70, 60, 30),
      scale: 35,
      variants: ['universal'],
      flavor: [
        '{name} slår an toner som kan få marken att skaka.',
        '{name} bär kraften i ljud och vibration.',
      ],
    },
    items: normalize(music),
  },
  {
    profile: {
      category: 'internet',
      baseTags: ['internet', 'technology', 'electronic'],
      stats: S(45, 85, 75, 60),
      scale: 50,
      variants: ['universal', 'tech'],
      flavor: [
        '{name} sprider sig blixtsnabbt genom nätet.',
        '{name} är ett digitalt hot i cyberrymden.',
      ],
    },
    items: normalize(internet),
  },
  {
    profile: {
      category: 'materials',
      baseTags: ['material'],
      stats: S(44, 5, 15, 5),
      scale: 40,
      variants: ['universal'],
      flavor: [
        '{name} är känt för sin hållfasthet.',
        '{name} används för att bygga och skydda.',
      ],
    },
    items: normalize(materials),
  },
  {
    profile: {
      category: 'energy',
      baseTags: ['energy'],
      stats: S(68, 80, 60, 20),
      scale: 62,
      variants: ['universal'],
      flavor: [
        '{name} är ren, obändig kraft.',
        '{name} kan driva städer – eller förinta dem.',
      ],
    },
    items: normalize(energy),
  },
  {
    profile: {
      category: 'concepts',
      baseTags: ['concept', 'abstract'],
      stats: S(80, 70, 80, 80),
      scale: 88,
      variants: [],
      flavor: [
        '{name} är ett abstrakt begrepp som styr själva tillvaron.',
        '{name} kan inte röras, men påverkar allt.',
      ],
    },
    items: normalize(concepts),
  },
  {
    profile: {
      category: 'cosmic',
      baseTags: ['cosmic', 'entity'],
      stats: S(98, 80, 90, 90),
      scale: 98,
      variants: [],
      flavor: [
        '{name} står på toppen av tillvarons hierarki.',
        '{name} kan omforma verkligheten efter behag.',
      ],
    },
    items: normalize(cosmic),
  },
];
