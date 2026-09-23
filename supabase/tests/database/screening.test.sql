-- Screeningen ska stoppa, och beslutet ska fattas av en människa.
--
-- Det som provas här är inte att en rad går att skriva, utan att den får
-- konsekvenser: en träff som ingen tagit ställning till hindrar verifiering,
-- och därmed publicering. En screening utan konsekvens är en avbockad ruta.

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-000000000001', 'saljare@screening.test', '{"full_name": "Sixten Säljare"}'),
  ('11111111-1111-4111-8111-000000000002', 'admin@screening.test', '{"full_name": "Alva Admin"}');
insert into public.platform_admins (user_id) values ('11111111-1111-4111-8111-000000000002');

insert into public.organizations (id, name, country, org_number, created_by)
values ('22222222-2222-4222-8222-000000000001', 'Screeningbolaget AB', 'SE', '5591111119',
        '11111111-1111-4111-8111-000000000001');

-- Ingen kontroll gjord --------------------------------------------------------
select is(private.screening_state('organization', '22222222-2222-4222-8222-000000000001'), null,
  'utan kontroll finns inget screeningläge');

-- En kontroll utan träff ------------------------------------------------------
select lives_ok($$
  select public.record_screening_check('organization', '22222222-2222-4222-8222-000000000001',
    'Screeningbolaget AB', 'SE', 'manual', 'clear', 0, null) $$,
  'plattformen registrerar en kontroll');

select is(private.screening_state('organization', '22222222-2222-4222-8222-000000000001'), 'clear',
  'en kontroll utan träff ger läget clear');

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-4111-8111-000000000002", "role": "authenticated"}';
select isnt(public.verify_organization('22222222-2222-4222-8222-000000000001'), null,
  'en rentvådd organisation går att verifiera');
reset role;

-- En träff ------------------------------------------------------------------
select public.record_screening_check('organization', '22222222-2222-4222-8222-000000000001',
  'Screeningbolaget AB', 'SE', 'manual', 'hit', 2,
  '{"lists": ["EU consolidated"], "score": 0.82}'::jsonb);

select is(private.screening_state('organization', '22222222-2222-4222-8222-000000000001'), 'hit',
  'en ny träff sätter läget till hit');

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-4111-8111-000000000002", "role": "authenticated"}';
select throws_ok($$ select public.verify_organization('22222222-2222-4222-8222-000000000001') $$,
  'P0001', null, 'en oavgjord träff hindrar verifiering');

-- Klienten kommer inte åt kontrollerna direkt --------------------------------
set local request.jwt.claims to '{"sub": "11111111-1111-4111-8111-000000000001", "role": "authenticated"}';
-- Radnivåpolicyn filtrerar i stället för att neka: säljaren får noll rader.
-- Ett SELECT som RLS tömmer kastar inget fel — se docs/TESTING.md.
select is((select count(*)::int from public.screening_checks), 0,
  'säljaren ser inga screeningkontroller');
select is((select count(*)::int from public.screening_decisions), 0,
  'säljaren ser inga screeningbeslut');
select throws_ok($$
  select public.record_screening_check('person', '11111111-1111-4111-8111-000000000001',
    'Sixten Säljare', 'SE', 'manual', 'clear', 0, null) $$,
  '42501', null, 'en användare kan inte registrera en egen kontroll');
select throws_ok($$
  select public.decide_screening(
    (select id from public.screening_checks order by seq desc limit 1), true, 'Jag är oskyldig') $$,
  '42501', null, 'en användare kan inte avgöra sin egen träff');

-- Granskaren avgör, med motivering -------------------------------------------
set local request.jwt.claims to '{"sub": "11111111-1111-4111-8111-000000000002", "role": "authenticated"}';
select throws_ok($$
  select public.decide_screening(
    (select id from public.screening_checks order by seq desc limit 1), true, '') $$,
  'P0001', null, 'ett beslut utan motivering avvisas');

