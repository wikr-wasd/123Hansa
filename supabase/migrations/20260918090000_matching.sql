-- Matchning mellan bevakningar och annonser.
--
-- `saved_searches` fanns sedan v1 men gjorde ingenting: köparen kunde spara en
-- bevakning, och sedan hände aldrig något. BUSINESS.md lovar fyra saker —
-- annonser, MATCHNING, betald exponering och datarum — och matchningen var den
-- som saknades.
--
-- Fyra beslut formar den här migrationen.
--
-- 1. REGELN BOR PÅ ETT STÄLLE. `private.listing_matches_search()` är den enda
--    platsen där det avgörs om en annons matchar en bevakning. Triggern som
--    fyller på vid publicering och funktionen som söker bakåt anropar samma
--    funktion. Två kopior hade glidit isär, och då hade köparen fått notis om
--    en annons som inte syns i hens egen lista.
--
-- 2. INGEN PÅHITTAD RELEVANSPOÄNG. En bevakning är ett filter, inte en
--    rangordning. Alla annonser som passerar filtret matchar lika mycket, och
--    de sorteras på publiceringsdatum. Att vikta ihop "bransch väger 3, land
--    väger 2" med tal jag gissat vore samma fel som en värderingsmodell ingen
--    kan förklara. När det finns riktig data om vad köpare faktiskt öppnar går
--    det att ompröva.
--
-- 3. BETALD EXPONERING FÅR ALDRIG PÅVERKA ORDNINGEN. Det står i BUSINESS.md och
--    upprepas här, eftersom det är i den här funktionen frestelsen kommer att
--    uppstå. En marknadsplats som säljer förtur i matchningen slutar vara en
--    matchning och blir en annonsplats.
--
-- 4. PRISFILTER JÄMFÖRS ALDRIG ÖVER VALUTAGRÄNSER. Belopp i olika valutor
--    summeras eller jämförs aldrig (CLAUDE.md regel 1), och plattformen har
--    ingen växelkurs — den skulle ändå vara fel imorgon. Har köparen satt ett
--    prisfilter i SEK matchar bara annonser i SEK. Det är ett verkligt
--    avkall, och gränssnittet måste säga det rakt ut i stället för att tyst
--    tappa norska annonser.

