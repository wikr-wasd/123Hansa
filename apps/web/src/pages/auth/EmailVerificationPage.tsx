import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

// Bekräftelsen sköts av Supabase Auth: länken i mejlet loggar in användaren och
// sätter email_confirmed_at. Den här sidan finns för den som stängt fliken eller
// aldrig fick mejlet.
//
// Tidigare anropade sidan /api/auth/verify-email och
// /api/auth/resend-verification — ändpunkter som aldrig har funnits. Knapparna
// gjorde alltså ingenting alls.

const EmailVerificationPage: React.FC = () => {
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email ?? '');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const resend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSending(true);
    try {
      const { error } = await supabase().auth.resend({ type: 'signup', email: email.trim() });
      if (error) throw error;
      setSent(true);
      toast.success('Ett nytt bekräftelsemejl är skickat');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Mejlet kunde inte skickas');
    } finally {
      setIsSending(false);
    }
  };

  if (user?.isEmailVerified) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" aria-hidden="true" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Din e-postadress är bekräftad</h1>
        <Link to="/dashboard" className="font-medium text-blue-600 hover:text-blue-800">
          Till Min sida
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Bekräfta din e-postadress – 123Hansa</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-xl px-4 py-20">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-blue-600" aria-hidden="true" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Bekräfta din e-postadress</h1>
          <p className="mb-6 text-gray-600">
            Vi har skickat en länk till dig. Klicka på den för att bekräfta adressen. Kom inget mejl
            fram kan du be om ett nytt här.
          </p>

          {sent ? (
            <p className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              Ett nytt mejl är skickat till {email}. Titta även i skräpposten.
            </p>
          ) : (
            <form onSubmit={resend} className="space-y-3 text-left">
              <label htmlFor="verify-email" className="block text-sm font-semibold text-gray-700">
                E-postadress
              </label>
              <input
                id="verify-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
                placeholder="din@epost.se"
              />
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isSending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Skicka bekräftelsemejlet igen
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default EmailVerificationPage;
