// Large curated data package ("mega" source) of real, playable Swedish words
// and concepts across every major category. Pure verified entries (no
// artificial variants). Category profiles assign sensible tags/stats so plain
// names are still logically connected for the judge.

import type { Stats } from '../types.js';
import type { CategoryProfile, Seed, SeedCategory, SeedItem, VariantGroup } from './seeds.js';

const S = (power: number, speed: number, range: number, intelligence: number): Stats => ({
  power,
  speed,
  range,
  intelligence,
});

function block(
  category: string,
  baseTags: string[],
  stats: Stats,
  scale: number,
  flavor: string[],
  items: SeedItem[],
  variants: VariantGroup[] = [],
): SeedCategory {
  const profile: CategoryProfile = { category, baseTags, stats, scale, variants, flavor };
  const norm: Seed[] = items.map((i) => (typeof i === 'string' ? { name: i } : i));
  return { source: 'mega', profile, items: norm };
}

// --- Animals --------------------------------------------------------------
const mammals: SeedItem[] = [
  'Gepard', 'Leopard', 'Jaguar', 'Puma', 'Lodjur', 'Ozelot', 'Serval', 'Karakal', 'Snöleopard',
  'Grizzlybjörn', 'Isbjörn', 'Brunbjörn', 'Svartbjörn', 'Pandabjörn', 'Läppbjörn', 'Solbjörn',
  'Prärievarg', 'Schakal', 'Dingo', 'Fjällräv', 'Ökenräv', 'Mårdhund', 'Järv', 'Mård', 'Iller',
  'Vessla', 'Hermelin', 'Skunk', 'Tvättbjörn', 'Näbbdjur', 'Myrpiggsvin', 'Bältdjur', 'Pangolin',
  'Manat', 'Dugong', 'Sjöko', 'Narval', 'Vitval', 'Kaskelot', 'Knölval', 'Grindval', 'Tumlare',
  'Delfin', 'Öronsäl', 'Vikaresäl', 'Sjölejon', 'Havsutter', 'Bäverråtta', 'Bisamråtta',
  'Lämmel', 'Sork', 'Näbbmus', 'Hasselmus', 'Flygekorre', 'Jordekorre', 'Murmeldjur', 'Präriehund',
  'Chinchilla', 'Marsvin', 'Hamster', 'Ökenråtta', 'Piggsvin', 'Igelkott', 'Mullvad', 'Näsbjörn',
  'Kapybara', 'Vattensork', 'Fladdermöss', 'Flyghund', 'Vampyrfladdermus', 'Lemur', 'Loris',
  'Galago', 'Silkesapa', 'Kapucinapa', 'Vråapa', 'Näsapa', 'Gibbon', 'Mandrill', 'Bavian',
  'Makak', 'Bonobo', 'Dvärgschimpans', 'Sengångare', 'Vombat', 'Koala', 'Pungvarg', 'Pungräv',
  'Kvokka', 'Bandikot', 'Wallaby', 'Trädkänguru', 'Näbbmyrslok', 'Aardvark', 'Jordsvin', 'Tapir',
  'Pekari', 'Vårtsvin', 'Flodsvin', 'Babirussa', 'Dromedar', 'Alpacka', 'Vikunja', 'Guanaco',
  'Myskoxe', 'Jak', 'Vattenbuffel', 'Gaur', 'Banteng', 'Impala', 'Gasell', 'Springbock', 'Kudu',
  'Eland', 'Oryx', 'Gemsbock', 'Stenbock', 'Mufflon', 'Argali', 'Markhor', 'Takin', 'Saiga',
  'Springpudu', 'Dovhjort', 'Kronhjort', 'Vitsvanshjort', 'Rådjur', 'Vapiti', 'Karibu', 'Sambar',
  'Muntjak', 'Okapi', 'Kvagga', 'Przewalskihäst', 'Zebroid', 'Mula', 'Ponny', 'Shetlandsponny',
];

const birds: SeedItem[] = [
  { name: 'Havsörn', tags: ['predator'], power: 44 }, { name: 'Kungsörn', tags: ['predator'], power: 44 },
  { name: 'Fiskgjuse', tags: ['predator'] }, { name: 'Vråk', tags: ['predator'] },
  { name: 'Glada', tags: ['predator'] }, { name: 'Sparvhök', tags: ['predator'] },
  { name: 'Duvhök', tags: ['predator'] }, { name: 'Tornfalk', tags: ['predator'] },
  { name: 'Pilgrimsfalk', tags: ['predator'], speed: 92 }, { name: 'Berguv', tags: ['predator'] },
  { name: 'Hornuggla', tags: ['predator'] }, { name: 'Snöuggla', tags: ['predator'] },
  { name: 'Kattuggla', tags: ['predator'] }, { name: 'Slaguggla', tags: ['predator'] },
  'Bivråk', 'Ormvråk', 'Fjällvråk', 'Brun kärrhök', 'Blå kärrhök', 'Lärkfalk', 'Stenfalk',
  'Kaja', 'Råka', 'Nötkråka', 'Nötskrika', 'Lavskrika', 'Sädesärla', 'Forsärla', 'Gulärla',
  'Rödhake', 'Blåhake', 'Näktergal', 'Stare', 'Sidensvans', 'Trädkrypare', 'Nötväcka',
  'Entita', 'Talltita', 'Tofsmes', 'Svartmes', 'Kungsfågel', 'Grönsiska', 'Grönfink', 'Bofink',
  'Bergfink', 'Gulsparv', 'Sävsparv', 'Ortolansparv', 'Snösparv', 'Lappsparv', 'Järnsparv',
  'Rödstjärt', 'Buskskvätta', 'Stenskvätta', 'Ringtrast', 'Björktrast', 'Rödvingetrast', 'Dubbeltrast',
  'Taltrast', 'Gärdsmyg', 'Backsvala', 'Ladusvala', 'Hussvala', 'Tornseglare', 'Göktyta',
  'Gröngöling', 'Spillkråka', 'Större hackspett', 'Tretåig hackspett', 'Kungsfiskare', 'Härfågel',
  'Biätare', 'Fasan', 'Rapphöna', 'Vaktel', 'Järpe', 'Dalripa', 'Fjällripa', 'Storlom', 'Smålom',
  'Skäggdopping', 'Storskarv', 'Häger', 'Rördrom', 'Vit stork', 'Svart stork', 'Skedstork', 'Ibis',
  'Sångsvan', 'Knölsvan', 'Grågås', 'Kanadagås', 'Sädgås', 'Prutgås', 'Kricka', 'Gräsand', 'Bläsand',
  'Stjärtand', 'Skedand', 'Brunand', 'Vigg', 'Knipa', 'Salskrake', 'Storskrake', 'Ejder', 'Alfågel',
  'Sjöorre', 'Havssula', 'Labb', 'Fiskmås', 'Havstrut', 'Silltrut', 'Skrattmås', 'Fisktärna',
  'Silvertärna', 'Tordmule', 'Sillgrissla', 'Tobisgrissla', 'Lunnefågel', 'Pingvin', 'Kejsarpingvin',
  'Albatross', 'Pelikan', 'Flamingo', 'Tukan', 'Ara', 'Kakadua', 'Kolibri', 'Emu', 'Kasuar', 'Kivi',
];

const fish: SeedItem[] = [
  { name: 'Vithaj', tags: ['predator'], power: 82 }, { name: 'Tigerhaj', tags: ['predator'], power: 74 },
  { name: 'Tjurhaj', tags: ['predator'] }, { name: 'Hammarhaj', tags: ['predator'] },
  { name: 'Blåhaj', tags: ['predator'] }, { name: 'Revhaj', tags: ['predator'] },
  { name: 'Valhaj', tags: ['giant'], power: 60, size: 80 }, { name: 'Barracuda', tags: ['predator'] },
  'Gös', 'Lake', 'Ål', 'Havsål', 'Ålkusa', 'Simpa', 'Rödspätta', 'Sjötunga', 'Piggvar', 'Slätvar',
  'Sik', 'Nors', 'Siklöja', 'Harr', 'Stör', 'Vimma', 'Id', 'Färna', 'Stäm', 'Elritsa', 'Ruda',
  'Sarv', 'Björkna', 'Faren', 'Nissöga', 'Grönling', 'Sandkrypare', 'Storspigg', 'Småspigg',
  'Havskatt', 'Kummel', 'Vitling', 'Lyrtorsk', 'Gråsej', 'Långa', 'Lubb', 'Marulk', 'Fjärsing',
  'Skrubbskädda', 'Bergtunga', 'Rödtunga', 'Guldlax', 'Tobis', 'Skarpsill', 'Strömming', 'Vassbuk',
  'Ansjovis', 'Sardin', 'Makrill', 'Taggmakrill', 'Horngädda', 'Multe', 'Havsabborre', 'Guldsparid',
  'Napoleonfisk', 'Papegojfisk', 'Kirurgfisk', 'Kejsarfisk', 'Fjärilsfisk', 'Clownfisk', 'Blåfeneton',
  'Svärdfisk', 'Segelfisk', 'Marlin', 'Manta', 'Djävulsrocka', 'Elrocka', 'Spjutrocka', 'Sågfisk',
  'Lykttfisk', 'Ryggsimmare', 'Piraya', 'Elektrisk ål', 'Lungfisk', 'Kvastfening', 'Slemål',
];

const insects: SeedItem[] = [
  'Ekoxe', 'Noshornsbagge', 'Tordyvel', 'Guldbagge', 'Kardinalbagge', 'Blombock', 'Timmerman',
  'Vivel', 'Löpbagge', 'Dykare', 'Vattenskorpion', 'Buksimmare', 'Skräddare', 'Bärfis',
  'Stinkfly', 'Bladlus', 'Sköldlus', 'Cikada', 'Vårtbitare', 'Gräshoppa', 'Vandrande pinne',
  'Kackerlacka', 'Öronvive', 'Silverfisk', 'Hoppstjärt', 'Dagslända', 'Bäcksslända', 'Nattslända',
  'Guldögonslända', 'Myrlejon', 'Broms', 'Knott', 'Svidknott', 'Fjällmygga', 'Stickmygga',
  'Blomfluga', 'Rovfluga', 'Spyfluga', 'Husfluga', 'Fruktfluga', 'Getingfluga', 'Bromsfluga',
  'Sandbi', 'Murarbi', 'Humla', 'Jordhumla', 'Stenhumla', 'Snylthumla', 'Pappersgeting',
  'Bålgeting', 'Vägstekel', 'Guldstekel', 'Stinkmyra', 'Stackmyra', 'Hästmyra', 'Tokmyra',
  'Termit', 'Kejsartrollslända', 'Flickslända', 'Jungfruslända', 'Citronfjäril', 'Nässelfjäril',
  'Påfågelöga', 'Amiral', 'Sorgmantel', 'Aurorafjäril', 'Makaonfjäril', 'Apollofjäril',
  'Dödskallesvärmare', 'Ligusterfly', 'Tussmott', 'Björnspinnare', 'Malmätare', 'Klädesmal',
  'Tvestjärt', 'Gråsugga', 'Tusenfoting', 'Enkelfoting', 'Skorpion', 'Lockespindel', 'Vägglus',
  'Fästing', 'Kvalster', 'Vattenloppa', 'Kräftdjur',
];

