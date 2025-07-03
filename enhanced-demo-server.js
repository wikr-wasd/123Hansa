const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Enhanced mock data with more categories and detailed content
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
    description: 'Etablerat fintech-företag som utvecklar AI-driven betalningslösningar för e-handel och detaljhandel. Företaget grundades 2019 och har sedan dess byggt upp en stark kundbas med över 200 aktiva företagskunder i Europa. Vår proprietära AI-teknologi möjliggör snabbare och säkrare betalningar med 99.8% upptid. Vi har redan expanderat till Norge och Danmark och planerar för internationell tillväxt. Perfekt möjlighet för strategisk köpare som vill accelerera inom fintech-sektorn.',
    longDescription: 'TechStartup AB representerar framtiden inom digital betalningsteknologi. Vårt team består av 25 högkvalificerade utvecklare och affärsexperter som kontinuerligt innoverar inom AI och machine learning för betalningslösningar. Företaget har utvecklat en unik algoritm som reducerar bedrägerier med 85% jämfört med traditionella metoder. Med partnerships med stora banker och betalningsprocessorer har vi etablerat oss som en pålitlig aktör på marknaden. Vår teknologi används dagligen av e-handelsföretag som processerar miljontals transaktioner. Vi har även erhållit alla nödvändiga licenser och certifieringar för att operera inom EU.',
    highlights: [
      '200+ aktiva företagskunder med 95% retention rate',
      'Proprietär AI-teknologi med patent i 5 länder',
      'Internationell expansion till Norge och Danmark',
      'Stark tillväxt 300% årligen under 3 år',
      'Partnerships med 12 större banker',
      'PCI DSS Level 1 certifiering',
      'Återkommande månadsintäkter på 850k SEK',
      'Erfaret team med genomsnitt 8 års branschexpertis'
    ],
    businessType: 'AB',
    employees: 25,
    foundedYear: 2019,
    monthlyRevenue: 850000,
    monthlyProfit: 320000,
    yearlyRevenue: 10200000,
    yearlyProfit: 3840000,
    industry: 'Fintech',
    tags: ['AI', 'betalningar', 'fintech', 'SaaS', 'B2B', 'internationell', 'tillväxt'],
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Magnus Eriksson',
      verified: true,
      joinedDate: '2019-01-15',
      email: 'magnus@techstartup.se',
      phone: '+46 70 123 45 67'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-20T10:00:00Z',
    viewCount: 247,
    interestedBuyers: 12,
    bids: []
  },

  // E-HANDEL KATEGORIER
  {
    id: 'ecom-001',
    title: 'NordicHome.se - Premium Heminredning E-handel',
    category: 'ecommerce',
    subcategory: 'webshop',
    askingPrice: 4500000,
    currency: 'SEK',
    location: 'Stockholm',
    description: 'Etablerad e-handelsplattform specialiserad på skandinavisk heminredning och design. Grundad 2018 med fokus på hållbara och kvalitativa produkter från nordiska designers och tillverkare.',
    longDescription: 'NordicHome.se är en av Skandinaviens ledande e-handelsplattformar för exklusiv heminredning. Vi har byggt upp ett starkt varumärke kring nordisk design och hållbarhet, med över 15000 registrerade kunder och en genomsnittlig ordervalue på 1850 SEK. Vårt sortiment omfattar möbler, textilier, belysning och accessoarer från över 80 skandinaviska designers. Vi har etablerat direkta relationer med tillverkare vilket ger oss konkurrenskraftiga marginaler på 45-60%. Plattformen är byggd på Shopify Plus med anpassade integrationer för lager, ekonomi och kundservice. Med stark SEO-närvaro rankar vi på första sidan för över 2000 söktermer inom heminredning.',
    highlights: [
      '15000+ registrerade kunder med 65% återköpsfrekvens',
      'Genomsnittlig ordervalue 1850 SEK',
      'Gross margin 52% på alla produktkategorier',
      'Partnerskap med 80+ skandinaviska designers',
      'SEO-närvaro: Top 3 för 2000+ söktermer',
      'Stark social media följarbas: 45k Instagram',
      'Automatiserat lagersystem med 99.5% accuracy',
      'Mobil-optimerad: 68% av försäljning via mobil'
    ],
    businessType: 'AB',
    employees: 8,
    foundedYear: 2018,
    monthlyRevenue: 320000,
    monthlyProfit: 125000,
    yearlyRevenue: 3840000,
    yearlyProfit: 1500000,
    industry: 'E-handel',
    tags: ['e-handel', 'heminredning', 'nordisk design', 'Shopify', 'SEO', 'Instagram'],
    websiteTraffic: {
      monthly: 85000,
      organic: 60,
      direct: 25,
      social: 15
    },
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Emma Johansson',
      verified: true,
      joinedDate: '2020-05-12',
      email: 'emma@nordichome.se',
      phone: '+46 73 234 56 78'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-19T14:30:00Z',
    viewCount: 156,
    interestedBuyers: 8,
    bids: []
  },

  // DOMÄNER
  {
    id: 'domain-001',
    title: 'Swedish.com - Premium Global Domain',
    category: 'domains',
    subcategory: 'premium',
    askingPrice: 850000,
    currency: 'SEK',
    location: 'Global',
    description: 'Exklusiv premium .com-domän med enorma möjligheter för svensk varumärkesbyggande internationellt. Perfect för företag som vill etablera sig globalt med tydlig svensk koppling.',
    longDescription: 'Swedish.com representerar en unik möjlighet att äga en av världens mest värdefulla geografiska domäner. Domänen har ägts privat sedan 1995 och har aldrig varit kommersiellt utvecklad, vilket innebär en ren historia utan spam eller negativa associationer. Med Stockholms växande position som startup-huvudstad och Sverige som en global tech-ledare, har denna domän enormt värde för varumärkesbyggande. Domänen är perfekt för allt från turism och export till tech och innovation. Google visar 2.1 miljoner sökningar månadsvis för "Swedish" relaterade termer, vilket indikerar massiv global efterfrågan. Domänen kommer med alla historiska email-adresser och potential för premium subdomain försäljning.',
    highlights: [
      'Ägd sedan 1995 - ren historia utan negativa associationer',
      '2.1 miljoner månatliga sökningar för "Swedish" globalt',
      'Domain Authority 78 enligt Moz',
      'Typ-in traffic: ~500 dagliga direktbesök',
      'Potential för premium subdomain försäljning',
      'Perfect för internationell svensk varumärkesbyggande',
      'Inkluderar alla historiska email-adresser (@swedish.com)',
      'Möjlighet till partnership med Visit Sweden'
    ],
    domainAge: 29,
    domainAuthority: 78,
    monthlySearchVolume: 2100000,
    typeInTraffic: 15000,
    industry: 'Domäner',
    tags: ['premium domän', 'Sverige', 'global', 'varumärke', 'turism', 'export'],
    seoMetrics: {
      domainAuthority: 78,
      backlinks: 8500,
      referringDomains: 1200,
      organicKeywords: 2400
    },
    images: [
      'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'International Domain Holdings',
      verified: true,
      joinedDate: '2019-03-20',
      email: 'domains@idh.com',
      phone: '+46 8 123 456 78'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-21T09:15:00Z',
    viewCount: 203,
    interestedBuyers: 15,
    bids: []
  },

  // BLOGGAR & CONTENT
  {
    id: 'blog-001',
    title: 'TechSverige.se - Ledande Tech Blog med 500k läsare',
    category: 'content',
    subcategory: 'blog',
    askingPrice: 1200000,
    currency: 'SEK',
    location: 'Online',
    description: 'Etablerad tech-blog som täcker svensk startup-scen, innovation och teknologi. Stark auktoritet inom branschen med regelbundna intervjuer med tech-ledare och djupanalys av marknaden.',
    longDescription: 'TechSverige.se har under 6 år byggt upp Sveriges starkaste community för tech-entusiaster och branschproffs. Bloggen startades 2018 och har systematiskt byggt upp sin position genom högkvalitativt innehåll, exklusiva intervjuer och djupa analysartiklar. Vi har intervjuat grundare från Klarna, Spotify, King och andra svenska tech-giganter. Vår månatliga nyhetsbrev har 25000 prenumeranter med 42% öppningsfrekvens. Intäkterna kommer från sponsrade artiklar (85k/månad), nyhetsbrevssponsring (35k/månad), eventpartnerskap och affiliate-marketing. Vi har även lanserat en årlig konferens som genererar ytterligare 400k SEK. Sajten är byggd på WordPress med optimerad hosting och har stark SEO-närvaro för alla relevanta tech-termer.',
    highlights: [
      '500000 unika läsare per månad',
      'Nyhetsbrev: 25000 prenumeranter, 42% öppningsfrekvens',
      'Stark social media närvaro: 35k Twitter, 20k LinkedIn',
      'Exklusiva intervjuer med tech-ledare från Klarna, Spotify, King',
      'SEO: Rankar #1-3 för "svenska startups", "tech Sverige" m.fl.',
      'Månadsintäkter 120k SEK från sponsring och affiliate',
      'Årlig TechSverige Conference: 400k SEK additional revenue',
      'Database med 500+ svenska tech-företag och kontakter'
    ],
    monthlyRevenue: 120000,
    monthlyProfit: 85000,
    yearlyRevenue: 1440000,
    yearlyProfit: 1020000,
    industry: 'Media/Content',
    tags: ['blog', 'tech', 'Sverige', 'startup', 'media', 'content marketing'],
    websiteTraffic: {
      monthly: 500000,
      organic: 75,
      direct: 15,
      social: 10
    },
    socialMedia: {
      twitter: 35000,
      linkedin: 20000,
      newsletter: 25000
    },
    images: [
      'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Andreas Nilsson',
      verified: true,
      joinedDate: '2021-01-15',
      email: 'andreas@techsverige.se',
      phone: '+46 72 345 67 89'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-18T16:20:00Z',
    viewCount: 289,
    interestedBuyers: 11,
    bids: []
  },

  // INSTAGRAM & SOCIAL MEDIA
  {
    id: 'social-001',
    title: '@SvenskMode - 180k följare Instagram Modekonto',
    category: 'social',
    subcategory: 'instagram',
    askingPrice: 650000,
    currency: 'SEK',
    location: 'Social Media',
    description: 'Etablerat Instagram-konto fokuserat på svensk mode och stil med högengagerad audience. Samarbetar regelbundet med kända svenska märken och influencers.',
    longDescription: '@SvenskMode har under 4 år byggt upp en av Sveriges mest engagerade communities inom mode och lifestyle. Kontot startades 2020 och har organiskt växt till 180000 genuina följare med ett genomsnittligt engagement på 8.5% - betydligt högre än branschgenomsnittet på 3-4%. Vår audience består till 78% av kvinnor mellan 18-35 år med stark köpkraft. Vi postar dagligen content som inkluderar outfit inspiration, trendspaning, och samarbeten med svenska modeföretag. Månadsintäkterna kommer från sponsrade posts (45k), Instagram Shopping (25k), och affiliate-marknadsföring (15k). Kontot har samarbetat med märken som Gina Tricot, Weekday, Monki, och &Other Stories. Vi har även lanserat en egen merch-linje som säljer för 20k/månad. Fullständig överföring inkluderar alla befintliga brand partnerships och content bibliotek.',
    highlights: [
      '180000 genuina följare med 8.5% engagement rate',
      'Audience: 78% kvinnor 18-35 år, hög köpkraft',
      'Samarbeten med Gina Tricot, Weekday, Monki, &Other Stories',
      'Månadsintäkter 85k SEK från sponsring och affiliate',
      'Egen merch-linje: 20k SEK/månad',
      'Story views genomsnitt 35000 per post',
      'Verified account med blå checkmark',
      'Content bibliotek med 2000+ posts och templates'
    ],
    monthlyRevenue: 85000,
    monthlyProfit: 70000,
    yearlyRevenue: 1020000,
    yearlyProfit: 840000,
    industry: 'Social Media',
    tags: ['Instagram', 'mode', 'influencer', 'Sverige', 'lifestyle', 'affiliate'],
    socialMetrics: {
      followers: 180000,
      engagementRate: 8.5,
      averageLikes: 12500,
      averageComments: 320,
      storyViews: 35000
    },
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Sofia Andersson',
      verified: true,
      joinedDate: '2020-11-05',
      email: 'sofia@svenskmode.se',
      phone: '+46 76 456 78 90'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-17T11:45:00Z',
    viewCount: 167,
    interestedBuyers: 9,
    bids: []
  },

  // YOUTUBE KANAL
  {
    id: 'youtube-001',
    title: 'Teknik & Gadgets Sverige - 95k prenumeranter YouTube',
    category: 'content',
    subcategory: 'youtube',
    askingPrice: 980000,
    currency: 'SEK',
    location: 'Online',
    description: 'Populär YouTube-kanal inom teknik och gadgets med stark svensk audience. Regelbundna recensioner, unboxings och tech-nyheter som genererar stabila månadsintäkter.',
    longDescription: 'Teknik & Gadgets Sverige har under 5 år etablerat sig som en av Sveriges mest respekterade YouTube-kanaler inom tech-segmentet. Kanalen har 95000 prenumeranter och över 8 miljoner totala visningar. Vår veckovisa upload-schema inkluderar produktrecensioner, unboxings, tech-nyheter och köpguider. Genomsnittligt får varje video 25000-40000 visningar med stark audience retention på 65%. Kanalen monetiseras genom YouTube AdSense (35k/månad), sponsrade videor (55k/månad), och affiliate-länkar (25k/månad). Vi har etablerade relationer med alla större tech-företag och får regelbundet produkter för recensioner. Kanalen inkluderar komplett studio-setup värd 150k SEK, editing-templates, och ett bibliotek med 400+ videor. Stark community med genomsnittligt 500 kommentarer per video och aktiv Discord-server med 5000 medlemmar.',
    highlights: [
      '95000 prenumeranter med 65% audience retention',
      '8+ miljoner totala visningar och växande',
      'Genomsnitt 30000 visningar per video',
      'Månadsintäkter 115k SEK från ads, sponsring, affiliate',
      'Etablerade relationer med Samsung, Apple, Google, OnePlus',
      'Komplett studio-setup inkluderad (värde 150k SEK)',
      'Aktiv community: Discord med 5000 medlemmar',
      'SEO-optimerad: rankar högt för tech-recensioner Sverige'
    ],
    monthlyRevenue: 115000,
    monthlyProfit: 95000,
    yearlyRevenue: 1380000,
    yearlyProfit: 1140000,
    industry: 'Content/Media',
    tags: ['YouTube', 'teknik', 'gadgets', 'recensioner', 'Sverige', 'tech'],
    youtubeMetrics: {
      subscribers: 95000,
      totalViews: 8200000,
      averageViews: 30000,
      uploadFrequency: 'Veckovis',
      retentionRate: 65
    },
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Johan Karlsson',
      verified: true,
      joinedDate: '2021-09-12',
      email: 'johan@teknikgadgets.se',
      phone: '+46 79 567 89 01'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-16T13:30:00Z',
    viewCount: 198,
    interestedBuyers: 7,
    bids: []
  },

  // AFFILIATE/DROPSHIPPING
  {
    id: 'affiliate-001',
    title: 'PremiumReviews.se - Affiliate Marketing Empire',
    category: 'affiliate',
    subcategory: 'review_site',
    askingPrice: 750000,
    currency: 'SEK',
    location: 'Online',
    description: 'Lönsam affiliate-sajt specialiserad på produktrecensioner inom tech, hem och hälsa. Genererar stabila intäkter genom Amazon Associates och direkta advertiser-partnerships.',
    longDescription: 'PremiumReviews.se är en etablerad affiliate marketing-sajt som under 3 år har byggt upp en stark position inom produktrecensioner på den svenska marknaden. Sajten täcker kategorier som teknik, hem & trädgård, hälsa & träning, och barn & familj. Med över 800 djupgående recensioner och köpguider rankar vi på första sidan för 1500+ kommersiella söktermer. Vår SEO-strategi fokuserar på long-tail keywords med hög köpintention. Månadsintäkterna kommer från Amazon Associates (45k), Adtraction (30k), direkta advertiser-partnerships (25k) och display-annonser (15k). Sajten har stark domain authority och genererar 180000 organiska besök per månad. Inkluderar alla befintliga affiliate-partnerships, content-mallar och SEO-verktyg.',
    highlights: [
      '800+ djupgående produktrecensioner och köpguider',
      '180000 organiska besök per månad',
      'Rankar #1-3 för 1500+ kommersiella söktermer',
      'Månadsintäkter 115k SEK från olika affiliate-program',
      'Amazon Associates Elite status med 4.2% conversion rate',
      'Domain Authority 65 med stark backlink-profil',
      'Automated content workflow med VA-team',
      'Diversifierad intäktsmix över 15+ affiliate-nätverk'
    ],
    monthlyRevenue: 115000,
    monthlyProfit: 95000,
    yearlyRevenue: 1380000,
    yearlyProfit: 1140000,
    industry: 'Affiliate Marketing',
    tags: ['affiliate', 'recensioner', 'SEO', 'Amazon', 'Adtraction', 'passive income'],
    websiteTraffic: {
      monthly: 180000,
      organic: 85,
      direct: 10,
      referral: 5
    },
    seoMetrics: {
      domainAuthority: 65,
      organicKeywords: 15000,
      rankingKeywords: 1500,
      backlinks: 3500
    },
    images: [
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'DataCorp Solutions',
      verified: true,
      joinedDate: '2021-06-18',
      email: 'verksamhet@datacorp.se',
      phone: '+46 8 456 78 90'
    },
    status: 'ACTIVE',
    createdAt: '2024-06-15T10:20:00Z',
    viewCount: 134,
    interestedBuyers: 6,
    bids: []
  },

  // Existing listings with enhanced content...
  {
    id: 'comp-002',
    title: 'Sustainable Solutions - Miljökonsult',
    category: 'companies',
    subcategory: 'aktiebolag',
    askingPrice: 5800000,
    currency: 'SEK',
    location: 'Malmö',
    description: 'Ledande miljökonsultföretag med stora företagskunder. Specialiserat på hållbarhetsrapportering och miljöcertifieringar med 15 års marknadserfarenhet.',
    longDescription: 'Sustainable Solutions AB är ett väletablerat miljökonsultföretag som sedan 2009 har hjälpt företag att navigera den komplexa världen av miljöreglering och hållbarhetsrapportering. Vi har byggt upp starka relationer med några av Sveriges största företag inklusive Volvo, IKEA, H&M och Vattenfall. Våra tjänster inkluderar ESG-rapportering, miljöcertifieringar (ISO 14001, EMAS), klimatavtrycksmätningar och hållbarhetsstrategier. Med växande krav på miljörapportering från EU och svenska myndigheter har efterfrågan på våra tjänster ökat dramatiskt. Vi har 12 specialister inom olika områden och en väntelista på 6 månader för nya uppdrag. Företaget har konsekvent visat lönsamhetstillväxt och har återkommande månadskontrakt med 85% av våra kunder.',
    highlights: [
      'Stora företagskunder: Volvo, IKEA, H&M, Vattenfall',
      'Specialistkunskap inom ESG och EU-taxonomin',
      'Stabila återkommande intäkter - 85% repetitionskunder',
      '15 års marknadserfarenhet och stark reputation',
      'ISO 14001 och EMAS certifieringsauktorisation',
      'Väntelista på 6 månader för nya uppdrag',
      'Team av 12 miljöspecialister och auditorer',
      'Tillväxt 40% årligen senaste 3 åren'
    ],
    businessType: 'AB',
    employees: 12,
    foundedYear: 2009,
    monthlyRevenue: 450000,
    monthlyProfit: 180000,
    yearlyRevenue: 5400000,
    yearlyProfit: 2160000,
    industry: 'Miljökonsulting',
    tags: ['miljö', 'ESG', 'hållbarhet', 'konsulting', 'certifiering', 'B2B'],
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
    ],
    seller: {
      name: 'Anna Lindström',
      verified: true,
      joinedDate: '2020-03-10',
      email: 'anna@sustainablesolutions.se',
      phone: '+46 40 123 45 67'
    },
    status: 'SOLD',
    soldDate: '2024-06-08T14:30:00Z',
    soldPrice: 5800000,
    createdAt: '2024-05-15T09:00:00Z',
    viewCount: 189,
    interestedBuyers: 8,
    bids: []
  }
];

