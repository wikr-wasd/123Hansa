-- Behörighetstester för marknadsplatsen (supabase/migrations/*_marketplace_v1.sql).
--
-- Varje regel provas från den roll som INTE ska få göra något, inte bara från
-- den som ska. Ett test som bara visar att säljaren kan publicera bevisar
-- ingenting om att köparen inte kan.
--
-- Körs med: npx supabase test db

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- Roller -------------------------------------------------------------------
-- S säljare, B köpare, X utomstående, A administratör
insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000001', 'saljare@test.se', '{"full_name": "Sara Säljare"}'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000002', 'kopare@test.no', '{}'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000003', 'utomstaende@test.dk', '{}'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000004', 'admin@test.se', '{}');
insert into public.platform_admins (user_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-000000000004');

select is(
  (select count(*)::int from public.profiles where id in ('aaaaaaaa-aaaa-4aaa-8aaa-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000003', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000004')),
  4, 'profiler skapas automatiskt för nya användare');
select is(
  (select full_name from public.profiles where id = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000001'),
  'Sara Säljare', 'profilen får namnet från registreringen');

-- Anonym besökare ----------------------------------------------------------
set local role anon;
select is((select count(*)::int from public.markets where launched), 3,
  'anon ser tre lanserade marknader');
select is((select string_agg(country, ',' order by country) from public.markets where launched), 'DK,NO,SE',
  'lanseringsmarknaderna är Danmark, Norge och Sverige');
select throws_ok($$ select * from public.organizations $$, '42501', null,
  'anon kan inte läsa organisationer');
select throws_ok($$ select * from public.platform_admins $$, '42501', null,
  'anon kan inte läsa administratörslistan');
reset role;

-- Organisation ------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000001", "role": "authenticated"}';
select lives_ok($$
  insert into public.organizations (id, name, country, org_number)
  values ('bbbbbbbb-bbbb-4bbb-8bbb-000000000001', 'Testbolaget AB', 'SE', '5569876543') $$,
  'säljaren skapar en organisation');
select is((select role::text from public.organization_members where organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001' and user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000001'),
  'owner', 'skaparen blir ägare');
select throws_ok($$ update public.organizations set verified_at = now() where id = 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001' $$,
  'P0001', null, 'säljaren kan inte verifiera sin egen organisation');
select throws_ok($$ select * from public.platform_admins $$, '42501', null,
  'inloggad användare kan inte läsa administratörslistan');

-- Annons -------------------------------------------------------------------
select lives_ok($$
  insert into public.listings (id, organization_id, country, currency, title, industry, asking_price_minor)
  values ('cccccccc-cccc-4ccc-8ccc-000000000001', 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001', 'SE', 'SEK', 'Konsultbolag i Göteborg', 'Konsult', 250000000) $$,
  'säljaren skapar ett utkast');
select throws_ok($$
  insert into public.listings (organization_id, country, currency, title, industry)
  values ('bbbbbbbb-bbbb-4bbb-8bbb-000000000001', 'SE', 'NOK', 'Fel valuta', 'Konsult') $$,
  '23503', null, 'valutan måste följa landet');
select throws_ok($$
  insert into public.listings (organization_id, country, currency, title, industry)
  values ('bbbbbbbb-bbbb-4bbb-8bbb-000000000001', 'HR', 'EUR', 'Bolag i Zagreb', 'Konsult') $$,
  'P0001', null, 'land som inte är lanserat nekas');
select throws_ok($$
  insert into public.listings (organization_id, country, currency, title, industry, is_demo)
  values ('bbbbbbbb-bbbb-4bbb-8bbb-000000000001', 'SE', 'SEK', 'Falsk demo', 'Konsult', true) $$,
  'P0001', null, 'säljaren kan inte skapa en demoannons');
select throws_ok($$
  insert into public.listings (organization_id, country, currency, title, industry, status)
  values ('bbbbbbbb-bbbb-4bbb-8bbb-000000000001', 'SE', 'SEK', 'Direktpublicerad', 'Konsult', 'published') $$,
  'P0001', null, 'säljaren kan inte skapa en publicerad annons');
select throws_ok($$ update public.listings set status = 'published' where id = 'cccccccc-cccc-4ccc-8ccc-000000000001' $$,
  'P0001', null, 'säljaren kan inte publicera själv');
select lives_ok($$ update public.listings set status = 'pending_review' where id = 'cccccccc-cccc-4ccc-8ccc-000000000001' $$,
  'säljaren skickar annonsen till granskning även innan organisationen är verifierad');

-- Verifieringen görs av en administratör, och krävs först vid publicering.
set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000004", "role": "authenticated"}';
select throws_ok($$ select public.review_listing('cccccccc-cccc-4ccc-8ccc-000000000001', true) $$,
  'P0001', null, 'en annons kan inte publiceras från en overifierad organisation');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000002", "role": "authenticated"}';
select throws_ok($$ select public.verify_organization('bbbbbbbb-bbbb-4bbb-8bbb-000000000001') $$,
  '42501', null, 'en vanlig användare kan inte verifiera en organisation');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000004", "role": "authenticated"}';
select isnt(public.verify_organization('bbbbbbbb-bbbb-4bbb-8bbb-000000000001'), null,
  'administratören verifierar organisationen');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000001", "role": "authenticated"}';
select throws_ok($$ update public.organizations set org_number = '5561112222' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001' $$,
  'P0001', null, 'organisationsnumret kan inte bytas efter verifiering');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000002", "role": "authenticated"}';
select is((select count(*)::int from public.listings where id = 'cccccccc-cccc-4ccc-8ccc-000000000001'), 0,
  'köparen ser inte en annons under granskning');
select throws_ok($$ select public.review_listing('cccccccc-cccc-4ccc-8ccc-000000000001', true) $$, '42501', null,
  'köparen kan inte granska annonser');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000004", "role": "authenticated"}';
select is(public.review_listing('cccccccc-cccc-4ccc-8ccc-000000000001', true)::text, 'published', 'administratören publicerar');
reset role;

set local role anon;
select is((select count(*)::int from public.listings where id = 'cccccccc-cccc-4ccc-8ccc-000000000001'), 1,
  'anon ser den publicerade annonsen');
select is((select published_at is not null from public.listings where id = 'cccccccc-cccc-4ccc-8ccc-000000000001'), true,
  'publiceringstiden sätts vid publicering');
reset role;

set local role authenticated;
set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000003", "role": "authenticated"}';
update public.listings set title = 'Kapad annons' where id = 'cccccccc-cccc-4ccc-8ccc-000000000001';
reset role;
select is((select title from public.listings where id = 'cccccccc-cccc-4ccc-8ccc-000000000001'), 'Konsultbolag i Göteborg',
  'en utomstående kan inte ändra annonsen');

-- Demoannons, skapad av plattformen
insert into public.listings (id, organization_id, created_by, status, is_demo, country, currency, title, industry)
values ('cccccccc-cccc-4ccc-8ccc-000000000002', 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000001', 'published', true, 'SE', 'SEK', 'Exempelannons', 'Handel');

-- Intresse och meddelanden -------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000002", "role": "authenticated"}';
select lives_ok($$
  insert into public.listing_interests (id, listing_id, message)
  values ('dddddddd-dddd-4ddd-8ddd-000000000001', 'cccccccc-cccc-4ccc-8ccc-000000000001', 'Vi är intresserade av bolaget') $$,
  'köparen visar intresse');
select throws_ok($$
  insert into public.listing_interests (listing_id, message) values ('cccccccc-cccc-4ccc-8ccc-000000000002', 'Hej') $$,
  '42501', null, 'en demoannons går inte att kontakta');
select throws_ok($$ update public.listing_interests set status = 'accepted' where id = 'dddddddd-dddd-4ddd-8ddd-000000000001' $$,
  'P0001', null, 'köparen kan inte acceptera sitt eget intresse');
select throws_ok($$ insert into public.messages (interest_id, body) values ('dddddddd-dddd-4ddd-8ddd-000000000001', 'Hej igen') $$,
  '42501', null, 'inga meddelanden innan säljaren accepterat');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000001", "role": "authenticated"}';
select throws_ok($$
  insert into public.listing_interests (listing_id, message) values ('cccccccc-cccc-4ccc-8ccc-000000000001', 'Mitt eget') $$,
  '42501', null, 'säljaren kan inte visa intresse för sin egen annons');
select lives_ok($$ update public.listing_interests set status = 'accepted' where id = 'dddddddd-dddd-4ddd-8ddd-000000000001' $$,
  'säljaren accepterar intresset');
select throws_ok($$ update public.listing_interests set status = 'declined' where id = 'dddddddd-dddd-4ddd-8ddd-000000000001' $$,
  'P0001', null, 'ett accepterat intresse kan inte avböjas i efterhand');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000002", "role": "authenticated"}';
select lives_ok($$ insert into public.messages (interest_id, body) values ('dddddddd-dddd-4ddd-8ddd-000000000001', 'Tack!') $$,
  'köparen skriver efter acceptans');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000003", "role": "authenticated"}';
select is((select count(*)::int from public.messages), 0, 'en utomstående ser inga meddelanden');
select is((select count(*)::int from public.listing_interests), 0,
  'en utomstående ser inga intresseanmälningar');
select is((select count(*)::int from public.organizations), 0, 'en utomstående ser inga organisationer');

-- Sekretessavtal och datarum ---------------------------------------------
set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000001", "role": "authenticated"}';
select lives_ok($$
  insert into public.listing_ndas (id, listing_id, body) values ('eeeeeeee-eeee-4eee-8eee-000000000001', 'cccccccc-cccc-4ccc-8ccc-000000000001', 'Sekretessavtal version 1') $$,
  'säljaren lägger in sitt sekretessavtal');
select lives_ok($$
  insert into public.dataroom_documents (id, listing_id, name, storage_path)
  values ('ffffffff-ffff-4fff-8fff-000000000001', 'cccccccc-cccc-4ccc-8ccc-000000000001', 'Årsredovisning 2025.pdf', 'cccccccc-cccc-4ccc-8ccc-000000000001/arsredovisning-2025.pdf') $$,
  'säljaren lägger till ett dokument i datarummet');
select throws_ok($$
  insert into public.dataroom_documents (listing_id, name, storage_path)
  values ('cccccccc-cccc-4ccc-8ccc-000000000001', 'Fel mapp.pdf', 'annan-annons/fel.pdf') $$,
  '23514', null, 'dokumentet måste ligga under annonsens egen mapp');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000002", "role": "authenticated"}';
select is((select count(*)::int from public.dataroom_documents), 0,
  'köparen ser inga dokument före sekretessavtalet');
select throws_ok($$ select public.record_document_access('ffffffff-ffff-4fff-8fff-000000000001') $$, '42501', null,
  'köparen kan inte öppna ett dokument före sekretessavtalet');
select lives_ok($$ insert into public.nda_acceptances (nda_id) values ('eeeeeeee-eeee-4eee-8eee-000000000001') $$,
  'köparen accepterar sekretessavtalet');
select is((select count(*)::int from public.dataroom_documents), 1,
  'köparen ser dokumentet efter sekretessavtalet');
select is(public.record_document_access('ffffffff-ffff-4fff-8fff-000000000001'), 'cccccccc-cccc-4ccc-8ccc-000000000001/arsredovisning-2025.pdf',
  'öppnat dokument ger sökvägen till filen');
select is((select count(*)::int from public.document_access_log), 0,
  'köparen kan inte läsa åtkomstloggen');
select throws_ok($$ insert into public.document_access_log (document_id, user_id) values ('ffffffff-ffff-4fff-8fff-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000002') $$,
  '42501', null, 'ingen kan skriva i loggen direkt');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000003", "role": "authenticated"}';
select throws_ok($$ select public.record_document_access('ffffffff-ffff-4fff-8fff-000000000001') $$, '42501', null,
  'en utomstående kan inte öppna dokumentet');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000001", "role": "authenticated"}';
select is(
  (select count(*)::int from public.document_access_log where document_id = 'ffffffff-ffff-4fff-8fff-000000000001' and user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000002'),
  1, 'säljaren ser köparens åtkomst i loggen');
select lives_ok($$
  insert into public.listing_ndas (listing_id, body) values ('cccccccc-cccc-4ccc-8ccc-000000000001', 'Sekretessavtal version 2') $$,
  'säljaren lägger in en ny version av avtalet');
select is((select max(version) from public.listing_ndas where listing_id = 'cccccccc-cccc-4ccc-8ccc-000000000001'), 2,
  'avtalsversionen räknas upp');
-- Säljaren har ingen uppdateringsregel: RLS filtrerar bort raden innan
-- triggern körs, så satsen påverkar noll rader i stället för att kasta fel.
update public.listing_ndas set body = 'Ändrad text' where id = 'eeeeeeee-eeee-4eee-8eee-000000000001';

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000002", "role": "authenticated"}';
select throws_ok($$ select public.record_document_access('ffffffff-ffff-4fff-8fff-000000000001') $$, '42501', null,
  'en ny avtalsversion kräver att köparen accepterar igen');
reset role;

select is((select body from public.listing_ndas where id = 'eeeeeeee-eeee-4eee-8eee-000000000001'), 'Sekretessavtal version 1',
  'säljaren kan inte ändra ett avtal i efterhand');
select throws_ok($$ update public.listing_ndas set body = 'Ändrad text' where id = 'eeeeeeee-eeee-4eee-8eee-000000000001' $$,
  'P0001', null, 'ett avtal kan inte ändras, inte ens av plattformen');

select throws_ok($$ update public.document_access_log set accessed_at = now() $$,
  'P0001', null, 'åtkomstloggen kan inte ändras, inte ens av plattformen');
select throws_ok($$ delete from public.document_access_log $$,
  'P0001', null, 'åtkomstloggen kan inte raderas, inte ens av plattformen');
select throws_ok($$ delete from public.nda_acceptances $$,
  'P0001', null, 'accepterade avtal kan inte raderas');

-- Ändring av publicerad annons -------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000001", "role": "authenticated"}';
update public.listings set asking_price_minor = 300000000 where id = 'cccccccc-cccc-4ccc-8ccc-000000000001';
select is((select status::text from public.listings where id = 'cccccccc-cccc-4ccc-8ccc-000000000001'), 'pending_review',
  'en ändrad publicerad annons skickas till granskning igen');

-- Bevakningar --------------------------------------------------------------
set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000002", "role": "authenticated"}';
select throws_ok($$
  insert into public.saved_searches (name, min_price_minor) values ('Utan valuta', 100) $$,
  '23514', null, 'ett prisfilter kräver en valuta');
select lives_ok($$
  insert into public.saved_searches (name, countries, price_currency, max_price_minor)
  values ('Konsultbolag i Sverige', '{SE}', 'SEK', 500000000) $$,
  'köparen sparar en bevakning');

set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000003", "role": "authenticated"}';
select is((select count(*)::int from public.saved_searches), 0, 'andras bevakningar syns inte');

-- Medlemskap ---------------------------------------------------------------
set local request.jwt.claims to '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-000000000001", "role": "authenticated"}';
select throws_ok($$
  delete from public.organization_members where organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001' and user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000001' $$,
  'P0001', null, 'den sista ägaren kan inte lämna organisationen');
reset role;

select * from finish();
rollback;
