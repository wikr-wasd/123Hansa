-- Åtkomstloggen ska gå att läsa som "vem", inte bara "vilket id".
--
-- user_id pekade bara på auth.users, som API:t inte når. Säljaren såg alltså en
-- lista med uuid:n i stället för namn. Nyckeln till public.profiles är sann
-- redan — profiles.id ÄR auth.users.id — den behövde bara skrivas ut.
--
-- on delete restrict med flit: en loggpost får inte försvinna för att ett konto
-- tas bort. Hur radering av konton ska hanteras när loggen måste bevaras är en
-- fråga för docs/PERSONUPPGIFTER.md.

alter table public.document_access_log
  add constraint document_access_log_user_profile_fkey
  foreign key (user_id) references public.profiles (id) on delete restrict;

alter table public.dataroom_documents
  add constraint dataroom_documents_uploader_profile_fkey
  foreign key (uploaded_by) references public.profiles (id) on delete restrict;
