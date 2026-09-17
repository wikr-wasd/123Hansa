import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { CountryCode, LocaleCode } from '@hansa/core';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../hooks/useTranslation';

// Registrering mot Supabase Auth. Land och språk sparas på profilen, och landet
// styr sedan valuta och organisationsnummerformat i annonsformuläret.
//
// Bara lanseringsmarknaderna erbjuds. @hansa/core kan fem länder, men Kroatien
// och Bosnien öppnas i ett senare skede (docs/BUSINESS.md).

const COUNTRIES: CountryCode[] = ['SE', 'NO', 'DK'];
const LANGUAGES: { code: LocaleCode; label: string }[] = [
  { code: 'sv', label: 'Svenska' },
  { code: 'no', label: 'Norsk' },
  { code: 'da', label: 'Dansk' },
  { code: 'en', label: 'English' },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState<CountryCode>('SE');
  const [language, setLanguage] = useState<LocaleCode>('sv');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = t('auth.error.first-name');
    if (!lastName.trim()) next.lastName = t('auth.error.last-name');
    if (!email.trim()) next.email = t('auth.error.email-required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = t('auth.error.email-invalid');
    if (!password) next.password = t('auth.error.password-required');
    else if (password.length < 8) next.password = t('auth.error.password-short');
    if (password !== confirmPassword) next.confirmPassword = t('auth.error.password-mismatch');
    if (!acceptTerms) next.acceptTerms = t('auth.error.terms');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      await register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country,
        language,
        acceptTerms,
      });
      navigate('/dashboard');
    } catch {
      // Felet visas redan som en avisering av authStore.
    }
  };

  const fieldClass =
    'w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500';
  const labelClass = 'mb-2 block text-sm font-semibold text-gray-700';

  return (
    <>
      <Helmet>
        <title>{`${t('auth.register.title')} – 123Hansa`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">{t('auth.register.title')}</h1>
            <p className="mb-6 text-gray-600">{t('auth.register.subtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    {t('auth.first-name')}
                  </label>
                  <input
                    id="firstName"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className={fieldClass}
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    {t('auth.last-name')}
                  </label>
                  <input
                    id="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className={fieldClass}
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="country" className={labelClass}>
                    {t('auth.country')}
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value as CountryCode)}
                    className={fieldClass}
                  >
                    {COUNTRIES.map((code) => (
                      <option key={code} value={code}>
                        {t(`country.${code}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className={labelClass}>
                    {t('auth.language')}
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as LocaleCode)}
                    className={fieldClass}
                  >
                    {LANGUAGES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={fieldClass}
                />
                <p className="mt-1 text-xs text-gray-500">{t('auth.password-hint')}</p>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                  {t('auth.password-confirm')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={fieldClass}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(event) => setAcceptTerms(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span>
                    {t('auth.accept-terms-before')}{' '}
                    <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-800">
                      {t('auth.terms')}
                    </Link>{' '}
                    {t('auth.accept-terms-and')}{' '}
                    <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-800">
                      {t('auth.privacy')}
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {t('auth.submit-register')}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.have-account')}{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800">
              {t('auth.to-login')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
