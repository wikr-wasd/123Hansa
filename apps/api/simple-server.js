const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// In-memory store for rate limiting and spam detection
const rateLimit = new Map();
const spamDetection = new Map();

// Rate limiting middleware
function rateLimitMiddleware(maxRequests = 10, windowMs = 60000) {
  return (req, res, next) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (!rateLimit.has(clientId)) {
      rateLimit.set(clientId, []);
    }
    
    const requests = rateLimit.get(clientId).filter(time => time > windowStart);
    
    if (requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'För många förfrågningar. Försök igen senare.',
        retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
      });
    }
    
    requests.push(now);
    rateLimit.set(clientId, requests);
    next();
  };
}

// Spam detection middleware
function spamDetectionMiddleware(req, res, next) {
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  
  if (!spamDetection.has(clientId)) {
    spamDetection.set(clientId, {
      messages: [],
      lastMessage: '',
      suspiciousActivity: 0
    });
  }
  
  const clientData = spamDetection.get(clientId);
  
  // Check for duplicate messages
  if (req.body.message && req.body.message === clientData.lastMessage) {
    clientData.suspiciousActivity += 2;
    return res.status(400).json({
      success: false,
      message: 'Identiska meddelanden är inte tillåtna'
    });
  }
  
  // Check for spam patterns
  if (req.body.message) {
    const message = req.body.message.toLowerCase();
    const spamKeywords = [
      'bitcoin', 'cryptocurrency', 'investment opportunity', 'make money fast',
      'click here', 'buy now', 'limited time', 'guaranteed', 'free money',
      'urgent', 'act now', 'special offer', 'discount', 'loan', 'credit'
    ];
    
    const spamCount = spamKeywords.filter(keyword => 
      message.includes(keyword)
    ).length;
    
    if (spamCount >= 3) {
      clientData.suspiciousActivity += 5;
      return res.status(400).json({
        success: false,
        message: 'Meddelandet innehåller otillåtet innehåll'
      });
    }
    
    // Check message length and patterns
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Meddelandet är för långt (max 2000 tecken)'
      });
    }
    
    clientData.lastMessage = req.body.message;
  }
  
  // Check for suspicious activity
  if (clientData.suspiciousActivity >= 10) {
    return res.status(403).json({
      success: false,
      message: 'Konto tillfälligt blockerat på grund av misstänkt aktivitet'
    });
  }
  
  next();
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Trust proxy for accurate IP detection
app.set('trust proxy', 1);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// General API rate limiting (DDoS protection)
app.use('/api/', rateLimitMiddleware(100, 60000)); // 100 requests per minute per IP

// Cleanup old entries periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  const tenMinutesAgo = now - 600000;
  
  // Clean rate limit data
  for (const [clientId, requests] of rateLimit.entries()) {
    const recentRequests = requests.filter(time => time > tenMinutesAgo);
    if (recentRequests.length === 0) {
      rateLimit.delete(clientId);
    } else {
      rateLimit.set(clientId, recentRequests);
    }
  }
  
  // Clean spam detection data
  for (const [clientId, data] of spamDetection.entries()) {
    if (data.suspiciousActivity > 0) {
      data.suspiciousActivity = Math.max(0, data.suspiciousActivity - 1);
    }
    if (data.suspiciousActivity === 0 && !data.lastMessage) {
      spamDetection.delete(clientId);
    }
  }
  
  console.log(`🧹 Cleaned up rate limiting data. Active IPs: ${rateLimit.size}`);
}, 600000);

