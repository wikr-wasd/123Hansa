-- Demodata för lokal utveckling.
--
-- Körs av `supabase db reset`. Innehåller BARA demoannonser: is_demo = true,
-- enligt beslutet i docs/OPEN-QUESTIONS.md fråga 7. De är märkta i
-- gränssnittet, går inte att kontakta och räknas aldrig in i statistik.
--
-- Beskrivningarna är avsiktligt torra. De tidigare mockannonserna lovade
-- "garanterade intäkter" och "marknadsledande" — påståenden ingen kan stå för.

insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-4000-8000-0000000000d0', 'demo@123hansa.se', '{"full_name": "123Hansa Demo"}')
on conflict (id) do nothing;

insert into public.organizations (id, kind, name, country, org_number, verified_at, created_by)
values ('00000000-0000-4000-8000-0000000000de', 'company', '123Hansa Demo AB', 'SE', '5560000000', now(),
        '00000000-0000-4000-8000-0000000000d0')
on conflict (id) do nothing;

insert into public.listings (
  organization_id, created_by, status, is_demo, country, currency,
  title, summary, description, industry, region,
  asking_price_minor, revenue_minor, employees, founded_year
) values
  ('00000000-0000-4000-8000-0000000000de', '00000000-0000-4000-8000-0000000000d0', 'published', true, 'SE', 'SEK',
   'IT-konsultbolag i Göteborg',
   'Tolv konsulter, långa kundrelationer, ägaren går i pension.',
   'Bolaget har arbetat med systemutveckling för industrikunder sedan 2009. Merparten av intäkterna kommer från ramavtal som löper över flera år. Ägaren vill trappa ned och kan stanna kvar under en överlämning.',
   'software', 'Göteborg', 1450000000, 3200000000, 12, 2009),

  ('00000000-0000-4000-8000-0000000000de', '00000000-0000-4000-8000-0000000000d0', 'published', true, 'SE', 'SEK',
   'Bageri med två butiker i Malmö',
   'Egen produktion, två butikslägen, personal som stannar kvar.',
   'Verksamheten består av ett produktionsbageri och två butiker i centrala Malmö. Lokalerna hyrs med avtal som löper till 2029. Säljs på grund av flytt utomlands.',
   'food', 'Malmö', 420000000, 1150000000, 9, 2014),

  ('00000000-0000-4000-8000-0000000000de', '00000000-0000-4000-8000-0000000000d0', 'published', true, 'NO', 'NOK',
   'Regnskapsbyrå i Bergen',
   'Etablert byrå med faste kunder i Hordaland.',
   'Byrået har omkring 140 løpende kunder, hovedsakelig små og mellomstore bedrifter. To autoriserte regnskapsførere følger med i overdragelsen. Eier ønsker å pensjonere seg innen et år.',
   'accounting', 'Bergen', 890000000, 1420000000, 6, 2004),

  ('00000000-0000-4000-8000-0000000000de', '00000000-0000-4000-8000-0000000000d0', 'published', true, 'DK', 'DKK',
   'Webshop inden for havemøbler',
   'Egen webshop med lager i Jylland og faste leverandøraftaler.',
   'Webshoppen har solgt havemøbler siden 2016 og har et indarbejdet varemærke i Danmark. Salget er sæsonbetonet med hovedparten af omsætningen i andet kvartal. Lager og domæne indgår i handlen.',
   'ecommerce', 'Vejle', 310000000, 940000000, 4, 2016),

  ('00000000-0000-4000-8000-0000000000de', '00000000-0000-4000-8000-0000000000d0', 'published', true, 'SE', 'SEK',
   'Städbolag med avtalskunder i Stockholm',
   'Kontorsstädning, huvudsakligen avtalskunder.',
   'Bolaget städar kontor och trapphus åt ett trettiotal fastighetsägare och företag i Stockholmsområdet. Avtalen löper tills vidare med tre månaders uppsägning. Personalen är tillsvidareanställd.',
   'property_services', 'Stockholm', 680000000, 2100000000, 22, 2011),

  ('00000000-0000-4000-8000-0000000000de', '00000000-0000-4000-8000-0000000000d0', 'published', true, 'SE', 'SEK',
   'Verkstad för tunga fordon i Örebro',
   'Egen fastighet ingår. Auktoriserad serviceverkstad.',
   'Verkstaden servar lastbilar och entreprenadmaskiner åt åkerier i Mellansverige. Fastigheten på 1 400 kvadratmeter ingår i försäljningen. Två av montörerna har varit anställda i över tio år.',
   -- 'Fordon och verkstad' fanns aldrig i branschlistan, utan var handskriven.
   -- Det säger något: taxonomin i core saknar fordonsservice. Se
   -- OPEN-QUESTIONS.md fråga 16. Tills vidare 'other', som är ärligt.
   'other', 'Örebro', 2250000000, 4100000000, 14, 1998);
