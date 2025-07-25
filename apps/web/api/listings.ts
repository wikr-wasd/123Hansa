import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock listings data för testing - över 30 realistiska annonser
const mockListings = [
  {
    id: '1',
    title: 'TechStartup AB - AI & Maskininlärning',
    category: 'companies',
    subcategory: 'tech',
    askingPrice: 2500000,
    currency: 'SEK',
    location: 'Stockholm',
    description: 'Innovativt teknikföretag med stark tillväxt inom AI och maskininlärning. Etablerat 2020 med stabil kundkrets och flera stora B2B-kontrakt.',
    highlights: ['AI-teknik', 'Stark tillväxt', 'Erfaren team', '15 anställda'],
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'],
    seller: { name: 'Anna Karlsson', verified: true, joinedDate: '2024-06-20' },
    status: 'ACTIVE',
    createdAt: '2024-06-20',
    viewCount: 156,
    interestedBuyers: 8,
    owner: { firstName: 'Anna', lastName: 'Karlsson' }
  },
  {
    id: '2',
    title: 'Nordic Fashion E-handel',
    category: 'ecommerce',
    subcategory: 'fashion',
    askingPrice: 850000,
    currency: 'SEK',
    location: 'Göteborg',
    description: 'Välestablerad e-handel inom mode med egen varumärke. Stark återkommande kundkrets och växande försäljning.',
    highlights: ['Egen varumärke', 'Återkommande kunder', 'Etablerat brand'],
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'],
    seller: { name: 'Erik Johansson', verified: true, joinedDate: '2024-05-15' },
    status: 'ACTIVE',
    createdAt: '2024-05-15',
    viewCount: 234,
    interestedBuyers: 12,
    owner: { firstName: 'Erik', lastName: 'Johansson' }
  },
  {
    id: '3',
    title: 'ProjectFlow SaaS - Projekthantering',
    category: 'digital',
    subcategory: 'saas',
    askingPrice: 4200000,
    currency: 'SEK',
    location: 'Malmö',
    description: 'Modern SaaS-plattform för projekthantering med över 500 betalande kunder. Stark tillväxt och återkommande intäkter.',
    highlights: ['500+ kunder', 'Återkommande intäkter', 'Skalbar teknik'],
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'],
    seller: { name: 'Sara Lindberg', verified: true, joinedDate: '2024-04-10' },
    status: 'ACTIVE',
    createdAt: '2024-04-10',
    viewCount: 412,
    interestedBuyers: 23,
    owner: { firstName: 'Sara', lastName: 'Lindberg' }
  },
  {
    id: '4',
    title: 'Café & Restaurang Central Stockholm',
    category: 'companies',
    subcategory: 'restaurant',
    askingPrice: 1200000,
    currency: 'SEK',
    location: 'Stockholm',
    description: 'Populär café och lunchrestaurang mitt i Stockholm. Välkänd bland lokalbefolkning med hög lönsamhet.',
    highlights: ['Central lokalisering', 'Lojala kunder', 'Hög marginal'],
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'],
    seller: { name: 'Maria Andersson', verified: true, joinedDate: '2024-05-28' },
    status: 'ACTIVE',
    createdAt: '2024-05-28',
    viewCount: 189,
    interestedBuyers: 15,
    owner: { firstName: 'Maria', lastName: 'Andersson' }
  },
  {
    id: '5',
    title: 'Webbyrå med 25+ kunder',
    category: 'services',
    subcategory: 'webdesign',
    askingPrice: 950000,
    currency: 'SEK',
    location: 'Uppsala',
    description: 'Etablerad webbyrå specialiserad på WordPress och e-handel. Fasta månadsavtal med lokala företag.',
    highlights: ['25+ aktiva kunder', 'Återkommande intäkter', 'Stark portfölj'],
    images: ['https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop'],
    seller: { name: 'Johan Nilsson', verified: true, joinedDate: '2024-04-22' },
    status: 'ACTIVE',
    createdAt: '2024-04-22',
    viewCount: 298,
    interestedBuyers: 18,
    owner: { firstName: 'Johan', lastName: 'Nilsson' }
  },
  {
    id: '6',
    title: 'Fitness-app med 10k+ användare',
    category: 'digital',
    subcategory: 'mobile-app',
    askingPrice: 1800000,
    currency: 'SEK',
    location: 'Västerås',
    description: 'Populär fitness-app med över 10,000 aktiva användare. Freemium-modell med premium-prenumerationer.',
    highlights: ['10k+ användare', 'Premium-modell', 'Stark engagement'],
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
    seller: { name: 'Lisa Borg', verified: true, joinedDate: '2024-05-01' },
    status: 'ACTIVE',
    createdAt: '2024-05-01',
    viewCount: 367,
    interestedBuyers: 29,
    owner: { firstName: 'Lisa', lastName: 'Borg' }
  },
  {
    id: '7',
    title: 'Instagram-konto @nordiclifestyle (45k följare)',
    category: 'social',
    subcategory: 'instagram',
    askingPrice: 320000,
    currency: 'SEK',
    location: 'Online',
    description: 'Verifierat Instagram-konto inom lifestyle och hälsa. Hög engagement-rate och samarbeten med varumärken.',
    highlights: ['45k följare', 'Verifierat konto', 'Hög engagement'],
    images: ['https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=300&fit=crop'],
    seller: { name: 'Emma Svensson', verified: true, joinedDate: '2024-06-05' },
    status: 'ACTIVE',
    createdAt: '2024-06-05',
    viewCount: 445,
    interestedBuyers: 34,
    owner: { firstName: 'Emma', lastName: 'Svensson' }
  },
  {
    id: '8',
    title: 'E-learning Platform för Kodning',
    category: 'digital',
    subcategory: 'education',
    askingPrice: 3500000,
    currency: 'SEK',
    location: 'Linköping',
    description: 'Online-plattform för kodutbildning med över 1000 betalande studenter. Komplett LMS-system.',
    highlights: ['1000+ studenter', 'Komplett kursmaterial', 'Skalbar plattform'],
    images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'],
    seller: { name: 'David Olsson', verified: true, joinedDate: '2024-03-15' },
    status: 'ACTIVE',
    createdAt: '2024-03-15',
    viewCount: 578,
    interestedBuyers: 41,
    owner: { firstName: 'David', lastName: 'Olsson' }
  },
  {
    id: '9',
    title: 'Premium Domän: NordicTech.se',
    category: 'domains',
    subcategory: 'premium',
    askingPrice: 125000,
    currency: 'SEK',
    location: 'Online',
    description: 'Premium .se-domän perfekt för teknikföretag. Kort, minnesvärd och SEO-stark inom tech-branschen.',
    highlights: ['Premium domän', '.se TLD', 'Tech-fokuserad'],
    images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop'],
    seller: { name: 'Peter Gustafsson', verified: true, joinedDate: '2024-06-12' },
    status: 'ACTIVE',
    createdAt: '2024-06-12',
    viewCount: 167,
    interestedBuyers: 12,
    owner: { firstName: 'Peter', lastName: 'Gustafsson' }
  },
  {
    id: '10',
    title: 'YouTube-kanal Gaming (120k prenumeranter)',
    category: 'content',
    subcategory: 'youtube',
    askingPrice: 890000,
    currency: 'SEK',
    location: 'Online',
    description: 'Etablerad gaming-kanal med över 120,000 prenumeranter. Monetiserad med sponsorkontrakt.',
    highlights: ['120k prenumeranter', 'Monetiserad', 'Gaming-nisch'],
    images: ['https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop'],
    seller: { name: 'Alexander Berg', verified: true, joinedDate: '2024-04-30' },
    status: 'ACTIVE',
    createdAt: '2024-04-30',
    viewCount: 634,
    interestedBuyers: 47,
    owner: { firstName: 'Alexander', lastName: 'Berg' }
  },
  {
    id: '11',
    title: 'Redovisningsbyrå med 80 kunder',
    category: 'services',
    subcategory: 'accounting',
    askingPrice: 2100000,
    currency: 'SEK',
    location: 'Örebro',
    description: 'Välkänd redovisningsbyrå med 80 fasta kunder. Lång erfarenhet och stark lokal reputation.',
    highlights: ['80 fasta kunder', 'Lokal reputation', 'Stabil affär'],
    images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'],
    seller: { name: 'Margareta Lind', verified: true, joinedDate: '2024-03-22' },
    status: 'ACTIVE',
    createdAt: '2024-03-22',
    viewCount: 245,
    interestedBuyers: 19,
    owner: { firstName: 'Margareta', lastName: 'Lind' }
  },
  {
    id: '12',
    title: 'Affiliate-sajt inom Husdjur (50k SEK/mån)',
    category: 'affiliate',
    subcategory: 'pets',
    askingPrice: 750000,
    currency: 'SEK',
    location: 'Online',
    description: 'Lönsam affiliate-sajt inom husdjursnischen. Genererar 50,000 SEK per månad i passiv inkomst.',
    highlights: ['50k SEK/mån', 'Passiv inkomst', 'Etablerad trafik'],
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop'],
    seller: { name: 'Caroline Hedström', verified: true, joinedDate: '2024-05-18' },
    status: 'ACTIVE',
    createdAt: '2024-05-18',
    viewCount: 523,
    interestedBuyers: 38,
    owner: { firstName: 'Caroline', lastName: 'Hedström' }
  },
  {
    id: '13',
    title: 'Hårfrisör-salong Centrala Göteborg',
    category: 'companies',
    subcategory: 'beauty',
    askingPrice: 680000,
    currency: 'SEK',
    location: 'Göteborg',
    description: 'Modern hårfrisör-salong i centrala Göteborg. Lojal kundkrets och fullt bokad 3 månader framåt.',
    highlights: ['Central lokalisering', 'Lojala kunder', 'Fullt bokad'],
    images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop'],
    seller: { name: 'Jessica Palmqvist', verified: true, joinedDate: '2024-04-08' },
    status: 'ACTIVE',
    createdAt: '2024-04-08',
    viewCount: 312,
    interestedBuyers: 22,
    owner: { firstName: 'Jessica', lastName: 'Palmqvist' }
  },
  {
    id: '14',
    title: 'CRM-system för Småföretag (SaaS)',
    category: 'digital',
    subcategory: 'saas',
    askingPrice: 2800000,
    currency: 'SEK',
    location: 'Helsingborg',
    description: 'Enkelt CRM-system speciellt utvecklat för småföretag. 300+ betalande kunder och växande.',
    highlights: ['300+ kunder', 'SMB-fokus', 'Återkommande intäkter'],
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop'],
    seller: { name: 'Thomas Rydberg', verified: true, joinedDate: '2024-02-14' },
    status: 'ACTIVE',
    createdAt: '2024-02-14',
    viewCount: 467,
    interestedBuyers: 31,
    owner: { firstName: 'Thomas', lastName: 'Rydberg' }
  },
  {
    id: '15',
    title: 'E-handel Hemtextil & Inredning',
    category: 'ecommerce',
    subcategory: 'home',
    askingPrice: 1450000,
    currency: 'SEK',
    location: 'Växjö',
    description: 'Välsorterad e-handel inom hemtextil och inredning. Stark tillväxt under senaste året.',
    highlights: ['Bred produktsortiment', 'Stark tillväxt', 'Etablerade leverantörer'],
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'],
    seller: { name: 'Helena Åkerlund', verified: true, joinedDate: '2024-03-09' },
    status: 'ACTIVE',
    createdAt: '2024-03-09',
    viewCount: 389,
    interestedBuyers: 26,
    owner: { firstName: 'Helena', lastName: 'Åkerlund' }
  },
  {
    id: '16',
    title: 'Podcast Network (5 podcasts, 500k lyssnare)',
    category: 'content',
    subcategory: 'podcast',
    askingPrice: 1200000,
    currency: 'SEK',
    location: 'Online',
    description: 'Podcastnätverk med 5 etablerade podcasts och sammanlagt över 500,000 månatliga lyssnare.',
    highlights: ['5 podcasts', '500k lyssnare/mån', 'Monetiserat'],
    images: ['https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop'],
    seller: { name: 'Marcus Engström', verified: true, joinedDate: '2024-01-25' },
    status: 'ACTIVE',
    createdAt: '2024-01-25',
    viewCount: 721,
    interestedBuyers: 52,
    owner: { firstName: 'Marcus', lastName: 'Engström' }
  },
  {
    id: '17',
    title: 'Bilverkstad & Däckhotell Malmö',
    category: 'companies',
    subcategory: 'automotive',
    askingPrice: 1850000,
    currency: 'SEK',
    location: 'Malmö',
    description: 'Välrenommerad bilverkstad med däckhotell. Fasta kunder och serviceavtal med företag.',
    highlights: ['Däckhotell', 'Företagskunder', 'Välrenommerad'],
    images: ['https://images.unsplash.com/photo-1632823471565-1ecdf09bb0b7?w=400&h=300&fit=crop'],
    seller: { name: 'Ronny Persson', verified: true, joinedDate: '2024-02-28' },
    status: 'ACTIVE',
    createdAt: '2024-02-28',
    viewCount: 278,
    interestedBuyers: 17,
    owner: { firstName: 'Ronny', lastName: 'Persson' }
  },
  {
    id: '18',
    title: 'TikTok-konto @swedishfood (200k följare)',
    category: 'social',
    subcategory: 'tiktok',
    askingPrice: 450000,
    currency: 'SEK',
    location: 'Online',
    description: 'Populärt TikTok-konto om svensk matkultur. Viral potential och stark engagement från unga användare.',
    highlights: ['200k följare', 'Mat-nisch', 'Hög engagement'],
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'],
    seller: { name: 'Sofia Lundgren', verified: true, joinedDate: '2024-05-12' },
    status: 'ACTIVE',
    createdAt: '2024-05-12',
    viewCount: 612,
    interestedBuyers: 43,
    owner: { firstName: 'Sofia', lastName: 'Lundgren' }
  },
  {
    id: '19',
    title: 'Yoga-studio Central Stockholm',
    category: 'companies',
    subcategory: 'fitness',
    askingPrice: 920000,
    currency: 'SEK',
    location: 'Stockholm',
    description: 'Prisad yoga-studio i centrala Stockholm. Månadsmedlemskap och populära klasser.',
    highlights: ['Central läge', 'Månadsmedlemmar', 'Prisad studio'],
    images: ['https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&fit=crop'],
    seller: { name: 'Annika Rosén', verified: true, joinedDate: '2024-04-16' },
    status: 'ACTIVE',
    createdAt: '2024-04-16',
    viewCount: 354,
    interestedBuyers: 25,
    owner: { firstName: 'Annika', lastName: 'Rosén' }
  },
  {
    id: '20',
    title: 'E-bokförlag med 50+ titlar',
    category: 'content',
    subcategory: 'publishing',
    askingPrice: 1680000,
    currency: 'SEK',
    location: 'Sundsvall',
    description: 'Digitalt bokförlag med över 50 publicerade titlar. Återkommande royalty-intäkter.',
    highlights: ['50+ titlar', 'Royalty-intäkter', 'Digital distribution'],
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'],
    seller: { name: 'Gunnar Holmberg', verified: true, joinedDate: '2024-01-08' },
    status: 'ACTIVE',
    createdAt: '2024-01-08',
    viewCount: 432,
    interestedBuyers: 28,
    owner: { firstName: 'Gunnar', lastName: 'Holmberg' }
  },
  {
    id: '21',
    title: 'Fastighetsförvaltning Västerås (45 objekt)',
    category: 'properties',
    subcategory: 'management',
    askingPrice: 3200000,
    currency: 'SEK',
    location: 'Västerås',
    description: 'Etablerat fastighetsförvaltningsbolag med 45 förvaltningsobjekt. Återkommande månadsavtal.',
    highlights: ['45 objekt', 'Månadsavtal', 'Etablerat företag'],
    images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'],
    seller: { name: 'Lars-Erik Nyström', verified: true, joinedDate: '2024-02-05' },
    status: 'ACTIVE',
    createdAt: '2024-02-05',
    viewCount: 298,
    interestedBuyers: 21,
    owner: { firstName: 'Lars-Erik', lastName: 'Nyström' }
  },
  {
    id: '22',
    title: 'Mobilapp-utvecklingsbyrå',
    category: 'services',
    subcategory: 'mobile-development',
    askingPrice: 1750000,
    currency: 'SEK',
    location: 'Karlstad',
    description: 'Specialiserad mobilapp-utvecklingsbyrå med fokus på iOS och Android. 8 anställda utvecklare.',
    highlights: ['iOS & Android', '8 utvecklare', 'Etablerade kunder'],
    images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop'],
    seller: { name: 'Daniel Wikström', verified: true, joinedDate: '2024-03-30' },
    status: 'ACTIVE',
    createdAt: '2024-03-30',
    viewCount: 456,
    interestedBuyers: 32,
    owner: { firstName: 'Daniel', lastName: 'Wikström' }
  },
  {
    id: '23',
    title: 'Nischad E-handel Sportfiske',
    category: 'ecommerce',
    subcategory: 'sports',
    askingPrice: 780000,
    currency: 'SEK',
    location: 'Kiruna',
    description: 'Specialiserad e-handel inom sportfiske-utrustning. Stark position i nischad marknad.',
    highlights: ['Nischad marknad', 'Lojala kunder', 'Höga marginaler'],
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'],
    seller: { name: 'Björn Sandström', verified: true, joinedDate: '2024-05-22' },
    status: 'ACTIVE',
    createdAt: '2024-05-22',
    viewCount: 267,
    interestedBuyers: 16,
    owner: { firstName: 'Björn', lastName: 'Sandström' }
  },
  {
    id: '24',
    title: 'LinkedIn-konto B2B Coach (25k följare)',
    category: 'social',
    subcategory: 'linkedin',
    askingPrice: 380000,
    currency: 'SEK',
    location: 'Online',
    description: 'Välkänt LinkedIn-konto inom B2B-coaching. Hög engagement från företagsledare och säljare.',
    highlights: ['25k följare', 'B2B-fokus', 'Företagskunder'],
    images: ['https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=400&h=300&fit=crop'],
    seller: { name: 'Robert Hägg', verified: true, joinedDate: '2024-04-25' },
    status: 'ACTIVE',
    createdAt: '2024-04-25',
    viewCount: 389,
    interestedBuyers: 27,
    owner: { firstName: 'Robert', lastName: 'Hägg' }
  },
  {
    id: '25',
    title: 'Städfirma Göteborg (12 anställda)',
    category: 'services',
    subcategory: 'cleaning',
    askingPrice: 1350000,
    currency: 'SEK',
    location: 'Göteborg',
    description: 'Välkänd städfirma med 12 anställda och kontrakt med lokala företag och bostadsrättsföreningar.',
    highlights: ['12 anställda', 'Fasta kontrakt', 'Lokal marknad'],
    images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'],
    seller: { name: 'Amira Hassan', verified: true, joinedDate: '2024-01-18' },
    status: 'ACTIVE',
    createdAt: '2024-01-18',
    viewCount: 234,
    interestedBuyers: 18,
    owner: { firstName: 'Amira', lastName: 'Hassan' }
  },
  {
    id: '26',
    title: 'Premium Domän: FinTechSweden.com',
    category: 'domains',
    subcategory: 'premium',
    askingPrice: 85000,
    currency: 'SEK',
    location: 'Online',
    description: 'Stark domän för fintech-företag med Sverige-fokus. Perfekt för startup inom finanssektorn.',
    highlights: ['.com TLD', 'FinTech-nisch', 'Sverige-fokus'],
    images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop'],
    seller: { name: 'Fredrik Morén', verified: true, joinedDate: '2024-06-18' },
    status: 'ACTIVE',
    createdAt: '2024-06-18',
    viewCount: 145,
    interestedBuyers: 9,
    owner: { firstName: 'Fredrik', lastName: 'Morén' }
  },
  {
    id: '27',
    title: 'Hudvårdsklinik & Spa Malmö',
    category: 'companies',
    subcategory: 'beauty',
    askingPrice: 2400000,
    currency: 'SEK',
    location: 'Malmö',
    description: 'Exklusiv hudvårdsklinik och spa. Certifierade behandlare och högkvalitativ utrustning.',
    highlights: ['Certifierade behandlare', 'Exklusiv klientel', 'Modern utrustning'],
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop'],
    seller: { name: 'Camilla Ek', verified: true, joinedDate: '2024-02-12' },
    status: 'ACTIVE',
    createdAt: '2024-02-12',
    viewCount: 378,
    interestedBuyers: 24,
    owner: { firstName: 'Camilla', lastName: 'Ek' }
  },
  {
    id: '28',
    title: 'Nyhetsblogg Lokala Nyheter (100k läsare/mån)',
    category: 'content',
    subcategory: 'blog',
    askingPrice: 650000,
    currency: 'SEK',
    location: 'Umeå',
    description: 'Välkänd nyhetsblogg för lokala nyheter i Umeå-regionen. Stark läsarkrets och annonsintäkter.',
    highlights: ['100k läsare/mån', 'Lokala nyheter', 'Annonsintäkter'],
    images: ['https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop'],
    seller: { name: 'Ingrid Blomqvist', verified: true, joinedDate: '2024-03-06' },
    status: 'ACTIVE',
    createdAt: '2024-03-06',
    viewCount: 487,
    interestedBuyers: 35,
    owner: { firstName: 'Ingrid', lastName: 'Blomqvist' }
  },
  {
    id: '29',
    title: 'E-handel Babyprodukter & Leksaker',
    category: 'ecommerce',
    subcategory: 'kids',
    askingPrice: 1150000,
    currency: 'SEK',
    location: 'Jönköping',
    description: 'Omfattande e-handel inom babyprodukter och leksaker. Välkända varumärken och snabb leverans.',
    highlights: ['Välkända varumärken', 'Snabb leverans', 'Återkommande kunder'],
    images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop'],
    seller: { name: 'Eva Isaksson', verified: true, joinedDate: '2024-04-02' },
    status: 'ACTIVE',
    createdAt: '2024-04-02',
    viewCount: 423,
    interestedBuyers: 31,
    owner: { firstName: 'Eva', lastName: 'Isaksson' }
  },
  {
    id: '30',
    title: 'IT-support & Molntjänster',
    category: 'services',
    subcategory: 'it-support',
    askingPrice: 1950000,
    currency: 'SEK',
    location: 'Kalmar',
    description: 'IT-supportföretag specialiserat på molntjänster för småföretag. Månatliga supportavtal.',
    highlights: ['Molnspecialist', 'Månatliga avtal', 'SMB-fokus'],
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'],
    seller: { name: 'Mikael Strand', verified: true, joinedDate: '2024-01-12' },
    status: 'ACTIVE',
    createdAt: '2024-01-12',
    viewCount: 345,
    interestedBuyers: 23,
    owner: { firstName: 'Mikael', lastName: 'Strand' }
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
            completedDeals: 127,
            totalValue: 85000000,
            averageTime: 42
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