// Mock users database
const mockUsers = [
  {
    id: 'admin_001',
    email: 'admin@servicematch.se',
    password: 'admin123', // In real app, this would be hashed
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    verified: true,
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString(),
    permissions: ['view_all_listings', 'manage_users', 'view_analytics', 'moderate_content']
  },
  {
    id: 'user_anna',
    email: 'anna@example.com',
    password: 'user123', // In real app, this would be hashed
    firstName: 'Anna',
    lastName: 'Karlsson',
    role: 'user',
    verified: true,
    createdAt: '2024-06-01',
    lastLogin: new Date().toISOString(),
    permissions: ['create_listings', 'contact_sellers', 'manage_own_listings']
  },
  {
    id: 'user_erik',
    email: 'erik@example.com',
    password: 'user123',
    firstName: 'Erik',
    lastName: 'Johansson',
    role: 'user',
    verified: true,
    createdAt: '2024-06-02',
    lastLogin: new Date().toISOString(),
    permissions: ['create_listings', 'contact_sellers', 'manage_own_listings']
  },
  {
    id: 'user_sofia',
    email: 'sofia@example.com',
    password: 'user123',
    firstName: 'Sofia',
    lastName: 'Lindberg',
    role: 'user',
    verified: true,
    createdAt: '2024-05-15',
    lastLogin: new Date().toISOString(),
    permissions: ['create_listings', 'contact_sellers', 'manage_own_listings']
  }
];

// Session storage (in real app, use Redis or database)
const activeSessions = new Map();

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Åtkomst nekad. Inloggning krävs.'
    });
  }

  const session = activeSessions.get(token);
  if (!session || session.expires < Date.now()) {
    activeSessions.delete(token);
    return res.status(403).json({
      success: false,
      message: 'Session har gått ut. Logga in igen.'
    });
  }

  req.user = session.user;
  next();
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin-behörighet krävs.'
    });
  }
  next();
}

