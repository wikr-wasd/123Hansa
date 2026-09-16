import {
  countryInfo,
  formatMoney,
  intlLocaleFor,
  isCountryCode,
  money,
  type CountryCode,
} from '@hansa/core';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

// Annonser hämtas från databasen. Tidigare låg de som mockListings i fyra
// komponenter och två serverfunktioner (docs/TODO.md, fas 2).

type ListingRow = Database['public']['Tables']['listings']['Row'];

export interface Listing {
  id: string;
  title: string;
  summary: string;
  description: string;
  industry: string;
  region: string;
  country: CountryCode;
  /** Heltal i minsta enhet. null betyder "pris på begäran". */
  askingPriceMinor: number | null;
  revenueMinor: number | null;
  employees: number | null;
  foundedYear: number | null;
  /** Demoannons: märks i gränssnittet och går inte att kontakta. */
  isDemo: boolean;
  publishedAt: string | null;
}

export interface ListingFilters {
  query?: string;
  country?: CountryCode | 'ALL';
  industry?: string;
  limit?: number;
  offset?: number;
}

export interface ListingPage {
  listings: Listing[];
  total: number;
}

const SELECTED_COLUMNS =
  'id, title, summary, description, industry, region, country, currency, asking_price_minor, revenue_minor, employees, founded_year, is_demo, published_at';

function toListing(row: Partial<ListingRow>): Listing {
  const country = row.country;
  if (!isCountryCode(country)) {
    // Landet styr valuta, format och språk. Ett okänt land är ett datafel som
    // ska synas, inte tolkas bort till SEK.
    throw new Error(`Okänt land på annons ${row.id}: ${country}`);
  }
  return {
    id: row.id as string,
    title: row.title as string,
    summary: row.summary ?? '',
    description: row.description ?? '',
    industry: row.industry as string,
    region: row.region ?? '',
    country,
    askingPriceMinor: row.asking_price_minor ?? null,
    revenueMinor: row.revenue_minor ?? null,
    employees: row.employees ?? null,
    foundedYear: row.founded_year ?? null,
    isDemo: Boolean(row.is_demo),
    publishedAt: row.published_at ?? null,
  };
}

/** Formaterar ett belopp i annonsens eget land, aldrig i besökarens. */
export function formatListingAmount(amountMinor: number | null, country: CountryCode): string | null {
  if (amountMinor === null) return null;
  const currency = countryInfo(country).currency;
  return formatMoney(money(amountMinor, currency), intlLocaleFor(country));
}

export async function fetchListings(filters: ListingFilters = {}): Promise<ListingPage> {
  const { query, country, industry, limit = 24, offset = 0 } = filters;

  let request = supabase()
    .from('listings')
    .select(SELECTED_COLUMNS, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (country && country !== 'ALL') request = request.eq('country', country);
  if (industry) request = request.eq('industry', industry);
  if (query && query.trim()) {
    const term = `%${query.trim().replace(/[%_]/g, (match) => `\\${match}`)}%`;
    request = request.or(
      `title.ilike.${term},summary.ilike.${term},description.ilike.${term},industry.ilike.${term},region.ilike.${term}`
    );
  }

  const { data, error, count } = await request;
  if (error) throw new Error(error.message);

  return { listings: (data ?? []).map(toListing), total: count ?? 0 };
}

export async function fetchListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase()
    .from('listings')
    .select(SELECTED_COLUMNS)
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toListing(data) : null;
}

/** Branscher som faktiskt finns bland publicerade annonser. */
export async function fetchIndustries(): Promise<string[]> {
  const { data, error } = await supabase()
    .from('listings')
    .select('industry')
    .eq('status', 'published');

  if (error) throw new Error(error.message);
  return [...new Set((data ?? []).map((row) => row.industry))].sort((a, b) => a.localeCompare(b, 'sv'));
}

export interface InterestRequest {
  listingId: string;
  message: string;
}

export type InterestResult =
  | { ok: true }
  | { ok: false; reason: 'not-signed-in' | 'demo' | 'already-sent' | 'error'; message: string };

/**
 * Köparen visar intresse. Säljaren väljer sedan vem som går vidare.
 * Det är inte ett bud: plattformen är inte part i affären (docs/BUSINESS.md).
 */
export async function submitInterest({ listingId, message }: InterestRequest): Promise<InterestResult> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) {
    return { ok: false, reason: 'not-signed-in', message: 'Logga in för att visa intresse' };
  }

  const { error } = await supabase()
    .from('listing_interests')
    .insert({ listing_id: listingId, buyer_id: auth.user.id, message });

  if (!error) return { ok: true };

  if (error.code === '23505') {
    return { ok: false, reason: 'already-sent', message: 'Du har redan visat intresse för den här annonsen' };
  }
  if (error.code === '42501') {
    // Radnivåpolicyn stoppar demoannonser och säljarens egen annons.
    return {
      ok: false,
      reason: 'demo',
      message: 'Den här annonsen går inte att kontakta',
    };
  }
  return { ok: false, reason: 'error', message: error.message };
}
