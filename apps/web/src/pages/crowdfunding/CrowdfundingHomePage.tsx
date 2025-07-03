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
  Heart
} from 'lucide-react';
import CampaignCard from '../../components/crowdfunding/CampaignCard';
import { 
  demoCampaigns, 
  campaignCategories, 
  getFeaturedCampaigns, 
  getTrendingCampaigns 
} from '../../data/crowdfundingData';

const CrowdfundingHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
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
                      title: 'Marknadsför ditt projekt',
                      description: 'Dela din kampanj i sociala medier, nå ut till ditt nätverk och bygg en community.',
                      icon: <TrendingUp className="w-6 h-6" />
                    },
                    {
                      step: 3,
                      title: 'Nå ditt mål',
                      description: 'När du når ditt finansieringsmål får du pengarna och kan starta ditt företag.',
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