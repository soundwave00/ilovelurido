/**
 * fix-luridi-data.mjs — Cerca su Google Places i luridi del seed che mancano
 * di google_place_id, foto o hanno orari sbagliati. Genera SQL completo.
 *
 * USO:
 *   GOOGLE_PLACES_API_KEY=<server_key> node scripts/fix-luridi-data.mjs
 *
 * OUTPUT:
 *   - scripts/fix_luridi.json   → dati trovati (per review manuale)
 *   - scripts/fix_luridi.sql    → SQL completo da eseguire su Supabase
 *
 * PREREQUISITI DB:
 *   - Migration 0004 eseguita (colonna google_place_id + RPC aggiornate)
 */

import { writeFileSync } from 'fs';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('❌  Manca GOOGLE_PLACES_API_KEY.');
  process.exit(1);
}

const MAX_PHOTOS = 3;
const MAX_WIDTH = 800;
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Luridi da aggiornare: slug → query Places API
// updateHours: true = aggiorna anche gli orari dal DB di Google
// updateAddress: string = sovrascrive l'indirizzo con questo valore prima di cercare
const TO_FIX = [
  // Hours + photos
  { slug: 'anche-forno',                  query: 'Anche Forno Via Carmagnola 5b Milano',           updateHours: true },
  { slug: 'chiosco-maradona',             query: 'Chiosco Maradona Via Odoardo Tabacchi 33 Milano', updateHours: true },
  { slug: 'pandy-e-mucca',                query: 'Pandy e Mucca chiosco Piazzale Libia Milano',     updateHours: true },
  { slug: 'al-boschetto-da-gabry',        query: 'Al Boschetto da Gabry Corso Porta Vittoria 23 Milano', updateHours: true },
  { slug: 'chiosco-gio-giovanni-panetta', query: 'Chiosco Giò Giovanni Panetta Viale Alemagna Milano', updateHours: true },

  // Photos only (hours ok)
  { slug: 'bar-quadronno',    query: 'Bar Quadronno Via Quadronno 34 Milano',        updateHours: false },
  { slug: 'isola-verde',      query: 'Isola Verde chiosco Piazza Melozzo da Forlì Milano', updateHours: false },
  { slug: 'le-capannelle',    query: 'Le Capannelle Viale Papiniano 23 Milano',      updateHours: false },
  { slug: 'margy-burger',     query: 'Margy Burger Piazza Santo Stefano 2 Milano',  updateHours: false },
  { slug: 'calafuria',        query: 'Calafuria Viale Marche 65 Milano',             updateHours: false },
  { slug: 'forno-di-barona',  query: 'Forno di Barona Via Lago di Nemi 25 Milano',  updateHours: false },

  // Address fix + photos
  {
    slug: 'salamellaz',
    query: 'Salamellaz Piazzale Angelo Moratti Milano',
    updateHours: true,
    updateAddress: 'Piazzale Angelo Moratti',
  },

  // Le Luride — standby, solo foto se trovate
  { slug: 'le-luride-valeria-brunella', query: 'Le Luride Valeria Brunella Viale Argonne Milano', updateHours: false },
];

async function textSearch(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'it');
  url.searchParams.set('key', API_KEY);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.warn(`  ⚠️  ${data.status}: ${data.error_message ?? ''}`);
  }
  return data.results?.[0] ?? null;
}

async function placeDetails(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,photos,opening_hours,formatted_address,geometry');
  url.searchParams.set('language', 'it');
  url.searchParams.set('key', API_KEY);
  const res = await fetch(url.toString());
  const data = await res.json();
  return data.result ?? null;
}

async function resolveCdnUrl(photoRef) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
  url.searchParams.set('maxwidth', String(MAX_WIDTH));
  url.searchParams.set('photoreference', photoRef);
  url.searchParams.set('key', API_KEY);
  const res = await fetch(url.toString(), { redirect: 'follow' });
  return res.url.split('?')[0];
}