// Generate session token
function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Mock data
const mockListings = [
  {
    id: '1',
    title: 'TechStartup AB - AI & Machine Learning Platform',
    description: 'Innovativt teknikföretag specialiserat på AI-lösningar för e-handel och marknadsföring. Företaget utvecklar avancerade algoritmer för personalisering och prediktiv analys som hjälper företag att öka försäljning och förbättra kundupplevelsen.',
    highlights: [
      'Etablerad kundportfölj med 25+ företagskunder',
      'Proprietär AI-teknologi med patent pending',
      'Månadsintäkter: 180 000 SEK med 40% tillväxt',
      'Team av 8 erfarna utvecklare och datavetare',
      'Strategiska partnerskap med ledande e-handelsplattformar'
    ],
    financials: {
      monthlyRevenue: 180000,
      yearlyRevenue: 2160000,
      monthlyProfit: 85000,
      profitMargin: 47,
      growth: 40
    },
    keyMetrics: {
      customers: 25,
      employees: 8,
      churnRate: 5,
      nps: 85
    },
    category: 'companies',
    askingPrice: 2500000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Stockholm',
    viewCount: 245,
    interestedBuyers: 12,
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_anna',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-20',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_anna',
      firstName: 'Anna',
      lastName: 'Karlsson',
      country: 'SE'
    }
  },
  {
    id: '2',
    title: 'Nordic DevOps Consulting AB - Växande IT-konsultbolag',
    description: 'Välrenommerat IT-konsultföretag med specialisering inom DevOps, molnlösningar och agile transformation. Företaget har etablerat sig som den go-to partnern för medelstora till stora företag som vill modernisera sin IT-infrastruktur och utvecklingsprocesser.',
    highlights: [
      'Återkommande kontrakt med 12 enterprise-kunder',
      'Specialistkompetens inom AWS, Azure och Kubernetes',
      'Månadsintäkter: 280 000 SEK med 35% tillväxt',
      'Team av 6 seniora konsulter med certifieringar',
      'Genomsnittlig projektlängd 8-12 månader',
      'Etablerade partnerskap med Microsoft och Amazon'
    ],
    financials: {
      monthlyRevenue: 280000,
      yearlyRevenue: 3360000,
      monthlyProfit: 98000,
      profitMargin: 35,
      growth: 35
    },
    keyMetrics: {
      customers: 12,
      employees: 6,
      utilization: 92,
      clientRetention: 85
    },
    category: 'services',
    askingPrice: 1800000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Stockholm',
    viewCount: 189,
    interestedBuyers: 8,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_erik',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-22',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_erik',
      firstName: 'Erik',
      lastName: 'Johansson',
      country: 'SE'
    }
  },
  {
    id: '3',
    title: 'NordicFashion.se - Premium Skandinavisk E-handel',
    description: 'Väletablerad e-handelsbutik inom skandinavisk mode och design med stark varumärkesidentitet. Företaget säljer exklusiva kollektioner från nordiska designers och har byggt upp en lojal kundkrets över hela Europa.',
    highlights: [
      'Månadsintäkter: 485 000 SEK med stabil tillväxt',
      'Över 15 000 aktiva kunder i kundregistret',
      'Exklusiva avtal med 40+ nordiska designers',
      'Fullt automatiserat lagersystem och CRM',
      'Stark närvaro på sociala medier (85k följare)',
      'Etablerade distributionskanaler i Norge, Danmark och Finland'
    ],
    financials: {
      monthlyRevenue: 485000,
      yearlyRevenue: 5820000,
      monthlyProfit: 145500,
      profitMargin: 30,
      growth: 22
    },
    keyMetrics: {
      customers: 15000,
      orderValue: 850,
      returnRate: 8,
      conversionRate: 3.2
    },
    category: 'ecommerce',
    askingPrice: 3200000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Göteborg',
    viewCount: 312,
    interestedBuyers: 18,
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_sofia',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-05-15',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_sofia',
      firstName: 'Sofia',
      lastName: 'Lindberg',
      country: 'SE'
    }
  },
  {
    id: '4',
    title: 'FitnessGear.dk - Premium Träningsdomän + E-handelsplattform',
    description: 'Exklusiv .dk-domän inom fitness och träning kombinerat med färdigutvecklad e-handelsplattform. Perfekt för en ambitiös entreprenör som vill lansera nästa generations fitnessbrand i Skandinavien. Domänen har stark SEO-potential och plattformen är redo för lansering.',
    highlights: [
      'Premium .dk-domän med stark keyword-relevans',
      'Färdigutvecklad WooCommerce e-handelsplattform',
      'Professionell design optimerad för mobil',
      'SEO-optimerad struktur för träning och fitness',
      'Integrerat betalningssystem och lagermanagement',
      'Redo för lansering - bara att fylla med produkter'
    ],
    technicalSpecs: {
      domain: 'fitness-gear.dk',
      platform: 'WordPress + WooCommerce',
      hosting: '12 månader inkluderat',
      ssl: 'Premium SSL-certifikat',
      seoScore: 85
    },
    marketPotential: {
      searchVolume: 12000,
      competition: 'Medelhög',
      targetMarket: 'Danmark + Skandinavien',
      potentialRevenue: '2-5M SEK/år'
    },
    category: 'domains',
    askingPrice: 125000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Danmark',
    viewCount: 78,
    interestedBuyers: 5,
    images: ['https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_mikael',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-01',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_mikael',
      firstName: 'Mikael',
      lastName: 'Hansen',
      country: 'DK'
    }
  },
  {
    id: '5',
    title: 'Café Hygge - Malmös Mysigaste Mötesplats',
    description: 'Välkänt och omtyckt café i hjärtat av Malmö med stark stammis och turistströms. Känt för sina specialkaffe, hembakade bakverk och unika "hygge"-atmosfär som lockar både lokalbefolkning och besökare.',
    highlights: [
      'Prime location på Södergatan med 60 kvm yta',
      'Månadsintäkter: 125 000 SEK år runt',
      'Etablerad kundkrets med hög lojalitet',
      'Komplett café-utrustning och inventarier ingår',
      'Exklusiva leverantörsavtal för specialkaffe',
      'Fullständigt digitalt kassasystem och bokföring'
    ],
    financials: {
      monthlyRevenue: 125000,
      yearlyRevenue: 1500000,
      monthlyProfit: 37500,
      profitMargin: 30,
      growth: 8
    },
    keyMetrics: {
      seatsCapacity: 35,
      dailyCustomers: 180,
      averageSpend: 85,
      operatingDays: 350
    },
    category: 'companies',
    askingPrice: 980000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Malmö',
    viewCount: 156,
    interestedBuyers: 9,
    images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_lars',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-10',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_lars',
      firstName: 'Lars',
      lastName: 'Pettersson',
      country: 'SE'
    }
  },
  {
    id: '6',
    title: 'TechReviews Nordic - Premium YouTube-kanal med 50k+ prenumeranter',
    description: 'Välrenommerad YouTube-kanal inom teknologi med stark följarbas i Skandinavien. Kanalen fokuserar på djupgående recensioner av consumer tech, smartphones och gadgets. Etablerat varumärke med hög trovärdighet och engagerade viewers som värdesätter ärliga, opartiska recensioner.',
    highlights: [
      '52,400 prenumeranter med hög lojalitet',
      'Månatliga visningar: 485,000 med stigande trend',
      'Genomsnittlig CTR: 8.2% (branschsnitt: 4-5%)',
      'Månadsintäkter: 28,000 SEK från annonser + sponsring',
      'Etablerade partnerskap med Samsung, OnePlus och Xiaomi',
      'Komplett videoproduktions-setup ingår (värde 150k SEK)'
    ],
    analytics: {
      subscribers: 52400,
      monthlyViews: 485000,
      averageWatchTime: '6:42',
      clickThroughRate: 8.2,
      monthlyRevenue: 28000,
      growth: 15
    },
    businessAssets: {
      equipment: 'Professionell kamera, ljussättning, ljudutrustning',
      software: 'Adobe Creative Suite licenser',
      partnerships: 'Kontrakt med 8 tech-brands',
      socialMedia: 'Instagram (15k), Twitter (8k) ingår'
    },
    category: 'content',
    askingPrice: 650000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Oslo',
    viewCount: 203,
    interestedBuyers: 14,
    images: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_ola',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-25',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_ola',
      firstName: 'Ola',
      lastName: 'Nordahl',
      country: 'NO'
    }
  },
  {
    id: '7',
    title: '@nordiclifestyle - Premium Instagram med 85k följare & lukrativa samarbeten',
    description: 'Växande lifestyle-influencer inom skandinavisk design, inredning och hållbar livsstil. Kontot har byggts upp organiskt över 4 år och har en extremt engagerad community som värdesätter autentiskt innehåll. Perfekt för någon som vill ta över ett etablerat varumärke eller integrera det i befintlig verksamhet.',
    highlights: [
      '87,200 äkta följare (98.5% organic growth)',
      'Engagemang: 6.8% (branschsnitt: 1-3%)',
      'Månadsintäkter: 35,000 SEK från sponsrade inlägg',
      'Etablerade samarbeten med IKEA, H&M Home, Granit',
      'Stories-visningar: 15,000+ per dag',
      'Professionellt fotosystem och content-bank ingår'
    ],
    influencerMetrics: {
      followers: 87200,
      engagementRate: 6.8,
      monthlyPosts: 20,
      storiesDaily: 3,
      monthlyRevenue: 35000,
      brandPartnerships: 12
    },
    demographics: {
      primaryAge: '25-45 kvinnor',
      geography: '78% Sverige, 15% Norge/Danmark, 7% övriga',
      interests: 'Inredning, design, hållbarhet, familjeliv'
    },
    category: 'social',
    askingPrice: 420000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Stockholm',
    viewCount: 167,
    interestedBuyers: 11,
    images: ['https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_emma',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-18',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_emma',
      firstName: 'Emma',
      lastName: 'Svensson',
      country: 'SE'
    }
  },
  {
    id: '8',
    title: 'CryptoNordic.com - Lönsam Affiliate-site med 25k+ månatliga besökare',
    description: 'Väloptimerad affiliate-marknadsföringssite inom kryptovalutor och digital finance. Sajten har byggt upp stark SEO-ranking för lukrativa sökord och genererar stabila intäkter genom välplacerade affiliate-länkar till ledande kryptobörser och wallet-tjänster. Perfekt passiv inkomst för tech-savvy investerare.',
    highlights: [
      'Månatliga besökare: 27,800 (organisk tillväxt 15%/månad)',
      'Månadsintäkter: 42,000 SEK från affiliate-provisioner',
      'SEO-ranking: Top 3 för 85+ krypto-relaterade sökord',
      'Affiliate-partnerskap med Binance, Coinbase, Kraken',
      'Email-lista: 5,200 prenumeranter (hög konvertering)',
      'Komplett content-arkiv med 200+ artiklar'
    ],
    webMetrics: {
      monthlyVisitors: 27800,
      organicTraffic: 89,
      bounceRate: 24,
      avgSessionDuration: '4:32',
      monthlyRevenue: 42000,
      conversionRate: 3.2
    },
    seoData: {
      topKeywords: 85,
      domainAuthority: 45,
      backlinks: 1240,
      contentPages: 200
    },
    category: 'affiliate',
    askingPrice: 890000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Köpenhamn',
    viewCount: 134,
    interestedBuyers: 7,
    images: ['https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_andreas',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-12',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_andreas',
      firstName: 'Andreas',
      lastName: 'Nielsen',
      country: 'DK'
    }
  },
  {
    id: '9',
    title: 'ProjectManager Nordic - Skalbar B2B SaaS med 1.2M ARR',
    description: 'Väletablerat B2B projekthanteringssystem designat för nordiska företag. Plattformen kombinerar agile project management med nordisk användarupplevelse och har visat stabil tillväxt under 3 år. Systemet används av allt från startups till medelstora företag och har extremt låg churn-rate tack vare djup produktintegration.',
    highlights: [
      '156 betalande företagskunder (ARR: 1.24M SEK)',
      'Månadsvis återkommande intäkter: 103,000 SEK',
      'Churn rate: 2.8% (branschsnitt: 8-12%)',
      'Team av 4 utvecklare och 2 customer success',
      'Produktroadmap för nästa 18 månader färdigställd',
      'Stark teknisk skuld-ratio och skalbar arkitektur'
    ],
    saasMetrics: {
      arr: 1240000,
      mrr: 103333,
      customers: 156,
      churnRate: 2.8,
      averageContractValue: 7949,
      ltv: 89000
    },
    technical: {
      platform: 'React + Node.js + PostgreSQL',
      hosting: 'AWS (Auto-scaling)',
      uptime: '99.8%',
      security: 'SOC2 Type II compliant'
    },
    category: 'digital',
    askingPrice: 4500000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Stockholm',
    viewCount: 289,
    interestedBuyers: 22,
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_petra',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-05-28',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_petra',
      firstName: 'Petra',
      lastName: 'Andersson',
      country: 'SE'
    }
  },
  {
    id: '10',
    title: 'Varumärke & Patent - EcoClean',
    description: 'Registrerat varumärke och patent för miljövänliga rengöringsprodukter. Inklusive produktformler.',
    category: 'documents',
    askingPrice: 750000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Bergen',
    viewCount: 95,
    interestedBuyers: 6,
    images: ['https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_kari',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-08',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_kari',
      firstName: 'Kari',
      lastName: 'Haugen',
      country: 'NO'
    }
  },
  {
    id: '11',
    title: 'Kontorslokal - Centrala Stockholm',
    description: '200 kvm modern kontorslokal i P&T-huset. Perfekt för tech-startup eller konsultverksamhet.',
    category: 'properties',
    askingPrice: 950000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Stockholm',
    viewCount: 178,
    interestedBuyers: 13,
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_johan',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-05',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_johan',
      firstName: 'Johan',
      lastName: 'Eriksson',
      country: 'SE'
    }
  },
  {
    id: '12',
    title: 'PayNordic - FinTech Startup med MVP & regulatorisk förarbete',
    description: 'Innovativ FinTech-lösning som förenklar betalningar och fakturahantering för nordiska småföretag. Produkten har utvecklats under 18 månader med stark focus på användarupplevelse och regulatory compliance. MVP är lanserat med positiv feedback från tidiga användare. Perfekt för entreprenör med finansiell bakgrund som vill skala snabbt.',
    highlights: [
      'Färdig MVP med 45 beta-användare (NPS: 73)',
      'PCI DSS compliance och PSD2-integration',
      'Strategiska partnerskap med 3 nordiska banker',
      'Utvecklingsteam på 5 personer (2 senior fintech-utvecklare)',
      'Produktroadmap och go-to-market strategi klar',
      'Intellectual property och trademarks säkrade'
    ],
    productStatus: {
      phase: 'MVP Launch',
      betaUsers: 45,
      npsScore: 73,
      monthlyGrowth: 28,
      productMarketFit: 'Developing',
      nextMilestone: 'Paid customers Q1 2025'
    },
    team: {
      developers: 5,
      designers: 2,
      business: 3,
      retention: '90% team staying with acquisition'
    },
    category: 'companies',
    askingPrice: 1650000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Aarhus',
    viewCount: 221,
    interestedBuyers: 15,
    images: ['https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_mette',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-14',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_mette',
      firstName: 'Mette',
      lastName: 'Larsen',
      country: 'DK'
    }
  },
  {
    id: '13',
    title: 'DigitalCraft - Premium Webbyrå med 29 återkommande kunder',
    description: 'Välrenommerad webbyrå i Trondheim med specialisering inom e-handel, WordPress och digital transformation. Byrån har byggt upp en portfolio av lojala kunder inom retail, tech och tjänsteföretag. Med stark teknisk kompetens och designexpertis har företaget etablerat sig som den go-to-partnern för kvalitetsmedvetna företag i Mellannorge.',
    highlights: [
      '29 återkommande kunder med 95% retention rate',
      'Månadsintäkter: 185,000 SEK från support & underhåll',
      'Projektintäkter: 320,000 SEK/månad i snitt',
      'Team: 6 utvecklare, 2 designers, 1 projektledare',
      'Specialistkompetens inom Shopify Plus och WooCommerce',
      'Etablerat varumärke med 8 års track record'
    ],
    businessMetrics: {
      monthlyRecurring: 185000,
      monthlyProjects: 320000,
      clients: 29,
      retentionRate: 95,
      averageProjectValue: 125000,
      teamUtilization: 92
    },
    expertise: {
      platforms: 'WordPress, Shopify, React, Vue.js',
      services: 'E-handel, Design, SEO, Hosting',
      industries: 'Retail, SaaS, Professional Services',
      certifications: 'Google Partner, Shopify Plus Partner'
    },
    category: 'services',
    askingPrice: 2100000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Trondheim',
    viewCount: 198,
    interestedBuyers: 10,
    images: ['https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_thor',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-03',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_thor',
      firstName: 'Thor',
      lastName: 'Andersen',
      country: 'NO'
    }
  },
  {
    id: '14',
    title: 'Podcast - NordicBusiness Weekly',
    description: 'Affärspodcast med 15k lyssnare per avsnitt. Etablerade sponsoravtal och stark varumärkeskännedom.',
    category: 'content',
    askingPrice: 580000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Helsingborg',
    viewCount: 142,
    interestedBuyers: 8,
    images: ['https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_lisa',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-16',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_lisa',
      firstName: 'Lisa',
      lastName: 'Nilsson',
      country: 'SE'
    }
  },
  {
    id: '15',
    title: 'Dropshipping - Nordic Home',
    description: 'Automatiserad dropshipping-verksamhet inom heminredning. 200+ produkter, Shopify-baserad.',
    category: 'ecommerce',
    askingPrice: 780000,
    currency: 'SEK',
    status: 'ACTIVE',
    location: 'Växjö',
    viewCount: 167,
    interestedBuyers: 9,
    images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop&crop=center'],
    ownerId: 'user_marcus',
    publishedAt: new Date().toISOString(),
    createdAt: '2024-06-21',
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'user_marcus',
      firstName: 'Marcus',
      lastName: 'Johansson',
      country: 'SE'
    }
  }
];

