import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-nordic-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-nordic-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="text-2xl hansa123-logo transform transition-all duration-200 hover:scale-105"
              >
                123hansa.se
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              {/* 123hansa.se Marketplace Section */}
              <div className="flex items-center space-x-6 border-r border-gray-200 pr-8">
                <Link 
                  to="/" 
                  className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Hem
                </Link>
                <Link 
                  to="/listings" 
                  className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Marknadsplats
                </Link>
                <Link 
                  to="/create-listing" 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Lägg till annons
                </Link>
              </div>
              
              {/* Crowdfunding Section - Separate & Unique */}
              <div className="relative">
                <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl opacity-30"></div>
                <Link 
                  to="/crowdfunding" 
                  className="relative bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                >
                  <span className="mr-2 text-lg">🚀</span>
                  Crowdfunding
                </Link>
              </div>
              
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-nordic-gray-600">
                      Hej, {user?.firstName}!
                    </span>
                    <Link 
                      to="/profile" 
                      className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium"
                    >
                      Min Sida
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium"
                    >
                      Logga ut
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    Logga in
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary text-sm"
                  >
                    Registrera
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-nordic-gray-700 hover:text-nordic-blue-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-nordic-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <h3 className="text-xl font-bold mb-4">123hansa.se</h3>
              <p className="text-nordic-gray-300 text-sm">
                Nordens ledande marknadsplats för företag och digitala tillgångar.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Företag</h4>
              <ul className="space-y-2 text-sm text-nordic-gray-300">
                <li><Link to="/listings" className="hover:text-white">Köp företag</Link></li>
                <li><Link to="/create-listing" className="hover:text-white">Sälj företag</Link></li>
                <li><Link to="/valuation" className="hover:text-white">Värdering</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-nordic-gray-300">
                <li><Link to="/help" className="hover:text-white">Hjälp</Link></li>
                <li><Link to="/contact" className="hover:text-white">Kontakt</Link></li>
                <li><Link to="/legal" className="hover:text-white">Juridiskt</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Följ oss</h4>
              <ul className="space-y-2 text-sm text-nordic-gray-300">
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-nordic-gray-700 mt-8 pt-8 text-center text-sm text-nordic-gray-400">
            <p>&copy; 2024 123hansa.se. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};