-- Generato da scripts/find-luridi.mjs il 2026-05-27
-- REVIEW MANUALE NECESSARIA: rimuovi posti non pertinenti (McDonald's, Subway, ecc.)
-- Poi incolla in supabase_seed.sql o esegui direttamente su Supabase SQL editor.
--
-- Schema aggiuntivo necessario (se non già presente):
-- alter table public.luridi add column if not exists google_place_id text unique;

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
    '{"sun":["10:30","00:00"],"mon":["10:30","00:00"],"tue":["10:30","00:00"],"wed":["10:30","00:00"],"thu":["10:30","00:00"],"fri":["10:30","00:00"],"sat":["10:30","00:00"]}'::jsonb,
    'pending',
    'ChIJL_Nc9E3BhkcRJjH2ao-Mu4w'
  ),

  (
    'Al Chiosco Pandy E Mucca',
    'al-chiosco-pandy-e-mucca',
    null,
    'angolo, Piazzale Libia, Viale Lazio, 20135 Milano MI',
    'Porta Vittoria',
    '02 9115 4015',
    st_makepoint(9.2090839, 45.4548651)::geography,
    '{"mon":["17:00","02:00"],"tue":["17:00","02:00"],"wed":["17:00","02:00"],"thu":["17:00","02:00"],"fri":["17:00","04:00"],"sat":["17:00","04:00"]}'::jsonb,
    'pending',
    'ChIJY2EezyDEhkcRka1DlZjhkmw'
  ),

  (
    'Il Chiosco ARCOBALENO',
    'il-chiosco-arcobaleno',
    null,
    'Piazza Andrea Fusina, 3, 20133 Milano MI',
    'Città Studi',
    null,
    st_makepoint(9.2299996, 45.4685813)::geography,
    '{"tue":["19:00","02:00"],"wed":["19:00","02:00"],"thu":["19:00","02:00"],"fri":["19:00","04:00"],"sat":["19:00","04:00"]}'::jsonb,
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
    '{"sun":["20:00","05:00"],"mon":["20:00","05:00"],"tue":["20:00","05:00"],"wed":["20:00","05:00"],"thu":["20:00","05:00"],"fri":["20:00","05:00"],"sat":["20:00","05:00"]}'::jsonb,
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
    '{"sun":["10:00","23:00"],"mon":["10:00","23:00"],"tue":["10:00","23:00"],"wed":["10:00","23:00"],"thu":["10:00","23:00"],"fri":["10:00","23:00"],"sat":["10:00","23:00"]}'::jsonb,
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
    '{"sun":["12:00","23:00"],"mon":["12:00","23:00"],"tue":["12:00","23:00"],"wed":["12:00","23:00"],"thu":["12:00","23:00"],"fri":["12:00","23:00"],"sat":["12:00","23:00"]}'::jsonb,
    'pending',
    'ChIJQ1CZo03BhkcR5Jyr1xS3VaY'
  ),

  (
    'Chiosco Bar Isola Verde',
    'chiosco-bar-isola-verde',
    null,
    'Piazza Melozzo da Forlì, 3, 20147 Milano MI',
    'San Siro',
    '02 4971 2359',
    st_makepoint(9.131253, 45.4682007)::geography,
    '{"sun":["00:00","23:59"]}'::jsonb,
    'pending',
    'ChIJVSxHGITBhkcRgsieP8ZKip0'
  ),

  (
    'Al Boschetto da Gabry',
    'al-boschetto-da-gabry',
    null,
    'C.so di Porta Vittoria, 20122 Milano MI',
    'Porta Vittoria',
    null,
    st_makepoint(9.2011819, 45.4624513)::geography,
    '{"mon":["11:00","06:00"],"tue":["11:00","06:00"],"wed":["11:00","06:00"],"thu":["11:00","06:00"],"fri":["11:00","06:00"],"sat":["11:00","06:00"]}'::jsonb,
    'pending',
    'ChIJi0SOZrvHhkcRoGLEN7Zhxeg'
  ),

  (
    'De Santis / Milano Magenta',
    'de-santis-milano-magenta',
    null,
    'Corso Magenta, 9, 20123 Milano MI',
    'Sempione',
    '02 7209 5124',
    st_makepoint(9.179684, 45.46557199999999)::geography,
    '{"sun":["11:00","23:00"],"mon":["11:00","23:00"],"tue":["11:00","23:00"],"wed":["11:00","23:00"],"thu":["11:00","23:00"],"fri":["11:00","23:00"],"sat":["11:00","23:00"]}'::jsonb,
    'pending',
    'ChIJR4sSylPBhkcRYdWEkhLxd18'
  ),

  (
    'Margy Burger Milano',
    'margy-burger-milano',
    null,
    'Piazza Santo Stefano, 2, 20122 Milano MI',
    'Porta Vittoria',
    '02 5830 3734',
    st_makepoint(9.1942363, 45.4623184)::geography,
    '{"sun":["18:00","02:00"],"mon":["18:00","02:00"],"tue":["18:00","02:00"],"wed":["18:00","02:00"],"thu":["18:00","02:00"],"fri":["18:00","02:00"],"sat":["18:00","02:00"]}'::jsonb,
    'pending',
    'ChIJM0osU6_GhkcR28eiK1k1sKc'
  ),

  (
    'Cesarino',
    'cesarino',
    null,
    'Corso Como, 12, 20124 Milano MI',
    'Isola',
    null,
    st_makepoint(9.1874778, 45.4820388)::geography,
    '{"sun":["11:00","00:00"],"mon":["11:00","00:00"],"tue":["11:00","00:00"],"wed":["11:00","00:00"],"thu":["11:00","00:00"],"fri":["11:00","00:00"],"sat":["11:00","00:00"]}'::jsonb,
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
    '{"mon":["12:15","22:30"],"tue":["12:15","22:30"],"wed":["12:20","22:30"],"thu":["12:15","23:00"],"fri":["12:20","23:00"],"sat":["18:15","23:30"]}'::jsonb,
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
    '{"mon":["07:00","23:00"],"tue":["07:00","23:00"],"wed":["07:00","23:00"],"thu":["07:00","23:00"],"fri":["07:00","23:00"],"sat":["08:30","23:00"]}'::jsonb,
    'pending',
    'ChIJd3LVchnHhkcR_iOYKoze7vE'
  ),

  (
    'De Santis / Milano Brera',
    'de-santis-milano-brera',
    null,
    'Via Mercato, 24, 20121 Milano MI',
    'Brera',
    '02 3595 6296',
    st_makepoint(9.1844485, 45.4713281)::geography,
    '{"sun":["07:30","22:00"],"mon":["07:30","22:00"],"tue":["07:30","22:00"],"wed":["07:30","22:00"],"thu":["07:30","22:00"],"fri":["07:30","00:00"],"sat":["07:30","00:00"]}'::jsonb,
    'pending',
    'ChIJpdwGJ3rBhkcRv44L0978xXE'
  ),

  (
    'Kampe Milano',
    'kampe-milano',
    null,
    'Galleria Unione, 1, 20123 Milano MI',
    'Bocconi',
    '02 3651 9482',
    st_makepoint(9.1877426, 45.4615527)::geography,
    '{"sun":["14:00","01:00"],"mon":["14:00","01:00"],"wed":["14:00","01:00"],"thu":["14:00","01:00"],"fri":["14:00","01:00"],"sat":["14:00","01:00"]}'::jsonb,
    'pending',
    'ChIJ390Dg5vHhkcR77VTiYaiZGY'
  ),

  (
    'Panino Giusto',
    'panino-giusto',
    null,
    'Via Borgogna, 5, 20122 Milano MI',
    'Porta Vittoria',
    '02 2506 1005',
    st_makepoint(9.1987852, 45.4659395)::geography,
    '{"sun":["10:00","23:00"],"mon":["10:00","23:00"],"tue":["10:00","23:00"],"wed":["10:00","23:00"],"thu":["10:00","23:00"],"fri":["10:00","23:00"],"sat":["10:00","23:00"]}'::jsonb,
    'pending',
    'ChIJ-SDKfA_HhkcRbfpmOiig5gs'
  ),

  (
    'Crocetta Panini d''Autore 1982',
    'crocetta-panini-d-autore-1982',
    null,
    'Corso di Porta Romana, 67, 20122 Milano MI',
    'Porta Romana',
    '02 545 0228',
    st_makepoint(9.1953893, 45.4564725)::geography,
    '{"sun":["10:00","21:30"],"mon":["10:00","00:00"],"tue":["10:00","00:00"],"wed":["10:00","00:00"],"thu":["10:00","00:00"],"fri":["10:00","00:00"],"sat":["10:00","00:00"]}'::jsonb,
    'pending',
    'ChIJORVmcx3EhkcRYom5MYntrWQ'
  ),

  (
    'Panino Giusto',
    'panino-giusto',
    null,
    'Corso di Porta Ticinese,1 Ang. Largo Carrobbio Colonne di San Lorenzo, Corso di Porta Ticinese, 1, 20123 Milano MI',
    'Navigli',
    '02 2506 0672',
    st_makepoint(9.1813931, 45.4598145)::geography,
    '{"sun":["11:00","00:00"],"mon":["10:00","23:00"],"tue":["10:00","23:00"],"wed":["10:00","23:00"],"thu":["10:00","23:00"],"fri":["10:00","23:00"],"sat":["10:00","23:00"]}'::jsonb,
    'pending',
    'ChIJM0_JPlXBhkcRi44VdWsDw4Q'
  ),

  (
    'De Santis / Milano Rinascente Duomo',
    'de-santis-milano-rinascente-duomo',
    null,
    'Food Hall, Via Santa Radegonda, 10/7° piano, 20144 Milano MI',
    'Brera',
    '02 885 2457',
    st_makepoint(9.1920968, 45.4650275)::geography,
    '{"sun":["09:00","00:00"],"mon":["09:00","00:00"],"tue":["09:00","00:00"],"wed":["09:00","00:00"],"thu":["09:00","00:00"],"fri":["09:00","00:00"],"sat":["09:00","00:00"]}'::jsonb,
    'pending',
    'ChIJ49FuRq7GhkcRMFWnNns0M_k'
  ),

  (
    'Tramé - Brera',
    'trame-brera',
    null,
    'Piazza S. Simpliciano, 6, 20121 Milano MI',
    'Brera',
    '02 8410 5336',
    st_makepoint(9.1837304, 45.4737959)::geography,
    '{"sun":["10:30","23:00"],"mon":["10:30","22:00"],"tue":["10:30","22:00"],"wed":["10:30","00:00"],"thu":["10:30","00:00"],"fri":["10:30","01:00"],"sat":["10:30","01:00"]}'::jsonb,
    'pending',
    'ChIJuUkuckvBhkcRgQN_4bkxwZ4'
  ),

  (
    'Il Panino Perfetto',
    'il-panino-perfetto',
    null,
    'V.le Bligny, 1, 20136 Milano MI',
    'Bocconi',
    '348 545 8102',
    st_makepoint(9.187670599999999, 45.4517114)::geography,
    '{"sun":["11:30","16:00"],"mon":["11:30","23:00"],"tue":["11:30","23:00"],"wed":["11:30","23:00"],"thu":["11:30","23:00"],"fri":["11:30","23:00"],"sat":["11:30","23:00"]}'::jsonb,
    'pending',
    'ChIJtebRLgDFhkcReBEVADaLeEM'
  );
