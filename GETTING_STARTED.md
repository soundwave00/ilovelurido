# Getting Started · iLoveLurido

Scaffold pronto. Questi sono i passi per farlo partire.

## 1. Prerequisiti

- **Node 20+** (consigliato 20.12+)
- **pnpm** (o npm/yarn — gli script sono agnostici)
- **Xcode 15+** (per simulatore iOS) e/o **Android Studio** con un AVD
- Un account **Supabase** (piano free va benissimo)

## 2. Installa le dipendenze

```bash
pnpm install
# o: npm install
```

> Se Metro si lamenta della versione di qualche pacchetto Expo:
> `npx expo install --fix`.

## 3. Setup Supabase

1. Crea un nuovo progetto su [supabase.com](https://supabase.com).
2. Apri **SQL Editor → New query**, incolla il contenuto di `supabase_schema.sql` ed esegui.
3. Opzionale: esegui `supabase_seed.sql` per popolare qualche lurido di prova.
4. Dashboard → **Database → Replication**: abilita realtime su `luridi`, `reviews`, `notifications`.
5. Dashboard → **Settings → API**: copia `URL` e `anon key`.

## 4. Variabili ambiente

```bash
cp .env.example .env
```

Riempi `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_SUPABASE_PROJECT_ID=xxxx
```

> `.env` è già gitignorato. Mai committarlo.

## 5. Genera i tipi DB (consigliato)

Dopo aver eseguito `supabase_schema.sql`:

```bash
npx supabase gen types typescript --project-id=$EXPO_PUBLIC_SUPABASE_PROJECT_ID > src/types/db.ts
```

Il placeholder in `src/types/db.ts` va sostituito così.

## 6. Google Maps key (solo Android)

In `app.json`, sotto `android.config.googleMaps.apiKey`, metti la tua API key. Per iOS, Apple Maps è il default — nessuna key richiesta.

## 7. Avvia

```bash
pnpm ios        # simulatore iOS
pnpm android    # emulatore Android
pnpm web        # web (supporto parziale)
```

## Cosa c'è già (step 1-2 di CLAUDE.md)

- Config Expo + TypeScript strict + Expo Router + NativeWind v4
- `ThemeProvider` day/night con toggle manuale + accent switchable (default: night + ambra)
- Supabase client tipizzato + persistenza session via AsyncStorage
- `useAuthStore` (zustand) con hydrate, signIn, signUp, signOut
- Schermate `(auth)/login` + `(auth)/signup` funzionanti con email/password
- Tab bar con 5 tab + Mod (visibile solo a moderatori/admin)
- Redirect logic: se unauth → `/login`; se auth → `/(tabs)`
- Primitive UI: `LButton`, `LStars`, `LChip`, `LStatusBadge`, `LPin`, `LCard`
- Schema SQL completo + seed di 6 luridi Milano
- Tipi domain in camelCase in `src/types/domain.ts`

## Cosa manca (step 3-10)

Segui l'ordine in `CLAUDE.md → Priorità di implementazione`. Dopo ogni step: commit, run sim, smoke test.

I riferimenti di design sono in `_design/` (il prototipo web originale) + `screenshots/`. **Leggi la sezione specifica del `README.md`** (design brief) prima di implementare ogni schermata.

## Struttura

```
.
├── app/                      # Expo Router
│   ├── _layout.tsx           # providers + AuthGate
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # mappa
│   │   ├── search.tsx
│   │   ├── add.tsx
│   │   ├── notifications.tsx
│   │   ├── profile.tsx
│   │   └── mod.tsx           # visibile solo se role ∈ {mod, admin}
│   └── lurido/[id].tsx
├── src/
│   ├── components/           # L* primitives (LButton, LPin, …)
│   ├── features/             # feature slices (map, lurido, review, …) – vuoto
│   ├── hooks/                # vuoto
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── store/useAuthStore.ts
│   │   ├── theme/{tokens.ts,ThemeProvider.tsx}
│   │   └── utils/cn.ts
│   └── types/{db.ts,domain.ts}
├── _design/                  # prototipo web (solo riferimento)
├── screenshots/              # render PNG per verifica visiva
├── supabase_schema.sql
├── supabase_seed.sql
├── CLAUDE.md
└── README.md                 # design brief completo
```

## Comandi utili

```bash
pnpm typecheck         # tsc --noEmit
pnpm lint              # eslint
pnpm db:types          # rigenera src/types/db.ts da Supabase
```
