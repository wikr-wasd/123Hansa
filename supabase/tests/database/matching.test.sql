-- Matchningen ska hitta rätt annonser, och lika viktigt: INTE hitta fel.
--
-- Det farliga med ett filter är inte att det missar en träff — det syns. Det
-- farliga är att det släpper igenom något det inte borde: en demoannons som
-- inte går att kontakta, en annons i fel valuta som ser billig ut, eller
-- köparens egen annons. Därför provar testet båda riktningarna.

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('44444444-4444-4444-8444-000000000001', 'kopare@matchning.test', '{"full_name": "Kajsa Köpare"}'),
  ('44444444-4444-4444-8444-000000000002', 'saljare@matchning.test', '{"full_name": "Sixten Säljare"}');

insert into public.organizations (id, name, country, org_number, created_by) values
  ('55555555-5555-4555-8555-000000000001', 'Säljarbolaget AB', 'SE', '5591111119',
   '44444444-4444-4444-8444-000000000002'),
  -- Köparen är själv med i en organisation. Dess annonser ska aldrig matcha.
  ('55555555-5555-4555-8555-000000000002', 'Köparens eget bolag AB', 'SE', '5592222226',
   '44444444-4444-4444-8444-000000000001');

-- Annonserna -----------------------------------------------------------------
insert into public.listings
  (id, organization_id, created_by, status, is_demo, country, currency, title, industry,
   asking_price_minor, published_at)
values
  -- Ska matcha: svensk IT-annons i prisspannet.
  ('66666666-6666-4666-8666-000000000001', '55555555-5555-4555-8555-000000000001',
   '44444444-4444-4444-8444-000000000002', 'published', false, 'SE', 'SEK',
   'Svenskt IT-bolag', 'software', 300000000, now()),
  -- Fel bransch.
  ('66666666-6666-4666-8666-000000000002', '55555555-5555-4555-8555-000000000001',
   '44444444-4444-4444-8444-000000000002', 'published', false, 'SE', 'SEK',
   'Bageri', 'food', 300000000, now()),
  -- Fel land.
  ('66666666-6666-4666-8666-000000000003', '55555555-5555-4555-8555-000000000001',
   '44444444-4444-4444-8444-000000000002', 'published', false, 'NO', 'NOK',
   'Norskt IT-bolag', 'software', 300000000, now()),
  -- För dyr.
  ('66666666-6666-4666-8666-000000000004', '55555555-5555-4555-8555-000000000001',
   '44444444-4444-4444-8444-000000000002', 'published', false, 'SE', 'SEK',
   'Dyrt IT-bolag', 'software', 900000000, now()),
  -- Pris på begäran: ska matcha trots prisfilter.
  ('66666666-6666-4666-8666-000000000005', '55555555-5555-4555-8555-000000000001',
   '44444444-4444-4444-8444-000000000002', 'published', false, 'SE', 'SEK',
   'IT-bolag utan pris', 'software', null, now()),
  -- Demoannons: går inte att kontakta, ska inte matcha.
  ('66666666-6666-4666-8666-000000000006', '55555555-5555-4555-8555-000000000001',
   '44444444-4444-4444-8444-000000000002', 'published', true, 'SE', 'SEK',
   'Exempelannons', 'software', 300000000, now()),
  -- Under granskning: ska inte nå någon.
  ('66666666-6666-4666-8666-000000000007', '55555555-5555-4555-8555-000000000001',
   '44444444-4444-4444-8444-000000000002', 'pending_review', false, 'SE', 'SEK',
   'Ogranskad', 'software', 300000000, null),
  -- Köparens EGEN organisation.
  ('66666666-6666-4666-8666-000000000008', '55555555-5555-4555-8555-000000000002',
   '44444444-4444-4444-8444-000000000001', 'published', false, 'SE', 'SEK',
   'Köparens eget IT-bolag', 'software', 300000000, now());

-- Bevakningen ----------------------------------------------------------------
-- Svenska IT-bolag för högst 5 000 000,00 SEK.
insert into public.saved_searches
  (id, user_id, name, countries, industries, price_currency, max_price_minor)
values ('77777777-7777-4777-8777-000000000001', '44444444-4444-4444-8444-000000000001',
        'Svenska IT-bolag', '{SE}', '{software}', 'SEK', 500000000);

-- Triggern fyllde på mot befintliga annonser vid insert.
select is((select count(*)::int from public.search_matches
           where saved_search_id = '77777777-7777-4777-8777-000000000001'), 2,
  'en ny bevakning fylls på med de annonser som redan finns');

select ok((select bool_and(listing_id in (
             '66666666-6666-4666-8666-000000000001',
             '66666666-6666-4666-8666-000000000005'))
           from public.search_matches
           where saved_search_id = '77777777-7777-4777-8777-000000000001'),
  'bara rätt bransch, rätt land och rätt prisspann matchar — pris på begäran räknas in');

-- Var och en av uteslutningarna, så att ett fel går att peka ut -------------
select is((select count(*)::int from public.search_matches
           where listing_id = '66666666-6666-4666-8666-000000000002'), 0,
  'fel bransch matchar inte');
select is((select count(*)::int from public.search_matches
           where listing_id = '66666666-6666-4666-8666-000000000003'), 0,
  'fel land matchar inte');
select is((select count(*)::int from public.search_matches
           where listing_id = '66666666-6666-4666-8666-000000000004'), 0,
  'en annons över prisspannet matchar inte');
select is((select count(*)::int from public.search_matches
           where listing_id = '66666666-6666-4666-8666-000000000006'), 0,
  'en demoannons matchar inte, eftersom den inte går att kontakta');
