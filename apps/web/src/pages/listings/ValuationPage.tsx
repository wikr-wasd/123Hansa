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
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { validateEmail } from '../../utils/emailValidation';

const ValuationPage: React.FC = () => {
  const [step, setStep] = useState(1);
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
                Få en professionell värdering av ditt företag på bara några minuter. 
                Vår AI-baserade verktyg ger dig en första uppskattning, följt av detaljerad analys från våra experter.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {step < 4 && (
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

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={requestDetailedValuation}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Begär detaljerad värdering
                  </button>
                  <button
                    onClick={() => { setStep(1); setValuationResult(null); }}
                    className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Ny värdering
                  </button>
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