import {
  isCountryCode,
  isCurrencyCode,
  isIndustry,
  type CountryCode,
  type CurrencyCode,
  type Industry,
} from '@hansa/core';
import { supabase } from '../lib/supabase';
import { toListing, type Listing } from './listingService';

// Bevakningar och matchning.
//
// Matchningsregeln ligger i databasen (`private.listing_matches_search`), inte
// här. Den här filen sparar kriterier och läser resultatet — den avgör aldrig
// själv vad som matchar. Två kopior av regeln hade glidit isär, och då hade
// köparen fått en notis om en annons som inte syns i listan.

export interface SavedSearch {
  id: string;
  name: string;
  countries: CountryCode[];
  industries: Industry[];
  /** Prisfiltret gäller BARA annonser i den här valutan. Se migrationen. */
  priceCurrency: CurrencyCode | null;
  minPriceMinor: number | null;
  maxPriceMinor: number | null;
  /** Om köparen vill få besked när nya annonser matchar. */
  notify: boolean;
  createdAt: string;
  /** Antal matchningar köparen inte öppnat än. */
  unseenCount: number;
  matchCount: number;
}

export interface NewSavedSearch {
  name: string;
  countries: CountryCode[];
  industries: Industry[];
  priceCurrency: CurrencyCode | null;
  minPriceMinor: number | null;
  maxPriceMinor: number | null;
  notify: boolean;
}

function toSavedSearch(row: Record<string, unknown>): SavedSearch {
  const matches = (row.search_matches ?? []) as Array<{ seen_at: string | null }>;
  return {
    id: row.id as string,
    name: row.name as string,
    countries: ((row.countries as string[]) ?? []).filter(isCountryCode),
    industries: ((row.industries as string[]) ?? []).filter(isIndustry),
    // Kolumnen är `text` i databasen. En okänd valuta ska inte bli en Money
    // längre fram — den faller bort här, där det syns.
    priceCurrency: isCurrencyCode(row.price_currency) ? row.price_currency : null,
    minPriceMinor: (row.min_price_minor as number | null) ?? null,
    maxPriceMinor: (row.max_price_minor as number | null) ?? null,
    notify: Boolean(row.notify),
    createdAt: row.created_at as string,
    matchCount: matches.length,
    unseenCount: matches.filter((match) => match.seen_at === null).length,
  };
}

export async function fetchSavedSearches(): Promise<SavedSearch[]> {
  const { data, error } = await supabase()
    .from('saved_searches')
    .select('id, name, countries, industries, price_currency, min_price_minor, max_price_minor, notify, created_at, search_matches(seen_at)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toSavedSearch(row as Record<string, unknown>));
}

/**
 * Sparar en bevakning. Matchningarna fylls på av databasen direkt, så köparen
 * ser sina träffar med en gång i stället för att möta en tom lista tills nästa
 * annons publiceras.
 */
export async function createSavedSearch(input: NewSavedSearch): Promise<string> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) throw new Error('Du måste vara inloggad');

  const { data, error } = await supabase()
    .from('saved_searches')
    .insert({
      user_id: auth.user.id,
      name: input.name.trim(),
      countries: input.countries,
      industries: input.industries,
      price_currency: input.priceCurrency,
      min_price_minor: input.minPriceMinor,
      max_price_minor: input.maxPriceMinor,
      notify: input.notify,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function updateSavedSearch(id: string, input: NewSavedSearch): Promise<void> {
  const { error } = await supabase()
    .from('saved_searches')
    .update({
      name: input.name.trim(),
      countries: input.countries,
      industries: input.industries,
      price_currency: input.priceCurrency,
      min_price_minor: input.minPriceMinor,
      max_price_minor: input.maxPriceMinor,
      notify: input.notify,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteSavedSearch(id: string): Promise<void> {
  const { error } = await supabase().from('saved_searches').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export interface SearchMatch {
  id: string;
  listing: Listing;
  matchedAt: string;
  seenAt: string | null;
}

/**
 * Annonserna som passerat en bevaknings filter.
 *
 * Sorterade på när de matchade, nyast först. Ingen relevanspoäng: en bevakning
 * är ett filter, och alla annonser som passerar det matchar lika mycket.
 * Betald exponering påverkar aldrig ordningen (docs/BUSINESS.md).
 */
export async function fetchMatches(savedSearchId: string): Promise<SearchMatch[]> {
  const { data, error } = await supabase()
    .from('search_matches')
    .select(
      `id, matched_at, seen_at,
       listings!inner(id, title, summary, description, industry, region, country, currency,
                      asking_price_minor, revenue_minor, employees, founded_year, is_demo, published_at)`
    )
    .eq('saved_search_id', savedSearchId)
    .order('matched_at', { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    matchedAt: row.matched_at as string,
    seenAt: (row.seen_at as string | null) ?? null,
    listing: toListing(row.listings as Record<string, unknown>),
  }));
}

/** Kvitterar matchningarna som lästa. Köparen ska inte se samma prick två gånger. */
export async function markMatchesSeen(savedSearchId: string): Promise<void> {
  const { error } = await supabase()
    .from('search_matches')
    .update({ seen_at: new Date().toISOString() })
    .eq('saved_search_id', savedSearchId)
    .is('seen_at', null);

  if (error) throw new Error(error.message);
}

/**
 * Räknar om en bevakning mot alla befintliga annonser.
 *
 * Behövs sällan — databasen fyller på själv vid publicering och när kriterier
 * ändras — men ger köparen ett sätt att kontrollera att bevakningen lever.
 */
export async function refreshSavedSearch(id: string): Promise<number> {
  const { data, error } = await supabase().rpc('refresh_saved_search', { p_search: id });
  if (error) throw new Error(error.message);
  return (data as number | null) ?? 0;
}
