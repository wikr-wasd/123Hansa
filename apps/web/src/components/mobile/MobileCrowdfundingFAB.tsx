import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, X, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useDeviceDetection } from '../../utils/deviceDetection';

interface MobileCrowdfundingFABProps {
  className?: string;
}

export const MobileCrowdfundingFAB: React.FC<MobileCrowdfundingFABProps> = ({ className = '' }) => {
  const { isMobile, isTablet } = useDeviceDetection();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide/show FAB on scroll (mobile UX pattern)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
        setIsExpanded(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    if (isMobile || isTablet) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY, isMobile, isTablet]);

  // Only show on mobile and tablet
  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main FAB */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {/* Expanded menu */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 animate-slide-in-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Crowdfunding</h3>
                  <p className="text-emerald-100 text-sm">Investera eller starta kampanj</p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              <Link
                to="/crowdfunding"
                className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                onClick={() => setIsExpanded(false)}
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-emerald-200 transition-colors">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Utforska kampanjer</p>
                  <p className="text-xs text-gray-500">Se alla pågående projekt</p>
                </div>
              </Link>

              <Link
                to="/crowdfunding/discover"
                className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                onClick={() => setIsExpanded(false)}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Investera</p>
                  <p className="text-xs text-gray-500">Hitta investeringsmöjligheter</p>
                </div>
              </Link>

              <Link
                to="/crowdfunding/create"
                className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                onClick={() => setIsExpanded(false)}
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Starta kampanj</p>
                  <p className="text-xs text-gray-500">Skaffa finansiering</p>
                </div>
              </Link>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-600 text-center">
                🚀 Ny tjänst! Crowdfunding för nordiska företag
              </p>
            </div>
          </div>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 
            text-white rounded-full shadow-2xl 
            flex items-center justify-center
            transform transition-all duration-300 ease-out
            hover:scale-110 hover:shadow-3xl
            active:scale-95
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
            ${isExpanded ? 'rotate-45' : 'rotate-0'}
          `}
          style={{
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
          }}
        >
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <Rocket className="w-6 h-6" />
          )}
        </button>

        {/* Pulsing ring animation when not expanded */}
        {!isExpanded && isVisible && (
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30" />
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default MobileCrowdfundingFAB;