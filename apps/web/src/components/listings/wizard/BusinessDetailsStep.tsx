import React from 'react';
import { ListingFormData } from '../CreateListingWizard';
import { BusinessType } from '../../../services/listingService';

interface BusinessDetailsStepProps {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const BUSINESS_TYPES = [
  { value: 'AB', label: 'Aktiebolag (AB)', description: 'Svenskt aktiebolag', country: 'SE' },
  { value: 'AS', label: 'Aksjeselskap (AS)', description: 'Norskt aksjeselskap', country: 'NO' },
  { value: 'A_S', label: 'Aktieselskab (A/S)', description: 'Danskt aktieselskab', country: 'DK' },
  { value: 'SOLE_PROP', label: 'Enskild firma', description: 'Enskild näringsverksamhet' },
  { value: 'PARTNER', label: 'Handelsbolag', description: 'Handelsbolag eller kommanditbolag' },
  { value: 'OTHER', label: 'Annat', description: 'Annan företagsform' },
];

const NORDIC_COUNTRIES = [
  { code: 'SE', name: 'Sverige', cities: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro'] },
  { code: 'NO', name: 'Norge', cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad'] },
  { code: 'DK', name: 'Danmark', cities: ['Köpenhamn', 'Århus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers'] },
];

const BusinessDetailsStep: React.FC<BusinessDetailsStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    updateData({ 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleBusinessTypeChange = (businessType: BusinessType) => {
    updateData({ businessType });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleEstablishedYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear()) {
      updateData({ establishedYear: year });
    } else if (e.target.value === '') {
      updateData({ establishedYear: undefined });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
          Företagsdetaljer
        </h2>
        <p className="text-nordic-gray-600">
          Information om företagsformen och var verksamheten bedrivs.
        </p>
      </div>

      {/* Business Type */}
      <div>
        <label className="block text-sm font-medium text-nordic-gray-700 mb-3">
          Företagsform
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BUSINESS_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleBusinessTypeChange(type.value as BusinessType)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                data.businessType === type.value
                  ? 'border-nordic-blue-500 bg-nordic-blue-50 text-nordic-blue-700'
                  : 'border-nordic-gray-200 hover:border-nordic-gray-300'
              }`}
            >
              <div className="font-medium text-sm flex items-center">
                {type.label}
                {type.country && (
                  <span className="ml-2 px-2 py-1 text-xs bg-nordic-gray-100 text-nordic-gray-600 rounded">
                    {type.country}
                  </span>
                )}
              </div>
              <div className="text-xs text-nordic-gray-500 mt-1">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Plats
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={data.location}
          onChange={handleInputChange}
          placeholder="T.ex. Stockholm, Sverige"
          className="input-field"
          maxLength={100}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {NORDIC_COUNTRIES.map(country => (
            <div key={country.code}>
              {country.cities.map(city => (
                <button
                  key={`${country.code}-${city}`}
                  type="button"
                  onClick={() => updateData({ location: `${city}, ${country.name}` })}
                  className="px-3 py-1 text-xs bg-nordic-gray-100 text-nordic-gray-700 rounded-full hover:bg-nordic-gray-200 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Remote Work */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isRemote"
          name="isRemote"
          checked={data.isRemote}
          onChange={handleInputChange}
          className="h-4 w-4 text-nordic-blue-600 focus:ring-nordic-blue-500 border-nordic-gray-300 rounded"
        />
        <label htmlFor="isRemote" className="ml-2 block text-sm text-nordic-gray-700">
          Verksamheten kan bedrivas helt på distans
        </label>
      </div>

      {/* Established Year */}
      <div>
        <label htmlFor="establishedYear" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Etablerat år
        </label>
        <input
          type="number"
          id="establishedYear"
          name="establishedYear"
          value={data.establishedYear || ''}
          onChange={handleEstablishedYearChange}
          placeholder="T.ex. 2010"
          min="1900"
          max={currentYear}
          className="input-field"
        />
        <p className="text-xs text-nordic-gray-500 mt-1">
          Året då verksamheten startades
        </p>
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Webbsida
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={data.website}
          onChange={handleInputChange}
          placeholder="https://www.exempel.se"
          className="input-field"
        />
        <p className="text-xs text-nordic-gray-500 mt-1">
          Fullständig URL inklusive https://
        </p>
      </div>

      {/* Reason for Sale */}
      <div>
        <label htmlFor="reasonForSale" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Anledning till försäljning
        </label>
        <textarea
          id="reasonForSale"
          name="reasonForSale"
          value={data.reasonForSale}
          onChange={handleInputChange}
          placeholder="T.ex. Pension, nya satsningar, relokering..."
          className="input-field min-h-[80px]"
          maxLength={500}
        />
        <p className="text-xs text-nordic-gray-500 mt-1">
          {data.reasonForSale.length}/500 tecken
        </p>
      </div>

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

export default BusinessDetailsStep;