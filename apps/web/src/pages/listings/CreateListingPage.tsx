import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { countryInfo, parseAmount, type CountryCode } from '@hansa/core';
import {
  checkOrgNumber,
  createOrganization,
  fetchMyOrganizations,
  organizationNumberLabel,
  type Organization,
} from '../../services/organizationService';
import { createListing, submitListingForReview } from '../../services/listingService';
import { useTranslation } from '../../hooks/useTranslation';

// Annonsen sparas i databasen och skickas till granskning. Tidigare sparade den
// här sidan i webbläsarens localStorage, där ingen annan kunde se den.

const MARKETS: CountryCode[] = ['SE', 'NO', 'DK'];

const INDUSTRIES = [
  'IT och systemutveckling',
  'E-handel',
  'Konsult och tjänster',
  'Tillverkning',
  'Bygg och anläggning',
  'Detaljhandel',
  'Restaurang och café',
  'Vård och hälsa',
  'Transport och logistik',
  'Fastighetsservice',
  'Ekonomi och redovisning',
  'Livsmedel',
  'Annan bransch',
];

const fieldClass =
  'w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500';
const labelClass = 'mb-2 block text-sm font-semibold text-gray-700';

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [organizationId, setOrganizationId] = useState<string>('new');
  const [orgName, setOrgName] = useState('');
  const [orgCountry, setOrgCountry] = useState<CountryCode>('SE');
  const [orgNumber, setOrgNumber] = useState('');
  const [orgKind, setOrgKind] = useState<'company' | 'broker'>('company');

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [region, setRegion] = useState('');
  const [price, setPrice] = useState('');
  const [revenue, setRevenue] = useState('');
  const [employees, setEmployees] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMyOrganizations()
      .then((orgs) => {
        setOrganizations(orgs);
        if (orgs.length > 0) setOrganizationId(orgs[0].id);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : t('dash.error')))
      .finally(() => setIsLoading(false));
  }, []);

  const selectedOrganization = organizations.find((org) => org.id === organizationId) ?? null;
  const isNewOrganization = organizationId === 'new';
  const country = isNewOrganization ? orgCountry : (selectedOrganization?.country ?? 'SE');
  const currency = countryInfo(country).currency;

  const orgNumberProblem = useMemo(() => {
    if (!isNewOrganization || orgNumber.trim().length === 0) return null;
    return checkOrgNumber(orgNumber, orgCountry);
  }, [isNewOrganization, orgNumber, orgCountry]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (isNewOrganization) {
      if (!orgName.trim()) next.orgName = t('form.error.org-name');
      if (!orgNumber.trim()) {
        next.orgNumber = t('form.error.org-number');
      } else {
        const problem = checkOrgNumber(orgNumber, orgCountry);
        if (problem) next.orgNumber = problem;
      }
    }

    if (title.trim().length < 3) next.title = t('form.error.headline-short');
    if (title.trim().length > 160) next.title = t('form.error.headline-long');
    if (!summary.trim()) next.summary = t('form.error.summary');
    if (summary.trim().length > 500) next.summary = t('form.error.summary-long');
    if (!description.trim()) next.description = t('form.error.description');

    for (const [key, value] of [
      ['price', price],
      ['revenue', revenue],
    ] as const) {
      if (value.trim()) {
        try {
          parseAmount(value, currency);
        } catch {
          next[key] = `${t('form.error.amount')} (${currency})`;
        }
      }
    }

    if (employees.trim() && !/^\d+$/.test(employees.trim())) {
      next.employees = t('form.error.employees');
    }
    if (foundedYear.trim()) {
      const year = Number(foundedYear);
      if (!Number.isInteger(year) || year < 1800 || year > new Date().getFullYear()) {
        next.foundedYear = t('form.error.year');
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast.error(t('form.error.missing'));
      return;
    }

    setIsSaving(true);
    try {
      let orgId = organizationId;
      if (isNewOrganization) {
        const created = await createOrganization({
          name: orgName,
          country: orgCountry,
          orgNumber,
          kind: orgKind,
        });
        orgId = created.id;
        setOrganizations((current) => [...current, created]);
      }

      const listingId = await createListing({
        organizationId: orgId,
        country,
        title,
        summary,
        description,
        industry,
        region,
        askingPriceMinor: price.trim() ? parseAmount(price, currency).amount : null,
        revenueMinor: revenue.trim() ? parseAmount(revenue, currency).amount : null,
        employees: employees.trim() ? Number(employees) : null,
        foundedYear: foundedYear.trim() ? Number(foundedYear) : null,
      });

      await submitListingForReview(listingId);

      toast.success(t('form.saved'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('form.save-failed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <span>{t('form.loading')}</span>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${t('form.title')} – 123Hansa`}</title>
        <meta name="description" content={t('form.intro')} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('form.title')}</h1>
          <p className="mb-8 text-gray-600">{t('form.intro')}</p>

          {loadError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
              {loadError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('form.seller')}</h2>

              <label htmlFor="organization" className={labelClass}>
                {t('form.organisation')}
              </label>
              <select
                id="organization"
                value={organizationId}
                onChange={(event) => setOrganizationId(event.target.value)}
                className={`${fieldClass} mb-4`}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.orgNumber}, {org.country})
                  </option>
                ))}
                <option value="new">+ {t('form.new-organisation')}</option>
              </select>

              {isNewOrganization ? (
                <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                  <div>
                    <label htmlFor="org-name" className={labelClass}>
                      {t('form.org-name')} *
                    </label>
                    <input
                      id="org-name"
                      value={orgName}
                      onChange={(event) => setOrgName(event.target.value)}
                      className={fieldClass}
                      placeholder="Exempel AB"
                    />
                    {errors.orgName && <p className="mt-1 text-sm text-red-600">{errors.orgName}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="org-country" className={labelClass}>
                        {t('auth.country')} *
                      </label>
                      <select
                        id="org-country"
                        value={orgCountry}
                        onChange={(event) => setOrgCountry(event.target.value as CountryCode)}
                        className={fieldClass}
                      >
                        {MARKETS.map((code) => (
                          <option key={code} value={code}>
                            {t(`country.${code}`)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="org-number" className={labelClass}>
                        {organizationNumberLabel(orgCountry)} *
                      </label>
                      <input
                        id="org-number"
                        value={orgNumber}
                        onChange={(event) => setOrgNumber(event.target.value)}
                        className={fieldClass}
                        placeholder={orgCountry === 'DK' ? '12345674' : '556677-8899'}
                      />
                      {(errors.orgNumber || orgNumberProblem) && (
                        <p className="mt-1 text-sm text-red-600">{errors.orgNumber ?? orgNumberProblem}</p>
                      )}
                      {!errors.orgNumber && !orgNumberProblem && orgNumber.trim() && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-green-700">
                          <CheckCircle className="h-4 w-4" aria-hidden="true" />
                          {t('form.org-number-ok')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="org-kind" className={labelClass}>
                      {t('form.org-type')}
                    </label>
                    <select
                      id="org-kind"
                      value={orgKind}
                      onChange={(event) => setOrgKind(event.target.value as 'company' | 'broker')}
                      className={fieldClass}
                    >
                      <option value="company">{t('form.org-type-company')}</option>
                      <option value="broker">{t('form.org-type-broker')}</option>
                    </select>
                  </div>
                </div>
              ) : (
                selectedOrganization && (
                  <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                    {selectedOrganization.verifiedAt ? (
                      <span className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        {t('form.org-verified')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-amber-700">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        {t('form.org-unverified')}
                      </span>
                    )}
                  </p>
                )
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('form.about')}</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className={labelClass}>
                    {t('form.headline')} *
                  </label>
                  <input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className={fieldClass}
                    placeholder={t('form.headline-placeholder')}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label htmlFor="summary" className={labelClass}>
                    {t('form.summary')} *
                  </label>
                  <input
                    id="summary"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    className={fieldClass}
                    placeholder={t('form.summary-placeholder')}
                    maxLength={500}
                  />
                  {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary}</p>}
                </div>

                <div>
                  <label htmlFor="description" className={labelClass}>
                    {t('form.description')} *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={8}
                    maxLength={20000}
                    className={fieldClass}
                    placeholder={t('form.description-placeholder')}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="industry" className={labelClass}>
                      {t('form.industry')} *
                    </label>
                    <select
                      id="industry"
                      value={industry}
                      onChange={(event) => setIndustry(event.target.value)}
                      className={fieldClass}
                    >
                      {INDUSTRIES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="region" className={labelClass}>
                      {t('form.region')}
                    </label>
                    <input
                      id="region"
                      value={region}
                      onChange={(event) => setRegion(event.target.value)}
                      className={fieldClass}
                      placeholder="Göteborg"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-1 text-lg font-semibold text-gray-900">{t('form.figures')}</h2>
              <p className="mb-4 text-sm text-gray-600">{t('form.figures-intro')}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="price" className={labelClass}>
                    {t('form.asking-price')} ({currency})
                  </label>
                  <input
                    id="price"
                    inputMode="decimal"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className={fieldClass}
                    placeholder="2 500 000"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                  <label htmlFor="revenue" className={labelClass}>
                    {t('form.revenue')} ({currency})
                  </label>
                  <input
                    id="revenue"
                    inputMode="decimal"
                    value={revenue}
                    onChange={(event) => setRevenue(event.target.value)}
                    className={fieldClass}
                    placeholder="8 000 000"
                  />
                  {errors.revenue && <p className="mt-1 text-sm text-red-600">{errors.revenue}</p>}
                </div>

                <div>
                  <label htmlFor="employees" className={labelClass}>
                    {t('form.employees')}
                  </label>
                  <input
                    id="employees"
                    inputMode="numeric"
                    value={employees}
                    onChange={(event) => setEmployees(event.target.value)}
                    className={fieldClass}
                    placeholder="12"
                  />
                  {errors.employees && <p className="mt-1 text-sm text-red-600">{errors.employees}</p>}
                </div>

                <div>
                  <label htmlFor="founded" className={labelClass}>
                    {t('form.founded')}
                  </label>
                  <input
                    id="founded"
                    inputMode="numeric"
                    value={foundedYear}
                    onChange={(event) => setFoundedYear(event.target.value)}
                    className={fieldClass}
                    placeholder="2009"
                  />
                  {errors.foundedYear && <p className="mt-1 text-sm text-red-600">{errors.foundedYear}</p>}
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">{t('form.submit-note')}</p>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {t('form.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateListingPage;