create table public.search_matches (
  id uuid primary key default gen_random_uuid(),
  saved_search_id uuid not null references public.saved_searches (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  matched_at timestamptz not null default now(),
  /** När köparen såg matchningen. NULL = oläst. */
  seen_at timestamptz,
  -- En annons matchar en bevakning en gång. Utan det här skulle varje
  -- omkörning ge en ny notis om samma annons.
  unique (saved_search_id, listing_id)
);

create index search_matches_search_idx on public.search_matches (saved_search_id, matched_at desc);
create index search_matches_unseen_idx on public.search_matches (saved_search_id) where seen_at is null;

alter table public.search_matches enable row level security;

revoke all on table public.search_matches from anon, authenticated;
grant select on table public.search_matches to authenticated;
-- Köparen får kvittera sina egna matchningar som lästa, inget annat.
grant update (seen_at) on table public.search_matches to authenticated;

/**
 * Matchar annonsen bevakningen?
 *
 * Den enda platsen där frågan besvaras. Tomt kriterium betyder "spelar ingen
 * roll" — en bevakning utan land matchar alla länder.
 */
create function private.listing_matches_search(
  p_listing public.listings,
  p_search public.saved_searches
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    -- Bara publicerade annonser. En annons under granskning ska inte nå någon.
    p_listing.status = 'published'
    -- Demoannonser går inte att kontakta, så de ska inte heller matcha.
    and not p_listing.is_demo
    and (cardinality(p_search.countries) = 0 or p_listing.country = any (p_search.countries))
    and (cardinality(p_search.industries) = 0 or p_listing.industry = any (p_search.industries))
    and (
      -- Inget prisfilter: allt passerar.
      (p_search.min_price_minor is null and p_search.max_price_minor is null)
      or (
        -- Prisfilter satt. Annonser utan pris ("pris på begäran") passerar —
        -- att utesluta dem hade dolt just de annonser där priset förhandlas.
        p_listing.asking_price_minor is null
        or (
          -- Samma valuta krävs. Se beslut 4 överst.
          p_listing.currency = p_search.price_currency
          and (p_search.min_price_minor is null
               or p_listing.asking_price_minor >= p_search.min_price_minor)
          and (p_search.max_price_minor is null
               or p_listing.asking_price_minor <= p_search.max_price_minor)
        )
      )
    )
$$;

/**
 * Köparen ser sina egna matchningar, och bara dem.
 *
 * Matchningen hör till bevakningen, och bevakningen till användaren.
 */
create policy search_matches_own on public.search_matches
  for select to authenticated
  using (
    exists (
      select 1 from public.saved_searches s
      where s.id = saved_search_id and s.user_id = (select auth.uid())
    )
  );

create policy search_matches_mark_seen on public.search_matches
  for update to authenticated
  using (
    exists (
      select 1 from public.saved_searches s
      where s.id = saved_search_id and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.saved_searches s
      where s.id = saved_search_id and s.user_id = (select auth.uid())
    )
  );

/**
 * Fyller på matchningar för en annons.
 *
 * Köparen matchas aldrig mot sin egen organisations annonser — att få notis om
 * att man själv publicerat något är brus, och för en mäklare med många
 * bevakningar blir det mycket brus.
 */
create function private.match_listing(p_listing_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_listing public.listings;
  v_antal integer;
begin
  select * into v_listing from public.listings where id = p_listing_id;
  if not found then
    return 0;
  end if;

  insert into public.search_matches (saved_search_id, listing_id)
  select s.id, v_listing.id
  from public.saved_searches s
  where s.notify
    and private.listing_matches_search(v_listing, s)
    and not exists (
      select 1
      from public.organization_members m
      where m.organization_id = v_listing.organization_id
        and m.user_id = s.user_id
    )
  on conflict (saved_search_id, listing_id) do nothing;

  get diagnostics v_antal = row_count;
  return v_antal;
end;
$$;

revoke execute on function private.match_listing(uuid) from public, anon, authenticated;

/**
 * Matchar när annonsen publiceras.
 *
 * Villkoret är att status BLIR 'published' — inte att den är det. En
 * uppdatering av en redan publicerad annons ska inte skicka om notisen.
 */
create function private.on_listing_published()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published' and (old.status is distinct from 'published') then
    perform private.match_listing(new.id);
  end if;
  return new;
end;
$$;

create trigger listings_match_on_publish
  after update of status on public.listings
  for each row execute function private.on_listing_published();

/**
 * Fyller på matchningar för en NY bevakning, mot annonser som redan finns.
 *
 * Utan det här vore en ny bevakning tom tills nästa annons publiceras, och den
 * som sparar en bevakning i en marknadsplats med sex annonser skulle tro att
 * funktionen är trasig.
 *
 * Anropas av ägaren själv, därav kontrollen mot auth.uid().
 */
create function public.refresh_saved_search(p_search uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_search public.saved_searches;
  v_antal integer;
begin
  select * into v_search from public.saved_searches where id = p_search;
  if not found then
    raise exception 'Bevakningen finns inte' using errcode = 'P0002';
  end if;
  if v_search.user_id <> auth.uid() then
    raise exception 'Bevakningen tillhör någon annan' using errcode = '42501';
  end if;

  insert into public.search_matches (saved_search_id, listing_id)
  select v_search.id, l.id
  from public.listings l
  where private.listing_matches_search(l, v_search)
    and not exists (
      select 1
      from public.organization_members m
      where m.organization_id = l.organization_id
        and m.user_id = v_search.user_id
    )
  on conflict (saved_search_id, listing_id) do nothing;

  get diagnostics v_antal = row_count;
  return v_antal;
end;
$$;

revoke execute on function public.refresh_saved_search(uuid) from public, anon;
grant execute on function public.refresh_saved_search(uuid) to authenticated;

-- En ny bevakning fylls på direkt. Detsamma när kriterierna ändras: en
-- bevakning som fortsätter visa träffar från de gamla kriterierna är värre än
-- en tom.
create function private.on_saved_search_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    -- Kriterierna ändrade: släng det som byggde på de gamla. Lästa som olästa —
    -- de är inte längre samma svar på samma fråga.
    if (new.countries, new.industries, new.price_currency, new.min_price_minor, new.max_price_minor)
       is distinct from
       (old.countries, old.industries, old.price_currency, old.min_price_minor, old.max_price_minor)
    then
      delete from public.search_matches where saved_search_id = new.id;
    else
      return new;
    end if;
  end if;

  insert into public.search_matches (saved_search_id, listing_id)
  select new.id, l.id
  from public.listings l
  where private.listing_matches_search(l, new)
    and not exists (
      select 1
      from public.organization_members m
      where m.organization_id = l.organization_id
        and m.user_id = new.user_id
    )
  on conflict (saved_search_id, listing_id) do nothing;

  return new;
end;
$$;

create trigger saved_searches_fill_matches
  after insert or update on public.saved_searches
  for each row execute function private.on_saved_search_changed();

comment on table public.search_matches is
  'Annonser som passerat en bevaknings filter. Ordningen är publiceringsdatum — betald exponering påverkar den aldrig (BUSINESS.md).';
