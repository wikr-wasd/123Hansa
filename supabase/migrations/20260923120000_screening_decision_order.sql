-- Ordningen mellan två screeningbeslut fick inte avgöras av ett slumptal.
--
-- `private.screening_state()` valde senaste beslutet med
-- `order by d.decided_at desc, d.id desc`. `decided_at` har `default now()`,
-- och now() är transaktionens tidsstämpel — två beslut i samma transaktion, och
-- i praktiken även två inom samma sekund, får identisk tid. Då avgjorde
-- tiebreakern: `d.id`, ett gen_random_uuid(). Alltså slumpen.
--
-- Följden var att ett blockerande beslut kunde förlora mot ett tidigare
-- rentvående. Läget lästes då som `clear`, `verify_organization()` släppte
-- igenom organisationen, och annonsen kunde publiceras — precis det screeningen
-- är byggd för att stoppa.
--
-- Testet "ett blockerande beslut väger tyngst" fanns sedan 2026-09-17 och tog
-- felet, men bara ungefär varannan körning. Lokalt föll det i tre körningar av
-- fem; i CI hade det gått igenom fyra commits i rad på ren tur. Ett flackigt
-- test som ibland är grönt är värre än ett rött: det lästes som att skyddet
-- fanns.
--
-- `screening_checks` fick `seq` av exakt det här skälet i samma migration som
-- skapade den. `screening_decisions` fick det inte. Rättas här.

alter table public.screening_decisions
  add column seq bigint generated always as identity;

comment on column public.screening_decisions.seq is
  'Ordningsföljd som inte kan bli oavgjord. decided_at räcker inte: now() är transaktionens tid, och två beslut i samma transaktion får identisk tidsstämpel.';

-- Besluten är oföränderliga (ingen UPDATE- eller DELETE-policy), så seq kan
-- bara växa. Indexet gör "senaste beslutet för den här kontrollen" till en
-- uppslagning i stället för en sortering.
create index screening_decisions_check_seq_idx
  on public.screening_decisions (check_id, seq desc);

/**
 * Läget för en kontrollerad person eller organisation.
 *
 * Oförändrad i allt utom ordningen: senaste beslutet avgörs av `seq`, inte av
 * `decided_at` och ett slumpmässigt uuid.
 */
create or replace function private.screening_state(
  p_subject_type public.screening_subject,
  p_subject_id uuid
)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  with senaste as (
    select c.id, c.status, c.seq
    from public.screening_checks c
    where c.subject_type = p_subject_type and c.subject_id = p_subject_id
    order by c.seq desc
    limit 1
  ),
  beslut as (
    select d.outcome
    from public.screening_decisions d
    join senaste s on s.id = d.check_id
    order by d.seq desc
    limit 1
  )
  select case
    when not exists (select 1 from senaste) then null
    when (select outcome from beslut) = 'blocked' then 'blocked'
    when (select outcome from beslut) = 'cleared' then 'clear'
    else (select status::text from senaste)
  end
$$;
