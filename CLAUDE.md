# CLAUDE.md · iLoveLurido

Istruzioni persistenti per Claude Code quando lavora su questo repo.

## Stack (fissato dal brief)
- React Native + Expo SDK ultima stabile
- TypeScript strict
- Expo Router (file-based routing, struttura `/app`)
- NativeWind v4 (Tailwind per RN)
- Zustand (state management, niente Redux)
- Supabase JS client (auth, db, storage, realtime)
- React Native Maps (`react-native-maps`) con provider auto
- Reanimated 3 (transizioni + gesture)
- React Hook Form + Zod (form e validazione)
- Expo Notifications (push)
- Expo Image (cache + ottimizzazione)
- Expo Image Manipulator (compressione pre-upload)
- Lucide React Native (icone)

**Non aggiungere librerie fuori da questa lista senza chiedere.**

## Convenzioni di codice

### TypeScript
- `strict: true`, `noUncheckedIndexedAccess: true`
- Niente `any`: se non sai il tipo, chiedi. Usa `unknown` + narrow.
- Tipi generati da Supabase: `npx supabase gen types typescript --project-id=... > src/types/db.ts`
- Interfaces per shape di props; types per union/alias.

### File layout
```
/app                       # Expo Router
  (auth)/
    login.tsx
    signup.tsx
  (tabs)/
    _layout.tsx            # tab bar
    index.tsx              # mappa home
    search.tsx
    add.tsx                # fab +
    notifications.tsx
    profile.tsx
    mod.tsx                # visibile solo se user.role ∈ {moderator,admin}
  lurido/[id].tsx          # profilo lurido
  _layout.tsx              # root layout + providers
/src
  components/              # UI primitives (LButton, LCard, LPin, LStars…)
  features/                # feature slices (map, lurido, review, mod…)
  lib/
    supabase.ts            # client
    store/                 # zustand stores
    theme/                 # tokens + ThemeProvider
  hooks/
  types/
```

### Naming
- Componenti UI prefissati `L` (LButton, LPin, LStars) — coerente con il prototipo.
- File schermate: `kebab-case.tsx`. Componenti: `PascalCase.tsx`.
- Stores zustand: `useLuridiStore`, `useAuthStore`, `useSavedStore`…

### Styling
- **NativeWind** prima scelta. Classi lunghe → estrai in `cn()` helper.
- I tokens del design (da `supabase_schema.sql` e `README.md`) vivono in `src/lib/theme/tokens.ts`. Importali, non inlinare hex.
- Tema day/night via context — NON basarti su `Appearance` direttamente, lascia che l'utente forzi.
- Mai importare styles da librerie web (es. non useremo `@mui/*`).

### State
- UI locale → `useState`.
- Cross-screen → zustand store nel modulo giusto (es. `useLuridiStore` per la lista).
- Server state pesante → React Query (già incluso con Supabase JS? no — installa `@tanstack/react-query` se serve).
- Persist: usa `zustand/middleware` + MMKV (`react-native-mmkv`) per saved/preferiti + cache offline.

### Supabase
- Tutto il DB schema in `supabase_schema.sql` (vedi file). Eseguilo una volta all'inizio.
- RLS sempre attiva. Niente query "bypass" dal client.
- Storage buckets: `avatars`, `lurido-photos`, `review-photos`.
- Realtime: sottoscrivi `luridi` (per pending→approved live), `notifications`, `reviews`.
- Mai hardcodare URL/chiavi: usa `expo-constants` + `.env` via `EXPO_PUBLIC_*`.

### Mappe
- Provider: default su Android (Google Maps), Apple Maps su iOS nativo.
- Cluster: usa `react-native-map-clustering` sopra `react-native-maps`.
- Pin custom: component `<LPin variant=... status=.../>` — il design è in `src/components/LPin.tsx`.
- Geolocalizzazione: `expo-location` con permessi gestiti (chiedi al primo uso, non all'app start).
- Coordinate luridi: stored come `geography(point)` → query via RPC `nearby_luridi(lat, lng, radius)`.

### Immagini
- Upload: prima passa da `expo-image-manipulator` (max 1600px lato lungo, quality 0.82, jpeg).
- Display: `expo-image` con `contentFit="cover"`, `transition={180}`, `placeholder={blurhash}`.
- Foto profilo lurido: genera blurhash lato server (edge function) e salvalo in `photos.blurhash`.

### Animazioni
- Reanimated 3 solo per animazioni che reagiscono a gesture o che devono girare a 60fps (preview card bottom sheet, pin scale on tap, pulse ring, pull-to-refresh).
- Transizioni schermata: delega a Expo Router (stack animations), non reinventare.
- Durata standard: 180ms micro, 260ms medium, 380ms entry. Easing: `Easing.bezier(0.2, 0.7, 0.3, 1)`.

### Testi / i18n
- Copy italiano già deciso nel `README.md` sezione **Copy**. Non riscriverli.
- Se serve i18n futura: `i18n-js`. Per ora hardcoded italiano va bene.

### Accessibility
- `accessibilityLabel` su tutti i Pressable senza label testuale.
- Min hit target 44×44.
- Contrasto testo/bg ≥ AA (day mode già ok, night mode va verificato sui colori muted).

## Priorità di implementazione

Implementa in quest'ordine, una feature alla volta. Dopo ogni step: commit, gira su simulatore, smoke test.

1. **Scaffold & theming**
   - `npx create-expo-app -t` + Expo Router
   - NativeWind setup, tokens da `README.md`
   - ThemeProvider day/night + toggle manuale
   - Struttura `/app/(tabs)` con placeholder schermate
2. **Auth**
   - Supabase client + `useAuthStore`
   - Schermate `(auth)/login` e `(auth)/signup`
   - Redirect logica in root `_layout.tsx`
   - OAuth Google + Apple dopo email funzionante
3. **Schema DB**
   - Esegui `supabase_schema.sql`
   - Genera tipi TS
   - Seed di 6-8 luridi di prova (file `supabase_seed.sql` da scrivere)
4. **Mappa home**
   - `react-native-maps` + clustering
   - `LPin` component (4 varianti, default "pill")
   - Permessi location + bottone "centrami"
   - Preview card bottom sheet (Reanimated)
5. **Profilo lurido**
   - Header (variante "photo" di default)
   - Tabs Panoramica / Piatti / Recensioni
   - Modal recensione con form + upload foto
   - Dish upvote optimistic
6. **Search + filtri + lista**
   - Card lista (variante "rich" di default)
   - Toggle mappa/lista
   - Chip filtri con stato persistito nello store
7. **Add lurido (multi-step)**
   - 4 step con `react-hook-form` + `zod`
   - Pin drag-to-position su mappa
   - Upload foto batch con compressione
   - Notifica pending → approved via realtime
8. **Profilo utente + badge**
   - Livelli via XP (regole: +10 recensione, +25 lurido approvato, +1 upvote)
   - Badge unlock logic in edge function
9. **Moderazione** (solo se `user.role != 'user'`)
   - Tab extra nel bottom bar
   - Coda pending con actions approve/reject/request-changes
   - Moderazione foto + recensioni
10. **Notifiche**
    - Centro in-app (lista da tabella `notifications`)
    - Registrazione token Expo Push
    - Edge function `send-push-notification` trigger su notifiche nuove

## Design reference

Il design completo è nei file HTML di questo handoff. Per ogni schermata nuova:
1. **Leggi la sezione corrispondente del `README.md`** (Screens / Views) per specifiche precise.
2. **Apri lo screenshot PNG in `screenshots/`** per verifica visiva.
3. **Ispeziona il JSX del prototipo** in `app/*.jsx` per tokens, layout, interazioni (è React web, ma la struttura si traduce 1:1 in React Native — `div` → `View`, `span`/`p` → `Text`, `button` → `Pressable`, `img` → `Image`).
4. Prima di chiamarla finita, confronta side-by-side il tuo simulatore con lo screenshot del prototipo.

## Comandi utili

```bash
pnpm start                           # expo dev server
pnpm ios                             # launch simulatore iOS
pnpm android                         # launch emulatore Android
npx supabase start                   # local supabase (opzionale)
npx supabase gen types typescript --project-id=xxx > src/types/db.ts
eas build --profile preview --platform ios   # build TestFlight
```

## Cose da NON fare

- Non usare `StyleSheet.create` se già usi NativeWind.
- Non inlinare colori hex: usa `tokens.ts`.
- Non scrivere SQL raw dal client: usa la API Supabase + RPC.
- Non aggiungere animazioni gratuitamente — solo se migliorano feedback (< 300ms).
- Non caricare foto originali su Storage: sempre passate da `expo-image-manipulator`.
- Non fare optimistic update senza rollback su errore.
- Non committare `.env`.
