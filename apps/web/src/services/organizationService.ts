import { countryInfo, validateOrgNumber, type CountryCode } from '@hansa/core';
import { supabase } from '../lib/supabase';

// Säljaren är en organisation, inte en person. Det täcker både ett bolag som
// säljer sig självt och en mäklarfirma med flera användare.

export interface Organization {
  id: string;
  name: string;
  country: CountryCode;
  orgNumber: string;
  kind: 'company' | 'broker';
  verifiedAt: string | null;
}

export interface NewOrganization {
  name: string;
  country: CountryCode;
  orgNumber: string;
  kind?: 'company' | 'broker';
}

/** Etiketten för organisationsnummer i landet: "Organisationsnummer", "CVR-nr" … */
export function organizationNumberLabel(country: CountryCode): string {
  return countryInfo(country).orgNumberLabel;
}

/**
 * Kontrollerar numret mot landets egen algoritm, med @hansa/core.
 * Returnerar null när numret duger, annars ett felmeddelande att visa.
 */
export function checkOrgNumber(orgNumber: string, country: CountryCode): string | null {
  const result = validateOrgNumber(orgNumber, country);
  if (result.valid) return null;
  return result.reason ?? `Numret ser inte ut som ett giltigt ${organizationNumberLabel(country).toLowerCase()}`;
}

export async function fetchMyOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase()
    .from('organizations')
    .select('id, name, country, org_number, kind, verified_at')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    country: row.country as CountryCode,
    orgNumber: row.org_number,
    kind: row.kind,
    verifiedAt: row.verified_at,
  }));
}

export async function createOrganization(input: NewOrganization): Promise<Organization> {
  const problem = checkOrgNumber(input.orgNumber, input.country);
  if (problem) throw new Error(problem);

  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) throw new Error('Du måste vara inloggad');

  const { data, error } = await supabase()
    .from('organizations')
    .insert({
      name: input.name.trim(),
      country: input.country,
      org_number: input.orgNumber.trim(),
      kind: input.kind ?? 'company',
      created_by: auth.user.id,
    })
    .select('id, name, country, org_number, kind, verified_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(
        `Det finns redan en organisation med det ${organizationNumberLabel(input.country).toLowerCase()}et`
      );
    }
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    country: data.country as CountryCode,
    orgNumber: data.org_number,
    kind: data.kind,
    verifiedAt: data.verified_at,
  };
}