const reptiles: SeedItem[] = [
  { name: 'Kungskobra', tags: ['reptile', 'poison', 'predator'], power: 50 },
  { name: 'Svartmamba', tags: ['reptile', 'poison', 'predator'], power: 52, speed: 60 },
  { name: 'Grön mamba', tags: ['reptile', 'poison'] }, { name: 'Taipan', tags: ['reptile', 'poison'] },
  { name: 'Pufform', tags: ['reptile', 'poison'] }, { name: 'Skallerorm', tags: ['reptile', 'poison'] },
  { name: 'Huggorm', tags: ['reptile', 'poison'] }, { name: 'Näshornsvipera', tags: ['reptile', 'poison'] },
  { name: 'Anakonda', tags: ['reptile', 'predator', 'aquatic'], power: 58, size: 60 },
  { name: 'Boaorm', tags: ['reptile', 'predator'] }, { name: 'Nätpyton', tags: ['reptile', 'predator'] },
  { name: 'Kungspyton', tags: ['reptile'] }, { name: 'Kobra', tags: ['reptile', 'poison'] },
  { name: 'Saltvattenskrokodil', tags: ['reptile', 'predator', 'aquatic'], power: 66, size: 62 },
  { name: 'Nilkrokodil', tags: ['reptile', 'predator', 'aquatic'], power: 60 },
  { name: 'Alligator', tags: ['reptile', 'predator', 'aquatic'], power: 58 },
  { name: 'Kajman', tags: ['reptile', 'predator', 'aquatic'] },
  { name: 'Gavial', tags: ['reptile', 'predator', 'aquatic'] },
  { name: 'Komodovaran', tags: ['reptile', 'predator', 'poison'], power: 56 },
  { name: 'Leguan', tags: ['reptile'] }, { name: 'Gecko', tags: ['reptile'] },
  { name: 'Kameleont', tags: ['reptile'] }, { name: 'Skink', tags: ['reptile'] },
  { name: 'Gila-ödla', tags: ['reptile', 'poison'] }, { name: 'Basilisködla', tags: ['reptile'] },
  { name: 'Sköldpadda', tags: ['reptile', 'armored'] }, { name: 'Havssköldpadda', tags: ['reptile', 'aquatic'] },
  { name: 'Landsköldpadda', tags: ['reptile', 'armored'] }, { name: 'Snappsköldpadda', tags: ['reptile', 'predator'] },
  { name: 'Grodyngel', tags: [] }, 'Groda', 'Padda', 'Ätlig groda', 'Lövgroda', 'Pilgiftsgroda',
  'Eldsalamander', 'Vattensalamander', 'Axolotl', 'Större vattensalamander', 'Snok', 'Hasselsnok',
  'Kopparödla', 'Skogsödla', 'Sandödla',
];

const dinosaurs: SeedItem[] = [
  { name: 'Giganotosaurus', tags: ['predator'], power: 84, size: 82 },
  { name: 'Carcharodontosaurus', tags: ['predator'], power: 82, size: 80 },
  { name: 'Torvosaurus', tags: ['predator'] }, { name: 'Megalosaurus', tags: ['predator'] },
  { name: 'Ceratosaurus', tags: ['predator'] }, { name: 'Baryonyx', tags: ['predator'] },
  { name: 'Deinonychus', tags: ['predator'] }, { name: 'Troodon', tags: ['predator'] },
  { name: 'Therizinosaurus', tags: ['predator'] }, { name: 'Oviraptor', tags: ['predator'] },
  { name: 'Deinocheirus', tags: [] }, { name: 'Suchomimus', tags: ['predator', 'aquatic'] },
  { name: 'Yutyrannus', tags: ['predator'] }, { name: 'Albertosaurus', tags: ['predator'] },
  { name: 'Daspletosaurus', tags: ['predator'] }, { name: 'Tarbosaurus', tags: ['predator'] },
  { name: 'Pachycephalosaurus', tags: ['armored'] }, { name: 'Styracosaurus', tags: ['armored'] },
  { name: 'Pentaceratops', tags: ['armored'] }, { name: 'Protoceratops', tags: [] },
  { name: 'Kentrosaurus', tags: ['armored'] }, { name: 'Euoplocephalus', tags: ['armored'] },
  { name: 'Nodosaurus', tags: ['armored'] }, { name: 'Argentinosaurus', tags: ['giant'], size: 92 },
  { name: 'Patagotitan', tags: ['giant'], size: 92 }, { name: 'Dreadnoughtus', tags: ['giant'], size: 90 },
  { name: 'Apatosaurus', tags: ['giant'], size: 86 }, { name: 'Mamenchisaurus', tags: ['giant'], size: 88 },
  'Camarasaurus', 'Titanosaurus', 'Amargasaurus', 'Nigersaurus', 'Corythosaurus', 'Parasaurolophus',
  'Edmontosaurus', 'Maiasaura', 'Lambeosaurus', 'Shantungosaurus', 'Ouranosaurus', 'Tenontosaurus',
  'Hypsilophodon', 'Dryosaurus', 'Psittacosaurus', 'Microraptor', 'Sinornithosaurus', 'Anchiornis',
  'Caudipteryx', 'Sinosauropteryx', 'Ornithomimus', 'Struthiomimus', 'Coelophysis', 'Eoraptor',
  'Herrerasaurus', 'Plateosaurus', 'Massospondylus', 'Cryolophosaurus', 'Concavenator', 'Acrocanthosaurus',
  'Majungasaurus', 'Rugops', 'Abelisaurus', 'Kaprosuchus', 'Sarcosuchus', 'Deinosuchus',
  { name: 'Quetzalcoatlus', tags: ['flying'] }, { name: 'Dimorphodon', tags: ['flying'] },
  { name: 'Rhamphorhynchus', tags: ['flying'] }, { name: 'Tropeognathus', tags: ['flying'] },
  { name: 'Plesiosaurus', tags: ['aquatic', 'predator'] }, { name: 'Elasmosaurus', tags: ['aquatic', 'predator'] },
  { name: 'Liopleurodon', tags: ['aquatic', 'predator'], power: 80 }, { name: 'Kronosaurus', tags: ['aquatic', 'predator'] },
  { name: 'Ichthyosaurus', tags: ['aquatic'] }, { name: 'Nothosaurus', tags: ['aquatic'] },
  { name: 'Dunkleosteus', tags: ['aquatic', 'predator', 'armored'], power: 70 },
];

const seaCreatures: SeedItem[] = [
  { name: 'Jättebläckfisk', aliases: ['Kolossbläckfisk'], tags: ['aquatic', 'predator', 'giant'], power: 62, size: 66, intelligence: 62 },
  { name: 'Åttaarmad bläckfisk', tags: ['aquatic'], intelligence: 60 },
  'Tioarmad bläckfisk', 'Sepia', 'Nautilus', 'Kammanet', 'Öronmanet', 'Kompassmanet', 'Brännmanet',
  'Portugisisk örlogsman', 'Havsanemon', 'Korall', 'Hjärnkorall', 'Hornkorall', 'Sjöpung', 'Sjögurka',
  'Sjöborre', 'Sjöstjärna', 'Solstjärna', 'Ormstjärna', 'Sjöfjäder', 'Havsborstmask', 'Tångräka',
  'Eremitkräfta', 'Spindelkrabba', 'Kungskrabba', 'Strandkrabba', 'Hummer', 'Havskräfta', 'Languster',
  'Räka', 'Krill', 'Havstulpan', 'Blåmussla', 'Ostron', 'Kammussla', 'Pärlmussla', 'Bläckfiskbläck',
  'Sjöhäst', 'Kantnål', 'Trumpetfisk', 'Munruvare', 'Slöjstjärt',
];

// --- Plants ---------------------------------------------------------------
const trees: SeedItem[] = [
  'Träd', 'Ek', 'Bok', 'Björk', 'Asp', 'Al', 'Alm', 'Ask', 'Lönn', 'Lind', 'Hägg', 'Rönn', 'Oxel', 'Hassel',
  'Sälg', 'Vide', 'Pil', 'Poppel', 'Avenbok', 'Kastanj', 'Hästkastanj', 'Valnöt', 'Mullbär', 'Fikon',
  'Oliv', 'Cypress', 'Ceder', 'En', 'Idegran', 'Gran', 'Tall', 'Lärk', 'Silvergran', 'Douglasgran',
  'Sekvoja', 'Mammutträd', 'Baobab', 'Palm', 'Kokospalm', 'Dadelpalm', 'Bambu', 'Eukalyptus',
  'Akacia', 'Mangroveträd', 'Teak', 'Mahogny', 'Ebenholts', 'Sandelträd', 'Korkek', 'Magnolia',
  'Ginkgo', 'Katsura', 'Trumpetträd', 'Jakaranda', 'Flamboyant', 'Banyan', 'Gummiträd', 'Kautschukträd',
];

const flowers: SeedItem[] = [
  'Ros', 'Tulpan', 'Narciss', 'Påsklilja', 'Hyacint', 'Krokus', 'Snödroppe', 'Vintergäck', 'Pion',
  'Dahlia', 'Georgin', 'Ringblomma', 'Solros', 'Prästkrage', 'Blåklint', 'Vallmo', 'Lupin', 'Riddarsporre',
  'Lejongap', 'Petunia', 'Begonia', 'Pelargon', 'Fuchsia', 'Viol', 'Penséer', 'Förgätmigej', 'Liljekonvalj',
  'Lilja', 'Tigerlilja', 'Näckros', 'Lotus', 'Orkidé', 'Vanilj', 'Anemon', 'Vitsippa', 'Blåsippa',
  'Gullviva', 'Smörblomma', 'Maskros', 'Klöver', 'Ljung', 'Nyponros', 'Jasmin', 'Syren', 'Kaprifol',
  'Klematis', 'Passionsblomma', 'Hibiskus', 'Azalea', 'Rododendron', 'Kamelia', 'Nejlika', 'Krysantemum',
  'Gerbera', 'Iris', 'Gladiolus', 'Amaryllis', 'Julstjärna', 'Cyklamen', 'Kaktusblomma',
];

const plants: SeedItem[] = [
  { name: 'Nässla', tags: ['poison'] }, { name: 'Björnloka', tags: ['poison'] },
  { name: 'Giftmurgröna', tags: ['poison'] }, { name: 'Belladonna', tags: ['poison'] },
  { name: 'Odört', tags: ['poison'] }, { name: 'Fingerborgsblomma', tags: ['poison'] },
  { name: 'Venus flugfälla', tags: ['predator'] }, { name: 'Kannranka', tags: ['predator'] },
  { name: 'Sileshår', tags: ['predator'] }, 'Kaktus', 'Aloe vera', 'Agave', 'Suckulent', 'Murgröna',
  'Vildvin', 'Humle', 'Vinranka', 'Ärtväxt', 'Böna', 'Ärta', 'Klängväxt', 'Ormbunke', 'Fräken',
  'Lummer', 'Mossa', 'Vitmossa', 'Lav', 'Renlav', 'Alger', 'Kelp', 'Tång', 'Blåstång', 'Sjögräs',
  'Vass', 'Kaveldun', 'Starr', 'Gräs', 'Bambu', 'Sockerrör', 'Vete', 'Råg', 'Korn', 'Havre', 'Ris',
  'Majs', 'Hirs', 'Sojaböna', 'Bomull', 'Lin', 'Hampa', 'Kaffebuske', 'Tebuske', 'Kakaoträd',
  'Tobaksplanta', 'Pepparplanta', 'Kryddnejlika', 'Kanelträd', 'Ingefära', 'Gurkmeja', 'Basilika',
  'Timjan', 'Rosmarin', 'Oregano', 'Mynta', 'Dill', 'Persilja', 'Koriander', 'Lavendel', 'Salvia',
];

const fungi: SeedItem[] = [
  'Kremla', 'Riska', 'Blodriska', 'Pepparriska', 'Smörsopp', 'Sandsopp', 'Björksopp', 'Aspsopp',
  'Taggsvamp', 'Trumpetsvamp', 'Svart trumpetsvamp', 'Blomkålssvamp', 'Fårticka', 'Blodticka',
  'Fnöskticka', 'Björkticka', 'Honungsskivling', 'Nagelskivling', 'Musseron', 'Riddarmusseron',
  'Champinjon', 'Ängschampinjon', 'Karljohansvamp', 'Toppmurkla', 'Stenmurkla', 'Läderlappsmurkla',
  'Röksvamp', 'Jättröksvamp', 'Stinksvamp', 'Rödskivig flugsvamp', 'Panterflugsvamp', 'Vit flugsvamp',
  'Lömsk flugsvamp', 'Gifthätting', 'Toppig giftspindling', 'Mönjeröksvamp', 'Skållsvamp', 'Slemsvamp',
  'Vasslesvamp', 'Vedmussling',
];

// --- Food & drink ---------------------------------------------------------
const fruitsVeg: SeedItem[] = [
  'Äpple', 'Päron', 'Banan', 'Apelsin', 'Citron', 'Lime', 'Grapefrukt', 'Mandarin', 'Clementin',
  'Vindruva', 'Jordgubbe', 'Blåbär', 'Hallon', 'Björnbär', 'Lingon', 'Tranbär', 'Hjortron', 'Krusbär',
  'Vinbär', 'Körsbär', 'Plommon', 'Aprikos', 'Persika', 'Nektarin', 'Kiwi', 'Ananas', 'Mango', 'Papaya',
  'Passionsfrukt', 'Granatäpple', 'Fikon', 'Dadel', 'Kokosnöt', 'Avokado', 'Oliv', 'Melon', 'Vattenmelon',
  'Cantaloupe', 'Litchi', 'Drakfrukt', 'Guava', 'Rambutan', 'Durian', 'Stjärnfrukt', 'Kumquat',
  'Morot', 'Potatis', 'Sötpotatis', 'Rödbeta', 'Palsternacka', 'Rättika', 'Rädisa', 'Kålrot', 'Rova',
  'Lök', 'Rödlök', 'Purjolök', 'Schalottenlök', 'Vitlök', 'Gräslök', 'Selleri', 'Fänkål', 'Sparris',
  'Broccoli', 'Blomkål', 'Brysselkål', 'Vitkål', 'Rödkål', 'Grönkål', 'Savojkål', 'Spenat', 'Mangold',
  'Sallad', 'Ruccola', 'Endiv', 'Gurka', 'Tomat', 'Paprika', 'Chilipeppar', 'Aubergine', 'Zucchini',
  'Squash', 'Pumpa', 'Majskolv', 'Ärtor', 'Bönor', 'Kikärter', 'Linser', 'Sockerärt', 'Champinjon',
  'Kantarell', 'Ingefära', 'Gurkmeja', 'Rabarber', 'Kronärtskocka', 'Palmkål', 'Okra', 'Jordärtskocka',
];

const dishes: SeedItem[] = [
  'Köttbullar', 'Falukorv', 'Isterband', 'Blodpudding', 'Raggmunk', 'Kroppkakor', 'Kalops', 'Pyttipanna',
  'Janssons frestelse', 'Gravlax', 'Inlagd sill', 'Surströmming', 'Kräftor', 'Ärtsoppa', 'Blåbärssoppa',
  'Nyponsoppa', 'Köttfärssås', 'Lasagne', 'Spaghetti', 'Carbonara', 'Pizza', 'Calzone', 'Risotto',
  'Gnocchi', 'Ravioli', 'Sushi', 'Sashimi', 'Ramen', 'Udon', 'Tempura', 'Yakitori', 'Gyoza', 'Miso',
  'Pad thai', 'Vårrullar', 'Dumplings', 'Wok', 'Currygryta', 'Tikka masala', 'Naanbröd', 'Samosa',
  'Tacos', 'Burrito', 'Quesadilla', 'Enchilada', 'Nachos', 'Guacamole', 'Chili con carne', 'Hamburgare',
  'Cheeseburgare', 'Pommes frites', 'Hotdog', 'Kebab', 'Falafel', 'Hummus', 'Shawarma', 'Gyros',
  'Moussaka', 'Paella', 'Tortilla', 'Gazpacho', 'Bouillabaisse', 'Ratatouille', 'Crêpe', 'Quiche',
  'Croissant', 'Baguette', 'Smörgås', 'Räksmörgås', 'Toast Skagen', 'Omelett', 'Pannkakor', 'Våfflor',
  'Semla', 'Kanelbulle', 'Prinsesstårta', 'Kladdkaka', 'Chokladboll', 'Ostkaka', 'Äppelpaj', 'Glass',
  'Sorbet', 'Pudding', 'Panna cotta', 'Tiramisu', 'Cheesecake', 'Brownie', 'Muffins', 'Cupcake',
];

const drinks: SeedItem[] = [
  'Kaffe', 'Espresso', 'Cappuccino', 'Latte', 'Te', 'Grönt te', 'Svart te', 'Örtte', 'Chai', 'Kakao',
  'Varm choklad', 'Mjölk', 'Fil', 'Yoghurtdryck', 'Smoothie', 'Milkshake', 'Juice', 'Apelsinjuice',
  'Äppeljuice', 'Must', 'Saft', 'Läsk', 'Cola', 'Sockerdricka', 'Tonic', 'Sodavatten', 'Mineralvatten',
  'Energidryck', 'Sportdryck', 'Öl', 'Lager', 'Ale', 'Stout', 'Porter', 'Cider', 'Vin', 'Rödvin',
  'Vitt vin', 'Rosévin', 'Champagne', 'Mousserande vin', 'Glögg', 'Punsch', 'Whisky', 'Vodka', 'Gin',
  'Rom', 'Tequila', 'Konjak', 'Brandy', 'Likör', 'Absint', 'Snaps', 'Akvavit', 'Cocktail', 'Mojito',
  'Margarita', 'Martini', 'Daiquiri', 'Sangria', 'Kombucha',
];

// --- Body ------------------------------------------------------------------
const bodyparts: SeedItem[] = [
  'Skalle', 'Panna', 'Tinning', 'Ögonbryn', 'Ögonfrans', 'Pupill', 'Näsborre', 'Kind', 'Haka', 'Läpp',
  'Gom', 'Tandkött', 'Visdomstand', 'Struphuvud', 'Stämband', 'Luftstrupe', 'Matstrupe', 'Nacke',
  'Axel', 'Nyckelben', 'Skulderblad', 'Överarm', 'Armbåge', 'Underarm', 'Handled', 'Handflata',
  'Tumme', 'Pekfinger', 'Långfinger', 'Ringfinger', 'Lillfinger', 'Knoge', 'Bröstkorg', 'Revben',
  'Bröstben', 'Ryggrad', 'Kotor', 'Höft', 'Bäcken', 'Lår', 'Lårben', 'Knäskål', 'Vad', 'Smalben',
  'Vristben', 'Ankel', 'Häl', 'Fotsula', 'Tå', 'Stortå', 'Biceps', 'Triceps', 'Magmuskler', 'Sena',
  'Ledband', 'Brosk', 'Benmärg', 'Blodkärl', 'Artär', 'Ven', 'Kapillär', 'Röda blodkroppar', 'Hjärnbark',
  'Lillhjärna', 'Hjärnstam', 'Ryggmärg', 'Bukspottkörtel', 'Gallblåsa', 'Mjälte', 'Tarm', 'Tjocktarm',
  'Tunntarm', 'Blindtarm', 'Urinblåsa', 'Sköldkörtel', 'Binjure', 'Hypofys', 'Näthinna', 'Trumhinna',
];

// --- People, jobs, sport, music -------------------------------------------
const professions: SeedItem[] = [
  'Läkare', 'Kirurg', 'Tandläkare', 'Veterinär', 'Sjuksköterska', 'Barnmorska', 'Psykolog', 'Apotekare',
  'Advokat', 'Åklagare', 'Domare', 'Notarie', 'Polis', 'Kriminalare', 'Väktare', 'Livvakt', 'Soldat',
  'Officer', 'Pilot', 'Stridspilot', 'Astronaut', 'Sjökapten', 'Styrman', 'Lots', 'Dykare', 'Brandman',
  'Ambulansförare', 'Lärare', 'Professor', 'Forskare', 'Kemist', 'Fysiker', 'Biolog', 'Geolog', 'Astronom',
  'Matematiker', 'Ingenjör', 'Arkitekt', 'Byggnadsarbetare', 'Snickare', 'Murare', 'Elektriker', 'Rörmokare',
  'Svetsare', 'Mekaniker', 'Smed', 'Målare', 'Plåtslagare', 'Takläggare', 'Trädgårdsmästare', 'Skogsarbetare',
  'Bonde', 'Lantbrukare', 'Fiskare', 'Jägare', 'Skogvaktare', 'Kock', 'Konditor', 'Bagare', 'Slaktare',
  'Servitör', 'Bartender', 'Sommelier', 'Frisör', 'Barberare', 'Skräddare', 'Skomakare', 'Urmakare',
  'Guldsmed', 'Optiker', 'Fotograf', 'Journalist', 'Reporter', 'Redaktör', 'Författare', 'Poet',
  'Översättare', 'Bibliotekarie', 'Programmerare', 'Systemutvecklare', 'Dataanalytiker', 'Webbdesigner',
  'Speldesigner', 'Ekonom', 'Revisor', 'Banktjänsteman', 'Mäklare', 'Säljare', 'Kassör', 'Receptionist',
  'Sekreterare', 'Politiker', 'Diplomat', 'Domare (idrott)', 'Präst', 'Munk', 'Nunna', 'Imam', 'Rabbin',
  'Skådespelare', 'Regissör', 'Producent', 'Musiker', 'Dirigent', 'Kompositör', 'Dansare', 'Koreograf',
  'Konstnär', 'Skulptör', 'Illustratör', 'Serietecknare', 'Modeskapare', 'Stylist', 'Makeupartist',
  'Detektiv', 'Spion', 'Agent', 'Tolk', 'Meteorolog', 'Bibliotekarie', 'Arkeolog', 'Historiker',
];

const sports: SeedItem[] = [
  'Boxare', 'Kickboxare', 'Thaiboxare', 'MMA-fighter', 'Brottare', 'Sumobrottare', 'Judoka', 'Karateka',
  'Taekwondoutövare', 'Fäktare', 'Bågskytt', 'Skytt', 'Tyngdlyftare', 'Styrkelyftare', 'Kroppsbyggare',
  'Strongman', 'Sprinter', 'Maratonlöpare', 'Häcklöpare', 'Höjdhoppare', 'Längdhoppare', 'Stavhoppare',
  'Kulstötare', 'Diskuskastare', 'Spjutkastare', 'Släggkastare', 'Simmare', 'Simhoppare', 'Vattenpolospelare',
  'Roddare', 'Kanotist', 'Seglare', 'Surfare', 'Fotbollsspelare', 'Ishockeyspelare', 'Handbollsspelare',
  'Basketspelare', 'Volleybollspelare', 'Tennisspelare', 'Badmintonspelare', 'Bordtennisspelare',
  'Golfspelare', 'Cyklist', 'Mountainbikeåkare', 'BMX-åkare', 'Skidåkare', 'Slalomåkare', 'Backhoppare',
  'Skidskytt', 'Skridskoåkare', 'Konståkare', 'Snowboardåkare', 'Gymnast', 'Trampolinhoppare', 'Klättrare',
  'Ryttare', 'Jockey', 'Racerförare', 'Rallyförare', 'Motocrossförare', 'Skateboardåkare', 'Parkourutövare',
];

