import React from 'react';
import { ListingFormData } from '../CreateListingWizard';
import { ListingCategory } from '../../../services/listingService';

interface BasicInfoStepProps {
  data: ListingFormData;
  updateData: (data: Partial<ListingFormData>) => void;
  onNext: () => void;
}

const CATEGORIES = [
  { value: 'BUSINESS', label: 'Företag', description: 'Etablerat företag med befintlig verksamhet' },
  { value: 'ECOMMERCE', label: 'E-handel', description: 'Webbutik eller e-handelsplattform' },
  { value: 'SAAS', label: 'SaaS', description: 'Mjukvaruverksamhet med prenumerationsmodell' },
  { value: 'WEBSITE', label: 'Webbsida', description: 'Webbplats med innehåll eller tjänster' },
  { value: 'DOMAIN', label: 'Domän', description: 'Domännamn för försäljning' },
  { value: 'INVOICE', label: 'Faktura', description: 'Kund- eller leverantörsfakturor' },
  { value: 'REAL_ESTATE', label: 'Fastighet', description: 'Kommersiell fastighet eller lokal' },
  { value: 'EQUIPMENT', label: 'Utrustning', description: 'Maskiner, verktyg eller utrustning' },
  { value: 'OTHER', label: 'Annat', description: 'Annan typ av tillgång eller verksamhet' },
];

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, updateData, onNext }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  const handleCategoryChange = (category: ListingCategory) => {
    updateData({ category, subcategory: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.title && data.description && data.category) {
      onNext();
    }
  };

  const isValid = data.title && data.description && data.category;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
          Grundläggande information
        </h2>
        <p className="text-nordic-gray-600">
          Berätta för oss om vad du säljer och varför det är värdefullt.
        </p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Titel <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={data.title}
          onChange={handleInputChange}
          placeholder="T.ex. Etablerat konsultföretag inom IT"
          className="input-field"
          required
          maxLength={100}
        />
        <p className="text-xs text-nordic-gray-500 mt-1">
          {data.title.length}/100 tecken
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-nordic-gray-700 mb-3">
          Kategori <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map(category => (
            <button
              key={category.value}
              type="button"
              onClick={() => handleCategoryChange(category.value as ListingCategory)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                data.category === category.value
                  ? 'border-nordic-blue-500 bg-nordic-blue-50 text-nordic-blue-700'
                  : 'border-nordic-gray-200 hover:border-nordic-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{category.label}</div>
              <div className="text-xs text-nordic-gray-500 mt-1">
                {category.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Short Description */}
      <div>
        <label htmlFor="shortDescription" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Kort beskrivning
        </label>
        <input
          type="text"
          id="shortDescription"
          name="shortDescription"
          value={data.shortDescription}
          onChange={handleInputChange}
          placeholder="En kort sammanfattning i 1-2 meningar"
          className="input-field"
          maxLength={200}
        />
        <p className="text-xs text-nordic-gray-500 mt-1">
          {data.shortDescription.length}/200 tecken
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-nordic-gray-700 mb-2">
          Detaljerad beskrivning <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={data.description}
          onChange={handleInputChange}
          placeholder="Beskriv verksamheten, vad som ingår, varför den säljs, och andra viktiga detaljer..."
          className="input-field min-h-[120px]"
          required
          maxLength={2000}
        />
        <p className="text-xs text-nordic-gray-500 mt-1">
          {data.description.length}/2000 tecken
        </p>
      </div>

      {/* Subcategory */}
      {data.category && (
        <div>
          <label htmlFor="subcategory" className="block text-sm font-medium text-nordic-gray-700 mb-2">
            Underkategori (valfritt)
          </label>
          <input
            type="text"
            id="subcategory"
            name="subcategory"
            value={data.subcategory}
            onChange={handleInputChange}
            placeholder="T.ex. Webbutveckling, E-handel, Konsulttjänster"
            className="input-field"
            maxLength={50}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-6 border-t border-nordic-gray-200">
        <button
          type="submit"
          disabled={!isValid}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isValid
              ? 'bg-nordic-blue-600 text-white hover:bg-nordic-blue-700'
              : 'bg-nordic-gray-300 text-nordic-gray-500 cursor-not-allowed'
          }`}
        >
          Fortsätt →
        </button>
      </div>
    </form>
  );
};

export default BasicInfoStep;