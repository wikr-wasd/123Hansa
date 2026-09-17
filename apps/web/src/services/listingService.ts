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

/**
 * Formaterar ett belopp i annonsens eget land, aldrig i besökarens.
 *
 * Valutakoden skrivs ut, inte symbolen: SEK, NOK och DKK heter alla "kr", och i
 * en lista med annonser från tre länder är det vilseledande.
 */
export function formatListingAmount(amountMinor: number | null, country: CountryCode): string | null {
  if (amountMinor === null) return null;
  const currency = countryInfo(country).currency;
  return formatMoney(money(amountMinor, currency), intlLocaleFor(country), { currencyDisplay: 'code' });
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

// --- Säljarens sida ---------------------------------------------------------

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'sold'
  | 'withdrawn';

/** Nyckeln i ordboken, inte texten: statusen visas på användarens språk. */
export const LISTING_STATUS_KEYS: Record<ListingStatus, string> = {
  draft: 'status.draft',
  pending_review: 'status.pending_review',
  published: 'status.published',
  rejected: 'status.rejected',
  sold: 'status.sold',
  withdrawn: 'status.withdrawn',
};

export interface MyListing extends Listing {
  status: ListingStatus;
  organizationId: string;
  organizationName: string;
  organizationVerified: boolean;
  reviewNote: string | null;
  interestCount: number;
}

export interface NewListing {
  organizationId: string;
  country: CountryCode;
  title: string;
  summary: string;
  description: string;
  industry: string;
  region: string;
  askingPriceMinor: number | null;
  revenueMinor: number | null;
  employees: number | null;
  foundedYear: number | null;
}

/**
 * Annonser för de organisationer användaren är MEDLEM i.
 *
 * Filtreringen sker på medlemskapet, inte på vad radnivåpolicyn råkar släppa
 * igenom: en publicerad annons får alla läsa, och en köpare med accepterat
 * intresse får dessutom läsa säljarens organisation. Utan det här filtret såg
 * köparen säljarens annons som sin egen — och fick säljarens vy i datarummet.
 */
export async function fetchMyListings(): Promise<MyListing[]> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) return [];

  const { data: memberships, error: membershipError } = await supabase()
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', auth.user.id);

  if (membershipError) throw new Error(membershipError.message);

  const organizationIds = (memberships ?? []).map((row) => row.organization_id);
  if (organizationIds.length === 0) return [];

  const { data, error } = await supabase()
    .from('listings')
    .select(
      `${SELECTED_COLUMNS}, status, review_note, organization_id,
       organizations!inner(name, verified_at),
       listing_interests(count)`
    )
    .in('organization_id', organizationIds)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => {
    const organization = row.organizations as { name: string; verified_at: string | null };
    const interests = row.listing_interests as { count: number }[] | null;
    return {
      ...toListing(row as Partial<ListingRow>),
      status: row.status as ListingStatus,
      organizationId: row.organization_id as string,
      organizationName: organization?.name ?? '',
      organizationVerified: Boolean(organization?.verified_at),
      reviewNote: (row.review_note as string | null) ?? null,
      interestCount: interests?.[0]?.count ?? 0,
    };
  });
}

export async function createListing(input: NewListing): Promise<string> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) throw new Error('Du måste vara inloggad');

  const currency = countryInfo(input.country).currency;

  const { data, error } = await supabase()
    .from('listings')
    .insert({
      organization_id: input.organizationId,
      created_by: auth.user.id,
      country: input.country,
      currency,
      title: input.title.trim(),
      summary: input.summary.trim(),
      description: input.description.trim(),
      industry: input.industry.trim(),
      region: input.region.trim(),
      asking_price_minor: input.askingPriceMinor,
      revenue_minor: input.revenueMinor,
      employees: input.employees,
      founded_year: input.foundedYear,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

/** Skickar annonsen till granskning. Publiceringen görs av en administratör. */
export async function submitListingForReview(id: string): Promise<void> {
  const { error } = await supabase()
    .from('listings')
    .update({ status: 'pending_review' })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function withdrawListing(id: string): Promise<void> {
  const { error } = await supabase().from('listings').update({ status: 'withdrawn' }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markListingSold(id: string): Promise<void> {
  const { error } = await supabase().from('listings').update({ status: 'sold' }).eq('id', id);
  if (error) throw new Error(error.message);
}

export interface SentInterest {
  id: string;
  listingId: string;
  listingTitle: string;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  message: string;
  createdAt: string;
}

export const INTEREST_STATUS_KEYS: Record<SentInterest['status'], string> = {
  pending: 'status.pending',
  accepted: 'status.accepted',
  declined: 'status.declined',
  withdrawn: 'status.withdrawn',
};

/** Intresseanmälningar användaren själv har skickat. */
export async function fetchMyInterests(): Promise<SentInterest[]> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase()
    .from('listing_interests')
    .select('id, listing_id, status, message, created_at, listings!inner(title)')
    .eq('buyer_id', auth.user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    listingId: row.listing_id as string,
    listingTitle: (row.listings as { title: string })?.title ?? '',
    status: row.status as SentInterest['status'],
    message: row.message as string,
    createdAt: row.created_at as string,
  }));
}

export interface ReceivedInterest extends SentInterest {
  buyerId: string;
}

/** Intresseanmälningar på säljarens egna annonser. */
export async function fetchReceivedInterests(): Promise<ReceivedInterest[]> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase()
    .from('listing_interests')
    .select('id, listing_id, buyer_id, status, message, created_at, listings!inner(title)')
    .neq('buyer_id', auth.user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    listingId: row.listing_id as string,
    listingTitle: (row.listings as { title: string })?.title ?? '',
    buyerId: row.buyer_id as string,
    status: row.status as SentInterest['status'],
    message: row.message as string,
    createdAt: row.created_at as string,
  }));
}

export async function respondToInterest(id: string, accept: boolean): Promise<void> {
  const { error } = await supabase()
    .from('listing_interests')
    .update({ status: accept ? 'accepted' : 'declined' })
    .eq('id', id);

  if (error) throw new Error(error.message);
}
