import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Loader2,
  MapPin,
  Users,
} from 'lucide-react';
import {
  fetchListing,
  formatListingAmount,
  submitInterest,
  type Listing,
} from '../../services/listingService';
import { isSupabaseConfigured, missingConfigMessage } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { DemoBadge } from './ListingsPage';

const Fact: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 text-gray-400" aria-hidden="true">
      {icon}
    </span>
    <span>
      <span className="block text-sm text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </span>
  </div>
);

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    if (!isSupabaseConfigured) {
      setError(missingConfigMessage);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setListing(await fetchListing(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Annonsen kunde inte hämtas');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleInterest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!listing || message.trim().length === 0) return;

    setIsSending(true);
    const result = await submitInterest({ listingId: listing.id, message: message.trim() });
    setIsSending(false);

    if (result.ok) {
      setInterestSent(true);
      setMessage('');
      toast.success('Din intresseanmälan är skickad till säljaren');
      return;
    }
    if (result.reason === 'not-signed-in') {
      navigate('/login', { state: { from: `/listings/${listing.id}` } });
      return;
    }
    toast.error(result.message);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <span>Hämtar annonsen…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6" role="alert">
          <div className="mb-2 flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
            <h1 className="font-semibold">Annonsen kunde inte hämtas</h1>
          </div>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Annonsen finns inte</h1>
        <p className="mb-6 text-gray-600">Den kan ha tagits bort eller ännu inte blivit publicerad.</p>
        <Link to="/listings" className="font-medium text-blue-600 hover:text-blue-800">
          Tillbaka till annonserna
        </Link>
      </div>
    );
  }

  const price = formatListingAmount(listing.askingPriceMinor, listing.country);
  const revenue = formatListingAmount(listing.revenueMinor, listing.country);

  return (
    <>
      <Helmet>
        <title>{`${listing.title} – 123Hansa`}</title>
        <meta name="description" content={listing.summary} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Tillbaka till annonserna
          </Link>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8">
          <article className="space-y-6 lg:col-span-2">
            <header className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {listing.industry}
                </span>
                {listing.isDemo && <DemoBadge />}
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">{listing.title}</h1>
              <p className="text-lg text-gray-600">{listing.summary}</p>
            </header>

            {listing.isDemo && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-6" role="note">
                <h2 className="mb-1 font-semibold text-amber-900">Det här är en exempelannons</h2>
                <p className="text-sm text-amber-900">
                  Bolaget finns inte. Annonsen visar hur en riktig annons ser ut på 123Hansa och går
                  därför inte att kontakta.
                </p>
              </div>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Om verksamheten</h2>
              <p className="whitespace-pre-line leading-relaxed text-gray-700">{listing.description}</p>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Nyckeltal</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Fact
                  icon={<MapPin className="h-5 w-5" />}
                  label="Plats"
                  value={listing.region ? `${listing.region}, ${listing.country}` : listing.country}
                />
                {revenue && (
                  <Fact icon={<Building2 className="h-5 w-5" />} label="Omsättning" value={revenue} />
                )}
                {listing.employees !== null && (
                  <Fact
                    icon={<Users className="h-5 w-5" />}
                    label="Anställda"
                    value={String(listing.employees)}
                  />
                )}
                {listing.foundedYear !== null && (
                  <Fact
                    icon={<Calendar className="h-5 w-5" />}
                    label="Grundat"
                    value={String(listing.foundedYear)}
                  />
                )}
              </div>
            </section>
          </article>

          <aside className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-sm text-gray-500">Utgångspris</p>
              <p className="mb-6 text-3xl font-bold text-gray-900">{price ?? 'Pris på begäran'}</p>

              {listing.isDemo ? (
                <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  Exempelannonser går inte att kontakta.{' '}
                  <Link to="/listings" className="font-medium text-blue-600 hover:text-blue-800">
                    Se övriga annonser
                  </Link>
                </p>
              ) : interestSent ? (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                  <p className="mb-1 font-semibold">Intresseanmälan skickad</p>
                  <p>
                    Säljaren väljer vilka som går vidare. Du ser svaret under{' '}
                    <Link to="/dashboard" className="font-medium underline">
                      Min sida
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInterest} className="space-y-3">
                  <label htmlFor="interest-message" className="block text-sm font-medium text-gray-700">
                    Visa intresse
                  </label>
                  <textarea
                    id="interest-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={5}
                    maxLength={5000}
                    required
                    placeholder="Berätta kort vem du är och varför bolaget är intressant."
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || message.trim().length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isSending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    {isAuthenticated ? 'Skicka intresseanmälan' : 'Logga in och visa intresse'}
                  </button>
                  <p className="text-xs text-gray-500">
                    Dina kontaktuppgifter delas bara om säljaren väljer att gå vidare. 123Hansa är inte
                    part i affären — förhandling, avtal och betalning sköter ni själva.
                  </p>
                </form>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
              <h2 className="mb-2 font-semibold text-gray-900">Annonsuppgifter</h2>
              <dl className="space-y-1">
                <div className="flex justify-between gap-4">
                  <dt>Publicerad</dt>
                  <dd>
                    {listing.publishedAt
                      ? new Date(listing.publishedAt).toLocaleDateString('sv-SE')
                      : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Annons-ID</dt>
                  <dd className="font-mono text-xs">{listing.id.slice(0, 8)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default ListingDetailPage;
