-- AML- och sanktionsscreening.
--
-- Beslutat i docs/BUSINESS.md: screening från start, även utan skyldighet.
-- Dataskyddsunderlaget står i docs/PERSONUPPGIFTER.md och MÅSTE läsas innan
-- den första skarpa körningen — särskilt om PEP-listor.
--
-- Tre regler formar schemat:
--
-- 1. En träff stoppar, men beslutar inte. Ett automatiserat beslut med
--    rättslig följd faller under artikel 22 i GDPR. Därför finns alltid en
--    människa och en motivering i `screening_decisions`.
-- 2. Falska träffar är normalfallet. Namnlikhet är trubbigt: "Ivanov" i
--    Stockholm är inte "Ivanov" på sanktionslistan. Modellen måste därför
--    kunna säga "kontrollerad och rentvådd", inte bara "träff".
-- 3. Att en kontroll gjorts bevaras, leverantörens råsvar gallras. Det förra
--    är bevis på att vi gjort vad vi ska, det senare är personuppgifter om
--    någon annan än vår användare.

create type public.screening_subject as enum ('person', 'organization');
create type public.screening_status as enum ('pending', 'clear', 'hit', 'error');
create type public.screening_outcome as enum ('cleared', 'blocked');

create table public.screening_checks (
  id uuid primary key default gen_random_uuid(),
  -- Ordningsföljd som inte kan bli oavgjord. Två kontroller i samma sekund får
  -- identisk checked_at, och då blir "senaste kontrollen" godtycklig — en träff
  -- kunde tystas av en tidigare godkänd kontroll. Upptäckt av testet.
  seq bigint generated always as identity,
  subject_type public.screening_subject not null,
  -- Person: profiles.id. Organisation: organizations.id. Ingen främmande nyckel,
  -- eftersom kontrollen ska överleva att kontot tas bort.
  subject_id uuid not null,
  /** Namnet som faktiskt kontrollerades, som det såg ut vid tillfället. */
  searched_name text not null check (char_length(searched_name) between 1 and 300),
  country text references public.markets (country),
  /** Vilken tjänst som svarade. 'manual' tills en leverantör är vald. */
  provider text not null default 'manual' check (char_length(provider) between 1 and 60),
  status public.screening_status not null default 'pending',
  /** Antal träffar leverantören rapporterade. */
  hit_count integer not null default 0 check (hit_count >= 0),
  /** Leverantörens råsvar. Gallras enligt policy — se PERSONUPPGIFTER.md. */
  raw_response jsonb,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index screening_checks_subject_idx on public.screening_checks (subject_type, subject_id, seq desc);
create index screening_checks_status_idx on public.screening_checks (status) where status in ('pending', 'hit');

create table public.screening_decisions (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null references public.screening_checks (id) on delete restrict,
  outcome public.screening_outcome not null,
  /** Varför. Utan motivering går beslutet inte att granska i efterhand. */
  reason text not null check (char_length(reason) between 3 and 5000),
  decided_by uuid not null references public.profiles (id) on delete restrict,
  decided_at timestamptz not null default now()
);

create index screening_decisions_check_idx on public.screening_decisions (check_id);

-- Besluten är bevis. De kan inte skrivas om i efterhand — inte av granskaren,
-- inte av plattformen. Ett nytt beslut läggs till, det gamla står kvar.
create trigger screening_decisions_immutable before update or delete on public.screening_decisions
  for each row execute function private.forbid_change();

alter table public.screening_checks enable row level security;
alter table public.screening_decisions enable row level security;

-- anon får ingenting. `authenticated` behåller SELECT, för annars blir
-- radnivåpolicyn nedan verkningslös: utan tabellrättighet nekas även
-- granskaren, och läsregeln kan aldrig släppa igenom någon. Skrivning går bara
-- genom funktionerna längre ned.
revoke all on table public.screening_checks from anon, authenticated;
revoke all on table public.screening_decisions from anon, authenticated;
grant select on table public.screening_checks to authenticated;
grant select on table public.screening_decisions to authenticated;

-- Bara administratörer läser. Den registrerade har rätt till besked om att
-- screening sker och till utdrag, men det är en RUTIN — inte en tabell som
-- ligger öppen för klienten.
create policy screening_checks_read_admin on public.screening_checks
  for select to authenticated
  using (private.is_platform_admin());

create policy screening_decisions_read_admin on public.screening_decisions
  for select to authenticated
  using (private.is_platform_admin());

-- Skrivning sker bara genom funktionerna nedan eller med tjänstenyckeln.

/**
 * Senaste avgörandet för ett subjekt.
 *
 * 'clear'   inget att anmärka
 * 'hit'     träff som ingen tagit ställning till ännu — stoppar
 * 'blocked' granskare har beslutat att stoppa
 * 'pending' kontroll påbörjad men inte klar
 * null      ingen kontroll gjord
 */
create function private.screening_state(p_subject_type public.screening_subject, p_subject_id uuid)
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
    order by d.decided_at desc, d.id desc
    limit 1
  )
  select case
    when not exists (select 1 from senaste) then null
    when (select outcome from beslut) = 'blocked' then 'blocked'
    when (select outcome from beslut) = 'cleared' then 'clear'
    else (select status::text from senaste)
  end
$$;

grant execute on function private.screening_state(public.screening_subject, uuid) to authenticated;

/** Registrerar en kontroll. Anropas av serverfunktionen, inte av klienten. */
create function public.record_screening_check(
  p_subject_type public.screening_subject,
  p_subject_id uuid,
  p_searched_name text,
  p_country text,
  p_provider text,
  p_status public.screening_status,
  p_hit_count integer,
  p_raw jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not private.is_privileged() then
    raise exception 'Bara plattformen registrerar screeningkontroller' using errcode = '42501';
  end if;

  insert into public.screening_checks (
    subject_type, subject_id, searched_name, country, provider, status, hit_count, raw_response
  )
  values (p_subject_type, p_subject_id, p_searched_name, p_country, p_provider, p_status, p_hit_count, p_raw)
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.record_screening_check(public.screening_subject, uuid, text, text, text, public.screening_status, integer, jsonb) from public, anon, authenticated;

/** Granskarens beslut om en träff. En människa, med motivering. */
create function public.decide_screening(p_check uuid, p_clear boolean, p_reason text)
returns public.screening_outcome
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_outcome public.screening_outcome;
begin
  if not private.is_platform_admin() then
    raise exception 'Bara administratörer kan avgöra en screeningträff' using errcode = '42501';
  end if;
  if p_reason is null or char_length(trim(p_reason)) < 3 then
    raise exception 'Beslutet måste motiveras' using errcode = 'P0001';
  end if;

  v_outcome := case when p_clear then 'cleared'::public.screening_outcome
                    else 'blocked'::public.screening_outcome end;

  insert into public.screening_decisions (check_id, outcome, reason, decided_by)
  values (p_check, v_outcome, trim(p_reason), auth.uid());

  return v_outcome;
end;
$$;

revoke execute on function public.decide_screening(uuid, boolean, text) from public, anon;
grant execute on function public.decide_screening(uuid, boolean, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Screeningen får konsekvenser
-- ---------------------------------------------------------------------------
-- Utan det här är screening en avbockad ruta. En organisation som stoppats i
-- screeningen ska inte kunna verifieras, och en annons från den ska inte kunna
-- publiceras.

create or replace function public.verify_organization(p_organization uuid, p_verified boolean default true)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_verified_at timestamptz;
  v_screening text;
begin
  if not private.is_platform_admin() then
    raise exception 'Bara administratörer kan verifiera organisationer' using errcode = '42501';
  end if;

  if p_verified then
    v_screening := private.screening_state('organization', p_organization);
    if v_screening in ('hit', 'blocked', 'pending') then
      raise exception 'Screeningen är inte avgjord för organisationen (%). Ta ställning till träffen först.', v_screening
        using errcode = 'P0001';
    end if;
  end if;

  update public.organizations
  set verified_at = case when p_verified then now() else null end
  where id = p_organization
  returning verified_at into v_verified_at;

  if not found then
    raise exception 'Organisationen finns inte' using errcode = 'P0002';
  end if;
  return v_verified_at;
end;
$$;
