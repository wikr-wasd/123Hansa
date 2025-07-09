import React from 'react';
import { ListingFormData } from '../CreateListingWizard';

interface FinancialInfoStepProps {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const CURRENCIES = [
  { code: 'SEK', name: 'Svenska kronor', symbol: 'kr' },
  { code: 'NOK', name: 'Norska kronor', symbol: 'kr' },
  { code: 'DKK', name: 'Danska kronor', symbol: 'kr' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
];

const EMPLOYEE_RANGES = [
  { value: 0, label: 'Endast grundare' },
  { value: 1, label: '1 anställd' },
  { value: 2, label: '2-5 anställda' },
  { value: 6, label: '6-10 anställda' },
  { value: 11, label: '11-25 anställda' },
  { value: 26, label: '26-50 anställda' },
  { value: 51, label: '51+ anställda' },
];

const FinancialInfoStep: React.FC<FinancialInfoStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      updateData({ [name]: checked });
    } else if (name === 'askingPrice' || name === 'monthlyRevenue' || name === 'monthlyProfit') {
      const numValue = value === '' ? undefined : parseFloat(value);
      updateData({ [name]: numValue });
    } else if (name === 'employees') {
      const numValue = value === '' ? undefined : parseInt(value);
      updateData({ [name]: numValue });
    } else {
      updateData({ [name]: value });
    }
  };

  const handleEmployeeRangeClick = (value: number) => {
    updateData({ employees: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '';
    return new Intl.NumberFormat('sv-SE').format(num);
  };

  const currentCurrency = CURRENCIES.find(c => c.code === data.currency);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
          Finansiell information
        </h2>
        <p className="text-nordic-gray-600">
          Pris och ekonomisk data för att ge köpare en uppfattning om värdet.
        </p>
      </div>

      {/* Currency */}
      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Valuta
        </label>
        <select
          id="currency"
          name="currency"
          value={data.currency}
          onChange={handleInputChange}
          className="input-field"
        >
          {CURRENCIES.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Asking Price */}
      <div>
        <label htmlFor="askingPrice" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Utropspris
        </label>
        <div className="relative">
          <input
            type="number"
            id="askingPrice"
            name="askingPrice"
            value={data.askingPrice || ''}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            step="1000"
            className="input-field pr-12"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-nordic-gray-500 text-sm">
              {currentCurrency?.symbol}
            </span>
          </div>
        </div>
        {data.askingPrice && (
          <p className="text-xs text-nordic-gray-500 mt-1">
            {formatNumber(data.askingPrice)} {data.currency}
          </p>
        )}
      </div>

      {/* Negotiable */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isNegotiable"
          name="isNegotiable"
          checked={data.isNegotiable}
          onChange={handleInputChange}
          className="h-4 w-4 text-nordic-blue-600 focus:ring-nordic-blue-500 border-nordic-gray-300 rounded"
        />
        <label htmlFor="isNegotiable" className="ml-2 block text-sm text-nordic-gray-700">
          Priset är förhandlingsbart
        </label>
      </div>

      {/* Monthly Revenue */}
      <div>
        <label htmlFor="monthlyRevenue" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Månadsomsättning (genomsnitt)
        </label>
        <div className="relative">
          <input
            type="number"
            id="monthlyRevenue"
            name="monthlyRevenue"
            value={data.monthlyRevenue || ''}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            step="1000"
            className="input-field pr-12"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-nordic-gray-500 text-sm">
              {currentCurrency?.symbol}
            </span>
          </div>
        </div>
        {data.monthlyRevenue && (
          <p className="text-xs text-nordic-gray-500 mt-1">
            {formatNumber(data.monthlyRevenue)} {data.currency}/månad
          </p>
        )}
      </div>

      {/* Monthly Profit */}
      <div>
        <label htmlFor="monthlyProfit" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Månadsvinst (genomsnitt)
        </label>
        <div className="relative">
          <input
            type="number"
            id="monthlyProfit"
            name="monthlyProfit"
            value={data.monthlyProfit || ''}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            step="1000"
            className="input-field pr-12"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-nordic-gray-500 text-sm">
              {currentCurrency?.symbol}
            </span>
          </div>
        </div>
        {data.monthlyProfit && (
          <p className="text-xs text-nordic-gray-500 mt-1">
            {formatNumber(data.monthlyProfit)} {data.currency}/månad
          </p>
        )}
      </div>

      {/* Employees */}
      <div>
        <label className="block text-sm font-medium text-nordic-gray-700 mb-3">
          Antal anställda
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {EMPLOYEE_RANGES.map(range => (
            <button
              key={range.value}
              type="button"
              onClick={() => handleEmployeeRangeClick(range.value)}
              className={`p-3 text-sm border rounded-lg transition-colors ${
                data.employees === range.value
                  ? 'border-nordic-blue-500 bg-nordic-blue-50 text-nordic-blue-700'
                  : 'border-nordic-gray-200 hover:border-nordic-gray-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        
        {/* Custom employee count */}
        <div className="mt-3">
          <input
            type="number"
            name="employees"
            value={data.employees || ''}
            onChange={handleInputChange}
            placeholder="Eller ange exakt antal"
            min="0"
            className="input-field"
          />
        </div>
      </div>

      {/* Included Assets */}
      <div>
        <label className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Vad ingår i försäljningen?
        </label>
        <div className="space-y-2">
          {[
            'Varumärke och domän',
            'Kundregister',
            'Lager och inventarier',
            'Kontrakt och avtal',
            'Teknisk plattform',
            'Personal',
            'Immateriella rättigheter',
            'Lokaler och utrustning'
          ].map(asset => (
            <label key={asset} className="flex items-center">
              <input
                type="checkbox"
                checked={data.includedAssets.includes(asset)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateData({ 
                      includedAssets: [...data.includedAssets, asset] 
                    });
                  } else {
                    updateData({ 
                      includedAssets: data.includedAssets.filter(a => a !== asset) 
                    });
                  }
                }}
                className="h-4 w-4 text-nordic-blue-600 focus:ring-nordic-blue-500 border-nordic-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-nordic-gray-700">{asset}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      {(data.askingPrice || data.monthlyRevenue || data.monthlyProfit) && (
        <div className="bg-nordic-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-nordic-gray-900 mb-3">Finansiell sammanfattning</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {data.askingPrice && (
              <div>
                <div className="text-nordic-gray-600">Utropspris</div>
                <div className="font-medium">
                  {formatNumber(data.askingPrice)} {data.currency}
                </div>
              </div>
            )}
            {data.monthlyRevenue && (
              <div>
                <div className="text-nordic-gray-600">Månadsomsättning</div>
                <div className="font-medium">
                  {formatNumber(data.monthlyRevenue)} {data.currency}
                </div>
              </div>
            )}
            {data.monthlyProfit && (
              <div>
                <div className="text-nordic-gray-600">Månadsvinst</div>
                <div className="font-medium">
                  {formatNumber(data.monthlyProfit)} {data.currency}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-nordic-gray-200">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-2 border border-nordic-gray-300 text-nordic-gray-700 rounded-lg hover:bg-nordic-gray-50 transition-colors"
        >
          ← Tillbaka
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-nordic-blue-600 text-white rounded-lg hover:bg-nordic-blue-700 transition-colors"
        >
          Fortsätt →
        </button>
      </div>
    </form>
  );
};

export default FinancialInfoStep;