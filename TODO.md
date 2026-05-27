# iLoveLurido — TODO & Future Features

## Google Places API — Opzione B (integrazione live in-app)

**Quando farlo:** quando l'app ha utenti reali e vuoi che il dataset cresca automaticamente.

### Cosa fa
Quando un utente cerca un posto nell'app (schermata Search o Add), se non lo trova nel DB chiami Google Places Nearby Search in background e suggerisci posti nelle vicinanze non ancora mappati come luridi. L'utente può proporre il posto trovato direttamente come nuovo lurido (pre-compilando i campi con i dati Places API).

### Modifiche necessarie al codice

**1. Schema Supabase — aggiungi colonna:**
```sql
alter table public.luridi add column google_place_id text unique;
create index luridi_place_id_idx on public.luridi(google_place_id);
```
Serve per de-duplicare: se un lurido è già in DB con quel place_id, non suggerirlo di nuovo.

**2. Edge function `search-nearby-places` (Supabase Edge Function):**
```typescript
// supabase/functions/search-nearby-places/index.ts
// Input: { lat, lng, radius?, query? }
// Output: array di posti Google Places non ancora in luridi DB
// Chiamata: Places API v2 Nearby Search
// Filtro: types = ["sandwich_shop", "fast_food_restaurant", "bakery"]
// De-duplica contro luridi.google_place_id
// NON esporre GOOGLE_MAPS_API_KEY al client — solo server-side
```

**3. Hook React Native `useNearbyPlaces`:**
```typescript
// src/hooks/useNearbyPlaces.ts
// Chiama l'edge function, restituisce suggerimenti non in DB
// Usato in: app/(tabs)/search.tsx e app/(tabs)/add.tsx (step 0, barra ricerca)
```

**4. UI — componente `PlaceSuggestion`:**
- Mostrato sotto i risultati normali in Search
- Card con "Questo posto non è ancora su iLoveLurido — aggiungilo!" 
- Al tap precompila il form Add con dati Places API (nome, indirizzo, coordinate, orari)

### Costi API (Google Places API v2)
- Nearby Search: ~$0.032 per richiesta
- Text Search: ~$0.032 per richiesta
- Place Details (per orari/telefono): ~$0.017 per richiesta
- Stima: con 1000 utenti attivi/giorno + rate limiting = ~$20-50/mese
- Metti un rate limit lato edge function: max 1 chiamata Places ogni 30s per utente

### Chiave API
- NON usare `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` (quella è per mappe, ha restrizioni bundle ID)
- Crea una chiave separata su Google Cloud Console con restrizione HTTP referrer → solo la edge function Supabase
- Salva come `GOOGLE_PLACES_API_KEY` nei secret Supabase (non in `.env` client)

### Query consigliate per trovare luridi
```
"baracchino panini Milano"
"chiosco notturno Milano"  
"panini notte Milano"
"sandwich shop open late Milan"
```
Types filter: `sandwich_shop`, `fast_food_restaurant`, `bakery`, `meal_takeaway`

---

## Script one-shot — Opzione A (già disponibile)

Script per arricchire il seed. Vedi `scripts/find-luridi.mjs`.

---

## Altre feature future

- [ ] Badge system: logica XP in edge function (step 8 roadmap)
- [ ] Notifiche push: edge function `send-push-notification` trigger su nuove notifiche (step 10)
- [ ] OAuth Google + Apple (step 2, dopo email funzionante)
- [ ] Cluster mappa: `react-native-map-clustering` sopra `react-native-maps` (step 4)
