import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
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

    if (!formData.email) {
      newErrors.email = 'E-post är obligatorisk';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ogiltigt e-postformat';
    }

    if (!formData.password) {
      newErrors.password = 'Lösenord är obligatoriskt';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth store and toast
    }
  };

  return (
    <>
      <Helmet>
        <title>Logga in - Tubba</title>
        <meta name="description" content="Logga in på ditt Tubba-konto för att hantera dina företagslistor och transaktioner." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-nordic-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gradient mb-2">123hansa</h1>
            <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
              Välkommen tillbaka
            </h2>
            <p className="text-nordic-gray-600">
              Logga in på ditt konto för att fortsätta
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
                  <span className="px-2 bg-white text-nordic-gray-500">eller</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                    E-postadress
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'border-nordic-red-500 focus:border-nordic-red-500 focus:ring-nordic-red-500' : ''}`}
                    placeholder="din@email.se"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-nordic-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-nordic-gray-700 mb-2">
                    Lösenord
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? 'border-nordic-red-500 focus:border-nordic-red-500 focus:ring-nordic-red-500' : ''}`}
                    placeholder="Ditt lösenord"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-nordic-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-nordic-gray-700">
                      Kom ihåg mig
                    </label>
                  </div>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-nordic-blue-600 hover:text-nordic-blue-500"
                  >
                    Glömt lösenord?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Loggar in...
                    </div>
                  ) : (
                    'Logga in'
                  )}
                </button>
              </form>
            </div>

            <div className="card-footer text-center">
              <p className="text-sm text-nordic-gray-600">
                Har du inte ett konto?{' '}
                <Link
                  to="/register"
                  className="font-medium text-nordic-blue-600 hover:text-nordic-blue-500"
                >
                  Registrera dig här
                </Link>
              </p>
            </div>
          </div>

          {/* Additional features */}
          <div className="text-center">
            <p className="text-xs text-nordic-gray-500">
              Genom att logga in godkänner du våra{' '}
              <Link to="/terms" className="text-nordic-blue-600 hover:text-nordic-blue-500">
                användarvillkor
              </Link>{' '}
              och{' '}
              <Link to="/privacy" className="text-nordic-blue-600 hover:text-nordic-blue-500">
                integritetspolicy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;