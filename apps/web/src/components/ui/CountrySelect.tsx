import React from 'react';
import { countryInfo, type CountryCode } from '@hansa/core';
import { useLaunchedCountries } from '../../hooks/useMarkets';
import { useTranslation } from '../../hooks/useTranslation';

// En landsväljare, ett ställe.
//
// Fem formulär hade var sin kopia av ['SE','NO','DK'] och var sitt sätt att
// rendera samma select. Listan kommer nu ur `markets.launched` i databasen, och
// den här komponenten är det enda stället som vet hur den visas.
//
// Landsnamnen kommer ur ordboken: 'Sverige' mitt i ett danskt formulär läser
// som ett fel.

interface CountrySelectProps {
  id: string;
  value: CountryCode | 'ALL';
  onChange: (value: CountryCode | 'ALL') => void;
  className?: string;
  /** Filtret på annonslistan behöver ett "alla länder"-val. Formulär gör det inte. */
  allOption?: boolean;
  disabled?: boolean;
  required?: boolean;
  /**
   * Visar valutan efter landsnamnet: "Norge (NOK)".
   *
   * Värderingsräknaren behöver det — beloppen man skriver in tolkas i landets
   * valuta, och utan koden är det inte uppenbart vilken.
   */
  showCurrency?: boolean;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  id,
  value,
  onChange,
  className = '',
  allOption = false,
  disabled = false,
  required = false,
  showCurrency = false,
}) => {
  const { t } = useTranslation();
  const { countries, isLoading, error, reload } = useLaunchedCountries();

  // Under laddning visas inget land. Att gissa ['SE','NO','DK'] här vore att
  // återinföra den lista som just togs bort, och en gissning som råkar bli fel
  // syns aldrig — användaren väljer bara ett land som inte är öppet.
  if (isLoading) {
    return (
      <select id={id} className={className} disabled aria-busy="true">
        <option>{t('country.loading')}</option>
      </select>
    );
  }

  if (error) {
    return (
      <div>
        <select id={id} className={className} disabled aria-invalid="true">
          <option>{t('country.error')}</option>
        </select>
        <button
          type="button"
          onClick={reload}
          className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {t('listings.retry')}
        </button>
      </div>
    );
  }

  return (
    <select
      id={id}
      value={value}
      required={required}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as CountryCode | 'ALL')}
      className={className}
    >
      {allOption && <option value="ALL">{t('listings.all-countries')}</option>}
      {countries.map((code) => (
        <option key={code} value={code}>
          {showCurrency ? `${t(`country.${code}`)} (${countryInfo(code).currency})` : t(`country.${code}`)}
        </option>
      ))}
    </select>
  );
};

export default CountrySelect;