// Routes
app.get('/api/listings', (req, res) => {
  console.log('GET /api/listings called');
  res.json({
    success: true,
    data: {
      listings: mockListings,
      totalCount: mockListings.length,
      hasMore: false,
      stats: {
        activeListings: mockListings.length,
        completedDeals: 8,
        totalValue: 15000000,
        averageTime: 45
      },
      pagination: {
        page: 1,
        limit: 10,
        total: mockListings.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    }
  });
});

app.get('/api/listings/search', (req, res) => {
  console.log('GET /api/listings/search called');
  res.json({
    success: true,
    data: {
      listings: mockListings,
      pagination: {
        page: 1,
        limit: 10,
        total: mockListings.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      },
      stats: {
        total: mockListings.length,
        categories: {
          'Technology': 1,
          'Consulting': 1
        },
        averagePrice: 2150000,
        priceRange: {
          min: 1800000,
          max: 2500000
        },
        averageTime: 7
      }
    }
  });
});

app.get('/api/listings/my-listings', (req, res) => {
  console.log('GET /api/listings/my-listings called');
  res.json({
    success: true,
    data: { listings: mockListings }
  });
});

app.get('/api/listings/:id', (req, res) => {
  console.log(`GET /api/listings/${req.params.id} called`);
  const listing = mockListings.find(l => l.id === req.params.id);
  if (listing) {
    res.json({
      success: true,
      data: { listing }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }
});

app.put('/api/listings/:id', (req, res) => {
  console.log(`PUT /api/listings/${req.params.id} called with:`, req.body);
  const listing = mockListings.find(l => l.id === req.params.id);
  if (listing) {
    Object.assign(listing, req.body, { updatedAt: new Date().toISOString() });
    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: { listing }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }
});

app.delete('/api/listings/:id', (req, res) => {
  console.log(`DELETE /api/listings/${req.params.id} called`);
  const index = mockListings.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    mockListings[index].status = 'REMOVED';
    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }
});

// Authentication endpoints

// Login endpoint
app.post('/api/auth/login', rateLimitMiddleware(5, 300000), (req, res) => {
  console.log('POST /api/auth/login called');
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'E-post och lösenord är obligatoriska'
    });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({
      success: false,
      message: emailValidation.error
    });
  }

  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Felaktig e-post eller lösenord'
    });
  }

  // Generate session token
  const token = generateSessionToken();
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  activeSessions.set(token, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions
    },
    expires
  });

  // Update last login
  user.lastLogin = new Date().toISOString();

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions
      },
      expires
    }
  });
});

