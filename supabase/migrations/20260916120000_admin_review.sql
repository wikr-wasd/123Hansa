-- Granskning i gränssnittet.
--
-- public.platform_admins har inga policyer och går inte att läsa från klienten
-- — med flit: listan över vem som kan publicera och verifiera hör inte hemma i
-- en webbläsare. Men gränssnittet måste kunna fråga "är JAG administratör?" för
-- att veta om granskningsvyn ska visas.
--
-- Den här funktionen svarar bara på den frågan, och bara om den som frågar.
-- Den är UX, inte säkerhet: review_listing() och verify_organization() gör sin
-- egen kontroll, och radnivåpolicyerna står kvar oavsett vad klienten tror.

create function public.am_i_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_platform_admin()
$$;

revoke execute on function public.am_i_platform_admin() from public, anon;
grant execute on function public.am_i_platform_admin() to authenticated;

comment on function public.am_i_platform_admin() is
  'Svarar om den inloggade användaren är plattformsadministratör. Bara om sig själv.';