// Enhanced search function that searches through all text content
const searchListings = (listings, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return listings;
  }

  const term = searchTerm.toLowerCase().trim();
  
  return listings.filter(listing => {
    // Search in all text fields
    const searchableText = [
      listing.title,
      listing.description,
      listing.longDescription || '',
      listing.location,
      listing.industry || '',
      listing.businessType || '',
      listing.seller.name,
      ...(listing.highlights || []),
      ...(listing.tags || [])
    ].join(' ').toLowerCase();

    // Also search in specific fields
    const specificFields = [
      listing.category,
      listing.subcategory,
      listing.status
    ].join(' ').toLowerCase();

    // Return true if term is found in any searchable content
    return searchableText.includes(term) || 
           specificFields.includes(term) ||
           // Fuzzy matching for common terms
           (term.includes('tech') && searchableText.includes('teknologi')) ||
           (term.includes('miljö') && (searchableText.includes('environment') || searchableText.includes('green'))) ||
           (term.includes('app') && searchableText.includes('applikation')) ||
           (term.includes('företag') && searchableText.includes('business')) ||
           (term.includes('design') && searchableText.includes('design')) ||
           (term.includes('webb') && (searchableText.includes('web') || searchableText.includes('online')));
  });
};

// Enhanced category info with new categories
const CATEGORY_INFO = {
  companies: { 
    name: 'Företag & Bolag', 
    icon: 'Building2', 
    color: 'blue',
    description: 'Kompletta företag, AB, HB och andra bolagsformer'
  },
  ecommerce: { 
    name: 'E-handel & Webshops', 
    icon: 'ShoppingCart', 
    color: 'green',
    description: 'E-handelsplattformar, webshops och online stores'
  },
  domains: { 
    name: 'Domäner & Webbplatser', 
    icon: 'Globe', 
    color: 'purple',
    description: 'Premium domäner, utvecklade webbplatser och digitala tillgångar'
  },
  content: { 
    name: 'Content & Media', 
    icon: 'FileText', 
    color: 'orange',
    description: 'Bloggar, YouTube-kanaler, podcasts och content-sajter'
  },
  social: { 
    name: 'Social Media & Influencer', 
    icon: 'Users', 
    color: 'pink',
    description: 'Instagram-konton, TikTok, Facebook-sidor och influencer-verksamheter'
  },
  affiliate: { 
    name: 'Affiliate & Passive Income', 
    icon: 'TrendingUp', 
    color: 'indigo',
    description: 'Affiliate-sajter, dropshipping och passiva inkomstströmmar'
  },
  digital: { 
    name: 'Digitala Tillgångar', 
    icon: 'Smartphone', 
    color: 'cyan',
    description: 'Appar, mjukvara, SaaS och digitala produkter'
  },
  documents: { 
    name: 'Dokument & Rättigheter', 
    icon: 'FileText', 
    color: 'gray',
    description: 'Patent, varumärken, licenser och rättigheter'
  },
  properties: { 
    name: 'Fastigheter & Lokaler', 
    icon: 'MapPin', 
    color: 'yellow',
    description: 'Kontorslokaler, butiker, lager och speciallokaler'
  },
  services: { 
    name: 'Företagstjänster', 
    icon: 'Briefcase', 
    color: 'red',
    description: 'Kundregister, franchise, leverantörsavtal och distributionskanaler'
  }
};

// Enhanced API Routes
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
  
  // Enhanced search that always tries to return results
  if (q) {
    const directResults = searchListings(filteredListings, q);
    
    if (directResults.length === 0) {
      // Fallback: try partial matching if no direct results
      const partialTerm = q.toLowerCase().trim();
      filteredListings = filteredListings.filter(listing => {
        const searchText = [
          listing.title,
          listing.description,
          listing.category,
          listing.industry || '',
          ...(listing.tags || [])
        ].join(' ').toLowerCase();
        
        // Try to match individual words
        return partialTerm.split(' ').some(word => 
          word.length > 2 && searchText.includes(word)
        );
      });
      
      // If still no results, return popular/recent listings
      if (filteredListings.length === 0) {
        filteredListings = [...MOCK_LISTINGS].sort((a, b) => 
          (b.viewCount || 0) - (a.viewCount || 0)
        ).slice(0, 6);
      }
    } else {
      filteredListings = directResults;
    }
  }
  
  // Apply other filters
  if (category && filteredListings.length > 0) {
    filteredListings = filteredListings.filter(listing => 
      listing.category === category
    );
  }
  
  if (subcategory && filteredListings.length > 0) {
    filteredListings = filteredListings.filter(listing => 
      listing.subcategory === subcategory
    );
  }
  
  if (location && filteredListings.length > 0) {
    filteredListings = filteredListings.filter(listing => 
      listing.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (status && filteredListings.length > 0) {
    filteredListings = filteredListings.filter(listing => 
      listing.status === status.toUpperCase()
    );
  }
  
  // Price filtering
  if ((priceMin || priceMax) && filteredListings.length > 0) {
    filteredListings = filteredListings.filter(listing => {
      const price = listing.askingPrice;
      if (priceMin && price < parseFloat(priceMin)) return false;
      if (priceMax && price > parseFloat(priceMax)) return false;
      return true;
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
      searchTerm: q || null,
      appliedFilters: { category, location, priceMin, priceMax, status },
      stats: {
        activeListings: MOCK_LISTINGS.filter(l => l.status === 'ACTIVE').length,
        completedDeals: MOCK_LISTINGS.filter(l => l.status === 'SOLD').length,
        totalValue: 4.8,
        averageTime: 45
      }
    }
  });
});

