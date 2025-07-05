import { VercelRequest, VercelResponse } from '@vercel/node';

// Använd samma data som i listings.ts - alla 30 annonser med komplett information
const mockListings = [
  {
    id: '1',
    title: 'TechStartup AB - AI & Maskininlärning',
    category: 'companies',
    subcategory: 'tech',
    askingPrice: 2500000,
    currency: 'SEK',
    location: 'Stockholm',
    description: 'Innovativt teknikföretag med stark tillväxt inom AI och maskininlärning. Etablerat 2020 med stabil kundkrets och flera stora B2B-kontrakt. Företaget har utvecklat en unik AI-plattform som hjälper företag automatisera komplexa beslut.',
    highlights: ['AI-teknik', 'Stark tillväxt', 'Erfaren team', '15 anställda'],
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop'
    ],
    seller: { name: 'Anna Karlsson', verified: true, joinedDate: '2024-06-20' },
    status: 'ACTIVE',
    createdAt: '2024-06-20',
    viewCount: 156,
    interestedBuyers: 8,
    owner: { firstName: 'Anna', lastName: 'Karlsson' },
    monthlyRevenue: 450000,
    monthlyProfit: 180000,
    employees: 15,
    establishedYear: 2020,
    website: 'https://techstartup-ai.se',
    reasonForSale: 'Grundaren vill fokusera på nästa projekt inom kvantdatorer',
    includedAssets: ['Alla IP-rättigheter', 'Kundkontrakt', 'Teknikplattform', 'Team', 'Kontorsutrustning'],
    isNegotiable: true,
    businessType: 'AB'
  },
  {
    id: '2',
    title: 'Nordic Fashion E-handel',
    category: 'ecommerce',
    subcategory: 'fashion',
    askingPrice: 850000,
    currency: 'SEK',
    location: 'Göteborg',
    description: 'Välestablerad e-handel inom mode med egen varumärke. Stark återkommande kundkrets och växande försäljning. Specialiserat på hållbar mode för den miljömedvetna konsumenten.',
    highlights: ['Egen varumärke', 'Återkommande kunder', 'Etablerat brand', 'Hållbar mode'],
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&h=600&fit=crop'
    ],
    seller: { name: 'Erik Johansson', verified: true, joinedDate: '2024-05-15' },
    status: 'ACTIVE',
    createdAt: '2024-05-15',
    viewCount: 234,
    interestedBuyers: 12,
    owner: { firstName: 'Erik', lastName: 'Johansson' },
    monthlyRevenue: 125000,
    monthlyProfit: 35000,
    employees: 3,
    establishedYear: 2019,
    website: 'https://nordicfashion.se',
    reasonForSale: 'Flytt utomlands för familjeförhållanden',
    includedAssets: ['Lager (värde 200k)', 'Webbplats', 'Varumärke', 'Kundregister', 'Leverantörsavtal'],
    isNegotiable: true,
    businessType: 'AB'
  },
  {
    id: '3',
    title: 'ProjectFlow SaaS - Projekthantering',
    category: 'digital',
    subcategory: 'saas',
    askingPrice: 4200000,
    currency: 'SEK',
    location: 'Malmö',
    description: 'Modern SaaS-plattform för projekthantering med över 500 betalande kunder. Stark tillväxt och återkommande intäkter. Integrationer med Slack, Microsoft Teams och Google Workspace.',
    highlights: ['500+ kunder', 'Återkommande intäkter', 'Skalbar teknik', 'API-integrationer'],
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop'
    ],
    seller: { name: 'Sara Lindberg', verified: true, joinedDate: '2024-04-10' },
    status: 'ACTIVE',
    createdAt: '2024-04-10',
    viewCount: 412,
    interestedBuyers: 23,
    owner: { firstName: 'Sara', lastName: 'Lindberg' },
    monthlyRevenue: 320000,
    monthlyProfit: 220000,
    employees: 8,
    establishedYear: 2021,
    website: 'https://projectflow.se',
    reasonForSale: 'Vill starta nytt företag inom AI och automation',
    includedAssets: ['SaaS-plattform', 'Kundkontrakt', 'Team', 'IP-rättigheter', 'API-dokumentation'],
    isNegotiable: false,
    businessType: 'AB'
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
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing or invalid listing ID'
        });
      }

      const listing = mockListings.find(l => l.id === id);
      
      if (!listing) {
        return res.status(404).json({
          success: false,
          error: 'Listing not found',
          message: 'Den begärda annonsen kunde inte hittas'
        });
      }

      // Increment view count (in real app this would update database)
      listing.viewCount += 1;

      const response = {
        success: true,
        data: {
          listing: listing
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in listing detail API:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch listing details'
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