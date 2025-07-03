import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCard, Smartphone, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface PaymentProps {
  amount: number;
  currency: string;
  description: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentProps> = ({
  amount,
  currency,
  description,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'swish' | 'bankgiro'>('card');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent on backend
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to öre
          currency,
          paymentMethod,
          description
        })
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (paymentMethod === 'card') {
        const cardElement = elements.getElement(CardElement);
        
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement!,
            }
          }
        );

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (paymentIntent?.status === 'succeeded') {
          onSuccess(paymentIntent.id);
          toast.success('Betalning genomförd!');
        }
      } else if (paymentMethod === 'swish') {
        // Redirect to Swish
        window.location.href = `/api/payments/swish/redirect?intent=${clientSecret}`;
      } else if (paymentMethod === 'bankgiro') {
        // Show bankgiro instructions
        toast.success('Bankgiro-instruktioner skickade via e-post');
        onSuccess(clientSecret);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Betalning misslyckades';
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Betala {amount.toLocaleString('sv-SE')} {currency}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Välj betalningsmetod
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-3 border rounded-lg flex flex-col items-center ${
              paymentMethod === 'card' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <CreditCard className="w-6 h-6 mb-1" />
            <span className="text-xs">Kort</span>
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentMethod('swish')}
            className={`p-3 border rounded-lg flex flex-col items-center ${
              paymentMethod === 'swish' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Smartphone className="w-6 h-6 mb-1" />
            <span className="text-xs">Swish</span>
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentMethod('bankgiro')}
            className={`p-3 border rounded-lg flex flex-col items-center ${
              paymentMethod === 'bankgiro' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Building className="w-6 h-6 mb-1" />
            <span className="text-xs">Bankgiro</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {paymentMethod === 'card' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kortinformation
            </label>
            <div className="p-3 border border-gray-300 rounded-lg">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {paymentMethod === 'swish' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Du kommer omdirigeras till Swish-appen för att slutföra betalningen.
            </p>
          </div>
        )}

        {paymentMethod === 'bankgiro' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Bankgiro-instruktioner kommer skickas till din e-post. 
              Betalningen registreras inom 1-2 bankdagar.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Bearbetar...' : `Betala ${amount.toLocaleString('sv-SE')} ${currency}`}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Säker betalning med 256-bit SSL-kryptering</p>
        <p>Powered by Stripe • PCI DSS Level 1 certifierad</p>
      </div>
    </div>
  );
};

const PaymentGateway: React.FC<PaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default PaymentGateway;