select is(
  public.decide_screening(
    (select id from public.screening_checks order by seq desc limit 1),
    true,
    'Namnlikhet med person i annat land, fött 1954. Bolagets företrädare är född 1981.')::text,
  'cleared', 'granskaren kan rentvå en träff med motivering');

select is(private.screening_state('organization', '22222222-2222-4222-8222-000000000001'), 'clear',
  'ett rentvått ärende öppnar för verifiering igen');

select isnt(public.verify_organization('22222222-2222-4222-8222-000000000001'), null,
  'organisationen går att verifiera efter beslutet');

-- Ett blockerande beslut stoppar ---------------------------------------------
select public.decide_screening(
  (select id from public.screening_checks order by seq desc limit 1),
  false, 'Bekräftad träff mot EU:s konsoliderade lista.');

select is(private.screening_state('organization', '22222222-2222-4222-8222-000000000001'), 'blocked',
  'ett blockerande beslut väger tyngst');

select throws_ok($$ select public.verify_organization('22222222-2222-4222-8222-000000000001') $$,
  'P0001', null, 'en blockerad organisation går inte att verifiera');
reset role;

-- Omslaget som granskningsvyn använder ---------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-4111-8111-000000000002", "role": "authenticated"}';
select is(public.screening_state('organization', '22222222-2222-4222-8222-000000000001'), 'blocked',
  'granskaren kan läsa screeningläget genom det publika omslaget');
set local request.jwt.claims to '{"sub": "11111111-1111-4111-8111-000000000001", "role": "authenticated"}';
select throws_ok($$
  select public.screening_state('organization', '22222222-2222-4222-8222-000000000001') $$,
  '42501', null, 'en vanlig användare kan inte läsa screeningläget');
reset role;

-- Senaste beslutet gäller, inte det strängaste -------------------------------
-- Tre beslut i samma transaktion får identisk decided_at, eftersom now() är
-- transaktionens tid. Ordningen måste därför komma ur `seq`. Innan den kolumnen
-- fanns avgjorde ett slumpmässigt uuid, och testet ovan föll ungefär varannan
-- körning — i CI gick det igenom fyra commits i rad på ren tur.
--
-- Det här testet vänder på ordningen med flit: hade funktionen i stället
-- kodats som "blockerad vinner alltid" vore raden ovan grön av fel skäl, och
-- en organisation som rentvåtts efter en blockering hade aldrig kunnat
-- verifieras igen.
set local role postgres;
set local request.jwt.claims to '{"sub": "11111111-1111-4111-8111-000000000002", "role": "authenticated"}';
select public.decide_screening(
  (select id from public.screening_checks order by seq desc limit 1),
  true, 'Kontrollerad mot födelsedatum och medborgarskap: fel person.');

select is(private.screening_state('organization', '22222222-2222-4222-8222-000000000001'), 'clear',
  'ett rentvående EFTER en blockering gäller — det är senaste beslutet som styr');

select isnt(public.verify_organization('22222222-2222-4222-8222-000000000001'), null,
  'och organisationen går att verifiera igen');

-- Och tillbaka till blockerat, så att resten av filen läser samma läge som förut.
select public.decide_screening(
  (select id from public.screening_checks order by seq desc limit 1),
  false, 'Ny uppgift: träffen är bekräftad ändå.');
select is(private.screening_state('organization', '22222222-2222-4222-8222-000000000001'), 'blocked',
  'och ett nytt blockerande beslut tar över igen');
reset role;

-- Besluten är bevis ----------------------------------------------------------
select throws_ok($$ update public.screening_decisions set reason = 'Ändrad efteråt' $$,
  'P0001', null, 'ett fattat beslut kan inte skrivas om, inte ens av plattformen');
select throws_ok($$ delete from public.screening_decisions $$,
  'P0001', null, 'ett fattat beslut kan inte raderas');

select * from finish();
rollback;