const music: SeedItem[] = [
  'Piano', 'Flygel', 'Orgel', 'Cembalo', 'Dragspel', 'Munspel', 'Gitarr', 'Elgitarr', 'Basgitarr',
  'Akustisk gitarr', 'Banjo', 'Mandolin', 'Ukulele', 'Harpa', 'Fiol', 'Altfiol', 'Cello', 'Kontrabas',
  'Flöjt', 'Tvärflöjt', 'Blockflöjt', 'Piccolaflöjt', 'Klarinett', 'Oboe', 'Fagott', 'Saxofon',
  'Trumpet', 'Trombon', 'Valthorn', 'Tuba', 'Kornett', 'Trummor', 'Trumset', 'Virveltrumma', 'Puka',
  'Cymbal', 'Xylofon', 'Marimba', 'Vibrafon', 'Triangel', 'Tamburin', 'Maracas', 'Congas', 'Bongos',
  'Djembe', 'Gonggong', 'Rockstjärna', 'Popstjärna', 'Operasångare', 'DJ', 'Rappare', 'Ljudvåg',
  'Ultraljud', 'Infraljud', 'Basljud', 'Ljudbang', 'Megafon', 'Syntesizer',
];

// --- Made objects ---------------------------------------------------------
const weapons: SeedItem[] = [
  { name: 'Sabel', tags: ['blade'] }, { name: 'Rapir', tags: ['blade'] }, { name: 'Florett', tags: ['blade'] },
  { name: 'Machete', tags: ['blade'] }, { name: 'Skära', tags: ['blade'] }, { name: 'Bardisan', tags: ['blade'] },
  { name: 'Glav', tags: ['blade'] }, { name: 'Stridsyxa', tags: ['blade'] }, { name: 'Stridshammare', tags: ['blade'] },
  { name: 'Stridsklubba', tags: [] }, { name: 'Nunchaku', tags: [] }, { name: 'Kastpil', tags: ['projectile'] },
  { name: 'Kastkniv', tags: ['blade', 'projectile'] }, { name: 'Shuriken', tags: ['blade', 'projectile'] },
  { name: 'Långbåge', tags: ['projectile'] }, { name: 'Kompositbåge', tags: ['projectile'] },
  { name: 'Slunga', tags: ['projectile'] }, { name: 'Katapult', tags: ['projectile'] },
  { name: 'Ballista', tags: ['projectile'] }, { name: 'Murbräcka', tags: [] },
  { name: 'Revolver', tags: ['firearm'] }, { name: 'Kpist', tags: ['firearm'] },
  { name: 'Automatgevär', tags: ['firearm'] }, { name: 'Karbin', tags: ['firearm'] },
  { name: 'Prickskyttegevär', tags: ['firearm'] }, { name: 'Automatkanon', tags: ['firearm'] },
  { name: 'Luftvärnskanon', tags: ['firearm'] }, { name: 'Pansarvärnsrobot', tags: ['explosive', 'projectile'] },
  { name: 'Kryssningsmissil', tags: ['explosive', 'projectile'], power: 80 },
  { name: 'Ballistisk robot', tags: ['explosive', 'projectile', 'nuclear'], power: 90 },
  { name: 'Klusterbomb', tags: ['explosive'] }, { name: 'Bunkerbomb', tags: ['explosive'] },
  { name: 'Termobarisk bomb', tags: ['explosive'] }, { name: 'Sjömina', tags: ['explosive'] },
  { name: 'Truppmina', tags: ['explosive'] }, { name: 'Handeldvapen', tags: ['firearm'] },
  { name: 'Flammkastare', tags: ['fire'] }, { name: 'Railgun', tags: ['energy', 'projectile'] },
  { name: 'Jaktbössa', tags: ['firearm'] }, { name: 'Salongsgevär', tags: ['firearm'] },
  { name: 'Armborst', tags: ['projectile'] }, { name: 'Spjutkastare', tags: ['projectile'] },
];

const vehicles: SeedItem[] = [
  'Sedan', 'Kombi', 'SUV', 'Sportbil', 'Cabriolet', 'Pickup', 'Skåpbil', 'Husbil', 'Husvagn',
  'Racerbil', 'Rallybil', 'Formelbil', 'Dragster', 'Veteranbil', 'Elbil', 'Hybridbil', 'Taxi',
  'Polisbil', 'Ambulans', 'Brandbil', 'Sopbil', 'Betongbil', 'Tankbil', 'Timmerbil', 'Trailer',
  'Dumper', 'Grävmaskin', 'Bulldozer', 'Hjullastare', 'Väghyvel', 'Vält', 'Mobilkran', 'Gaffeltruck',
  'Traktor', 'Skördetröska', 'Fyrhjuling', 'Moped', 'Skoter', 'Motorcykel', 'Crossmotorcykel',
  'Snöskoter', 'Vattenskoter', 'Gokart', 'Cykel', 'Mountainbike', 'Elcykel', 'Lådcykel', 'Enhjuling',
  'Tåg', 'Höghastighetståg', 'Ånglok', 'Pendeltåg', 'Tunnelbana', 'Spårvagn', 'Buss', 'Ledbuss',
  'Trådbuss', 'Segelbåt', 'Motorbåt', 'Kajak', 'Kanot', 'Roddbåt', 'Katamaran', 'Yacht', 'Kryssningsfartyg',
  'Färja', 'Bogserbåt', 'Isbrytare', 'Lastfartyg', 'Containerfartyg', 'Tankfartyg', 'Segelfartyg',
  'Galär', 'Vikingaskepp', 'Luftskepp', 'Zeppelinare', 'Luftballong', 'Segelflygplan', 'Vattenflygplan',
  'Sjöflygplan', 'Passagerarplan', 'Privatjet', 'Propellerplan',
];

const tools: SeedItem[] = [
  'Hammare', 'Slägga', 'Släggborr', 'Kofot', 'Bräckjärn', 'Såg', 'Fogsvans', 'Bågfil', 'Kapsåg',
  'Cirkelsåg', 'Sticksåg', 'Bandsåg', 'Kedjesåg', 'Motorsåg', 'Yxa', 'Klyvyxa', 'Handyxa', 'Lie',
  'Skära', 'Spade', 'Grep', 'Räfsa', 'Kratta', 'Hacka', 'Korp', 'Skyffel', 'Trädgårdssax', 'Sekatör',
  'Häcksax', 'Gräsklippare', 'Trimmer', 'Skruvmejsel', 'Stjärnmejsel', 'Insexnyckel', 'Skiftnyckel',
  'Blocknyckel', 'Ringnyckel', 'Hylsnyckel', 'Momentnyckel', 'Rörtång', 'Polygrip', 'Kombinationstång',
  'Avbitare', 'Sidavbitare', 'Skruvtving', 'Bänkskruv', 'Fil', 'Rasp', 'Hyvel', 'Stämjärn', 'Syl',
  'Borr', 'Borrmaskin', 'Slagborr', 'Skruvdragare', 'Mutterdragare', 'Vinkelslip', 'Bänkslip',
  'Svets', 'Svetslåga', 'Lödkolv', 'Varmluftspistol', 'Vattenpass', 'Tumstock', 'Måttband', 'Vinkelhake',
  'Krita', 'Murslev', 'Bräde', 'Spackelspade', 'Pensel', 'Roller', 'Domkraft', 'Talja', 'Vinsch',
];

const buildings: SeedItem[] = [
  'Villa', 'Radhus', 'Parhus', 'Lägenhet', 'Höghus', 'Skyskrapa', 'Herrgård', 'Slott', 'Palats',
  'Borg', 'Fästning', 'Citadell', 'Vakttorn', 'Ringmur', 'Vallgrav', 'Stadsmur', 'Fyr', 'Väderkvarn',
  'Vattenkvarn', 'Lada', 'Loge', 'Stall', 'Ladugård', 'Silo', 'Växthus', 'Orangeri', 'Paviljong',
  'Kiosk', 'Butik', 'Galleria', 'Köpcentrum', 'Torg', 'Saluhall', 'Restaurang', 'Kafé', 'Hotell',
  'Vandrarhem', 'Sjukhus', 'Vårdcentral', 'Skola', 'Universitet', 'Bibliotek', 'Museum', 'Konsthall',
  'Teater', 'Operahus', 'Konserthus', 'Biograf', 'Stadion', 'Arena', 'Simhall', 'Idrottshall',
  'Kyrka', 'Katedral', 'Kloster', 'Kapell', 'Moské', 'Synagoga', 'Tempel', 'Pagod', 'Pyramid',
  'Akvedukt', 'Viadukt', 'Bro', 'Hängbro', 'Tunnel', 'Damm', 'Vattentorn', 'Kraftverk', 'Kärnkraftverk',
  'Vindkraftverk', 'Fabrik', 'Raffinaderi', 'Hamn', 'Flygplats', 'Järnvägsstation', 'Parkeringshus',
  'Bunker', 'Katakomber', 'Amfiteater', 'Triumfbåge', 'Obelisk', 'Monument', 'Mausoleum',
];

const materials: SeedItem[] = [
  { name: 'Guld', tags: ['metal'] }, { name: 'Silver', tags: ['metal'] }, { name: 'Platina', tags: ['metal'] },
  { name: 'Koppar', tags: ['metal'] }, { name: 'Brons', tags: ['metal'] }, { name: 'Mässing', tags: ['metal'] },
  { name: 'Järn', tags: ['metal'] }, { name: 'Gjutjärn', tags: ['metal'] }, { name: 'Stål', tags: ['metal'] },
  { name: 'Rostfritt stål', tags: ['metal'] }, { name: 'Aluminium', tags: ['metal'] }, { name: 'Titan', tags: ['metal'] },
  { name: 'Zink', tags: ['metal'] }, { name: 'Nickel', tags: ['metal'] }, { name: 'Krom', tags: ['metal'] },
  { name: 'Volfram', tags: ['metal'] }, { name: 'Bly', tags: ['metal'] }, { name: 'Tenn', tags: ['metal'] },
  'Diamant', 'Rubin', 'Safir', 'Smaragd', 'Ametist', 'Topas', 'Opal', 'Granat', 'Akvamarin', 'Turkos',
  'Jade', 'Onyx', 'Bärnsten', 'Pärla', 'Kvarts', 'Bergkristall', 'Grafit', 'Kol', 'Marmor', 'Granit',
  'Kalksten', 'Sandsten', 'Skiffer', 'Basalt', 'Obsidian', 'Pimpsten', 'Flinta', 'Lera', 'Gips',
  'Cement', 'Betong', 'Tegel', 'Kakel', 'Porslin', 'Keramik', 'Glas', 'Kristallglas', 'Plast',
  'Gummi', 'Silikon', 'Kevlar', 'Kolfiber', 'Grafen', 'Nanorör', 'Trä', 'Plywood', 'Läder', 'Papper',
  'Papp', 'Textil', 'Bomull', 'Ull', 'Silke', 'Lin', 'Polyester', 'Nylon',
];

