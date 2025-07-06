import React, { useState } from 'react';
import { SecureForm, SecureEmailInput } from '../common/SecureForm';
import { AlertCircle, Send, CheckCircle } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
  phone?: string;
}

interface SecureContactFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const SecureContactForm: React.FC<SecureContactFormProps> = ({
  onSuccess,
  className = ''
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (formData: FormData, csrfToken: string) => {
    try {
      setSubmitError('');
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message'),
          company: formData.get('company'),
          phone: formData.get('phone'),
          _csrf: csrfToken
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Meddelandet kunde inte skickas');
      }

      setIsSubmitted(true);
      onSuccess?.();
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Ett fel uppstod');
    }
  };

  if (isSubmitted) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-8 text-center ${className}`}>
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-900 mb-2">
          Meddelandet skickat!
        </h3>
        <p className="text-green-700 mb-4">
          Tack för ditt meddelande. Vi återkommer inom 24 timmar.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Skicka nytt meddelande
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-8 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Kontakta oss
        </h2>
        <p className="text-gray-600">
          Skicka ett säkert meddelande till vårt team. Alla fält markerade med * är obligatoriska.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Fel vid skickande</span>
          </div>
          <p className="text-red-700 mt-1">{submitError}</p>
        </div>
      )}

      <SecureForm
        onSubmit={handleSubmit}
        requireCaptcha={false}
        enableHoneypot={true}
        submitText="Skicka meddelande"
        loadingText="Skickar meddelande..."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Namn *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ditt fullständiga namn"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-postadress *
            </label>
            <SecureEmailInput
              name="email"
              placeholder="din@email.se"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Företag
            </label>
            <input
              type="text"
              id="company"
              name="company"
              placeholder="Ditt företagsnamn (valfritt)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              autoComplete="organization"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefonnummer
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="+46 70 123 45 67 (valfritt)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              autoComplete="tel"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Ämne *
          </label>
          <select
            id="subject"
            name="subject"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Välj ämne</option>
            <option value="general">Allmän förfrågan</option>
            <option value="business">Företagsförfrågan</option>
            <option value="crowdfunding">Crowdfunding</option>
            <option value="technical">Teknisk support</option>
            <option value="partnership">Partnerskap</option>
            <option value="press">Press/Media</option>
            <option value="other">Övrigt</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Meddelande *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="Beskriv ditt ärende så detaljerat som möjligt..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            maxLength={2000}
          />
          <div className="mt-1 text-xs text-gray-500">
            Beskriv ditt ärende tydligt. Max 2000 tecken.
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>Integritetsskydd:</strong> Dina uppgifter behandlas enligt GDPR och används endast för att svara på din förfrågan. 
              Vi delar aldrig dina uppgifter med tredje part utan ditt samtycke.
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-2">
          <p>
            Genom att skicka detta formulär godkänner du vår{' '}
            <a href="/privacy" className="text-emerald-600 hover:text-emerald-700 underline">
              integritetspolicy
            </a>{' '}
            och{' '}
            <a href="/terms" className="text-emerald-600 hover:text-emerald-700 underline">
              användarvillkor
            </a>.
          </p>
          <p>
            * Obligatoriska fält måste fyllas i för att meddelandet ska kunna skickas.
          </p>
        </div>
      </SecureForm>
    </div>
  );
};

export default SecureContactForm;