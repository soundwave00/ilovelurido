# iLoveLurido

App mobile (iOS + Android) per scoprire, recensire e contribuire alla mappa dei "luridi" di Milano — baracchini da strada aperti di notte che vendono panini a prezzi popolari.

## Quick Start

### Prerequisiti

```bash
node >= 20
pnpm >= 9
Xcode >= 15 (per iOS)
Android Studio (per Android)
```

### Setup

```bash
# 1. Installa dipendenze
pnpm install

# 2. Configura variabili d'ambiente
cp .env.example .env
# Poi riempi .env con i valori reali (vedi sezione Environment)
```

### Simulatore iOS

```bash
pnpm ios
# oppure con build nativa esplicita:
npx expo run:ios
```

> **Nota:** Per Google Maps su iOS serve build nativa (`expo run:ios`), non Expo Go.

### Simulatore Android

```bash
pnpm android
# oppure:
npx expo run:android
```

### Dispositivo fisico iOS

1. **Abilita Developer Mode** sul dispositivo: Impostazioni → Privacy e sicurezza → Modalità sviluppatore → ON (richiede riavvio).
2. **Connetti con cavo** e accetta il trust.
3. In Xcode: apri `ios/ilovelurido.xcworkspace` → Signing & Capabilities → seleziona il tuo Apple ID come team → abilita "Automatically manage signing".
4. Se compare l'errore Push Notifications con account personale: in Xcode clicca "–" accanto alla capability Push Notifications per rimuoverla.
5. Dal terminale:
   ```bash
   npx expo run:ios --device
   ```
6. Prima esecuzione: sul dispositivo, Impostazioni → VPN e gestione dispositivi → trust il certificato sviluppatore.

### Dev server standalone

```bash
pnpm start
# poi scan con Expo Go (solo per funzionalità non-native) o premi i/a per simulatori
```

---

## Environment

Copia `.env.example` in `.env` e riempi:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_SUPABASE_PROJECT_ID=xxxx
GOOGLE_MAPS_IOS_API_KEY=your_key_here
```

- `EXPO_PUBLIC_*` → lette lato client (OK per anon key pubblica).
- `GOOGLE_MAPS_IOS_API_KEY` → letta solo a build time in `app.config.js`, non esposta nel bundle.

### Google Maps API Key

1. Google Cloud Console → abilita **Maps SDK for iOS** e **Maps SDK for Android**.
2. Crea una chiave API → restrizioni: "Apps iOS" con bundle `com.ilovelurido.app`.
3. Inserisci la chiave in `.env` come `GOOGLE_MAPS_IOS_API_KEY`.
4. Per Android: inserisci la chiave in `app.json` → `android.config.googleMaps.apiKey`.

---

## Comandi utili

```bash
pnpm start                            # expo dev server
pnpm ios                              # simulatore iOS
pnpm android                          # emulatore Android
npx expo run:ios --device             # dispositivo fisico iOS
npx supabase gen types typescript --project-id=xxx > src/types/db.ts
eas build --profile preview --platform ios    # build TestFlight
```

---

## Stack

- **React Native + Expo** (SDK più recente)
- **Expo Router** (file-based routing)
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **React Native Maps** (Google Maps su entrambe le piattaforme)
- **Zustand** state management
- **NativeWind v4** (Tailwind per RN)
- **Reanimated 3**, **React Hook Form + Zod**, **Expo Notifications**

---

## Struttura app

```
/app
  (auth)/login.tsx · signup.tsx
  (tabs)/
    _layout.tsx          # tab bar (4 tab: Mappa · + · Notifiche · Profilo)
    index.tsx            # mappa home + ricerca inline
    add.tsx              # aggiungi lurido (multi-step)
    notifications.tsx
    profile.tsx
    mod.tsx              # solo moderatori/admin
  lurido/[id].tsx        # profilo lurido
/src
  components/            # LButton, LCard, LPin, LStars, LSheet…
  features/              # map, lurido, review, mod…
  lib/supabase.ts · store/ · theme/
  hooks/
  types/
