# Ordduellen

**Ordduellen** ("The Word Duel") är ett strategiskt svenskt ordspel — du möter datorn i en
serie rundor och försöker bilda de högst poängsatta orden ur en given uppsättning bokstäver.

Det här repot är en fullstack-demo (TypeScript backend + React-frontend) som också fungerar
som en färdig utvecklingsmiljö för Cursor Cloud Agents.

## Så spelas det

1. Varje runda dras en bricka med bokstäver ur en svensk bokstavspåse (Scrabble-fördelning).
2. Du bildar det bästa giltiga svenska ordet du kan — poäng ges per bokstav plus en längdbonus.
3. Datorn svarar med sitt eget ord (svårighetsgraden styr hur bra datorn spelar).
4. Efter alla rundor vinner den med flest poäng.

Ordlistan innehåller ~91 000 svenska ord från SAOL (`data/swedish-words.txt`, public domain).

## Projektstruktur

```
.
├── server/   # Express + TypeScript API och spelmotor
├── client/   # React + Vite webbklient
├── data/     # Svensk ordlista (svenska-ord.txt)
└── .cursor/  # Cloud Agent-miljökonfiguration
```

## Kom igång

Krav: Node.js >= 20.

```bash
npm install        # installerar alla workspaces
npm run dev        # startar API (port 4000) och webbklient (port 5173) parallellt
```

Öppna sedan http://localhost:5173.

### Enskilda kommandon

| Kommando | Beskrivning |
| --- | --- |
| `npm run dev` | Kör backend och frontend parallellt (utveckling) |
| `npm run dev:server` | Endast backend-API (http://localhost:4000) |
| `npm run dev:client` | Endast webbklient (http://localhost:5173) |
| `npm test` | Kör spelmotorns enhetstester (Vitest) |
| `npm run typecheck` | Typkontroll för server och klient |
| `npm run lint` | ESLint för server och klient |
| `npm run build` | Bygger både server och klient |

## API

Backend exponerar ett litet REST-API under `/api`:

| Metod & väg | Beskrivning |
| --- | --- |
| `GET /api/health` | Hälsokontroll + ordlistans storlek |
| `POST /api/games` | Skapa ett spel (`rounds`, `rackSize`, `difficulty`, `seed`) |
| `GET /api/games/:id` | Hämta aktuellt speltillstånd |
| `POST /api/games/:id/moves` | Spela ett ord (`{ "word": "..." }`) eller passa med tomt ord |
| `GET /api/games/:id/hint` | Få ett förslag på ett giltigt ord |

## Cloud Agent-miljö

`.cursor/environment.json` kör `npm install` vid uppstart och startar två terminaler:
`api` (backend) och `web` (frontend). Portarna 4000 och 5173 exponeras.