// Contact seller endpoint
app.post('/api/listings/:id/contact', (req, res) => {
  const { message, contactInfo } = req.body;
  const listing = MOCK_LISTINGS.find(l => l.id === req.params.id);
  
  if (!listing) {
    return res.status(404).json({ success: false, message: 'Annons hittades inte' });
  }
  
  // Simulate sending email to seller
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        message: `Ditt meddelande har skickats till ${listing.seller.name}. Du kommer att få svar inom 24 timmar.`,
        sellerEmail: listing.seller.email,
        estimatedResponse: '24 timmar'
      }
    });
  }, 1000);
});

// Share listing endpoint
app.post('/api/listings/:id/share', (req, res) => {
  const { platform, email } = req.body;
  const listing = MOCK_LISTINGS.find(l => l.id === req.params.id);
  
  if (!listing) {
    return res.status(404).json({ success: false, message: 'Annons hittades inte' });
  }
  
  const shareUrl = `https://123hansa.se/listings/${listing.id}`;
  
  res.json({
    success: true,
    data: {
      message: 'Annonsen har delats framgångsrikt!',
      shareUrl,
      platform: platform || 'link'
    }
  });
});

// Submit bid endpoint
app.post('/api/listings/:id/bid', (req, res) => {
  const { amount, comment, contactInfo } = req.body;
  const listing = MOCK_LISTINGS.find(l => l.id === req.params.id);
  
  if (!listing) {
    return res.status(404).json({ success: false, message: 'Annons hittades inte' });
  }
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Ogiltigt budbelopp' });
  }
  
  // Add bid to listing
  const bid = {
    id: 'bid-' + Date.now(),
    amount: parseInt(amount),
    comment: comment || '',
    contactInfo,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  if (!listing.bids) {
    listing.bids = [];
  }
  listing.bids.push(bid);
  
  // Update interested buyers count
  listing.interestedBuyers = (listing.interestedBuyers || 0) + 1;
  
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        message: `Ditt bud på ${amount.toLocaleString('sv-SE')} SEK har skickats till ${listing.seller.name}. Du kommer att få svar inom 48 timmar.`,
        bidId: bid.id,
        amount: bid.amount,
        listingTitle: listing.title,
        estimatedResponse: '48 timmar'
      }
    });
  }, 1500);
});

