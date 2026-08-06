// Heuristic tag inference for words that are not in the database, so the game
// can reason about "any" word. Maps Swedish keywords/substrings to tags.

interface Rule {
  match: string[];
  tags: string[];
}

const RULES: Rule[] = [
  { match: ['eld', 'brand', 'lava', 'flam', 'glöd', 'inferno'], tags: ['fire', 'energy'] },
  { match: ['vatten', 'hav', 'sjö', 'flod', 'våg', 'regn', 'ocean'], tags: ['water'] },
  { match: ['is', 'frost', 'snö', 'kyla', 'glaciär'], tags: ['ice'] },
  { match: ['blixt', 'åska', 'elektr', 'volt', 'ström'], tags: ['lightning', 'energy'] },
  { match: ['gift', 'toxin', 'syra', 'gas'], tags: ['poison'] },
  { match: ['robot', 'maskin', 'mekan', 'droid', 'automat'], tags: ['robot', 'machine', 'technology', 'electronic'] },
  { match: ['dator', 'digital', 'cyber', 'program', 'kod', 'app'], tags: ['computer', 'technology', 'electronic'] },
  { match: ['hack', 'virus', 'malware', 'trojan'], tags: ['hacker', 'internet', 'technology'] },
  { match: ['bomb', 'spräng', 'explos', 'dynamit', 'granat'], tags: ['explosive', 'weapon'] },
  { match: ['kärnvapen', 'atom', 'nukleär', 'kärn'], tags: ['nuclear', 'explosive', 'weapon'] },
  { match: ['vapen', 'gevär', 'pistol', 'kanon', 'kula'], tags: ['weapon', 'firearm'] },
  { match: ['svärd', 'kniv', 'yxa', 'klinga', 'egg'], tags: ['weapon', 'blade'] },
  { match: ['drake', 'dragon'], tags: ['dragon', 'fire', 'flying'] },
  { match: ['gud', 'gudinna', 'deus', 'god'], tags: ['god', 'entity'] },
  { match: ['demon', 'djävul', 'satan'], tags: ['demon', 'magic'] },
  { match: ['spöke', 'vålnad', 'ande', 'odöd', 'zombie', 'vampyr'], tags: ['undead', 'magic'] },
  { match: ['häx', 'troll', 'magi', 'besvärj', 'förbann'], tags: ['magic', 'wizard'] },
  { match: ['orm', 'ödla', 'reptil', 'krokodil', 'dinosaurie'], tags: ['reptile', 'animal', 'predator'] },
  { match: ['fågel', 'örn', 'hök', 'falk', 'korp'], tags: ['bird', 'animal', 'flying'] },
  { match: ['fisk', 'haj', 'val', 'bläckfisk'], tags: ['fish', 'animal', 'aquatic'] },
  { match: ['insekt', 'myra', 'bi', 'geting', 'spindel', 'skalbagge'], tags: ['insect', 'animal'] },
  { match: ['björn', 'lejon', 'tiger', 'varg', 'räv', 'katt', 'hund'], tags: ['animal', 'predator', 'mammal'] },
  { match: ['virus', 'bakterie', 'pest', 'sjukdom', 'smitta', 'pandemi'], tags: ['disease', 'virus', 'organic'] },
  { match: ['medicin', 'vaccin', 'läkare', 'antibiotika'], tags: ['medicine'] },
  { match: ['asteroid', 'meteor', 'komet'], tags: ['asteroid', 'space'] },
  { match: ['planet', 'måne', 'jorden'], tags: ['planet', 'space'] },
  { match: ['stjärna', 'sol', 'supernova'], tags: ['star', 'space', 'energy'] },
  { match: ['svart hål', 'svarthål', 'singularitet'], tags: ['blackhole', 'cosmic', 'gravity'] },
  { match: ['kosmos', 'universum', 'galax', 'rymd'], tags: ['cosmic', 'space'] },
  { match: ['tid', 'evighet', 'oändlig'], tags: ['time', 'concept', 'abstract'] },
  { match: ['verklighet', 'realitet', 'dimension'], tags: ['reality', 'concept', 'abstract'] },
  { match: ['storm', 'orkan', 'tornado', 'cyklon'], tags: ['storm', 'wind', 'weather'] },
  { match: ['vulkan', 'jordbävning', 'tsunami', 'katastrof'], tags: ['disaster', 'nature'] },
  { match: ['berg', 'sten', 'klippa', 'jord'], tags: ['earth', 'nature'] },
  { match: ['växt', 'träd', 'blomma', 'skog', 'svamp'], tags: ['plant', 'organic', 'nature'] },
  { match: ['tank', 'stridsvagn', 'pansar'], tags: ['tank', 'vehicle', 'military', 'armored'] },
  { match: ['flygplan', 'jet', 'plan'], tags: ['aircraft', 'vehicle', 'flying'] },
  { match: ['bil', 'lastbil', 'fordon', 'tåg'], tags: ['vehicle', 'machine'] },
  { match: ['soldat', 'armé', 'krigare', 'militär'], tags: ['military', 'soldier', 'human'] },
  { match: ['jägare', 'jakt'], tags: ['hunter', 'human'] },
  { match: ['kung', 'kejsare', 'drottning', 'farao'], tags: ['human', 'legendary'] },
  { match: ['människa', 'man', 'kvinna', 'person'], tags: ['human'] },
  { match: ['metall', 'stål', 'järn', 'diamant'], tags: ['metal', 'material', 'armored'] },
  { match: ['jätte', 'titan', 'gigant', 'kolossal'], tags: ['giant'] },
  { match: ['hjälte', 'superhjälte'], tags: ['superhero'] },
  { match: ['skurk', 'ond'], tags: ['villain'] },
];

export interface Inference {
  tags: string[];
  power: number;
  speed: number;
  range: number;
  intelligence: number;
  scale: number;
}

export function inferFromWord(word: string): Inference {
  const w = word.toLowerCase();
  const tags = new Set<string>();
  for (const rule of RULES) {
    if (rule.match.some((m) => w.includes(m))) {
      for (const t of rule.tags) tags.add(t);
    }
  }
  const tagList = [...tags];
  // Give inferred entries moderate, slightly generous stats so a plausible
  // word is not unfairly punished, but a truly unknown word stays neutral.
  const cosmic = tagList.some((t) => ['cosmic', 'entity', 'reality', 'blackhole', 'god'].includes(t));
  const base = cosmic ? 92 : tagList.length > 0 ? 52 : 45;
  return {
    tags: tagList,
    power: base,
    speed: 50,
    range: cosmic ? 85 : 45,
    intelligence: 50,
    scale: cosmic ? 95 : tagList.length > 0 ? 50 : 45,
  };
}