select is((select count(*)::int from public.search_matches
           where listing_id = '66666666-6666-4666-8666-000000000007'), 0,
  'en annons under granskning når ingen');
select is((select count(*)::int from public.search_matches
           where listing_id = '66666666-6666-4666-8666-000000000008'), 0,
  'köparen matchas inte mot sin egen organisations annons');

-- Publicering utlöser matchning ----------------------------------------------
update public.listings set status = 'published', published_at = now()
where id = '66666666-6666-4666-8666-000000000007';

select is((select count(*)::int from public.search_matches
           where listing_id = '66666666-6666-4666-8666-000000000007'), 1,
  'annonsen matchar när den publiceras');

-- En uppdatering av en redan publicerad annons ska inte ge en ny matchning.
update public.listings set title = 'Ogranskad, nu med bättre rubrik'
where id = '66666666-6666-4666-8666-000000000007';

select is((select count(*)::int from public.search_matches
           where listing_id = '66666666-6666-4666-8666-000000000007'), 1,
  'en redan publicerad annons matchas inte om igen');

-- Ändrade kriterier ----------------------------------------------------------
update public.saved_searches set industries = '{food}'
where id = '77777777-7777-4777-8777-000000000001';

select is((select count(*)::int from public.search_matches
           where saved_search_id = '77777777-7777-4777-8777-000000000001'), 1,
  'ändrade kriterier räknar om matchningarna från grunden');

select is((select listing_id from public.search_matches
           where saved_search_id = '77777777-7777-4777-8777-000000000001'),
  '66666666-6666-4666-8666-000000000002',
  'efter ändringen matchar bageriet, inte IT-bolagen');

-- En ändring som inte rör kriterierna ska lämna matchningarna ifred.
update public.search_matches set seen_at = now()
where saved_search_id = '77777777-7777-4777-8777-000000000001';
update public.saved_searches set name = 'Nytt namn'
where id = '77777777-7777-4777-8777-000000000001';

select is((select count(*)::int from public.search_matches
           where saved_search_id = '77777777-7777-4777-8777-000000000001'
             and seen_at is not null), 1,
  'ett namnbyte nollställer inte det köparen redan läst');

-- Bevakning utan kriterier ---------------------------------------------------
insert into public.saved_searches (id, user_id, name)
values ('77777777-7777-4777-8777-000000000002', '44444444-4444-4444-8444-000000000001', 'Allt');

-- Sex stycken: 001–005 plus 007, som publicerades längre upp i testet. Utanför
-- står demoannonsen (006) och köparens egen (008).
select is((select count(*)::int from public.search_matches
           where saved_search_id = '77777777-7777-4777-8777-000000000002'), 6,
  'en bevakning utan kriterier matchar alla publicerade annonser utom demo och egna');

-- Valutagränsen --------------------------------------------------------------
-- Ett prisfilter i SEK får aldrig jämföras med en norsk annons.
insert into public.saved_searches
  (id, user_id, name, industries, price_currency, max_price_minor)
values ('77777777-7777-4777-8777-000000000003', '44444444-4444-4444-8444-000000000001',
        'IT under 5 MSEK, oavsett land', '{software}', 'SEK', 500000000);

select is((select count(*)::int from public.search_matches
           where saved_search_id = '77777777-7777-4777-8777-000000000003'
             and listing_id = '66666666-6666-4666-8666-000000000003'), 0,
  'ett prisfilter i SEK matchar inte en norsk annons — belopp i olika valutor jämförs aldrig');

-- Bevakning med notify = false -----------------------------------------------
insert into public.saved_searches (id, user_id, name, notify)
values ('77777777-7777-4777-8777-000000000004', '44444444-4444-4444-8444-000000000001',
        'Tyst bevakning', false);

-- Tyst bevakning fylls ändå på: köparen ska kunna öppna den och se sina träffar.
-- Det är UTSKICKET som är avstängt, inte matchningen.
select isnt((select count(*)::int from public.search_matches
             where saved_search_id = '77777777-7777-4777-8777-000000000004'), 0,
  'en tyst bevakning har ändå träffar att öppna');

insert into public.listings
  (id, organization_id, created_by, status, country, currency, title, industry, published_at)
values ('66666666-6666-4666-8666-000000000009', '55555555-5555-4555-8555-000000000001',
        '44444444-4444-4444-8444-000000000002', 'draft', 'SE', 'SEK',
        'Ny annons', 'software', null);
update public.listings set status = 'published', published_at = now()
where id = '66666666-6666-4666-8666-000000000009';

select is((select count(*)::int from public.search_matches
           where saved_search_id = '77777777-7777-4777-8777-000000000004'
             and listing_id = '66666666-6666-4666-8666-000000000009'), 0,
  'en tyst bevakning får inga NYA matchningar vid publicering');

-- Behörighet -----------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "44444444-4444-4444-8444-000000000002", "role": "authenticated"}';
select is((select count(*)::int from public.search_matches), 0,
  'säljaren ser inte köparens matchningar');

set local request.jwt.claims to '{"sub": "44444444-4444-4444-8444-000000000001", "role": "authenticated"}';
select isnt((select count(*)::int from public.search_matches), 0,
  'köparen ser sina egna matchningar');

select lives_ok($$
  select public.refresh_saved_search('77777777-7777-4777-8777-000000000001') $$,
  'ägaren får uppdatera sin egen bevakning');

set local request.jwt.claims to '{"sub": "44444444-4444-4444-8444-000000000002", "role": "authenticated"}';
select throws_ok($$
  select public.refresh_saved_search('77777777-7777-4777-8777-000000000001') $$,
  '42501', null, 'någon annan får inte uppdatera bevakningen');
reset role;

select * from finish();
rollback;
