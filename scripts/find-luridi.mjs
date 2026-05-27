/**
 * find-luridi.mjs — Script one-shot per trovare luridi su Google Places API
 * e generare INSERT SQL pronti per supabase_seed.sql.
 *
 * USO:
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/find-luridi.mjs
 *
 * OUTPUT:
 *   - luridi_found.json   → dati grezzi da Google Places (per review manuale)
 *   - luridi_seed.sql     → INSERT SQL pronti (da incollare in supabase_seed.sql)
 *
 * FLUSSO:
 *   1. Chiama Places API Text Search con più query su Milano
 *   2. De-duplica per place_id
 *   3. Per ogni posto chiama Place Details per orari + telefono
 *   4. Genera SQL solo per posti con orari notturni (chiude dopo mezzanotte)
 *   5. Scrive i file di output
 *
 * COSTO STIMATO: ~20-30 chiamate API Text Search + ~50-100 Place Details
 *   = circa $2-4 totali (one-shot, non ricorrente)
 *
 * REVIEW MANUALE NECESSARIA:
 *   Places API restituisce anche McDonald's, Subway, ecc.
 *   Dopo lo script, apri luridi_found.json, rimuovi i posti non pertinenti,
 *   poi esegui luridi_seed.sql su Supabase.
 */

import { writeFileSync } from 'fs';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('❌  Manca GOOGLE_PLACES_API_KEY. Esporta la variabile prima di lanciare lo script.');
  process.exit(1);
}

// Centro Milano (Duomo) + raggio 8km
const MILANO_LAT = 45.4642;
const MILANO_LNG = 9.1900;
const RADIUS_METERS = 8000;

// Query per trovare luridi — più specifiche = risultati migliori
const QUERIES = [
  'baracchino panini Milano',
  'chiosco panini notturno Milano',
  'sandwich shop aperto notte Milano',
  'paninaro Milano',
  'chiosco salamella Milano',
];

// Tipi Google Places che corrispondono a luridi
const RELEVANT_TYPES = new Set([
  'sandwich_shop',
  'fast_food_restaurant',
  'bakery',
  'meal_takeaway',
  'food',
  'restaurant',
]);

// Quartieri Milano (per neighborhood field)
const NEIGHBORHOODS = [
  { name: 'Navigli', lat: 45.4503, lng: 9.1770, radius: 0.015 },
  { name: 'Isola', lat: 45.4900, lng: 9.1928, radius: 0.012 },
  { name: 'Brera', lat: 45.4720, lng: 9.1871, radius: 0.010 },
  { name: 'Porta Romana', lat: 45.4539, lng: 9.1938, radius: 0.012 },
  { name: 'Città Studi', lat: 45.4711, lng: 9.2291, radius: 0.015 },
  { name: 'Sempione', lat: 45.4699, lng: 9.1751, radius: 0.012 },
  { name: 'Porta Vittoria', lat: 45.4625, lng: 9.2009, radius: 0.012 },
  { name: 'Bocconi', lat: 45.4523, lng: 9.1894, radius: 0.010 },
  { name: 'San Siro', lat: 45.4682, lng: 9.1312, radius: 0.015 },
  { name: 'Barona', lat: 45.4352, lng: 9.1687, radius: 0.012 },
  { name: 'NoLo', lat: 45.4910, lng: 9.1835, radius: 0.012 },
];

function guessNeighborhood(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const n of NEIGHBORHOODS) {
    const d = Math.sqrt((lat - n.lat) ** 2 + (lng - n.lng) ** 2);
    if (d < bestDist) { bestDist = d; best = n; }
  }
  return best && bestDist < 0.03 ? best.name : 'Milano';
}

async function textSearch(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('location', `${MILANO_LAT},${MILANO_LNG}`);
  url.searchParams.set('radius', String(RADIUS_METERS));
  url.searchParams.set('language', 'it');
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.warn(`  ⚠️  Text Search warning: ${data.status} — ${data.error_message ?? ''}`);
  }
  return data.results ?? [];
}

async function placeDetails(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,formatted_address,geometry,formatted_phone_number,opening_hours,types,rating,user_ratings_total');
  url.searchParams.set('language', 'it');
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();
  return data.result ?? null;
}

function isOpenLateNight(openingHours) {
  if (!openingHours?.periods) return false;
  return openingHours.periods.some((p) => {
    if (!p.close) return true; // open 24h
    const closeTime = parseInt(p.close.time, 10);
    // Chiude dopo mezzanotte (0000-0600) o dopo le 23:00
    return closeTime <= 600 || closeTime >= 2300;
  });
}

