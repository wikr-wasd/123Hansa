import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../../stores/authStore';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Rocket, 
  ArrowRight, 
  CheckCircle,
  DollarSign,
  Calendar,
  Heart,
  Shield
} from 'lucide-react';
import CampaignCard from '../../components/crowdfunding/CampaignCard';
import { 
  demoCampaigns, 
  campaignCategories, 
  getFeaturedCampaigns, 
  getTrendingCampaigns 
} from '../../data/crowdfundingData';
import { useTranslation } from '../../hooks/useTranslation';

const CrowdfundingHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { t, isEnglish } = useTranslation();
  const featuredCampaigns = getFeaturedCampaigns();
  const trendingCampaigns = getTrendingCampaigns().slice(0, 3);
  const [buttonClickedMessage, setButtonClickedMessage] = React.useState<string>('');
  
  // Platform stats
  const totalFunded = demoCampaigns.reduce((sum, campaign) => sum + campaign.currentAmount, 0);
  const totalCampaigns = demoCampaigns.length;
  const totalBackers = demoCampaigns.reduce((sum, campaign) => sum + campaign.backers, 0);
  const successfulCampaigns = demoCampaigns.filter(c => c.currentAmount >= c.fundingGoal).length;

  const handleCreateCampaign = () => {
    console.log('Create campaign button clicked!');
    setButtonClickedMessage('Starta din kampanj clicked! Navigating...');
    setTimeout(() => setButtonClickedMessage(''), 3000);
    try {
      if (isAuthenticated) {
        console.log('User is authenticated, navigating to /crowdfunding/create');
        navigate('/crowdfunding/create');
      } else {
        console.log('User not authenticated, redirecting to login');
        // Redirect to login with return path
        navigate('/login?returnTo=/crowdfunding/create');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to direct link
      window.location.href = isAuthenticated ? '/crowdfunding/create' : '/login';
    }
  };

  return (
    <>
      <Helmet>
        <title>123hansa.se Crowdfunding - Finansiera din affärsidé</title>
        <meta name="description" content="Nordens första företagsfokuserade crowdfunding-plattform. Få community-stöd för ditt företag eller investera i framtidens affärsidéer." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Button Click Feedback */}
        {buttonClickedMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {buttonClickedMessage}
          </div>
        )}
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600">
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                123hansa.se Crowdfunding
              </h1>
              <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto">
                Nordens första företagsfokuserade crowdfunding-plattform
              </p>
              <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto">
                Finansiera din affärsidé med community-stöd eller investera i framtidens mest lovande företag
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <button
                  onClick={handleCreateCampaign}
                  className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Starta din kampanj
                </button>
                <button
                  onClick={() => {
                    console.log('Discover projects button clicked!');
                    setButtonClickedMessage('Upptäck projekt clicked! Navigating...');
                    setTimeout(() => setButtonClickedMessage(''), 3000);
                    try {
                      console.log('Navigating to /crowdfunding/discover');
                      navigate('/crowdfunding/discover');
                    } catch (error) {
                      console.error('Navigation error:', error);
                      window.location.href = '/crowdfunding/discover';
                    }
                  }}
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-emerald-600 transition-all duration-200"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Upptäck projekt
                </button>
              </div>
            </div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute top-32 right-16 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full"></div>
            <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white rounded-full"></div>
          </div>
        </section>

        {/* Platform Stats */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
                  {new Intl.NumberFormat('sv-SE', { 
                    style: 'currency', 
                    currency: 'SEK',
                    notation: 'compact',
                    maximumFractionDigits: 1 
                  }).format(totalFunded)}
                </div>
                <p className="text-gray-600 font-medium">Totalt finansierat</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {totalCampaigns}
                </div>
                <p className="text-gray-600 font-medium">Aktiva kampanjer</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                  {totalBackers.toLocaleString('sv-SE')}
                </div>
                <p className="text-gray-600 font-medium">Stöttande investerare</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  {successfulCampaigns}
                </div>
                <p className="text-gray-600 font-medium">Framgångsrika projekt</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Campaigns */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Utvalda Kampanjer
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Handplockade projekt med extra potential från vårt expertteam
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>

        {/* Category Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Upptäck efter Kategori
              </h2>
              <p className="text-xl text-gray-600">
                Hitta projekt inom ditt intresseområde
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaignCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/crowdfunding/discover?category=${category.id}`}
                  className="group bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-600">
                      {category.count} aktiva projekt
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Campaigns */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trending Just Nu
              </h2>
              <p className="text-xl text-gray-600">
                De mest populära kampanjerna denna vecka
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trendingCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/crowdfunding/discover"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Se alla kampanjer
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing and Services */}
        <section className="py-16 bg-gradient-to-br from-emerald-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Transparent Prissättning
              </h2>
              <p className="text-xl text-gray-600">
                Tydliga avgifter och omfattande marknadsföringstjänster
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Plattformsavgift */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-emerald-100">
                <div className="text-center mb-6">
                  <DollarSign className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Plattformsavgift</h3>
                  <div className="text-3xl font-bold text-emerald-600 mb-1">8%</div>
                  <div className="text-lg text-gray-600">+ 4kr per transaktion</div>
                </div>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    Endast vid lyckad kampanj
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    Täcker plattformens drift
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    Kundservice och support
                  </li>
                </ul>
              </div>

              {/* Escrow */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
                <div className="text-center mb-6">
                  <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Escrow-tjänst</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-1">10% / 5%</div>
                  <div className="text-sm text-gray-600">Under/över 1M SEK</div>
                </div>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    Säker förvaring av medel
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    Skyddar alla parter
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                    Professionell hantering
                  </li>
                </ul>
              </div>

              {/* Marknadsföring */}
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl shadow-lg p-8 border border-emerald-200">
                <div className="text-center mb-6">
                  <Rocket className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Omfattande Marknadsföring</h3>
                  <div className="text-2xl font-bold text-emerald-600 mb-1">Ingår</div>
                  <div className="text-sm text-gray-600">Professionellt team arbetar för dig!</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="font-medium">Direktreklam:</span> Google, Facebook, Instagram
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="font-medium">Professionella nätverk:</span> LinkedIn targeting
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="font-medium">E-postmarknadsföring:</span> Segmenterade kampanjer
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="font-medium">Medieplaceringar:</span> Aftonbladet, Blocket
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="font-medium">Schibsted-koncernen:</span> Hela nätverket
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="font-medium">Dedikerat team:</span> Hittar rätt målgrupp
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Exempel: Kampanj på 500 000 kr</h4>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Finansieringsmål:</span>
                    <span className="font-medium">500 000 kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plattformsavgift (8%):</span>
                    <span className="font-medium">40 000 kr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Escrow-avgift (10%):</span>
                    <span className="font-medium">50 000 kr</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-3 flex justify-between font-bold text-lg">
                    <span>Du får:</span>
                    <span className="text-emerald-600">410 000 kr</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 bg-emerald-50 p-3 rounded-lg">
                  + Omfattande marknadsföring via Google, LinkedIn, Meta och vårt partnerskap - allt ingår!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Marketing Services */}
        <section className="py-20 bg-gradient-to-br from-blue-900 via-emerald-800 to-teal-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Vad Ingår i Vårt Marknadsföringspaket?
              </h2>
              <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
                Ett dedikerat team arbetar för att din kampanj når rätt målgrupp genom flera kanaler
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Direktreklam */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 border border-emerald-300 border-opacity-30">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold">Direktreklam & Betalda Annonser</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-300 mb-2">Google Ads</h4>
                    <ul className="text-sm space-y-1 text-emerald-100">
                      <li>• Sökannonsering</li>
                      <li>• Display-nätverk</li>
                      <li>• Shopping-annonser</li>
                      <li>• Remarketing</li>
                    </ul>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-300 mb-2">Meta Platforms</h4>
                    <ul className="text-sm space-y-1 text-emerald-100">
                      <li>• Facebook Ads</li>
                      <li>• Instagram Ads</li>
                      <li>• Målgruppssegmentering</li>
                      <li>• Video-kampanjer</li>
                    </ul>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-300 mb-2">LinkedIn Business</h4>
                    <ul className="text-sm space-y-1 text-emerald-100">
                      <li>• Professionell targeting</li>
                      <li>• Sponsored Content</li>
                      <li>• InMail-kampanjer</li>
                      <li>• Lead-generering</li>
                    </ul>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-300 mb-2">YouTube & Video</h4>
                    <ul className="text-sm space-y-1 text-emerald-100">
                      <li>• Video-annonser</li>
                      <li>• Bumper ads</li>
                      <li>• Skippable ads</li>
                      <li>• Discovery ads</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Media & Press */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 border border-blue-300 border-opacity-30">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📰</span>
                  </div>
                  <h3 className="text-2xl font-bold">Media & Pressplaceringar</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">Schibsted-koncernen</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-100">
                      <div>• Aftonbladet</div>
                      <div>• Blocket</div>
                      <div>• Svenska Dagbladet</div>
                      <div>• Omni</div>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">Lokala & Branschmedier</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-100">
                      <div>• Lokala tidningar</div>
                      <div>• Branschpublikationer</div>
                      <div>• Nischade magasin</div>
                      <div>• Online-portaler</div>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">PR & Pressutskick</h4>
                    <div className="text-sm text-blue-100 space-y-1">
                      <div>• Professionella pressmeddelanden</div>
                      <div>• Mediakit och pressmaterial</div>
                      <div>• Journalist-kontakter</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Digital Marketing */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 border border-teal-300 border-opacity-30">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-teal-400 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📧</span>
                  </div>
                  <h3 className="text-2xl font-bold">Digital Marknadsföring</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-teal-300 mb-2">E-postmarknadsföring</h4>
                    <ul className="text-sm space-y-1 text-teal-100">
                      <li>• Segmenterade kampanjer till 50,000+ prenumeranter</li>
                      <li>• Personaliserade nyhetsbrev</li>
                      <li>• Automatiserade drip-kampanjer</li>
                      <li>• A/B-testning av innehåll</li>
                    </ul>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-teal-300 mb-2">Mobile & Push</h4>
                    <ul className="text-sm space-y-1 text-teal-100">
                      <li>• Push-notiser till app-användare</li>
                      <li>• SMS-kampanjer (vid behov)</li>
                      <li>• In-app meddelanden</li>
                      <li>• Mobile-optimerade kampanjer</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Team & Strategy */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 border border-purple-300 border-opacity-30">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-2xl font-bold">Dedikerat Marknadsföringsteam</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-300 mb-2">Strategisk Planering</h4>
                    <ul className="text-sm space-y-1 text-purple-100">
                      <li>• Djupgående målgruppsanalys</li>
                      <li>• Konkurrentanalys</li>
                      <li>• Kanaloptimering</li>
                      <li>• Budgetallokering</li>
                    </ul>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-300 mb-2">Löpande Optimering</h4>
                    <ul className="text-sm space-y-1 text-purple-100">
                      <li>• Daglig kampanjövervakning</li>
                      <li>• Veckovisa rapporter</li>
                      <li>• ROI-optimering</li>
                      <li>• Creative testing</li>
                    </ul>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-300 mb-2">Personlig Service</h4>
                    <ul className="text-sm space-y-1 text-purple-100">
                      <li>• Dedikerad marknadsföringsspecialist</li>
                      <li>• Regelbundna avstämningar</li>
                      <li>• Direktkontakt via telefon/email</li>
                      <li>• Strategiska råd & tips</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 max-w-4xl mx-auto">
                <h3 className="text-3xl font-bold mb-4">Totalt Marknadsföringsvärde</h3>
                <div className="text-6xl font-bold mb-4">50,000+ kr</div>
                <p className="text-xl mb-6">Allt detta ingår utan extra kostnad när du skapar en kampanj!</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="font-semibold mb-1">Annonsbudget</div>
                    <div>15,000-25,000 kr/månad</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="font-semibold mb-1">Team & Strategi</div>
                    <div>20,000-30,000 kr/månad</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="font-semibold mb-1">Mediaplaceringar</div>
                    <div>10,000-15,000 kr/månad</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Så Funkar Det
              </h2>
              <p className="text-xl text-gray-600">
                Enkel process för både entrepreneurs och investerare
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* For Entrepreneurs */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  För Företagare
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: 'Skapa din kampanj',
                      description: 'Berätta om din affärsidé, sätt finansieringsmål och skapa belöningar för dina supporters.',
                      icon: <Rocket className="w-6 h-6" />
                    },
                    {
                      step: 2,
                      title: 'Vi marknadsför tillsammans',
                      description: 'Vi hjälper dig marknadsföra via våra kanaler, Google Ads, LinkedIn, Meta och partners - allt ingår i priset!',
                      icon: <TrendingUp className="w-6 h-6" />
                    },
                    {
                      step: 3,
                      title: 'Nå ditt mål',
                      description: 'När du når ditt finansieringsmål får du pengarna (minus våra avgifter: 8% + 4kr/transaktion + escrow) och kan starta ditt företag.',
                      icon: <Target className="w-6 h-6" />
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.step}. {item.title}
                        </h4>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* For Investors */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  För Investerare
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: 'Upptäck projekt',
                      description: 'Bläddra bland hundratals affärsidéer och hitta de som passar dina intressen.',
                      icon: <Target className="w-6 h-6" />
                    },
                    {
                      step: 2,
                      title: 'Stötta företag',
                      description: 'Välj belöningsnivå och stötta de projekt du tror på med ditt bidrag.',
                      icon: <Heart className="w-6 h-6" />
                    },
                    {
                      step: 3,
                      title: 'Få dina belöningar',
                      description: 'När projektet lyckas får du dina belöningar och ser företaget växa.',
                      icon: <CheckCircle className="w-6 h-6" />
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.step}. {item.title}
                        </h4>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Redo att Starta din Resa?
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Oavsett om du har en affärsidé eller vill investera i framtiden - vi hjälper dig komma igång idag.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={handleCreateCampaign}
                className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Starta din kampanj
              </button>
              <button
                onClick={() => {
                  console.log('Discover projects button (bottom) clicked!');
                  try {
                    console.log('Navigating to /crowdfunding/discover');
                    navigate('/crowdfunding/discover');
                  } catch (error) {
                    console.error('Navigation error:', error);
                    window.location.href = '/crowdfunding/discover';
                  }
                }}
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-emerald-600 transition-all duration-200"
              >
                <Users className="w-5 h-5 mr-2" />
                Bli investerare
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CrowdfundingHomePage;