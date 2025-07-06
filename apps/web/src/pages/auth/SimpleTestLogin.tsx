import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Key, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

const SimpleTestLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const testAccounts = [
    {
      id: 'customer1',
      name: 'Anna Karlsson',
      email: 'anna.karlsson@gmail.com',
      role: 'Kund',
      description: 'Testa köpupplevelse och marknadsplats'
    },
    {
      id: 'seller1', 
      name: 'Erik Lundberg',
      email: 'erik.lundberg@outlook.com',
      role: 'Säljare',
      description: 'Testa säljupplevelse och skapa annonser'
    },
    {
      id: 'business1',
      name: 'Maria Svensson',
      email: 'maria@techstartup.se',
      role: 'Företagare',
      description: 'Testa företagsannonser och crowdfunding'
    }
  ];

  const handleLogin = async (account: typeof testAccounts[0]) => {
    setLoading(true);
    
    try {
      // Skapa mock användarsession med rätt format för auth store
      const mockUser = {
        id: account.id,
        firstName: account.name.split(' ')[0],
        lastName: account.name.split(' ')[1],
        email: account.email,
        role: 'USER' as const,
        country: 'SE' as const,
        language: 'sv' as const,
        verificationLevel: 'EMAIL' as const,
        isEmailVerified: true,
        createdAt: new Date().toISOString()
      };

      // Använd rätt token-namn som auth service förväntar sig
      const mockToken = `mock_token_${account.id}_${Date.now()}`;
      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('refreshToken', `refresh_${mockToken}`);
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Uppdatera auth store direkt
      setUser(mockUser);

      toast.success(`Välkommen, ${mockUser.firstName}!`);
      
      // Navigera direkt till dashboard
      navigate('/dashboard');
      
    } catch (error) {
      toast.error('Något gick fel');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Test Login - 123Hansa</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Test 123Hansa
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Välj ett testkonto för att uppleva plattformen
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 text-center">Tillgängliga testkonton</h3>
            
            <div className="space-y-3">
              {testAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleLogin(account)}
                  disabled={loading}
                  className="w-full p-6 border-2 border-gray-300 rounded-xl text-left transition-all hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {account.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">{account.name}</div>
                        <div className="text-sm text-blue-600 font-medium">{account.role}</div>
                        <div className="text-sm text-gray-600 mt-1">{account.email}</div>
                        <div className="text-xs text-gray-500 mt-2">{account.description}</div>
                      </div>
                    </div>
                    <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Ingen registrering behövs!</p>
                <p className="mt-1">Dessa testkonton fungerar direkt utan API-anrop. Perfekt för att testa alla funktioner.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Vad du kan testa:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Bläddra i förbättrade marknadsplatsannonser</li>
                <li>Skapa egna testannonser (4-stegs process)</li>
                <li>Testa språkväxlaren (Svenska/Engelska)</li>
                <li>Uppleva crowdfunding-sektionen</li>
                <li>Kontaktsidan med uppdaterad info</li>
                <li>Dashboard och profilfunktioner</li>
              </ul>
            </div>
          </div>

          <div className="text-center space-y-2">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Tillbaka till startsidan
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleTestLogin;