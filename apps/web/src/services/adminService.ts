import type { CountryCode } from '@hansa/core';
import { supabase } from '../lib/supabase';
import type { ListingStatus } from './listingService';

// Granskning. Alla åtgärder går genom databasfunktioner som gör sin egen
// behörighetskontroll — klienten avgör bara vad som visas.

export interface ReviewListing {
  id: string;
  title: string;
  summary: string;
  description: string;
  industry: string;
  region: string;
  country: CountryCode;
  askingPriceMinor: number | null;
  revenueMinor: number | null;
  employees: number | null;
  foundedYear: number | null;
  status: ListingStatus;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    orgNumber: string;
    country: CountryCode;
    kind: 'company' | 'broker';
    verifiedAt: string | null;
  };
}

export async function amIAdmin(): Promise<boolean> {
  const { data, error } = await supabase().rpc('am_i_platform_admin');
  if (error) return false;
  return Boolean(data);
}

export async function fetchListingsForReview(status: ListingStatus = 'pending_review'): Promise<ReviewListing[]> {
  const { data, error } = await supabase()
    .from('listings')
    .select(
      `id, title, summary, description, industry, region, country, asking_price_minor,
       revenue_minor, employees, founded_year, status, created_at,
       organizations!inner(id, name, org_number, country, kind, verified_at)`
    )
    .eq('status', status)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => {
    const org = row.organizations as {
      id: string;
      name: string;
      org_number: string;
      country: string;
      kind: 'company' | 'broker';
      verified_at: string | null;
    };
    return {
      id: row.id as string,
      title: row.title as string,
      summary: row.summary as string,
      description: row.description as string,
      industry: row.industry as string,
      region: row.region as string,
      country: row.country as CountryCode,
      askingPriceMinor: (row.asking_price_minor as number | null) ?? null,
      revenueMinor: (row.revenue_minor as number | null) ?? null,
      employees: (row.employees as number | null) ?? null,
      foundedYear: (row.founded_year as number | null) ?? null,
      status: row.status as ListingStatus,
      createdAt: row.created_at as string,
      organization: {
        id: org.id,
        name: org.name,
        orgNumber: org.org_number,
        country: org.country as CountryCode,
        kind: org.kind,
        verifiedAt: org.verified_at,
      },
    };
  });
}

export async function verifyOrganization(organizationId: string, verified = true): Promise<void> {
  const { error } = await supabase().rpc('verify_organization', {
    p_organization: organizationId,
    p_verified: verified,
  });
  if (error) throw new Error(error.message);
}

export async function reviewListing(listingId: string, approve: boolean, note?: string): Promise<void> {
  const { error } = await supabase().rpc('review_listing', {
    p_listing: listingId,
    p_approve: approve,
    p_note: note && note.trim() ? note.trim() : undefined,
  });
  if (error) throw new Error(error.message);
}