// Register endpoint
app.post('/api/auth/register', rateLimitMiddleware(3, 600000), (req, res) => {
  console.log('POST /api/auth/register called');
  
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'Alla fält är obligatoriska'
    });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({
      success: false,
      message: emailValidation.error
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Lösenordet måste vara minst 6 tecken långt'
    });
  }

  // Check if user already exists
  if (mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({
      success: false,
      message: 'En användare med denna e-post finns redan'
    });
  }

  // Create new user
  const newUser = {
    id: 'user_' + Date.now(),
    email: email.toLowerCase(),
    password: password, // In real app, hash this
    firstName,
    lastName,
    role: 'user',
    verified: true, // In real app, require email verification
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: ['create_listings', 'contact_sellers', 'manage_own_listings']
  };

  mockUsers.push(newUser);

  // Auto-login after registration
  const token = generateSessionToken();
  const expires = Date.now() + (24 * 60 * 60 * 1000);
  
  activeSessions.set(token, {
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      permissions: newUser.permissions
    },
    expires
  });

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        permissions: newUser.permissions
      },
      expires
    }
  });
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    activeSessions.delete(token);
  }

  res.json({
    success: true,
    message: 'Utloggad'
  });
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// Admin endpoints

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const users = mockUsers.map(user => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    verified: user.verified,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  }));

  res.json({
    success: true,
    data: users
  });
});

