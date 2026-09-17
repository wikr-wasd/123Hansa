// Kör en screening av en person eller en organisation.
//
// Leverantören är INTE vald (docs/OPEN-QUESTIONS.md). Därför ligger anropet
// bakom ett gränssnitt med en enda implementation i dag: `manual`, som inte
// frågar någon utomstående utan registrerar ärendet för mänsklig kontroll.
//
// Det är avsiktligt. Alternativet — att vänta med hela flödet tills en
// leverantör är upphandlad — hade betytt att screeningen byggs sist, av någon
// som har bråttom, i en kodbas där användarmodellen redan antagit att den inte
// finns.
//
// ⚠️ Innan en riktig leverantör kopplas in:
//   1. DPIA enligt docs/PERSONUPPGIFTER.md, med jurist
//   2. Biträdesavtal, och kontroll av var leverantören behandlar uppgifterna
//   3. Adverse media AVSTÄNGT tills artikel 10 är utredd
//   4. Information till de registrerade i integritetspolicyn

import { createClient } from 'jsr:@supabase/supabase-js@2';

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

type SubjectType = 'person' | 'organization';
type ScreeningStatus = 'pending' | 'clear' | 'hit' | 'error';

interface ScreeningRequest {
  subjectType: SubjectType;
  subjectId: string;
  name: string;
  country: string | null;
}

interface ScreeningResult {
  provider: string;
  status: ScreeningStatus;
  hitCount: number;
  raw: unknown;
}

/** Gränssnittet varje leverantör ska uppfylla. */
type ScreeningProvider = (request: ScreeningRequest) => Promise<ScreeningResult>;

/**
 * Manuell kontroll. Frågar ingen, påstår ingenting, och lämnar ärendet i
 * 'pending' så att en människa tar ställning.
 *
 * Den här svarar ALDRIG 'clear'. En kontroll som säger "inget att anmärka" utan
 * att ha frågat någon är värre än ingen kontroll alls: den ser ut som ett bevis.
 */
const manualProvider: ScreeningProvider = (request) =>
  Promise.resolve({
    provider: 'manual',
    status: 'pending',
    hitCount: 0,
    raw: {
      note: 'Ingen extern leverantör är vald. Kontrollen väntar på manuell granskning.',
      subject: request.name,
      country: request.country,
      requestedAt: new Date().toISOString(),
    },
  });

const providers: Record<string, ScreeningProvider> = {
  manual: manualProvider,
};

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Metoden stöds inte' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization) return json({ error: 'Du är inte inloggad' }, 401);

  let body: ScreeningRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Felaktig begäran' }, 400);
  }

  if (!body?.subjectId || !body?.name || !body?.subjectType) {
    return json({ error: 'subjectType, subjectId och name krävs' }, 400);
  }

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Bara administratörer får begära en körning. Kontrollen görs av databasen,
  // som användaren — inte av den här funktionen.
  const asUser = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: isAdmin, error: adminError } = await asUser.rpc('am_i_platform_admin');
  if (adminError || !isAdmin) {
    return json({ error: 'Bara administratörer kan begära en screening' }, 403);
  }

  const providerName = Deno.env.get('SCREENING_PROVIDER') ?? 'manual';
  const provider = providers[providerName];
  if (!provider) {
    return json({ error: `Okänd screeningleverantör: ${providerName}` }, 500);
  }

  let result: ScreeningResult;
  try {
    result = await provider(body);
  } catch (error) {
    // Ett fel hos leverantören får inte se ut som ett rent resultat.
    result = {
      provider: providerName,
      status: 'error',
      hitCount: 0,
      raw: { message: error instanceof Error ? error.message : String(error) },
    };
  }

  const asService = createClient(url, serviceKey);
  const { data: checkId, error } = await asService.rpc('record_screening_check', {
    p_subject_type: body.subjectType,
    p_subject_id: body.subjectId,
    p_searched_name: body.name,
    p_country: body.country,
    p_provider: result.provider,
    p_status: result.status,
    p_hit_count: result.hitCount,
    p_raw: result.raw,
  });

  if (error) return json({ error: error.message }, 500);

  return json({ checkId, status: result.status, hitCount: result.hitCount });
});
