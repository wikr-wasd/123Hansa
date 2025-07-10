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
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Security settings
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Mock customer data for demonstration
  const mockCustomers = [
    { id: '1', username: 'anna.karlsson', password: 'customer123', name: 'Anna Karlsson' },
    { id: '2', username: 'erik.johansson', password: 'customer456', name: 'Erik Johansson' },
    { id: '3', username: 'maria.svensson', password: 'customer789', name: 'Maria Svensson' }
  ];

  // Load security state from localStorage on component mount
  React.useEffect(() => {
    const savedAttempts = localStorage.getItem('loginAttempts');
    const savedLockout = localStorage.getItem('lockoutEndTime');
    
    if (savedAttempts) {
      setAttemptCount(parseInt(savedAttempts));
    }
    
    if (savedLockout) {
      const lockoutTime = parseInt(savedLockout);
      if (lockoutTime > Date.now()) {
        setLockoutEndTime(lockoutTime);
      } else {
        // Lockout expired, reset
        localStorage.removeItem('lockoutEndTime');
        localStorage.removeItem('loginAttempts');
        setAttemptCount(0);
      }
    }
  }, []);

  // Timer for lockout countdown
  React.useEffect(() => {
    if (lockoutEndTime) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, lockoutEndTime - Date.now());
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          // Lockout expired
          setLockoutEndTime(null);
          setAttemptCount(0);
          localStorage.removeItem('lockoutEndTime');
          localStorage.removeItem('loginAttempts');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockoutEndTime]);

  const handleFailedLogin = () => {
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    localStorage.setItem('loginAttempts', newAttemptCount.toString());

    if (newAttemptCount >= MAX_ATTEMPTS) {
      const lockoutEnd = Date.now() + LOCKOUT_TIME;
      setLockoutEndTime(lockoutEnd);
      localStorage.setItem('lockoutEndTime', lockoutEnd.toString());
      toast.error('För många misslyckade inloggningsförsök. Kontot låst i 30 minuter.');
    } else {
      const remainingAttempts = MAX_ATTEMPTS - newAttemptCount;
      toast.error(`Felaktiga inloggningsuppgifter. ${remainingAttempts} försök kvar.`);
    }
  };

  const resetLoginAttempts = () => {
    setAttemptCount(0);
    setLockoutEndTime(null);
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutEndTime');
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isLockedOut = lockoutEndTime && lockoutEndTime > Date.now();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if account is locked out
    if (isLockedOut) {
      toast.error(`Kontot är låst. Försök igen om ${formatTime(timeRemaining)}.`);
      return;
    }
    
    setIsLoading(true);

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check admin credentials
    if (username === 'Willi' && password === 'Rickilito00') {
      toast.success('Välkommen tillbaka, Willi!');
      resetLoginAttempts(); // Reset attempts on successful login
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
      resetLoginAttempts(); // Reset attempts on successful login
      onLogin('customer', customer.id);
      setIsLoading(false);
      return;
    }

    // Invalid credentials - handle failed login
    handleFailedLogin();
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
            Hansa Admin Portal v2.0
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Logga in för att komma åt din uppdaterade admin-panel
          </p>
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              🆕 Nyligen uppdaterad med full funktionalitet
            </span>
          </div>
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
                  disabled={isLockedOut}
                  className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={isLockedOut}
                  className="relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

          {/* Lockout Warning */}
          {isLockedOut && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-red-600 mr-2" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Kontot är tillfälligt låst</p>
                  <p className="mt-1">För många misslyckade inloggningsförsök. Försök igen om {formatTime(timeRemaining)}.</p>
                </div>
              </div>
            </div>
          )}

          {/* Attempt Warning */}
          {!isLockedOut && attemptCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-yellow-600 mr-2" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Säkerhetsvarning</p>
                  <p className="mt-1">
                    {attemptCount} misslyckade försök. {MAX_ATTEMPTS - attemptCount} försök kvar innan kontot låses i 30 minuter.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || isLockedOut}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loggar in...
                </div>
              ) : isLockedOut ? (
                `Låst (${formatTime(timeRemaining)})`
              ) : (
                'Logga in'
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Demo accounts:</strong></p>
              <p>Customer: anna.karlsson / customer123</p>
              <p>Customer: erik.johansson / customer456</p>
              <p>Customer: maria.svensson / customer789</p>
              <p>Admin: Willi / Rickilito00</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;