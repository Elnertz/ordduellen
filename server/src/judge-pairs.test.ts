import { describe, expect, it } from 'vitest';
import { getDatabase } from './database.js';
import { judge } from './judge.js';

const db = getDatabase();

function beats(targetWord: string, answerWord: string): boolean {
  const t = db.resolve(targetWord);
  const a = db.resolve(answerWord);
  return judge(t.entry, a.entry, a.ref.matchType, a.ref.resolved).approved;
}

// Hundreds of known word pairs the judge must get right. [target, answer] where
// `answer` should defeat `target`.
const SHOULD_APPROVE: Array<[string, string]> = [
  ['Eld', 'Vatten'], ['Is', 'Eld'], ['Skog', 'Eld'], ['Träd', 'Eld'], ['Träd', 'Motorsåg'],
  ['Mus', 'Katt'], ['Katt', 'Hund'], ['Katt', 'Björn'], ['Hund', 'Varg'], ['Varg', 'Björn'],
  ['Björn', 'Jägare'], ['Lejon', 'Jägare'], ['Get', 'Varg'], ['Får', 'Varg'], ['Ko', 'Lejon'],
  ['Häst', 'Lejon'], ['Gris', 'Varg'], ['Hjort', 'Varg'], ['Älg', 'Björn'], ['Kanin', 'Räv'],
  ['Kanin', 'Örn'], ['Mus', 'Räv'], ['Fisk', 'Haj'], ['Sill', 'Haj'], ['Fisk', 'Björn'],
  ['Sill', 'Val'], ['Räka', 'Haj'], ['Fågel', 'Falk'], ['Fågel', 'Örn'], ['Duva', 'Falk'],
  ['Soldat', 'Stridsvagn'], ['Stridsvagn', 'Missil'], ['Stridsvagn', 'Kärnvapen'], ['Byggnad', 'Bomb'],
  ['Hus', 'Bomb'], ['Byggnad', 'Jordbävning'], ['Skyskrapa', 'Jordbävning'], ['Bro', 'Bomb'],
  ['Fabrik', 'Bomb'], ['Fästning', 'Kärnvapen'], ['Bunker', 'Kärnvapen'], ['Stad', 'Kärnvapen'],
  ['Stad', 'Godzilla'], ['Stad', 'Asteroid'], ['Stad', 'Meteor'], ['Stad', 'Vulkan'], ['Stad', 'Tsunami'],
  ['Stad', 'Orkan'], ['Byggnad', 'Orkan'], ['Bil', 'Missil'], ['Lastbil', 'Missil'], ['Flygplan', 'Missil'],
  ['Riddare', 'Gevär'], ['Riddare', 'Drake'], ['Soldat', 'Prickskyttegevär'], ['Soldat', 'Godzilla'],
  ['Armé', 'Kärnvapen'], ['Monster', 'Superman'], ['Monster', 'Batman'], ['Människa', 'Godzilla'],
  ['Björn', 'Godzilla'], ['Människa', 'King Kong'], ['Dator', 'EMP'], ['Robot', 'EMP'], ['Bil', 'EMP'],
  ['Maskin', 'EMP'], ['Robot', 'Hackare'], ['Dator', 'Hackare'], ['AI', 'Hackare'], ['Robot', 'Laserpistol'],
  ['Robot', 'Blixt'], ['Dator', 'Blixt'], ['Satellit', 'EMP'], ['Drönare', 'EMP'], ['Virus', 'Vaccin'],
  ['Bakterie', 'Antibiotika'], ['Sjukdom', 'Medicin'], ['Influensa', 'Vaccin'], ['Pest', 'Vaccin'],
  ['Kolera', 'Antibiotika'], ['Cancer', 'Kemoterapi'], ['Planet', 'Svart hål'], ['Stjärna', 'Svart hål'],
  ['Asteroid', 'Svart hål'], ['Missil', 'Asteroid'], ['Planet', 'Asteroid'], ['Måne', 'Svart hål'],
  ['Mars', 'Svart hål'], ['Sol', 'Svart hål'], ['Komet', 'Svart hål'], ['Planet', 'Meteor'],
  ['Stad', 'Komet'], ['Svart hål', 'Gud'], ['Svart hål', 'Verklighetsböjare'], ['Svart hål', 'Skaparen'],
  ['Gud', 'Verklighetsböjare'], ['Gud', 'Skaparen'], ['Tid', 'Verklighetsböjare'], ['Drake', 'Trollkarl'],
  ['Drake', 'Zeus'], ['Drake', 'Oden'], ['Zombie', 'Eld'], ['Berg', 'Jordbävning'], ['Is', 'Sol'],
  ['Snö', 'Sol'], ['Dinosaurie', 'Asteroid'], ['Tyrannosaurus', 'Jägare'], ['Tyrannosaurus', 'Asteroid'],
  ['Dinosaurie', 'Jägare'], ['Get', 'Tyrannosaurus'], ['Människa', 'Tyrannosaurus'], ['Människa', 'Virus'],
  ['Människa', 'Goku'], ['Björn', 'King Kong'], ['Slott', 'Drake'],
];

