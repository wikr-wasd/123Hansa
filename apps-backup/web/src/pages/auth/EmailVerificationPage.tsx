import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Mail, RefreshCcw, Clock } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuthStore } from '../../stores/authStore';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading');
  const [message, setMessage] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else {
      setStatus('resend');
      setMessage('Ange din verifieringstoken eller begär en ny verifieringslänk.');
    }
  }, [token]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmailToken = async (verificationToken: string) => {
    try {
      setStatus('loading');
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Din e-postadress har verifierats! Du kan nu använda alla funktioner på 123hansa.');
        toast.success('E-postadressen verifierad!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verifieringen misslyckades. Kontrollera att länken är korrekt och inte har gått ut.');
        toast.error('Verifieringen misslyckades');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Ett fel uppstod vid verifieringen. Försök igen eller begär en ny verifieringslänk.');
      toast.error('Verifieringen misslyckades');
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) {
      toast.error('Ingen e-postadress hittades. Logga in igen.');
      return;
    }

    if (resendCooldown > 0) {
      toast.error(`Vänta ${resendCooldown} sekunder innan du begär en ny länk.`);
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
        setMessage(`En ny verifieringslänk har skickats till ${user.email}. Kontrollera även din skräppost.`);
        setResendCooldown(60); // 60 second cooldown
      } else {
        toast.error(data.message || 'Kunde inte skicka verifieringslänk');
      }
    } catch (error) {
      toast.error('Ett fel uppstod. Försök igen senare.');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
              Verifierar din e-postadress...
            </h2>
            <p className="text-nordic-gray-600">
              Vänta medan vi bekräftar din e-postadress.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-nordic-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
              E-postadressen verifierad!
            </h2>
            <p className="text-nordic-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                to="/dashboard"
                className="btn btn-primary w-full"
              >
                Gå till Dashboard
              </Link>
              <Link
                to="/listings"
                className="btn btn-secondary w-full"
              >
                Bläddra bland företag
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-nordic-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
              Verifieringen misslyckades
            </h2>
            <p className="text-nordic-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              {user?.email && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                  className="btn btn-primary w-full"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Skickar...
                    </div>
                  ) : resendCooldown > 0 ? (
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Vänta {resendCooldown}s
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Skicka ny verifieringslänk
                    </div>
                  )}
                </button>
              )}
              <Link
                to="/login"
                className="btn btn-secondary w-full"
              >
                Tillbaka till inloggning
              </Link>
            </div>
          </div>
        );

      case 'resend':
        return (
          <div className="text-center">
            <Mail className="w-16 h-16 text-nordic-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
              Verifiera din e-postadress
            </h2>
            <p className="text-nordic-gray-600 mb-6">
              {message}
            </p>
            {user?.email && (
              <div className="bg-nordic-gray-50 border border-nordic-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-nordic-gray-700 mb-2">
                  Verifieringslänk kommer att skickas till:
                </p>
                <p className="font-medium text-nordic-gray-900">
                  {user.email}
                </p>
              </div>
            )}
            <div className="space-y-3">
              {user?.email && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                  className="btn btn-primary w-full"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Skickar...
                    </div>
                  ) : resendCooldown > 0 ? (
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Vänta {resendCooldown}s
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Skicka verifieringslänk
                    </div>
                  )}
                </button>
              )}
              <Link
                to="/dashboard"
                className="btn btn-secondary w-full"
              >
                Tillbaka till Dashboard
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Verifiera e-postadress - 123hansa</title>
        <meta name="description" content="Verifiera din e-postadress för att få full åtkomst till 123hansa." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-nordic-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gradient">123hansa</h1>
          </div>

          <div className="card">
            <div className="card-body">
              {renderContent()}
            </div>

            <div className="card-footer text-center">
              <p className="text-sm text-nordic-gray-600">
                Behöver du hjälp?{' '}
                <a
                  href="mailto:support@123hansa.se"
                  className="font-medium text-nordic-blue-600 hover:text-nordic-blue-500"
                >
                  Kontakta support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailVerificationPage;