import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Calculator,
  TrendingUp,
  Building2,
  DollarSign,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Globe,
  Clock,
  Star,
  Award,
  AlertCircle,
  Zap,
  Target,
  Shield,
  Lock,
  CreditCard,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/emailValidation';
import { useAuthStore } from '../../stores/authStore';
import BusinessValuationTool from '../../components/analytics/BusinessValuationTool';

const ValuationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [evaluationType, setEvaluationType] = useState<'quick' | 'detailed' | 'professional' | null>(null);
  const [step, setStep] = useState(1);

  // Handle URL parameters for direct links
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type === 'detailed' && isAuthenticated) {
      setEvaluationType('detailed');
    } else if (type === 'professional') {
      setEvaluationType('professional');
    }
  }, [isAuthenticated]);
  const [formData, setFormData] = useState({
    companyType: '',
    industry: '',
    revenue: '',
    employees: '',
    founded: '',
    assets: '',
    location: '',
    contact: { name: '', email: '', phone: '' }
  });
  
  const [emailError, setEmailError] = useState('');
  const [quickEvaluationData, setQuickEvaluationData] = useState({
    revenue: '',
    industry: '',
    employees: ''
  });

  const [valuationResult, setValuationResult] = useState<{
    low: number;
    high: number;
    estimate: number;
  } | null>(null);

  const companyTypes = [
    { id: 'ab', name: 'Aktiebolag (AB)', description: 'Traditionellt aktiebolag' },
    { id: 'hb', name: 'Handelsbolag', description: 'Partnership-baserat företag' },
    { id: 'enskild', name: 'Enskild firma', description: 'Enmansföretag' },
    { id: 'digital', name: 'Digital verksamhet', description: 'E-handel, SaaS, app' }
  ];

  const industries = [
    'Teknologi & IT', 'E-handel', 'Konsulting', 'Tillverkning', 'Fastigheter',
    'Restaurang & Mat', 'Hälsa & Vård', 'Utbildning', 'Transport', 'Annat'
  ];

  const calculateQuickValuation = () => {
    const revenue = parseFloat(quickEvaluationData.revenue) || 0;
    const employees = parseInt(quickEvaluationData.employees) || 1;
    
    // Simplified valuation algorithm
    let multiplier = 2.5; // Base multiplier
    
    // Industry adjustments
    if (quickEvaluationData.industry === 'Teknologi & IT') multiplier += 1.5;
    if (quickEvaluationData.industry === 'E-handel') multiplier += 1.0;
    if (quickEvaluationData.industry === 'Konsulting') multiplier += 0.5;
    
    // Size adjustments
    if (employees > 50) multiplier += 0.5;
    if (employees > 100) multiplier += 0.5;
    
    const estimate = revenue * multiplier;
    const variance = estimate * 0.3; // 30% variance
    
    setValuationResult({
      low: Math.max(0, estimate - variance),
      high: estimate + variance,
      estimate: estimate
    });
    
    setStep(4);
  };

  const calculateValuation = () => {
    const revenue = parseFloat(formData.revenue) || 0;
    const employees = parseInt(formData.employees) || 1;
    
    // Simplified valuation algorithm
    let multiplier = 2.5; // Base multiplier
    
    // Industry adjustments
    if (formData.industry === 'Teknologi & IT') multiplier += 1.5;
    if (formData.industry === 'E-handel') multiplier += 1.0;
    if (formData.industry === 'Konsulting') multiplier += 0.5;
    
    // Company type adjustments
    if (formData.companyType === 'digital') multiplier += 1.0;
    
    // Size adjustments
    if (employees > 50) multiplier += 0.5;
    if (employees > 100) multiplier += 0.5;
    
    const estimate = revenue * multiplier;
    const variance = estimate * 0.3; // 30% variance
    
    setValuationResult({
      low: Math.max(0, estimate - variance),
      high: estimate + variance,
      estimate: estimate
    });
    
    setStep(4);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M SEK`;
    }
    return `${(price / 1000).toFixed(0)}k SEK`;
  };

  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ 
      ...prev, 
      contact: { ...prev.contact, email }
    }));
    
    // Validera e-post när användaren skriver
    if (email.length > 0) {
      const validation = validateEmail(email);
      setEmailError(validation.error);
    } else {
      setEmailError('');
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      calculateValuation();
    }
  };

  const requestDetailedValuation = () => {
    toast.success('Begäran skickad! Våra experter återkommer inom 24 timmar.');
  };

  return (
    <>
      <Helmet>
        <title>Företagsvärdering - 123Hansa</title>
        <meta name="description" content="Få en kostnadsfri värdering av ditt företag från 123Hansas experter. Professionell analys på 24 timmar." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <Calculator className="w-4 h-4 mr-2" />
                Kostnadsfri värdering
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Vad är ditt företag värt?
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Välj mellan snabb utvärdering på 2 minuter eller detaljerad analys med vårt avancerade verktyg. 
                Få professionell värdering från våra experter för exakt bedömning.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Evaluation Type Selection */}
          {evaluationType === null && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Välj typ av utvärdering
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tier 1: Free Quick Valuation */}
                <div className="relative">
                  <button
                    onClick={() => setEvaluationType('quick')}
                    className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Zap className="w-8 h-8 text-blue-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">Snabb utvärdering</h3>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        GRATIS
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Få en snabb uppskattning av ditt företags värde på bara 2 minuter.
                    </p>
                    <ul className="text-sm text-gray-500 mb-4 space-y-1">
                      <li>• Grundläggande värderingsintervall</li>
                      <li>• Branschbaserade multiplar</li>
                      <li>• Ingen registrering krävs</li>
                    </ul>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      2 minuter
                    </div>
                  </button>
                </div>
                
                {/* Tier 2: Detailed Analysis (Login Required) */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('Du måste logga in för detaljerad analys');
                        navigate('/login', { state: { returnTo: '/valuation?type=detailed' } });
                        return;
                      }
                      setEvaluationType('detailed');
                    }}
                    className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Target className="w-8 h-8 text-green-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">Detaljerad analys</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!isAuthenticated && <Lock className="w-4 h-4 text-gray-400" />}
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          KONTO KRÄVS
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Omfattande analys med marknadsjämförelser och rekommendationer.
                    </p>
                    <ul className="text-sm text-gray-500 mb-4 space-y-1">
                      <li>• Marknadsjämförelser & benchmarks</li>
                      <li>• Detaljerad metodikanalys</li>
                      <li>• Värderingsfaktorer & rekommendationer</li>
                      <li>• Sparad historik</li>
                    </ul>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      10-15 minuter
                    </div>
                  </button>
                </div>

                {/* Tier 3: Professional Valuation (Paid) */}
                <div className="relative">
                  <button
                    onClick={() => setEvaluationType('professional')}
                    className="w-full p-6 border-2 border-purple-200 bg-purple-50 rounded-xl hover:border-purple-400 hover:bg-purple-100 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Award className="w-8 h-8 text-purple-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">Professionell värdering</h3>
                      </div>
                      <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
                        PREMIUM
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Expertanalys med personlig konsultation och omfattande rapport.
                    </p>
                    <ul className="text-sm text-gray-500 mb-4 space-y-1">
                      <li>• Personlig konsultation</li>
                      <li>• Due diligence-rapport</li>
                      <li>• Värderingsförbättringar</li>
                      <li>• Professionell PDF-rapport</li>
                    </ul>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        2-3 dagar
                      </div>
                      <div className="flex items-center text-purple-600 font-semibold">
                        <CreditCard className="w-4 h-4 mr-1" />
                        2.500 SEK
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Evaluation */}
          {evaluationType === 'quick' && step < 4 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Snabb utvärdering</h2>
                <button
                  onClick={() => setEvaluationType(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Årsomsättning (SEK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quickEvaluationData.revenue}
                    onChange={(e) => setQuickEvaluationData(prev => ({ ...prev, revenue: e.target.value }))}
                    placeholder="t.ex. 2500000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bransch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={quickEvaluationData.industry}
                    onChange={(e) => setQuickEvaluationData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Välj bransch</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antal anställda <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quickEvaluationData.employees}
                    onChange={(e) => setQuickEvaluationData(prev => ({ ...prev, employees: e.target.value }))}
                    placeholder="t.ex. 15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={calculateQuickValuation}
                  disabled={!quickEvaluationData.revenue || !quickEvaluationData.industry || !quickEvaluationData.employees}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Beräkna snabb värdering
                </button>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tips:</strong> För mer detaljerad analys med marknadsjämförelser och rekommendationer, 
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate('/login', { state: { returnTo: '/valuation?type=detailed' } });
                        } else {
                          setEvaluationType('detailed');
                        }
                      }}
                      className="text-blue-600 underline ml-1"
                    >
                      prova vår detaljerade analys
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Evaluation */}
          {evaluationType === 'detailed' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detaljerad utvärdering</h2>
                  <p className="text-sm text-gray-600 mt-1">Välkommen {user?.name}! Din analys sparas automatiskt.</p>
                </div>
                <button
                  onClick={() => setEvaluationType(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <BusinessValuationTool />
            </div>
          )}

          {/* Professional Valuation */}
          {evaluationType === 'professional' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Professionell värdering</h2>
                <button
                  onClick={() => setEvaluationType(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Service Description */}
                <div>
                  <div className="bg-purple-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">
                      Vad ingår i den professionella värderingen?
                    </h3>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-purple-600 flex-shrink-0" />
                        Personlig konsultation med våra M&A-experter (60 min)
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-purple-600 flex-shrink-0" />
                        Omfattande due diligence-analys
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-purple-600 flex-shrink-0" />
                        Detaljerad marknads- och konkurrentanalys
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-purple-600 flex-shrink-0" />
                        Rekommendationer för värderingsförbättringar
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-purple-600 flex-shrink-0" />
                        Professionell värderingsrapport (PDF)
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-purple-600 flex-shrink-0" />
                        Uppföljning och support i 30 dagar
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Våra experter</h4>
                    <p className="text-sm text-gray-600">
                      Vårt team består av certifierade företagsvärderare med över 15 års erfarenhet 
                      från M&A-transaktioner värda över 2 miljarder SEK.
                    </p>
                  </div>
                </div>

                {/* Contact Form & Payment */}
                <div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Beställ professionell värdering
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Företagsnamn <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Ditt Företag AB"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ditt namn <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.name || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Förnamn Efternamn"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-post <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="din@email.se"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefon <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="+46 70 123 45 67"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Årsomsättning (SEK)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="5000000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Önskad tidpunkt för konsultation
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                          <option>Inom 1 vecka</option>
                          <option>Inom 2 veckor</option>
                          <option>Inom 1 månad</option>
                          <option>Flexibel</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-gray-900">Total kostnad:</span>
                        <span className="text-2xl font-bold text-purple-600">2.500 SEK</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">
                        Inkl. moms. Pengarna återbetalas om du inte är nöjd.
                      </p>
                      
                      <button
                        onClick={() => {
                          toast.success('Beställning mottagen! Vi kontaktar dig inom 24 timmar.');
                        }}
                        className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Beställ och betala
                      </button>
                      
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Säker betalning via Stripe
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {evaluationType !== null && evaluationType !== 'detailed' && evaluationType !== 'quick' && step < 4 && (
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Steg {step} av 3</span>
                  <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}% klart</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {/* Step 1: Company Type */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Vilken typ av företag har du?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companyTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setFormData(prev => ({ ...prev, companyType: type.id }))}
                          className={`p-6 border-2 rounded-xl text-left transition-all ${
                            formData.companyType === type.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <h3 className="font-semibold text-gray-900 mb-2">{type.name}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Industry and Size */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Företagsinformation</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bransch</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Välj bransch</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Årsomsättning (SEK)
                        </label>
                        <input
                          type="number"
                          value={formData.revenue}
                          onChange={(e) => setFormData(prev => ({ ...prev, revenue: e.target.value }))}
                          placeholder="t.ex. 2500000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Antal anställda
                        </label>
                        <input
                          type="number"
                          value={formData.employees}
                          onChange={(e) => setFormData(prev => ({ ...prev, employees: e.target.value }))}
                          placeholder="t.ex. 15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grundat år
                        </label>
                        <input
                          type="number"
                          value={formData.founded}
                          onChange={(e) => setFormData(prev => ({ ...prev, founded: e.target.value }))}
                          placeholder="t.ex. 2015"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plats
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="t.ex. Stockholm"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Contact Info */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Kontaktuppgifter</h2>
                    <p className="text-gray-600 mb-6">
                      För att få en detaljerad värdering från våra experter behöver vi dina kontaktuppgifter.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Namn</label>
                        <input
                          type="text"
                          value={formData.contact.name}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contact: { ...prev.contact, name: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-post <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.contact.email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          placeholder="din@email.se"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                            emailError
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                              : formData.contact.email && !emailError
                              ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {emailError && (
                          <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{emailError}</span>
                          </div>
                        )}
                        {formData.contact.email && !emailError && formData.contact.email.includes('@') && (
                          <div className="mt-2 flex items-center space-x-2 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Giltig e-postadress</span>
                          </div>
                        )}
                        <div className="mt-1 text-xs text-gray-500">
                          Vi behöver en giltig e-postadress för att skicka din värderingsrapport
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefon (valfritt)</label>
                      <input
                        type="tel"
                        value={formData.contact.phone}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contact: { ...prev.contact, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Föregående
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={
                      (step === 1 && !formData.companyType) ||
                      (step === 2 && (!formData.industry || !formData.revenue)) ||
                      (step === 3 && (!formData.contact.name || !formData.contact.email || emailError))
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {step === 3 ? 'Beräkna värdering' : 'Nästa'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Results */}
          {step === 4 && valuationResult && (
            <div className="space-y-8">
              {/* Result Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Värdering klar
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Uppskattad värdering av ditt företag
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Minimum</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(valuationResult.low)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                    <p className="text-sm text-blue-600 mb-2">Uppskattat värde</p>
                    <p className="text-3xl font-bold text-blue-900">{formatPrice(valuationResult.estimate)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Maximum</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(valuationResult.high)}</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-8">
                  Detta är en preliminär uppskattning baserad på branschstandarder och din företagsinformation. 
                  För en mer detaljerad analys rekommenderar vi en professionell värdering.
                </p>

                <div className="space-y-4">
                  {evaluationType === 'quick' && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">🚀 Få mer detaljerad analys</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Denna snabbvärdering ger en grundläggande uppskattning. För marknadsjämförelser, 
                        detaljerad metodikanalys och professionella rekommendationer:
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate('/login', { state: { returnTo: '/valuation?type=detailed' } });
                            } else {
                              setEvaluationType('detailed');
                              setStep(1);
                              setValuationResult(null);
                            }
                          }}
                          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          {!isAuthenticated ? 'Logga in för detaljerad analys' : 'Få detaljerad analys'}
                        </button>
                        <button
                          onClick={() => setEvaluationType('professional')}
                          className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Professionell värdering (2.500 SEK)
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {evaluationType !== 'quick' && (
                      <button
                        onClick={() => setEvaluationType('professional')}
                        className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Begär professionell värdering
                      </button>
                    )}
                    <button
                      onClick={() => { 
                        setStep(1); 
                        setValuationResult(null); 
                        setEvaluationType(null);
                        setQuickEvaluationData({ revenue: '', industry: '', employees: '' });
                      }}
                      className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Ny värdering
                    </button>
                  </div>
                </div>
              </div>

              {/* Why Choose Tubba */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Varför välja 123Hansa för din företagsförsäljning?
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Expert support</h4>
                    <p className="text-gray-600 text-sm">Professionella M&A-rådgivare genom hela processen</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Snabb process</h4>
                    <p className="text-gray-600 text-sm">Genomsnittligt 45 dagar till genomförd affär</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Hög framgång</h4>
                    <p className="text-gray-600 text-sm">96.8% framgångsgrad för listade företag</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ValuationPage;