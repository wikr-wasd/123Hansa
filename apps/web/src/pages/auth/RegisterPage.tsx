import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: 'SE' as 'SE' | 'NO' | 'DK',
    language: 'sv' as 'sv' | 'no' | 'da' | 'en',
    companyName: '',
    acceptTerms: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'E-post är obligatorisk';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ogiltigt e-postformat';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Lösenord är obligatoriskt';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Lösenordet måste vara minst 8 tecken';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'Lösenordet måste innehålla stora och små bokstäver, siffror och specialtecken';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Lösenorden matchar inte';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Förnamn är obligatoriskt';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Förnamn måste vara minst 2 tecken';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Efternamn är obligatoriskt';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Efternamn måste vara minst 2 tecken';
    }

    // Phone validation (optional but if provided, must be Nordic format)
    if (formData.phone && !/^\+?(46|47|45)[0-9]{8,10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ogiltigt nordiskt telefonnummer';
    }

    // Terms acceptance
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Du måste acceptera användarvillkoren';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone || undefined,
        country: formData.country,
        language: formData.language,
        companyName: formData.companyName.trim() || undefined,
        acceptTerms: formData.acceptTerms,
      };

      await register(registerData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth store and toast
    }
  };

  return (
    <>
      <Helmet>
        <title>Registrera dig - 123hansa</title>
        <meta name="description" content="Skapa ditt 123hansa-konto och börja sälja eller köpa företag i Norden idag." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-nordic-gray-50">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gradient mb-2">123hansa</h1>
            <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
              Skapa ditt konto
            </h2>
            <p className="text-nordic-gray-600">
              Anslut dig till Nordens ledande företagsmarknadsplats
            </p>
          </div>

          <div className="card">
            <div className="card-body">
              <SocialAuthButtons />
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-nordic-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-nordic-gray-500">eller registrera med e-post</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                      Förnamn *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.firstName ? 'border-nordic-red-500' : ''}`}
                      placeholder="Ditt förnamn"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-nordic-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                      Efternamn *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.lastName ? 'border-nordic-red-500' : ''}`}
                      placeholder="Ditt efternamn"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-nordic-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                    E-postadress *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'border-nordic-red-500' : ''}`}
                    placeholder="din@email.se"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-nordic-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                    Telefonnummer
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? 'border-nordic-red-500' : ''}`}
                    placeholder="+46 70 123 45 67"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-nordic-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                      Land *
                    </label>
                    <select
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="SE">Sverige</option>
                      <option value="NO">Norge</option>
                      <option value="DK">Danmark</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                      Språk
                    </label>
                    <select
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="sv">Svenska</option>
                      <option value="no">Norska</option>
                      <option value="da">Danska</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                    Företagsnamn (valfritt)
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ditt företagsnamn"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                    Lösenord *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? 'border-nordic-red-500' : ''}`}
                    placeholder="Skapa ett starkt lösenord"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-nordic-red-600">{errors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-nordic-gray-500">
                    Minst 8 tecken med stora/små bokstäver, siffror och specialtecken
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                    Bekräfta lösenord *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${errors.confirmPassword ? 'border-nordic-red-500' : ''}`}
                    placeholder="Bekräfta ditt lösenord"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-nordic-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms acceptance */}
                <div>
                  <div className="flex items-start">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="form-checkbox mt-1"
                    />
                    <label htmlFor="acceptTerms" className="ml-2 block text-sm text-nordic-gray-700">
                      Jag accepterar{' '}
                      <Link to="/terms" className="text-nordic-blue-600 hover:text-nordic-blue-500">
                        användarvillkoren
                      </Link>{' '}
                      och{' '}
                      <Link to="/privacy" className="text-nordic-blue-600 hover:text-nordic-blue-500">
                        integritetspolicyn
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-nordic-red-600">{errors.acceptTerms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Skapar konto...
                    </div>
                  ) : (
                    'Skapa konto'
                  )}
                </button>
              </form>
            </div>

            <div className="card-footer text-center">
              <p className="text-sm text-nordic-gray-600">
                Har du redan ett konto?{' '}
                <Link
                  to="/login"
                  className="font-medium text-nordic-blue-600 hover:text-nordic-blue-500"
                >
                  Logga in här
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;