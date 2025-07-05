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
              
              <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-slate-600 mb-12 leading-relaxed">
                Köp och sälj företag, digitala tillgångar och affärstjänster med förtroende. 
                Professionell support från start till slutförd affär.
              </p>


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