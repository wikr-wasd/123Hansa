import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Social provider icons
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#F25022" d="M1 1h10v10H1z"/>
    <path fill="#00A4EF" d="M13 1h10v10H13z"/>
    <path fill="#7FBA00" d="M1 13h10v10H1z"/>
    <path fill="#FFB900" d="M13 13h10v10H13z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

interface SocialAuthButtonsProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  mode?: 'login' | 'register';
  className?: string;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onSuccess,
  onError,
  mode = 'login',
  className = '',
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug log
  console.log('SocialAuthButtons rendered with mode:', mode);

  const handleSocialAuth = async (provider: 'google' | 'linkedin' | 'microsoft' | 'facebook') => {
    try {
      setLoading(provider);
      setError(null);

      // In a real implementation, this would:
      // 1. Redirect to OAuth provider or open popup
      // 2. Handle OAuth callback
      // 3. Send access token to backend
      // 4. Receive JWT token and user data

      // Mock successful authentication
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockUser = {
        id: `${provider}-user-${Date.now()}`,
        email: `user@${provider === 'microsoft' ? 'outlook.com' : provider === 'facebook' ? 'facebook.com' : provider + '.com'}`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        picture: `https://ui-avatars.com/api/?name=${provider}&background=random`,
        provider: provider.toUpperCase(),
        isNewUser: Math.random() > 0.5,
      };

      // Mock token
      const mockToken = `mock-jwt-token-${Date.now()}`;
      
      // Store token in localStorage (in production, use secure HTTP-only cookies)
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      onSuccess?.(mockUser);
      toast.success(`Inloggad med ${provider}!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${provider} authentication failed`;
      setError(errorMessage);
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const actionText = mode === 'login' ? 'Logga in' : 'Registrera';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-500 text-center mb-2">
        Visar {mode === 'login' ? 'inloggning' : 'registrering'} med 4 alternativ
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-nordic-gray-300 rounded-lg bg-white hover:bg-nordic-gray-50 focus:ring-2 focus:ring-nordic-blue-500 disabled:opacity-50 transition-colors"
          onClick={() => handleSocialAuth('google')}
          disabled={!!loading}
        >
          {loading === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          <span className="font-medium text-nordic-gray-700">
            {actionText} med Google
          </span>
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-nordic-gray-300 rounded-lg bg-white hover:bg-nordic-gray-50 focus:ring-2 focus:ring-nordic-blue-500 disabled:opacity-50 transition-colors"
          onClick={() => handleSocialAuth('linkedin')}
          disabled={!!loading}
        >
          {loading === 'linkedin' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LinkedInIcon />
          )}
          <span className="font-medium text-nordic-gray-700">
            {actionText} med LinkedIn
          </span>
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-nordic-gray-300 rounded-lg bg-white hover:bg-nordic-gray-50 focus:ring-2 focus:ring-nordic-blue-500 disabled:opacity-50 transition-colors"
          onClick={() => handleSocialAuth('microsoft')}
          disabled={!!loading}
        >
          {loading === 'microsoft' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <MicrosoftIcon />
          )}
          <span className="font-medium text-nordic-gray-700">
            {actionText} med Microsoft
          </span>
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-nordic-gray-300 rounded-lg bg-white hover:bg-nordic-gray-50 focus:ring-2 focus:ring-nordic-blue-500 disabled:opacity-50 transition-colors"
          onClick={() => handleSocialAuth('facebook')}
          disabled={!!loading}
        >
          {loading === 'facebook' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FacebookIcon />
          )}
          <span className="font-medium text-nordic-gray-700">
            {actionText} med Facebook
          </span>
        </button>
      </div>
    </div>
  );
};

export default SocialAuthButtons;