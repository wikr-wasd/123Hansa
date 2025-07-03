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
  Clock
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

  return (
    <>
      <Helmet>
        <title>{campaign.title} - Tubba Crowdfunding</title>
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
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-6 h-6" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
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
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {campaign.location}
                      </div>
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
                  <button className="pb-3 border-b-2 border-emerald-500 text-emerald-600 font-medium">
                    Uppdateringar (3)
                  </button>
                  <button className="pb-3 text-gray-500 hover:text-gray-700">
                    Kommentarer (12)
                  </button>
                  <button className="pb-3 text-gray-500 hover:text-gray-700">
                    FAQ (5)
                  </button>
                </div>

                {/* Sample Update */}
                <div className="space-y-6">
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Fantastisk progress - 50% finansierat!</h4>
                      <span className="text-sm text-gray-500">För 3 dagar sedan</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Vi är helt överväldigade av responsen! Tack till alla som redan stött oss. 
                      Vi har precis passerat 50% av vårt mål och ser fram emot att dela mer spännande nyheter snart.
                    </p>
                  </div>
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
      </div>
    </>
  );
};

export default CampaignDetailPage;