function buildHoursJson(openingHours) {
  if (!openingHours?.periods) return null;
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

function escapeSql(s) { return s.replace(/'/g, "''"); }

async function main() {
  console.log(`🔧  Fixing ${TO_FIX.length} luridi...\n`);

  const results = [];
  const sqlLines = [];

  sqlLines.push(`-- Generato da scripts/fix-luridi-data.mjs il ${new Date().toISOString().slice(0, 10)}`);
  sqlLines.push(`-- Aggiorna google_place_id, orari e inserisce foto per luridi del seed.`);
  sqlLines.push(`-- PREREQUISITO: migration 0004 eseguita.\n`);

  for (const item of TO_FIX) {
    process.stdout.write(`  ${item.slug}...`);
    await new Promise((r) => setTimeout(r, 300));

    const place = await textSearch(item.query);
    if (!place) {
      console.log(' ❌  non trovato');
      results.push({ slug: item.slug, placeId: null, photos: [] });
      continue;
    }

    const placeId = place.place_id;
    const details = await placeDetails(placeId);
    await new Promise((r) => setTimeout(r, 200));

    const photoRefs = (details?.photos ?? []).slice(0, MAX_PHOTOS);
    const cdnUrls = [];
    for (const p of photoRefs) {
      try {
        const u = await resolveCdnUrl(p.photo_reference);
        if (u?.startsWith('https://')) cdnUrls.push(u);
        await new Promise((r) => setTimeout(r, 150));
      } catch { /* skip */ }
    }

    const hours = item.updateHours ? buildHoursJson(details?.opening_hours) : null;
    const lat = details?.geometry?.location?.lat ?? null;
    const lng = details?.geometry?.location?.lng ?? null;
    const updateCoords = !!item.updateAddress && lat !== null && lng !== null;
    console.log(` ✅  placeId=${placeId} · ${cdnUrls.length} foto${hours ? ' · orari' : ''}${updateCoords ? ` · coords(${lat?.toFixed(4)},${lng?.toFixed(4)})` : ''}`);
    results.push({ slug: item.slug, placeId, photos: cdnUrls, hours, lat, lng });

    // SQL: UPDATE google_place_id
    sqlLines.push(`-- ${item.slug}`);
    sqlLines.push(`UPDATE public.luridi SET google_place_id = '${escapeSql(placeId)}' WHERE slug = '${item.slug}' AND (google_place_id IS NULL OR google_place_id = '');`);

    // SQL: UPDATE address + coordinate se specificato
    if (item.updateAddress && updateCoords) {
      sqlLines.push(`UPDATE public.luridi SET address = '${escapeSql(item.updateAddress)}', location = st_makepoint(${lng}, ${lat})::geography WHERE slug = '${item.slug}';`);
    } else if (item.updateAddress) {
      sqlLines.push(`UPDATE public.luridi SET address = '${escapeSql(item.updateAddress)}' WHERE slug = '${item.slug}';`);
    }

    // SQL: UPDATE hours
    if (hours) {
      const hoursJson = JSON.stringify(hours).replace(/'/g, "''");
      sqlLines.push(`UPDATE public.luridi SET hours = '${hoursJson}'::jsonb WHERE slug = '${item.slug}';`);
    }

    // SQL: INSERT photos
    for (let i = 0; i < cdnUrls.length; i++) {
      const escaped = escapeSql(cdnUrls[i]);
      sqlLines.push(`INSERT INTO public.photos (lurido_id, url, sort_order)`);
      sqlLines.push(`SELECT id, '${escaped}', ${i} FROM public.luridi WHERE slug = '${item.slug}'`);
      sqlLines.push(`  AND NOT EXISTS (SELECT 1 FROM public.photos p WHERE p.lurido_id = (SELECT id FROM public.luridi WHERE slug = '${item.slug}') AND p.url = '${escaped}');`);
    }

    sqlLines.push('');
  }

  writeFileSync('scripts/fix_luridi.json', JSON.stringify(results, null, 2), 'utf8');
  writeFileSync('scripts/fix_luridi.sql', sqlLines.join('\n'), 'utf8');

  const found = results.filter((r) => r.placeId).length;
  console.log(`\n✅  fix_luridi.sql — ${found}/${TO_FIX.length} trovati`);
  console.log('\nPROSSIMI PASSI:');
  console.log('  1. Rivedi fix_luridi.json — verifica place_id e orari corretti');
  console.log('  2. Esegui fix_luridi.sql su Supabase SQL editor');
}

main().catch((err) => {
  console.error('❌ ', err.message);
  process.exit(1);
});
