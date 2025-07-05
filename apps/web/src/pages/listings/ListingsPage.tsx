import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Building2,
  Globe,
  FileText,
  Briefcase,
  TrendingUp,
  Eye,
  Heart,
  Clock,
  Users,
  CheckCircle,
  Star,
  ArrowUpDown,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import CategoryIcons from '../../components/search/CategoryIcons';

// Types
interface Listing {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  askingPrice: number;
  currency: string;
  location: string;
  description: string;
  highlights: string[];
  images: string[];
  seller: {
    name: string;
    verified: boolean;
    joinedDate: string;
  };
  status: 'ACTIVE' | 'PENDING' | 'SOLD';
  createdAt: string;
  viewCount: number;
  interestedBuyers: number;
  [key: string]: any;
}

interface SearchResponse {
  success: boolean;
  data: {
    listings: Listing[];
    totalCount: number;
    hasMore: boolean;
    stats: {
      activeListings: number;
      completedDeals: number;
      totalValue: number;
      averageTime: number;
    };
  };
}

// Enhanced Category mappings with new categories
const CATEGORY_INFO = {
  companies: { name: 'Företag & Bolag', icon: Building2, color: 'blue' },
  ecommerce: { name: 'E-handel & Webshops', icon: Globe, color: 'green' },
  domains: { name: 'Domäner & Webbplatser', icon: Globe, color: 'purple' },
  content: { name: 'Content & Media', icon: FileText, color: 'orange' },
  social: { name: 'Social Media', icon: Users, color: 'pink' },
  affiliate: { name: 'Affiliate & Passive Income', icon: TrendingUp, color: 'indigo' },
  digital: { name: 'Digitala Tillgångar', icon: Building2, color: 'cyan' },
  documents: { name: 'Dokument & Rättigheter', icon: FileText, color: 'gray' },
  properties: { name: 'Fastigheter & Lokaler', icon: MapPin, color: 'yellow' },
  services: { name: 'Företagstjänster', icon: Briefcase, color: 'red' }
};

const STATUS_INFO = {
  ACTIVE: { name: 'Aktiv', color: 'green' },
  PENDING: { name: 'Under förhandling', color: 'yellow' },
  SOLD: { name: 'Såld', color: 'gray' }
};

const ListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Current filters from URL
  const currentFilters = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    status: searchParams.get('status') || '',
    sortBy: searchParams.get('sortBy') || 'newest'
  };

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        
        const API_URL = import.meta.env.VITE_API_URL || 'https://123hansa.vercel.app/api';
        const response = await fetch(`${API_URL}/listings?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data: SearchResponse = await response.json();
        
        // Transform API data to match component interface
        const transformedListings = data.data.listings.map((listing: any) => ({
          ...listing,
          subcategory: listing.subcategory || '',
          location: listing.location || 'Sverige',
          highlights: listing.highlights || [],
          images: listing.images || [],
          seller: {
            name: listing.owner?.firstName ? `${listing.owner.firstName} ${listing.owner.lastName}` : 'Anonym säljare',
            verified: true,
            joinedDate: listing.createdAt
          },
          viewCount: listing.viewCount || 0,
          interestedBuyers: listing.interestedBuyers || 0
        }));
        
        setListings(transformedListings);
        setStats(data.data.stats || {
          total: transformedListings.length,
          categories: {},
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
          averageTime: 0
        });
      } catch (err) {
        const errorMessage = `Kunde inte hämta annonser. API endpoint: /api/listings`;
        setError(errorMessage);
        console.error('Error fetching listings:', err);
        
        // Fallback: Show some demo data so page isn't completely broken
        const fallbackListings = [
          {
            id: '1',
            title: 'TechStartup AB',
            category: 'Technology',
            subcategory: '',
            askingPrice: 2500000,
            currency: 'SEK',
            location: 'Sverige',
            description: 'Innovativt teknikföretag med stark tillväxt inom AI och maskininlärning.',
            highlights: [],
            images: [],
            seller: {
              name: 'Anna Karlsson',
              verified: true,
              joinedDate: '2024-06-20'
            },
            status: 'ACTIVE' as const,
            createdAt: '2024-06-20',
            viewCount: 0,
            interestedBuyers: 0
          }
        ];
        setListings(fallbackListings);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchParams]);

  // Update filters
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Format price
  const formatPrice = (price: number, currency: string = 'SEK') => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ${currency}`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k ${currency}`;
    }
    return `${price.toLocaleString('sv-SE')} ${currency}`;
  };

  // Get category color classes
  const getCategoryColorClasses = (category: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      pink: 'bg-pink-100 text-pink-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      cyan: 'bg-cyan-100 text-cyan-800',
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800'
    };
    const color = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]?.color || 'blue';
    return colorMap[color as keyof typeof colorMap];
  };

  // Get status color classes
  const getStatusColorClasses = (status: string) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    const color = STATUS_INFO[status as keyof typeof STATUS_INFO]?.color || 'gray';
    return colorMap[color as keyof typeof colorMap];
  };

  // Listing Card Component
  const ListingCard: React.FC<{ listing: Listing; mode: 'grid' | 'list' }> = ({ listing, mode }) => {
    const categoryInfo = CATEGORY_INFO[listing.category as keyof typeof CATEGORY_INFO];
    const IconComponent = categoryInfo?.icon || Building2;
    
    if (mode === 'list') {
      return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
          <div className="flex">
            {/* Image */}
            {listing.images && listing.images.length > 0 && (
              <div className="w-48 h-32 flex-shrink-0">
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop';
                  }}
                />
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <IconComponent className="w-5 h-5 mr-2 text-gray-600" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColorClasses(listing.category)}`}>
                      {categoryInfo?.name}
                    </span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClasses(listing.status)}`}>
                      {STATUS_INFO[listing.status as keyof typeof STATUS_INFO]?.name}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600">
                    <Link to={`/listings/${listing.id}`}>{listing.title}</Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {listing.location}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {listing.viewCount} visningar
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {listing.interestedBuyers} intresserade
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-6">
                  <div className="text-2xl font-bold text-gray-900 mb-3">
                    {formatPrice(listing.askingPrice, listing.currency)}
                  </div>
                  <Link 
                    to={`/listings/${listing.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Visa detaljer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Grid mode
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] group">
        {/* Image with overlay effects */}
        <div className="relative overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <div className="aspect-video overflow-hidden">
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop';
                }}
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <IconComponent className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Category badge overlay */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${getCategoryColorClasses(listing.category)}`}>
              {categoryInfo?.name}
            </span>
          </div>
          
          {/* Status badge overlay */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-lg ${getStatusColorClasses(listing.status)}`}>
              {STATUS_INFO[listing.status as keyof typeof STATUS_INFO]?.name}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            <Link to={`/listings/${listing.id}`}>{listing.title}</Link>
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{listing.description}</p>
          
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <MapPin className="w-3 h-3 mr-1" />
            {listing.location}
          </div>
          
          {/* Stats row */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {listing.viewCount} visningar
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {listing.interestedBuyers} intresserade
            </div>
          </div>
          
          {/* Price and CTA */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(listing.askingPrice, listing.currency)}
              </div>
            </div>
            
            <Link 
              to={`/listings/${listing.id}`}
              className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Visa detaljer
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{currentFilters.q ? `"${currentFilters.q}" - ` : ''}Annonser - 123hansa.se</title>
        <meta name="description" content="Utforska företag, digitala tillgångar och affärstjänster till salu på 123hansa.se - Nordens marknadsplats för företag." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {currentFilters.category && CATEGORY_INFO[currentFilters.category as keyof typeof CATEGORY_INFO] 
                  ? CATEGORY_INFO[currentFilters.category as keyof typeof CATEGORY_INFO].name
                  : 'Upptäck Affärsmöjligheter'
                }
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Nordens ledande marknadsplats för företag, digitala tillgångar och affärstjänster
              </p>
              {stats && (
                <p className="text-lg text-white/90 mb-8">
                  {listings.length} av {stats.activeListings?.toLocaleString('sv-SE')} annonser tillgängliga
                </p>
              )}
            </div>
            
            {/* Large Search Bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  value={currentFilters.q}
                  onChange={(e) => updateFilter('q', e.target.value)}
                  placeholder="Sök efter företag, domäner, Instagram-konton, e-handel..."
                  className="w-full pl-16 pr-6 py-5 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                />
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/create-listing"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FileText className="w-5 h-5 mr-2" />
                Lägg till annons
              </Link>
              <button
                onClick={() => {
                  const filterSection = document.querySelector('[class*="bg-white border-b"]');
                  if (filterSection) {
                    filterSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                <Search className="w-5 h-5 mr-2" />
                Utforska annonser
              </button>
            </div>

            {/* Category Icons */}
            <CategoryIcons className="mb-8" />
          </div>
        </section>

        {/* Filters and Controls */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Quick filters */}
                <select
                  value={currentFilters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Alla kategorier</option>
                  {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                    <option key={key} value={key}>{info.name}</option>
                  ))}
                </select>
                
                <select
                  value={currentFilters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Nyast först</option>
                  <option value="oldest">Äldst först</option>
                  <option value="price_low">Lägsta pris</option>
                  <option value="price_high">Högsta pris</option>
                  <option value="popular">Mest populära</option>
                </select>
              </div>
              
              {/* View mode toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plats</label>
                    <input
                      type="text"
                      value={currentFilters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      placeholder="t.ex. Stockholm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min pris (SEK)</label>
                    <input
                      type="number"
                      value={currentFilters.priceMin}
                      onChange={(e) => updateFilter('priceMin', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max pris (SEK)</label>
                    <input
                      type="number"
                      value={currentFilters.priceMax}
                      onChange={(e) => updateFilter('priceMax', e.target.value)}
                      placeholder="Inget max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Laddar annonser...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-800 font-medium mb-2">Kunde inte ladda annonser</p>
                <p className="text-red-600 text-sm">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Försök igen
                </button>
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Inga annonser hittades</h3>
              <p className="text-gray-600">Prova att ändra dina sökkriterier eller filtrera på en annan kategori.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} mode={viewMode} />
              ))}
            </div>
          )}
        </div>

        {/* How It Works Section */}
        {!loading && !error && listings.length > 0 && (
          <>
            {/* How It Works */}
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Så Funkar Det
                  </h2>
                  <p className="text-xl text-gray-600">
                    Enkel och säker process för både köpare och säljare
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  {/* For Sellers */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                      För Säljare
                    </h3>
                    <div className="space-y-6">
                      {[
                        {
                          step: 1,
                          title: 'Skapa din annons',
                          description: 'Lägg upp företaget, webbsidan eller digitala tillgången med bilder och detaljerad information.',
                          icon: <FileText className="w-6 h-6" />
                        },
                        {
                          step: 2,
                          title: 'Ta emot intresse',
                          description: 'Få bud och meddelanden från kvalificerade köpare som är genuint intresserade.',
                          icon: <Users className="w-6 h-6" />
                        },
                        {
                          step: 3,
                          title: 'Genomför affären',
                          description: 'Förhandla villkor och genomför en säker överlåtelse med vårt stöd.',
                          icon: <CheckCircle className="w-6 h-6" />
                        }
                      ].map((item) => (
                        <div key={item.step} className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {item.step}. {item.title}
                            </h4>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* For Buyers */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                      För Köpare
                    </h3>
                    <div className="space-y-6">
                      {[
                        {
                          step: 1,
                          title: 'Utforska annonser',
                          description: 'Bläddra bland tusentals företag, webbsidor och digitala tillgångar från hela Norden.',
                          icon: <Search className="w-6 h-6" />
                        },
                        {
                          step: 2,
                          title: 'Lämna bud',
                          description: 'Kontakta säljare och lämna seriösa bud på de tillgångar som intresserar dig.',
                          icon: <DollarSign className="w-6 h-6" />
                        },
                        {
                          step: 3,
                          title: 'Överta verksamheten',
                          description: 'Slutför köpet och ta över en fungerande verksamhet redo att utvecklas vidare.',
                          icon: <TrendingUp className="w-6 h-6" />
                        }
                      ].map((item) => (
                        <div key={item.step} className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {item.step}. {item.title}
                            </h4>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Redo att Starta din Affärsresa?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Oavsett om du vill sälja ditt företag eller köpa din nästa affärsmöjlighet - vi hjälper dig komma igång idag.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/create-listing"
                    className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Sälja Ditt Företag
                  </Link>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Hitta Affärsmöjligheter
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
};

export default ListingsPage;