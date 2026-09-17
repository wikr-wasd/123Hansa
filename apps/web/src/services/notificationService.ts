import { supabase } from '../lib/supabase';

// Notiserna räknas fram ur det som redan finns: intresseanmälningar, svaren på
// dem, annonsernas status och meddelanden. Ingen egen tabell, och därmed inget
// som kan säga något annat än vad som faktiskt hänt.
//
// Sidan visade tidigare påhittade notiser om bud på 8,5 miljoner och mottagen
// handpenning.

export type NotificationKind =
  | 'interest-received'
  | 'interest-accepted'
  | 'interest-declined'
  | 'listing-published'
  | 'listing-rejected'
  | 'message-received';

export interface Notification {
  id: string;
  kind: NotificationKind;
  /** Annonsens rubrik, som notisen handlar om. */
  subject: string;
  at: string;
  /** Vart användaren ska när hen klickar. */
  href: string;
}

const LIMIT = 50;

export async function fetchNotifications(): Promise<Notification[]> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) return [];
  const me = auth.user.id;

  const notifications: Notification[] = [];

  // Egna annonser som granskats
  const { data: myListings } = await supabase()
    .from('listings')
    .select('id, title, status, published_at, updated_at, organization_id')
    .in('status', ['published', 'rejected'])
    .order('updated_at', { ascending: false })
    .limit(LIMIT);

  const { data: memberships } = await supabase()
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', me);
  const myOrgIds = new Set((memberships ?? []).map((row) => row.organization_id));

  for (const listing of myListings ?? []) {
    if (!myOrgIds.has(listing.organization_id)) continue;
    notifications.push({
      id: `listing-${listing.id}-${listing.status}`,
      kind: listing.status === 'published' ? 'listing-published' : 'listing-rejected',
      subject: listing.title,
      at: listing.published_at ?? listing.updated_at,
      href: '/dashboard',
    });
  }

  // Intresseanmälningar: mottagna på mina annonser, och svar på mina egna
  const { data: interests } = await supabase()
    .from('listing_interests')
    .select('id, listing_id, buyer_id, status, created_at, updated_at, listings!inner(title)')
    .order('updated_at', { ascending: false })
    .limit(LIMIT);

  for (const row of (interests ?? []) as unknown as Array<Record<string, unknown>>) {
    const title = (row.listings as { title: string })?.title ?? '';
    const isMine = row.buyer_id === me;

    if (!isMine) {
      notifications.push({
        id: `interest-in-${row.id}`,
        kind: 'interest-received',
        subject: title,
        at: row.created_at as string,
        href: '/dashboard',
      });
    } else if (row.status === 'accepted' || row.status === 'declined') {
      notifications.push({
        id: `interest-out-${row.id}-${row.status}`,
        kind: row.status === 'accepted' ? 'interest-accepted' : 'interest-declined',
        subject: title,
        at: (row.updated_at as string) ?? (row.created_at as string),
        href: row.status === 'accepted' ? `/messages?samtal=${row.id}` : '/dashboard',
      });
    }
  }

  // Meddelanden från motparten
  const { data: messages } = await supabase()
    .from('messages')
    .select('id, interest_id, sender_id, created_at, listing_interests!inner(listing_id, listings!inner(title))')
    .neq('sender_id', me)
    .order('created_at', { ascending: false })
    .limit(LIMIT);

  for (const row of (messages ?? []) as unknown as Array<Record<string, unknown>>) {
    const interest = row.listing_interests as { listings?: { title: string } };
    notifications.push({
      id: `message-${row.id}`,
      kind: 'message-received',
      subject: interest?.listings?.title ?? '',
      at: row.created_at as string,
      href: `/messages?samtal=${row.interest_id}`,
    });
  }

  return notifications
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, LIMIT);
}
