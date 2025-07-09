import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QuickTestRegister: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Test',
    lastName: 'Customer',
    email: '',
    password: 'TestPass123!',
    acceptTerms: true
  });

  const suggestedEmails = [
    'test.customer@gmail.com',
    'demo.user@outlook.com', 
    'test.buyer@hotmail.com',
    'demo.seller@yahoo.com'
  ];

  const handleQuickRegister = async (suggestedEmail: string) => {
    setLoading(true);
    
    const registrationData = {
      ...formData,
      email: suggestedEmail,
      confirmPassword: formData.password,
      phone: '',
      country: 'SE',
      language: 'sv',
      companyName: ''
    };

    try {
      // Mock successful registration for testing
      localStorage.setItem('auth_token', 'mock_test_token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test_user_' + Date.now(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: suggestedEmail,
        role: 'user'
      }));
      
      toast.success(`Välkommen, ${formData.firstName}! Testkonto skapat.`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Ett fel inträffade vid registrering');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Välj en e-postadress eller ange din egen');
      return;
    }

    await handleQuickRegister(formData.email);
  };

  return (
    <>
      <Helmet>
        <title>Snabbregistrering - Test - 123Hansa</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Snabbregistrering för Test
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Skapa ett testkonto för att prova 123Hansa
            </p>
          </div>

          {/* Quick Email Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Välj e-postadress för test</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {suggestedEmails.map((email, index) => (
                <button
                  key={email}
                  onClick={() => handleQuickRegister(email)}
                  disabled={loading}
                  className="p-4 border-2 border-gray-300 rounded-lg text-left transition-all hover:border-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{email}</div>
                        <div className="text-sm text-gray-500">
                          {index === 0 && 'Rekommenderad för allmän testning'}
                          {index === 1 && 'Outlook-användare'}
                          {index === 2 && 'Test av köpupplevelse'}
                          {index === 3 && 'Test av säljupplevelse'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-4 text-sm text-gray-500">eller ange egen e-post</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          </div>

          {/* Custom Email Form */}
          <form onSubmit={handleCustomRegister} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Förnamn</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Efternamn</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Din e-postadress</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="din@email.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lösenord (förfyllt)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  readOnly
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Förfyllt med säkert testlösenord: TestPass123!
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.email}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Skapa testkonto'
              )}
            </button>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium">Testkonto-funktioner:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Fullständig tillgång till alla funktioner</li>
                <li>Skapa och hantera annonser</li>
                <li>Testa köp- och säljupplevelse</li>
                <li>Temporärt konto (försvinner vid logout)</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/testbed-login')}
              className="text-sm text-green-600 hover:text-green-800 mr-4"
            >
              Använd befintligt testkonto
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Tillbaka till startsidan
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickTestRegister;