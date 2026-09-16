// Utlämning av ett dokument ur datarummet.
//
// Varför en serverfunktion och inte en direkt nedladdning från klienten:
// åtkomsten till due diligence-material ska loggas oföränderligt (CLAUDE.md
// regel 6). Om köparen kunde skapa sin egen länk mot Storage skulle loggen gå
// att kringgå — man hämtar filen utan att säga till.
//
// Ordningen här är därför:
//   1. record_document_access() körs SOM ANVÄNDAREN. Den kontrollerar att det
//      finns ett accepterat intresse OCH en accepterad aktuell avtalsversion,
//      loggar åtkomsten, och returnerar sökvägen. Saknas rätten kastar den.
//   2. Först därefter används tjänstenyckeln för att skapa en kortlivad länk.
//
// Tjänstenyckeln lämnar aldrig den här funktionen.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SIGNED_URL_SECONDS = 60;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Metoden stöds inte' }, 405);
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return json({ error: 'Du är inte inloggad' }, 401);
  }

  let documentId: string | undefined;
  try {
    documentId = (await request.json())?.documentId;
  } catch {
    return json({ error: 'Felaktig begäran' }, 400);
  }
  if (!documentId) {
    return json({ error: 'documentId saknas' }, 400);
  }

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Steg 1: som användaren. Kontrollerar rätten och skriver i loggen.
  const asUser = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: path, error } = await asUser.rpc('record_document_access', {
    p_document: documentId,
  });

  if (error) {
    // 42501 kommer ur funktionen när åtkomsten saknas.
    const denied = error.code === '42501' || /ingen åtkomst/i.test(error.message);
    return json(
      { error: denied ? 'Du har inte åtkomst till dokumentet' : error.message },
      denied ? 403 : 400
    );
  }
  if (!path) {
    return json({ error: 'Dokumentet finns inte' }, 404);
  }

  // Steg 2: kortlivad länk. Först nu används tjänstenyckeln.
  const asService = createClient(url, serviceKey);
  const { data: signed, error: signError } = await asService.storage
    .from('dataroom')
    .createSignedUrl(path, SIGNED_URL_SECONDS);

  if (signError || !signed) {
    return json({ error: signError?.message ?? 'Länken kunde inte skapas' }, 500);
  }

  // Bara sökvägen tillbaka, inte hela adressen: inifrån containern heter
  // Supabase "kong:8000", vilket ingen webbläsare kan nå. Klienten sätter sin
  // egen bas, som skiljer sig mellan lokalt, preview och produktion.
  const signedPath = new URL(signed.signedUrl).pathname + new URL(signed.signedUrl).search;

  return json({ path: signedPath, expiresInSeconds: SIGNED_URL_SECONDS });
});
