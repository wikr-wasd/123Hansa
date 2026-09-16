-- 123Hansa — marknadsplatsen, version 1
--
-- Beslut som styr schemat:
--   docs/BUSINESS.md          Strategin 2026-09-15. Plattformen är INTE part i
--                             affären: inga bud, ingen köpeskilling, inga avtal
--                             där 123Hansa är part. Det finns därför inga
--                             tabeller för det, och ska inte finnas.
--   docs/OPEN-QUESTIONS.md 9  Supabase som enda backend.
--   CLAUDE.md regel 1         Pengar som heltal i minsta enhet (bigint).
--   CLAUDE.md regel 5         RLS i samma migration som tabellen.
--   CLAUDE.md regel 6         Datarummet kräver accepterat sekretessavtal, och
--                             åtkomstloggen är oföränderlig.
--
-- Förtroendegränsen: klienten får skriva direkt bara där radnivåpolicyn ensam
-- räcker. Allt en användare inte ska kunna göra själv — publicera, verifiera en
-- organisation, markera demo, logga dokumentåtkomst — spärras av en trigger
-- eller går genom en SECURITY DEFINER-funktion som gör sin egen kontroll.

-- ---------------------------------------------------------------------------
-- Interna hjälpfunktioner
-- ---------------------------------------------------------------------------
-- Schemat `private` exponeras inte av API:t. Policyerna anropar funktionerna
-- med anroparens rättigheter, därför usage och execute till anon/authenticated.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- Körs satsen av plattformen själv? Triggerfunktioner som använder den här är
-- SECURITY INVOKER, så current_user är den roll som faktiskt gjorde anropet.
create function private.is_privileged()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user in ('postgres', 'service_role', 'supabase_admin')
$$;

create function private.try_uuid(p_value text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return p_value::uuid;
exception when others then
  return null;
end;
$$;

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- För loggar och accepterade avtal. Gäller alla roller, även plattformen:
-- ett bevis som går att ändra är inget bevis.
create function private.forbid_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Tabellen % är oföränderlig', tg_table_name
    using errcode = 'P0001';
end;
$$;

-- ---------------------------------------------------------------------------
-- Marknader
-- ---------------------------------------------------------------------------
-- Speglar COUNTRY_INFO och CURRENCY_INFO i packages/core/src/country.ts.
-- `launched` styr var annonser får läggas upp. Lansering: SE, NO, DK.

create table public.markets (
  country text primary key check (country ~ '^[A-Z]{2}$'),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  decimal_digits smallint not null check (decimal_digits between 0 and 4),
  launched boolean not null default false,
  unique (country, currency)
);

comment on table public.markets is
  'Speglar packages/core/src/country.ts. Ändras landets valuta ska båda ändras.';

insert into public.markets (country, currency, decimal_digits, launched) values
  ('SE', 'SEK', 2, true),
  ('NO', 'NOK', 2, true),
  ('DK', 'DKK', 2, true),
  ('HR', 'EUR', 2, false),
  ('BA', 'BAM', 2, false);

alter table public.markets enable row level security;

create policy markets_read on public.markets
  for select to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Plattformsadministratörer
-- ---------------------------------------------------------------------------
-- En egen tabell i stället för en kolumn på profilen, så att ingen policy på
-- profilen någonsin kan råka ge en användare rätt att göra sig själv till admin.

create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;
revoke all on table public.platform_admins from anon, authenticated;
-- Inga policyer: bara plattformen läser och skriver.

create function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins a where a.user_id = auth.uid()
  )
$$;