// Get enhanced categories
app.get('/api/categories', (req, res) => {
  const categories = Object.entries(CATEGORY_INFO).map(([id, info]) => ({
    id,
    ...info,
    count: MOCK_LISTINGS.filter(l => l.category === id).length,
    subcategories: getSubcategoriesForCategory(id)
  }));
  
  res.json({
    success: true,
    data: categories
  });
});

function getSubcategoriesForCategory(categoryId) {
  const subcategoryCounts = {};
  MOCK_LISTINGS
    .filter(l => l.category === categoryId)
    .forEach(l => {
      subcategoryCounts[l.subcategory] = (subcategoryCounts[l.subcategory] || 0) + 1;
    });
    
  return Object.entries(subcategoryCounts).map(([subcat, count]) => ({
    id: subcat,
    name: formatSubcategoryName(subcat),
    count
  }));
}

function formatSubcategoryName(subcategory) {
  const nameMap = {
    aktiebolag: 'Aktiebolag (AB)',
    handelsbolag: 'Handelsbolag',
    webshop: 'Webshops',
    premium: 'Premium Domäner',
    blog: 'Bloggar',
    youtube: 'YouTube Kanaler',
    instagram: 'Instagram',
    review_site: 'Recensionssajter'
  };
  return nameMap[subcategory] || subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
}

