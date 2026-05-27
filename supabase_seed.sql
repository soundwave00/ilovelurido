-- ============================================================================
-- iLoveLurido · Seed data reale — luridi di Milano verificati.
-- Esegui DOPO `supabase_schema.sql`.
--
-- Coordinate WGS84: st_makepoint(LONGITUDINE, LATITUDINE)
-- Luridi approvati (status = 'approved') = visibili in mappa.
-- added_by = NULL (FK on delete set null — OK per dev).
-- ============================================================================

-- Pulizia idempotente (solo dev).
-- truncate public.dish_votes, public.dishes, public.reviews, public.photos,
--          public.saved_luridi, public.notifications, public.luridi restart identity cascade;

insert into public.luridi
  (name, slug, description, address, neighborhood, phone, location, hours, status, approved_at)
values

  -- ── 1. Chiosco Valeria e Brunella (Le Luride) ──────────────────────────
  (
    'Le Luride (Valeria e Brunella)',
    'le-luride-valeria-brunella',
    'Il lurido originale. Dagli anni ''80, Valeria e Brunella preparano il Completo: salamella, fontina, pomodoro, insalata, cipolla caramellata e peperonata. Aperto fino alle 6 il weekend. Diventa set di House of Cards Italia.',
    'Viale Argonne angolo Via Aselli',
    'Ortica / Città Studi',
    '+39 333 355 8672',
    st_makepoint(9.2291, 45.4711)::geography,
    '{"mon":["18:30","03:00"],"tue":["18:30","03:00"],"wed":["18:30","03:00"],"thu":["18:30","03:00"],"fri":["18:30","06:00"],"sat":["18:30","06:30"],"sun":["18:30","03:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 2. Isola Verde ─────────────────────────────────────────────────────
  (
    'Isola Verde',
    'isola-verde',
    'Chiosco aperto 24 ore su 24, 7 giorni su 7 dal 1994. Di Mimmo e Anna. Il McFalson è leggendario: focaccia, doppio hamburger, doppio cheddar, bacon e salsa della casa. Gazebo riscaldato in inverno, opzioni vegane.',
    'Piazza Melozzo da Forlì 3',
    'San Siro / Lotto',
    '+39 366 444 1942',
    st_makepoint(9.1312, 45.4682)::geography,
    '{"mon":["00:00","23:59"],"tue":["00:00","23:59"],"wed":["00:00","23:59"],"thu":["00:00","23:59"],"fri":["00:00","23:59"],"sat":["00:00","23:59"],"sun":["00:00","23:59"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 3. Bar Quadronno ───────────────────────────────────────────────────
  (
    'Bar Quadronno',
    'bar-quadronno',
    'Storico dal 1964, considerato il primo panino-bar notturno di Milano. Locale chiuso con sedute interne. Panini con ingredienti ricercati: selvaggina, pesce affumicato, formaggi raffinati. Il Bolognese e il Tip Tap sono i signature.',
    'Via Quadronno 34 angolo Corso di Porta Vigentina',
    'Crocetta / Porta Romana',
    '+39 02 5830 6612',
    st_makepoint(9.1938, 45.4539)::geography,
    '{"mon":["07:00","02:00"],"tue":["07:00","02:00"],"wed":["07:00","02:00"],"thu":["07:00","02:00"],"fri":["07:00","02:00"],"sat":["07:00","02:00"],"sun":["07:00","02:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 4. Forno di Barona ─────────────────────────────────────────────────
  (
    'Forno di Barona',
    'forno-di-barona',
    'Forno 24h su 24, 7 giorni su 7. Dalle 22 si attiva il servizio notturno con 20 tipi di pizza, focacce, panzerotti e 15 tipi di brioche. Punto di riferimento per chi finisce tardi nel quartiere Barona.',
    'Via Lago di Nemi 25',
    'Barona',
    '+39 02 8165 23',
    st_makepoint(9.1687, 45.4352)::geography,
    '{"mon":["00:00","23:59"],"tue":["00:00","23:59"],"wed":["00:00","23:59"],"thu":["00:00","23:59"],"fri":["00:00","23:59"],"sat":["00:00","23:59"],"sun":["00:00","23:59"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 5. Salamellaz ──────────────────────────────────────────────────────
  (
    'Salamellaz',
    'salamellaz',
    'Nato come food truck da Enzo e Ruggiero Lentini fuori dallo Stadio Meazza, ora ha sede fissa a Viale Bligny (aperta marzo 2026). La salamella smashed è diventata un fenomeno social con oltre 200k follower.',
    'Viale Bligny 18',
    'Bocconi / Navigli',
    null,
    st_makepoint(9.1867, 45.4524)::geography,
    '{"thu":["19:00","02:00"],"fri":["19:00","03:00"],"sat":["19:00","03:30"],"sun":["19:00","02:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 6. Panini Crocetta ─────────────────────────────────────────────────
  (
    'Panini Crocetta d''Autore 1982',
    'panini-crocetta',
    'Fondato nel 1982 accanto al Teatro Carcano, uno dei paninotecas storici di Milano. Panini d''autore con ingredienti curati. Disponibile anche su Just Eat. Chiude all''01:00.',
    'Via Giotto 31',
    'Pagano / Washington',
    '+39 02 8721 4304',
    st_makepoint(9.1674, 45.4648)::geography,
    '{"mon":["08:00","01:00"],"tue":["08:00","01:00"],"wed":["08:00","01:00"],"thu":["08:00","01:00"],"fri":["08:00","01:00"],"sat":["08:00","01:00"],"sun":["08:00","01:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 7. Chiosco Giò (Giovanni Panetta) ─────────────────────────────────
  (
    'Chiosco Giò (Giovanni Panetta)',
    'chiosco-gio-giovanni-panetta',
    'Kiosk all''aperto nell''area della Triennale/Parco Sempione. Riconosciuto da Joe Bastianich come miglior panino notturno di Milano (show Foodish). Frequentato da lavoratori della Triennale e nottambuli. Cocktail + bibite oltre ai panini.',
    'Viale Emilio Alemagna 6',
    'Sempione / Parco',
    '+39 327 096 3297',
    st_makepoint(9.1751, 45.4699)::geography,
    '{"mon":["10:00","02:00"],"tue":["10:00","02:00"],"wed":["10:00","02:00"],"thu":["10:00","02:00"],"fri":["10:00","02:30"],"sat":["10:00","02:30"],"sun":["10:00","02:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 8. Al Boschetto da Gabry ───────────────────────────────────────────
  (
    'Al Boschetto da Gabry',
    'al-boschetto-da-gabry',
    'Storico lurido zona Tribunale/Corso Vittoria, aperto dal 2000. Fino alle 06:00 ogni notte. Meta classica post-serata per chi viene dalla zona est.',
    'Corso di Porta Vittoria 23',
    'Porta Vittoria / Tribunale',
    null,
    st_makepoint(9.2009, 45.4625)::geography,
    '{"mon":["10:00","06:00"],"tue":["10:00","06:00"],"wed":["10:00","06:00"],"thu":["10:00","06:00"],"fri":["10:00","06:00"],"sat":["10:00","06:00"],"sun":["10:00","06:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 9. Al 19 ───────────────────────────────────────────────────────────
  (
    'Al 19',
    'al-19',
    'Cento panini in menu, 25 varianti di panino al cavallo. Zona Bocconi/Tabacchi, aperto fino alle 05:00. Meta post-Magnolia e Circolo Magnolia per chi vuole saltare la cena e finire la notte.',
    'Via Odoardo Tabacchi 24',
    'Bocconi / Tabacchi',
    null,
    st_makepoint(9.1894, 45.4523)::geography,
    '{"mon":["20:00","05:00"],"tue":["20:00","05:00"],"wed":["20:00","05:00"],"thu":["20:00","05:00"],"fri":["20:00","05:30"],"sat":["20:00","05:30"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 10. Chiosco Maradona ───────────────────────────────────────────────
  (
    'Chiosco Maradona',
    'chiosco-maradona',
    'Neon verdi, tema napoletano, zona Bocconi/Tabacchi. Adiacente ad Al 19, diversa clientela. Venerdì e sabato aperto fino alle 06:00. Panini con salamella e ingredienti classici napoletani.',
    'Via Odoardo Tabacchi 33',
    'Bocconi / Tabacchi',
    null,
    st_makepoint(9.1891, 45.4518)::geography,
    '{"mon":["19:30","03:00"],"tue":["19:30","03:00"],"wed":["19:30","03:00"],"thu":["19:30","03:00"],"fri":["19:30","06:00"],"sat":["19:30","06:00"],"sun":["19:30","03:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 11. Al Chiosco Pandy e Mucca ──────────────────────────────────────
  (
    'Al Chiosco Pandy e Mucca',
    'pandy-e-mucca',
    'Quarant''anni di attività, 48 panini in menu. Zona Piazzale Libia/Viale Lazio. Venerdì e sabato fino alle 05:30. Uno dei luridi storici di Milano, frequentato da generazioni di nottambuli.',
    'Piazzale Libia angolo Viale Lazio',
    'Porta Romana / Lodi',
    null,
    st_makepoint(9.2091, 45.4549)::geography,
    '{"mon":["19:00","03:00"],"tue":["19:00","03:00"],"wed":["19:00","03:00"],"thu":["19:00","03:00"],"fri":["19:00","05:30"],"sat":["19:00","05:30"],"sun":["19:00","03:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 12. Margy Burger ──────────────────────────────────────────────────
  (
    'Margy Burger',
    'margy-burger',
    'Prima hamburgeria di Milano, attiva da oltre 50 anni in Piazza Santo Stefano. Locale chiuso. Fino alle 02:00 ogni notte. Hamburger classici, prezzi onesti.',
    'Piazza Santo Stefano 2',
    'Porta Vittoria',
    null,
    st_makepoint(9.1969, 45.4629)::geography,
    '{"mon":["12:00","02:00"],"tue":["12:00","02:00"],"wed":["12:00","02:00"],"thu":["12:00","02:00"],"fri":["12:00","02:00"],"sat":["12:00","02:00"],"sun":["12:00","02:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 13. Le Capannelle ─────────────────────────────────────────────────
  (
    'Le Capannelle',
    'le-capannelle',
    'Non solo panini: pizza, carne e pesce fino all''alba in zona Washington/Pagano. Ristorante vero aperto fino alle 06:00 (chiuso lunedì). Uno dei pochi posti dove si mangia una cena completa all''alba.',
    'Viale Papiniano 23',
    'Washington / Pagano',
    null,
    st_makepoint(9.1680, 45.4569)::geography,
    '{"tue":["19:30","06:00"],"wed":["19:30","06:00"],"thu":["19:30","06:00"],"fri":["19:30","06:00"],"sat":["19:30","06:00"],"sun":["19:30","06:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 14. Calafuria ─────────────────────────────────────────────────────
  (
    'Calafuria',
    'calafuria',
    'Pizza al trancio notturna in zona Isola/NoLo. Aperto fino alle 03:00 nei giorni feriali, fino alle 05:00 il sabato. Ottima pizza al trancio a fette, prezzi popolari.',
    'Viale Marche 65',
    'Isola / NoLo',
    null,
    st_makepoint(9.1835, 45.4910)::geography,
    '{"mon":["17:00","03:00"],"tue":["17:00","03:00"],"wed":["17:00","03:00"],"thu":["17:00","03:00"],"fri":["17:00","03:00"],"sat":["17:00","05:00"],"sun":["17:00","03:00"]}'::jsonb,
    'approved',
    now()
  ),

  -- ── 15. Anche Forno ───────────────────────────────────────────────────
  (
    'Anche Forno',
    'anche-forno',
    'Forno/bakery notturno zona Isola. Aperto dalle 07:30 alle 03:30 ogni giorno, sabato fino alle 04:30. Pane fresco, pizza, cornetti. Frequentato da chi torna tardi e da chi inizia presto.',
    'Via Carmagnola 5b',
    'Isola',
    null,
    st_makepoint(9.1928, 45.4900)::geography,
    '{"mon":["07:30","03:30"],"tue":["07:30","03:30"],"wed":["07:30","03:30"],"thu":["07:30","03:30"],"fri":["07:30","03:30"],"sat":["07:30","04:30"],"sun":["07:30","03:30"]}'::jsonb,
    'approved',
    now()
  )
ON CONFLICT DO NOTHING;


-- ============================================================================
-- PIATTI (signature per ogni lurido)
-- ============================================================================

-- Helper: inserisce piatti solo se il lurido esiste e non ha ancora piatti
insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Il Completo'), ('Hamburger Luride'), ('Panino Salamella'), ('Wurstel con Tutto')
) as d(name)
where l.slug = 'le-luride-valeria-brunella'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('McFalson'), ('Doppio Cheddar Bacon'), ('Veggie Isola'), ('Hot Dog Della Casa')
) as d(name)
where l.slug = 'isola-verde'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Bolognese'), ('Tip Tap'), ('Salmone Affumicato'), ('Cacciagione d''Autunno')
) as d(name)
where l.slug = 'bar-quadronno'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Pizza Notturna'), ('Panzerotto Fritto'), ('Brioche Vuota'), ('Focaccia Rosmarino')
) as d(name)
where l.slug = 'forno-di-barona'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Salamella Smashed'), ('Doppia Salamella'), ('Salamella Piccante')
) as d(name)
where l.slug = 'salamellaz'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Panino Crocetta Classic'), ('Panino d''Autore'), ('Veggie Crocetta')
) as d(name)
where l.slug = 'panini-crocetta'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Panino del Parco'), ('Panino Triennale'), ('Cocktail della Casa')
) as d(name)
where l.slug = 'chiosco-gio-giovanni-panetta'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Panino da Gabry'), ('Salamella Notturna'), ('Doppio Hamburger')
) as d(name)
where l.slug = 'al-boschetto-da-gabry'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Panino al Cavallo'), ('Cavallo Piccante'), ('Hamburger Al 19'), ('Veggie Al 19')
) as d(name)
where l.slug = 'al-19'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Panino Napoli'), ('Salamella Maradona'), ('Fritto Napoletano')
) as d(name)
where l.slug = 'chiosco-maradona'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Panino Pandy'), ('Panino Mucca'), ('Cavallo Classico'), ('Salamella con Cipolla')
) as d(name)
where l.slug = 'pandy-e-mucca'
  and not exists (select 1 from public.dishes where lurido_id = l.id);

insert into public.dishes (lurido_id, name)
select l.id, d.name
from public.luridi l
cross join (values
  ('Margy Classic'), ('Double Margy'), ('Cheeseburger Storico')
) as d(name)
where l.slug = 'margy-burger'
  and not exists (select 1 from public.dishes where lurido_id = l.id);
