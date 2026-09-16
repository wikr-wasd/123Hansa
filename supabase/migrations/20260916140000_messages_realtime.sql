-- Meddelanden i realtid.
--
-- Realtid var det enda skälet att behålla en långlivad Express-process
-- (docs/OPEN-QUESTIONS.md fråga 9). Supabase skickar ändringar till klienten
-- via publikationen supabase_realtime, och radnivåpolicyn gäller även där:
-- klienten får bara händelser för rader den ändå hade fått läsa.

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.listing_interests;

-- Utan detta skickas bara primärnyckeln vid UPDATE och DELETE, och mottagaren
-- kan inte avgöra vilken konversation ändringen gäller.
alter table public.listing_interests replica identity full;

-- Parterna ska se vem de talar med.
--
-- profiles gick bara att läsa om sig själv, så säljaren såg "Köparen" och
-- köparen såg organisationens namn men ingen person. Efter en ACCEPTERAD
-- intresseanmälan öppnas motpartens profil — namn, land och språk, ingenting
-- annat. E-postadressen delar parterna själva om de vill, den ligger i
-- auth.users och går fortfarande inte att läsa.

create function private.shares_accepted_interest(p_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    -- Säljaren läser köparens profil
    select 1
    from public.listing_interests i
    where i.status = 'accepted'
      and i.buyer_id = p_profile
      and private.is_listing_member(i.listing_id)
  ) or exists (
    -- Köparen läser profilen för dem som äger annonsen
    select 1
    from public.listing_interests i
    join public.organization_members m on m.organization_id = (
      select l.organization_id from public.listings l where l.id = i.listing_id
    )
    where i.status = 'accepted'
      and i.buyer_id = auth.uid()
      and m.user_id = p_profile
  )
$$;

grant execute on function private.shares_accepted_interest(uuid) to authenticated;

create policy profiles_read_counterpart on public.profiles
  for select to authenticated
  using (private.shares_accepted_interest(id));

-- Koppling till profilen, inte bara till auth.users.
--
-- buyer_id pekade bara på auth.users, som API:t inte når. Utan en relation till
-- public.profiles gick köparens namn inte att hämta i samma fråga, och säljaren
-- såg bara "Köparen". profiles.id ÄR auth.users.id, så nyckeln är sann redan i
-- dag — den behövde bara skrivas ut.

alter table public.listing_interests
  add constraint listing_interests_buyer_profile_fkey
  foreign key (buyer_id) references public.profiles (id) on delete cascade;

alter table public.messages
  add constraint messages_sender_profile_fkey
  foreign key (sender_id) references public.profiles (id) on delete cascade;

-- Köparen ska se vem hen talar med, men först efter ett accepterat intresse.
--
-- Annonsen är anonym med flit: vem som säljer sitt bolag är känsligt, och en
-- konkurrent ska inte kunna läsa av det ur annonslistan. Men när säljaren väl
-- valt att gå vidare med en köpare är motpartens identitet hela poängen.

create function private.has_accepted_interest_in_org(p_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.listing_interests i
    join public.listings l on l.id = i.listing_id
    where l.organization_id = p_organization
      and i.buyer_id = auth.uid()
      and i.status = 'accepted'
  )
$$;

grant execute on function private.has_accepted_interest_in_org(uuid) to authenticated;

create policy organizations_read_counterpart on public.organizations
  for select to authenticated
  using (private.has_accepted_interest_in_org(id));
