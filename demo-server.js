const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Mock data for all asset types based on specification
const MOCK_LISTINGS = [
  // FÖRETAG & BOLAG
  {
    id: 'comp-001',
    title: 'TechStartup AB - AI Betalningslösningar',
    category: 'companies',
    subcategory: 'aktiebolag',
    askingPrice: 12500000,
    currency: 'SEK',
    location: 'Stockholm',
    description: 'Etablerat fintech-företag som utvecklar AI-driven betalningslösningar för e-handel. 200+ aktiva företagskunder, växande internationell närvaro.',
    highlights: [
      '200+ aktiva företagskunder',
      'AI-driven teknologi',
      'Internationell expansion',
      'Stark tillväxt 300% årligen'
    ],
    businessType: 'AB',
    employees: 25,
    foundedYear: 2019,
    monthlyRevenue: 850000,
    monthlyProfit: 320000,
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Magnus Eriksson',
      verified: true,
      joinedDate: '2019-01-15'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-20T10:00:00Z',
    viewCount: 247,
    interestedBuyers: 12
  },
  {
    id: 'comp-002',
    title: 'Sustainable Solutions - Miljökonsult',
    category: 'companies',
    subcategory: 'aktiebolag',
    askingPrice: 5800000,
    currency: 'SEK',
    location: 'Malmö',
    description: 'Ledande miljökonsultföretag med stora företagskunder. Specialiserat på hållbarhetsrapportering och miljöcertifieringar.',
    highlights: [
      'Stora företagskunder (Volvo, IKEA)',
      'Specialistkunskap inom ESG',
      'Stabila återkommande intäkter',
      '15 års marknadserfarenhet'
    ],
    businessType: 'AB',
    employees: 12,
    foundedYear: 2009,
    monthlyRevenue: 450000,
    monthlyProfit: 180000,
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Anna Lindström',
      verified: true,
      joinedDate: '2020-03-10'
    },
    status: 'SOLD',
    soldDate: '2024-06-08T14:30:00Z',
    soldPrice: 5800000,
    createdAt: '2024-05-15T09:00:00Z',
    viewCount: 189,
    interestedBuyers: 8
  },
  {
    id: 'comp-003',
    title: 'Nordic Handelsbolag - Importföretag',
    category: 'companies',
    subcategory: 'handelsbolag',
    askingPrice: 3200000,
    currency: 'SEK',
    location: 'Göteborg',
    description: 'Etablerat importföretag med fokus på nordiska designprodukter. Starka relationer med leverantörer i Danmark och Finland.',
    highlights: [
      'Exklusiva leverantörsavtal',
      'Etablerade distributionskanaler',
      'Växande e-handelsdel',
      'Stark varumärkesportfölj'
    ],
    businessType: 'HB',
    employees: 8,
    foundedYear: 2015,
    monthlyRevenue: 280000,
    monthlyProfit: 95000,
    images: [
      'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Erik Johansson',
      verified: true,
      joinedDate: '2021-07-22'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-18T11:30:00Z',
    viewCount: 156,
    interestedBuyers: 6
  },

  // DIGITALA TILLGÅNGAR
  {
    id: 'dig-001',
    title: 'ScandiShop.se - E-handelsplattform',
    category: 'digital',
    subcategory: 'webbplatser',
    askingPrice: 2300000,
    currency: 'SEK',
    location: 'Online',
    description: 'Etablerad e-handelsplattform för nordisk design och heminredning. 15000+ registrerade kunder, stark social media-närvaro.',
    highlights: [
      '15000+ registrerade kunder',
      'SEO-optimerad för nordiska marknader',
      'Stark social media-närvaro',
      'Mobile-first design'
    ],
    monthlyRevenue: 180000,
    monthlyProfit: 85000,
    traffic: {
      monthly: 45000,
      countries: ['SE', 'NO', 'DK'],
      mobilePercentage: 68
    },
    images: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Sofia Andersson',
      verified: true,
      joinedDate: '2020-11-05'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-22T08:15:00Z',
    viewCount: 203,
    interestedBuyers: 9
  },
  {
    id: 'dig-002',
    title: 'FitnessTracker Pro - Mobilapp',
    category: 'digital',
    subcategory: 'applikationer',
    askingPrice: 890000,
    currency: 'SEK',
    location: 'Online',
    description: 'Populär fitness-app med 50000+ nedladdningar. Inbyggda premiumfunktioner och månatliga prenumerationer.',
    highlights: [
      '50000+ nedladdningar',
      'Månatliga prenumerationer',
      'High user retention (85%)',
      'iOS och Android'
    ],
    monthlyRevenue: 75000,
    monthlyProfit: 45000,
    downloads: 52000,
    activeUsers: 28000,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Johan Karlsson',
      verified: true,
      joinedDate: '2021-09-12'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-19T16:45:00Z',
    viewCount: 167,
    interestedBuyers: 11
  },
  {
    id: 'dig-003',
    title: 'TechBlog.se - Premium domän',
    category: 'digital',
    subcategory: 'domännamn',
    askingPrice: 125000,
    currency: 'SEK',
    location: 'Online',
    description: 'Premium .se-domän för teknikbransch. Kort, minnesvärd och SEO-vänlig för svenska marknaden.',
    highlights: [
      'Premium .se-domän',
      'Kort och minnesvärd',
      'Hög sökvolym för "tech"',
      'Perfekt för teknikföretag'
    ],
    domainAge: 8,
    seoMetrics: {
      domainAuthority: 45,
      backlinks: 1200,
      organicKeywords: 340
    },
    images: [
      'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Marcus Nilsson',
      verified: true,
      joinedDate: '2019-05-20'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-21T12:20:00Z',
    viewCount: 89,
    interestedBuyers: 4
  },

  // DOKUMENT & RÄTTIGHETER
  {
    id: 'doc-001',
    title: 'Kundfordringar Tech-företag - 2.4M SEK',
    category: 'documents',
    subcategory: 'fakturor',
    askingPrice: 2100000,
    currency: 'SEK',
    location: 'Stockholm',
    description: 'Säkra kundfordringar från etablerat tech-företag. 30 kunder med AAA-rating, genomsnittlig betaltid 28 dagar.',
    highlights: [
      '30 kunder med AAA-rating',
      'Genomsnittlig betaltid 28 dagar',
      'Kreditsäkring på 95%',
      'Etablerade betalningsrutiner'
    ],
    totalValue: 2400000,
    discount: 12.5,
    averagePaymentTime: 28,
    creditInsurance: 95,
    maturityDate: '2024-09-30',
    images: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Finanshuset Nord',
      verified: true,
      joinedDate: '2020-01-15'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-23T14:10:00Z',
    viewCount: 78,
    interestedBuyers: 3
  },
  {
    id: 'doc-002',
    title: 'EcoTech™ - Registrerat varumärke',
    category: 'documents',
    subcategory: 'patent',
    askingPrice: 450000,
    currency: 'SEK',
    location: 'Sverige, EU',
    description: 'Registrerat varumärke för miljöteknik. Skyddat i Sverige, Norge, Danmark och EU. Starkt inom hållbarhetssektorn.',
    highlights: [
      'Registrerat i Sverige, Norge, Danmark, EU',
      'Stark position inom miljöteknik',
      'Ingen pågående tvist',
      'Förnyat till 2034'
    ],
    registrationNumber: 'SE123456789',
    validUntil: '2034-06-15',
    territories: ['SE', 'NO', 'DK', 'EU'],
    classes: ['Miljöteknik', 'Hållbarhetskonsulting', 'Grön energi'],
    images: [
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'IP Solutions AB',
      verified: true,
      joinedDate: '2021-03-08'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-20T09:30:00Z',
    viewCount: 34,
    interestedBuyers: 2
  },

  // FÖRETAGSFASTIGHETER & LOKALER
  {
    id: 'prop-001',
    title: 'Kontorslokal Östermalm - 340 kvm',
    category: 'properties',
    subcategory: 'kontorslokaler',
    askingPrice: 8900000,
    currency: 'SEK',
    location: 'Stockholm, Östermalm',
    description: 'Premium kontorslokal i hjärtat av Östermalm. Renoverad 2023, modern teknisk utrustning, närhet till kollektivtrafik.',
    highlights: [
      'Premium läge på Östermalm',
      'Renoverad 2023',
      'Modern teknisk utrustning',
      'Närhet till tunnelbana'
    ],
    squareMeters: 340,
    monthlyRent: 89000,
    leaseLength: 36,
    parking: 6,
    facilities: ['Konferensrum', 'Kök', 'Reception', 'Luftkonditionering'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Stockholm Office Properties',
      verified: true,
      joinedDate: '2019-08-14'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-18T13:45:00Z',
    viewCount: 112,
    interestedBuyers: 7
  },
  {
    id: 'prop-002',
    title: 'Restauranglokal Gamla Stan',
    category: 'properties',
    subcategory: 'speciallokaler',
    askingPrice: 1200000,
    currency: 'SEK',
    location: 'Stockholm, Gamla Stan',
    description: 'Charmig restauranglokal i Gamla Stan med full serveringstillstånd. 80 sittplatser, etablerad kundkrets.',
    highlights: [
      'Unikt läge i Gamla Stan',
      'Full serveringstillstånd',
      '80 sittplatser',
      'Etablerad kundkrets'
    ],
    squareMeters: 180,
    monthlyRent: 45000,
    seats: 80,
    licenses: ['Serveringstillstånd', 'Uteservering'],
    established: 1987,
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Gamla Stan Fastigheter',
      verified: true,
      joinedDate: '2020-12-03'
    },
    status: 'PENDING', // Under förhandling
    createdAt: '2024-06-16T11:20:00Z',
    viewCount: 89,
    interestedBuyers: 5
  },

  // FÖRETAGSTJÄNSTER
  {
    id: 'serv-001',
    title: 'Premium kundregister - 5000 företagskunder',
    category: 'services',
    subcategory: 'kundregister',
    askingPrice: 750000,
    currency: 'SEK',
    location: 'Nordiska marknaden',
    description: 'Verifierat register med 5000 aktiva företagskunder inom tech-sektorn. GDPR-kompatibelt, segmenterat och kontinuerligt uppdaterat.',
    highlights: [
      '5000 aktiva företagskunder',
      'Tech-sektorn fokus',
      'GDPR-kompatibel',
      'Segmenterat och uppdaterat'
    ],
    customerCount: 5000,
    industries: ['Tech', 'SaaS', 'Fintech', 'E-handel'],
    dataPoints: ['Kontaktuppgifter', 'Företagsstorlek', 'Omsättning', 'Teknisk stack'],
    updateFrequency: 'Månadsvis',
    conversionRate: 12.5,
    images: [
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'DataCorp Solutions',
      verified: true,
      joinedDate: '2021-06-18'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-19T10:15:00Z',
    viewCount: 67,
    interestedBuyers: 4
  },
  {
    id: 'serv-002',
    title: 'McDonald\'s Franchise-rättigheter Västerås',
    category: 'services',
    subcategory: 'franchise',
    askingPrice: 4500000,
    currency: 'SEK',
    location: 'Västerås',
    description: 'Etablerad McDonald\'s-franchise i Västerås centrum. Stark lönsamhet, erfaret team, långtidskontrakt till 2034.',
    highlights: [
      'Etablerad franchise sedan 2018',
      'Västerås centrum-läge',
      'Erfaret team på plats',
      'Kontrakt till 2034'
    ],
    franchiseBrand: 'McDonald\'s',
    established: 2018,
    contractUntil: '2034-12-31',
    monthlyRevenue: 380000,
    monthlyProfit: 95000,
    employees: 22,
    images: [
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Nordic Franchise Group',
      verified: true,
      joinedDate: '2018-04-12'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-17T15:30:00Z',
    viewCount: 134,
    interestedBuyers: 8
  }
];

// Recently sold companies for demo purposes
const SOLD_COMPANIES = [
  {
    id: 'sold-001',
    title: 'Nordic E-handel AB',
    originalPrice: 8200000,
    soldPrice: 8200000,
    soldDate: '2024-06-10',
    category: 'companies',
    industry: 'E-handel',
    employees: 15,
    location: 'Göteborg',
    description: 'Etablerad e-handelsplattform med stark tillväxt'
  },
  {
    id: 'sold-002',
    title: 'CleanTech Solutions',
    originalPrice: 5800000,
    soldPrice: 5800000,
    soldDate: '2024-06-08',
    category: 'companies',
    industry: 'Hållbarhet',
    employees: 12,
    location: 'Malmö',
    description: 'Miljökonsultföretag med stora företagskunder'
  },
  {
    id: 'sold-003',
    title: 'FashionApp.se',
    originalPrice: 1200000,
    soldPrice: 1350000,
    soldDate: '2024-06-05',
    category: 'digital',
    industry: 'Mode & Lifestyle',
    employees: 3,
    location: 'Online',
    description: 'Mode-app med 80000+ användare'
  }
];

// Enhanced social proof statistics
const SOCIAL_PROOF_STATS = {
  activeListings: 2847,
  completedDeals: 1253,
  totalValue: 4.8, // billion SEK
  averageTime: 45, // days
  verifiedSellers: 892,
  successRate: 94.2
};

// API Routes

// Enhanced search with support for all asset categories
app.get('/api/listings/search', (req, res) => {
  const { 
    q, 
    category, 
    subcategory,
    location,
    priceMin, 
    priceMax, 
    employees,
    revenue,
    status,
    sortBy = 'newest',
    limit = 12, 
    offset = 0 
  } = req.query;
  
  let filteredListings = [...MOCK_LISTINGS];
  
  // Apply filters
  if (q) {
    const searchTerm = q.toLowerCase();
    filteredListings = filteredListings.filter(listing => 
      listing.title.toLowerCase().includes(searchTerm) ||
      listing.description.toLowerCase().includes(searchTerm) ||
      listing.highlights.some(highlight => highlight.toLowerCase().includes(searchTerm))
    );
  }
  
  if (category) {
    filteredListings = filteredListings.filter(listing => 
      listing.category === category
    );
  }
  
  if (subcategory) {
    filteredListings = filteredListings.filter(listing => 
      listing.subcategory === subcategory
    );
  }
  
  if (location) {
    filteredListings = filteredListings.filter(listing => 
      listing.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (status) {
    filteredListings = filteredListings.filter(listing => 
      listing.status === status.toUpperCase()
    );
  }
  
  // Price filtering
  if (priceMin || priceMax) {
    filteredListings = filteredListings.filter(listing => {
      const price = listing.askingPrice;
      if (priceMin && price < parseFloat(priceMin)) return false;
      if (priceMax && price > parseFloat(priceMax)) return false;
      return true;
    });
  }
  
  // Employee count filtering
  if (employees) {
    filteredListings = filteredListings.filter(listing => {
      if (!listing.employees) return false;
      const empCount = listing.employees;
      switch(employees) {
        case '1-10': return empCount >= 1 && empCount <= 10;
        case '11-50': return empCount >= 11 && empCount <= 50;
        case '51+': return empCount >= 51;
        default: return true;
      }
    });
  }
  
  // Apply sorting
  switch(sortBy) {
    case 'price_low':
      filteredListings.sort((a, b) => a.askingPrice - b.askingPrice);
      break;
    case 'price_high':
      filteredListings.sort((a, b) => b.askingPrice - a.askingPrice);
      break;
    case 'popular':
      filteredListings.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      break;
    case 'oldest':
      filteredListings.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    default: // newest
      filteredListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  // Apply pagination
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedResults = filteredListings.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      listings: paginatedResults,
      totalCount: filteredListings.length,
      hasMore: endIndex < filteredListings.length,
      stats: SOCIAL_PROOF_STATS
    }
  });
});

// Get single listing by ID
app.get('/api/listings/:id', (req, res) => {
  const listing = MOCK_LISTINGS.find(l => l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }
  
  // Increment view count (demo)
  listing.viewCount = (listing.viewCount || 0) + 1;
  
  res.json({
    success: true,
    data: listing
  });
});

// Get asset categories
app.get('/api/categories', (req, res) => {
  const categories = [
    {
      id: 'companies',
      name: 'Företag & Bolag',
      description: 'Kompletta företag och bolagsstrukturer',
      count: MOCK_LISTINGS.filter(l => l.category === 'companies').length,
      subcategories: [
        { id: 'aktiebolag', name: 'Aktiebolag (AB)', count: 2 },
        { id: 'handelsbolag', name: 'Handelsbolag', count: 1 },
        { id: 'enskilda', name: 'Enskilda firmor', count: 0 },
        { id: 'kommandit', name: 'Kommanditbolag', count: 0 }
      ]
    },
    {
      id: 'digital',
      name: 'Digitala Tillgångar',
      description: 'Webbplatser, appar, domäner och digitala produkter',
      count: MOCK_LISTINGS.filter(l => l.category === 'digital').length,
      subcategories: [
        { id: 'webbplatser', name: 'Webbplatser', count: 1 },
        { id: 'domännamn', name: 'Domännamn', count: 1 },
        { id: 'applikationer', name: 'Applikationer', count: 1 },
        { id: 'digitala', name: 'Digitala produkter', count: 0 }
      ]
    },
    {
      id: 'documents',
      name: 'Dokument & Rättigheter',
      description: 'Fakturor, avtal, patent och licenser',
      count: MOCK_LISTINGS.filter(l => l.category === 'documents').length,
      subcategories: [
        { id: 'fakturor', name: 'Fakturor', count: 1 },
        { id: 'avtal', name: 'Avtal', count: 0 },
        { id: 'patent', name: 'Patent & Varumärken', count: 1 },
        { id: 'licenser', name: 'Licenser', count: 0 }
      ]
    },
    {
      id: 'properties',
      name: 'Företagsfastigheter & Lokaler',
      description: 'Kontorslokaler, butiker, lager och speciallokaler',
      count: MOCK_LISTINGS.filter(l => l.category === 'properties').length,
      subcategories: [
        { id: 'kontorslokaler', name: 'Kontorslokaler', count: 1 },
        { id: 'butikslokaler', name: 'Butikslokaler', count: 0 },
        { id: 'lagerlokaler', name: 'Lagerlokaler', count: 0 },
        { id: 'speciallokaler', name: 'Speciallokaler', count: 1 }
      ]
    },
    {
      id: 'services',
      name: 'Företagstjänster',
      description: 'Kundregister, avtal, franchise och distributionskanaler',
      count: MOCK_LISTINGS.filter(l => l.category === 'services').length,
      subcategories: [
        { id: 'kundregister', name: 'Kundregister', count: 1 },
        { id: 'leverantör', name: 'Leverantörsavtal', count: 0 },
        { id: 'franchise', name: 'Franchise-rättigheter', count: 1 },
        { id: 'distribution', name: 'Distributionsavtal', count: 0 }
      ]
    }
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

// Get sold companies/recent sales
app.get('/api/listings/sold', (req, res) => {
  res.json({
    success: true,
    data: {
      soldListings: SOLD_COMPANIES,
      totalSales: SOLD_COMPANIES.length,
      totalValue: SOLD_COMPANIES.reduce((sum, item) => sum + item.soldPrice, 0)
    }
  });
});

// Get statistics
app.get('/api/statistics', (req, res) => {
  const categoryStats = {};
  
  // Calculate statistics by category
  Object.keys(MOCK_LISTINGS.reduce((acc, listing) => {
    acc[listing.category] = true;
    return acc;
  }, {})).forEach(category => {
    const categoryListings = MOCK_LISTINGS.filter(l => l.category === category);
    categoryStats[category] = {
      count: categoryListings.length,
      averagePrice: categoryListings.reduce((sum, l) => sum + l.askingPrice, 0) / categoryListings.length,
      totalViews: categoryListings.reduce((sum, l) => sum + (l.viewCount || 0), 0)
    };
  });
  
  res.json({
    success: true,
    data: {
      ...SOCIAL_PROOF_STATS,
      categoryStats,
      recentActivity: {
        newListings: 47,
        completedDeals: 12,
        activeNegotiations: 89
      }
    }
  });
});

// Submit interest (mock)
app.post('/api/listings/:id/interest', (req, res) => {
  const listing = MOCK_LISTINGS.find(l => l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }
  
  // Increment interested buyers count (demo)
  listing.interestedBuyers = (listing.interestedBuyers || 0) + 1;
  
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        message: 'Ditt intresse har registrerats! Säljaren kommer att kontakta dig inom 24 timmar.',
        listingId: req.params.id,
        estimatedResponse: '24 timmar'
      }
    });
  }, 1000);
});

// Create new listing (mock)
app.post('/api/listings', (req, res) => {
  setTimeout(() => {
    const newListingId = 'listing-' + Date.now();
    res.json({
      success: true,
      data: {
        id: newListingId,
        message: 'Din annons har skapats och kommer att granskas inom 2 timmar.',
        estimatedApproval: '2 timmar'
      }
    });
  }, 1500);
});

// Professional services endpoints (existing from previous implementation)
app.get('/api/professionals/search', (req, res) => {
  // Include mock professionals data from previous implementation
  const mockProfessionals = [
    {
      id: '1',
      userId: 'user-1',
      professionalTitle: 'Senior Företagsjurist',
      businessName: 'Nordic Legal Advisory AB',
      serviceCategories: ['LEGAL_SERVICES', 'CONTRACT_REVIEW'],
      specializations: ['M&A', 'Företagsrätt', 'Avtalsrätt', 'Due Diligence'],
      languages: ['sv', 'en', 'no'],
      hourlyRate: 2500,
      consultationFee: 1500,
      currency: 'SEK',
      averageRating: 4.8,
      totalReviews: 127,
      completedBookings: 89,
      verificationStatus: 'VERIFIED',
      isActive: true,
      acceptsNewClients: true,
      bio: 'Erfaren företagsjurist med över 15 års erfarenhet inom M&A, företagsförvärv och kommersiell rätt.',
      user: {
        id: 'user-1',
        firstName: 'Anna',
        lastName: 'Lindqvist',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face',
        country: 'SE',
        isOnline: true,
        lastSeenAt: new Date().toISOString(),
        linkedinProfile: 'https://linkedin.com/in/anna-lindqvist',
        website: 'https://nordiclegal.se',
        createdAt: '2020-03-15T10:00:00Z'
      },
      serviceListings: []
    }
  ];
  
  res.json({
    success: true,
    data: {
      professionals: mockProfessionals,
      totalCount: mockProfessionals.length,
      hasMore: false
    }
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: '123Hansa.se - Nordens Marknadsplats för Företag API',
    version: '2.0.0',
    description: 'Comprehensive marketplace API supporting all asset types',
    endpoints: {
      'GET /api/listings/search': 'Search all types of assets',
      'GET /api/listings/:id': 'Get specific listing details',
      'GET /api/categories': 'Get all asset categories',
      'GET /api/listings/sold': 'Get recently sold listings',
      'GET /api/statistics': 'Get marketplace statistics',
      'POST /api/listings/:id/interest': 'Express interest in listing',
      'POST /api/listings': 'Create new listing',
      'GET /api/professionals/search': 'Search professional services'
    },
    assetTypes: {
      companies: 'Företag & Bolag',
      digital: 'Digitala Tillgångar', 
      documents: 'Dokument & Rättigheter',
      properties: 'Företagsfastigheter & Lokaler',
      services: 'Företagstjänster'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 123Hansa.se Marketplace API running on http://localhost:${PORT}`);
  console.log('📋 Asset Types Available:');
  console.log('  🏢 Företag & Bolag (3 listings)');
  console.log('  🌐 Digitala Tillgångar (3 listings)');
  console.log('  📄 Dokument & Rättigheter (2 listings)');
  console.log('  🏠 Företagsfastigheter & Lokaler (2 listings)');
  console.log('  💼 Företagstjänster (2 listings)');
  console.log('\n💡 Total: 12 realistic demo listings ready for testing!');
  console.log('🎯 Featured: Recently sold companies with complete transaction data');
});

module.exports = app;