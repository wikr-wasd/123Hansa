import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminLoginProps {
  onLogin: (userType: 'admin' | 'customer', userId?: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock customer data for demonstration
  const mockCustomers = [
    { id: '1', username: 'anna.karlsson', password: 'customer123', name: 'Anna Karlsson' },
    { id: '2', username: 'erik.johansson', password: 'customer456', name: 'Erik Johansson' },
    { id: '3', username: 'maria.svensson', password: 'customer789', name: 'Maria Svensson' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check admin credentials
    if (username === 'Willi' && password === 'Rickilito00') {
      toast.success('Välkommen tillbaka, Willi!');
      onLogin('admin');
      setIsLoading(false);
      return;
    }

    // Check customer credentials
    const customer = mockCustomers.find(c => 
      c.username === username && c.password === password
    );

    if (customer) {
      toast.success(`Välkommen ${customer.name}!`);
      onLogin('customer', customer.id);
      setIsLoading(false);
      return;
    }

    // Invalid credentials
    toast.error('Felaktigt användarnamn eller lösenord');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Tubba Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Logga in för att komma åt din admin-panel
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Användarnamn
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                  placeholder="Användarnamn"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Lösenord
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                  placeholder="Lösenord"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loggar in...
                </div>
              ) : (
                'Logga in'
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Admin:</strong> Användarnamn: Willi, Lösenord: Rickilito00</p>
              <p><strong>Test-kund:</strong> anna.karlsson / customer123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;