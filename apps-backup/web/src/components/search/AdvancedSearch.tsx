import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, MapPin, DollarSign, Calendar, Building } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchFilters {
  query: string;
  category: string[];
  priceRange: { min: number; max: number };
  location: string[];
  dateRange: { start: string; end: string };
  status: string[];
  featured: boolean;
  verified: boolean;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  totalResults: number;
  isLoading: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  totalResults,
  isLoading
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: [],
    priceRange: { min: 0, max: 50000000 },
    location: [],
    dateRange: { start: '', end: '' },
    status: ['ACTIVE'],
    featured: false,
    verified: false
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const debouncedQuery = useDebounce(filters.query, 300);

  // Categories for Swedish business marketplace
  const categories = [
    'Teknik & IT',
    'E-handel',
    'Restaurang & Mat',
    'Hälsa & Vård',
    'Konsult & Tjänster',
    'Tillverkning',
    'Handel & Återförsäljning',
    'Transport & Logistik',
    'Fastighet',
    'Utbildning',
    'Media & Reklam',
    'Energi & Miljö'
  ];

  const locations = [
    'Stockholm',
    'Göteborg', 
    'Malmö',
    'Uppsala',
    'Linköping',
    'Örebro',
    'Västerås',
    'Norrköping',
    'Helsingborg',
    'Jönköping',
    'Umeå',
    'Gävle'
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Aktiv' },
    { value: 'PENDING', label: 'Väntar granskning' },
    { value: 'SOLD', label: 'Såld' },
    { value: 'FEATURED', label: 'Utvald' }
  ];

  // Auto-search when filters change
  useEffect(() => {
    onSearch(filters);
  }, [debouncedQuery, filters.category, filters.priceRange, filters.location, filters.status, filters.featured, filters.verified]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'category' | 'location' | 'status', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: [],
      priceRange: { min: 0, max: 50000000 },
      location: [],
      dateRange: { start: '', end: '' },
      status: ['ACTIVE'],
      featured: false,
      verified: false
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category.length > 0) count++;
    if (filters.location.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 50000000) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.featured) count++;
    if (filters.verified) count++;
    return count;
  }, [filters]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      {/* Main Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Sök företag, kategorier, platser..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center px-4 py-3 border rounded-lg font-medium transition-colors ${
            showAdvanced || activeFiltersCount > 0
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 mb-4">
        {totalResults.toLocaleString('sv-SE')} resultat funna
        {filters.query && ` för "${filters.query}"`}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Building className="w-4 h-4 inline mr-2" />
                Kategorier
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      onChange={() => toggleArrayFilter('category', category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Platser
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {locations.map(location => (
                  <label key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.location.includes(location)}
                      onChange={() => toggleArrayFilter('location', location)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Prisintervall (SEK)
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.priceRange.min || ''}
                    onChange={(e) => handleFilterChange('priceRange', {
                      ...filters.priceRange,
                      min: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                  <input
                    type="number"
                    placeholder="50,000,000"
                    value={filters.priceRange.max === 50000000 ? '' : filters.priceRange.max}
                    onChange={(e) => handleFilterChange('priceRange', {
                      ...filters.priceRange,
                      max: parseInt(e.target.value) || 50000000
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Endast utvalda annonser</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => handleFilterChange('verified', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Endast verifierade säljare</span>
            </label>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4 mr-1" />
                Rensa alla filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;