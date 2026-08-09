# Dela med vänner & lägga ut i App Store

Två saker du kan göra:

- **A. Dela en länk** så vänner kan spela direkt i mobil/dator (snabbast).
- **B. iOS-app i App Store** via TestFlight (för riktiga app-nedladdningar).

Appen är byggd så att **en enda tjänst** serverar både webben, API:t och realtids-
spelet (WebSockets). Det gör den enkel att lägga ut.

---

## A. Dela en spelbar länk med vänner (webb)

Det här ger en publik `https://…`-adress som funkar för alla, även online-multiplayer
mellan olika enheter. Du behöver ett gratis konto hos en host. Rekommenderat: **Render**.

### Render (enklast, gratis)
1. Pusha koden till GitHub (redan gjort – branchen `cursor/setup-dev-environment-30b4`).
2. Skapa konto på https://render.com och koppla ditt GitHub-konto.
3. Klicka **New +** → **Blueprint** → välj repot `Elnertz/ordduellen`.
   Render läser `render.yaml` och skapar tjänsten automatiskt (Docker, gratisplan).
4. Vänta tills bygget är klart. Du får en adress i stil med
   `https://ordduellen.onrender.com`.
5. **Dela den länken** med dina vänner. Öppna → fliken **Online** → *Snabbmatch* eller
   *Skapa rum* och skicka rumskoden/länken.

> Gratisplanen somnar efter inaktivitet; första besöket kan ta ~30 sek att vakna.
> Vill du ha alltid-på: uppgradera planen i Render (kräver kort).

### Alternativ: valfri Docker-host (Railway, Fly.io, egen server)
```bash
docker build -t ordduellen .
docker run -p 4000:4000 ordduellen
# öppna http://localhost:4000
```
Hosten behöver bara bygga `Dockerfile` och exponera porten (servern läser `PORT`).

### Kör lokalt och släpp in vänner tillfälligt
```bash
npm install
npm run build
npm start            # allt på http://localhost:4000
```
För en snabb, tillfällig publik länk utan host kan du tunnla porten, t.ex.
`npx localtunnel --port 4000` eller `cloudflared tunnel --url http://localhost:4000`.

---

## B. iOS-app i App Store (via Capacitor + TestFlight)

Webben är redan förberedd som app-skal med **Capacitor**. Native-projekten skapas på din
**Mac** (krävs för iOS). Detta behöver du:

- En **Mac** med **Xcode**.
- Ett **Apple Developer Program**-konto (999 kr/år) → ger Team ID, signering, TestFlight.
- En **deployad backend** från del A (appen pratar med den).

### Steg
1. Deploya backend enligt del A och notera adressen (t.ex. `https://ordduellen.onrender.com`).
2. Bygg webben mot den adressen:
   ```bash
   cd client
   VITE_API_BASE=https://DIN-ADRESS npm run build
   ```
3. Skapa iOS-projektet och synka (första gången):
   ```bash
   npm run cap:add:ios     # skapar client/ios (kräver Mac + CocoaPods)
   npm run cap:sync
   npm run cap:open:ios    # öppnar Xcode
   ```
4. I Xcode:
   - Välj din **Team** (Apple Developer) under *Signing & Capabilities*.
   - Bundle identifier är `se.ordduellen.app` (ändra vid behov).
   - Lägg till **appikon** och **launch screen** (se nedan).
   - Välj *Any iOS Device* → **Product → Archive** → **Distribute App → App Store Connect**.
5. I **App Store Connect** (https://appstoreconnect.apple.com):
   - Skapa appen (namn *Ordduellen*, språk **Svenska**).
   - Ladda upp bygget, lägg till **TestFlight**-testare (dina vänner via e-post) →
     de får appen via TestFlight-appen.
   - För publik release: fyll i beskrivning (svenska), skärmbilder, integritetspolicy-URL,
     support-URL, och skicka in för granskning.

### Ikon & launch screen
Lägg din ikon (1024×1024 PNG) och kör t.ex. `@capacitor/assets` för att generera alla
storlekar, eller lägg in dem manuellt i Xcode-projektets *Assets*.

### Android (Google Play) – samma flöde
```bash
npm run cap:add:android
VITE_API_BASE=https://DIN-ADRESS npm run build && npm run cap:sync
npm run cap:open:android   # bygg AAB i Android Studio
```

---

## Vad jag (agenten) redan gjort
- En tjänst som serverar webb + API + WebSocket (`npm start`, Docker).
- `Dockerfile`, `.dockerignore`, `render.yaml` för deploy.
- Konfigurerbar backend-adress i klienten (`VITE_API_BASE`).
- Capacitor-konfiguration (`client/capacitor.config.ts`, appId `se.ordduellen.app`) och
  `cap:*`-skript.

## Vad du behöver skaffa
- **Webblänk:** ett gratis host-konto (Render rekommenderas).
- **App Store:** Mac + Xcode + Apple Developer-konto (999 kr/år). Android: Google Play
  Developer-konto (engångsavgift ~25 USD).
