-- ========================================================================
-- iLoveLurido · Migration 0005 — pulizia luridi mock + chiusi
-- Esegui nell'editor SQL di Supabase (Project → SQL Editor → New query).
-- ========================================================================

-- ───────────────────────────────── Luridi fittizi (mock seed iniziale)
-- Nessuna traccia di questi posti su Google Maps, TripAdvisor, social o
-- guide gastronomiche milanesi. Sono puri mock creati per test iniziali.

DELETE FROM public.luridi WHERE slug IN (
  'da-caterina',
  'baracchino-del-tonio',
  'chiosco-del-nonno',
  'lurido-dei-poeti',
  'il-furgone-fluorescente'
);

-- ───────────────────────────────── Definitivamente chiusi
-- Panini Crocetta d'Autore 1982: confermato chiuso definitivamente
DELETE FROM public.luridi WHERE slug = 'panini-crocetta';

-- ───────────────────────────────── Salamellaz: aggiorna a food truck San Siro
-- Il food truck opera a Piazzale Angelo Moratti (fuori San Siro).
-- Coordinate: Piazzale Angelo Moratti, Milano ≈ 45.4784, 9.1245
-- (aggiornate da fix-luridi-data.mjs se place_id trovato correttamente)
UPDATE public.luridi
SET
  address      = 'Piazzale Angelo Moratti',
  neighborhood = 'San Siro / Lotto',
  location     = st_makepoint(9.1245, 45.4784)::geography,
  description  = 'Food truck storico fuori dallo Stadio Meazza (San Siro), fondato dai fratelli Lentini. La salamella smashed è diventata un fenomeno social con oltre 200k follower. Da marzo 2026 c''è anche la sede fissa in Viale Bligny 18.'
WHERE slug = 'salamellaz';
