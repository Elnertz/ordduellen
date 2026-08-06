# Ordduellen – statusrapport

_Senast uppdaterad: Fas 1-utbyggnad (domare, orddata, schema, tester)._

Detta dokument beskriver vad som är byggt, vad som pågår och vad som återstår, samt
vilka externa beslut/uppgifter som krävs för de senare faserna.

## 1. Analys av nuläget

**Kärnspelet är redan korrekt.** En granskning av koden och Git-historiken visar att
den nuvarande versionen är exakt den turbaserade resonemangsduell som specifikationen
beskriver: en spelare besegrar det aktuella ordet genom att skriva ett nytt ord som
trovärdigt kan besegra det, en domare avgör, och det godkända ordet blir nästa mål.

- Grundmekaniken (`server/src/game.ts`, `server/src/judge.ts`) matchar exempelkedjan
  `mus → katt → hund → … → författaren`.
- En tidig prototyp var ett bokstavsspel (Scrabble-liknande). Den ersattes helt i commit
  `10fd09b` och finns kvar i Git-historiken om något skulle behöva återställas. **Ingen
  återställning behövs** – det spelas redan rätt spel.

Slutsats: Fas 1 handlar inte om att återställa mekaniken, utan om att göra domaren
smartare, utöka orddatan med riktiga ord, utöka schemat och lägga till tester.

## 2. Fas 1 – kärnspel, domare och orddata (denna iteration)

Klart i denna iteration:

- **Utökat orddataschema** (`server/src/types.ts`): varje post har nu även `englishName`,
  `aliasesEn`, `toughness` (tålighet), `size` (storlek), `techLevel` (teknologinivå),
  `cosmicLevel` (kosmisk nivå), `abilities` (förmågor), `weaknesses` (svagheter, läsbar
  svensk text), `source` (datapaket) och `quality` (`verified` eller `generated`).
- **Smartare domare i flera lager** (`server/src/judge.ts`, `server/src/special-rules.ts`):
  1. specialregler (exakta, högsäkra relationer), 2. alias/normalisering,
  3. taggar och svagheter, 4. kategorirelationer, 5. egenskaper/statistik,
  6. storlek/räckvidd, 7. logisk sannolikhet, 8. gränsfallshantering.
  Domslutet returnerar `approved`, `reason` (naturlig svenska), `confidence` (0–100),
  `ruleType`, `attacker`, `target`, matchande begrepp (läsbara, aldrig interna taggnamn)
  och `warnings`.
- **Fler riktiga ord**: kurerade datapaket (`seeds-extra.ts`, `seeds-mega.ts`) plus hela
  Pokédex (`seeds-pokemon.ts`) ger nu **~4 700 verifierade riktiga ord** i alla kategorier
  (djur, fåglar, fiskar, insekter, reptiler, dinosaurier, växter, svampar, mat, dryck,
  kroppsdelar, yrken, sport, musik, vapen, fordon, verktyg, byggnader, material, länder,
  städer, natur, väder, rymden, vetenskap, medicin, sjukdomar, teknik, internet, mytologi,
  fantasy, magi, superhjältar, skurkar, spel-/film-/anime-karaktärer, historia, koncept …).
- **Skala**: databasen fylls deterministiskt till **50 000 poster totalt** (verifierad kärna
  + logiska varianter som tydligt märks `quality: 'generated'`). Målstorleken styrs av
  `TARGET_TOTAL`/`ORDDUELLEN_TARGET_TOTAL` och skalar vidare mot 100 000 utan motoränd­ringar.
- **Normalisering**: gemener/versaler, svenska tecken, bestämd/obestämd form och vanliga
  stavningsvarianter hanteras i resolvern.
- **Domarloggning, rapportering och röstning**: felaktiga/omtvistade domslut kan loggas,
  rapporteras och röstas på; admin kan korrigera relationer.
- **Tester**: hundratals kända ordpar samt regressionstester för hela kedjor.

