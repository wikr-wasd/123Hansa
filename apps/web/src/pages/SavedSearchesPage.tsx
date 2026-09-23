import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, Bell, BellOff, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  amountToInput,
  countryInfo,
  formatMoney,
  industryTranslationKey,
  INDUSTRY_KEYS,
  isCurrencyCode,
  money,
  parseAmount,
  type Industry,
} from '@hansa/core';
import {
  createSavedSearch,
  deleteSavedSearch,
  fetchMatches,
  fetchSavedSearches,
  markMatchesSeen,
  updateSavedSearch,
  type NewSavedSearch,
  type SavedSearch,
  type SearchMatch,
} from '../services/searchService';
import { formatListingAmount } from '../services/listingService';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from '../hooks/useTranslation';
import { useLaunchedCountries } from '../hooks/useMarkets';

// Bevakningar: köparens sida av matchningen.
//
// Matchningen sker i databasen. Den här sidan sparar kriterier och visar
// resultatet — den avgör aldrig själv vad som matchar, för då hade listan och
// notiserna kunnat säga olika saker om samma annons.

const emptyForm: NewSavedSearch = {
  name: '',
  countries: [],
  industries: [],
  priceCurrency: null,
  minPriceMinor: null,
  maxPriceMinor: null,
  notify: true,
};

/**
 * Prisspannet som text.
 *
 * Ett ensamt bindestreck före beloppet — "– 5 000 000 SEK" — läser som ett
 * minustecken. Med bara en gräns satt ska tecknet stå på rätt sida om talet.
 *
 * Beloppen går genom `formatMoney()`, aldrig genom en egen division: skalan
 * hör till valutan och finns bara i CURRENCY_INFO. Valutakoden skrivs ut i
 * stället för symbolen, eftersom SEK, NOK och DKK alla heter "kr" och en
 * köpare kan ha en bevakning per land.
 *
 * Locale är köparens eget språk här, inte ett lands. Ett prisfilter är köparens
 * egen inmatning — till skillnad från en annons, som formateras i sitt eget
 * lands format oavsett vem som läser.
 */
function formatRange(search: SavedSearch, locale: string): string {
  const currency = search.priceCurrency;
  if (!currency) return '';

  const format = (minor: number) =>
    formatMoney(money(minor, currency), locale, { currencyDisplay: 'code' });

  if (search.minPriceMinor !== null && search.maxPriceMinor !== null) {
    return `${format(search.minPriceMinor)} – ${format(search.maxPriceMinor)}`;
  }
  if (search.maxPriceMinor !== null) return `≤ ${format(search.maxPriceMinor)}`;
  if (search.minPriceMinor !== null) return `≥ ${format(search.minPriceMinor)}`;
  return '';
}

