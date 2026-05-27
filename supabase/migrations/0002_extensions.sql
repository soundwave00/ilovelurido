-- ========================================================================
-- iLoveLurido · Migration 0002 — estensioni schema
-- Esegui nell'editor SQL di Supabase (Project → SQL Editor → New query).
-- ========================================================================

-- ───────────────────────────────── photos.blurhash
alter table public.photos add column if not exists blurhash text;

-- ───────────────────────────────── badges catalog
create table if not exists public.badges (
  id          text primary key,
  name        text not null,
  description text not null,
  emoji       text not null,
  rule        jsonb,
  sort_order  integer not null default 0
);

create table if not exists public.user_badges (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  badge_id    text not null references public.badges(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

create policy "badges_read_all"      on public.badges      for select using (true);
create policy "user_badges_read_all" on public.user_badges for select using (true);
create policy "user_badges_insert_service" on public.user_badges for insert
  with check (auth.uid() is not null); -- inserito da edge function/trigger

-- ───────────────────────────────── expo push tokens
create table if not exists public.expo_push_tokens (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  token      text not null,
  platform   text not null,
  updated_at timestamptz not null default now()
);

alter table public.expo_push_tokens enable row level security;

create policy "push_tokens_own" on public.expo_push_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ───────────────────────────────── review replies
create table if not exists public.review_replies (
  id         uuid primary key default uuid_generate_v4(),
  review_id  uuid not null references public.reviews(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists review_replies_review_idx on public.review_replies(review_id);

alter table public.review_replies enable row level security;
create policy "replies_read_all"    on public.review_replies for select using (true);
create policy "replies_insert_own"  on public.review_replies for insert with check (auth.uid() = user_id);
create policy "replies_delete_own_or_mod" on public.review_replies for delete
  using (user_id = auth.uid() or public.is_mod());

-- ───────────────────────────────── review helpful votes
create table if not exists public.review_helpful (
  review_id  uuid not null references public.reviews(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  primary key (review_id, user_id)
);

alter table public.review_helpful enable row level security;
create policy "helpful_read_all"    on public.review_helpful for select using (true);
create policy "helpful_insert_own"  on public.review_helpful for insert with check (auth.uid() = user_id);
create policy "helpful_delete_own"  on public.review_helpful for delete using (auth.uid() = user_id);

-- ───────────────────────────────── storage policies mancanti
create policy "avatars_public_read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars_auth_upload" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() is not null);
create policy "avatars_owner_delete" on storage.objects for delete
  using (bucket_id = 'avatars' and owner = auth.uid());

create policy "review_photos_public_read" on storage.objects for select
  using (bucket_id = 'review-photos');
create policy "review_photos_auth_upload" on storage.objects for insert
  with check (bucket_id = 'review-photos' and auth.uid() is not null);
create policy "review_photos_owner_delete" on storage.objects for delete
  using (bucket_id = 'review-photos' and (owner = auth.uid() or public.is_mod()));

-- ───────────────────────────────── XP system
create or replace function public.bump_xp(uid uuid, delta int) returns void as $$
  update public.profiles
     set xp    = xp + delta,
         level = greatest(1, 1 + (xp + delta) / 100)
   where id = uid;
$$ language sql security definer;

-- +10 XP su review inserita
create or replace function public.on_review_insert() returns trigger as $$
begin
  perform public.bump_xp(new.user_id, 10);
  return new;
end $$ language plpgsql security definer;

create trigger reviews_xp
  after insert on public.reviews
  for each row execute procedure public.on_review_insert();

-- +25 XP quando lurido approvato + notifica all'autore
create or replace function public.on_lurido_approved() returns trigger as $$
begin
  if new.status = 'approved' and old.status != 'approved' and new.added_by is not null then
    perform public.bump_xp(new.added_by, 25);
    insert into public.notifications (user_id, type, title, body, lurido_id)
    values (new.added_by, 'approved', 'Il tuo lurido è online', new.name, new.id);
  end if;
  return new;
end $$ language plpgsql security definer;

create trigger luridi_approved_xp
  after update on public.luridi
  for each row execute procedure public.on_lurido_approved();

-- +1 XP su upvote piatto
create or replace function public.on_dish_vote() returns trigger as $$
begin
  perform public.bump_xp(new.user_id, 1);
  return new;
end $$ language plpgsql security definer;

create trigger dish_votes_xp
  after insert on public.dish_votes
  for each row execute procedure public.on_dish_vote();

-- ───────────────────────────────── RPC moderazione atomica
create or replace function public.moderate_lurido(
  p_id     uuid,
  p_action text,
  p_reason text default null
) returns void as $$
begin
  if not public.is_mod() then raise exception 'not authorized'; end if;
  if p_action = 'approve' then
    update public.luridi
       set status          = 'approved',
           approved_by     = auth.uid(),
           approved_at     = now(),
           rejection_reason = null
     where id = p_id;
  elsif p_action = 'reject' then
    update public.luridi
       set status           = 'rejected',
           rejection_reason = p_reason
     where id = p_id;
    insert into public.notifications (user_id, type, title, body, lurido_id)
    select added_by, 'rejected', 'Proposta non approvata', p_reason, id
      from public.luridi
     where id = p_id and added_by is not null;
  else
    raise exception 'invalid action: %', p_action;
  end if;
end $$ language plpgsql security definer;

-- ───────────────────────────────── RPC search testuale
create or replace function public.search_luridi(q text, limit_n int default 30)
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
    and (
      l.name         ilike '%' || q || '%' or
      l.neighborhood ilike '%' || q || '%' or
      l.address      ilike '%' || q || '%' or
      l.description  ilike '%' || q || '%'
    )
  limit limit_n;
$$ language sql stable;

-- ───────────────────────────────── Realtime publication
-- Esegui solo se la publication esiste già (abilitata da Supabase Dashboard).
-- alter publication supabase_realtime add table public.luridi;
-- alter publication supabase_realtime add table public.reviews;
-- alter publication supabase_realtime add table public.notifications;
-- alter publication supabase_realtime add table public.user_badges;
-- NB: abilita manualmente da Dashboard → Database → Replication.

-- ───────────────────────────────── Badge seed iniziale
insert into public.badges (id, name, description, emoji, sort_order, rule) values
  ('first_review',  'Prima Recensione',  'Hai scritto la tua prima recensione',         '✍️', 1, '{"type":"review_count","threshold":1}'),
  ('pioneer',       'Pioniere',          'Hai aggiunto il tuo primo lurido',             '🚩', 2, '{"type":"lurido_count","threshold":1}'),
  ('conoscitore',   'Conoscitore',       'Hai scritto 5 recensioni',                    '🧐', 3, '{"type":"review_count","threshold":5}'),
  ('nottambulo',    'Nottambulo',        'Sei uscito dopo la mezzanotte per un lurido',  '🌙', 4, '{"type":"special","code":"nottambulo"}'),
  ('gourmet',       'Gourmet',           'Hai aggiunto 3 piatti diversi',               '🍽️', 5, '{"type":"dish_count","threshold":3}'),
  ('esploratore',   'Esploratore',       'Hai visitato luridi in 3 quartieri diversi',  '🗺️', 6, '{"type":"special","code":"esploratore"}'),
  ('ambasciatore',  'Ambasciatore',      'Hai 10 upvote sui tuoi piatti',               '🏅', 7, '{"type":"dish_votes_received","threshold":10}'),
  ('re_del_lurido', 'Re del Lurido',     'Hai raggiunto il livello 5',                  '👑', 8, '{"type":"level","threshold":5}')
on conflict (id) do nothing;