// --- Places ---------------------------------------------------------------
const countries: SeedItem[] = [
  'Sverige', 'Norge', 'Danmark', 'Finland', 'Island', 'Estland', 'Lettland', 'Litauen', 'Polen',
  'Tyskland', 'Nederländerna', 'Belgien', 'Luxemburg', 'Frankrike', 'Storbritannien', 'Irland',
  'Spanien', 'Portugal', 'Italien', 'Schweiz', 'Österrike', 'Tjeckien', 'Slovakien', 'Ungern',
  'Slovenien', 'Kroatien', 'Bosnien', 'Serbien', 'Montenegro', 'Nordmakedonien', 'Albanien', 'Grekland',
  'Bulgarien', 'Rumänien', 'Moldavien', 'Ukraina', 'Vitryssland', 'Ryssland', 'Turkiet', 'Cypern',
  'Malta', 'Monaco', 'Andorra', 'Liechtenstein', 'San Marino', 'Vatikanstaten', 'Georgien', 'Armenien',
  'Azerbajdzjan', 'Kazakstan', 'Uzbekistan', 'Turkmenistan', 'Kirgizistan', 'Tadzjikistan', 'Mongoliet',
  'Kina', 'Japan', 'Sydkorea', 'Nordkorea', 'Taiwan', 'Vietnam', 'Laos', 'Kambodja', 'Thailand',
  'Myanmar', 'Malaysia', 'Singapore', 'Indonesien', 'Filippinerna', 'Brunei', 'Indien', 'Pakistan',
  'Bangladesh', 'Nepal', 'Bhutan', 'Sri Lanka', 'Maldiverna', 'Afghanistan', 'Iran', 'Irak', 'Syrien',
  'Libanon', 'Israel', 'Jordanien', 'Saudiarabien', 'Jemen', 'Oman', 'Qatar', 'Bahrain', 'Kuwait',
  'Egypten', 'Libyen', 'Tunisien', 'Algeriet', 'Marocko', 'Sudan', 'Etiopien', 'Somalia', 'Kenya',
  'Tanzania', 'Uganda', 'Rwanda', 'Kongo', 'Nigeria', 'Ghana', 'Elfenbenskusten', 'Senegal', 'Mali',
  'Niger', 'Tchad', 'Kamerun', 'Angola', 'Zambia', 'Zimbabwe', 'Moçambique', 'Namibia', 'Botswana',
  'Sydafrika', 'Madagaskar', 'Mauritius', 'USA', 'Kanada', 'Mexiko', 'Guatemala', 'Belize', 'Honduras',
  'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Kuba', 'Jamaica', 'Haiti', 'Dominikanska republiken',
  'Bahamas', 'Colombia', 'Venezuela', 'Guyana', 'Surinam', 'Ecuador', 'Peru', 'Bolivia', 'Brasilien',
  'Paraguay', 'Uruguay', 'Argentina', 'Chile', 'Australien', 'Nya Zeeland', 'Papua Nya Guinea', 'Fiji',
];

const cities: SeedItem[] = [
  'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg',
  'Norrköping', 'Jönköping', 'Umeå', 'Lund', 'Gävle', 'Sundsvall', 'Luleå', 'Kiruna', 'Visby',
  'Oslo', 'Bergen', 'Köpenhamn', 'Helsingfors', 'Reykjavik', 'London', 'Manchester', 'Liverpool',
  'Edinburgh', 'Dublin', 'Paris', 'Marseille', 'Lyon', 'Nice', 'Berlin', 'München', 'Hamburg',
  'Frankfurt', 'Köln', 'Amsterdam', 'Rotterdam', 'Bryssel', 'Antwerpen', 'Luxemburg', 'Zürich',
  'Genève', 'Wien', 'Prag', 'Warszawa', 'Kraków', 'Budapest', 'Bukarest', 'Aten', 'Rom', 'Milano',
  'Venedig', 'Florens', 'Neapel', 'Madrid', 'Barcelona', 'Sevilla', 'Valencia', 'Lissabon', 'Porto',
  'Moskva', 'Sankt Petersburg', 'Kiev', 'Istanbul', 'Ankara', 'Kairo', 'Alexandria', 'Casablanca',
  'Lagos', 'Nairobi', 'Kapstaden', 'Johannesburg', 'Dubai', 'Abu Dhabi', 'Doha', 'Riyadh', 'Teheran',
  'Bagdad', 'Jerusalem', 'Tel Aviv', 'Mumbai', 'Delhi', 'Bangalore', 'Karachi', 'Dhaka', 'Bangkok',
  'Singapore', 'Kuala Lumpur', 'Jakarta', 'Manila', 'Hanoi', 'Ho Chi Minh-staden', 'Peking', 'Shanghai',
  'Hongkong', 'Guangzhou', 'Shenzhen', 'Seoul', 'Tokyo', 'Osaka', 'Kyoto', 'Sydney', 'Melbourne',
  'Brisbane', 'Perth', 'Auckland', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Boston',
  'Washington', 'San Francisco', 'Las Vegas', 'Seattle', 'Toronto', 'Montreal', 'Vancouver',
  'Mexico City', 'Havanna', 'Bogotá', 'Lima', 'Santiago', 'Buenos Aires', 'Rio de Janeiro', 'São Paulo',
];

// --- Nature, weather, space ------------------------------------------------
const geography: SeedItem[] = [
  { name: 'Berg', tags: ['earth'] }, 'Bergskedja', 'Bergstopp', 'Vulkanberg', 'Fjäll', 'Ås', 'Kulle',
  'Höjd', 'Platå', 'Ravin', 'Klyfta', 'Dal', 'Dalgång', 'Slätt', 'Stäpp', 'Savann', 'Prärie', 'Tundra',
  'Taiga', 'Urskog', 'Regnskog', 'Djungel', 'Lövskog', 'Barrskog', 'Mangroveskog', 'Sumpmark', 'Kärr',
  'Mosse', 'Myr', 'Träsk', 'Delta', 'Flodmynning', 'Vik', 'Fjord', 'Bukt', 'Sund', 'Kanal', 'Näs',
  'Udde', 'Halvö', 'Ö', 'Skär', 'Atoll', 'Korallrev', 'Sandbank', 'Strand', 'Klippstrand', 'Grotta',
  'Stalaktit', 'Källa', 'Varm källa', 'Geysir', 'Vattenfall', 'Fors', 'Bäck', 'Å', 'Flod', 'Sjö',
  'Tjärn', 'Damm', 'Lagun', 'Innanhav', 'Öken', 'Sanddyn', 'Oas', 'Saltöken', 'Glaciär', 'Isberg',
  'Snöfält', 'Pol', 'Ekvator', 'Kontinent', 'Arkipelag', 'Landtunga', 'Vulkanö',
];

const weather: SeedItem[] = [
  'Regn', 'Duggregn', 'Skyfall', 'Ösregn', 'Hagel', 'Snö', 'Snöfall', 'Blötsnö', 'Yrsnö', 'Slask',
  'Frost', 'Rimfrost', 'Dimma', 'Dis', 'Moln', 'Åskmoln', 'Blixtnedslag', 'Åskväder', 'Regnbåge',
  'Sol', 'Solsken', 'Värmebölja', 'Torka', 'Kyla', 'Köldknäpp', 'Blåst', 'Bris', 'Kuling', 'Storm',
  'Orkanvind', 'Byvind', 'Virvelvind', 'Sandstorm', 'Snöstorm', 'Isstorm', 'Monsun', 'Passadvind',
  'Nordanvind', 'Föhn', 'Inversion', 'Nederbörd', 'Luftfuktighet', 'Lufttryck', 'Norrsken',
];

const spaceBodies: SeedItem[] = [
  'Merkurius', 'Venus', 'Jorden', 'Mars', 'Jupiter', 'Saturnus', 'Uranus', 'Neptunus', 'Pluto',
  'Ceres', 'Eris', 'Makemake', 'Haumea', 'Månen', 'Phobos', 'Deimos', 'Io', 'Europa', 'Ganymedes',
  'Callisto', 'Titan (måne)', 'Enceladus', 'Mimas', 'Rhea', 'Titania', 'Triton', 'Charon',
  'Asteroidbältet', 'Kuiperbältet', 'Oorts moln', 'Halleys komet', 'Solvinden', 'Solfläck', 'Soleruption',
  'Koronamassutkastning', 'Röd jätte', 'Vit dvärg', 'Brun dvärg', 'Blå superjätte', 'Röd dvärg',
  'Protostjärna', 'Dubbelstjärna', 'Variabel stjärna', 'Kulhop', 'Öppen stjärnhop', 'Spiralgalax',
  'Elliptisk galax', 'Dvärggalax', 'Andromedagalaxen', 'Vintergatan', 'Magellanska molnen', 'Lokala gruppen',
  'Galaxhop', 'Superhop', 'Krabbnebulosan', 'Örnnebulosan', 'Orionnebulosan', 'Ringnebulosan',
  'Planetarisk nebulosa', 'Mörkt moln', 'Stjärnstoft', 'Gravitationsvåg', 'Maskhål', 'Vit vy',
  'Händelsehorisont', 'Ackretionsskiva', 'Kvasar', 'Blazar', 'Pulsar', 'Magnetar', 'Gammablixt',
  'Mörk energi', 'Kosmisk bakgrundsstrålning', 'Exoplanet', 'Superjord', 'Gasjätte', 'Isjätte',
  'Stjärnbild', 'Karlavagnen', 'Orion', 'Cassiopeja', 'Södra korset', 'Vintergatan (dis)',
];

// --- Science, medicine, disease -------------------------------------------
const science: SeedItem[] = [
  { name: 'Kärnklyvning', tags: ['nuclear', 'energy'], power: 88 }, { name: 'Kärnfusion', tags: ['nuclear', 'energy'], power: 92 },
  { name: 'Kedjereaktion', tags: ['nuclear', 'energy'] }, { name: 'Radioaktivt sönderfall', tags: ['radiation'] },
  { name: 'Gammastrålning', tags: ['radiation', 'energy'] }, { name: 'Röntgenstrålning', tags: ['radiation'] },
  { name: 'Ultraviolett strålning', tags: ['radiation'] }, { name: 'Mikrovågor', tags: ['energy'] },
  { name: 'Laserstråle', tags: ['laser', 'energy'] }, { name: 'Partikelstråle', tags: ['energy', 'radiation'] },
  { name: 'Statisk elektricitet', tags: ['lightning', 'energy'] }, { name: 'Högspänning', tags: ['lightning', 'energy'] },
  { name: 'Elektromagnetism', tags: ['energy'] }, { name: 'Supraledning', tags: ['energy'] },
  { name: 'Kvantsammanflätning', tags: ['science'] }, { name: 'Kvantfluktuation', tags: ['science'] },
  'Gravitationskraft', 'Tröghet', 'Rörelseenergi', 'Lägesenergi', 'Termodynamik', 'Entropi (fysik)',
  'Ljusets hastighet', 'Relativitet', 'Tidsdilatation', 'Rödförskjutning', 'Dopplereffekt', 'Resonans',
  'Kärnreaktor', 'Partikelaccelerator', 'Cyklotron', 'Reaktorhärd', 'Isotop', 'Atomkärna', 'Elektron',
  'Proton', 'Neutron', 'Foton', 'Kvark', 'Neutrino', 'Higgsboson', 'Antimateria', 'Positron', 'Muon',
  'Plasma', 'Superfluid', 'Bose-Einstein-kondensat', 'Katalysator', 'Enzym', 'Polymer', 'Kristall',
  { name: 'Svavelsyra', tags: ['acid', 'chemical'] }, { name: 'Saltsyra', tags: ['acid', 'chemical'] },
  { name: 'Salpetersyra', tags: ['acid', 'chemical'] }, { name: 'Flusssyra', tags: ['acid', 'chemical'] },
  { name: 'Natriumhydroxid', tags: ['acid', 'chemical'] }, { name: 'Klorgas', tags: ['poison', 'chemical'] },
  { name: 'Sarin', tags: ['poison', 'chemical'] }, { name: 'Senapsgas', tags: ['poison', 'chemical'] },
  { name: 'Cyanid', tags: ['poison', 'chemical'] }, { name: 'Arsenik', tags: ['poison', 'chemical'] },
  { name: 'Nitroglycerin', tags: ['explosive', 'chemical'] }, { name: 'TNT', tags: ['explosive', 'chemical'] },
];

const medicine: SeedItem[] = [
  'Penicillin', 'Amoxicillin', 'Tetracyklin', 'Streptomycin', 'Insulin', 'Kortison', 'Morfin',
  'Paracetamol', 'Ibuprofen', 'Aspirin', 'Antihistamin', 'Antiviralt medel', 'Antibiotikakur',
  'Vaccin', 'Mässlingsvaccin', 'Influensavaccin', 'Vaccinspruta', 'Serum', 'Motgift', 'Ormserum',
  'Blodtransfusion', 'Dropp', 'Bedövningsmedel', 'Narkos', 'Kemoterapi', 'Strålbehandling',
  'Immunterapi', 'Antikropp', 'Vita blodkroppar', 'Immunförsvar', 'T-cell', 'Fagocyt', 'Interferon',
  'Probiotika', 'Vitamin', 'Elektrolytdropp', 'Defibrillator', 'Pacemaker', 'Respirator', 'Röntgen',
  'Ultraljud', 'Magnetkamera', 'Skalpell', 'Suturer', 'Gips', 'Bandage', 'Plåster', 'Desinfektion',
];