const SavedSearchesPage: React.FC = () => {
  const { t, getCurrentLanguage } = useTranslation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  // Länderna kommer ur markets-tabellen, inte ur en lista här. Sidan visar
  // chips i stället för en select och kan därför inte använda CountrySelect,
  // men källan är densamma.
  const { countries: markets, isLoading: isLoadingMarkets } = useLaunchedCountries();

  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<NewSavedSearch>(emptyForm);
  const [minText, setMinText] = useState('');
  const [maxText, setMaxText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [openId, setOpenId] = useState<string | null>(null);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setSearches(await fetchSavedSearches());
    } catch (err) {
      setError(err instanceof Error ? err.message : t('watch.error'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) load();
    else if (!isAuthLoading) setIsLoading(false);
  }, [isAuthenticated, isAuthLoading, load]);

  const startNew = () => {
    setForm(emptyForm);
    setMinText('');
    setMaxText('');
    setEditingId('new');
  };

  const startEdit = (search: SavedSearch) => {
    setForm({
      name: search.name,
      countries: search.countries,
      industries: search.industries,
      priceCurrency: search.priceCurrency,
      minPriceMinor: search.minPriceMinor,
      maxPriceMinor: search.maxPriceMinor,
      notify: search.notify,
    });
    // amountToInput() är inversen till parseAmount(), som fälten läses med.
    // En egen division hade gått sönder i en valuta utan decimaler.
    const toField = (minor: number | null) =>
      minor === null || search.priceCurrency === null
        ? ''
        : amountToInput(money(minor, search.priceCurrency));
    setMinText(toField(search.minPriceMinor));
    setMaxText(toField(search.maxPriceMinor));
    setEditingId(search.id);
  };

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const save = async () => {
    if (!form.name.trim()) {
      toast.error(t('watch.name-required'));
      return;
    }

    // Prisfiltret kräver en valuta — belopp utan valuta går inte att jämföra.
    // Saknas valutan men finns ett belopp, tolkas beloppet i det enda land
    // bevakningen valt; har köparen inte valt land alls faller filtret bort.
    const currency =
      form.priceCurrency ??
      (form.countries.length === 1 ? countryInfo(form.countries[0]).currency : null);

    let minMinor: number | null = null;
    let maxMinor: number | null = null;
    if (currency) {
      try {
        minMinor = minText.trim() ? parseAmount(minText, currency).amount : null;
        maxMinor = maxText.trim() ? parseAmount(maxText, currency).amount : null;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('watch.error'));
        return;
      }
    }
    if (minMinor !== null && maxMinor !== null && minMinor > maxMinor) {
      [minMinor, maxMinor] = [maxMinor, minMinor];
    }

    setIsSaving(true);
    try {
      const payload: NewSavedSearch = {
        ...form,
        priceCurrency: minMinor === null && maxMinor === null ? null : currency,
        minPriceMinor: minMinor,
        maxPriceMinor: maxMinor,
      };
      if (editingId === 'new') await createSavedSearch(payload);
      else if (editingId) await updateSavedSearch(editingId, payload);
      toast.success(t('watch.saved'));
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('watch.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (search: SavedSearch) => {
    if (!window.confirm(t('watch.delete-confirm'))) return;
    try {
      await deleteSavedSearch(search.id);
      toast.success(t('watch.deleted'));
      if (openId === search.id) setOpenId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('watch.error'));
    }
  };

  const openMatches = async (search: SavedSearch) => {
    if (openId === search.id) {
      setOpenId(null);
      return;
    }
    setOpenId(search.id);
    setIsLoadingMatches(true);
    try {
      setMatches(await fetchMatches(search.id));
      if (search.unseenCount > 0) {
        await markMatchesSeen(search.id);
        await load();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('watch.error'));
      setMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{t('watch.title')}</h1>
        <p className="mb-6 text-gray-600">{t('watch.subtitle')}</p>
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800">
          {t('auth.to-login')}
        </Link>
      </div>
    );
  }

  const fieldClass =
    'w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500';
  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm transition-colors ${
      active
        ? 'border-blue-600 bg-blue-600 text-white'
        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
    }`;

  const formCurrency =
    form.priceCurrency ??
    (form.countries.length === 1 ? countryInfo(form.countries[0]).currency : null);

  const industryOptions = INDUSTRY_KEYS.map((key) => ({
    key,
    label: t(industryTranslationKey(key)),
  })).sort((a, b) => a.label.localeCompare(b.label, getCurrentLanguage()));

  return (
    <>
      <Helmet>
        <title>{`${t('watch.title')} – 123Hansa`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="mb-1 text-2xl font-bold text-gray-900">{t('watch.title')}</h1>
              <p className="text-gray-600">{t('watch.subtitle')}</p>
            </div>
            {editingId === null && (
              <button
                type="button"
                onClick={startNew}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                {t('watch.new')}
              </button>
            )}
          </div>

          {editingId !== null && (
            <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4">
                <label htmlFor="watch-name" className="mb-2 block text-sm font-semibold text-gray-700">
                  {t('watch.name')}
                </label>
                <input
                  id="watch-name"
                  value={form.name}
                  onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
                  placeholder={t('watch.name-placeholder')}
                  className={fieldClass}
                />
              </div>

              <fieldset className="mb-4">
                <legend className="mb-2 text-sm font-semibold text-gray-700">
                  {t('watch.countries')}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {isLoadingMarkets && (
                    <span className="text-sm text-gray-500">{t('country.loading')}</span>
                  )}
                  {markets.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, countries: toggle(f.countries, code) }))}
                      className={chipClass(form.countries.includes(code))}
                    >
                      {t(`country.${code}`)}
                    </button>
                  ))}
                </div>
                {form.countries.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">{t('watch.any')}</p>
                )}
              </fieldset>

              <fieldset className="mb-4">
                <legend className="mb-2 text-sm font-semibold text-gray-700">
                  {t('watch.industries')}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {industryOptions.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, industries: toggle(f.industries, key as Industry) }))
                      }
                      className={chipClass(form.industries.includes(key as Industry))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {form.industries.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">{t('watch.any')}</p>
                )}
              </fieldset>

              <fieldset className="mb-4">
                <legend className="mb-2 text-sm font-semibold text-gray-700">
                  {t('watch.price')}
                </legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label htmlFor="watch-currency" className="mb-1 block text-xs text-gray-600">
                      {t('watch.price-currency')}
                    </label>
                    <select
                      id="watch-currency"
                      value={formCurrency ?? ''}
                      onChange={(event) =>
                        setForm((f) => ({
                          ...f,
                          priceCurrency: isCurrencyCode(event.target.value)
                            ? event.target.value
                            : null,
                        }))
                      }
                      className={fieldClass}
                    >
                      <option value="">—</option>
                      {/* En valuta per öppen marknad. Dubbletter kan uppstå den dag
                          två länder delar valuta — därför unika värden. */}
                      {[...new Set(markets.map((code) => countryInfo(code).currency))].map(
                        (currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="watch-min" className="mb-1 block text-xs text-gray-600">
                      {t('watch.price-min')}
                    </label>
                    <input
                      id="watch-min"
                      inputMode="decimal"
                      value={minText}
                      onChange={(event) => setMinText(event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="watch-max" className="mb-1 block text-xs text-gray-600">
                      {t('watch.price-max')}
                    </label>
                    <input
                      id="watch-max"
                      inputMode="decimal"
                      value={maxText}
                      onChange={(event) => setMaxText(event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>
                {(minText.trim() || maxText.trim()) && (
                  <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                    {t('watch.currency-warning')}
                  </p>
                )}
              </fieldset>

              <label className="mb-4 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.notify}
                  onChange={(event) => setForm((f) => ({ ...f, notify: event.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t('watch.notify')}
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={save}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {t('watch.save')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('watch.cancel')}
                </button>
              </div>
            </section>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-20 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
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
                {t('listings.retry')}
              </button>
            </div>
          )}

          {!isLoading && !error && searches.length === 0 && editingId === null && (
            <p className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600">
              {t('watch.empty')}
            </p>
          )}

          <div className="space-y-4">
            {!isLoading &&
              !error &&
              searches.map((search) => (
                <article key={search.id} className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        {search.notify ? (
                          <Bell className="h-4 w-4 text-blue-600" aria-hidden="true" />
                        ) : (
                          <BellOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        )}
                        {search.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {search.matchCount}{' '}
                        {search.matchCount === 1 ? t('watch.matches-one') : t('watch.matches')}
                        {search.unseenCount > 0 && (
                          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                            {search.unseenCount} {t('watch.unseen')}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(search)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {t('watch.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(search)}
                        aria-label={t('watch.delete')}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    {search.countries.length === 0 ? (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                        {t('watch.countries')}: {t('watch.any')}
                      </span>
                    ) : (
                      search.countries.map((code) => (
                        <span key={code} className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                          {t(`country.${code}`)}
                        </span>
                      ))
                    )}
                    {search.industries.map((key) => (
                      <span key={key} className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                        {t(industryTranslationKey(key))}
                      </span>
                    ))}
                    {search.priceCurrency && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                        {formatRange(search, getCurrentLanguage())}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openMatches(search)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {openId === search.id ? t('watch.hide-matches') : t('watch.show-matches')}
                  </button>

                  {openId === search.id && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      {isLoadingMatches && (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" aria-hidden="true" />
                        </div>
                      )}

                      {!isLoadingMatches && matches.length === 0 && (
                        <p className="py-4 text-center text-sm text-gray-600">
                          {t('watch.no-matches')}
                        </p>
                      )}

                      {!isLoadingMatches && matches.length > 0 && (
                        <>
                          <p className="mb-3 text-xs text-gray-500">{t('watch.order-note')}</p>
                          <ul className="space-y-2">
                            {matches.map((match) => (
                              <li key={match.id}>
                                <Link
                                  to={`/listings/${match.listing.id}`}
                                  className="block rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:bg-blue-50"
                                >
                                  <p className="font-medium text-gray-900">{match.listing.title}</p>
                                  <p className="text-sm text-gray-600">
                                    {t(industryTranslationKey(match.listing.industry))}
                                    {match.listing.region && ` · ${match.listing.region}`} ·{' '}
                                    {formatListingAmount(
                                      match.listing.askingPriceMinor,
                                      match.listing.country
                                    ) ?? t('listings.price-on-request')}
                                  </p>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </article>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedSearchesPage;
