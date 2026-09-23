import { isCountryCode, type CountryCode } from '@hansa/core';
import { supabase } from '../lib/supabase';

// Vilka länder som är öppna.
//
// Svaret kommer ur `markets.launched` i databasen, aldrig ur en lista i en
// komponent. Sex komponenter hade var sin kopia av ['SE','NO','DK'], och en
// öppning av Kroatien hade krävt att alla sex hittades. Nu räcker en UPDATE.
//
// @hansa/core behåller alla fem länderna — valuta, moms, organisationsnummer.
// Kärnan vet vad ett land ÄR; databasen vet vilka som är öppna för handel.

export async function fetchLaunchedCountries(): Promise<CountryCode[]> {
  const { data, error } = await supabase()
    .from('markets')
    .select('country')
    .eq('launched', true)
    .order('display_order');

  if (error) throw new Error(error.message);

  // Ett land som inte finns i @hansa/core kan inte prissättas eller få sitt
  // organisationsnummer kontrollerat. Det faller bort här i stället för att
  // krascha i formateringen långt senare.
  return (data ?? [])
    .map((row) => (row as { country: unknown }).country)
    .filter(isCountryCode);
}
