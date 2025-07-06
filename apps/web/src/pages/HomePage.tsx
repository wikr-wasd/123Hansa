import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Search, 
  Building2, 
  Globe, 
  FileText, 
  MapPin, 
  Briefcase,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Timer,
  Shield,
  Award
} from 'lucide-react';
import CategoryIcons from '../components/search/CategoryIcons';
import ChatSystem from '../components/chat/ChatSystem';

// Enhanced asset category definitions with new digital categories
const ASSET_CATEGORIES = [
  {
    id: 'companies',
    title: 'Företag & Bolag',
    icon: Building2,
    color: 'blue',
    items: [
      { name: 'Aktiebolag (AB)', description: 'Kompletta företag med anställda och verksamhet' },
      { name: 'Handelsbolag', description: 'Partnership-baserade företag' },
      { name: 'Enskilda firmor', description: 'Enmansföretag' },
      { name: 'Kommanditbolag', description: 'Begränsade partnership' }
    ]
  },
  {
    id: 'ecommerce',
    title: 'E-handel & Webshops',
    icon: Globe,
    color: 'green',
    items: [
      { name: 'Webshops', description: 'Etablerade e-handelsplattformar' },
      { name: 'Dropshipping', description: 'Dropshipping-verksamheter' },
      { name: 'Marketplace', description: 'Multi-vendor plattformar' },
      { name: 'Subscription', description: 'Prenumerationsbaserade tjänster' }
    ]
  },
  {
    id: 'domains',
    title: 'Domäner & Webbplatser',
    icon: Globe,
    color: 'purple',
    items: [
      { name: 'Premium domäner', description: 'Värdefulla .se, .com domäner' },
      { name: 'Utvecklade sajter', description: 'Färdigbyggda webbplatser' },
      { name: 'Parked domains', description: 'Domäner med trafik' },
      { name: 'Brandable domains', description: 'Unika varumärkesdomäner' }
    ]
  },
  {
    id: 'content',
    title: 'Content & Media',
    icon: FileText,
    color: 'orange',
    items: [
      { name: 'Bloggar', description: 'Etablerade bloggar med trafik' },
      { name: 'YouTube-kanaler', description: 'Monetiserade YouTube-kanaler' },
      { name: 'Podcasts', description: 'Podcast-serier med audience' },
      { name: 'Nyhetssajter', description: 'Nischade nyhetssajter' }
    ]
  },
  {
    id: 'social',
    title: 'Social Media',
    icon: Users,
    color: 'pink',
    items: [
      { name: 'Instagram-konton', description: 'Konton med stora följarbaser' },
      { name: 'TikTok-konton', description: 'Virala TikTok-konton' },
      { name: 'Facebook-sidor', description: 'Etablerade Facebook-sidor' },
      { name: 'LinkedIn-sidor', description: 'B2B LinkedIn-närvaro' }
    ]
  },
  {
    id: 'affiliate',
    title: 'Affiliate & Passive Income',
    icon: TrendingUp,
    color: 'indigo',
    items: [
      { name: 'Affiliate-sajter', description: 'Sajter med passiva inkomster' },
      { name: 'Recensionssajter', description: 'Produktrecensioner med intäkter' },
      { name: 'Email-listor', description: 'Stora, engagerade email-listor' },
      { name: 'Online-kurser', description: 'Monetiserade online-kurser' }
    ]
  }
];

// Mock data for social proof
const SOCIAL_PROOF_STATS = {
  activeListings: 2847,
  completedDeals: 1253,
  totalValue: 4.8, // billion SEK
  averageTime: 45 // days
};

// Featured successful deals for demo
const FEATURED_DEALS = [
  {
    id: 1,
    title: 'TechStartup AB',
    category: 'SaaS-företag',
    price: '12.5M SEK',
    industry: 'Fintech',
    employees: 25,
    location: 'Stockholm',
    soldDate: '2024-06-15',
    description: 'AI-driven betalningslösning med 200+ företagskunder',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format',
    logo: 'https://ui-avatars.com/api/?name=TechStartup+AB&background=0D8ABC&color=fff&size=80'
  },
  {
    id: 2,
    title: 'Nordic E-handel',
    category: 'E-handelsplattform',
    price: '8.2M SEK',
    industry: 'E-handel',
    employees: 15,
    location: 'Göteborg',
    soldDate: '2024-06-10',
    description: 'Etablerad e-handelsplattform med stark tillväxt',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&auto=format',
    logo: 'https://ui-avatars.com/api/?name=Nordic+E-handel&background=10B981&color=fff&size=80'
  },
  {
    id: 3,
    title: 'Sustainable Solutions',
    category: 'Konsultföretag',
    price: '5.8M SEK',
    industry: 'Hållbarhet',
    employees: 12,
    location: 'Malmö',
    soldDate: '2024-06-08',
    description: 'Miljökonsultföretag med stora företagskunder',
    image: 'https://images.unsplash.com/photo-1497436072909-f5e4be85ed30?w=400&h=300&fit=crop&auto=format',
    logo: 'https://ui-avatars.com/api/?name=Sustainable+Solutions&background=059669&color=fff&size=80'
  }
];

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/listings?${params.toString()}`);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      <Helmet>
        <title>123Hansa.se - Nordens Marknadsplats för Företag</title>
        <meta name="description" content="Köp och sälj företag, digitala tillgångar, fastigheter och affärstjänster på Nordens ledande marknadsplats. Säkra transaktioner med professionell support." />
        <meta name="keywords" content="köpa företag, sälja företag, företagsförvärv, M&A, företagsmäklare, Sverige, Norge, Danmark" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-500/5 to-purple-600/5"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
                <span className="block">Nordens</span>
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Marknadsplats
                </span>
                <span className="block">för Företag</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-slate-600 mb-8 leading-relaxed">
                🚀 <strong>3,2 miljarder SEK</strong> i genomförda affärer senaste året! 
                Köp och sälj företag, digitala tillgångar och affärstjänster med förtroende. 
                Professionell support från start till slutförd affär.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Över 15,000 registrerade köpare
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  95% nöjdhet från säljare
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Genomsnittlig försäljningstid: 45 dagar
                </div>
              </div>


              {/* Prominent Search Bar */}
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl shadow-xl p-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Sök efter företag, domäner, lokaler eller tjänster..."
                        className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-4 border-0 rounded-xl bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Alla kategorier</option>
                      {ASSET_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Sök
                    </button>
                  </div>
                </form>
                
                {/* Category Icons */}
                <div className="mt-8">
                  <CategoryIcons />
                </div>
              </div>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  {SOCIAL_PROOF_STATS.activeListings.toLocaleString('sv-SE')}
                </div>
                <div className="text-slate-600 font-medium">Aktiva annonser</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  {SOCIAL_PROOF_STATS.completedDeals.toLocaleString('sv-SE')}
                </div>
                <div className="text-slate-600 font-medium">Genomförda affärer</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  {SOCIAL_PROOF_STATS.totalValue}B SEK
                </div>
                <div className="text-slate-600 font-medium">Total omsättning</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  {SOCIAL_PROOF_STATS.averageTime}
                </div>
                <div className="text-slate-600 font-medium">Dagar till affär</div>
              </div>
            </div>
          </div>
        </section>

        {/* Asset Categories */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Vad kan du köpa och sälja?
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                123hansa är Nordens mest omfattande marknadsplats för alla typer av affärstillgångar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {ASSET_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div
                    key={category.id}
                    className={`${getColorClasses(category.color)} border-2 rounded-2xl p-8 transition-all duration-200 cursor-pointer transform hover:scale-105`}
                    onClick={() => navigate(`/listings?category=${category.id}`)}
                  >
                    <div className="flex items-center mb-6">
                      <IconComponent className="w-8 h-8 mr-3" />
                      <h3 className="text-xl font-bold">{category.title}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {category.items.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-sm">{item.name}</div>
                            <div className="text-xs opacity-75">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Link
                to="/listings"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Utforska alla kategorier
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Recent Sales */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Senaste framgångsrika affärer
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Se exempel på företag som nyligen sålts genom 123Hansa med framgångsrika resultat
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {FEATURED_DEALS.map((deal) => (
                <div key={deal.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  {/* Header Image */}
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.title)}&background=random&size=400x300`;
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full shadow-sm">
                        SÅLD
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 text-slate-600 text-sm font-medium rounded-full shadow-sm">
                        {new Date(deal.soldDate).toLocaleDateString('sv-SE')}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Company Logo and Title */}
                    <div className="flex items-center mb-4">
                      <img
                        src={deal.logo}
                        alt={`${deal.title} logo`}
                        className="w-12 h-12 rounded-full mr-4 shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(deal.title)}&background=random&size=50`;
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{deal.title}</h3>
                        <p className="text-sm text-slate-500">{deal.category}</p>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">{deal.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Försäljningspris:</span>
                        <span className="font-bold text-green-600 text-lg">{deal.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Bransch:</span>
                        <span className="font-medium text-sm">{deal.industry}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Anställda:</span>
                        <span className="font-medium text-sm">{deal.employees}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Plats:</span>
                        <span className="font-medium text-sm">{deal.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center space-y-4">
              <Link
                to="/sales-demo"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Se detaljerade framgångsstories
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              
              <div>
                <Link
                  to="/listings?status=SOLD"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Se alla genomförda affärer
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Security Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Säkert och professionellt
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Vi erbjuder trygghet och expertis i varje steg av affärsprocessen
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Säkra transaktioner</h3>
                <p className="text-slate-600">
                  Alla affärer hanteras med escrow-tjänster och juridisk support för maximal säkerhet.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Expert support</h3>
                <p className="text-slate-600">
                  Våra M&A-experter och företagsmäklare hjälper dig genom hela processen.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Verifierade aktörer</h3>
                <p className="text-slate-600">
                  Alla användare genomgår verifiering för att säkerställa äkta och seriösa affärer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories & Testimonials */}
        <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                💎 Verkliga framgångsstories från våra kunder
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Läs hur andra entreprenörer har förändrat sina liv genom 123Hansa
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Testimonial 1 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 relative">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">AS</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-slate-900">Anna Svensson</h4>
                    <p className="text-slate-500 text-sm">Sålde TechStartup AB</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 italic mb-4">
                  "123Hansa hjälpte mig sälja mitt tech-företag för 2.5M SEK på bara 6 veckor! 
                  Professionell service hela vägen. Skulle definitivt använda igen."
                </p>
                <div className="bg-green-50 px-4 py-2 rounded-lg">
                  <span className="text-green-700 font-semibold">💰 Exit: 2.5M SEK</span>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 relative">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">MJ</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-slate-900">Marcus Johansson</h4>
                    <p className="text-slate-500 text-sm">Köpte E-handelsföretag</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 italic mb-4">
                  "Hittade det perfekta e-handelsföretaget här. Transparent process, 
                  bra due diligence-support. Omsättningen har ökat med 300% sedan köpet!"
                </p>
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-blue-700 font-semibold">📈 +300% tillväxt</span>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white rounded-2xl shadow-xl p-8 relative">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">LB</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-slate-900">Lisa Bergström</h4>
                    <p className="text-slate-500 text-sm">Sålde SaaS-plattform</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 italic mb-4">
                  "Fantastisk plattform! Fick flera seriösa bud inom första veckan. 
                  Slutade med att sälja för 40% över ursprungligt asking price!"
                </p>
                <div className="bg-purple-50 px-4 py-2 rounded-lg">
                  <span className="text-purple-700 font-semibold">🎯 +40% över asking</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/sales-demo"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Award className="w-5 h-5 mr-3" />
                Läs fler framgångsstories
                <ArrowRight className="ml-3 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ROI Calculator Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-16 lg:px-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                      🚀 Räkna ut din potentiella avkastning
                    </h2>
                    <p className="text-blue-100 text-lg mb-8">
                      Använd vår ROI-kalkylator för att se hur mycket du kan tjäna på att 
                      investera i rätt företag genom 123Hansa.
                    </p>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Genomsnittlig ROI: 340%</h4>
                          <p className="text-blue-200 text-sm">Baserat på 500+ genomförda affärer</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Timer className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Payback-tid: 18 månader</h4>
                          <p className="text-blue-200 text-sm">Mediantid till break-even</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Success rate: 87%</h4>
                          <p className="text-blue-200 text-sm">Köp som blivit lönsamma inom 2 år</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                      🧮 ROI Kalkylator
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Investeringsbelopp (SEK)
                        </label>
                        <input
                          type="number"
                          placeholder="500,000"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Förväntad tillväxt per år (%)
                        </label>
                        <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                          <option>25% - Konservativ</option>
                          <option>50% - Genomsnitt</option>
                          <option>100% - Aggressiv</option>
                        </select>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <div className="text-center">
                          <p className="text-sm font-semibold text-green-700 mb-2">Förväntad avkastning efter 3 år:</p>
                          <p className="text-3xl font-bold text-green-600">1,953,125 SEK</p>
                          <p className="text-sm text-green-600">+291% total avkastning</p>
                        </div>
                      </div>
                      
                      <Link
                        to="/valuation"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-center block"
                      >
                        Få professionell värdering
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Urgency & Scarcity Section */}
        <section className="py-20 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold text-sm mb-6">
                <Timer className="w-4 h-4" />
                BEGRÄNSAD TID
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                🔥 Heta affärsmöjligheter - Agera nu!
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Dessa premium-företag får flera bud varje dag. Missa inte din chans!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Hot Deal 1 */}
              <div className="bg-white rounded-2xl shadow-xl p-6 relative border-2 border-red-200">
                <div className="absolute -top-3 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  🔥 HOT DEAL
                </div>
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">AI-driven MarTech SaaS</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Skalbar plattform, 400k ARR, 89% retention rate
                  </p>
                  <div className="text-2xl font-bold text-green-600 mb-2">2.8M SEK</div>
                  <div className="flex items-center gap-2 text-sm text-red-600 font-semibold">
                    <Timer className="w-4 h-4" />
                    12 bud senaste 48h
                  </div>
                </div>
                <Link
                  to="/listings/3"
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-colors text-center block"
                >
                  Lägg bud nu
                </Link>
              </div>

              {/* Hot Deal 2 */}
              <div className="bg-white rounded-2xl shadow-xl p-6 relative border-2 border-orange-200">
                <div className="absolute -top-3 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  ⚡ TRENDING
                </div>
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Premium Fashion E-commerce</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Etablerat varumärke, 1.2M omsättning/år
                  </p>
                  <div className="text-2xl font-bold text-green-600 mb-2">950k SEK</div>
                  <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
                    <Users className="w-4 h-4" />
                    45 intresseanmälningar
                  </div>
                </div>
                <Link
                  to="/listings/2"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors text-center block"
                >
                  Visa intresse
                </Link>
              </div>

              {/* Hot Deal 3 */}
              <div className="bg-white rounded-2xl shadow-xl p-6 relative border-2 border-yellow-200">
                <div className="absolute -top-3 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  💎 PREMIUM
                </div>
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Stockholm Café Empire</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Prime location, 85% marginaler, kultföljarskap
                  </p>
                  <div className="text-2xl font-bold text-green-600 mb-2">1.2M SEK</div>
                  <div className="flex items-center gap-2 text-sm text-yellow-600 font-semibold">
                    <MapPin className="w-4 h-4" />
                    Exklusivt centrum-läge
                  </div>
                </div>
                <Link
                  to="/listings/4"
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors text-center block"
                >
                  Boka visning
                </Link>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-600 mb-6 font-semibold">
                ⏰ Nya premium-affärer läggs upp varje dag. Registrera dig för att få första tillgång!
              </p>
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Timer className="w-5 h-5 mr-3" />
                Registrera dig gratis nu
                <ArrowRight className="ml-3 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Redo att börja din affärsresa?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Oavsett om du vill köpa eller sälja - vi hjälper dig att nå dina mål.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create-listing"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-200 shadow-lg"
              >
                Sälj ditt företag
              </Link>
              <Link
                to="/listings"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Köp ett företag
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Chat System - Tillgängligt för alla användare */}
      <ChatSystem 
        currentUserId="guest_user"
        currentUserName="Guest User"
        currentUserType="user"
      />
    </>
  );
};

export default HomePage;