-- ---------------------------------------------------------------------------
-- Profiler
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 200),
  country text references public.markets (country),
  locale text not null default 'sv' check (locale in ('sv', 'no', 'da', 'bs', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon;

create policy profiles_read_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_updated_at();

create function private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.create_profile_for_new_user();

-- ---------------------------------------------------------------------------
-- Organisationer och medlemmar
-- ---------------------------------------------------------------------------
-- En säljare är en organisation, inte en person. Det täcker både ett bolag som
-- säljer sig självt och en mäklarfirma med flera mäklare (OPEN-QUESTIONS 13).
--
-- Organisationsnumret valideras mot landets algoritm av validateOrgNumber() i
-- @hansa/core, på servern, innan `verified_at` sätts. Databasen dubblerar inte
-- algoritmen (CLAUDE.md regel 3) — den ser till att bara plattformen kan
-- markera en organisation som verifierad.

create type public.organization_kind as enum ('company', 'broker');
create type public.member_role as enum ('owner', 'member');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  kind public.organization_kind not null default 'company',
  name text not null check (char_length(name) between 1 and 200),
  country text not null references public.markets (country),
  org_number text not null check (char_length(org_number) between 6 and 20),
  verified_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country, org_number)
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_members_user_idx on public.organization_members (user_id);

create function private.is_org_member(p_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_organization and m.user_id = auth.uid()
  )
$$;

create function private.is_org_owner(p_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_organization
      and m.user_id = auth.uid()
      and m.role = 'owner'
  )
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
revoke all on table public.organizations from anon;
revoke all on table public.organization_members from anon;

-- `created_by` i läsregeln behövs för INSERT ... RETURNING: ägarskapet skapas av
-- en AFTER-trigger som ännu inte har körts när den nya raden kontrolleras.
create policy organizations_read on public.organizations
  for select to authenticated
  using (
    private.is_org_member(id)
    or created_by = (select auth.uid())
    or private.is_platform_admin()
  );

create policy organizations_insert on public.organizations
  for insert to authenticated
  with check (created_by = (select auth.uid()) and verified_at is null);

create policy organizations_update on public.organizations
  for update to authenticated
  using (private.is_org_owner(id))
  with check (private.is_org_owner(id));

create function private.guard_organization()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if private.is_privileged() then
    return new;
  end if;
  if new.verified_at is distinct from old.verified_at then
    raise exception 'Bara plattformen kan verifiera en organisation'
      using errcode = 'P0001';
  end if;
  if new.created_by <> old.created_by or new.created_at <> old.created_at then
    raise exception 'Fältet kan inte ändras' using errcode = 'P0001';
  end if;
  if old.verified_at is not null
     and (new.org_number <> old.org_number or new.country <> old.country or new.kind <> old.kind) then
    raise exception 'Organisationsnummer, land och typ kan inte ändras efter verifiering'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger organizations_guard before update on public.organizations
  for each row execute function private.guard_organization();

create function private.add_creator_as_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger organizations_owner after insert on public.organizations
  for each row execute function private.add_creator_as_owner();

create policy organization_members_read on public.organization_members
  for select to authenticated
  using (private.is_org_member(organization_id) or private.is_platform_admin());

create policy organization_members_insert on public.organization_members
  for insert to authenticated
  with check (private.is_org_owner(organization_id));

create policy organization_members_update on public.organization_members
  for update to authenticated
  using (private.is_org_owner(organization_id))
  with check (private.is_org_owner(organization_id));

-- En medlem får lämna, en ägare får ta bort medlemmar.
create policy organization_members_delete on public.organization_members
  for delete to authenticated
  using (private.is_org_owner(organization_id) or user_id = (select auth.uid()));

create function private.keep_last_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_privileged() then
    return coalesce(new, old);
  end if;
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner')
     and (
       select count(*) from public.organization_members m
       where m.organization_id = old.organization_id and m.role = 'owner'
     ) = 1 then
    raise exception 'En organisation måste ha minst en ägare' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger organization_members_last_owner
  before update or delete on public.organization_members
  for each row execute function private.keep_last_owner();

-- ---------------------------------------------------------------------------
-- Annonser
-- ---------------------------------------------------------------------------

create type public.listing_status as enum (
  'draft', 'pending_review', 'published', 'rejected', 'sold', 'withdrawn'
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users (id),
  status public.listing_status not null default 'draft',
  -- OPEN-QUESTIONS 7: demoannonser märks, går inte att kontakta, sätts bara av plattformen.
  is_demo boolean not null default false,
  country text not null,
  currency text not null,
  title text not null check (char_length(title) between 3 and 160),
  summary text not null default '' check (char_length(summary) <= 500),
  description text not null default '' check (char_length(description) <= 20000),
  industry text not null check (char_length(industry) between 1 and 80),
  region text not null default '' check (char_length(region) <= 120),
  -- Minsta valutaenheten. NULL betyder "pris på begäran".
  asking_price_minor bigint check (asking_price_minor is null or asking_price_minor > 0),
  revenue_minor bigint check (revenue_minor is null or revenue_minor >= 0),
  employees integer check (employees is null or employees >= 0),
  founded_year smallint check (founded_year is null or founded_year between 1800 and 2100),
  review_note text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Valutan följer av landet, och bara av landet (CLAUDE.md regel 4).
  foreign key (country, currency) references public.markets (country, currency)
);

create index listings_status_country_idx on public.listings (status, country);
create index listings_organization_idx on public.listings (organization_id);

create function private.is_listing_member(p_listing uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.listings l
    join public.organization_members m on m.organization_id = l.organization_id
    where l.id = p_listing and m.user_id = auth.uid()
  )
$$;

alter table public.listings enable row level security;

create policy listings_read on public.listings
  for select to anon, authenticated
  using (
    status = 'published'
    or private.is_org_member(organization_id)
    or private.is_platform_admin()
  );

create policy listings_insert on public.listings
  for insert to authenticated
  with check (
    private.is_org_member(organization_id)
    and created_by = (select auth.uid())
  );

create policy listings_update on public.listings
  for update to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy listings_delete on public.listings
  for delete to authenticated
  using (
    private.is_org_owner(organization_id)
    and status in ('draft', 'rejected', 'withdrawn')
  );

create function private.guard_listing()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_launched boolean;
  v_verified timestamptz;
begin
  new.updated_at := now();

  if private.is_privileged() then
    if new.status = 'published' and new.published_at is null then
      new.published_at := now();
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'draft' then
      raise exception 'En ny annons börjar som utkast' using errcode = 'P0001';
    end if;
    if new.is_demo then
      raise exception 'Bara plattformen kan skapa demoannonser' using errcode = 'P0001';
    end if;
    if new.published_at is not null or new.review_note is not null then
      raise exception 'Fältet sätts av plattformen' using errcode = 'P0001';
    end if;
  else
    if new.organization_id <> old.organization_id
       or new.created_by <> old.created_by
       or new.created_at <> old.created_at
       or new.is_demo <> old.is_demo
       or new.published_at is distinct from old.published_at
       or new.review_note is distinct from old.review_note then
      raise exception 'Fältet kan inte ändras av säljaren' using errcode = 'P0001';
    end if;

    -- En ändrad publicerad annons granskas om. Annars kan en granskad annons
    -- bytas ut mot vad som helst efter publiceringen.
    if old.status = 'published' and new.status = 'published'
       and (new.title, new.summary, new.description, new.industry, new.region,
            new.asking_price_minor, new.revenue_minor, new.employees,
            new.founded_year, new.country, new.currency)
           is distinct from
           (old.title, old.summary, old.description, old.industry, old.region,
            old.asking_price_minor, old.revenue_minor, old.employees,
            old.founded_year, old.country, old.currency) then
      new.status := 'pending_review';
    elsif new.status <> old.status then
      if not (
           (old.status in ('draft', 'rejected') and new.status = 'pending_review')
        or (old.status = 'pending_review' and new.status = 'draft')
        or (old.status = 'published' and new.status in ('sold', 'withdrawn'))
        or (old.status in ('draft', 'rejected', 'pending_review') and new.status = 'withdrawn')
        or (old.status = 'withdrawn' and new.status = 'draft')
      ) then
        raise exception 'Otillåten statusändring: % till %', old.status, new.status
          using errcode = 'P0001';
      end if;
    end if;
  end if;

  if tg_op = 'INSERT' or new.country <> old.country then
    select mk.launched into v_launched from public.markets mk where mk.country = new.country;
    if not coalesce(v_launched, false) then
      raise exception 'Landet % är inte öppnat för annonser', new.country
        using errcode = 'P0001';
    end if;
  end if;

  if new.status = 'pending_review' and (tg_op = 'INSERT' or old.status <> 'pending_review') then
    select o.verified_at into v_verified
    from public.organizations o where o.id = new.organization_id;
    if v_verified is null then
      raise exception 'Organisationen måste vara verifierad innan annonsen kan granskas'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

create trigger listings_guard before insert or update on public.listings
  for each row execute function private.guard_listing();

-- Granskning. Anropas av en administratör via API:t.
create function public.review_listing(p_listing uuid, p_approve boolean, p_note text default null)
returns public.listing_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.listing_status;
begin
  if not private.is_platform_admin() then
    raise exception 'Bara administratörer kan granska annonser' using errcode = '42501';
  end if;

  update public.listings
  set status = case when p_approve then 'published'::public.listing_status
                    else 'rejected'::public.listing_status end,
      review_note = p_note
  where id = p_listing and status = 'pending_review'
  returning status into v_status;

  if v_status is null then
    raise exception 'Annonsen finns inte eller väntar inte på granskning' using errcode = 'P0002';
  end if;
  return v_status;
end;
$$;

revoke execute on function public.review_listing(uuid, boolean, text) from public, anon;
grant execute on function public.review_listing(uuid, boolean, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Intresseanmälningar
-- ---------------------------------------------------------------------------
-- Köparen visar intresse. Säljaren väljer vem som går vidare. Ett bud är det
-- inte, och ska inte bli det (docs/BUSINESS.md).

create type public.interest_status as enum ('pending', 'accepted', 'declined', 'withdrawn');

create table public.listing_interests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  message text not null check (char_length(message) between 1 and 5000),
  status public.interest_status not null default 'pending',
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create index listing_interests_listing_idx on public.listing_interests (listing_id);

create function private.listing_accepts_interest(p_listing uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.listings l
    where l.id = p_listing and l.status = 'published' and not l.is_demo
  ) and not private.is_listing_member(p_listing)
$$;

create function private.has_accepted_interest(p_listing uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.listing_interests i
    where i.listing_id = p_listing
      and i.buyer_id = auth.uid()
      and i.status = 'accepted'
  )
$$;

alter table public.listing_interests enable row level security;
revoke all on table public.listing_interests from anon;

create policy listing_interests_read on public.listing_interests
  for select to authenticated
  using (buyer_id = (select auth.uid()) or private.is_listing_member(listing_id));

create policy listing_interests_insert on public.listing_interests
  for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and status = 'pending'
    and decided_at is null
    and private.listing_accepts_interest(listing_id)
  );

create policy listing_interests_update on public.listing_interests
  for update to authenticated
  using (buyer_id = (select auth.uid()) or private.is_listing_member(listing_id))
  with check (buyer_id = (select auth.uid()) or private.is_listing_member(listing_id));

create function private.guard_interest()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if private.is_privileged() then
    return new;
  end if;
  if new.listing_id <> old.listing_id
     or new.buyer_id <> old.buyer_id
     or new.message <> old.message
     or new.created_at <> old.created_at
     or new.decided_at is distinct from old.decided_at then
    raise exception 'Bara status kan ändras' using errcode = 'P0001';
  end if;
  if new.status = old.status then
    return new;
  end if;

  if old.buyer_id = auth.uid() then
    if new.status <> 'withdrawn' or old.status not in ('pending', 'accepted') then
      raise exception 'Köparen kan bara dra tillbaka sitt intresse' using errcode = 'P0001';
    end if;
  elsif private.is_listing_member(old.listing_id) then
    if old.status <> 'pending' or new.status not in ('accepted', 'declined') then
      raise exception 'Säljaren kan bara acceptera eller avböja ett väntande intresse'
        using errcode = 'P0001';
    end if;
  else
    raise exception 'Ingen behörighet' using errcode = '42501';
  end if;

  new.decided_at := now();
  return new;
end;
$$;

create trigger listing_interests_guard before update on public.listing_interests
  for each row execute function private.guard_interest();

-- ---------------------------------------------------------------------------
-- Meddelanden
-- ---------------------------------------------------------------------------
-- Först när säljaren accepterat intresset. Köparens första meddelande är
-- intresseanmälan själv.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid not null references public.listing_interests (id) on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users (id),
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now()
);