// Existing endpoints...
app.get('/api/listings/:id', (req, res) => {
  const listing = MOCK_LISTINGS.find(l => l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }
  
  listing.viewCount = (listing.viewCount || 0) + 1;
  
  res.json({
    success: true,
    data: listing
  });
});

// Sold listings endpoint
app.get('/api/listings/sold', (req, res) => {
  const soldListings = MOCK_LISTINGS.filter(l => l.status === 'SOLD');
  
  res.json({
    success: true,
    data: {
      soldListings: soldListings.map(l => ({
        id: l.id,
        title: l.title,
        originalPrice: l.askingPrice,
        soldPrice: l.soldPrice || l.askingPrice,
        soldDate: l.soldDate,
        category: l.category,
        industry: l.industry,
        employees: l.employees,
        location: l.location,
        description: l.description
      })),
      totalSales: soldListings.length,
      totalValue: soldListings.reduce((sum, item) => sum + (item.soldPrice || item.askingPrice), 0)
    }
  });
});

// In-memory storage for pending listings
let pendingListings = [];
let listingIdCounter = 1000;

// Submit new listing endpoint
app.post('/api/listings/submit', (req, res) => {
  const newListing = {
    id: `pending-${listingIdCounter++}`,
    ...req.body,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
    adminReview: {
      autoAnalysis: {
        contentQuality: Math.random() > 0.3 ? 'GOOD' : 'NEEDS_REVIEW',
        priceReasonable: Math.random() > 0.2 ? 'YES' : 'QUESTIONABLE',
        informationComplete: Math.random() > 0.1 ? 'COMPLETE' : 'INCOMPLETE',
        riskLevel: Math.random() > 0.8 ? 'HIGH' : Math.random() > 0.5 ? 'MEDIUM' : 'LOW'
      },
      needsManualReview: Math.random() > 0.7
    }
  };
  
  pendingListings.push(newListing);
  
  res.json({
    success: true,
    data: { listingId: newListing.id, message: 'Listing submitted for review' }
  });
});

