import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../hooks/useTranslation';

// Inloggning mot Supabase Auth. Sidan hade tidigare knappar för Google,
// LinkedIn, Microsoft och Facebook som inte loggade in någon: de väntade två
// sekunder, skrev en påhittad token i localStorage och sa "Inloggad med
// google!". De är borta. Supabase stöder riktiga OAuth-leverantörer den dag de
// sätts upp med egna nycklar.

interface LocationState {
  from?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = (location.state as LocationState | null)?.from ?? '/dashboard';

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = t('auth.error.email-required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = t('auth.error.email-invalid');
    if (!password) next.password = t('auth.error.password-required');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      await login({ email: email.trim(), password, rememberMe });
      navigate(from, { replace: true });
    } catch {
      // Felet visas redan som en avisering av authStore.
    }
  };

  const fieldClass =
    'w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500';

  return (
    <>
      <Helmet>
        <title>{`${t('auth.login.title')} – 123Hansa`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">{t('auth.login.title')}</h1>
            <p className="mb-6 text-gray-600">{t('auth.login.subtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('auth.email-placeholder')}
                  className={fieldClass}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t('auth.password-placeholder')}
                  className={fieldClass}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t('auth.remember-me')}
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {t('auth.submit-login')}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.no-account')}{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-800">
              {t('auth.to-register')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
