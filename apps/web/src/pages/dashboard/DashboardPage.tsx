import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, Loader2, Plus, ShieldCheck } from 'lucide-react';
import type { CountryCode } from '@hansa/core';
import { useAuthStore } from '../../stores/authStore';
import { amIAdmin } from '../../services/adminService';
import { authService, type LocaleCode } from '../../services/authService';
import {
  fetchMyInterests,
  fetchMyListings,
  fetchReceivedInterests,
  formatListingAmount,
  INTEREST_STATUS_LABELS,
  LISTING_STATUS_LABELS,
  markListingSold,
  respondToInterest,
  submitListingForReview,
  withdrawListing,
  type MyListing,
  type ReceivedInterest,
  type SentInterest,
} from '../../services/listingService';

type Tab = 'listings' | 'interests' | 'profile';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_review: 'bg-amber-100 text-amber-800',
  published: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  sold: 'bg-blue-100 text-blue-800',
  withdrawn: 'bg-gray-100 text-gray-600',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
};

const Badge: React.FC<{ status: string; label: string }> = ({ status, label }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
      STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700'
    }`}
  >
    {label}
  </span>
);

const DashboardPage: React.FC = () => {
  const { user, refreshUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('listings');

  const [listings, setListings] = useState<MyListing[]>([]);
  const [received, setReceived] = useState<ReceivedInterest[]>([]);
  const [sent, setSent] = useState<SentInterest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [country, setCountry] = useState<CountryCode>((user?.country as CountryCode) ?? 'SE');
  const [language, setLanguage] = useState<LocaleCode>(user?.language ?? 'sv');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setCountry((user.country as CountryCode) ?? 'SE');
    setLanguage(user.language);
  }, [user]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [mine, incoming, outgoing] = await Promise.all([
        fetchMyListings(),
        fetchReceivedInterests(),
        fetchMyInterests(),
      ]);
      setListings(mine);
      setReceived(incoming);
      setSent(outgoing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte hämta dina uppgifter');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Granskare ska hitta sin kö utan att känna till adressen.
  useEffect(() => {
    amIAdmin().then(setIsAdmin);
  }, []);

  const act = async (action: () => Promise<void>, success: string) => {
    try {
      await action();
      toast.success(success);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Åtgärden misslyckades');
    }
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingProfile(true);
    try {
      await authService.updateProfile({ firstName, lastName, country, language });
      await refreshUser();
      toast.success('Profilen är sparad');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Profilen kunde inte sparas');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'listings', label: 'Mina annonser', count: listings.length },
    { id: 'interests', label: 'Intresseanmälningar', count: received.length + sent.length },
    { id: 'profile', label: 'Profil' },
  ];

  return (
    <>
      <Helmet>
        <title>Min sida – 123Hansa</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Min sida</h1>
              <p className="text-gray-600">
                {user ? `${user.firstName} ${user.lastName}`.trim() || user.email : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <Link
                  to="/admin/review"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  Granskning
                </Link>
              )}
              <Link
                to="/create-listing"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                Lägg upp en annons
              </Link>
            </div>
          </div>

          <nav className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium ${
                  tab === item.id
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{item.count}</span>
                )}
              </button>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <span>Hämtar dina uppgifter…</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6" role="alert">
              <div className="mb-2 flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                <h2 className="font-semibold">Kunde inte hämta dina uppgifter</h2>
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
          )}

          {!isLoading && !error && tab === 'listings' && (
            <section className="space-y-4">
              {listings.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900">Du har inga annonser än</h2>
                  <p className="mb-6 text-gray-600">
                    Lägg upp ditt bolag så granskar vi annonsen innan den publiceras.
                  </p>
                  <Link
                    to="/create-listing"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                    Lägg upp en annons
                  </Link>
                </div>
              ) : (
                listings.map((listing) => (
                  <article key={listing.id} className="rounded-xl border border-gray-200 bg-white p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge status={listing.status} label={LISTING_STATUS_LABELS[listing.status]} />
                      {listing.isDemo && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                          Exempelannons
                        </span>
                      )}
                      {!listing.organizationVerified && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                          Organisationen inte verifierad
                        </span>
                      )}
                    </div>

                    <h2 className="mb-1 text-lg font-semibold text-gray-900">{listing.title}</h2>
                    <p className="mb-3 text-sm text-gray-600">{listing.summary}</p>

                    <dl className="mb-4 flex flex-wrap gap-x-8 gap-y-1 text-sm text-gray-600">
                      <div className="flex gap-2">
                        <dt>Pris:</dt>
                        <dd className="font-medium text-gray-900">
                          {formatListingAmount(listing.askingPriceMinor, listing.country) ?? 'På begäran'}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt>Organisation:</dt>
                        <dd>{listing.organizationName}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt>Intresseanmälningar:</dt>
                        <dd>{listing.interestCount}</dd>
                      </div>
                    </dl>

                    {listing.reviewNote && (
                      <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                        <strong>Granskarens svar:</strong> {listing.reviewNote}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {listing.status === 'published' && (
                        <Link
                          to={`/listings/${listing.id}`}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Visa annonsen
                        </Link>
                      )}
                      {(listing.status === 'draft' || listing.status === 'rejected') && (
                        <button
                          type="button"
                          onClick={() => act(() => submitListingForReview(listing.id), 'Annonsen är inskickad')}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Skicka till granskning
                        </button>
                      )}
                      {listing.status === 'published' && (
                        <>
                          <button
                            type="button"
                            onClick={() => act(() => markListingSold(listing.id), 'Annonsen är markerad som såld')}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Markera som såld
                          </button>
                          <button
                            type="button"
                            onClick={() => act(() => withdrawListing(listing.id), 'Annonsen är tillbakadragen')}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Dra tillbaka
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {!isLoading && !error && tab === 'interests' && (
            <div className="space-y-10">
              <section>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">På mina annonser</h2>
                {received.length === 0 ? (
                  <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
                    Inga intresseanmälningar än.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {received.map((interest) => (
                      <article key={interest.id} className="rounded-xl border border-gray-200 bg-white p-6">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-900">{interest.listingTitle}</h3>
                          <Badge status={interest.status} label={INTEREST_STATUS_LABELS[interest.status]} />
                        </div>
                        <p className="mb-4 whitespace-pre-line text-sm text-gray-700">{interest.message}</p>
                        <p className="mb-4 text-xs text-gray-500">
                          Mottagen {new Date(interest.createdAt).toLocaleDateString('sv-SE')}
                        </p>
                        {interest.status === 'pending' && (
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => act(() => respondToInterest(interest.id, true), 'Intresset är accepterat')}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                              Gå vidare med köparen
                            </button>
                            <button
                              type="button"
                              onClick={() => act(() => respondToInterest(interest.id, false), 'Intresset är avböjt')}
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Avböj
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Skickade av mig</h2>
                {sent.length === 0 ? (
                  <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
                    Du har inte visat intresse för någon annons än.{' '}
                    <Link to="/listings" className="font-medium text-blue-600 hover:text-blue-800">
                      Bläddra bland annonserna
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sent.map((interest) => (
                      <article key={interest.id} className="rounded-xl border border-gray-200 bg-white p-6">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <Link
                            to={`/listings/${interest.listingId}`}
                            className="font-semibold text-blue-700 hover:text-blue-900"
                          >
                            {interest.listingTitle}
                          </Link>
                          <Badge status={interest.status} label={INTEREST_STATUS_LABELS[interest.status]} />
                        </div>
                        <p className="whitespace-pre-line text-sm text-gray-700">{interest.message}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {!isLoading && !error && tab === 'profile' && (
            <form onSubmit={saveProfile} className="max-w-xl space-y-4 rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">Profil</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="mb-2 block text-sm font-semibold text-gray-700">
                    Förnamn
                  </label>
                  <input
                    id="first-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="mb-2 block text-sm font-semibold text-gray-700">
                    Efternamn
                  </label>
                  <input
                    id="last-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profile-country" className="mb-2 block text-sm font-semibold text-gray-700">
                    Land
                  </label>
                  <select
                    id="profile-country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value as CountryCode)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SE">Sverige</option>
                    <option value="NO">Norge</option>
                    <option value="DK">Danmark</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="profile-language" className="mb-2 block text-sm font-semibold text-gray-700">
                    Språk
                  </label>
                  <select
                    id="profile-language"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as LocaleCode)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sv">Svenska</option>
                    <option value="no">Norsk</option>
                    <option value="da">Dansk</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                E-post: <span className="font-medium text-gray-900">{user?.email}</span>
              </p>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isSavingProfile && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Spara
              </button>
            </form>
          )}
        </main>
      </div>
    </>
  );
};

export default DashboardPage;
