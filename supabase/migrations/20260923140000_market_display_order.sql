-- Marknadstabellen blir det enda stället som avgör vilka länder som är öppna.
--
-- `markets.launched` har funnits sedan v1 och är redan rätt: SE, NO och DK är
-- true, HR och BA false. Ändå hårdkodade sex komponenter i webben samma lista
-- ['SE','NO','DK'] var för sig — registrering, annonsformulär, bevakningar,
-- annonsfiltret, värderingsräknaren och profilsidan. Sex listor som kan glida
-- isär, och en öppning av Kroatien hade krävt att alla sex hittades.
--
-- Med den här migrationen räcker det att sätta launched = true på HR för att
-- landet ska dyka upp överallt. Ingen kodändring, ingen ny release.
--
-- display_order tillkommer eftersom ordningen betyder något i ett formulär:
-- alfabetiskt hade gett DK, NO, SE, och hemmamarknaden hamnat sist. Den kan
-- inte härledas ur något annat i tabellen, så den får vara en egen kolumn.

alter table public.markets
  add column display_order smallint not null default 100;

comment on column public.markets.display_order is
  'Ordning i landsväljare. Lägst först. Alfabetisk ordning hade satt hemmamarknaden sist.';

update public.markets set display_order = 1 where country = 'SE';
update public.markets set display_order = 2 where country = 'NO';
update public.markets set display_order = 3 where country = 'DK';
update public.markets set display_order = 4 where country = 'HR';
update public.markets set display_order = 5 where country = 'BA';

-- Två länder får inte dela plats: då avgör databasens radordning, och den är
-- inte stabil. Samma sorts oavgjort som just kostade screeningen ett skydd.
create unique index markets_display_order_idx on public.markets (display_order);

-- Listan är öppen information och läses redan av anon (policyn markets_read
-- sedan v1). Inget nytt behöver släppas på.
