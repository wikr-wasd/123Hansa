import { supabase } from '../lib/supabase';

// Datarummet är det känsligaste vi lagrar (CLAUDE.md regel 6). Åtkomst kräver
// accepterat intresse OCH accepterad aktuell version av sekretessavtalet, och
// varje öppnat dokument loggas oföränderligt.
//
// Nedladdningen går genom serverfunktionen dataroom-download, som loggar först
// och skapar länken sedan. Skulle klienten skapa länken själv gick loggen att
// kringgå.

export interface DataroomDocument {
  id: string;
  listingId: string;
  name: string;
  storagePath: string;
  sizeBytes: number | null;
  createdAt: string;
}

export interface ListingNda {
  id: string;
  listingId: string;
  version: number;
  body: string;
  createdAt: string;
}

export interface AccessLogEntry {
  id: number;
  documentId: string;
  documentName: string;
  userId: string;
  userName: string;
  accessedAt: string;
}

export async function fetchDocuments(listingId: string): Promise<DataroomDocument[]> {
  const { data, error } = await supabase()
    .from('dataroom_documents')
    .select('id, listing_id, name, storage_path, size_bytes, created_at')
    .eq('listing_id', listingId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    listingId: row.listing_id,
    name: row.name,
    storagePath: row.storage_path,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
  }));
}

/** Senaste versionen av annonsens sekretessavtal, eller null om inget finns. */
export async function fetchCurrentNda(listingId: string): Promise<ListingNda | null> {
  const { data, error } = await supabase()
    .from('listing_ndas')
    .select('id, listing_id, version, body, created_at')
    .eq('listing_id', listingId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    listingId: data.listing_id,
    version: data.version,
    body: data.body,
    createdAt: data.created_at,
  };
}

export async function hasAcceptedNda(ndaId: string): Promise<boolean> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) return false;

  const { data, error } = await supabase()
    .from('nda_acceptances')
    .select('id')
    .eq('nda_id', ndaId)
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}

/** Accepterar avtalet. Accepterandet kan sedan varken ändras eller raderas. */
export async function acceptNda(ndaId: string): Promise<void> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) throw new Error('Du är inte inloggad');

  const { error } = await supabase()
    .from('nda_acceptances')
    .insert({ nda_id: ndaId, user_id: auth.user.id });

  if (error) {
    if (error.code === '23505') return; // redan accepterat
    if (error.code === '42501') {
      throw new Error('Avtalet kan accepteras först när säljaren gått vidare med din intresseanmälan');
    }
    throw new Error(error.message);
  }
}

export async function publishNda(listingId: string, body: string): Promise<void> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) throw new Error('Du är inte inloggad');

  const { error } = await supabase()
    .from('listing_ndas')
    .insert({ listing_id: listingId, body: body.trim(), created_by: auth.user.id, version: 1 });

  if (error) throw new Error(error.message);
}

export async function uploadDocument(listingId: string, file: File): Promise<void> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) throw new Error('Du är inte inloggad');

  // Sökvägen måste börja med annonsens id — databasen kräver det, och
  // lagringens policy kontrollerar detsamma.
  const safeName = file.name.replace(/[^\w.\-() åäöÅÄÖ]/g, '_');
  const path = `${listingId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase().storage.from('dataroom').upload(path, file, {
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase().from('dataroom_documents').insert({
    listing_id: listingId,
    name: file.name.slice(0, 255),
    storage_path: path,
    size_bytes: file.size,
    uploaded_by: auth.user.id,
  });

  if (error) {
    // Rader och filer ska inte glida isär: städa upp filen om raden föll.
    await supabase().storage.from('dataroom').remove([path]);
    throw new Error(error.message);
  }
}

export async function removeDocument(documentId: string): Promise<void> {
  const { error } = await supabase()
    .from('dataroom_documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', documentId);

  if (error) throw new Error(error.message);
}

/**
 * Hämtar en kortlivad länk till dokumentet. Serverfunktionen loggar åtkomsten
 * innan länken skapas — det är hela poängen med att gå den vägen.
 */
export async function requestDownloadUrl(documentId: string): Promise<string> {
  const { data: session } = await supabase().auth.getSession();
  if (!session.session) throw new Error('Du är inte inloggad');

  const { data, error } = await supabase().functions.invoke<{ path: string; error?: string }>(
    'dataroom-download',
    { body: { documentId } }
  );

  if (error) {
    throw new Error('Dokumentet kunde inte hämtas: ' + error.message);
  }
  if (!data?.path) {
    throw new Error(data?.error ?? 'Dokumentet kunde inte hämtas');
  }

  // Funktionen returnerar sökvägen, inte adressen — den skiljer sig mellan
  // lokalt, preview och produktion, och inifrån containern heter Supabase
  // något som ingen webbläsare kan nå.
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  return `${base.replace(/\/$/, '')}${data.path}`;
}

export async function fetchAccessLog(listingId: string): Promise<AccessLogEntry[]> {
  const { data, error } = await supabase()
    .from('document_access_log')
    .select('id, document_id, user_id, accessed_at, dataroom_documents!inner(name, listing_id), profiles:user_id(full_name)')
    .eq('dataroom_documents.listing_id', listingId)
    .order('accessed_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as number,
    documentId: row.document_id as string,
    documentName: (row.dataroom_documents as { name: string })?.name ?? '',
    userId: row.user_id as string,
    userName: (row.profiles as { full_name: string } | null)?.full_name?.trim() || 'Okänd användare',
    accessedAt: row.accessed_at as string,
  }));
}
