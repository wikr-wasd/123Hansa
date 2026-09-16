-- Verifiering av organisationer, och när den måste vara gjord.
--
-- Version 1 krävde att organisationen var verifierad innan annonsen fick skickas
-- till granskning. Det går inte ihop med hur arbetet faktiskt utförs: det är
-- granskaren som kontrollerar organisationsnumret. Säljaren hamnade i ett läge
-- där ingenting kunde hända förrän någon annan gjort något, utan att kunna be om
-- det.
--
-- Nu gäller i stället: vem som helst får skicka in en annons för granskning, men
-- den kan inte PUBLICERAS förrän organisationen är verifierad. Kravet ligger
-- kvar, men på rätt ställe.
--
-- Organisationsnumret valideras med validateOrgNumber() i @hansa/core mot rätt
-- lands algoritm. Databasen dubblerar inte den logiken (CLAUDE.md regel 3) —
-- den ser till att bara en administratör kan sätta verified_at.

create or replace function private.guard_listing()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_launched boolean;
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

  return new;
end;
$$;

-- Kravet på verifierad organisation flyttat hit: en annons kan inte publiceras
-- från en organisation som ingen kontrollerat.
create or replace function public.review_listing(p_listing uuid, p_approve boolean, p_note text default null)
returns public.listing_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.listing_status;
  v_verified timestamptz;
begin
  if not private.is_platform_admin() then
    raise exception 'Bara administratörer kan granska annonser' using errcode = '42501';
  end if;

  if p_approve then
    select o.verified_at into v_verified
    from public.listings l
    join public.organizations o on o.id = l.organization_id
    where l.id = p_listing;

    if v_verified is null then
      raise exception 'Organisationen måste vara verifierad innan annonsen publiceras'
        using errcode = 'P0001';
    end if;
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

-- Administratörens verifiering. Numret ska vara kontrollerat med
-- validateOrgNumber() ur @hansa/core innan den här anropas.
create function public.verify_organization(p_organization uuid, p_verified boolean default true)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_verified_at timestamptz;
begin
  if not private.is_platform_admin() then
    raise exception 'Bara administratörer kan verifiera organisationer' using errcode = '42501';
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

revoke execute on function public.verify_organization(uuid, boolean) from public, anon;
grant execute on function public.verify_organization(uuid, boolean) to authenticated;
