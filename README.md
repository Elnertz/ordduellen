# Ordduellen

**Ordduellen** är ett strategiskt svenskt ordspel — en *resonemangsduell*. Två spelare
turas om: en får ett målord, och motståndaren ska svara med ett ord som realistiskt
skulle kunna **besegra, förinta, överlista, överleva eller kontrollera** målet. En
AI-domare avgör om svaret är trovärdigt och förklarar varför — på naturlig svenska.

```
Katt → Hund → Björn → Jägare → Stridsvagn → Missil → Asteroid → Svart hål → Gud
```

Om svaret godkänns får spelaren en poäng och svaret blir det nya målordet. Spelet kan
pågå i all oändlighet eller till en viss poäng.

Det finns inga färdiga facit — domaren resonerar dynamiskt utifrån en **databas med
över 11 000 sammanlänkade ord**, deras kategorier, egenskaper (kraft, snabbhet,
räckvidd, intelligens), skala och taggar (`besegrar`/`sårbar mot`).

## Så fungerar domaren

Domaren jämför **taggar** via en relationsgraf (t.ex. `vatten` slår `eld`, `elektromagnetisk
puls` slår `robot`), väger in **existensskala** (en myra ≪ ett kärnvapen ≪ ett svart hål)
och **stridsegenskaper**, och kräver aldrig hårdkodade ordpar. Varje beslut kommer med en
svensk motivering, t.ex.:

> *Godkänt! Asteroid utnyttjar sin enorma massa mot missilens projektil, och verkar dessutom
> på en helt annan storleksordning. Asteroid besegrar Missil.*

Okända ord hanteras genom taggigenkänning så att spelet fungerar för i princip vilket ord
som helst.

## Databasen

Databasen genereras deterministiskt från kurerade grunddata (djur, vapen, rymden,
grundämnen, mytologi, superhjältar, Pokémon, koncept m.m.) som multipliceras med logiska
varianter (`Eld-`, `Robot-`, `Jätte-`, `Kosmos-` …). Resultatet är 11 000+ poster där varje
post har `id`, `name`, `aliases`, `categories`, `power`, `speed`, `range`, `intelligence`,
`tags`, `defeatsTags`, `vulnerableToTags`, `description` och `scale`.

En **adminpanel** (fliken *Databas*) låter dig söka, filtrera, skapa, redigera, ta bort,
importera, exportera, generera fler poster och validera hela databasen.

## Projektstruktur

```
.
├── server/   # Express + TypeScript: taxonomi, generator, domare, spelmotor, API
│   └── src/
│       ├── taxonomy.ts    # svenska kategori-/taggnamn + TAG_BEATS-relationsgraf
│       ├── data/seeds.ts  # kurerade grunddata per kategori
│       ├── generator.ts   # bygger 11 000+ sammanlänkade poster
│       ├── judge.ts       # resonemangsdomaren
│       ├── database.ts    # index, sökning, resolver, admin-CRUD
│       ├── game.ts        # duellmotor + datormotståndare
│       └── routes/        # spel- och admin-API
├── client/   # React + Vite: duell-UI och adminpanel (på svenska)
├── data/     # runtime-lager för admin-ändringar (genereras)
└── .cursor/  # Cloud Agent-miljökonfiguration
```

## Kom igång

Krav: Node.js >= 20.

```bash
npm install        # installerar alla workspaces
npm run dev        # API (port 4000) + webbklient (port 5173) parallellt
```

Öppna sedan http://localhost:5173.

### Kommandon

| Kommando | Beskrivning |
| --- | --- |
| `npm run dev` | Kör backend och frontend parallellt |
| `npm run dev:server` | Endast backend-API (http://localhost:4000) |
| `npm run dev:client` | Endast webbklient (http://localhost:5173) |
| `npm test` | Kör serverns enhetstester (Vitest) |
| `npm run typecheck` | Typkontroll för server och klient |
| `npm run lint` | ESLint för server och klient |
| `npm run build` | Bygger server och klient |

## API

| Metod & väg | Beskrivning |
| --- | --- |
| `GET /api/health` | Hälsokontroll + databasens storlek |
| `GET /api/random-word` | Slumpat startord |
| `POST /api/games` | Skapa duell (`mode`, `winCondition`, `difficulty`, `targetScore`, `startWord`) |
| `GET /api/games/:id` | Hämta speltillstånd |
| `POST /api/games/:id/turns` | Spela ett ord (`{ "word": "..." }`) |
| `POST /api/judge` | Bedöm ett par direkt (`{ "target", "answer" }`) |
| `GET /api/admin/stats` | Statistik om databasen |
| `GET /api/admin/entries` | Sök/filtrera poster |
| `POST/PUT/DELETE /api/admin/entries` | Skapa/redigera/ta bort |
| `POST /api/admin/import` · `GET /api/admin/export` | Importera/exportera JSON |
| `POST /api/admin/generate` · `GET /api/admin/validate` | Generera fler / validera |

## Cloud Agent-miljö

`.cursor/environment.json` kör `npm install` vid uppstart och startar två terminaler:
`api` (backend, port 4000) och `web` (frontend, port 5173).