function buildHoursJson(openingHours) {
  if (!openingHours?.periods) return null;
  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const hours = {};
  for (const period of openingHours.periods) {
    const day = DAY_KEYS[period.open.day];
    if (!day) continue;
    const open = `${period.open.time.slice(0, 2)}:${period.open.time.slice(2)}`;
    const close = period.close
      ? `${period.close.time.slice(0, 2)}:${period.close.time.slice(2)}`
      : '23:59';
    hours[day] = [open, close];
  }
  return Object.keys(hours).length > 0 ? hours : null;
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toSql(place) {
  const { name, address, neighborhood, phone, lat, lng, hours, placeId } = place;
  const slug = slugify(name);
  const hoursJson = hours ? JSON.stringify(hours).replace(/'/g, "''") : 'null';
  const phoneSql = phone ? `'${phone.replace(/'/g, "''")}'` : 'null';
  const addrSql = address ? `'${address.replace(/'/g, "''")}'` : 'null';
  const nameSql = name.replace(/'/g, "''");

  return `  (
    '${nameSql}',
    '${slug}',
    null,
    ${addrSql},
    '${neighborhood}',
    ${phoneSql},
    st_makepoint(${lng}, ${lat})::geography,
    ${hoursJson !== 'null' ? `'${hoursJson}'::jsonb` : 'null'},
    'pending',
    '${placeId}'
  )`;
}

async function main() {
  console.log('🔍  Ricerca luridi su Google Places API...\n');

  // 1. Raccoglie risultati da tutte le query
  const seen = new Map(); // place_id → raw result
  for (const query of QUERIES) {
    console.log(`  Query: "${query}"`);
    const results = await textSearch(query);
    console.log(`    → ${results.length} risultati`);
    for (const r of results) {
      if (!seen.has(r.place_id)) seen.set(r.place_id, r);
    }
    await new Promise((r) => setTimeout(r, 300)); // rate limit
  }
  console.log(`\n  Totale unici: ${seen.size} posti\n`);

  // 2. Place Details per ognuno
  const enriched = [];
  let i = 0;
  for (const [placeId, raw] of seen) {
    i++;
    process.stdout.write(`  Dettagli ${i}/${seen.size}: ${raw.name}...`);
    const details = await placeDetails(placeId);
    if (!details) { console.log(' ❌  skip'); continue; }

    const hasRelevantType = details.types?.some((t) => RELEVANT_TYPES.has(t));
    if (!hasRelevantType) { console.log(' ⏭️  tipo non rilevante'); continue; }

    const lateNight = isOpenLateNight(details.opening_hours);
    console.log(lateNight ? ' ✅  notturno' : ' ☀️  solo diurno');

    const lat = details.geometry.location.lat;
    const lng = details.geometry.location.lng;
    enriched.push({
      placeId,
      name: details.name,
      address: details.formatted_address?.replace(', Milano MI, Italia', '').replace(', Italia', ''),
      neighborhood: guessNeighborhood(lat, lng),
      phone: details.formatted_phone_number ?? null,
      lat,
      lng,
      hours: buildHoursJson(details.opening_hours),
      isLateNight: lateNight,
      types: details.types,
      rating: details.rating,
      ratingsTotal: details.user_ratings_total,
    });
    await new Promise((r) => setTimeout(r, 200));
  }

  // 3. Scrive JSON grezzo (per review manuale)
  writeFileSync(
    'scripts/luridi_found.json',
    JSON.stringify(enriched, null, 2),
    'utf8',
  );
  console.log(`\n📄  luridi_found.json scritto — ${enriched.length} posti totali`);

  // 4. Filtra solo notturni e genera SQL
  const lateNightOnes = enriched.filter((p) => p.isLateNight);
  console.log(`🌙  Posti notturni (chiude dopo mezzanotte): ${lateNightOnes.length}`);

  const sqlRows = lateNightOnes.map(toSql).join(',\n\n');
  const sql = `-- Generato da scripts/find-luridi.mjs il ${new Date().toISOString().slice(0, 10)}
-- REVIEW MANUALE NECESSARIA: rimuovi posti non pertinenti (McDonald's, Subway, ecc.)
-- Poi incolla in supabase_seed.sql o esegui direttamente su Supabase SQL editor.
--
-- Schema aggiuntivo necessario (se non già presente):
-- alter table public.luridi add column if not exists google_place_id text unique;

insert into public.luridi
  (name, slug, description, address, neighborhood, phone, location, hours, status, google_place_id)
values
${sqlRows};
`;

  writeFileSync('scripts/luridi_seed.sql', sql, 'utf8');
  console.log(`✅  luridi_seed.sql scritto — ${lateNightOnes.length} posti pronti per review\n`);
  console.log('PROSSIMI PASSI:');
  console.log('  1. Apri scripts/luridi_found.json e rimuovi posti non pertinenti');
  console.log('  2. Esegui scripts/luridi_seed.sql su Supabase SQL editor');
  console.log('  3. I nuovi luridi entrano come status=pending — moderali dall\'app');
}

main().catch((err) => {
  console.error('❌  Errore:', err.message);
  process.exit(1);
});
