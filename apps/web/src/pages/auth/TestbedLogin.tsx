import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, User, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TestbedLogin: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<'admin' | 'user' | 'custom'>('admin');

  const predefinedAccounts = {
    admin: {
      email: 'admin@123hansa.se',
      password: 'admin123',
      name: 'Admin Account',
      description: 'Full access to admin dashboard'
    },
    user: {
      email: 'anna@example.com',
      password: 'user123',
      name: 'Regular User',
      description: 'Standard user account'
    }
  };

  const handleAccountSelect = (type: 'admin' | 'user') => {
    setSelectedAccount(type);
    setCredentials({
      email: predefinedAccounts[type].email,
      password: predefinedAccounts[type].password
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      toast.error('Ange e-post och lösenord');
      return;
    }

    setLoading(true);

    try {
      // Simulate login for testbed - bypass actual API call
      if (credentials.email === predefinedAccounts.admin.email && credentials.password === predefinedAccounts.admin.password) {
        // Mock admin login
        localStorage.setItem('auth_token', 'mock_admin_token');
        localStorage.setItem('user', JSON.stringify({
          id: 'admin1',
          firstName: 'Admin',
          lastName: 'User',
          email: credentials.email,
          role: 'admin'
        }));
        
        toast.success('Välkommen, Admin!');
        navigate('/admin/dashboard');
      } else if (credentials.email === predefinedAccounts.user.email && credentials.password === predefinedAccounts.user.password) {
        // Mock user login
        localStorage.setItem('auth_token', 'mock_user_token');
        localStorage.setItem('user', JSON.stringify({
          id: 'user1',
          firstName: 'Anna',
          lastName: 'Karlsson',
          email: credentials.email,
          role: 'user'
        }));
        
        toast.success('Välkommen, Anna!');
        navigate('/dashboard');
      } else {
        // Try actual API call for other credentials
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('auth_token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          
          toast.success(`Välkommen, ${data.data.user.firstName}!`);
          
          if (data.data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          toast.error(data.message || 'Inloggning misslyckades');
        }
      }
    } catch (error) {
      toast.error('Ett fel inträffade vid inloggning');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Testbed - 123hansa.se</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              123hansa Testbed
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Test och utvecklingsmiljö
            </p>
          </div>

          {/* Quick Account Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Testkonton</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleAccountSelect('admin')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedAccount === 'admin'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-red-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Admin Konto</div>
                    <div className="text-sm text-gray-500">admin@servicematch.se</div>
                    <div className="text-xs text-gray-400">Tillgång till admin-panel</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleAccountSelect('user')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedAccount === 'user'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <User className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Vanlig Användare</div>
                    <div className="text-sm text-gray-500">anna@example.com</div>
                    <div className="text-xs text-gray-400">Standard användarrättigheter</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-4 text-sm text-gray-500">eller ange manuellt</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-postadress
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(e) => {
                    setCredentials(prev => ({ ...prev, email: e.target.value }));
                    setSelectedAccount('custom');
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="din@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Lösenord
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) => {
                    setCredentials(prev => ({ ...prev, password: e.target.value }));
                    setSelectedAccount('custom');
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ditt lösenord"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Testmiljö</p>
                  <p>Detta är en testmiljö för utveckling och demonstration. Använd testkontona ovan för att prova systemet.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Logga in'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Tillbaka till startsidan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TestbedLogin;