import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BusinessListing {
  id: string;
  title: string;
  description: string;
  sector: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  price: {
    amount: number;
    currency: string;
    type: 'FIXED' | 'NEGOTIABLE' | 'AUCTION';
  };
  financials: {
    revenue: number;
    ebitda: number;
    employees: number;
    yearEstablished: number;
  };
  features: string[];
  images: string[];
  sellerId: string;
  seller: {
    name: string;
    verified: boolean;
    rating: number;
    totalTransactions: number;
  };
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'WITHDRAWN';
  viewCount: number;
  favoriteCount: number;
  inquiryCount: number;
  listedAt: Date;
  updatedAt: Date;
  premium: boolean;
  featured: boolean;
}

interface BusinessInquiry {
  id: string;
  listingId: string;
  buyerId: string;
  type: 'MESSAGE' | 'OFFER' | 'QUESTION';
  message: string;
  offerAmount?: number;
  status: 'PENDING' | 'REPLIED' | 'ACCEPTED' | 'DECLINED';
  createdAt: Date;
}

interface SearchFilters {
  sector?: string[];
  location?: {
    cities?: string[];
    regions?: string[];
    maxDistance?: number;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  revenueRange?: {
    min?: number;
    max?: number;
  };
  employeeRange?: {
    min?: number;
    max?: number;
  };
  features?: string[];
  listingAge?: number; // days
}

class BusinessListingService {
  // Get mock business listings
  async getBusinessListings(
    page = 1,
    limit = 20,
    filters?: SearchFilters
  ): Promise<{
    listings: BusinessListing[];
    totalCount: number;
    hasNextPage: boolean;
  }> {
    try {
      // Generate mock listings for demo
      const mockListings = this.generateMockListings();
      
      // Apply filters
      let filteredListings = this.applyFilters(mockListings, filters);
      
      // Sort by relevance/date
      filteredListings = this.sortListings(filteredListings);
      
      // Paginate
      const startIndex = (page - 1) * limit;
      const paginatedListings = filteredListings.slice(startIndex, startIndex + limit);
      
      return {
        listings: paginatedListings,
        totalCount: filteredListings.length,
        hasNextPage: startIndex + limit < filteredListings.length,
      };
    } catch (error) {
      console.error('Failed to get business listings:', error);
      throw new Error('Failed to retrieve business listings');
    }
  }

  // Get single business listing
  async getBusinessListing(id: string): Promise<BusinessListing | null> {
    try {
      const mockListings = this.generateMockListings();
      const listing = mockListings.find(l => l.id === id);
      
      if (listing) {
        // Increment view count
        listing.viewCount += 1;
      }
      
      return listing || null;
    } catch (error) {
      console.error('Failed to get business listing:', error);
      return null;
    }
  }

  // Submit inquiry (message, offer, question)
  async submitInquiry(
    listingId: string,
    buyerId: string,
    type: 'MESSAGE' | 'OFFER' | 'QUESTION',
    message: string,
    offerAmount?: number
  ): Promise<BusinessInquiry> {
    try {
      const inquiry: BusinessInquiry = {
        id: `inquiry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        listingId,
        buyerId,
        type,
        message,
        offerAmount,
        status: 'PENDING',
        createdAt: new Date(),
      };

      // In production, save to database
      console.log('New inquiry submitted:', inquiry);

      return inquiry;
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      throw new Error('Failed to submit inquiry');
    }
  }

  // Toggle favorite listing
  async toggleFavorite(listingId: string, userId: string): Promise<{ isFavorited: boolean }> {
    try {
      // In production, check database for existing favorite
      const isFavorited = Math.random() > 0.5; // Mock toggle
      
      // Update favorite count
      const mockListings = this.generateMockListings();
      const listing = mockListings.find(l => l.id === listingId);
      if (listing) {
        listing.favoriteCount += isFavorited ? 1 : -1;
      }

      return { isFavorited };
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw new Error('Failed to toggle favorite');
    }
  }

  // Get featured listings
  async getFeaturedListings(limit = 6): Promise<BusinessListing[]> {
    try {
      const mockListings = this.generateMockListings();
      return mockListings
        .filter(listing => listing.featured)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get featured listings:', error);
      throw new Error('Failed to get featured listings');
    }
  }

  // Get similar listings
  async getSimilarListings(listingId: string, limit = 4): Promise<BusinessListing[]> {
    try {
      const mockListings = this.generateMockListings();
      const currentListing = mockListings.find(l => l.id === listingId);
      
      if (!currentListing) {
        return [];
      }

      // Find similar listings by sector and price range
      const similarListings = mockListings
        .filter(listing => 
          listing.id !== listingId &&
          listing.sector === currentListing.sector &&
          Math.abs(listing.price.amount - currentListing.price.amount) / currentListing.price.amount < 0.5
        )
        .slice(0, limit);

      return similarListings;
    } catch (error) {
      console.error('Failed to get similar listings:', error);
      return [];
    }
  }

  // Private helper methods
  private generateMockListings(): BusinessListing[] {
    return [
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
  }

  private applyFilters(listings: BusinessListing[], filters?: SearchFilters): BusinessListing[] {
    if (!filters) return listings;

    let filtered = listings;

    // Sector filter
    if (filters.sector && filters.sector.length > 0) {
      filtered = filtered.filter(listing => filters.sector!.includes(listing.sector));
    }

    // Location filter
    if (filters.location) {
      if (filters.location.cities && filters.location.cities.length > 0) {
        filtered = filtered.filter(listing => 
          filters.location!.cities!.includes(listing.location.city)
        );
      }
      if (filters.location.regions && filters.location.regions.length > 0) {
        filtered = filtered.filter(listing => 
          filters.location!.regions!.includes(listing.location.region)
        );
      }
    }

    // Price range filter
    if (filters.priceRange) {
      if (filters.priceRange.min) {
        filtered = filtered.filter(listing => listing.price.amount >= filters.priceRange!.min!);
      }
      if (filters.priceRange.max) {
        filtered = filtered.filter(listing => listing.price.amount <= filters.priceRange!.max!);
      }
    }

    // Revenue range filter
    if (filters.revenueRange) {
      if (filters.revenueRange.min) {
        filtered = filtered.filter(listing => listing.financials.revenue >= filters.revenueRange!.min!);
      }
      if (filters.revenueRange.max) {
        filtered = filtered.filter(listing => listing.financials.revenue <= filters.revenueRange!.max!);
      }
    }

    // Employee range filter
    if (filters.employeeRange) {
      if (filters.employeeRange.min) {
        filtered = filtered.filter(listing => listing.financials.employees >= filters.employeeRange!.min!);
      }
      if (filters.employeeRange.max) {
        filtered = filtered.filter(listing => listing.financials.employees <= filters.employeeRange!.max!);
      }
    }

    // Features filter
    if (filters.features && filters.features.length > 0) {
      filtered = filtered.filter(listing => 
        filters.features!.some(feature => 
          listing.features.some(listingFeature => 
            listingFeature.toLowerCase().includes(feature.toLowerCase())
          )
        )
      );
    }

    return filtered;
  }

  private sortListings(listings: BusinessListing[]): BusinessListing[] {
    return listings.sort((a, b) => {
      // Premium listings first
      if (a.premium && !b.premium) return -1;
      if (!a.premium && b.premium) return 1;
      
      // Featured listings next
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then by update date (newest first)
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }
}

export { BusinessListingService, BusinessListing, BusinessInquiry, SearchFilters };