// Get platform statistics (admin only)
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const stats = {
    totalUsers: mockUsers.length,
    totalListings: mockListings.length,
    activeListings: mockListings.filter(l => l.status === 'ACTIVE').length,
    totalViews: mockListings.reduce((sum, l) => sum + l.viewCount, 0),
    activeSessions: activeSessions.size,
    recentActivity: {
      newUsersToday: mockUsers.filter(u => {
        const today = new Date().toDateString();
        return new Date(u.createdAt).toDateString() === today;
      }).length,
      newListingsToday: mockListings.filter(l => {
        const today = new Date().toDateString();
        return new Date(l.createdAt).toDateString() === today;
      }).length
    }
  };

  res.json({
    success: true,
    data: stats
  });
});

// Email validation function
function validateEmail(email) {
  // RFC 5322 compliant regex for email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'E-post är obligatorisk' };
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'E-post är för lång' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Ogiltig e-postadress format' };
  }
  
  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'temp-mail.org', 'guerrillamail.com', 
    'mailinator.com', 'throwaway.email', 'tempmail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(domain)) {
    return { valid: false, error: 'Temporära e-postadresser är inte tillåtna' };
  }
  
  return { valid: true };
}

// Contact seller endpoint with rate limiting and spam protection
app.post('/api/listings/:id/contact', 
  rateLimitMiddleware(5, 300000), // 5 requests per 5 minutes
  spamDetectionMiddleware,
  (req, res) => {
  console.log(`POST /api/listings/${req.params.id}/contact called with:`, req.body);
  const listing = mockListings.find(l => l.id === req.params.id);
  
  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  const { message, contactInfo } = req.body;
  
  // Validate required fields
  if (!message || !contactInfo?.name || !contactInfo?.email) {
    return res.status(400).json({
      success: false,
      message: 'Meddelande, namn och e-post är obligatoriska'
    });
  }

  // Validate email
  const emailValidation = validateEmail(contactInfo.email);
  if (!emailValidation.valid) {
    return res.status(400).json({
      success: false,
      message: emailValidation.error
    });
  }

  // Additional validation
  if (message.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Meddelandet måste vara minst 10 tecken långt'
    });
  }

  if (contactInfo.name.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Namnet måste vara minst 2 tecken långt'
    });
  }

  // Simulate sending message to seller
  setTimeout(() => {
    console.log(`📧 Message sent to seller ${listing.owner.firstName} ${listing.owner.lastName}:`);
    console.log(`   From: ${contactInfo.name} (${contactInfo.email})`);
    console.log(`   Phone: ${contactInfo.phone || 'Not provided'}`);
    console.log(`   Message: ${message}`);
  }, 100);

  res.json({
    success: true,
    data: {
      message: 'Ditt meddelande har skickats! Säljaren kommer att kontakta dig inom 24 timmar.'
    }
  });
});

