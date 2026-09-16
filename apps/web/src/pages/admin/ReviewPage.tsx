import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { countryInfo, validateOrgNumber } from '@hansa/core';
import {
  amIAdmin,
  fetchListingsForReview,
  reviewListing,
  verifyOrganization,
  type ReviewListing,
} from '../../services/adminService';
import { formatListingAmount, LISTING_STATUS_LABELS, type ListingStatus } from '../../services/listingService';
import { useAuthStore } from '../../stores/authStore';

// Granskningsvyn. Utan den måste review_listing() och verify_organization()
// anropas manuellt mot databasen, vilket inte är rimligt i drift.
//
// Att vyn visas avgörs av am_i_platform_admin(). Att åtgärderna GÅR IGENOM
// avgörs av databasen, som kontrollerar behörigheten själv (CLAUDE.md regel 5).

const QUEUES: { status: ListingStatus; label: string }[] = [
  { status: 'pending_review', label: 'Väntar på granskning' },
  { status: 'published', label: 'Publicerade' },
  { status: 'rejected', label: 'Nekade' },
];

const ReviewPage: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [queue, setQueue] = useState<ListingStatus>('pending_review');
  const [listings, setListings] = useState<ReviewListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
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
      setListings(await fetchListingsForReview(queue));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte hämta annonserna');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, queue]);

  useEffect(() => {
    if (isAdmin) load();
    else if (isAdmin === false) setIsLoading(false);
  }, [isAdmin, load]);

  const act = async (id: string, action: () => Promise<void>, success: string) => {
    setBusyId(id);
    try {
      await action();
      toast.success(success);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Åtgärden misslyckades');
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
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Granskning</h1>
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
        <title>Granskning – 123Hansa</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <ShieldCheck className="h-6 w-6 text-blue-600" aria-hidden="true" />
              Granskning
            </h1>
            <p className="text-gray-600">
              Kontrollera uppgifterna mot bolagsregistret innan du publicerar.
            </p>
          </div>
          <nav className="mx-auto flex max-w-5xl gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {QUEUES.map((item) => (
              <button
                key={item.status}
                type="button"
                onClick={() => setQueue(item.status)}
                className={`whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium ${
                  queue === item.status
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <span>Hämtar annonser…</span>
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

          {!isLoading && !error && listings.length === 0 && (
            <p className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600">
              Inget att visa i den här kön.
            </p>
          )}

          {!isLoading &&
            !error &&
            listings.map((listing) => {
              const orgCheck = validateOrgNumber(listing.organization.orgNumber, listing.organization.country);
              const isBusy = busyId === listing.id;

              return (
                <article key={listing.id} className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {LISTING_STATUS_LABELS[listing.status]}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {listing.industry}
                    </span>
                    <span className="text-xs text-gray-500">
                      Inkom {new Date(listing.createdAt).toLocaleDateString('sv-SE')}
                    </span>
                  </div>

                  <h2 className="mb-1 text-lg font-semibold text-gray-900">{listing.title}</h2>
                  <p className="mb-4 text-sm text-gray-600">{listing.summary}</p>
                  <p className="mb-4 whitespace-pre-line rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                    {listing.description}
                  </p>

                  <div className="mb-4 grid gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-900">Säljare</h3>
                      <dl className="space-y-1 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <dt>Organisation:</dt>
                          <dd className="font-medium">{listing.organization.name}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>{countryInfo(listing.organization.country).orgNumberLabel}:</dt>
                          <dd className="font-mono">{listing.organization.orgNumber}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>Land:</dt>
                          <dd>{listing.organization.country}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>Typ:</dt>
                          <dd>{listing.organization.kind === 'broker' ? 'Mäklare' : 'Bolag'}</dd>
                        </div>
                      </dl>

                      <p className="mt-2 text-sm">
                        {orgCheck.valid ? (
                          <span className="flex items-center gap-1 text-green-700">
                            <CheckCircle className="h-4 w-4" aria-hidden="true" />
                            Kontrollsiffran stämmer
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-700">
                            <AlertCircle className="h-4 w-4" aria-hidden="true" />
                            {orgCheck.reason}
                          </span>
                        )}
                      </p>

                      <p className="mt-2 text-sm">
                        {listing.organization.verifiedAt ? (
                          <span className="text-green-700">
                            Verifierad {new Date(listing.organization.verifiedAt).toLocaleDateString('sv-SE')}
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              act(
                                listing.id,
                                () => verifyOrganization(listing.organization.id),
                                'Organisationen är verifierad'
                              )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                          >
                            Markera organisationen som verifierad
                          </button>
                        )}
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-900">Uppgifter i annonsen</h3>
                      <dl className="space-y-1 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <dt>Pris:</dt>
                          <dd>{formatListingAmount(listing.askingPriceMinor, listing.country) ?? 'På begäran'}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>Omsättning:</dt>
                          <dd>{formatListingAmount(listing.revenueMinor, listing.country) ?? '—'}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>Anställda:</dt>
                          <dd>{listing.employees ?? '—'}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>Grundat:</dt>
                          <dd>{listing.foundedYear ?? '—'}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt>Ort:</dt>
                          <dd>{listing.region || '—'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {listing.status === 'pending_review' && (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`note-${listing.id}`} className="mb-1 block text-sm font-medium text-gray-700">
                          Svar till säljaren (visas på deras sida)
                        </label>
                        <textarea
                          id={`note-${listing.id}`}
                          rows={2}
                          value={notes[listing.id] ?? ''}
                          onChange={(event) =>
                            setNotes((current) => ({ ...current, [listing.id]: event.target.value }))
                          }
                          placeholder="Till exempel: uppgifterna stämmer mot registret, eller vad som behöver kompletteras."
                          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            act(
                              listing.id,
                              () => reviewListing(listing.id, true, notes[listing.id]),
                              'Annonsen är publicerad'
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                        >
                          {isBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                          Publicera
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            act(
                              listing.id,
                              () => reviewListing(listing.id, false, notes[listing.id]),
                              'Annonsen är nekad'
                            )
                          }
                          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                          Neka
                        </button>
                      </div>

                      {!listing.organization.verifiedAt && (
                        <p className="text-sm text-amber-700">
                          Organisationen måste verifieras innan annonsen kan publiceras.
                        </p>
                      )}
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

export default ReviewPage;