const diseases: SeedItem[] = [
  'Influensa', 'Förkylning', 'Lunginflammation', 'Bronkit', 'Astma', 'Tuberkulos', 'Difteri', 'Kikhosta',
  'Stelkramp', 'Mässling', 'Påssjuka', 'Röda hund', 'Vattkoppor', 'Bältros', 'Herpes', 'Hepatit',
  'Gula febern', 'Denguefeber', 'Malaria', 'Ebola', 'Marburgvirus', 'Kolera', 'Tyfoidfeber', 'Dysenteri',
  'Salmonella', 'Botulism', 'Mjältbrand', 'Pest', 'Böldpest', 'Lungpest', 'Spanska sjukan', 'Sars',
  'Covid', 'Coronavirus', 'HIV', 'Aids', 'Rabies', 'Polio', 'Scharlakansfeber', 'Borrelia', 'TBE',
  'Meningit', 'Encefalit', 'Blodförgiftning', 'Sepsis', 'Gangrän', 'Cancer', 'Leukemi', 'Tumör',
  'Diabetes', 'Alzheimers', 'Parkinsons', 'Epilepsi', 'Stroke', 'Hjärtinfarkt', 'Njursvikt', 'Leversvikt',
  'Parasit', 'Bandmask', 'Spolmask', 'Malariaparasit', 'Amöba', 'Svampinfektion', 'Mögelsvamp', 'Prion',
];

// --- Technology & internet ------------------------------------------------
const technology: SeedItem[] = [
  'Dator', 'Bärbar dator', 'Stationär dator', 'Surfplatta', 'Smartklocka', 'Smartphone', 'Mobiltelefon',
  'Server', 'Molnserver', 'Stordator', 'Superdator', 'Kvantdator', 'Processor', 'Grafikkort', 'Moderkort',
  'Hårddisk', 'SSD', 'Minneskort', 'USB-minne', 'Bildskärm', 'Projektor', 'Tangentbord', 'Datormus',
  'Skrivare', '3D-skrivare', 'Skanner', 'Router', 'Modem', 'Switch', 'Brandvägg', 'Basstation',
  'Mobilmast', 'Fiberkabel', 'Bredband', 'Wifi', 'Bluetooth', 'GPS-mottagare', 'Satellitnav', 'Radar',
  'Sonar', 'Lidar', 'Sensor', 'Rörelsesensor', 'Termostat', 'Övervakningskamera', 'Dörrklocka med kamera',
  'Robotdammsugare', 'Industrirobot', 'Robotarm', 'Drönare', 'Stridsdrönare', 'Självkörande bil',
  'Elmotor', 'Förbränningsmotor', 'Jetmotor', 'Raketmotor', 'Turbin', 'Generator', 'Transformator',
  'Solpanel', 'Solcell', 'Batteri', 'Litiumbatteri', 'Bränslecell', 'Kondensator', 'Halvledare',
  'Transistor', 'Mikrochip', 'Kretskort', 'Exoskelett', 'Cyborgimplantat', 'Neuralt gränssnitt',
  'Hologram', 'VR-headset', 'AR-glasögon', 'Ansiktsigenkänning', 'Fingeravtrycksläsare', 'Röststyrning',
];

const internet: SeedItem[] = [
  'Webbläsare', 'Sökmotor', 'Hemsida', 'Webbapp', 'Molntjänst', 'Databas', 'Big data', 'Algoritm',
  'Källkod', 'Kompilator', 'API', 'Kryptering', 'Lösenord', 'Tvåfaktorsautentisering', 'VPN', 'Proxy',
  'Cookie', 'Cache', 'Bandbredd', 'Streaming', 'Podcast', 'Blogg', 'Forum', 'Sociala medier',
  'Chattbot', 'Språkmodell', 'Maskininlärning', 'Neuralt nätverk', 'Djupinlärning', 'Datorseende',
  { name: 'Datorvirus', tags: ['virus', 'internet'] }, { name: 'Trojansk häst', tags: ['internet'] },
  { name: 'Datormask', tags: ['virus', 'internet'] }, { name: 'Spionprogram', tags: ['internet'] },
  { name: 'Utpressningsvirus', tags: ['internet'] }, { name: 'Rootkit', tags: ['internet'] },
  { name: 'Botnät', tags: ['internet'] }, { name: 'Överbelastningsattack', tags: ['internet'] },
  { name: 'Nätfiske', tags: ['internet'] }, { name: 'Nolldagssårbarhet', tags: ['internet'] },
  'Brandväggsregel', 'Antivirusprogram', 'Krypteringsnyckel', 'Blockkedja', 'Kryptovaluta', 'Bitcoin',
  'NFT', 'Deepfake', 'Emoji', 'Meme', 'Hashtag', 'Livestream', 'Molnlagring', 'Serverhall',
];

// --- Myth, fantasy, magic --------------------------------------------------
const mythGods: SeedItem[] = [
  { name: 'Apollon', tags: ['god', 'mythology'], power: 88, scale: 86 }, { name: 'Ares', tags: ['god', 'mythology'], power: 86 },
  { name: 'Artemis', tags: ['god', 'mythology', 'hunter'] }, { name: 'Athena', tags: ['god', 'mythology'], intelligence: 90 },
  { name: 'Afrodite', tags: ['god', 'mythology'] }, { name: 'Hefaistos', tags: ['god', 'mythology'] },
  { name: 'Hermes', tags: ['god', 'mythology'], speed: 92 }, { name: 'Demeter', tags: ['god', 'mythology'] },
  { name: 'Dionysos', tags: ['god', 'mythology'] }, { name: 'Hera', tags: ['god', 'mythology'] },
  { name: 'Kronos', tags: ['god', 'titan', 'mythology'], power: 90, scale: 88 }, { name: 'Gaia', tags: ['god', 'mythology'], scale: 90 },
  { name: 'Uranos', tags: ['god', 'mythology'] }, { name: 'Prometheus', tags: ['titan', 'mythology'] },
  { name: 'Atlas', tags: ['titan', 'mythology', 'giant'] }, { name: 'Helios', tags: ['god', 'mythology', 'fire'] },
  { name: 'Nike', tags: ['god', 'mythology'] }, { name: 'Hypnos', tags: ['god', 'mythology'] },
  { name: 'Nemesis', tags: ['god', 'mythology'] }, { name: 'Frigg', tags: ['god', 'mythology'] },
  { name: 'Balder', tags: ['god', 'mythology'] }, { name: 'Heimdall', tags: ['god', 'mythology'] },
  { name: 'Frej', tags: ['god', 'mythology'] }, { name: 'Freja', tags: ['god', 'mythology'] },
  { name: 'Njord', tags: ['god', 'mythology', 'water'] }, { name: 'Tyr', tags: ['god', 'mythology'] },
  { name: 'Ull', tags: ['god', 'mythology'] }, { name: 'Brage', tags: ['god', 'mythology'] },
  { name: 'Hel', tags: ['god', 'mythology', 'undead'] }, { name: 'Ra', tags: ['god', 'mythology', 'fire'], scale: 88 },
  { name: 'Anubis', tags: ['god', 'mythology'] }, { name: 'Horus', tags: ['god', 'mythology'] },
  { name: 'Osiris', tags: ['god', 'mythology'] }, { name: 'Isis', tags: ['god', 'mythology'] },
  { name: 'Set', tags: ['god', 'mythology'] }, { name: 'Sekhmet', tags: ['god', 'mythology'] },
  { name: 'Thoth', tags: ['god', 'mythology'], intelligence: 92 }, { name: 'Sobek', tags: ['god', 'mythology'] },
  { name: 'Quetzalcoatl', tags: ['god', 'mythology'] }, { name: 'Shiva', tags: ['god', 'mythology'], scale: 90 },
  { name: 'Vishnu', tags: ['god', 'mythology'], scale: 90 }, { name: 'Brahma', tags: ['god', 'mythology'], scale: 90 },
  { name: 'Indra', tags: ['god', 'mythology', 'lightning'] }, { name: 'Amaterasu', tags: ['god', 'mythology', 'fire'] },
  { name: 'Susanoo', tags: ['god', 'mythology', 'storm'] }, { name: 'Raijin', tags: ['god', 'mythology', 'lightning'] },
];

const mythCreatures: SeedItem[] = [
  { name: 'Cyklop', tags: ['monster', 'giant', 'mythology'] }, { name: 'Hydra', tags: ['monster', 'mythology'], power: 74 },
  { name: 'Kerberos', tags: ['monster', 'mythology'] }, { name: 'Chimära', tags: ['monster', 'mythology', 'fire'] },
  { name: 'Manticore', tags: ['monster', 'mythology'] }, { name: 'Harpya', tags: ['monster', 'mythology', 'flying'] },
  { name: 'Gorgon', tags: ['monster', 'mythology'] }, { name: 'Sfinx', tags: ['monster', 'mythology'] },
  { name: 'Kentaur', tags: ['monster', 'mythology'] }, { name: 'Minotaurus', tags: ['monster', 'mythology'] },
  { name: 'Satyr', tags: ['mythology'] }, { name: 'Faun', tags: ['mythology'] }, { name: 'Najad', tags: ['mythology', 'water'] },
  { name: 'Sirén', tags: ['monster', 'mythology'] }, { name: 'Grip', tags: ['monster', 'mythology', 'flying'] },
  { name: 'Basilisk', tags: ['monster', 'mythology', 'poison'] }, { name: 'Kraken', tags: ['monster', 'mythology', 'aquatic', 'giant'], power: 82 },
  { name: 'Leviatan', tags: ['monster', 'mythology', 'aquatic', 'giant'], power: 84 }, { name: 'Behemot', tags: ['monster', 'mythology', 'giant'], power: 84 },
  { name: 'Fenix', tags: ['monster', 'mythology', 'fire', 'flying', 'legendary'], power: 80 }, { name: 'Rok', tags: ['monster', 'mythology', 'flying', 'giant'] },
  { name: 'Wendigo', tags: ['monster', 'mythology', 'undead'] }, { name: 'Golem', tags: ['monster', 'mythology', 'material'] },
  { name: 'Jättetroll', tags: ['monster', 'mythology', 'giant'] }, { name: 'Bäckahäst', tags: ['monster', 'mythology', 'water'] },
  { name: 'Näcken', tags: ['mythology', 'water'] }, { name: 'Skogsrå', tags: ['mythology'] }, { name: 'Vittra', tags: ['mythology'] },
  { name: 'Lindorm', tags: ['monster', 'mythology', 'dragon'] }, { name: 'Fenrisulven', tags: ['monster', 'mythology', 'predator', 'giant'], power: 86 },
  { name: 'Midgårdsormen', tags: ['monster', 'mythology', 'giant', 'aquatic'], power: 88 }, { name: 'Sleipner', tags: ['mythology'] },
  { name: 'Valkyria', tags: ['mythology'] }, { name: 'Jotun', tags: ['monster', 'mythology', 'giant'] },
  { name: 'Yeti', tags: ['monster', 'giant'] }, { name: 'Bigfoot', tags: ['monster'] }, { name: 'Sjöodjur', tags: ['monster', 'aquatic'] },
  { name: 'Loch Ness-odjuret', tags: ['monster', 'aquatic'] }, { name: 'Chupacabra', tags: ['monster'] },
];

