import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import {
  amIAdmin,
  decideScreening,
  fetchScreeningChecks,
  type ScreeningCheck,
} from '../../services/adminService';
import { useAuthStore } from '../../stores/authStore';

// Granskarens vy för screeningträffar.
//
// Två regler styr sidan, och båda kommer ur docs/PERSONUPPGIFTER.md:
//
// 1. Beslutet fattas av en människa och måste motiveras. Ett automatiserat
//    beslut med rättslig följd faller under artikel 22 i GDPR.
// 2. Falska träffar är normalfallet. Namnlikhet är trubbigt, och den som
//    stoppas av en namnlikhet har rätt att bli bedömd av någon som läst.

const STATUS_TEXT: Record<ScreeningCheck['status'], string> = {
  pending: 'Väntar på granskning',
  hit: 'Träff',
  clear: 'Ingen anmärkning',
  error: 'Kontrollen misslyckades',
};

const STATUS_STYLE: Record<ScreeningCheck['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  hit: 'bg-red-100 text-red-800',
  clear: 'bg-green-100 text-green-800',
  error: 'bg-gray-100 text-gray-700',
};

const ScreeningPage: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checks, setChecks] = useState<ScreeningCheck[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }
    amIAdmin().then(setIsAdmin);
  }, [isAuthenticated, isAuthLoading]);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      setChecks(await fetchScreeningChecks(!showAll));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kontrollerna kunde inte hämtas');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, showAll]);

  useEffect(() => {
    if (isAdmin) load();
    else if (isAdmin === false) setIsLoading(false);
  }, [isAdmin, load]);

  const decide = async (check: ScreeningCheck, clear: boolean) => {
    const reason = (reasons[check.id] ?? '').trim();
    if (reason.length < 3) {
      toast.error('Beslutet måste motiveras');
      return;
    }
    setBusyId(check.id);
    try {
      await decideScreening(check.id, clear, reason);
      toast.success(clear ? 'Ärendet är rentvått' : 'Ärendet är blockerat');
      setReasons((current) => ({ ...current, [check.id]: '' }));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Beslutet kunde inte sparas');
    } finally {
      setBusyId(null);
    }
  };

  if (isAuthLoading || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <span>Kontrollerar behörighet…</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Screening</h1>
        <p className="mb-6 text-gray-600">
          Den här sidan är för plattformens granskare.{' '}
          {isAuthenticated ? 'Ditt konto har inte den behörigheten.' : 'Logga in för att fortsätta.'}
        </p>
        <Link to={isAuthenticated ? '/' : '/login'} className="font-medium text-blue-600 hover:text-blue-800">
          {isAuthenticated ? 'Till startsidan' : 'Till inloggningen'}
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Screening – 123Hansa</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <ShieldAlert className="h-6 w-6 text-blue-600" aria-hidden="true" />
              Screening
            </h1>
            <p className="mb-4 text-gray-600">
              Sanktions- och PEP-kontroller som väntar på ett beslut. Ett ärende som ingen tagit
              ställning till stoppar verifiering och publicering.
            </p>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(event) => setShowAll(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              Visa även avgjorda ärenden
            </label>
          </div>
        </header>

        <main className="mx-auto max-w-4xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Ingen leverantör är vald.</strong> Kontrollerna registreras som{' '}
            <code className="rounded bg-white px-1">manual</code> och säger ingenting om
            sanktionslistor — de väntar på att en människa kontrollerar. Innan en extern leverantör
            kopplas in krävs konsekvensbedömning och biträdesavtal, se{' '}
            <code className="rounded bg-white px-1">docs/PERSONUPPGIFTER.md</code>.
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-16 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <span>Hämtar kontroller…</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6" role="alert">
              <p className="mb-3 flex items-center gap-2 font-semibold text-red-800">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                {error}
              </p>
              <button
                type="button"
                onClick={load}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
              >
                Försök igen
              </button>
            </div>
          )}

          {!isLoading && !error && checks.length === 0 && (
            <p className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600">
              Inga kontroller att ta ställning till.
            </p>
          )}

          {!isLoading &&
            !error &&
            checks.map((check) => {
              const isBusy = busyId === check.id;
              const decided = check.decision !== null;

              return (
                <article key={check.id} className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[check.status]}`}
                    >
                      {STATUS_TEXT[check.status]}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                      {check.subjectType === 'person' ? 'Person' : 'Organisation'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(check.checkedAt).toLocaleString('sv-SE', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}{' '}
                      · {check.provider}
                    </span>
                  </div>

                  <h2 className="mb-1 text-lg font-semibold text-gray-900">{check.searchedName}</h2>
                  <p className="mb-4 text-sm text-gray-600">
                    {check.country ? `${check.country} · ` : ''}
                    {check.hitCount} {check.hitCount === 1 ? 'träff' : 'träffar'}
                  </p>

                  {decided ? (
                    <div className="rounded-lg bg-gray-50 p-4 text-sm">
                      <p className="mb-1 font-semibold text-gray-900">
                        {check.decision?.outcome === 'cleared' ? 'Rentvått' : 'Blockerat'}{' '}
                        {new Date(check.decision!.decidedAt).toLocaleDateString('sv-SE')}
                      </p>
                      <p className="text-gray-700">{check.decision?.reason}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor={`reason-${check.id}`}
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Motivering (obligatorisk, sparas oföränderligt)
                        </label>
                        <textarea
                          id={`reason-${check.id}`}
                          rows={2}
                          value={reasons[check.id] ?? ''}
                          onChange={(event) =>
                            setReasons((current) => ({ ...current, [check.id]: event.target.value }))
                          }
                          placeholder="Till exempel: namnlikhet med person i annat land, född 1954. Företrädaren är född 1981."
                          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => decide(check, true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                        >
                          {isBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                          Rentvå
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => decide(check, false)}
                          className="rounded-lg border border-red-300 px-5 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-60"
                        >
                          Blockera
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
        </main>
      </div>
    </>
  );
};

export default ScreeningPage;