// Share listing endpoint with rate limiting
app.post('/api/listings/:id/share', 
  rateLimitMiddleware(20, 300000), // 20 shares per 5 minutes
  (req, res) => {
  console.log(`POST /api/listings/${req.params.id}/share called with:`, req.body);
  const listing = mockListings.find(l => l.id === req.params.id);
  
  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'Listing not found'
    });
  }

  const { platform } = req.body;
  
  // Update view/share stats (simulate analytics)
  if (listing.shareCount) {
    listing.shareCount++;
  } else {
    listing.shareCount = 1;
  }

  console.log(`📤 Listing shared on ${platform || 'unknown platform'}: ${listing.title}`);

  res.json({
    success: true,
    data: {
      message: 'Annons delad!',
      shareCount: listing.shareCount
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET    /api/listings`);
  console.log(`   GET    /api/listings/my-listings`);
  console.log(`   GET    /api/listings/:id`);
  console.log(`   PUT    /api/listings/:id`);
  console.log(`   DELETE /api/listings/:id`);
  console.log(`   POST   /api/listings/:id/contact`);
  console.log(`   POST   /api/listings/:id/share`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/logout`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   GET    /api/admin/users`);
  console.log(`   GET    /api/admin/stats`);
  console.log(`   GET    /health`);
  console.log(`\n👤 Test accounts:`);
  console.log(`   Admin: admin@servicematch.se / admin123`);
  console.log(`   User:  anna@example.com / user123`);
});