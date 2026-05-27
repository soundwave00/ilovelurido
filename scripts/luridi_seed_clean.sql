-- Generato da scripts/find-luridi.mjs + pulizia manuale
-- 9 nuovi luridi da aggiungere al seed (status=pending, moderali dall'app)
-- Prerequisito: alter table public.luridi add column if not exists google_place_id text unique;

insert into public.luridi
  (name, slug, description, address, neighborhood, phone, location, hours, status, google_place_id)
values
  (
    'Chiosco al Politico',
    'chiosco-al-politico',
    null,
    'Piazza Castello, 5, 20121 Milano MI',
    'Sempione',
    '327 766 5481',
    st_makepoint(9.180332, 45.4688188)::geography,
    '{"sun": ["10:30", "00:00"], "mon": ["10:30", "00:00"], "tue": ["10:30", "00:00"], "wed": ["10:30", "00:00"], "thu": ["10:30", "00:00"], "fri": ["10:30", "00:00"], "sat": ["10:30", "00:00"]}'::jsonb,
    'pending',
    'ChIJL_Nc9E3BhkcRJjH2ao-Mu4w'
  ),

  (
    'Il Chiosco ARCOBALENO',
    'il-chiosco-arcobaleno',
    null,
    'Piazza Andrea Fusina, 3, 20133 Milano MI',
    'Città Studi',
    null,
    st_makepoint(9.2299996, 45.4685813)::geography,
    '{"tue": ["19:00", "02:00"], "wed": ["19:00", "02:00"], "thu": ["19:00", "02:00"], "fri": ["19:00", "04:00"], "sat": ["19:00", "04:00"]}'::jsonb,
    'pending',
    'ChIJh6m6hYnGhkcRR_bST_f8rbA'
  ),

  (
    'La Boutique del panino e della birra',
    'la-boutique-del-panino-e-della-birra',
    null,
    'fronte civico n. 4 Chiosco bar, P.le di Porta Lodovica, 20136 Milano MI',
    'Bocconi',
    '371 454 4789',
    st_makepoint(9.1862906, 45.4519502)::geography,
    '{"sun": ["20:00", "05:00"], "mon": ["20:00", "05:00"], "tue": ["20:00", "05:00"], "wed": ["20:00", "05:00"], "thu": ["20:00", "05:00"], "fri": ["20:00", "05:00"], "sat": ["20:00", "05:00"]}'::jsonb,
    'pending',
    'ChIJC8_RJATEhkcRVv1UDUzViDw'
  ),

  (
    'Cesarino',
    'cesarino',
    null,
    'Via Pattari, 2, 20122 Milano MI',
    'Porta Vittoria',
    null,
    st_makepoint(9.1935168, 45.4644472)::geography,
    '{"sun": ["10:00", "23:00"], "mon": ["10:00", "23:00"], "tue": ["10:00", "23:00"], "wed": ["10:00", "23:00"], "thu": ["10:00", "23:00"], "fri": ["10:00", "23:00"], "sat": ["10:00", "23:00"]}'::jsonb,
    'pending',
    'ChIJUyHbFmzHhkcR1IWlJt9rW-Y'
  ),

  (
    'Chiosco Squadre Calcio',
    'chiosco-squadre-calcio',
    null,
    'Piazza Castello, 4, 20121 Milano MI',
    'Brera',
    '351 997 0393',
    st_makepoint(9.1815418, 45.4696357)::geography,
    '{"sun": ["12:00", "23:00"], "mon": ["12:00", "23:00"], "tue": ["12:00", "23:00"], "wed": ["12:00", "23:00"], "thu": ["12:00", "23:00"], "fri": ["12:00", "23:00"], "sat": ["12:00", "23:00"]}'::jsonb,
    'pending',
    'ChIJQ1CZo03BhkcR5Jyr1xS3VaY'
  ),

  (
    'Cesarino',
    'cesarino',
    null,
    'Corso Como, 12, 20124 Milano MI',
    'Isola',
    null,
    st_makepoint(9.1874778, 45.4820388)::geography,
    '{"sun": ["11:00", "00:00"], "mon": ["11:00", "00:00"], "tue": ["11:00", "00:00"], "wed": ["11:00", "00:00"], "thu": ["11:00", "00:00"], "fri": ["11:00", "00:00"], "sat": ["11:00", "00:00"]}'::jsonb,
    'pending',
    'ChIJhXzSYgDBhkcRHDLvOJjMJrw'
  ),

  (
    'Panino doc',
    'panino-doc',
    null,
    'Viale Lunigiana, 19, 20125 Milano MI',
    'Isola',
    '339 407 0702',
    st_makepoint(9.204333499999999, 45.4916663)::geography,
    '{"mon": ["12:15", "22:30"], "tue": ["12:15", "22:30"], "wed": ["12:20", "22:30"], "thu": ["12:15", "23:00"], "fri": ["12:20", "23:00"], "sat": ["18:15", "23:30"]}'::jsonb,
    'pending',
    'ChIJIfqpH4jHhkcR-i9pwrlqTHM'
  ),

  (
    'PANINI TOSTI MILANO',
    'panini-tosti-milano',
    null,
    'Via Matteo Maria Boiardo, 19, 20127 Milano MI',
    'Città Studi',
    '02 3669 4275',
    st_makepoint(9.222959, 45.49997)::geography,
    '{"mon": ["07:00", "23:00"], "tue": ["07:00", "23:00"], "wed": ["07:00", "23:00"], "thu": ["07:00", "23:00"], "fri": ["07:00", "23:00"], "sat": ["08:30", "23:00"]}'::jsonb,
    'pending',
    'ChIJd3LVchnHhkcR_iOYKoze7vE'
  ),

  (
    'Il Panino Perfetto',
    'il-panino-perfetto',
    null,
    'V.le Bligny, 1, 20136 Milano MI',
    'Bocconi',
    '348 545 8102',
    st_makepoint(9.187670599999999, 45.4517114)::geography,
    '{"sun": ["11:30", "16:00"], "mon": ["11:30", "23:00"], "tue": ["11:30", "23:00"], "wed": ["11:30", "23:00"], "thu": ["11:30", "23:00"], "fri": ["11:30", "23:00"], "sat": ["11:30", "23:00"]}'::jsonb,
    'pending',
    'ChIJtebRLgDFhkcReBEVADaLeEM'
  )
ON CONFLICT DO NOTHING;
