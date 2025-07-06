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
    description: 'Exceptionell investeringsmöjlighet inom AI-teknik! Detta välestablerade tech-företag har revolutionerat hur småföretag automatiserar sina processer genom innovativa AI-lösningar. Med en imponerande tillväxtresa från 0 till 4,2 miljoner SEK i omsättning på bara 5 år, visar företaget enastående potential. Vår proprietära AI-plattform betjänar över 150 kunder med 98% kundnöjdhet och 85% årlig retention rate. Produktportföljen inkluderar 3 SaaS-produkter med MRR på 280,000 SEK/månad, alla med skalbar molnarkitektur byggd på AWS. Det 12-medlemmarna starka teamet består av seniora utvecklare, AI-specialister och erfarna säljare. Företaget har redan penetrerat den svenska marknaden och planerar expansion till Norge och Danmark. Patent pending på 2 kärnteknologier och etablerade partnerskap med Microsoft och Google Cloud. Detta är din chans att förvärva nästa generations AI-företag med bevisad affärsmodell och exponentiell tillväxtpotential!',
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
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop',
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
    description: 'En kulinarisk pärla i hjärtat av Göteborg väntar på sin nästa kapitel! Denna ikoniska restaurang har varit en hörnsten i Göteborgs matscen i över 25 år och har byggt upp en lojalitetskundbas som få kan matcha. Belägen på den prestigefyllda Avenyn erbjuder restaurangen 60 sittplatser fördelade över två våningar med unik atmosfär och charm. Det fullt utrustade professionella köket är värderat till över 800,000 SEK och inkluderar moderna ugnar, kyl-/fryssystem och ventilation som renoverades 2022. Med serveringstillstånd till 02:00 och etablerade leverantörsrelationer med lokala producenter har restaurangen en genomsnittlig omsättning på 2,8 miljoner SEK årligen. Kundbasen består av 40% stamgäster, 35% turistbesök och 25% företagsluncher. Det erfarna köks- och serviceteamet (8 personer) ingår i överlåtelsen, vilket säkerställer smidig transition. Restaurangen har konsekvent fått toppbetyg på TripAdvisor (4.6/5) och Google (4.8/5). Detta är en unik möjlighet att förvärva en etablerad, lönsam restaurang med bevisat koncept i ett av Göteborgs bästa lägen!',
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
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559329007-40df8ec8c533?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&h=600&fit=crop',
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
    description: 'Industriell excellens med decenniers expertis! Detta framstående metallbearbetningsföretag har etablerat sig som en ledande leverantör av precisionkomponenter till Skandinaviens fordonsindustri. Med 20 års specialiserad erfarenhet och moderna CNC-maskiner värda 8 miljoner SEK, levererar vi kritiska komponenter till Volvo, Scania och andra storkonern. Vår 2,500 kvm produktionsanläggning i Sandviken är fullt certifierad enligt ISO 9001:2015 och ISO/TS 16949 för fordonsindustrin. Portföljen inkluderar 15 olika produktlinjer med långsiktiga ramavtal (ø 3-5 år) som garanterar 78% av årsomsattningen. Det 25-medlemmarna starka teamet består av erfarna maskinoperatörer, kvalitetsingenjörer och produktionsledare med genomsnittligt 12 års branschexpertis. Senaste åren har företaget konsekvent levererat EBITDA-marginaler på 17-19% med stark kassaflödesgenerering. Vår strategiska position och etablerade kundrelationer gör detta till en ideal förvärvskanditat för industriella konglomererat eller private equity som söker stabila, kassagenererande tillgångar.',
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
      'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
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
    description: 'Digitaliseringens framtid börjar här! Denna snabbväxande digitala marknadsföringsbyrå har på bara 6 år blivit en av Skånes mest respekterade digitala partners. Specialiserade på e-handelsoptimering och B2B-leadgenerering betjänar vi 45+ kunder från startups till börsnoterade bolag. Vårt team på 9 specialister inkluderar certifierade Google Ads-experter, SEO-strategiska, content creators och dataanalytiker. Portföljen spänner över e-handelsprojekt som genererat 125+ miljoner SEK i extra försäljning för kunder senaste året. Med 78% återkommande kunder och genomsnittliga projektvärden på 35,000 SEK driver vi konsekvent 25% årlig tillväxt. Vårt moderna 200 kvm kontor i centrala Malmö är fullt utrustat med toppmodern teknik och kreativa studios. Certifieringar inkluderar Google Premier Partner, Meta Business Partner och HubSpot Platinum. Med stark pipeline (2,1 miljoner SEK i återstående projekt) och expanderande nordisk kundkrets är detta den perfekta tidpunkten för en strategisk förvärvare att accelerera vår tillväxtresa!',
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
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
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
    description: 'En väletablerad tandvårdspraktik som representerar hälsovårdens framtid! Denna moderna klinik har under 12 år byggt upp en imponerande patientbas på 1,247 aktiva patienter i Uppsala snabbväxande förorter. Kliniken är fullt utrustad med toppmodern teknologi värd 1,8 miljoner SEK, inklusive digital röntgen, CAD/CAM-system för samma-dag-kronor, laserteknik och intraoral kameror. Våra 4 behandlingsrum genererar genomsnittligt 4,1 miljoner SEK årligen med 30% EBITDA-marginal tack vare effektiva processer och hög patientnoja (4.9/5 på 1177.se). Det erfarna teamet inkluderar leg. tandläkare Dr. Lisa Holm, 2 tandhygienister och 3 tandsköterskor med genomsnittligt 8 års klinisk erfarenhet. Klinikens 320 kvm lokaler är strategiskt placerade i hälsocenter med apotek och fysioterapi, vilket säkerställer hög fotstrom. Med väntlista på 3 månader och planerad expansion till ytterligare 2 behandlingsrum finns enorma tillväxtmöjligheter. Detta är en sunderbar möjlighet för tandläkare eller hälsovårdsinvesterare att förvärva en väletablerad, lönsam praktik med bevisad affärsmodell!',
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
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
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
    description: 'E-handelns nästa storsuccé väntar på dig! Detta lönsamma e-handelsföretag har under 8 år utvecklat ett starkt varumärke inom skandinavisk heminredning med över 45,000 nöjda kunder. Vår kurerade produktportfölj med 850+ SKUs spänner från handgjorda textilier till designmöbler, alla med fokus på nordisk estetik och hållbarhet. Den fullt automatiserade e-handelsplattformen genererar 7,2 miljoner SEK årligen med imponerande 15% nettomarginaler. Vårt 800 kvm lager i Kungens Kurva är strategiskt placerat för effektiv distribution med genomsnittliga leveranstider på 1.2 dagar. Etablerade leverantörsrelationer med 25+ nordiska designers och producenter säkerställer exklusiva produkter och gynnsamma marginaler. Det läna teamet på 4 personer hanterar alla aspekter från inköp till kundservice med hjälp av modern automation. Online-närvaron inkluderar 18,000 Instagram-följare, 12,000 nyhetsbrevsprenumeranter och topprankningar för 200+ sökord. Med 68% återkommande kunder och genomsnittlig ordervärde på 1,450 SEK är detta en fantastisk möjlighet för e-handelsentusiaster eller lifestyle-investerare att förvärva ett väletablerat, skalbart företag!',
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
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop',
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