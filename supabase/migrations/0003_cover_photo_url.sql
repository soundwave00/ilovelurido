-- ========================================================================
-- iLoveLurido · Migration 0003 — cover_photo_url nelle RPC nearby/search
-- Esegui nell'editor SQL di Supabase (Project → SQL Editor → New query).
-- ========================================================================

-- NB: DROP obbligatorio — la firma di ritorno cambia
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
  cover_photo_url text
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
    (SELECT p.url FROM public.photos p WHERE p.lurido_id = l.id ORDER BY p.sort_order LIMIT 1) AS cover_photo_url
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
  cover_photo_url text
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
    (SELECT p.url FROM public.photos p WHERE p.lurido_id = l.id ORDER BY p.sort_order LIMIT 1) AS cover_photo_url
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