// Admin: Get pending listings
app.get('/api/admin/pending-listings', (req, res) => {
  res.json({
    success: true,
    data: pendingListings
  });
});

// Admin: Approve/reject listing
app.post('/api/admin/listings/:id/review', (req, res) => {
  const { id } = req.params;
  const { action, adminNotes } = req.body; // action: 'APPROVE' | 'REJECT'
  
  const listingIndex = pendingListings.findIndex(l => l.id === id);
  if (listingIndex === -1) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }
  
  const listing = pendingListings[listingIndex];
  
  if (action === 'APPROVE') {
    // Move to main listings
    const approvedListing = {
      ...listing,
      id: `approved-${Date.now()}`,
      status: 'ACTIVE',
      approvedAt: new Date().toISOString(),
      adminNotes
    };
    MOCK_LISTINGS.push(approvedListing);
    pendingListings.splice(listingIndex, 1);
  } else if (action === 'REJECT') {
    listing.status = 'REJECTED';
    listing.rejectedAt = new Date().toISOString();
    listing.adminNotes = adminNotes;
  }
  
  res.json({
    success: true,
    data: { message: `Listing ${action.toLowerCase()}ed successfully` }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Enhanced 123hansa.se Marketplace API running on http://localhost:${PORT}`);
  console.log('📋 Enhanced Categories Available:');
  console.log('  🏢 Företag & Bolag');
  console.log('  🛒 E-handel & Webshops');
  console.log('  🌐 Domäner & Webbplatser');
  console.log('  📝 Content & Media');
  console.log('  📱 Social Media & Influencer');
  console.log('  📈 Affiliate & Passive Income');
  console.log('  💻 Digitala Tillgångar');
  console.log('  📄 Dokument & Rättigheter');
  console.log('  🏠 Fastigheter & Lokaler');
  console.log('  💼 Företagstjänster');
  console.log('');
  console.log('💡 New Features:');
  console.log('  🔍 Enhanced search - always returns results');
  console.log('  💰 Bid submission with comments');
  console.log('  📧 Contact seller functionality');
  console.log('  📤 Share listing functionality');
  console.log('  📱 Social media accounts & content sites');
});

module.exports = app;