const fantasyCreatures: SeedItem[] = [
  { name: 'Alv', tags: ['fantasy'] }, { name: 'Mörkeralv', tags: ['fantasy', 'magic'] }, { name: 'Dvärg', tags: ['fantasy'] },
  { name: 'Hobbit', tags: ['fantasy'] }, { name: 'Ork', tags: ['fantasy', 'monster'] }, { name: 'Uruk', tags: ['fantasy', 'monster'] },
  { name: 'Goblin', tags: ['fantasy', 'monster'] }, { name: 'Hobgoblin', tags: ['fantasy', 'monster'] }, { name: 'Kobold', tags: ['fantasy'] },
  { name: 'Trollkarlslärling', tags: ['fantasy', 'magic', 'wizard'] }, { name: 'Nekromantiker', tags: ['fantasy', 'magic', 'undead'] },
  { name: 'Lich', tags: ['fantasy', 'magic', 'undead'], power: 78 }, { name: 'Vålnad', tags: ['fantasy', 'undead'] },
  { name: 'Gengångare', tags: ['fantasy', 'undead'] }, { name: 'Skelettkrigare', tags: ['fantasy', 'undead'] },
  { name: 'Ghoul', tags: ['fantasy', 'undead'] }, { name: 'Mumie', tags: ['fantasy', 'undead'] }, { name: 'Banshee', tags: ['fantasy', 'undead'] },
  { name: 'Varulv', tags: ['fantasy', 'monster', 'predator'] }, { name: 'Vampyrfurste', tags: ['fantasy', 'undead', 'predator'], power: 74 },
  { name: 'Succubus', tags: ['fantasy', 'demon', 'magic'] }, { name: 'Imp', tags: ['fantasy', 'demon'] },
  { name: 'Balrog', tags: ['fantasy', 'demon', 'fire', 'giant'], power: 86 }, { name: 'Ärkedemon', tags: ['fantasy', 'demon'], power: 84 },
  { name: 'Gargoyle', tags: ['fantasy', 'monster', 'material', 'flying'] }, { name: 'Slem', tags: ['fantasy', 'monster'] },
  { name: 'Ent', tags: ['fantasy', 'tree', 'giant'] }, { name: 'Trädande', tags: ['fantasy', 'tree'] },
  { name: 'Enhörning', tags: ['fantasy', 'magic'] }, { name: 'Pegasus', tags: ['fantasy', 'flying'] },
  { name: 'Hippogrif', tags: ['fantasy', 'flying'] }, { name: 'Wyvern', tags: ['fantasy', 'dragon', 'flying'] },
  { name: 'Isdrake', tags: ['fantasy', 'dragon', 'ice', 'flying'], power: 86 }, { name: 'Elddrake', tags: ['fantasy', 'dragon', 'fire', 'flying'], power: 88 },
  { name: 'Hydradrake', tags: ['fantasy', 'dragon'] }, { name: 'Fedrottning', tags: ['fantasy', 'magic'] },
  { name: 'Älva', tags: ['fantasy', 'magic', 'flying'] }, { name: 'Tomtenisse', tags: ['fantasy'] }, { name: 'Vätte', tags: ['fantasy'] },
  { name: 'Djinn', tags: ['fantasy', 'magic'] }, { name: 'Golemvakt', tags: ['fantasy', 'material', 'armored'] },
];

const magic: SeedItem[] = [
  'Eldklot', 'Isstorm', 'Blixtnedslag', 'Frostnova', 'Meteorregn', 'Jordbävningsformel', 'Tromb',
  'Läkande ljus', 'Sköldmagi', 'Osynlighetsbesvärjelse', 'Teleportering', 'Portalmagi', 'Tidsstopp',
  'Tidsresa', 'Sinneskontroll', 'Illusion', 'Förbannelse', 'Förhäxning', 'Förbannad amulett',
  'Livseliksir', 'Odödlighetsdryck', 'Polyjuice', 'Trollstav', 'Magisk stav', 'Runsten', 'Besvärjelsebok',
  'Kristallkula', 'Spådomsklot', 'Amulett', 'Talisman', 'Magisk ring', 'Flygande matta', 'Sjumilastövlar',
  'Osynlighetsmantel', 'De vises sten', 'Nekromanti', 'Själamagi', 'Blodmagi', 'Elementarmagi',
  'Besvärjelse', 'Ritual', 'Häxkonst', 'Vodoo', 'Andebesvärjelse', 'Manabränning',
];

// --- Heroes, villains, characters -----------------------------------------
const heroes: SeedItem[] = [
  'Captain America', 'Black Widow', 'Hawkeye', 'Ant-Man', 'Wasp', 'Falcon', 'Winter Soldier', 'War Machine',
  'Vision', 'Scarlet Witch', 'Quicksilver', 'Star-Lord', 'Gamora', 'Drax', 'Rocket Raccoon', 'Groot',
  'Nebula', 'Nova', 'Wolverine', 'Cyclops', 'Jean Grey', 'Rogue', 'Gambit', 'Nightcrawler', 'Beast',
  'Colossus', 'Iceman', 'Angel', 'Professor X', 'Deadpool', 'Cable', 'Daredevil', 'Elektra', 'Punisher',
  'Ghost Rider', 'Blade', 'Moon Knight', 'Silver Surfer', 'Mr Fantastic', 'Invisible Woman', 'Human Torch',
  'The Thing', 'Wonder Woman', 'Flash', 'Green Lantern', 'Aquaman', 'Cyborg', 'Green Arrow', 'Martian Manhunter',
  'Shazam', 'Nightwing', 'Robin', 'Batgirl', 'Supergirl', 'Hawkgirl', 'Zatanna', 'John Constantine',
  'Blue Beetle', 'Black Canary', 'Atom', 'Firestorm',
];

const villains: SeedItem[] = [
  'Loki', 'Ultron', 'Red Skull', 'Kingpin', 'Green Goblin', 'Doctor Octopus', 'Venom', 'Carnage',
  'Mysterio', 'Vulture', 'Rhino', 'Sandman', 'Electro', 'Kraven', 'Juggernaut', 'Mystique', 'Sabretooth',
  'Apocalypse', 'Mister Sinister', 'Dormammu', 'Kang', 'Ronan', 'Abomination', 'Red Hulk', 'Doomsday',
  'Brainiac', 'Sinestro', 'Black Adam', 'Reverse-Flash', 'Bane', 'Riddler', 'Penguin', 'Two-Face',
  'Scarecrow', 'Poison Ivy', 'Harley Quinn', 'Deathstroke', 'Ra\'s al Ghul', 'Black Manta', 'Cheetah',
  'Gorilla Grodd', 'Captain Cold', 'Mister Freeze', 'Clayface', 'Killer Croc', 'The Mandarin', 'Hela',
  'Kilgrave', 'Vulturkungen', 'Skrik', 'Skräckväsen',
];

const gameChars: SeedItem[] = [
  'Link', 'Zelda', 'Ganondorf', 'Samus Aran', 'Kirby', 'Fox McCloud', 'Captain Falcon', 'Pit', 'Ness',
  'Luigi', 'Peach', 'Bowser', 'Yoshi', 'Wario', 'Waluigi', 'Toad', 'Rosalina', 'Sonic', 'Tails', 'Knuckles',
  'Shadow', 'Dr Eggman', 'Crash Bandicoot', 'Spyro', 'Rayman', 'Mega Man', 'Pac-Man', 'Donkey Kong',
  'Diddy Kong', 'Kratos', 'Nathan Drake', 'Lara Croft', 'Master Chief', 'Cortana', 'Doomguy', 'Gordon Freeman',
  'Geralt', 'Ciri', 'Cloud Strife', 'Sephiroth', 'Tifa', 'Aerith', 'Squall', 'Tidus', 'Auron', 'Zidane',
  'Solid Snake', 'Big Boss', 'Raiden', 'Ryu', 'Ken', 'Chun-Li', 'Akuma', 'M Bison', 'Scorpion', 'Sub-Zero',
  'Raiden (MK)', 'Liu Kang', 'Shao Kahn', 'Jin Kazama', 'Heihachi', 'Kasumi', 'Steve', 'Alex', 'Ellie',
  'Joel', 'Arthur Morgan', 'John Marston', 'Trevor', 'Ezio', 'Altair', 'Kassandra', 'Aloy', '2B', 'Bayonetta',
  'Dante', 'Vergil', 'Nero', 'Leon Kennedy', 'Jill Valentine', 'Chris Redfield', 'Nemesis', 'Pyramid Head',
];

const movieChars: SeedItem[] = [
  'Darth Vader', 'Luke Skywalker', 'Yoda', 'Obi-Wan Kenobi', 'Han Solo', 'Chewbacca', 'Boba Fett', 'Kylo Ren',
  'Palpatine', 'Rey', 'Mandalorianen', 'Grogu', 'Terminatorn', 'RoboCop', 'John Rambo', 'John McClane',
  'James Bond', 'Indiana Jones', 'Rocky', 'Neo', 'Morpheus', 'Agent Smith', 'Gandalf', 'Frodo', 'Aragorn',
  'Legolas', 'Gimli', 'Sauron', 'Saruman', 'Gollum', 'Smaug', 'Harry Potter', 'Hermione', 'Ron Weasley',
  'Dumbledore', 'Voldemort', 'Snape', 'Hagrid', 'Jack Sparrow', 'Davy Jones', 'Jason Bourne', 'Ethan Hunt',
  'Wednesday Addams', 'Freddy Krueger', 'Jason Voorhees', 'Michael Myers', 'Chucky', 'Pennywise', 'Hannibal Lecter',
  'Xenomorf', 'Predatorn', 'King Kong', 'Godzilla', 'Mothra', 'Rodan', 'Gremlins', 'E.T.', 'Wall-E', 'Optimus Prime',
  'Megatron', 'Bumblebee', 'Iron Giant', 'Baby Yoda', 'Shrek', 'Buzz Lightyear', 'Woody',
];

const animeChars: SeedItem[] = [
  'Gohan', 'Piccolo', 'Frieza', 'Cell', 'Majin Buu', 'Trunks', 'Broly', 'Beerus', 'Whis',
  'Kakashi', 'Itachi', 'Madara', 'Pain', 'Jiraiya', 'Tsunade', 'Gaara', 'Rock Lee', 'Hinata', 'Boruto',
  'Zoro', 'Sanji', 'Nami', 'Usopp', 'Chopper', 'Robin', 'Franky', 'Brook', 'Shanks', 'Whitebeard', 'Kaido',
  'Rukia', 'Aizen', 'Kenpachi', 'Byakuya', 'Grimmjow', 'Edward Elric', 'Alphonse', 'Roy Mustang', 'Homunculus',
  'Mikasa', 'Armin', 'Reiner', 'Erwin', 'Gojo Satoru', 'Sukuna', 'Yuji', 'Megumi', 'Nobara', 'Nezuko',
  'Zenitsu', 'Inosuke', 'Rengoku', 'Muzan', 'Deku', 'Bakugo', 'Todoroki', 'All Might', 'Endeavor', 'Shigaraki',
  'Asta', 'Yuno', 'Meliodas', 'Escanor', 'Ban', 'Guts', 'Griffith', 'Thorfinn', 'Vinland', 'Lelouch',
  'Spike Spiegel', 'Vash', 'Kenshin', 'Alucard', 'Yusuke', 'Hiei', 'Kurama', 'Ichigo Kurosaki',
];

