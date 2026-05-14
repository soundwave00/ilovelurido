-- ============================================================================
-- iLoveLurido · Seed data per sviluppo.
-- Esegui DOPO `supabase_schema.sql`. I luridi usano coord WGS84 reali di Milano.
--
-- Attenzione: lo schema collega `added_by`/`approved_by` a `public.profiles`,
-- che a sua volta ha foreign key su `auth.users`. In dev puoi:
--   (a) creare prima qualche utente via Supabase Auth (signup) e poi adattare
--       gli `added_by` qui sotto agli UUID reali, oppure
--   (b) eseguire solo l'INSERT dei luridi con `added_by = NULL` (consentito:
--       la FK ha `on delete set null`).
--
-- Questo seed usa la variante (b) — luridi senza autore, solo dati di prova.
-- ============================================================================

-- Pulizia (idempotenza dev). Non eseguire in produzione.
-- truncate public.dish_votes, public.dishes, public.reviews, public.photos,
--          public.saved_luridi, public.notifications, public.luridi restart identity cascade;

insert into public.luridi
  (name, slug, description, address, neighborhood, phone, location, hours, status)
values
  (
    'Da Peppino il Lurido',
    'da-peppino-il-lurido',
    'Il baracchino più vecchio dei Navigli. Peppino fa panini dal 1987. La salsa rosa è leggendaria, il panino Lurido Speciale è un''istituzione.',
    'Ripa di Porta Ticinese 28',
    'Navigli',
    '+39 02 555 1234',
    st_makepoint(9.1770, 45.4503)::geography,
    '{"mon":["22:00","04:30"],"tue":["22:00","04:30"],"wed":["22:00","04:30"],"thu":["22:00","04:30"],"fri":["22:00","05:00"],"sat":["22:00","05:00"],"sun":["22:00","04:30"]}'::jsonb,
    'approved'
  ),
  (
    'Baracchino del Tonio',
    'baracchino-del-tonio',
    'Dietro la stazione. Tonio è pugliese doc, fa il panino con la cima di rapa che manco a Bari.',
    'Piazza Minniti',
    'Isola',
    null,
    st_makepoint(9.1895, 45.4860)::geography,
    '{"mon":["23:00","05:00"],"tue":["23:00","05:00"],"wed":["23:00","05:00"],"thu":["23:00","05:00"],"fri":["23:00","05:30"],"sat":["23:00","05:30"],"sun":["23:00","05:00"]}'::jsonb,
    'approved'
  ),
  (
    'Il Furgone Fluorescente',
    'il-furgone-fluorescente',
    'Un furgone giallo fosforescente che appare dopo mezzanotte. Fuma tanto, parla poco, panini enormi.',
    'Viale Beatrice d''Este',
    'Porta Romana',
    null,
    st_makepoint(9.1970, 45.4487)::geography,
    '{"mon":["22:30","03:00"],"tue":["22:30","03:00"],"wed":["22:30","03:00"],"thu":["22:30","03:00"],"fri":["22:30","03:30"],"sat":["22:30","03:30"],"sun":["22:30","03:00"]}'::jsonb,
    'approved'
  ),
  (
    'Chiosco del Nonno',
    'chiosco-del-nonno',
    'Il nonno ci sta dal 1972. Apre presto, chiude ad orari umani. Il figlio vuole chiudere, il nonno resiste.',
    'Via Lecco / Corso Buenos Aires',
    'Porta Venezia',
    '+39 02 555 0099',
    st_makepoint(9.2070, 45.4770)::geography,
    '{"mon":["19:00","02:00"],"tue":["19:00","02:00"],"wed":["19:00","02:00"],"thu":["19:00","02:00"],"fri":["19:00","02:30"],"sat":["19:00","02:30"],"sun":["19:00","02:00"]}'::jsonb,
    'approved'
  ),
  (
    'Lurido dei Poeti',
    'lurido-dei-poeti',
    'Baracchino "di design". I panini costano il doppio ma è sempre pieno.',
    'Via Fiori Chiari',
    'Brera',
    null,
    st_makepoint(9.1871, 45.4720)::geography,
    '{"mon":["21:00","03:30"],"tue":["21:00","03:30"],"wed":["21:00","03:30"],"thu":["21:00","03:30"],"fri":["21:00","04:00"],"sat":["21:00","04:00"],"sun":["21:00","03:30"]}'::jsonb,
    'approved'
  ),
  (
    'Da Caterina',
    'da-caterina',
    'Segnalato da un utente ieri sera. Da verificare orari e posizione esatta.',
    'Via Candiani',
    'Bovisa',
    null,
    st_makepoint(9.1650, 45.5050)::geography,
    '{"mon":["22:00","04:00"],"tue":["22:00","04:00"],"wed":["22:00","04:00"],"thu":["22:00","04:00"],"fri":["22:00","04:30"],"sat":["22:00","04:30"],"sun":["22:00","04:00"]}'::jsonb,
    'pending'
  );

-- Piatti (uno per lurido approved, giusto per popolare)
insert into public.dishes (lurido_id, name)
select id, unnest(array['Lurido Speciale','Panino del Navigante','Wurstel Alto Milanese'])
from public.luridi where slug = 'da-peppino-il-lurido';

insert into public.dishes (lurido_id, name)
select id, unnest(array['Cima di Rapa & Salsiccia','Lurido Diavolo'])
from public.luridi where slug = 'baracchino-del-tonio';

insert into public.dishes (lurido_id, name)
select id, 'Megalurido' from public.luridi where slug = 'il-furgone-fluorescente';

insert into public.dishes (lurido_id, name)
select id, unnest(array['Veggie Milanese','Toast del Nonno'])
from public.luridi where slug = 'chiosco-del-nonno';

insert into public.dishes (lurido_id, name)
select id, 'Panino del Poeta' from public.luridi where slug = 'lurido-dei-poeti';