## 3. Roadmap – kommande faser

Faserna följer specifikationens prioritering. Arkitekturen förbereds så att inget nedan
blockeras, men ingen halvfärdig kod (placeholders/TODO) checkas in – varje funktion byggs
klart när den påbörjas.

### Fas 2 – backend, konto och inloggning
- Server-auktoritativ backend. Rekommendation: **Supabase (PostgreSQL + Auth + Realtime)**
  – ger auth (e-post/OTP, Apple, Google, Facebook via OAuth), relationsdata, realtime och
  row-level security i ett paket, vilket passar den befintliga TypeScript-stacken.
- Datamodell/migrationer för `users/profiles`, `identities`, `friendships`, `blocks`,
  `rooms`, `room_members`, `matches`, `match_players`, `turns`, `judgments`,
  `word_entries`, `aliases`, `categories`, `tags`, `abilities`, `weaknesses`, `reports`,
  `ratings`, `seasons`, `leaderboard_snapshots`, `achievements`, `user_achievements`,
  `notifications`, `admin_audit_log`.
- **Kräver externa uppgifter** (se avsnitt 4).

### Fas 3 – privata rum, snabbmatch, reconnect (KLART, självhostat)
- Serverauktoritativt realtidsläge över **WebSockets** (`server/src/realtime.ts`):
  privata rum med rumskod + delningslänk, snabbmatch, presence, återanslutning,
  timeout per tur, forfeit, idempotenta drag (server räknar poäng/tur/vinnare).
- Klient: fliken **Online** (namn/gäst, snabbmatch, skapa/gå med i rum, live-duell,
  revansch, återanslutning). Kvar för produktion: publik host + domän för spel mellan
  olika enheter (se avsnitt 4).

### Fas 4 – ranking och topplistor (KLART, självhostat)
- **Elo-rating** (`server/src/elo.ts`) och en persistent spelarstore
  (`server/src/store.ts`); serverberäknad, paginerad **topplista** med egen placering
  (`/api/online/leaderboard`, fliken **Topplista**). Kvar: säsonger, XP/prestationer,
  daglig utmaning, cachning i skala.

### Fas 5 – iOS-app, push, deep links, App Store
- **Capacitor** rekommenderas: den nuvarande React/Vite-frontenden kan återanvändas i
  stort sett oförändrad, vilket ger iOS/Android + webb från samma kodbas. Motivering:
  minsta möjliga ombyggnad, delad backend och konton mellan plattformar.
- **Kräver Apple Developer-konto** för signering, TestFlight och App Store (se avsnitt 4).

### Fas 6 – adminpanel, moderation, databasexpansion, prestanda, produktion
- Skyddad adminpanel (redan grund på plats), moderationsverktyg, skalning mot 100 000 ord
  via datapaket och indexerad/paginerad sökning, prestandaoptimering.

## 4. Externt som krävs innan vissa faser kan slutföras

Dessa kräver beslut/uppgifter som bara du kan tillhandahålla:

- **Apple Developer Program** (Fas 5): Apple Developer-konto, Team ID, bundle identifier
  (t.ex. `se.ordduellen.app`), signeringscertifikat/provisioning och Sign in with Apple.
- **OAuth-app-ID:n** (Fas 2): Google OAuth Client ID/secret, Facebook App ID/secret,
  Apple Services ID. Läggs som servermiljövariabler/secrets – aldrig i frontend eller Git.
- **Backend-hosting och produktionsdomän** (Fas 2+): t.ex. Supabase-projekt (URL +
  anon/service-nycklar) och en produktionsdomän för deep links/OAuth-callbacks.
- **Push-notiser** (Fas 5): APNs-nyckel (Apple) och ev. Firebase för Android.

Alla hemligheter hanteras som miljövariabler/secrets på servern.

## 5. Kvalitetsläge

Efter varje fas körs `lint`, `typecheck`, `unit tests` och `production build`. Denna
iteration hålls grön (se `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`).