// [target, answer] where `answer` should NOT defeat `target`.
const SHOULD_REJECT: Array<[string, string]> = [
  ['Kärnvapen', 'Banan'], ['Universum', 'Banan'], ['Stridsvagn', 'Kniv'], ['Svart hål', 'Mygga'],
  ['Asteroid', 'Myra'], ['Lejon', 'Mus'], ['Elefant', 'Mus'], ['Björn', 'Kanin'], ['Björn', 'Mus'],
  ['Gud', 'Människa'], ['Gud', 'Katt'], ['Gud', 'Sten'], ['Robot', 'Vatten'], ['Kärnvapen', 'Vatten'],
  ['Vatten', 'Eld'], ['Hav', 'Eld'], ['Sol', 'Is'], ['Haj', 'Guldfisk'], ['Stad', 'Myra'], ['Berg', 'Myra'],
  ['Drake', 'Mus'], ['Drake', 'Kanin'], ['Planet', 'Sten'], ['Planet', 'Mus'], ['Dator', 'Banan'],
  ['Robot', 'Banan'], ['Universum', 'Sten'], ['Val', 'Mygga'], ['Elefant', 'Myra'], ['Lejon', 'Kanin'],
  ['Missil', 'Fjäril'], ['Svart hål', 'Katt'], ['Godzilla', 'Myra'], ['Kärnvapen', 'Sten'],
];

describe('judge — known pairs that must be approved', () => {
  it.each(SHOULD_APPROVE)('%s besegras av %s', (target, answer) => {
    expect(beats(target, answer)).toBe(true);
  });
});

describe('judge — known pairs that must be rejected', () => {
  it.each(SHOULD_REJECT)('%s besegras INTE av %s', (target, answer) => {
    expect(beats(target, answer)).toBe(false);
  });
});

describe('judge — regression chains keep working', () => {
  it('the canonical escalating chain approves every link', () => {
    const chain = ['Katt', 'Hund', 'Björn', 'Jägare', 'Stridsvagn', 'Missil', 'Asteroid', 'Svart hål', 'Gud', 'Verklighetsböjare'];
    for (let i = 0; i < chain.length - 1; i += 1) {
      expect(beats(chain[i], chain[i + 1])).toBe(true);
    }
  });

  it('most links of the spec example chain approve', () => {
    const chain = ['Mus', 'Katt', 'Hund', 'Varg', 'Björn', 'Jägare', 'Gevär', 'Stridsvagn', 'Missil', 'Asteroid', 'Svart hål', 'Gud'];
    let approved = 0;
    for (let i = 0; i < chain.length - 1; i += 1) {
      if (beats(chain[i], chain[i + 1])) approved += 1;
    }
    expect(approved / (chain.length - 1)).toBeGreaterThanOrEqual(0.75);
  });
});
