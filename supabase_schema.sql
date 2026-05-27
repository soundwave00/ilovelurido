-- ========================================================================
-- iLoveLurido · Supabase schema
-- Esegui nell'editor SQL di Supabase (Project → SQL Editor → New query).
-- Ordine: extensions → types → tables → indexes → functions → RLS policies
--         → storage buckets → seed data (opzionale).
-- ========================================================================

-- ───────────────────────────────── extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ───────────────────────────────── enums
create type lurido_status as enum ('pending', 'approved', 'rejected');
create type user_role     as enum ('user', 'moderator', 'admin');
create type notif_type    as enum ('approved', 'rejected', 'nearby', 'reply', 'badge', 'nottambulo');
create type report_target as enum ('lurido', 'review', 'photo');

-- ───────────────────────────────── users (estende auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  display_name text,
  avatar_url  text,
  bio         text,
  role        user_role not null default 'user',
  xp          integer not null default 0,
  level       integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ───────────────────────────────── luridi (i baracchini)
create table public.luridi (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text unique,
  description  text,
  address      text,
  neighborhood text,              -- zona: 'navigli', 'isola', ecc.
  phone        text,
  location     geography(point, 4326) not null,  -- usa PostGIS per query per distanza
  hours        jsonb,             -- es { "mon": ["22:00","04:00"], "tue": [...] }
  status       lurido_status not null default 'pending',
  rejection_reason text,
  temp_closed  boolean not null default false,
  added_by     uuid references public.profiles(id) on delete set null,
  approved_by  uuid references public.profiles(id),
  approved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index luridi_status_idx   on public.luridi(status);
create index luridi_location_idx on public.luridi using gist(location);
create index luridi_added_by_idx on public.luridi(added_by);

-- ───────────────────────────────── photos (gallery per lurido)
create table public.photos (
  id         uuid primary key default uuid_generate_v4(),
  lurido_id  uuid not null references public.luridi(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete set null,
  url        text not null,        -- URL Supabase Storage
  caption    text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index photos_lurido_idx on public.photos(lurido_id);

-- ───────────────────────────────── reviews
create table public.reviews (
  id         uuid primary key default uuid_generate_v4(),
  lurido_id  uuid not null references public.luridi(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  stars      smallint not null check (stars between 1 and 5),
  body       text,
  photo_url  text,
  created_at timestamptz not null default now(),
  unique(lurido_id, user_id)
);
create index reviews_lurido_idx on public.reviews(lurido_id);
create index reviews_user_idx   on public.reviews(user_id);

-- ───────────────────────────────── dishes (piatti/ingredienti votabili)
create table public.dishes (
  id         uuid primary key default uuid_generate_v4(),
  lurido_id  uuid not null references public.luridi(id) on delete cascade,
  name       text not null,
  added_by   uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index dishes_lurido_idx on public.dishes(lurido_id);

create table public.dish_votes (
  id         uuid primary key default uuid_generate_v4(),
  dish_id    uuid not null references public.dishes(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(dish_id, user_id)
);

-- ───────────────────────────────── saved / preferiti
create table public.saved_luridi (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  lurido_id  uuid not null references public.luridi(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lurido_id)
);

-- ───────────────────────────────── notifications
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       notif_type not null,
  title      text not null,
  body       text,
  lurido_id  uuid references public.luridi(id) on delete set null,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

-- ───────────────────────────────── reports (segnalazioni contenuto)
create table public.reports (
  id           uuid primary key default uuid_generate_v4(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  target_type  report_target not null,
  target_id    uuid not null,
  reason       text not null,
  resolved     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ───────────────────────────────── functions / triggers

-- auto-create profile on signup
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'lurido_' || substring(new.id::text, 1, 8)));
  return new;
end $$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at := now(); return new; end $$ language plpgsql;

create trigger luridi_updated_at
  before update on public.luridi
  for each row execute procedure public.set_updated_at();
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- view per rating medio
create view public.luridi_with_stats as
select
  l.*,
  coalesce(avg(r.stars)::numeric(3,2), 0) as avg_rating,
  count(r.id) as review_count
from public.luridi l
left join public.reviews r on r.lurido_id = l.id
group by l.id;

-- funzione per distanza-query
create or replace function public.nearby_luridi(
  lat double precision,
  lng double precision,
  radius_m integer default 2000
)
returns table (
  id uuid, name text, slug text, description text, address text,
  neighborhood text, phone text,
  lat float8, lng float8,
  hours jsonb, status lurido_status, temp_closed boolean,
  rejection_reason text,
  added_by uuid, approved_by uuid, approved_at timestamptz,
  created_at timestamptz, updated_at timestamptz
) as $$
  select
    l.id, l.name, l.slug, l.description, l.address,
    l.neighborhood, l.phone,
    ST_Y(l.location::geometry) as lat,
    ST_X(l.location::geometry) as lng,
    l.hours, l.status, l.temp_closed,
    l.rejection_reason,
    l.added_by, l.approved_by, l.approved_at,
    l.created_at, l.updated_at
  from public.luridi l
  where l.status = 'approved'
    and st_dwithin(l.location, st_makepoint(lng, lat)::geography, radius_m)
  order by l.location <-> st_makepoint(lng, lat)::geography
  limit 50;
$$ language sql stable;

-- ───────────────────────────────── RLS

alter table public.profiles      enable row level security;
alter table public.luridi        enable row level security;
alter table public.photos        enable row level security;
alter table public.reviews       enable row level security;
alter table public.dishes        enable row level security;
alter table public.dish_votes    enable row level security;
alter table public.saved_luridi  enable row level security;
alter table public.notifications enable row level security;
alter table public.reports       enable row level security;

-- helper: è moderatore o admin?
create or replace function public.is_mod() returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator','admin'))
$$ language sql stable security definer;

-- profiles
create policy "profiles_read_all"    on public.profiles for select using (true);
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id);

-- luridi: chiunque legge approved; il proprietario vede i suoi pending; i mod vedono tutto
create policy "luridi_read_approved" on public.luridi for select
  using (status = 'approved' or added_by = auth.uid() or public.is_mod());
create policy "luridi_insert_auth"   on public.luridi for insert
  with check (auth.uid() is not null and added_by = auth.uid());
create policy "luridi_update_owner_pending" on public.luridi for update
  using (added_by = auth.uid() and status = 'pending');
create policy "luridi_update_mod"    on public.luridi for update using (public.is_mod());
create policy "luridi_delete_mod"    on public.luridi for delete using (public.is_mod());

-- photos
create policy "photos_read_all"    on public.photos for select using (true);
create policy "photos_insert_auth" on public.photos for insert with check (auth.uid() = user_id);
create policy "photos_delete_own_or_mod" on public.photos for delete
  using (user_id = auth.uid() or public.is_mod());

-- reviews
create policy "reviews_read_all"      on public.reviews for select using (true);
create policy "reviews_insert_own"    on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own"    on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own_or_mod" on public.reviews for delete
  using (user_id = auth.uid() or public.is_mod());

-- dishes
create policy "dishes_read_all"    on public.dishes for select using (true);
create policy "dishes_insert_auth" on public.dishes for insert with check (auth.uid() = added_by);
create policy "dishes_delete_mod"  on public.dishes for delete using (public.is_mod());

-- dish_votes (1 voto per utente per piatto)
create policy "votes_read_all"     on public.dish_votes for select using (true);
create policy "votes_insert_own"   on public.dish_votes for insert with check (auth.uid() = user_id);
create policy "votes_delete_own"   on public.dish_votes for delete using (auth.uid() = user_id);

-- saved
create policy "saved_read_own"     on public.saved_luridi for select using (auth.uid() = user_id);
create policy "saved_insert_own"   on public.saved_luridi for insert with check (auth.uid() = user_id);
create policy "saved_delete_own"   on public.saved_luridi for delete using (auth.uid() = user_id);

-- notifications
create policy "notifs_read_own"    on public.notifications for select using (auth.uid() = user_id);
create policy "notifs_update_own"  on public.notifications for update using (auth.uid() = user_id);
create policy "notifs_insert_service" on public.notifications for insert
  with check (auth.uid() = user_id or public.is_mod());

-- reports
create policy "reports_read_mod"   on public.reports for select using (public.is_mod() or reporter_id = auth.uid());
create policy "reports_insert_auth" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reports_update_mod" on public.reports for update using (public.is_mod());

-- ───────────────────────────────── storage buckets
-- Crea questi buckets dalla UI (Storage → New bucket) oppure via SQL:
insert into storage.buckets (id, name, public) values
  ('avatars',       'avatars',       true),
  ('lurido-photos', 'lurido-photos', true),
  ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

-- Policies storage (esempio per lurido-photos; replica per gli altri)
create policy "lurido_photos_public_read" on storage.objects for select
  using (bucket_id = 'lurido-photos');
create policy "lurido_photos_auth_upload" on storage.objects for insert
  with check (bucket_id = 'lurido-photos' and auth.uid() is not null);
create policy "lurido_photos_owner_delete" on storage.objects for delete
  using (bucket_id = 'lurido-photos' and (owner = auth.uid() or public.is_mod()));

-- ───────────────────────────────── realtime
-- Abilita realtime sulle tabelle che vuoi ascoltare:
-- Supabase Dashboard → Database → Replication → luridi, reviews, notifications
