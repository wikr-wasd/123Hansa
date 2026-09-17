-- Screeningläget till granskningsvyn.
--
-- Läget räknas ut på ETT ställe: private.screening_state(). Granskningsvyn ska
-- inte hämta alla kontroller och härleda läget i React — två uträkningar av
-- "senaste beslutet väger tyngst" glider isär, och den som glider är den som
-- visar "godkänd" för en organisation databasen vägrar verifiera.
--
-- Funktionen ligger i public bara för att PostgREST inte når private. Den gör
-- ingenting utöver att kontrollera behörigheten och anropa originalet.

create function public.screening_state(
  p_subject_type public.screening_subject,
  p_subject_id uuid
)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_platform_admin() then
    raise exception 'Bara administratörer kan läsa screeningläget' using errcode = '42501';
  end if;
  return private.screening_state(p_subject_type, p_subject_id);
end;
$$;

revoke execute on function public.screening_state(public.screening_subject, uuid) from public, anon;
grant execute on function public.screening_state(public.screening_subject, uuid) to authenticated;

comment on function public.screening_state(public.screening_subject, uuid) is
  'Senaste screeningavgörandet för ett subjekt. Endast administratörer.';
