import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import ChatSystem from '../chat/ChatSystem';
import { useTranslation } from '../../hooks/useTranslation';
import { useDeviceDetection } from '../../utils/deviceDetection';
import MobileCrowdfundingFAB from '../mobile/MobileCrowdfundingFAB';
import PWAInstallPrompt from '../mobile/PWAInstallPrompt';
import { useMobileScrollControl } from '../../utils/mobileScrollController';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const { isMobile, isTablet } = useDeviceDetection();
  
  // Initialize mobile scroll control to prevent auto-scroll issues
  useMobileScrollControl();

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
            
            <nav className="hidden md:flex items-center space-x-8 ml-12">
              {/* 123hansa.se Marketplace Section */}
              <div className="flex items-center space-x-6 border-r border-gray-200 pr-8">
                <Link 
                  to="/" 
                  className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium"
                >
                  {t('home')}
                </Link>
                <Link 
                  to="/listings" 
                  className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium"
                >
                  {t('marketplace')}
                </Link>
                <Link 
                  to="/create-listing" 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center whitespace-nowrap"
                >
                  <span className="mr-2 text-lg">📝</span>
                  {t('create-listing')}
                </Link>
              </div>
              
              {/* Crowdfunding Section - Enhanced for Mobile */}
              <div className="relative">
                <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl opacity-30"></div>
                <Link 
                  to="/crowdfunding" 
                  className={`relative bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center ${
                    (isMobile || isTablet) ? 'ring-2 ring-emerald-300 ring-opacity-50 animate-pulse' : ''
                  }`}
                >
                  <span className="mr-2 text-lg">🚀</span>
                  {t('crowdfunding')}
                  {(isMobile || isTablet) && (
                    <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-bold">
                      NY!
                    </span>
                  )}
                </Link>
              </div>
              
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium whitespace-nowrap"
                  >
                    {t('dashboard')}
                  </Link>
                  <div className="flex items-center space-x-4">
                    <LanguageSwitcher variant="header" />
                    <button 
                      onClick={handleLogout}
                      className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium"
                    >
                      {t('logout')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <LanguageSwitcher variant="header" />
                  <Link 
                    to="/login" 
                    className="text-nordic-gray-700 hover:text-nordic-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    {t('login')}
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary text-sm"
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile menu and enhanced crowdfunding for mobile */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Mobile Crowdfunding Button - Always Visible */}
              <Link
                to="/crowdfunding"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center space-x-1 transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-base">🚀</span>
                <span>Crowdfunding</span>
              </Link>
              
              {/* Mobile menu button */}
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
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.businesses')}</h4>
              <ul className="space-y-2 text-sm text-nordic-gray-300">
                <li><Link to="/listings" className="hover:text-white">{t('footer.buy-businesses')}</Link></li>
                <li><Link to="/create-listing" className="hover:text-white">{t('footer.sell-businesses')}</Link></li>
                <li><Link to="/valuation" className="hover:text-white">{t('footer.valuation')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-sm text-nordic-gray-300">
                <li><Link to="/help" className="hover:text-white">{t('footer.help')}</Link></li>
                <li><Link to="/contact" className="hover:text-white">{t('footer.contact')}</Link></li>
                <li><Link to="/legal" className="hover:text-white">{t('footer.legal')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.follow-us')}</h4>
              <ul className="space-y-2 text-sm text-nordic-gray-300">
                <li><a href="https://linkedin.com/company/123hansa" target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a></li>
                <li><a href="https://twitter.com/123hansa" target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter</a></li>
                <li><a href="https://facebook.com/123hansa" target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-nordic-gray-700 mt-8 pt-8 text-center text-sm text-nordic-gray-400">
            <p>&copy; 2024 123hansa.se. {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Global Chat System - Available when logged in */}
      {isAuthenticated && user && (
        <ChatSystem 
          currentUserId={user.id}
          currentUserName={`${user.firstName} ${user.lastName}`}
          currentUserType="user"
        />
      )}

      {/* Mobile Crowdfunding FAB - Only on mobile/tablet */}
      <MobileCrowdfundingFAB />

      {/* PWA Install Prompt - Only on mobile/tablet */}
      <PWAInstallPrompt />

    </div>
  );
};