create index messages_interest_idx on public.messages (interest_id, created_at);

create function private.is_interest_participant(p_interest uuid, p_require_accepted boolean)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.listing_interests i
    where i.id = p_interest
      and (not p_require_accepted or i.status = 'accepted')
      and (i.buyer_id = auth.uid() or private.is_listing_member(i.listing_id))
  )
$$;

alter table public.messages enable row level security;
revoke all on table public.messages from anon;

create policy messages_read on public.messages
  for select to authenticated
  using (private.is_interest_participant(interest_id, false));

create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and private.is_interest_participant(interest_id, true)
  );

create trigger messages_immutable before update on public.messages
  for each row execute function private.forbid_change();

-- ---------------------------------------------------------------------------
-- Sekretessavtal
-- ---------------------------------------------------------------------------
-- OPEN-QUESTIONS 11: avtalet är parternas, inte plattformens. Säljaren lägger in
-- texten; en ny version kräver att köparna accepterar på nytt. Vem som
-- accepterade vilken version och när sparas oföränderligt.

create table public.listing_ndas (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  version integer not null check (version > 0),
  body text not null check (char_length(body) between 1 and 50000),
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  unique (listing_id, version)
);

create table public.nda_acceptances (
  id uuid primary key default gen_random_uuid(),
  nda_id uuid not null references public.listing_ndas (id) on delete restrict,
  user_id uuid not null default auth.uid() references auth.users (id) on delete restrict,
  accepted_at timestamptz not null default now(),
  unique (nda_id, user_id)
);

create function private.set_nda_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select coalesce(max(n.version), 0) + 1 into new.version
  from public.listing_ndas n where n.listing_id = new.listing_id;
  return new;
end;
$$;

create trigger listing_ndas_version before insert on public.listing_ndas
  for each row execute function private.set_nda_version();

create trigger listing_ndas_immutable before update on public.listing_ndas
  for each row execute function private.forbid_change();

create trigger nda_acceptances_immutable before update or delete on public.nda_acceptances
  for each row execute function private.forbid_change();

create function private.is_current_nda(p_nda uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.listing_ndas n
    where n.id = p_nda
      and n.version = (
        select max(n2.version) from public.listing_ndas n2 where n2.listing_id = n.listing_id
      )
  )
$$;

create function private.nda_listing(p_nda uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select n.listing_id from public.listing_ndas n where n.id = p_nda
$$;

alter table public.listing_ndas enable row level security;
alter table public.nda_acceptances enable row level security;
revoke all on table public.listing_ndas from anon;
revoke all on table public.nda_acceptances from anon;

create policy listing_ndas_read on public.listing_ndas
  for select to authenticated
  using (private.is_listing_member(listing_id) or private.has_accepted_interest(listing_id));

create policy listing_ndas_insert on public.listing_ndas
  for insert to authenticated
  with check (private.is_listing_member(listing_id) and created_by = (select auth.uid()));

create policy nda_acceptances_read on public.nda_acceptances
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.is_listing_member(private.nda_listing(nda_id))
  );

