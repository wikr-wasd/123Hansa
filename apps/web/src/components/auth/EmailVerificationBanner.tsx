import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Mail, X, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  onDismiss,
  className = ''
}) => {
  const { user } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user is verified or if dismissed
  if (!user || user.isEmailVerified || isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    if (!user.email) {
      toast.error('Ingen e-postadress hittades');
      return;
    }

    try {
      setIsResending(true);
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verifieringslänk skickad! Kontrollera din e-post.');
      } else {
        toast.error(data.message || 'Kunde inte skicka verifieringslänk');
      }
    } catch (error) {
      toast.error('Ett fel uppstod. Försök igen senare.');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900">
            Verifiera din e-postadress
          </h3>
          <p className="mt-1 text-sm text-amber-800">
            För att få full åtkomst till alla funktioner på 123hansa behöver du verifiera din e-postadress: <strong>{user.email}</strong>
          </p>
          
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <Link
              to="/verify-email"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-amber-900 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              Gå till verifiering
            </Link>
            
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="inline-flex items-center px-3 py-2 border border-amber-300 text-sm leading-4 font-medium rounded-md text-amber-900 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Skickar...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Skicka ny länk
                </>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="ml-3 flex-shrink-0 text-amber-400 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 rounded-md"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};