import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  TrendingUp, 
  MapPin, 
  Share2, 
  Heart,
  CheckCircle,
  Info,
  Gift,
  Star,
  MessageCircle,
  Shield,
  Clock,
  X
} from 'lucide-react';
import ProgressBar from '../../components/crowdfunding/ProgressBar';
import { demoCampaigns } from '../../data/crowdfundingData';

interface Reward {
  id: string;
  title: string;
  description: string;
  amount: number;
  estimatedDelivery: string;
  backers: number;
  limited?: boolean;
  limitCount?: number;
  includes: string[];
}

const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [backingAmount, setBackingAmount] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('swish');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'updates' | 'comments' | 'faq'>('updates');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(Math.floor(Math.random() * 50) + 20);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  
  const campaign = demoCampaigns.find(c => c.id === id);
  
  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kampanj hittades inte</h1>
          <Link to="/crowdfunding" className="text-emerald-600 hover:text-emerald-700">
            ← Tillbaka till crowdfunding
          </Link>
        </div>
      </div>
    );
  }

  // Mock rewards data based on campaign
  const rewards: Reward[] = [
    {
      id: 'early-bird',
      title: 'Early Bird Supporter',
      description: 'Bli en av de första att stötta projektet',
      amount: 500,
      estimatedDelivery: 'Juni 2024',
      backers: 45,
      includes: ['Exklusivt tack-mail', 'Projekt-uppdateringar', 'Digital badge']
    },
    {
      id: 'standard',
      title: 'Standard Supporter',
      description: 'Grundläggande stödnivå med fina belöningar',
      amount: 1000,
      estimatedDelivery: 'Juli 2024',
      backers: 89,
      includes: ['Allt från Early Bird', 'Företags-merchandise', 'Namn i credits']
    },
    {
      id: 'premium',
      title: 'Premium Supporter',
      description: 'Utökad belöningspaket för seriösa supporters',
      amount: 2500,
      estimatedDelivery: 'Augusti 2024',
      backers: 34,
      includes: ['Allt från Standard', 'Exklusiv produkt-preview', 'Video-call med grundaren']
    },
    {
      id: 'business',
      title: 'Business Partner',
      description: 'För företag som vill vara partners',
      amount: 10000,
      estimatedDelivery: 'September 2024',
      backers: 8,
      limited: true,
      limitCount: 20,
      includes: ['Allt från Premium', 'Logo på hemsida', 'Affärspartnerskap-möjligheter', 'Co-marketing möjligheter']
    }
  ];

  const percentage = (campaign.currentAmount / campaign.fundingGoal) * 100;
  const isOverfunded = campaign.currentAmount > campaign.fundingGoal;

  // Handle like functionality
  const handleLike = () => {
    setIsLiked(prev => {
      const newLiked = !prev;
      setLikeCount(prevCount => newLiked ? prevCount + 1 : prevCount - 1);
      return newLiked;
    });
  };

  // Handle share functionality
  const handleShare = (platform?: string) => {
    const url = window.location.href;
    const text = `Kolla in denna crowdfunding-kampanj: ${campaign.title}`;
    
    if (platform === 'whatsapp') {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
      window.open(whatsappUrl, '_blank');
    } else if (platform === 'facebook') {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(facebookUrl, '_blank');
    } else if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
    } else if (platform === 'linkedin') {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(linkedinUrl, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        alert('Länk kopierad till urklipp!');
        setShowShareModal(false);
      });
    }
  };

  // Handle location click - open Google Maps
  const handleLocationClick = () => {
    if (campaign.location) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campaign.location)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <>
      <Helmet>
        <title>{campaign.title} - 123Hansa Crowdfunding</title>
        <meta name="description" content={campaign.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              to="/crowdfunding" 
              className="inline-flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Tillbaka till crowdfunding
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Campaign Image */}
              <div className="relative">
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  className="w-full h-96 object-cover rounded-xl"
                />
                {campaign.featured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                    FEATURED
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-medium text-gray-700">
                  {campaign.category}
                </div>
              </div>

              {/* Campaign Info */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleLike}
                      className={`p-2 transition-colors flex items-center space-x-1 ${
                        isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                      title={isLiked ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}
                    >
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{likeCount}</span>
                    </button>
                    <button 
                      onClick={() => setShowShareModal(true)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Dela kampanj"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="flex items-center mb-6 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                    {campaign.creator.avatar ? (
                      <img 
                        src={campaign.creator.avatar} 
                        alt={campaign.creator.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-emerald-600 font-bold text-lg">
                        {campaign.creator.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{campaign.creator.name}</p>
                    {campaign.location && (
                      <button
                        onClick={handleLocationClick}
                        className="flex items-center text-gray-500 text-sm hover:text-emerald-600 transition-colors cursor-pointer"
                        title="Visa på Google Maps"
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="underline">{campaign.location}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {campaign.description}
                  </p>
                  
                  {/* Extended description for demo */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Om Projektet</h3>
                  <p className="text-gray-700 mb-4">
                    Detta projekt representerar en unik möjlighet att vara med och forma framtiden inom {campaign.category.toLowerCase()}. 
                    Vi har arbetat hårt för att utveckla en solid affärsplan och ser nu fram emot att ta nästa steg tillsammans med vårt community.
                  </p>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Varför Vi Behöver Ditt Stöd</h3>
                  <p className="text-gray-700 mb-4">
                    Finansieringen kommer att användas för att accelerera vår utveckling, bygga upp teamet och nå ut till fler kunder. 
                    Varje krona räknas och hjälper oss att komma närmare vårt mål att revolutionera branschen.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">Vad Händer Härnäst</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium mb-2">Kampanj Timeline</p>
                        <ul className="text-blue-700 text-sm space-y-1">
                          <li>• Kampanj pågår i {campaign.daysLeft} dagar till</li>
                          <li>• Vid framgång: Produktion startar inom 30 dagar</li>
                          <li>• Första leveranser: Beräknat till sommaren 2024</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Updates & Comments Section */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-6 mb-6 border-b border-gray-100">
                  <button 
                    onClick={() => setActiveTab('updates')}
                    className={`pb-3 font-medium transition-colors ${
                      activeTab === 'updates' 
                        ? 'border-b-2 border-emerald-500 text-emerald-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Uppdateringar (3)
                  </button>
                  <button 
                    onClick={() => setActiveTab('comments')}
                    className={`pb-3 font-medium transition-colors ${
                      activeTab === 'comments' 
                        ? 'border-b-2 border-emerald-500 text-emerald-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Kommentarer (12)
                  </button>
                  <button 
                    onClick={() => setActiveTab('faq')}
                    className={`pb-3 font-medium transition-colors ${
                      activeTab === 'faq' 
                        ? 'border-b-2 border-emerald-500 text-emerald-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    FAQ (5)
                  </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === 'updates' && (
                    <div className="space-y-6">
                      <div className="border-l-4 border-emerald-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">Fantastisk progress - 50% finansierat!</h4>
                          <span className="text-sm text-gray-500">För 3 dagar sedan</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          Vi är helt överväldigade av responsen! Tack till alla som redan stött oss. 
                          Vi har precis passerat 50% av vårt mål och ser fram emot att dela mer spännande nyheter snart.
                        </p>
                        <div className="flex items-center text-gray-500 text-xs">
                          <Heart className="w-4 h-4 mr-1" />
                          <span>23 likes</span>
                          <MessageCircle className="w-4 h-4 ml-4 mr-1" />
                          <span>5 kommentarer</span>
                        </div>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">Ny design-preview släppt!</h4>
                          <span className="text-sm text-gray-500">För 1 vecka sedan</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          Vi har arbetat hårt med designteamet och kan nu visa en förhandsvisning av hur produkten kommer att se ut. 
                          Kolla in bilderna i uppdateringen - vi är så stolta över resultatet!
                        </p>
                        <div className="bg-gray-100 rounded-lg p-4 mb-3">
                          <div className="flex items-center text-blue-600 text-sm">
                            <Star className="w-4 h-4 mr-2" />
                            <span className="font-medium">Exklusivt för supporters</span>
                          </div>
                          <p className="text-gray-600 text-xs mt-1">
                            Som supporter får du tidig tillgång till alla designskisser och prototyper!
                          </p>
                        </div>
                        <div className="flex items-center text-gray-500 text-xs">
                          <Heart className="w-4 h-4 mr-1" />
                          <span>67 likes</span>
                          <MessageCircle className="w-4 h-4 ml-4 mr-1" />
                          <span>18 kommentarer</span>
                        </div>
                      </div>

                      <div className="border-l-4 border-purple-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">Kampanj lanserad!</h4>
                          <span className="text-sm text-gray-500">För 2 veckor sedan</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          Äntligen är det dags! Vi lanserar officiellt vår crowdfunding-kampanj idag. 
                          Det här har varit en dröm i månader och nu blir den verklighet tack vare er.
                        </p>
                        <div className="flex items-center text-gray-500 text-xs">
                          <Heart className="w-4 h-4 mr-1" />
                          <span>89 likes</span>
                          <MessageCircle className="w-4 h-4 ml-4 mr-1" />
                          <span>34 kommentarer</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'comments' && (
                    <div className="space-y-6">
                      <div className="text-center py-4">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Kommentarsfunktion</h3>
                        <p className="text-gray-600 mb-4">
                          Här kan supporters diskutera projektet och ställa frågor till kampanjskaparen.
                        </p>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">A</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">Anna Svensson</span>
                              <span className="text-xs text-gray-500">Supporter</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">2 dagar sedan</span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              Fantastiskt projekt! Kan ni berätta mer om när de första produkterna kommer att levereras?
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 ml-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 font-medium text-sm">{campaign?.creator.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">{campaign?.creator.name}</span>
                              <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">Skapare</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">1 dag sedan</span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              Hej Anna! Första leveranserna är planerade till sommaren 2024. Vi håller alla supporters uppdaterade via kampanjuppdateringar!
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-medium text-sm">M</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">Magnus Blomqvist</span>
                              <span className="text-xs text-gray-500">Supporter</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">3 dagar sedan</span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              Har stöttat med 2500 kr - ser verkligen fram emot att få produkten! Vilka betalningsalternativ kommer finnas?
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-3">Skriv en kommentar:</p>
                          <textarea 
                            placeholder="Ställ en fråga eller dela dina tankar..."
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end mt-3">
                            <button className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors">
                              Skicka kommentar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'faq' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900">När kommer produkten att levereras?</h4>
                          </div>
                          <div className="p-4">
                            <p className="text-gray-700 text-sm">
                              Vi planerar att börja leverera de första produkterna i juni-juli 2024. Alla supporters kommer att få uppdateringar om leveransstatus via e-post och kampanjuppdateringar.
                            </p>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900">Vad händer om kampanjen inte når sitt mål?</h4>
                          </div>
                          <div className="p-4">
                            <p className="text-gray-700 text-sm">
                              Om vi inte når vårt finansieringsmål kommer alla supporters att få sina pengar automatiskt återbetalda. 
                              Du behöver inte göra något - återbetalningen sker via samma betalmetod som du använde.
                            </p>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900">Kan jag ändra eller avbryta mitt stöd?</h4>
                          </div>
                          <div className="p-4">
                            <p className="text-gray-700 text-sm">
                              Du kan ändra eller avbryta ditt stöd fram tills kampanjen avslutas. 
                              Kontakta oss via e-post eller använd kontaktformuläret så hjälper vi dig.
                            </p>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900">Vilka betalningsmetoder accepteras?</h4>
                          </div>
                          <div className="p-4">
                            <p className="text-gray-700 text-sm">
                              Vi accepterar Swish, alla större kreditkort (Visa, Mastercard), samt PayPal. 
                              Alla betalningar är säkra och krypterade.
                            </p>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900">Levererar ni internationellt?</h4>
                          </div>
                          <div className="p-4">
                            <p className="text-gray-700 text-sm">
                              Ja! Vi levererar till hela Norden (Sverige, Norge, Danmark, Finland) utan extra kostnad. 
                              För övriga Europa tillkommer en fraktkostnad på 150 kr.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-start">
                            <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900 mb-2">Har du fler frågor?</h4>
                              <p className="text-blue-700 text-sm mb-3">
                                Hittar du inte svaret på din fråga? Kontakta oss direkt så hjälper vi dig inom 24 timmar.
                              </p>
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                Kontakta oss
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <ProgressBar 
                  current={campaign.currentAmount}
                  goal={campaign.fundingGoal}
                  animated={true}
                  className="mb-6"
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div>
                    <div className="flex items-center justify-center text-emerald-600 mb-1">
                      <TrendingUp className="w-4 h-4 mr-1" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{percentage.toFixed(0)}%</div>
                    <div className="text-xs text-gray-500">Finansierat</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center text-blue-600 mb-1">
                      <Users className="w-4 h-4 mr-1" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{campaign.backers}</div>
                    <div className="text-xs text-gray-500">Supporters</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center text-orange-600 mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{campaign.daysLeft}</div>
                    <div className="text-xs text-gray-500">Dagar kvar</div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Shield className="w-4 h-4 mr-2 text-green-600" />
                    Verifierad kampanj
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    Snabb utbetalning vid framgång
                  </div>
                </div>

                {/* Quick Backing Amounts */}
                <div className="mb-6">
                  <p className="font-medium text-gray-900 mb-3">Stötta snabbt:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => {
                          setBackingAmount(amount);
                          setSelectedReward(null); // Clear reward selection when using quick amount
                        }}
                        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                          backingAmount === amount && !selectedReward
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600 font-medium'
                            : 'border-gray-300 hover:border-emerald-500 hover:text-emerald-600'
                        }`}
                      >
                        {amount.toLocaleString('sv-SE')} kr
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eget belopp:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={backingAmount || ''}
                      onChange={(e) => setBackingAmount(Number(e.target.value))}
                      placeholder="Ange belopp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-12"
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">kr</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Välj betalmetod:</p>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-emerald-300 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="swish"
                        checked={selectedPaymentMethod === 'swish'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="ml-3 flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-bold text-xs">S</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Swish</div>
                          <div className="text-xs text-gray-500">Snabbt och säkert</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-emerald-300 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={selectedPaymentMethod === 'card'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="ml-3 flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold text-xs">💳</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Kort</div>
                          <div className="text-xs text-gray-500">Visa, Mastercard</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-emerald-300 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={selectedPaymentMethod === 'paypal'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="ml-3 flex items-center">
                        <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center mr-3">
                          <span className="text-yellow-600 font-bold text-xs">P</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">PayPal</div>
                          <div className="text-xs text-gray-500">Internationellt</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Main CTA */}
                <button 
                  onClick={async () => {
                    if (backingAmount && backingAmount >= 50) {
                      setIsProcessingPayment(true);
                      
                      // Simulate payment processing
                      setTimeout(() => {
                        const paymentMethodNames = {
                          swish: 'Swish',
                          card: 'kort',
                          paypal: 'PayPal'
                        };
                        
                        alert(`✅ Betalning genomförd!\n\nBelopp: ${backingAmount} kr\nBetalmetod: ${paymentMethodNames[selectedPaymentMethod as keyof typeof paymentMethodNames]}\nKampanj: ${campaign?.title}\n\nTack för ditt stöd! Du kommer få en bekräftelse via e-post.`);
                        setIsProcessingPayment(false);
                      }, 2000);
                    }
                  }}
                  className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors mb-4 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={!backingAmount || backingAmount < 50 || isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Bearbetar betalning...
                    </>
                  ) : (
                    `Stötta med ${backingAmount > 0 ? `${backingAmount.toLocaleString('sv-SE')} kr` : '...'}`
                  )}
                </button>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>🔒 Säker betalning med SSL-kryptering</p>
                  <p>💰 Pengar återbetalas om kampanjen inte når sitt mål</p>
                  <p>⚡ Snabb utbetalning vid framgång</p>
                </div>
              </div>

              {/* Rewards Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <Gift className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Belöningar</h3>
                </div>

                <div className="space-y-4">
                  {rewards.map((reward) => (
                    <div 
                      key={reward.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedReward === reward.id 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedReward(reward.id);
                        setBackingAmount(reward.amount);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{reward.title}</h4>
                        <span className="text-lg font-bold text-emerald-600">
                          {reward.amount.toLocaleString('sv-SE')} kr
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                      
                      <div className="text-xs text-gray-500 mb-2">
                        <div className="flex items-center justify-between">
                          <span>Leverans: {reward.estimatedDelivery}</span>
                          <span>{reward.backers} supporters</span>
                        </div>
                        {reward.limited && reward.limitCount && (
                          <div className="text-orange-600 font-medium mt-1">
                            Begränsad: {reward.limitCount - reward.backers} kvar
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-2">
                        <p className="text-xs text-gray-600 font-medium mb-1">Inkluderar:</p>
                        <ul className="text-xs text-gray-500 space-y-0.5">
                          {reward.includes.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-3 h-3 text-emerald-500 mr-1 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {selectedReward === reward.id && (
                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <div className="flex items-center text-emerald-700 text-sm">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span className="font-medium">Vald belöning</span>
                          </div>
                          <p className="text-emerald-600 text-xs mt-1">
                            Klicka "Stötta med {reward.amount.toLocaleString('sv-SE')} kr" för att fortsätta
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Dela kampanj</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Dela denna crowdfunding-kampanj med dina kontakter och hjälp projektet nå sitt mål!
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    handleShare('whatsapp');
                    setShowShareModal(false);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </button>
                
                <button
                  onClick={() => {
                    handleShare('facebook');
                    setShowShareModal(false);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <div className="w-5 h-5 mr-2 bg-white rounded text-blue-600 flex items-center justify-center text-xs font-bold">f</div>
                  Facebook
                </button>
                
                <button
                  onClick={() => {
                    handleShare('twitter');
                    setShowShareModal(false);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  <div className="w-5 h-5 mr-2 bg-white rounded text-sky-500 flex items-center justify-center text-xs font-bold">𝕏</div>
                  Twitter
                </button>
                
                <button
                  onClick={() => {
                    handleShare('linkedin');
                    setShowShareModal(false);
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <div className="w-5 h-5 mr-2 bg-white rounded text-blue-700 flex items-center justify-center text-xs font-bold">in</div>
                  LinkedIn
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
                  />
                  <button
                    onClick={() => handleShare('copy')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Kopiera
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CampaignDetailPage;