create policy nda_acceptances_insert on public.nda_acceptances
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and private.is_current_nda(nda_id)
    and private.has_accepted_interest(private.nda_listing(nda_id))
  );

-- ---------------------------------------------------------------------------
-- Datarum
-- ---------------------------------------------------------------------------
-- Det känsligaste som lagras (CLAUDE.md regel 6). Filen ligger i Storage-bucketen
-- `dataroom` under `<listing_id>/...`. Köpare hämtar aldrig filen direkt: en
-- serverfunktion anropar record_document_access(), som kontrollerar åtkomsten
-- och loggar, och skapar sedan en tidsbegränsad länk. Utan det steget går
-- loggen att kringgå.

create table public.dataroom_documents (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 255),
  storage_path text not null unique,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  -- Mjuk borttagning: loggposter måste fortsätta peka på något.
  deleted_at timestamptz,
  check (storage_path like listing_id::text || '/%')
);

create index dataroom_documents_listing_idx on public.dataroom_documents (listing_id);

create table public.document_access_log (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.dataroom_documents (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  accessed_at timestamptz not null default now()
);

create index document_access_log_document_idx on public.document_access_log (document_id);

create trigger document_access_log_immutable before update or delete on public.document_access_log
  for each row execute function private.forbid_change();

create function private.can_access_document(p_document uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.dataroom_documents d
    join public.listings l on l.id = d.listing_id
    where d.id = p_document
      and d.deleted_at is null
      and (
        private.is_org_member(l.organization_id)
        or (
          l.status = 'published'
          and not l.is_demo
          and private.has_accepted_interest(l.id)
          and exists (
            select 1
            from public.nda_acceptances a
            join public.listing_ndas n on n.id = a.nda_id
            where n.listing_id = l.id
              and a.user_id = auth.uid()
              and n.version = (
                select max(n2.version) from public.listing_ndas n2 where n2.listing_id = l.id
              )
          )
        )
      )
  )
$$;

alter table public.dataroom_documents enable row level security;
alter table public.document_access_log enable row level security;
revoke all on table public.dataroom_documents from anon;
revoke all on table public.document_access_log from anon;

create policy dataroom_documents_read on public.dataroom_documents
  for select to authenticated
  using (private.can_access_document(id) or private.is_listing_member(listing_id));

create policy dataroom_documents_insert on public.dataroom_documents
  for insert to authenticated
  with check (private.is_listing_member(listing_id) and uploaded_by = (select auth.uid()));

create policy dataroom_documents_update on public.dataroom_documents
  for update to authenticated
  using (private.is_listing_member(listing_id))
  with check (private.is_listing_member(listing_id));

create function private.guard_document()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_privileged() then
    return new;
  end if;
  if (new.listing_id, new.name, new.storage_path, new.size_bytes, new.uploaded_by, new.created_at)
     is distinct from
     (old.listing_id, old.name, old.storage_path, old.size_bytes, old.uploaded_by, old.created_at)
     or old.deleted_at is not null then
    raise exception 'Ett dokument kan bara tas bort, inte ändras' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger dataroom_documents_guard before update on public.dataroom_documents
  for each row execute function private.guard_document();

-- Ingen insert-policy på loggen: den enda vägen in är den här funktionen.
create policy document_access_log_read on public.document_access_log
  for select to authenticated
  using (
    private.is_platform_admin()
    or exists (
      select 1 from public.dataroom_documents d
      where d.id = document_id and private.is_listing_member(d.listing_id)
    )
  );

create function public.record_document_access(p_document uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_path text;
begin
  if auth.uid() is null or not private.can_access_document(p_document) then
    raise exception 'Ingen åtkomst till dokumentet' using errcode = '42501';
  end if;

  insert into public.document_access_log (document_id, user_id)
  values (p_document, auth.uid());

  select d.storage_path into v_path from public.dataroom_documents d where d.id = p_document;
  return v_path;
end;
$$;

revoke execute on function public.record_document_access(uuid) from public, anon;
grant execute on function public.record_document_access(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('dataroom', 'dataroom', false)
on conflict (id) do nothing;

-- Medlemmar laddar upp och läser sina egna dokument. Köpare har ingen
-- läsregel här — de får en tidsbegränsad länk från servern efter loggningen.
create policy dataroom_objects_member_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'dataroom'
    and private.is_listing_member(private.try_uuid((storage.foldername(name))[1]))
  );

create policy dataroom_objects_member_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'dataroom'
    and private.is_listing_member(private.try_uuid((storage.foldername(name))[1]))
  );

-- ---------------------------------------------------------------------------
-- Bevakningar (matchning)
-- ---------------------------------------------------------------------------

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  countries text[] not null default '{}',
  industries text[] not null default '{}',
  -- Belopp i olika valutor jämförs aldrig (CLAUDE.md regel 1). Ett prisfilter
  -- kräver därför en valuta.
  price_currency text check (price_currency is null or price_currency ~ '^[A-Z]{3}$'),
  min_price_minor bigint check (min_price_minor is null or min_price_minor >= 0),
  max_price_minor bigint check (max_price_minor is null or max_price_minor >= 0),
  notify boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((min_price_minor is null and max_price_minor is null) or price_currency is not null),
  check (min_price_minor is null or max_price_minor is null or min_price_minor <= max_price_minor)
);

create index saved_searches_user_idx on public.saved_searches (user_id);

alter table public.saved_searches enable row level security;
revoke all on table public.saved_searches from anon;

create policy saved_searches_own on public.saved_searches
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create trigger saved_searches_touch before update on public.saved_searches
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Rättigheter på hjälpfunktionerna
-- ---------------------------------------------------------------------------

revoke execute on all functions in schema private from public;
grant execute on function
  private.is_privileged(),
  private.try_uuid(text),
  private.is_platform_admin(),
  private.is_org_member(uuid),
  private.is_org_owner(uuid),
  private.is_listing_member(uuid),
  private.listing_accepts_interest(uuid),
  private.has_accepted_interest(uuid),
  private.is_interest_participant(uuid, boolean),
  private.is_current_nda(uuid),
  private.nda_listing(uuid),
  private.can_access_document(uuid)
to anon, authenticated;
