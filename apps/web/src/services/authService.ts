import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Inloggning via Supabase Auth. Ersätter det tidigare skalet, där
// /api/auth bara svarade "Auth API endpoint is working" och testinloggningen
// jämförde lösenord i klientkoden.

export type CountryCode = 'SE' | 'NO' | 'DK';
export type LocaleCode = 'sv' | 'no' | 'da' | 'bs' | 'en';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: CountryCode | null;
  language: LocaleCode;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: CountryCode;
  language: LocaleCode;
  acceptTerms: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

async function toUser(authUser: SupabaseUser): Promise<User> {
  const metadata = authUser.user_metadata ?? {};
  const fromMetadata = splitName(String(metadata.full_name ?? ''));

  // Profilen ligger i databasen och skyddas av radnivåpolicy: bara den egna
  // raden går att läsa.
  const { data: profile } = await supabase()
    .from('profiles')
    .select('full_name, country, locale')
    .eq('id', authUser.id)
    .maybeSingle();

  const name = profile?.full_name ? splitName(profile.full_name) : fromMetadata;

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    firstName: String(metadata.first_name ?? name.firstName),
    lastName: String(metadata.last_name ?? name.lastName),
    country: (profile?.country as CountryCode | null) ?? null,
    language: (profile?.locale as LocaleCode) ?? 'sv',
    isEmailVerified: Boolean(authUser.email_confirmed_at),
    createdAt: authUser.created_at,
  };
}

export const authService = {
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase().auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase().auth.getUser();
    if (error || !data.user) return null;
    return toUser(data.user);
  },

  async login({ email, password }: LoginRequest): Promise<User> {
    const { data, error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) throw new Error(translateAuthError(error.message));
    return toUser(data.user);
  },

  async register(request: RegisterRequest): Promise<{ user: User | null; needsConfirmation: boolean }> {
    const fullName = `${request.firstName} ${request.lastName}`.trim();
    const { data, error } = await supabase().auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: {
          full_name: fullName,
          first_name: request.firstName,
          last_name: request.lastName,
          country: request.country,
          locale: request.language,
        },
      },
    });
    if (error) throw new Error(translateAuthError(error.message));

    // Landet och språket hör hemma på profilen, inte bara i metadata.
    if (data.user && data.session) {
      await supabase()
        .from('profiles')
        .update({ full_name: fullName, country: request.country, locale: request.language })
        .eq('id', data.user.id);
    }

    return {
      user: data.user ? await toUser(data.user) : null,
      needsConfirmation: !data.session,
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase().auth.signOut();
    if (error) throw error;
  },

  async updateProfile(update: { firstName: string; lastName: string; country: CountryCode; language: LocaleCode }) {
    const fullName = `${update.firstName} ${update.lastName}`.trim();
    const { data: sessionData } = await supabase().auth.getUser();
    if (!sessionData.user) throw new Error('Du är inte inloggad');

    const { error } = await supabase()
      .from('profiles')
      .update({ full_name: fullName, country: update.country, locale: update.language })
      .eq('id', sessionData.user.id);
    if (error) throw error;

    await supabase().auth.updateUser({
      data: { full_name: fullName, first_name: update.firstName, last_name: update.lastName },
    });
  },

  onAuthChange(callback: (user: User | null) => void) {
    const { data } = supabase().auth.onAuthStateChange(async (_event, session) => {
      callback(session?.user ? await toUser(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  },
};

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'Fel e-postadress eller lösenord';
  if (normalized.includes('email not confirmed')) return 'Bekräfta din e-postadress först';
  if (normalized.includes('user already registered')) return 'Det finns redan ett konto med den e-postadressen';
  if (normalized.includes('password should be at least')) return 'Lösenordet är för kort';
  if (normalized.includes('rate limit')) return 'För många försök. Vänta en stund och försök igen';
  return message;
}
