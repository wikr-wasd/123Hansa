import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import {
  countryInfo,
  estimateValuation,
  formatMoney,
  intlLocaleFor,
  parseAmount,
  type CountryCode,
  type ValuationIndustry,
  type ValuationResult,
} from '@hansa/core';

// Räkningen sker i @hansa/core (CLAUDE.md regel 3). Komponenten samlar in
// uppgifter, visar resultatet och säger vad det bygger på — den räknar inte själv.

const MARKETS: { code: CountryCode; label: string }[] = [
  { code: 'SE', label: 'Sverige' },
  { code: 'NO', label: 'Norge' },
  { code: 'DK', label: 'Danmark' },
];

const INDUSTRIES: { value: ValuationIndustry; label: string }[] = [
  { value: 'software', label: 'IT och mjukvara' },
  { value: 'ecommerce', label: 'E-handel' },
  { value: 'consulting', label: 'Konsult och tjänster' },
  { value: 'manufacturing', label: 'Tillverkning' },
  { value: 'construction', label: 'Bygg och anläggning' },
  { value: 'retail', label: 'Detaljhandel' },
  { value: 'restaurant', label: 'Restaurang och café' },
  { value: 'healthcare', label: 'Vård och hälsa' },
  { value: 'transport', label: 'Transport och logistik' },
  { value: 'property_services', label: 'Fastighetsservice' },
  { value: 'other', label: 'Annan bransch' },
];

const ValuationCalculator: React.FC = () => {
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
      return { result: null, error: err instanceof Error ? err.message : 'Kunde inte räkna' };
    }
  }, [revenue, ebit, employees, years, industry, currency]);

  const fieldClass =
    'w-full rounded-lg border border-slate-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
  const labelClass = 'mb-2 block text-sm font-semibold text-slate-700';

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-slate-900">Vad kan bolaget vara värt?</h3>
        <p className="text-gray-600">
          En snabb uppskattning utifrån branschmultiplar. Ingen registrering, ingenting sparas.
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="valuation-country" className={labelClass}>
              Land
            </label>
            <select
              id="valuation-country"
              value={country}
              onChange={(event) => setCountry(event.target.value as CountryCode)}
              className={fieldClass}
            >
              {MARKETS.map((market) => (
                <option key={market.code} value={market.code}>
                  {market.label} ({countryInfo(market.code).currency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="valuation-industry" className={labelClass}>
              Bransch
            </label>
            <select
              id="valuation-industry"
              value={industry}
              onChange={(event) => setIndustry(event.target.value as ValuationIndustry)}
              className={fieldClass}
            >
              {INDUSTRIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="valuation-revenue" className={labelClass}>
              Årsomsättning ({currency}) *
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
              Rörelseresultat ({currency})
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
              Antal anställda
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
              År i verksamhet
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
            Fyll i årsomsättningen för att se ett spann. Med rörelseresultatet blir det betydligt
            mer träffsäkert.
          </p>
        )}

        {result && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <p className="mb-1 text-sm font-semibold text-blue-800">Uppskattat värde</p>
            <p className="mb-1 text-3xl font-bold text-blue-900">
              {formatMoney(result.mid, locale, { currencyDisplay: 'code' })}
            </p>
            <p className="mb-4 text-sm text-blue-800">
              Spann: {formatMoney(result.low, locale, { currencyDisplay: 'code' })} –{' '}
              {formatMoney(result.high, locale, { currencyDisplay: 'code' })}
            </p>

            <div className="rounded-lg bg-white p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
                Så är det räknat
              </p>
              <ul className="space-y-2 text-xs leading-relaxed text-slate-600">
                {result.assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
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