// --- History & concepts ----------------------------------------------------
const history: SeedItem[] = [
  { name: 'Julius Caesar', tags: ['history', 'human', 'military'] }, { name: 'Alexander den store', tags: ['history', 'human', 'military'], power: 62 },
  { name: 'Napoleon', tags: ['history', 'human', 'military'], power: 62 }, { name: 'Djingis khan', tags: ['history', 'human', 'military'], power: 66 },
  { name: 'Attila', tags: ['history', 'human', 'military'] }, { name: 'Hannibal', tags: ['history', 'human', 'military'] },
  { name: 'Spartacus', tags: ['history', 'human', 'soldier'] }, { name: 'Kleopatra', tags: ['history', 'human'] },
  { name: 'Karl den store', tags: ['history', 'human', 'military'] }, { name: 'Vilhelm Erövraren', tags: ['history', 'human', 'military'] },
  { name: 'Rikard Lejonhjärta', tags: ['history', 'human', 'soldier'] }, { name: 'Saladin', tags: ['history', 'human', 'military'] },
  { name: 'Jeanne d\'Arc', tags: ['history', 'human', 'soldier'] }, { name: 'Gustav Vasa', tags: ['history', 'human'] },
  { name: 'Karl XII', tags: ['history', 'human', 'military'] }, { name: 'Vercingetorix', tags: ['history', 'human', 'soldier'] },
  { name: 'Leonidas', tags: ['history', 'human', 'soldier'] }, { name: 'Xerxes', tags: ['history', 'human', 'military'] },
  'Vikingahövding', 'Berserk', 'Korsfarare', 'Tempelriddare', 'Musketör', 'Kavallerist', 'Bågskyttekår',
  'Falang', 'Legion', 'Centurion', 'Legionär', 'Sjörövare', 'Fribytare', 'Kapare', 'Härförare',
  'Kejsarinna', 'Sultan', 'Tsar', 'Schah', 'Maharadja', 'Vesir', 'Riksmarskalk', 'Storfurste',
];

const concepts: SeedItem[] = [
  { name: 'Evigheten', tags: ['concept', 'abstract', 'time'], scale: 92 }, { name: 'Nuet', tags: ['concept', 'abstract', 'time'] },
  { name: 'Framtiden', tags: ['concept', 'abstract', 'time'] }, { name: 'Det förflutna', tags: ['concept', 'abstract', 'time'] },
  { name: 'Ödesväven', tags: ['concept', 'abstract'] }, { name: 'Slumpen', tags: ['concept', 'abstract'] },
  { name: 'Rättvisan', tags: ['concept', 'abstract'] }, { name: 'Friheten', tags: ['concept', 'abstract'] },
  { name: 'Makten', tags: ['concept', 'abstract'] }, { name: 'Viljan', tags: ['concept', 'abstract'] },
  { name: 'Medvetandet', tags: ['concept', 'abstract'], intelligence: 88 }, { name: 'Själen', tags: ['concept', 'abstract'] },
  { name: 'Anden', tags: ['concept', 'abstract'] }, { name: 'Drömmen', tags: ['concept', 'abstract'] },
  { name: 'Mardrömmen', tags: ['concept', 'abstract'] }, { name: 'Tanken', tags: ['concept', 'abstract'] },
  { name: 'Idén', tags: ['concept', 'abstract'] }, { name: 'Kunskapen', tags: ['concept', 'abstract'], intelligence: 90 },
  { name: 'Visdomen', tags: ['concept', 'abstract'], intelligence: 92 }, { name: 'Sanningen', tags: ['concept', 'abstract'] },
  { name: 'Lögnen', tags: ['concept', 'abstract'] }, { name: 'Tron', tags: ['concept', 'abstract'] },
  { name: 'Hoppet', tags: ['concept', 'abstract'] }, { name: 'Förtvivlan', tags: ['concept', 'abstract'] },
  { name: 'Girigheten', tags: ['concept', 'abstract'] }, { name: 'Avunden', tags: ['concept', 'abstract'] },
  { name: 'Vreden', tags: ['concept', 'abstract'] }, { name: 'Stoltheten', tags: ['concept', 'abstract'] },
  { name: 'Modet', tags: ['concept', 'abstract'] }, { name: 'Fruktan', tags: ['concept', 'abstract'] },
  { name: 'Ordningen', tags: ['concept', 'abstract'] }, { name: 'Kaoset', tags: ['concept', 'abstract'], power: 84 },
  { name: 'Balansen', tags: ['concept', 'abstract'] }, { name: 'Tomrummet', tags: ['concept', 'abstract', 'cosmic'], scale: 90 },
  { name: 'Intet', tags: ['concept', 'abstract', 'cosmic'], scale: 92 }, { name: 'Skapelsen', tags: ['concept', 'abstract', 'cosmic'], scale: 94 },
  { name: 'Förintelsen', tags: ['concept', 'abstract', 'cosmic'], power: 92, scale: 92 }, { name: 'Dimensionen', tags: ['concept', 'abstract', 'cosmic'] },
  { name: 'Paradoxen', tags: ['concept', 'abstract'] }, { name: 'Gravitationen', tags: ['concept', 'gravity'] },
];

const FL_ANIMAL = ['{name} är ett djur som förlitar sig på instinkt och styrka.', '{name} har format av evolutionen.'];
const FL_PLANT = ['{name} växer och breder ut sig.', '{name} hör till växtriket.'];
const FL_MADE = ['{name} är skapad av människohand.', '{name} tjänar sitt syfte i rätt händer.'];
const FL_PLACE = ['{name} är en plats på kartan.', '{name} har sin egen historia.'];
const FL_BEING = ['{name} är en varelse från sägen och fantasi.', '{name} bär på krafter bortom det vardagliga.'];
const FL_ABSTRACT = ['{name} är ett begrepp som påverkar allt.', '{name} går inte att ta på, men märks överallt.'];

export const MEGA_CATEGORIES: SeedCategory[] = [
  block('animals', ['animal', 'mammal', 'organic', 'living'], S(40, 55, 18, 25), 28, FL_ANIMAL, mammals, ['universal', 'elemental']),
  block('birds', ['bird', 'animal', 'flying', 'organic', 'living'], S(24, 72, 30, 22), 20, FL_ANIMAL, birds),
  block('fish', ['fish', 'animal', 'aquatic', 'organic', 'living'], S(30, 54, 12, 12), 24, FL_ANIMAL, fish),
  block('insects', ['insect', 'animal', 'organic', 'living'], S(16, 46, 8, 8), 12, FL_ANIMAL, insects),
  block('animals', ['reptile', 'animal', 'organic', 'living'], S(38, 46, 14, 18), 26, FL_ANIMAL, reptiles),
  block('animals', ['animal', 'aquatic', 'organic', 'living'], S(30, 40, 14, 24), 24, FL_ANIMAL, seaCreatures),
  block('dinosaurs', ['dinosaur', 'animal', 'organic', 'living'], S(62, 46, 20, 16), 44, FL_ANIMAL, dinosaurs),
  block('plants', ['tree', 'plant', 'organic', 'living', 'nature'], S(38, 6, 30, 8), 40, FL_PLANT, trees),
  block('plants', ['plant', 'organic', 'living', 'nature'], S(20, 8, 22, 6), 22, FL_PLANT, flowers),
  block('plants', ['plant', 'organic', 'living', 'nature'], S(26, 8, 24, 8), 26, FL_PLANT, plants),
  block('fungi', ['fungus', 'organic', 'living'], S(22, 6, 20, 6), 18, FL_PLANT, fungi),
  block('food', ['food', 'organic'], S(10, 10, 10, 4), 12, ['{name} är mat på tallriken.', '{name} lockar magen.'], fruitsVeg),
  block('food', ['food', 'organic'], S(12, 10, 12, 4), 14, ['{name} är en maträtt.', '{name} serveras varm eller kall.'], dishes),
  block('drinks', ['food', 'organic'], S(8, 12, 10, 4), 10, ['{name} släcker törsten.', '{name} är en dryck.'], drinks),
  block('bodyparts', ['human', 'organic', 'living'], S(14, 26, 8, 18), 14, ['{name} är en del av kroppen.', '{name} fyller sin funktion.'], bodyparts),
  block('professions', ['human', 'profession'], S(42, 46, 34, 62), 40, ['{name} bemästrar sitt yrke.', '{name} löser problem med kunskap.'], professions),
  block('sports', ['human', 'sport'], S(52, 62, 20, 36), 34, ['{name} är i toppform.', '{name} har tränat hårt.'], sports),
  block('music', ['music', 'sound'], S(26, 66, 55, 30), 28, ['{name} skapar ljud och musik.', '{name} får luften att vibrera.'], music),
  block('weapons', ['weapon'], S(52, 45, 45, 10), 44, FL_MADE, weapons, ['tech']),
  block('vehicles', ['vehicle', 'machine'], S(46, 62, 30, 20), 46, FL_MADE, vehicles, ['tech']),
  block('tools', ['tool'], S(30, 30, 15, 10), 26, FL_MADE, tools),
  block('buildings', ['building'], S(44, 4, 22, 6), 55, FL_MADE, buildings),
  block('materials', ['material'], S(40, 6, 12, 4), 38, FL_MADE, materials),
  block('places', ['country'], S(74, 20, 72, 55), 78, FL_PLACE, countries),
  block('places', ['city', 'building'], S(46, 12, 40, 40), 62, FL_PLACE, cities),
  block('nature', ['nature'], S(52, 16, 50, 8), 55, FL_PLACE, geography, ['universal']),
  block('weather', ['weather'], S(52, 62, 55, 5), 55, ['{name} sveper fram över landet.', '{name} är en väderkraft.'], weather),
  block('space', ['space'], S(76, 55, 70, 8), 84, ['{name} hör hemma i rymden.', '{name} är en del av kosmos.'], spaceBodies),
  block('science', ['science', 'energy'], S(62, 62, 52, 45), 60, ['{name} är ett vetenskapligt fenomen.', '{name} bär på energi.'], science),
  block('medicine', ['medicine', 'science'], S(38, 45, 42, 62), 45, ['{name} bekämpar sjukdom.', '{name} hör till läkekonsten.'], medicine),
  block('diseases', ['disease', 'organic'], S(58, 45, 66, 14), 55, ['{name} sprider sig och skördar offer.', '{name} är ett biologiskt hot.'], diseases),
  block('technology', ['technology', 'electronic'], S(42, 56, 46, 66), 52, FL_MADE, technology, ['tech']),
  block('internet', ['internet', 'technology', 'electronic'], S(44, 84, 74, 62), 50, ['{name} lever i det digitala.', '{name} sprids genom nätet.'], internet),
  block('mythology', ['god', 'mythology'], S(84, 60, 62, 66), 84, ['{name} är en gestalt ur mytologin.', '{name} bär gudomlig makt.'], mythGods),
  block('mythology', ['monster', 'mythology'], S(72, 55, 45, 40), 62, FL_BEING, mythCreatures, ['elemental']),
  block('fantasy', ['fantasy'], S(60, 55, 42, 45), 55, FL_BEING, fantasyCreatures, ['elemental']),
  block('magic', ['magic'], S(64, 62, 60, 60), 62, ['{name} böjer verklighetens regler.', '{name} kanaliserar magisk kraft.'], magic),
  block('heroes', ['superhero'], S(76, 68, 55, 62), 72, ['{name} kämpar för det goda.', '{name} har extraordinära krafter.'], heroes),
  block('villains', ['villain'], S(78, 62, 58, 78), 76, ['{name} sprider skräck.', '{name} smider onda planer.'], villains),
  block('characters', [], S(58, 62, 40, 55), 55, ['{name} är en känd spelkaraktär.', '{name} har blivit legendarisk bland spelare.'], gameChars),
  block('characters', [], S(60, 58, 42, 55), 56, ['{name} är en ikonisk filmkaraktär.', '{name} lever kvar i populärkulturen.'], movieChars),
  block('anime', ['legendary'], S(82, 74, 55, 58), 70, ['{name} är en mäktig anime-karaktär.', '{name} slåss med övermänskliga krafter.'], animeChars),
  block('history', ['human', 'history'], S(56, 52, 42, 58), 52, ['{name} satte spår i historien.', '{name} är känd genom tiderna.'], history),
  block('concepts', ['concept', 'abstract'], S(66, 60, 62, 72), 68, FL_ABSTRACT, concepts),
];
