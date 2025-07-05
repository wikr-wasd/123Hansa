import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock listings data för testing
const mockListings = [
  {
    id: '1',
    title: 'TechStartup AB',
    category: 'companies',
    subcategory: 'tech',
    askingPrice: 2500000,
    currency: 'SEK',
    location: 'Stockholm',
    description: 'Innovativt teknikföretag med stark tillväxt inom AI och maskininlärning. Etablerat 2020 med stabil kundkrets.',
    highlights: ['AI-teknik', 'Stark tillväxt', 'Erfaren team'],
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'],
    seller: {
      name: 'Anna Karlsson',
      verified: true,
      joinedDate: '2024-06-20'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-20',
    viewCount: 156,
    interestedBuyers: 8,
    owner: {
      firstName: 'Anna',
      lastName: 'Karlsson'
    }
  },
  {
    id: '2',
    title: 'E-handelssajt inom Mode',
    category: 'ecommerce',
    subcategory: 'fashion',
    askingPrice: 850000,
    currency: 'SEK',
    location: 'Göteborg',
    description: 'Välestablerad e-handel inom mode med egen varumärke. Stark återkommande kundkrets.',
    highlights: ['Egen varumärke', 'Återkommande kunder', 'Etablerat brand'],
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'],
    seller: {
      name: 'Erik Johansson',
      verified: true,
      joinedDate: '2024-05-15'
    },
    status: 'ACTIVE',
    createdAt: '2024-05-15',
    viewCount: 234,
    interestedBuyers: 12,
    owner: {
      firstName: 'Erik',
      lastName: 'Johansson'
    }
  },
  {
    id: '3',
    title: 'SaaS Platform för Projekthantering',
    category: 'digital',
    subcategory: 'saas',
    askingPrice: 4200000,
    currency: 'SEK',
    location: 'Malmö',
    description: 'Modern SaaS-plattform för projekthantering med över 500 betalande kunder.',
    highlights: ['500+ kunder', 'Återkommande intäkter', 'Skalbar teknik'],
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'],
    seller: {
      name: 'Sara Lindberg',
      verified: true,
      joinedDate: '2024-04-10'
    },
    status: 'ACTIVE',
    createdAt: '2024-04-10',
    viewCount: 412,
    interestedBuyers: 23,
    owner: {
      firstName: 'Sara',
      lastName: 'Lindberg'
    }
  }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Simulate filtering and search
      let filteredListings = [...mockListings];
      
      const { q, category, sortBy } = req.query;
      
      // Filter by search query
      if (q && typeof q === 'string') {
        filteredListings = filteredListings.filter(listing =>
          listing.title.toLowerCase().includes(q.toLowerCase()) ||
          listing.description.toLowerCase().includes(q.toLowerCase())
        );
      }
      
      // Filter by category
      if (category && typeof category === 'string') {
        filteredListings = filteredListings.filter(listing =>
          listing.category === category
        );
      }
      
      // Sort listings
      if (sortBy === 'price_low') {
        filteredListings.sort((a, b) => a.askingPrice - b.askingPrice);
      } else if (sortBy === 'price_high') {
        filteredListings.sort((a, b) => b.askingPrice - a.askingPrice);
      } else if (sortBy === 'popular') {
        filteredListings.sort((a, b) => b.viewCount - a.viewCount);
      } else {
        // Default: newest first
        filteredListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const response = {
        success: true,
        data: {
          listings: filteredListings,
          totalCount: filteredListings.length,
          hasMore: false,
          stats: {
            activeListings: mockListings.length,
            completedDeals: 45,
            totalValue: 25000000,
            averageTime: 45
          }
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in listings API:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch listings'
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `Method ${req.method} not allowed`
    });
  }
}