```

---

## Design Reference

### Screens / Views

#### 1. Onboarding / Auth
- Hero notturno: gradient cacao → ember, logo rotondo ambrato, titolo "iLoveLurido".
- CTA: email, Apple, Google. Supabase Auth con OAuth.

#### 2. Mappa home
- React Native Maps con provider Google (entrambe le piattaforme).
- **Ricerca inline:** la search bar è integrata nella mappa. Al tap si espande un input con dropdown di suggerimenti in real-time. I marker si filtrano durante la digitazione. Nessun tab dedicato alla ricerca.
- Top bar glass: search bar + avatar utente (blur, ombra soft). Con ricerca attiva l'avatar si nasconde.
- Filter strip: chip orizzontali (Aperto ora, 4+ ⭐, Veggie, Vicino, Nuovi) — applicano anche ai risultati di ricerca.
- Pin: 4 varianti (`pill`, `glow`, `baracchino`, `minimal`). Cluster a zoom basso.
- User location blip: pallino blu con pulse ring.
- Preview card (bottom sheet): slide-up al tap su pin, con foto, nome, zona, distanza, stelle, stato, bottone "Vedi →".
- **Tab bar bottom: 4 tab** (Mappa · **+** fab · Notifiche · Profilo) + eventuale quinta "Mod" per moderatori.

#### 3. Profilo del lurido
- Header 3 varianti: `photo` (hero full-bleed 260px), `gallery` (griglia), `minimal` (strip).
- Info: nome display, status badge, stelle, rating, recensioni.
- Action row: Recensisci · Salva · Invia · Segnala.
- Tabs: Panoramica · Piatti · Recensioni.
- Modal recensione: 5 stelle, textarea, upload foto.
- Report sheet: 4 motivi emoji.

#### 4. Aggiungi lurido (multi-step)
Flow 4 passi con progress bar:
1. Posizione (mappa interattiva + pin drag).
2. Info (nome, zona, descrizione).
3. Orari.
4. Foto (grid + compressione pre-upload).

#### 5. Profilo utente
- Level card con XP e progress bar.
- Stats grid: Recensioni / Aggiunti / Salvati / Upvote.
- Badge grid 3 colonne.

#### 6. Moderazione (solo `moderator`/`admin`)
- Stats header, coda pending, azioni Approva/Rifiuta/Modifiche.
- Moderazione foto e recensioni.

#### 7. Notifiche
- Tipi: `approved` · `nearby` · `reply` · `badge` · `nottambulo`.
- Non lette: sfondo surface + dot accent + font-weight 700.

---

## Design Tokens

### Palette Day
```
bg:           #faf6f0
surface:      #ffffff
surfaceAlt:   #f3ede3
border:       rgba(60,40,20,0.08)
text:         #1a1512
textMuted:    rgba(26,21,18,0.6)
success:      #4a7c3a
danger:       #b94a3a
```

### Palette Night
```
bg:           #120d0a
surface:      #1c1613
surfaceAlt:   #251d19
border:       rgba(255,220,180,0.08)
text:         #f5ead8
textMuted:    rgba(245,234,216,0.6)
```

### Accent (default: `ambra`)
```
ambra:   base #f59e42  glow #ffc278  ink #2a1a08
ocra:    base #e8a33d  glow #f5c06a  ink #2a1e08
corallo: base #ff6b35  glow #ff9570  ink #2a1008
limone:  base #fbbf24  glow #fde182  ink #2a2008
brace:   base #d97706  glow #f39537  ink #2a1608
```

### Typography (default: `grotesk`)
- Display: Space Grotesk 500–700
- Body: Inter 400–700
- Mono: JetBrains Mono

### Scale
- Radii: xs=6 sm=10 md=14 lg=20 xl=28 pill=9999
- Spacing: 16/18 padding schermate · gap 8-12 tra card
- Animazioni: 180ms micro · 260ms medium · 380ms entry · easing `cubic-bezier(0.2, 0.7, 0.3, 1)`

---

## Copy (tono italiano/milanese)

| Contesto | Copy |
|---|---|
| Empty ricerca | "Nessun lurido qui vicino… ancora 👀" |
| Empty piatti | "Ancora nessun piatto segnalato — aggiungi il primo." |
| Empty mod | "Coda vuota, gran lavoro. Prenditi un caffè." |
| Empty notifiche | "Tutto tranquillo, per ora." |
| Tip orari | "Trucco milanese: se non sai gli orari esatti, metti da 22:00 a 04:00." |
| Review placeholder | "Racconta com'era… 'Il panino dopo le 3 ha un altro sapore…'" |
| Search placeholder | "Cerca Peppino, Navigli, cima di rapa…" |

---

## Database

Schema completo in `supabase_schema.sql`. Tabelle principali: `users`, `luridi` (status: `pending|approved|rejected`), `reviews`, `photos`, `dishes`, `dish_votes`, `notifications`, `reports`. RLS attiva su tutte.

### Seed dati reali

`supabase_seed.sql` contiene 15 luridi reali di Milano con coordinate verificate, orari e piatti signature (tutti `status=approved`, visibili subito in mappa). Eseguilo una volta dal Supabase SQL editor dopo lo schema.

Per scoprire altri luridi via Google Places API (one-shot):

```bash
GOOGLE_PLACES_API_KEY=<chiave_server> node scripts/find-luridi.mjs
# Output: scripts/luridi_found_clean.json + scripts/luridi_seed_clean.sql
# Review manuale necessaria prima di importare
```

```bash
# Genera tipi TypeScript dal DB live
npx supabase gen types typescript --project-id=YOUR_PROJECT_ID > src/types/db.ts
```

---

## File di riferimento visuale

I file in `app/*.jsx` e `iLoveLurido.html` sono prototipi HTML/React web — solo riferimento visuale, non codice da copiare.

- `app/tokens.jsx` — tokens + dati di esempio
- `app/ui.jsx` — primitive condivise (LPin, LStars, LButton…)
- `app/map.jsx` — schermata Mappa
- `app/profile.jsx` — schermata Profilo Lurido
- `app/screens.jsx` — Search / Add / User / Mod / Notifs / Auth
- `screenshots/` — PNG di riferimento per confronto visivo
