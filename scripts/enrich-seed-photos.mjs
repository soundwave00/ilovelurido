/**
 * enrich-seed-photos.mjs — Cerca i 15 luridi originali del seed su Google Places API,
 * scarica le foto e genera SQL per popolare google_place_id + photos.
 *
 * USO:
 *   GOOGLE_PLACES_API_KEY=<server_key> node scripts/enrich-seed-photos.mjs
 *
 * OUTPUT:
 *   - scripts/seed_photos.json  → dati grezzi (place_id trovati + foto URL)
 *   - scripts/seed_photos.sql   → UPDATE google_place_id + INSERT photos
 */

import { writeFileSync } from 'fs';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('❌  Manca GOOGLE_PLACES_API_KEY.');
  process.exit(1);
}

const MAX_PHOTOS = 3;
const MAX_WIDTH = 800;

// I 15 luridi originali del seed con slug + query di ricerca ottimizzata
const SEED_LURIDI = [
  { slug: 'le-luride-valeria-brunella',    query: 'Le Luride Valeria Brunella Milano Viale Argonne' },
  { slug: 'isola-verde',                   query: 'Isola Verde chiosco Piazza Melozzo da Forlì Milano' },
  { slug: 'bar-quadronno',                 query: 'Bar Quadronno Via Quadronno 34 Milano' },
  { slug: 'forno-di-barona',               query: 'Forno di Barona Via Lago di Nemi 25 Milano' },
  { slug: 'salamellaz',                    query: 'Salamellaz Viale Bligny Milano' },
  { slug: 'panini-crocetta',               query: 'Panini Crocetta d\'Autore Via Giotto 31 Milano' },
  { slug: 'chiosco-gio-giovanni-panetta',  query: 'Chiosco Giò Giovanni Panetta Viale Alemagna Milano' },
  { slug: 'al-boschetto-da-gabry',         query: 'Al Boschetto da Gabry Corso Porta Vittoria Milano' },
  { slug: 'al-19',                         query: 'Al 19 panino Via Odoardo Tabacchi 24 Milano' },
  { slug: 'chiosco-maradona',              query: 'Chiosco Maradona Via Odoardo Tabacchi 33 Milano' },
  { slug: 'pandy-e-mucca',                 query: 'Pandy e Mucca chiosco Piazzale Libia Milano' },
  { slug: 'margy-burger',                  query: 'Margy Burger Piazza Santo Stefano 2 Milano' },
  { slug: 'le-capannelle',                 query: 'Le Capannelle Viale Papiniano 23 Milano' },
  { slug: 'calafuria',                     query: 'Calafuria Viale Marche 65 Milano' },
  { slug: 'anche-forno',                   query: 'Anche Forno Via Carmagnola 5b Milano' },
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
  return data.results?.[0] ?? null; // primo risultato
}

async function getPhotoRefs(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'photos');
  url.searchParams.set('key', API_KEY);
  const res = await fetch(url.toString());
  const data = await res.json();
  return (data.result?.photos ?? []).slice(0, MAX_PHOTOS);
}

async function resolveCdnUrl(photoRef) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
  url.searchParams.set('maxwidth', String(MAX_WIDTH));
  url.searchParams.set('photoreference', photoRef);
  url.searchParams.set('key', API_KEY);
  const res = await fetch(url.toString(), { redirect: 'follow' });
  return res.url.split('?')[0]; // CDN senza parametri
}

async function main() {
  console.log(`🔍  Cerco ${SEED_LURIDI.length} luridi su Places API...\n`);

  const results = [];

  for (const lurido of SEED_LURIDI) {
    process.stdout.write(`  ${lurido.slug}...`);

    // Cerca place_id
    const place = await textSearch(lurido.query);
    if (!place) {
      console.log(' ❌  non trovato');
      results.push({ slug: lurido.slug, placeId: null, photos: [] });
      await new Promise((r) => setTimeout(r, 300));
      continue;
    }

    const placeId = place.place_id;
    process.stdout.write(` [${placeId}]`);

    // Foto
    const photoRefs = await getPhotoRefs(placeId);
    await new Promise((r) => setTimeout(r, 200));

    const cdnUrls = [];
    for (const p of photoRefs) {
      try {
        const url = await resolveCdnUrl(p.photo_reference);
        if (url?.startsWith('https://')) cdnUrls.push(url);
        await new Promise((r) => setTimeout(r, 150));
      } catch { /* ignora singola foto fallita */ }
    }

    console.log(` ✅  ${cdnUrls.length} foto`);
    results.push({ slug: lurido.slug, placeId, photos: cdnUrls });
    await new Promise((r) => setTimeout(r, 300));
  }

  writeFileSync('scripts/seed_photos.json', JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n📄  seed_photos.json scritto`);

  // Genera SQL
  const lines = [];
  lines.push(`-- Generato da scripts/enrich-seed-photos.mjs il ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`-- 1. Aggiorna google_place_id sui luridi del seed originale`);
  lines.push(`-- 2. Inserisce foto Google CDN nella tabella photos`);
  lines.push(`-- PREREQUISITO: migration 0003 eseguita + colonna google_place_id presente\n`);

  // UPDATE google_place_id
  for (const r of results) {
    if (!r.placeId) continue;
    lines.push(`UPDATE public.luridi SET google_place_id = '${r.placeId}' WHERE slug = '${r.slug}' AND google_place_id IS NULL;`);
  }
  lines.push('');

  // INSERT photos
  for (const r of results) {
    if (!r.photos.length) continue;
    for (let i = 0; i < r.photos.length; i++) {
      const escaped = r.photos[i].replace(/'/g, "''");
      lines.push(`INSERT INTO public.photos (lurido_id, url, sort_order)`);
      lines.push(`SELECT id, '${escaped}', ${i}`);
      lines.push(`FROM public.luridi WHERE slug = '${r.slug}'`);
      lines.push(`  AND NOT EXISTS (SELECT 1 FROM public.photos p WHERE p.lurido_id = (SELECT id FROM public.luridi WHERE slug = '${r.slug}') AND p.url = '${escaped}');\n`);
    }
  }

  writeFileSync('scripts/seed_photos.sql', lines.join('\n'), 'utf8');

  const found = results.filter((r) => r.placeId).length;
  const withPhotos = results.filter((r) => r.photos.length > 0).length;
  console.log(`✅  seed_photos.sql scritto — ${found}/15 trovati, ${withPhotos}/15 con foto\n`);
  console.log('PROSSIMI PASSI:');
  console.log('  1. Rivedi seed_photos.json (verifica che i place_id siano corretti)');
  console.log('  2. Esegui seed_photos.sql su Supabase SQL editor');
}

main().catch((err) => {
  console.error('❌ ', err.message);
  process.exit(1);
});
