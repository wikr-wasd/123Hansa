import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Supabase är backend (docs/OPEN-QUESTIONS.md fråga 9). Nycklarna sätts per
// miljö i Vercel, aldrig i repot. Den publika nyckeln är publik med flit:
// åtkomsten avgörs av radnivåpolicyerna i databasen, inte av nyckeln.

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

export const missingConfigMessage =
  'Databasen är inte konfigurerad. Sätt VITE_SUPABASE_URL och VITE_SUPABASE_ANON_KEY.';

let client: SupabaseClient<Database> | null = null;

/**
 * Klienten. Kastar om miljövariablerna saknas — hellre ett tydligt fel än en
 * sida som tyst visar noll annonser och ser ut som en tom marknadsplats.
 */
export function supabase(): SupabaseClient<Database> {
  if (!isSupabaseConfigured) {
    throw new Error(missingConfigMessage);
  }
  if (!client) {
    client = createClient<Database>(url as string, publishableKey as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}
