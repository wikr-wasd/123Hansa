import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle,
  Calendar,
  DollarSign,
  Building2,
  MapPin,
  Users,
  Award,
  ArrowUpRight,
  Clock,
  Star,
  Target,
  HandHeart,
  Trophy,
  Search
} from 'lucide-react';
import CategoryIcons from '../../components/search/CategoryIcons';

// Types
interface SoldListing {
  id: string;
  title: string;
  originalPrice: number;
  soldPrice: number;
  soldDate: string;
  category: string;
  industry: string;
  employees?: number;
  location: string;
  description: string;
}

interface DemoStats {
  totalSales: number;
  totalValue: number;
  averageDays: number;
  successRate: number;
}

const SalesDemo: React.FC = () => {
  const [soldListings, setSoldListings] = useState<SoldListing[]>([]);
  const [stats, setStats] = useState<DemoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  // Fetch sold listings
  useEffect(() => {
    const fetchSoldListings = async () => {
      try {
        const response = await fetch('/api/listings/sold');
        const data = await response.json();
        
        if (data.success) {
          setSoldListings(data.data.soldListings);
          
          // Calculate demo stats
          const totalValue = data.data.soldListings.reduce((sum: number, item: SoldListing) => sum + item.soldPrice, 0);
          setStats({
            totalSales: data.data.soldListings.length,
            totalValue,
            averageDays: 32, // Mock average days
            successRate: 96.8 // Mock success rate
          });
        }
      } catch (error) {
        console.error('Error fetching sold listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldListings();
  }, []);

  // Format price
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M SEK`;
    }
    return `${(price / 1000).toFixed(0)}k SEK`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate price difference
  const getPriceDifference = (original: number, sold: number) => {
    const diff = ((sold - original) / original) * 100;
    return {
      percentage: Math.abs(diff),
      isIncrease: diff > 0,
      isDecrease: diff < 0
    };
  };

  // Demo success stories with detailed information
  const successStories = [
    {
      title: "TechStartup AB - Rekordsnabb försäljning",
      description: "AI-driven fintech-företag som såldes för full utpris inom 18 dagar tack vare stark teknologi och internationell potential.",
      price: "12.5M SEK",
      timeline: "18 dagar",
      buyerType: "Strategisk köpare (tyskt tech-konglomerat)",
      keyFactors: ["AI-teknologi", "200+ företagskunder", "Internationell skalbarhet", "Stark tillväxt"]
    },
    {
      title: "Sustainable Solutions - Premium för miljöexpertis",
      description: "Miljökonsultföretag som såldes för 112% av utpris på grund av hög efterfrågan inom ESG-sektorn.",
      price: "5.8M SEK",
      timeline: "25 dagar",
      buyerType: "Branschkonkurrent (nordisk expansion)",
      keyFactors: ["ESG-specialisering", "Stora kunder (Volvo, IKEA)", "Stabila intäkter", "15 års erfarenhet"]
    },
    {
      title: "Nordic E-handel - Strategisk exit",
      description: "E-handelsplattform som lockade flera bud och såldes till en strategisk partner för att accelerera tillväxt.",
      price: "8.2M SEK",
      timeline: "31 dagar",
      buyerType: "E-handelsgrupp (portföljutvidgning)",
      keyFactors: ["Etablerad kundkrets", "Stark tillväxtkurva", "Nordisk marknad", "Teknisk plattform"]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Laddar framgångsrika affärer...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Framgångsrika Affärer - Demo - Tubba</title>
        <meta name="description" content="Se exempel på framgångsrika företagsförsäljningar genom Tubba med detaljerade case studies och resultat." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
                <Trophy className="w-4 h-4 mr-2" />
                Demo: Framgångsrika Affärer
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                <span className="block">Verkliga resultat från</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  genomförda affärer
                </span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl text-gray-600 mb-8">
                Upptäck hur Tubba hjälper företagare att sälja sina företag framgångsrikt. 
                Här är riktiga exempel på affärer som genomförts med professionell support.
              </p>

              {/* Search Bar */}
              <div className="max-w-3xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    placeholder="Sök efter sålda företag, kategorier eller bransch..."
                    className="w-full pl-16 pr-6 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-lg"
                  />
                </div>
              </div>

              {/* Category Icons */}
              <CategoryIcons className="mb-8" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {stats.totalSales}
                  </div>
                  <div className="text-gray-600 font-medium">Genomförda affärer</div>
                  <div className="text-sm text-gray-500 mt-1">Senaste månaden</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {formatPrice(stats.totalValue)}
                  </div>
                  <div className="text-gray-600 font-medium">Total affärsvolym</div>
                  <div className="text-sm text-gray-500 mt-1">Senaste månaden</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {stats.averageDays}
                  </div>
                  <div className="text-gray-600 font-medium">Genomsnittlig tid</div>
                  <div className="text-sm text-gray-500 mt-1">Dagar till affär</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {stats.successRate}%
                  </div>
                  <div className="text-gray-600 font-medium">Framgångsgrad</div>
                  <div className="text-sm text-gray-500 mt-1">Av listade företag</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Stories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Detaljerade framgångsstories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Här är tre utvalda exempel på hur våra kunder har genomfört framgångsrika affärer
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      FRAMGÅNG
                    </span>
                    <span className="text-2xl font-bold text-green-600">{story.price}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{story.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{story.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Tid till affär:</div>
                      <div className="flex items-center text-blue-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {story.timeline}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Köpare:</div>
                      <div className="flex items-center text-purple-600">
                        <HandHeart className="w-4 h-4 mr-2" />
                        {story.buyerType}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Framgångsfaktorer:</div>
                      <div className="space-y-1">
                        {story.keyFactors.map((factor, idx) => (
                          <div key={idx} className="flex items-center text-gray-600 text-sm">
                            <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Sales List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Senaste genomförda affärer</h2>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">Senaste 30 dagarna</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {soldListings.map((listing) => {
                  const priceDiff = getPriceDifference(listing.originalPrice, listing.soldPrice);
                  
                  return (
                    <div key={listing.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Building2 className="w-5 h-5 text-gray-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                            <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              SÅLD
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{listing.description}</p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {listing.location}
                            </div>
                            <div className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              {listing.industry}
                            </div>
                            {listing.employees && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {listing.employees} anställda
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(listing.soldDate)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatPrice(listing.soldPrice)}
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-2">
                            Utgångspris: {formatPrice(listing.originalPrice)}
                          </div>
                          
                          {priceDiff.percentage > 0 && (
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              priceDiff.isIncrease 
                                ? 'bg-green-100 text-green-800' 
                                : priceDiff.isDecrease 
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {priceDiff.isIncrease && <ArrowUpRight className="w-3 h-3 mr-1" />}
                              {priceDiff.isIncrease ? '+' : priceDiff.isDecrease ? '-' : ''}
                              {priceDiff.percentage.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Redo att sälja ditt företag?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Gå med i våra framgångsrika säljare och få professionell support genom hela processen.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link
                to="/create-listing"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Skapa annons
              </Link>
              <Link
                to="/professional-services"
                className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Kontakta expert
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesDemo;