/**
 * fetch-photos.mjs — Scarica le prime 3 foto per ogni lurido con google_place_id
 * e genera INSERT SQL per la tabella `public.photos`.
 *
 * Tecnica: risolve il redirect della Places Photo API → URL CDN lh3.googleusercontent.com
 * (pubblico, senza chiave, stabile a lungo termine).
 *
 * USO:
 *   GOOGLE_PLACES_API_KEY=<server_key> node scripts/fetch-photos.mjs
 *
 * OUTPUT:
 *   - scripts/luridi_photos.json  → dati grezzi (per debug)
 *   - scripts/luridi_photos.sql   → INSERT in public.photos (da eseguire su Supabase)
 *
 * PREREQUISITO DB:
 *   La tabella luridi deve avere la colonna google_place_id (migration 0003 o manuale):
 *     alter table public.luridi add column if not exists google_place_id text unique;
 *
 * NOTA: cerca i luridi con google_place_id nel file luridi_found_clean.json.
 */

import { writeFileSync, readFileSync } from 'fs';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('❌  Manca GOOGLE_PLACES_API_KEY.');
  process.exit(1);
}

const MAX_PHOTOS_PER_PLACE = 3;
const MAX_PHOTO_WIDTH = 800;

// Legge luridi_found_clean.json che contiene i placeId
let luridiJson;
try {
  luridiJson = JSON.parse(readFileSync('scripts/luridi_found_clean.json', 'utf8'));
} catch {
  console.error('❌  scripts/luridi_found_clean.json non trovato. Rrunna prima find-luridi.mjs.');
  process.exit(1);
}

async function getPhotoReferences(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'photos');
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.status !== 'OK') {
    console.warn(`  ⚠️  Details warning for ${placeId}: ${data.status}`);
    return [];
  }
  return (data.result?.photos ?? []).slice(0, MAX_PHOTOS_PER_PLACE);
}

async function resolveCdnUrl(photoRef) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
  url.searchParams.set('maxwidth', String(MAX_PHOTO_WIDTH));
  url.searchParams.set('photoreference', photoRef);
  url.searchParams.set('key', API_KEY);

  // Segue il redirect per ottenere l'URL CDN pubblico (senza chiave)
  const res = await fetch(url.toString(), { redirect: 'follow' });
  // L'URL finale è il CDN lh3.googleusercontent.com
  const cdnUrl = res.url;
  // Rimuovi parametri di tracking se presenti
  const clean = cdnUrl.split('?')[0];
  return clean;
}

async function main() {
  console.log(`🖼️  Scarico foto per ${luridiJson.length} luridi...\n`);

  const results = [];

  for (const lurido of luridiJson) {
    const { placeId, name } = lurido;
    process.stdout.write(`  ${name} (${placeId})...`);

    const photos = await getPhotoReferences(placeId);
    if (!photos.length) {
      console.log(' ⏭️  nessuna foto');
      continue;
    }

    const cdnUrls = [];
    for (const photo of photos) {
      try {
        const cdnUrl = await resolveCdnUrl(photo.photo_reference);
        if (cdnUrl && cdnUrl.startsWith('https://')) {
          cdnUrls.push(cdnUrl);
        }
        await new Promise((r) => setTimeout(r, 150));
      } catch (err) {
        console.warn(`\n    ⚠️  Errore foto: ${err.message}`);
      }
    }

    console.log(` ✅  ${cdnUrls.length} foto`);
    results.push({ placeId, name, photos: cdnUrls });
    await new Promise((r) => setTimeout(r, 300));
  }

  writeFileSync('scripts/luridi_photos.json', JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n📄  luridi_photos.json scritto — ${results.length} luridi con foto`);

  // Genera SQL
  const sqlBlocks = results.map(({ placeId, photos }) => {
    const rows = photos.map((url, i) => {
      const escapedUrl = url.replace(/'/g, "''");
      return `  INSERT INTO public.photos (lurido_id, url, sort_order)
  SELECT id, '${escapedUrl}', ${i}
  FROM public.luridi
  WHERE google_place_id = '${placeId}'
    AND NOT EXISTS (
      SELECT 1 FROM public.photos p2
      WHERE p2.lurido_id = (SELECT id FROM public.luridi WHERE google_place_id = '${placeId}')
        AND p2.url = '${escapedUrl}'
    );`;
    });
    return rows.join('\n');
  });

  const sql = `-- Generato da scripts/fetch-photos.mjs il ${new Date().toISOString().slice(0, 10)}
-- Inserisce foto Google Places (URL CDN lh3.googleusercontent.com) per i luridi
-- con google_place_id corrispondente.
--
-- PREREQUISITO: migration 0003 eseguita (nearby_luridi/search_luridi aggiornati)
-- NOTA: se google_place_id non esiste nella colonna, la query è no-op.

${sqlBlocks.join('\n\n')}
`;

  writeFileSync('scripts/luridi_photos.sql', sql, 'utf8');
  console.log(`✅  luridi_photos.sql scritto\n`);
  console.log('PROSSIMI PASSI:');
  console.log('  1. Esegui supabase/migrations/0003_cover_photo_url.sql su Supabase SQL editor');
  console.log('  2. Assicurati che i luridi abbiano google_place_id nel DB');
  console.log('  3. Esegui scripts/luridi_photos.sql su Supabase SQL editor');
}

main().catch((err) => {
  console.error('❌  Errore:', err.message);
  process.exit(1);
});
