import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  DollarSign,
  Building,
  TrendingUp,
  Grid3X3,
  List,
  ChevronDown,
  Users,
  Calendar
} from 'lucide-react';
import BusinessCard from './BusinessCard';
import { BusinessListing, SearchFilters } from '../../types/business';

// Mock data - in production this would come from API
const mockListings: BusinessListing[] = [
  {
    id: 'listing-1',
    title: 'Lönsam Tech-startup inom AI & Automation',
    description: 'Välestablerat tech-företag specialiserat på AI-lösningar för småföretag. Stark tillväxt de senaste 3 åren med återkommande intäkter från SaaS-produkter. Komplett team, moderna system och skalbar arkitektur.',
    sector: 'Technology',
    location: {
      city: 'Stockholm',
      region: 'Stockholm',
      country: 'Sweden',
    },
    price: {
      amount: 8500000,
      currency: 'SEK',
      type: 'NEGOTIABLE',
    },
    financials: {
      revenue: 4200000,
      ebitda: 1260000,
      employees: 12,
      yearEstablished: 2019,
    },
    features: [
      'SaaS-produkter',
      'Återkommande intäkter',
      'Skalbar arkitektur',
      'Kompetent team',
      'Moderna system',
      'AI-teknologi',
    ],
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller-1',
    seller: {
      name: 'Anna Lindström',
      verified: true,
      rating: 4.8,
      totalTransactions: 3,
    },
    status: 'ACTIVE',
    viewCount: 247,
    favoriteCount: 18,
    inquiryCount: 9,
    listedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    premium: true,
    featured: true,
  },
  {
    id: 'listing-2',
    title: 'Etablerad Restaurang i Göteborg Centrum',
    description: 'Populär restaurang med 25 års historia i hjärtat av Göteborg. Fullt utrustat kök, 60 sittplatser, stark lokal kundkrets och utmärkt rykte. Perfekt för någon som vill ta över en lönsam verksamhet.',
    sector: 'Retail',
    location: {
      city: 'Göteborg',
      region: 'Västra Götaland',
      country: 'Sweden',
    },
    price: {
      amount: 3200000,
      currency: 'SEK',
      type: 'FIXED',
    },
    financials: {
      revenue: 2800000,
      ebitda: 560000,
      employees: 8,
      yearEstablished: 1999,
    },
    features: [
      'Centralt läge',
      'Fullt utrustat',
      'Etablerad kundkrets',
      'Serveringstillstånd',
      '60 sittplatser',
      'Stark lönsamhet',
    ],
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller-2',
    seller: {
      name: 'Erik Johansson',
      verified: true,
      rating: 4.6,
      totalTransactions: 1,
    },
    status: 'ACTIVE',
    viewCount: 189,
    favoriteCount: 12,
    inquiryCount: 6,
    listedAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    premium: false,
    featured: true,
  },
  {
    id: 'listing-3',
    title: 'Produktionsföretag inom Metallbearbetning',
    description: 'Välkänt metallbearbetningsföretag med moderna maskiner och långa kundkontrakt. Specialiserat på precisionsdel för fordonsindustrin. Stark position på den svenska marknaden.',
    sector: 'Manufacturing',
    location: {
      city: 'Sandviken',
      region: 'Gävleborg',
      country: 'Sweden',
    },
    price: {
      amount: 15600000,
      currency: 'SEK',
      type: 'NEGOTIABLE',
    },
    financials: {
      revenue: 18500000,
      ebitda: 3200000,
      employees: 25,
      yearEstablished: 2005,
    },
    features: [
      'Moderna maskiner',
      'Långa kontrakt',
      'Fordonsindustrin',
      'Precisionsteknologi',
      'Erfaret team',
      'Stabil kundkrets',
    ],
    images: [
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller-3',
    seller: {
      name: 'Maria Andersson',
      verified: true,
      rating: 4.9,
      totalTransactions: 2,
    },
    status: 'ACTIVE',
    viewCount: 156,
    favoriteCount: 21,
    inquiryCount: 14,
    listedAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-19'),
    premium: true,
    featured: false,
  },
  {
    id: 'listing-4',
    title: 'Digital Marknadsföringsbyrå i Malmö',
    description: 'Snabbväxande digital byrå med fokus på e-handel och B2B-marknadsföring. Välrenommerade kunder, återkommande uppdrag och stark online-närvaro. Fantastisk möjlighet för expansion.',
    sector: 'Services',
    location: {
      city: 'Malmö',
      region: 'Skåne',
      country: 'Sweden',
    },
    price: {
      amount: 4800000,
      currency: 'SEK',
      type: 'NEGOTIABLE',
    },
    financials: {
      revenue: 3600000,
      ebitda: 900000,
      employees: 9,
      yearEstablished: 2018,
    },
    features: [
      'Digital expertis',
      'E-handelsfokus',
      'Återkommande kunder',
      'Stark tillväxt',
      'Kreativt team',
      'Moderna verktyg',
    ],
    images: [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller-4',
    seller: {
      name: 'David Chen',
      verified: true,
      rating: 4.7,
      totalTransactions: 1,
    },
    status: 'ACTIVE',
    viewCount: 203,
    favoriteCount: 15,
    inquiryCount: 8,
    listedAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-21'),
    premium: false,
    featured: true,
  },
  {
    id: 'listing-5',
    title: 'Tandvårdsklinik med Modern Utrustning',
    description: 'Välskött tandvårdsklinik i växande förort. Modern utrustning, digital röntgen, etablerat patientregister med över 1200 aktiva patienter. Möjlighet för expansion med ytterligare behandlingsrum.',
    sector: 'Healthcare',
    location: {
      city: 'Uppsala',
      region: 'Uppsala',
      country: 'Sweden',
    },
    price: {
      amount: 6900000,
      currency: 'SEK',
      type: 'FIXED',
    },
    financials: {
      revenue: 4100000,
      ebitda: 1230000,
      employees: 6,
      yearEstablished: 2012,
    },
    features: [
      'Modern utrustning',
      'Digital röntgen',
      '1200+ patienter',
      'Etablerat varumärke',
      'Expansionsmöjlighet',
      'Erfaren personal',
    ],
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller-5',
    seller: {
      name: 'Dr. Lisa Holm',
      verified: true,
      rating: 4.9,
      totalTransactions: 0,
    },
    status: 'ACTIVE',
    viewCount: 134,
    favoriteCount: 9,
    inquiryCount: 5,
    listedAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16'),
    premium: true,
    featured: false,
  },
  {
    id: 'listing-6',
    title: 'E-handelsföretag inom Heminredning',
    description: 'Lönsamt e-handelsföretag specialiserat på skandinavisk heminredning. Välkänt varumärke, stark online-närvaro, automatiserade processer och goda relationer med leverantörer.',
    sector: 'Retail',
    location: {
      city: 'Stockholm',
      region: 'Stockholm',
      country: 'Sweden',
    },
    price: {
      amount: 5700000,
      currency: 'SEK',
      type: 'NEGOTIABLE',
    },
    financials: {
      revenue: 7200000,
      ebitda: 1080000,
      employees: 4,
      yearEstablished: 2016,
    },
    features: [
      'E-handel',
      'Välkänt varumärke',
      'Automatiserade processer',
      'Goda leverantörsrelationer',
      'Stark online-närvaro',
      'Lager inkluderat',
    ],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller-6',
    seller: {
      name: 'Sofia Nilsson',
      verified: true,
      rating: 4.5,
      totalTransactions: 2,
    },
    status: 'ACTIVE',
    viewCount: 298,
    favoriteCount: 24,
    inquiryCount: 12,
    listedAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-22'),
    premium: false,
    featured: true,
  },
];

const BusinessListings: React.FC = () => {
  const [listings, setListings] = useState<BusinessListing[]>(mockListings);
  const [filteredListings, setFilteredListings] = useState<BusinessListing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter states
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [revenueRange, setRevenueRange] = useState({ min: '', max: '' });
  const [employeeRange, setEmployeeRange] = useState({ min: '', max: '' });

  const sectors = Array.from(new Set(listings.map(l => l.sector)));
  const cities = Array.from(new Set(listings.map(l => l.location.city)));

  // Apply filters and search
  useEffect(() => {
    let filtered = listings;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.sector.toLowerCase().includes(query) ||
        listing.location.city.toLowerCase().includes(query) ||
        listing.features.some(f => f.toLowerCase().includes(query))
      );
    }

    // Sector filter
    if (selectedSectors.length > 0) {
      filtered = filtered.filter(listing => selectedSectors.includes(listing.sector));
    }

    // City filter
    if (selectedCities.length > 0) {
      filtered = filtered.filter(listing => selectedCities.includes(listing.location.city));
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(listing => listing.price.amount >= Number(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(listing => listing.price.amount <= Number(priceRange.max));
    }

    // Revenue range filter
    if (revenueRange.min) {
      filtered = filtered.filter(listing => listing.financials.revenue >= Number(revenueRange.min));
    }
    if (revenueRange.max) {
      filtered = filtered.filter(listing => listing.financials.revenue <= Number(revenueRange.max));
    }

    // Employee range filter
    if (employeeRange.min) {
      filtered = filtered.filter(listing => listing.financials.employees >= Number(employeeRange.min));
    }
    if (employeeRange.max) {
      filtered = filtered.filter(listing => listing.financials.employees <= Number(employeeRange.max));
    }

    // Sort listings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price.amount - b.price.amount;
        case 'price-desc':
          return b.price.amount - a.price.amount;
        case 'revenue-desc':
          return b.financials.revenue - a.financials.revenue;
        case 'employees-desc':
          return b.financials.employees - a.financials.employees;
        case 'popular':
          return (b.viewCount + b.favoriteCount) - (a.viewCount + a.favoriteCount);
        case 'newest':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

    // Premium and featured listings first
    filtered.sort((a, b) => {
      if (a.premium && !b.premium) return -1;
      if (!a.premium && b.premium) return 1;
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    setFilteredListings(filtered);
  }, [listings, searchQuery, selectedSectors, selectedCities, priceRange, revenueRange, employeeRange, sortBy]);

  const handleViewDetails = (id: string) => {
    console.log('View details for listing:', id);
    // In production, navigate to detailed view
  };

  const handleContactSeller = (id: string) => {
    console.log('Contact seller for listing:', id);
    // In production, open contact modal
  };

  const handleMakeOffer = (id: string) => {
    console.log('Make offer for listing:', id);
    // In production, open offer modal
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const clearFilters = () => {
    setSelectedSectors([]);
    setSelectedCities([]);
    setPriceRange({ min: '', max: '' });
    setRevenueRange({ min: '', max: '' });
    setEmployeeRange({ min: '', max: '' });
  };

  const activeFiltersCount = selectedSectors.length + selectedCities.length + 
    (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0) +
    (revenueRange.min ? 1 : 0) + (revenueRange.max ? 1 : 0) +
    (employeeRange.min ? 1 : 0) + (employeeRange.max ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Search and filters header */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Sök efter företag, bransch, ort..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Rensa filter
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Senast uppdaterad</SelectItem>
                <SelectItem value="popular">Mest populära</SelectItem>
                <SelectItem value="price-asc">Pris: Låg till hög</SelectItem>
                <SelectItem value="price-desc">Pris: Hög till låg</SelectItem>
                <SelectItem value="revenue-desc">Högsta omsättning</SelectItem>
                <SelectItem value="employees-desc">Flest anställda</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Avancerade filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sector filter */}
                <div className="space-y-3">
                  <h4 className="font-medium">Bransch</h4>
                  <div className="space-y-2">
                    {sectors.map(sector => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sector-${sector}`}
                          checked={selectedSectors.includes(sector)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSectors([...selectedSectors, sector]);
                            } else {
                              setSelectedSectors(selectedSectors.filter(s => s !== sector));
                            }
                          }}
                        />
                        <label
                          htmlFor={`sector-${sector}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {sector} ({listings.filter(l => l.sector === sector).length})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location filter */}
                <div className="space-y-3">
                  <h4 className="font-medium">Ort</h4>
                  <div className="space-y-2">
                    {cities.map(city => (
                      <div key={city} className="flex items-center space-x-2">
                        <Checkbox
                          id={`city-${city}`}
                          checked={selectedCities.includes(city)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCities([...selectedCities, city]);
                            } else {
                              setSelectedCities(selectedCities.filter(c => c !== city));
                            }
                          }}
                        />
                        <label
                          htmlFor={`city-${city}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {city} ({listings.filter(l => l.location.city === city).length})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div className="space-y-3">
                  <h4 className="font-medium">Prisintervall (SEK)</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Min pris"
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <Input
                      placeholder="Max pris"
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Revenue range */}
                <div className="space-y-3">
                  <h4 className="font-medium">Omsättning (SEK)</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Min omsättning"
                      type="number"
                      value={revenueRange.min}
                      onChange={(e) => setRevenueRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <Input
                      placeholder="Max omsättning"
                      type="number"
                      value={revenueRange.max}
                      onChange={(e) => setRevenueRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Employee range */}
                <div className="space-y-3">
                  <h4 className="font-medium">Antal anställda</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Min antal"
                      type="number"
                      value={employeeRange.min}
                      onChange={(e) => setEmployeeRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <Input
                      placeholder="Max antal"
                      type="number"
                      value={employeeRange.max}
                      onChange={(e) => setEmployeeRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Visar {filteredListings.length} av {listings.length} företag
        </div>
        {searchQuery && (
          <Badge variant="outline">
            Sökning: "{searchQuery}"
          </Badge>
        )}
      </div>

      {/* Listings grid/list */}
      {filteredListings.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredListings.map(listing => (
            <BusinessCard
              key={listing.id}
              listing={listing}
              onViewDetails={handleViewDetails}
              onContactSeller={handleContactSeller}
              onMakeOffer={handleMakeOffer}
              onToggleFavorite={handleToggleFavorite}
              isFavorited={favorites.has(listing.id)}
              className={viewMode === 'list' ? 'flex-row' : ''}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="space-y-3">
            <Building className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-medium">Inga företag hittades</h3>
            <p className="text-gray-600">
              Prova att ändra dina sökkriterier eller filter för att hitta fler resultat.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Rensa alla filter
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BusinessListings;