-- ========================================================================
-- iLoveLurido · Migration 0004 — google_place_id nelle RPC + colonna
-- Esegui nell'editor SQL di Supabase (Project → SQL Editor → New query).
-- ========================================================================

-- Colonna google_place_id (idempotente)
ALTER TABLE public.luridi ADD COLUMN IF NOT EXISTS google_place_id text;
CREATE UNIQUE INDEX IF NOT EXISTS luridi_google_place_id_idx ON public.luridi(google_place_id)
  WHERE google_place_id IS NOT NULL AND google_place_id != 'NOT_FOUND';

-- NB: DROP obbligatorio — firma di ritorno cambia di nuovo
DROP FUNCTION IF EXISTS public.nearby_luridi(double precision, double precision, integer);
DROP FUNCTION IF EXISTS public.search_luridi(text, int);

-- ───────────────────────────────── nearby_luridi
CREATE FUNCTION public.nearby_luridi(
  lat double precision,
  lng double precision,
  radius_m integer DEFAULT 2000
)
RETURNS TABLE (
  id uuid, name text, slug text, description text, address text,
  neighborhood text, phone text,
  lat float8, lng float8,
  hours jsonb, status lurido_status, temp_closed boolean,
  rejection_reason text,
  added_by uuid, approved_by uuid, approved_at timestamptz,
  created_at timestamptz, updated_at timestamptz,
  cover_photo_url text,
  google_place_id text
) AS $$
  SELECT
    l.id, l.name, l.slug, l.description, l.address,
    l.neighborhood, l.phone,
    ST_Y(l.location::geometry) AS lat,
    ST_X(l.location::geometry) AS lng,
    l.hours, l.status, l.temp_closed,
    l.rejection_reason,
    l.added_by, l.approved_by, l.approved_at,
    l.created_at, l.updated_at,
    (SELECT p.url FROM public.photos p WHERE p.lurido_id = l.id ORDER BY p.sort_order LIMIT 1) AS cover_photo_url,
    l.google_place_id
  FROM public.luridi l
  WHERE l.status = 'approved'
    AND st_dwithin(l.location, st_makepoint(lng, lat)::geography, radius_m)
  ORDER BY l.location <-> st_makepoint(lng, lat)::geography
  LIMIT 50;
$$ LANGUAGE sql STABLE;

-- ───────────────────────────────── search_luridi
CREATE FUNCTION public.search_luridi(q text, limit_n int DEFAULT 30)
RETURNS TABLE (
  id uuid, name text, slug text, description text, address text,
  neighborhood text, phone text,
  lat float8, lng float8,
  hours jsonb, status lurido_status, temp_closed boolean,
  rejection_reason text,
  added_by uuid, approved_by uuid, approved_at timestamptz,
  created_at timestamptz, updated_at timestamptz,
  cover_photo_url text,
  google_place_id text
) AS $$
  SELECT
    l.id, l.name, l.slug, l.description, l.address,
    l.neighborhood, l.phone,
    ST_Y(l.location::geometry) AS lat,
    ST_X(l.location::geometry) AS lng,
    l.hours, l.status, l.temp_closed,
    l.rejection_reason,
    l.added_by, l.approved_by, l.approved_at,
    l.created_at, l.updated_at,
    (SELECT p.url FROM public.photos p WHERE p.lurido_id = l.id ORDER BY p.sort_order LIMIT 1) AS cover_photo_url,
    l.google_place_id
  FROM public.luridi l
  WHERE l.status = 'approved'
    AND (
      l.name         ilike '%' || q || '%' OR
      l.neighborhood ilike '%' || q || '%' OR
      l.address      ilike '%' || q || '%' OR
      l.description  ilike '%' || q || '%'
    )
  LIMIT limit_n;
$$ LANGUAGE sql STABLE;
