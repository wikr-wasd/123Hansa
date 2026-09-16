import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Users, Building2, AlertCircle, Loader2 } from 'lucide-react';
import type { CountryCode } from '@hansa/core';
import {
  fetchIndustries,
  fetchListings,
  formatListingAmount,
  type Listing,
} from '../../services/listingService';
import { isSupabaseConfigured, missingConfigMessage } from '../../lib/supabase';

// Lanseringsmarknaderna. Kroatien och Bosnien finns i @hansa/core men öppnas
// först i ett senare skede (docs/BUSINESS.md).
const MARKETS: { code: CountryCode | 'ALL'; label: string }[] = [
  { code: 'ALL', label: 'Alla länder' },
  { code: 'SE', label: 'Sverige' },
  { code: 'NO', label: 'Norge' },
  { code: 'DK', label: 'Danmark' },
];

const PAGE_SIZE = 12;

export const DemoBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-300 ${className}`}
  >
    Exempelannons
  </span>
);

const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
  const price = formatListingAmount(listing.askingPriceMinor, listing.country);
  const revenue = formatListingAmount(listing.revenueMinor, listing.country);

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {listing.industry}
        </span>
        {listing.isDemo && <DemoBadge />}
      </div>

      <h2 className="mb-2 text-lg font-semibold text-gray-900">{listing.title}</h2>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">{listing.summary}</p>

      <dl className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <dt className="sr-only">Plats</dt>
          <dd>
            {listing.region ? `${listing.region}, ` : ''}
            {listing.country}
          </dd>
        </div>
        {listing.employees !== null && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <dt className="sr-only">Anställda</dt>
            <dd>{listing.employees} anställda</dd>
          </div>
        )}
        {revenue && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <dt className="sr-only">Omsättning</dt>
            <dd>{revenue} i omsättning</dd>
          </div>
        )}
      </dl>

      <p className="mt-4 border-t border-gray-100 pt-4 text-lg font-bold text-gray-900">
        {price ?? 'Pris på begäran'}
      </p>
    </Link>
  );
};

const ListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const country = (searchParams.get('country') as CountryCode | 'ALL' | null) ?? 'ALL';
  const industry = searchParams.get('industry') ?? '';

  const [searchField, setSearchField] = useState(query);
  const [listings, setListings] = useState<Listing[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchField(query);
  }, [query]);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError(missingConfigMessage);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const page = await fetchListings({ query, country, industry: industry || undefined, limit: PAGE_SIZE });
      setListings(page.listings);
      setTotal(page.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Annonserna kunde inte hämtas');
      setListings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [query, country, industry]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchIndustries()
      .then(setIndustries)
      .catch(() => setIndustries([]));
  }, []);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const page = await fetchListings({
        query,
        country,
        industry: industry || undefined,
        limit: PAGE_SIZE,
        offset: listings.length,
      });
      setListings((current) => [...current, ...page.listings]);
      setTotal(page.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fler annonser kunde inte hämtas');
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Företag till salu – 123Hansa</title>
        <meta
          name="description"
          content="Bläddra bland företag och affärstillgångar till salu i Sverige, Norge och Danmark."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <section className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">Företag till salu</h1>
            <p className="mb-8 text-lg text-gray-600">
              Köpare och säljare hittar varandra här och gör upp direkt med varandra.
            </p>

            <form
              className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                updateParam('q', searchField);
              }}
            >
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <label htmlFor="listing-search" className="sr-only">
                  Sök bland annonser
                </label>
                <input
                  id="listing-search"
                  type="search"
                  value={searchField}
                  onChange={(event) => setSearchField(event.target.value)}
                  placeholder="Sök på bransch, ort eller nyckelord"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="country-filter" className="sr-only">
                  Land
                </label>
                <select
                  id="country-filter"
                  value={country}
                  onChange={(event) => updateParam('country', event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 px-4 focus:border-transparent focus:ring-2 focus:ring-blue-500 md:w-44"
                >
                  {MARKETS.map((market) => (
                    <option key={market.code} value={market.code}>
                      {market.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="industry-filter" className="sr-only">
                  Bransch
                </label>
                <select
                  id="industry-filter"
                  value={industry}
                  onChange={(event) => updateParam('industry', event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 px-4 focus:border-transparent focus:ring-2 focus:ring-blue-500 md:w-56"
                >
                  <option value="">Alla branscher</option>
                  {industries.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Sök
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <span>Hämtar annonser…</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6" role="alert">
              <div className="mb-2 flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                <h2 className="font-semibold">Annonserna kunde inte hämtas</h2>
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

          {!isLoading && !error && listings.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Inga annonser matchar sökningen</h2>
              <p className="mb-6 text-gray-600">Pröva ett annat land, en annan bransch eller ett bredare sökord.</p>
              <button
                type="button"
                onClick={() => setSearchParams(new URLSearchParams())}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Rensa filtren
              </button>
            </div>
          )}

          {!isLoading && !error && listings.length > 0 && (
            <>
              <p className="mb-6 text-sm text-gray-600">
                {total} {total === 1 ? 'annons' : 'annonser'}
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {listings.length < total && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    Visa fler annonser
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default ListingsPage;
