import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Briefcase,
  Phone,
  Mail,
  ExternalLink,
  Users
} from 'lucide-react';

interface Professional {
  id: string;
  userId: string;
  professionalTitle: string;
  businessName?: string;
  serviceCategories: string[];
  specializations: string[];
  languages: string[];
  hourlyRate?: number;
  consultationFee?: number;
  currency: string;
  averageRating?: number;
  totalReviews: number;
  completedBookings: number;
  verificationStatus: string;
  isActive: boolean;
  acceptsNewClients: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    country: string;
    isOnline: boolean;
    lastSeenAt?: string;
  };
  serviceListings: Array<{
    id: string;
    title: string;
    category: string;
    basePrice: number;
    currency: string;
    estimatedDuration?: string;
  }>;
  reviews: Array<{
    rating: number;
    comment?: string;
    createdAt: string;
    client: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  }>;
}

interface SearchFilters {
  category?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  verified?: boolean;
  languages?: string[];
  availability?: string;
  sortBy?: string;
}

interface ExpertDirectoryProps {
  onSelectExpert?: (expert: Professional) => void;
  onContactExpert?: (expert: Professional) => void;
  onBookConsultation?: (expert: Professional) => void;
}

const CATEGORIES = [
  { value: 'LEGAL_SERVICES', label: 'Juridiska tjänster', icon: '⚖️' },
  { value: 'BUSINESS_BROKERAGE', label: 'Företagsmäklare', icon: '🏢' },
  { value: 'FINANCIAL_ADVISORY', label: 'Finansiell rådgivning', icon: '💰' },
  { value: 'ACCOUNTING', label: 'Redovisning', icon: '📊' },
  { value: 'BUSINESS_CONSULTING', label: 'Affärskonsulting', icon: '📈' },
  { value: 'DUE_DILIGENCE', label: 'Due Diligence', icon: '🔍' },
  { value: 'VALUATION_SERVICES', label: 'Värderingstjänster', icon: '💎' },
  { value: 'TAX_ADVISORY', label: 'Skatterådgivning', icon: '📋' },
  { value: 'MERGER_ACQUISITION', label: 'M&A', icon: '🤝' },
  { value: 'CONTRACT_REVIEW', label: 'Avtalsgenomgång', icon: '📄' }
];

const LANGUAGES = [
  { value: 'sv', label: 'Svenska' },
  { value: 'en', label: 'Engelska' },
  { value: 'no', label: 'Norska' },
  { value: 'da', label: 'Danska' },
  { value: 'de', label: 'Tyska' },
  { value: 'fr', label: 'Franska' }
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Högst betyg' },
  { value: 'price', label: 'Lägsta pris' },
  { value: 'experience', label: 'Mest erfarna' },
  { value: 'recent', label: 'Senast tillagda' }
];

export const ExpertDirectory: React.FC<ExpertDirectoryProps> = ({
  onSelectExpert,
  onContactExpert,
  onBookConsultation
}) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const itemsPerPage = 12;

  // Load professionals
  const loadProfessionals = async (page = 1, reset = false) => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      
      if (searchTerm) {
        // För nu söker vi i beskrivning/titel via keywords
        queryParams.append('keywords', searchTerm);
      }
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.priceMin) queryParams.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax) queryParams.append('priceMax', filters.priceMax.toString());
      if (filters.rating) queryParams.append('rating', filters.rating.toString());
      if (filters.verified) queryParams.append('verified', 'true');
      if (filters.languages?.length) queryParams.append('languages', filters.languages.join(','));
      if (filters.availability) queryParams.append('availability', filters.availability);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      
      queryParams.append('limit', itemsPerPage.toString());
      queryParams.append('offset', ((page - 1) * itemsPerPage).toString());

      const response = await fetch(`/api/professionals/search?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        if (reset || page === 1) {
          setProfessionals(data.data.professionals);
        } else {
          setProfessionals(prev => [...prev, ...data.data.professionals]);
        }
        setTotalCount(data.data.totalCount);
        setHasMore(data.data.hasMore);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfessionals(1, true);
  }, [searchTerm, filters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadProfessionals(currentPage + 1, false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency || 'SEK',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Okänt';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Aktiv nu';
    if (diffInHours < 24) return `Aktiv för ${diffInHours}h sedan`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Aktiv för ${diffInDays}d sedan`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expertdirectory</h1>
        <p className="text-lg text-gray-600">
          Hitta verifierade experter för dina företagsbehov
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Sök efter experter, specialiseringar eller tjänster..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alla kategorier</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plats
              </label>
              <select
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alla platser</option>
                <option value="SE">Sverige</option>
                <option value="NO">Norge</option>
                <option value="DK">Danmark</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timpris (SEK)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin || ''}
                  onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax || ''}
                  onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sortera
              </label>
              <select
                value={filters.sortBy || 'rating'}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="md:col-span-3 lg:col-span-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Rensa filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-gray-600">
          Visar {professionals.length} av {totalCount} experter
        </p>
      </div>

      {/* Expert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {professionals.map((professional) => (
          <div
            key={professional.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {professional.user.avatar ? (
                      <img
                        src={professional.user.avatar}
                        alt={`${professional.user.firstName} ${professional.user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                    {professional.user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {professional.user.firstName} {professional.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{professional.professionalTitle}</p>
                  </div>
                </div>
                {professional.verificationStatus === 'VERIFIED' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>

              {/* Business Name */}
              {professional.businessName && (
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {professional.businessName}
                </p>
              )}

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {professional.averageRating?.toFixed(1) || 'Nytt'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({professional.totalReviews} recensioner)
                </span>
                <span className="text-sm text-gray-500">
                  • {professional.completedBookings} genomförda uppdrag
                </span>
              </div>

              {/* Specializations */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {professional.specializations.slice(0, 3).map((spec, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                  {professional.specializations.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                      +{professional.specializations.length - 3} till
                    </span>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  {professional.hourlyRate && (
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(professional.hourlyRate, professional.currency)}/tim
                    </p>
                  )}
                  {professional.consultationFee && (
                    <p className="text-sm text-gray-600">
                      Konsultation: {formatPrice(professional.consultationFee, professional.currency)}
                    </p>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{professional.user.country === 'SE' ? 'Sverige' : professional.user.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatLastSeen(professional.user.lastSeenAt)}</span>
                </div>
              </div>

              {/* Languages */}
              <div className="text-sm text-gray-600 mb-4">
                <strong>Språk:</strong> {professional.languages.join(', ')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectExpert?.(professional)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Visa profil
                </button>
                <button
                  onClick={() => onContactExpert?.(professional)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  title="Kontakta expert"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onBookConsultation?.(professional)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  title="Boka konsultation"
                >
                  <Briefcase className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && professionals.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* No Results */}
      {!loading && professionals.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Inga experter hittades
          </h3>
          <p className="text-gray-600 mb-4">
            Prova att ändra dina sökkriterier eller filter
          </p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Rensa alla filter
          </button>
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Ladda fler experter
          </button>
        </div>
      )}
    </div>
  );
};