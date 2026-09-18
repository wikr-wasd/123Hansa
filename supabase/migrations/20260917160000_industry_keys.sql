-- Branschen blir en nyckel i stället för en svensk text.
--
-- Tidigare sparades branschen som 'Bygg och anläggning' rakt i annonsen. Tre
-- saker gick sönder av det:
--
-- 1. En dansk köpare läste svenska mitt i ett danskt gränssnitt. Bara
--    gränssnittet ska översättas — men branschen ÄR gränssnitt, inte säljarens
--    egen text (CLAUDE.md, avsnittet om språk).
-- 2. Filtret byggde på exakt strängmatchning. En norsk annons med 'Bygg og
--    anlegg' hade aldrig matchat en svensk sökning på samma bransch.
-- 3. Texten gick inte att formulera om utan att skriva om data.
--
-- Nyckeln är språkneutral, och en enum gör att databasen vägrar ta emot något
-- som inte står i listan. Samma lista finns i packages/core/src/industry.ts,
-- där den dessutom är kopplad till värderingsmultiplarna.

create type public.listing_industry as enum (
  'software',
  'ecommerce',
  'consulting',
  'accounting',
  'manufacturing',
  'construction',
  'retail',
  'food',
  'restaurant',
  'healthcare',
  'transport',
  'property_services',
  'other'
);

/**
 * Översätter en gammal svensk branschtext till sin nyckel.
 *
 * Okänd text blir 'other'. Alternativet — att avbryta migrationen — hade
 * betytt att en enda annons med en handskriven bransch stoppar hela
 * driftsättningen, och 'other' är ett ärligt svar: vi vet inte vilken bransch
 * det var. Raderna loggas nedan så att ingen tyst tappas.
 */
create function private.industry_from_legacy(p_text text)
returns public.listing_industry
language sql
immutable
set search_path = ''
as $$
  select case trim(p_text)
    when 'IT och systemutveckling' then 'software'
    when 'E-handel' then 'ecommerce'
    when 'Konsult och tjänster' then 'consulting'
    when 'Ekonomi och redovisning' then 'accounting'
    when 'Tillverkning' then 'manufacturing'
    when 'Bygg och anläggning' then 'construction'
    when 'Detaljhandel' then 'retail'
    when 'Livsmedel' then 'food'
    when 'Restaurang och café' then 'restaurant'
    when 'Vård och hälsa' then 'healthcare'
    when 'Transport och logistik' then 'transport'
    when 'Fastighetsservice' then 'property_services'
    when 'Annan bransch' then 'other'
    -- Redan migrerad, eller skriven som nyckel från början.
    else coalesce(
      (select e.enumlabel::public.listing_industry
       from pg_enum e
       join pg_type t on t.oid = e.enumtypid
       where t.typname = 'listing_industry' and e.enumlabel = trim(p_text)),
      'other'
    )
  end::public.listing_industry
$$;

/**
 * Samma sak för en lista.
 *
 * Måste vara en funktion: ALTER COLUMN ... USING tar inte en underfråga, så
 * unnest/array_agg går inte att skriva direkt i uttrycket.
 */
create function private.industries_from_legacy(p_texts text[])
returns public.listing_industry[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(array_agg(distinct private.industry_from_legacy(x)), '{}')
  from unnest(coalesce(p_texts, '{}')) as x
$$;

-- Vad som inte gick att översätta. Syns i migrationsloggen.
do $$
declare
  v_okand text[];
begin
  select array_agg(distinct l.industry)
  into v_okand
  from public.listings l
  where private.industry_from_legacy(l.industry) = 'other'
    and trim(l.industry) not in ('Annan bransch', 'other');

  if v_okand is not null then
    raise warning 'Branscher utan motsvarighet, satta till other: %', v_okand;
  end if;
end;
$$;

-- Guard-triggern jämför fältvärden vid statusbyte och rörs inte av typbytet,
-- men vyer och policys som nämner kolumnen skulle blockera ALTER. Inga finns.
--
-- Längdkontrollen måste bort först: den anropar char_length() på kolumnen, och
-- den funktionen finns inte för en enum. Kontrollen behövs inte längre — en
-- enum kan bara innehålla ett värde ur listan, vilket är en strängare regel än
-- "mellan 1 och 80 tecken".
alter table public.listings drop constraint listings_industry_check;

alter table public.listings
  alter column industry drop default,
  alter column industry type public.listing_industry
    using private.industry_from_legacy(industry);

alter table public.listings
  alter column industry set default 'other';

-- Sparade sökningar bär samma värden.
alter table public.saved_searches
  alter column industries drop default,
  alter column industries type public.listing_industry[]
    using private.industries_from_legacy(industries);

alter table public.saved_searches
  alter column industries set default '{}';

comment on column public.listings.industry is
  'Branschnyckel. Översätts i gränssnittet via industry.<nyckel>. Aldrig en text.';
