import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';
import { 
  Building2, 
  DollarSign, 
  FileText, 
  Users, 
  MapPin, 
  Calendar,
  TrendingUp,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  CheckCircle,
  Plus,
  Eye,
  Clock,
  Star,
  Shield,
  Zap,
  HeartHeart,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

const CreateListingPreview: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Redirect authenticated users to actual create listing page
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/create-listing-form');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const processSteps = [
    {
      step: 1,
      title: 'Grundläggande information',
      description: 'Företagsnamn, kategori, pris och beskrivning',
      icon: Building2,
      fields: ['Företagsnamn', 'Kategori & Underkategori', 'Utropspris', 'Kort beskrivning'],
      time: '2-3 min'
    },
    {
      step: 2,
      title: 'Företagsdetaljer',
      description: 'Detaljerad information om verksamheten',
      icon: TrendingUp,
      fields: ['Antal anställda', 'Grundat år', 'Omsättning & vinst', 'Företagets styrkor'],
      time: '3-4 min'
    },
    {
      step: 3,
      title: 'Lokalisering & Kontakt',
      description: 'Plats och hur intresserade ska nå dig',
      icon: MapPin,
      fields: ['Adress med Google Maps', 'Kontaktuppgifter', 'Kommunikationsmetod'],
      time: '2-3 min'
    },
    {
      step: 4,
      title: 'Granska & Publicera',
      description: 'Kontrollera allt innan publicering',
      icon: CheckCircle,
      fields: ['Godkänn villkor', 'Heart-säkring', 'Slutkontroll'],
      time: '1 min'
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Snabb & Enkel',
      description: 'Komplett annons på under 10 minuter'
    },
    {
      icon: Shield,
      title: 'Säker Process', 
      description: 'Säkrad process för alla avtal'
    },
    {
      icon: HeartHeart,
      title: 'Professionell Support',
      description: '3% mäklararvode inkluderar experthjälp'
    },
    {
      icon: Star,
      title: 'Hög Exponering',
      description: 'Syns för tusentals potentiella köpare'
    }
  ];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (authMode === 'login') {
        // Handle login
        toast.success('Inloggning lyckades! Omdirigerar...');
        setTimeout(() => navigate('/create-listing-form'), 1500);
      } else {
        // Handle registration
        toast.success('Registrering lyckades! Omdirigerar...');
        setTimeout(() => navigate('/create-listing-form'), 1500);
      }
    } catch (error) {
      toast.error('Ett fel uppstod. Försök igen.');
    }
  };

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {authMode === 'login' ? 'Logga in' : 'Skapa konto'}
          </h2>
          <button 
            onClick={() => setShowAuthModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authMode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Förnamn"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Efternamn"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <input
                type="tel"
                placeholder="Telefonnummer"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}
          
          <input
            type="email"
            placeholder="E-postadress"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <input
            type="password"
            placeholder="Lösenord"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            {authMode === 'login' ? 'Logga in & Fortsätt' : 'Skapa konto & Fortsätt'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {authMode === 'login' ? 'Har du inget konto?' : 'Har du redan ett konto?'}
          </p>
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            {authMode === 'login' ? 'Registrera dig här' : 'Logga in här'}
          </button>
        </div>

        {/* Social Login Options */}
        <div className="mt-6">
          <div className="text-center text-gray-500 text-sm mb-4">eller</div>
          <SocialAuthButtons 
            mode={authMode}
            onSuccess={(user) => {
              // Handle successful social auth
              console.log('Social auth success:', user);
              setShowAuthModal(false);
              navigate('/create-listing-form');
            }}
            onError={(error) => {
              console.error('Social auth error:', error);
            }}
          />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Kontrollerar inloggning...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sälj ditt företag - Så enkelt är det - Tubba</title>
        <meta name="description" content="Se hur enkelt det är att sälja ditt företag med Tubbas 4-stegs process. Logga in och kom igång på bara några minuter." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                <span className="block">Sälj ditt företag på</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  bara 10 minuter
                </span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl text-gray-600 mb-8">
                Se hur enkelt vår 4-stegs process gör det att skapa en professionell annons 
                för ditt företag. Logga in och kom igång direkt!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Logga in & Börja
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Skapa konto
                </button>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Redan medlem? <button 
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Logga in här
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Process Steps */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Så här enkelt säljer du ditt företag
            </h2>
            <p className="text-xl text-gray-600">
              Följ vår guidande 4-stegs process - inget krångel!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {processSteps.map((step, index) => (
              <div key={step.step} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mr-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Steg {step.step}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {step.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{field}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Uppskattad tid: {step.time}
                    </div>
                    {step.step < 4 && (
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-center text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Redo att komma igång?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Logga in eller skapa ett konto för att börja skapa din annons nu!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Logga in
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Skapa konto gratis
              </button>
            </div>

            <p className="mt-6 text-blue-100 text-sm">
              🔒 Säker registrering • ⚡ Kom igång på 2 minuter • 💼 Professionell support
            </p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal />}
    </>
  );
};

export default CreateListingPreview;