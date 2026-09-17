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

// --- Screening --------------------------------------------------------------
// Alla åtgärder går genom databasfunktioner som gör sin egen behörighets-
// kontroll. Underlaget för dataskyddet står i docs/PERSONUPPGIFTER.md.

export type ScreeningStatus = 'pending' | 'clear' | 'hit' | 'error';

export interface ScreeningCheck {
  id: string;
  subjectType: 'person' | 'organization';
  subjectId: string;
  searchedName: string;
  country: string | null;
  provider: string;
  status: ScreeningStatus;
  hitCount: number;
  checkedAt: string;
  /** Senaste beslutet, om någon tagit ställning. */
  decision: { outcome: 'cleared' | 'blocked'; reason: string; decidedAt: string } | null;
}

export async function fetchScreeningChecks(onlyOpen = true): Promise<ScreeningCheck[]> {
  let request = supabase()
    .from('screening_checks')
    .select('id, subject_type, subject_id, searched_name, country, provider, status, hit_count, checked_at, screening_decisions(outcome, reason, decided_at)')
    .order('checked_at', { ascending: false })
    .limit(100);

  if (onlyOpen) request = request.in('status', ['pending', 'hit', 'error']);

  const { data, error } = await request;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => {
    const decisions = (row.screening_decisions ?? []) as Array<{
      outcome: 'cleared' | 'blocked';
      reason: string;
      decided_at: string;
    }>;
    const latest = [...decisions].sort((a, b) => b.decided_at.localeCompare(a.decided_at))[0];

    return {
      id: row.id as string,
      subjectType: row.subject_type as 'person' | 'organization',
      subjectId: row.subject_id as string,
      searchedName: row.searched_name as string,
      country: (row.country as string | null) ?? null,
      provider: row.provider as string,
      status: row.status as ScreeningStatus,
      hitCount: (row.hit_count as number) ?? 0,
      checkedAt: row.checked_at as string,
      decision: latest
        ? { outcome: latest.outcome, reason: latest.reason, decidedAt: latest.decided_at }
        : null,
    };
  });
}

/**
 * Senaste avgörandet för ett subjekt: 'clear', 'hit', 'blocked', 'pending'
 * eller null om ingen kontroll gjorts. Räknas ut i databasen, inte här.
 */
export async function fetchScreeningState(
  subjectType: 'person' | 'organization',
  subjectId: string
): Promise<string | null> {
  const { data, error } = await supabase().rpc('screening_state', {
    p_subject_type: subjectType,
    p_subject_id: subjectId,
  });
  if (error) throw new Error(error.message);
  return (data as string | null) ?? null;
}

/** Granskarens beslut. Motiveringen är obligatorisk — databasen kräver den. */
export async function decideScreening(checkId: string, clear: boolean, reason: string): Promise<void> {
  const { error } = await supabase().rpc('decide_screening', {
    p_check: checkId,
    p_clear: clear,
    p_reason: reason,
  });
  if (error) throw new Error(error.message);
}

/** Begär en ny körning. Leverantören avgörs av serverfunktionen, inte av klienten. */
export async function runScreening(input: {
  subjectType: 'person' | 'organization';
  subjectId: string;
  name: string;
  country: string | null;
}): Promise<void> {
  const { error } = await supabase().functions.invoke('screening-run', { body: input });
  if (error) throw new Error(error.message);
}
