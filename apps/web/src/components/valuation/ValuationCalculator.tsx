import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import {
  countryInfo,
  estimateValuation,
  formatMoney,
  industryTranslationKey,
  INDUSTRY_KEYS,
  intlLocaleFor,
  parseAmount,
  type CountryCode,
  type ValuationIndustry,
  type ValuationResult,
} from '@hansa/core';
import { useTranslation } from '../../hooks/useTranslation';
import CountrySelect from '../ui/CountrySelect';

// Räkningen sker i @hansa/core (CLAUDE.md regel 3). Komponenten samlar in
// uppgifter, visar resultatet och säger vad det bygger på — den räknar inte själv.

// Branscherna kommer ur @hansa/core, samma lista som annonserna använder.
// Listan låg tidigare här med egna svenska texter, och gled isär från
// annonsformulärets — samma bransch hette 'IT och mjukvara' på ett ställe och
// 'IT och systemutveckling' på det andra.

const ValuationCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [country, setCountry] = useState<CountryCode>('SE');
  const [industry, setIndustry] = useState<ValuationIndustry>('consulting');
  const [revenue, setRevenue] = useState('');
  const [ebit, setEbit] = useState('');
  const [employees, setEmployees] = useState('');
  const [years, setYears] = useState('');

  const currency = countryInfo(country).currency;
  const locale = intlLocaleFor(country);

  const { result, error } = useMemo((): { result: ValuationResult | null; error: string | null } => {
    if (!revenue.trim()) return { result: null, error: null };
    try {
      const revenueMoney = parseAmount(revenue, currency);
      const ebitMoney = ebit.trim() ? parseAmount(ebit, currency) : undefined;
      const employeeCount = employees.trim() ? Number.parseInt(employees, 10) : undefined;
      const yearCount = years.trim() ? Number.parseInt(years, 10) : undefined;

      return {
        result: estimateValuation({
          revenueMinor: revenueMoney.amount,
          ebitMinor: ebitMoney?.amount,
          currency,
          industry,
          employees: Number.isNaN(employeeCount as number) ? undefined : employeeCount,
          yearsInBusiness: Number.isNaN(yearCount as number) ? undefined : yearCount,
        }),
        error: null,
      };
    } catch (err) {
      return { result: null, error: err instanceof Error ? err.message : t('valuation.error') };
    }
  }, [revenue, ebit, employees, years, industry, currency, t]);

  const fieldClass =
    'w-full rounded-lg border border-slate-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
  const labelClass = 'mb-2 block text-sm font-semibold text-slate-700';

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-slate-900">{t('valuation.title')}</h3>
        <p className="text-gray-600">
          {t('valuation.intro')}
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="valuation-country" className={labelClass}>
              {t('valuation.country')}
            </label>
            <CountrySelect
              id="valuation-country"
              value={country}
              onChange={(value) => setCountry(value as CountryCode)}
              className={fieldClass}
              showCurrency
            />
          </div>

          <div>
            <label htmlFor="valuation-industry" className={labelClass}>
              {t('valuation.industry')}
            </label>
            <select
              id="valuation-industry"
              value={industry}
              onChange={(event) => setIndustry(event.target.value as ValuationIndustry)}
              className={fieldClass}
            >
              {INDUSTRY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(industryTranslationKey(key))}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="valuation-revenue" className={labelClass}>
              {t('valuation.revenue')} ({currency}) *
            </label>
            <input
              id="valuation-revenue"
              inputMode="decimal"
              value={revenue}
              onChange={(event) => setRevenue(event.target.value)}
              placeholder="5 000 000"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="valuation-ebit" className={labelClass}>
              {t('valuation.ebit')} ({currency})
            </label>
            <input
              id="valuation-ebit"
              inputMode="decimal"
              value={ebit}
              onChange={(event) => setEbit(event.target.value)}
              placeholder="800 000"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="valuation-employees" className={labelClass}>
              {t('valuation.employees')}
            </label>
            <input
              id="valuation-employees"
              inputMode="numeric"
              value={employees}
              onChange={(event) => setEmployees(event.target.value)}
              placeholder="8"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="valuation-years" className={labelClass}>
              {t('valuation.years')}
            </label>
            <input
              id="valuation-years"
              inputMode="numeric"
              value={years}
              onChange={(event) => setYears(event.target.value)}
              placeholder="12"
              className={fieldClass}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {!revenue.trim() && !error && (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            {t('valuation.empty')}
          </p>
        )}

        {result && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <p className="mb-1 text-sm font-semibold text-blue-800">{t('valuation.result')}</p>
            <p className="mb-1 text-3xl font-bold text-blue-900">
              {formatMoney(result.mid, locale, { currencyDisplay: 'code' })}
            </p>
            <p className="mb-4 text-sm text-blue-800">
              {t('valuation.range')}: {formatMoney(result.low, locale, { currencyDisplay: 'code' })} –{' '}
              {formatMoney(result.high, locale, { currencyDisplay: 'code' })}
            </p>

            <div className="rounded-lg bg-white p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {t('valuation.how')}
              </p>
              <ul className="space-y-2 text-xs leading-relaxed text-slate-600">
                {result.assumptions.map((assumption) => (
                  // Kärnan svarar med en KOD och sina tal, inte med en färdig
                  // mening. Formuleringen hör hemma i ordboken, så att en dansk
                  // användare inte får svenska förklaringar under siffran.
                  <li key={assumption.code}>
                    {t(`valuation.assumption.${assumption.code}`, {
                      low: 'low' in assumption ? assumption.low : undefined,
                      high: 'high' in assumption ? assumption.high : undefined,
                    })}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuationCalculator;
