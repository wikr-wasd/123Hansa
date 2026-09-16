import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Meddelanden hör till en intresseanmälan och blir möjliga först när säljaren
// accepterat den. Regeln ligger i databasen: messages_insert kräver ett
// accepterat intresse, och en utomstående ser ingenting alls.

export interface Conversation {
  interestId: string;
  listingId: string;
  listingTitle: string;
  /** Är den inloggade köparen i den här konversationen? */
  iAmBuyer: boolean;
  counterpartName: string;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  interestId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

/**
 * Konversationer för den inloggade: accepterade intresseanmälningar, både de
 * hen skickat och de som kommit in på hens egna annonser.
 */
export async function fetchConversations(): Promise<Conversation[]> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase()
    .from('listing_interests')
    .select(
      `id, listing_id, buyer_id, created_at,
       listings!inner(title, organizations!inner(name)),
       profiles:buyer_id(full_name)`
    )
    .eq('status', 'accepted')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => {
    const listing = row.listings as { title: string; organizations?: { name: string } };
    const buyerProfile = row.profiles as { full_name: string } | null;
    const iAmBuyer = row.buyer_id === auth.user!.id;

    return {
      interestId: row.id as string,
      listingId: row.listing_id as string,
      listingTitle: listing?.title ?? '',
      iAmBuyer,
      // Köparen ser säljarens organisation, säljaren ser köparens namn. Ingen
      // e-postadress: kontaktuppgifter delas av parterna själva, inte av oss.
      counterpartName: iAmBuyer
        ? (listing?.organizations?.name ?? 'Säljaren')
        : (buyerProfile?.full_name?.trim() || 'Köparen'),
      lastMessageAt: null,
      createdAt: row.created_at as string,
    };
  });
}

export async function fetchMessages(interestId: string): Promise<Message[]> {
  const { data, error } = await supabase()
    .from('messages')
    .select('id, interest_id, sender_id, body, created_at')
    .eq('interest_id', interestId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    interestId: row.interest_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function sendMessage(interestId: string, body: string): Promise<Message> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) throw new Error('Du är inte inloggad');

  const { data, error } = await supabase()
    .from('messages')
    .insert({ interest_id: interestId, sender_id: auth.user.id, body: body.trim() })
    .select('id, interest_id, sender_id, body, created_at')
    .single();

  if (error) {
    if (error.code === '42501') {
      throw new Error('Meddelanden går att skicka först när säljaren accepterat intresseanmälan');
    }
    throw new Error(error.message);
  }

  return {
    id: data.id,
    interestId: data.interest_id,
    senderId: data.sender_id,
    body: data.body,
    createdAt: data.created_at,
  };
}

/**
 * Lyssnar på nya meddelanden i en konversation. Radnivåpolicyn gäller även här:
 * en utomstående får inga händelser, eftersom hen inte får läsa raderna.
 */
export function subscribeToMessages(
  interestId: string,
  onMessage: (message: Message) => void
): () => void {
  const channel: RealtimeChannel = supabase()
    .channel(`messages:${interestId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `interest_id=eq.${interestId}` },
      (payload) => {
        const row = payload.new as Record<string, unknown>;
        onMessage({
          id: row.id as string,
          interestId: row.interest_id as string,
          senderId: row.sender_id as string,
          body: row.body as string,
          createdAt: row.created_at as string,
        });
      }
    )
    .subscribe();

  return () => {
    supabase().removeChannel(channel);
  };
}
