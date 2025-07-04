import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { paymentService } from '../../services/paymentService';
import PaymentMethodSelector from './PaymentMethodSelector';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../stores/authStore';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  transactionId: string;
  amount: number;
  currency: string;
  description?: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  onCancel?: () => void;
}

interface StripePaymentFormProps extends PaymentFormProps {
  clientSecret: string;
  paymentId: string;
}

// Stripe card payment form component
const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  paymentId,
  amount,
  currency,
  description,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onPaymentError('Stripe har inte laddats än');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError('Kortformulär inte tillgängligt');
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        onPaymentError(error.message || 'Betalning misslyckades');
      } else if (paymentIntent?.status === 'succeeded') {
        onPaymentSuccess(paymentId);
      }
    } catch (error) {
      onPaymentError('Ett oväntat fel uppstod vid betalning');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount summary */}
      <div className="bg-nordic-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center text-sm text-nordic-gray-700 mb-2">
          <span>Belopp:</span>
          <span>{paymentService.formatCurrency(amount, currency)}</span>
        </div>
        {description && (
          <p className="text-sm text-nordic-gray-600">{description}</p>
        )}
      </div>

      {/* Card input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-nordic-gray-700">
          Kortuppgifter
        </label>
        <div className="border border-nordic-gray-300 rounded-lg p-3 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-nordic-gray-500">
          Dina kortuppgifter krypteras säkert och lagras aldrig på våra servrar.
        </p>
      </div>

      {/* Security info */}
      <div className="flex items-start space-x-2 p-3 bg-nordic-blue-50 rounded-lg">
        <div className="text-nordic-blue-600 mt-0.5">🛡️</div>
        <div className="text-sm text-nordic-blue-800">
          <p className="font-medium mb-1">Säker betalning med 3D Secure</p>
          <p>
            Du kan behöva bekräfta betalningen med din banks app eller SMS-kod.
          </p>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200
          ${isProcessing || !stripe
            ? 'bg-nordic-gray-400 cursor-not-allowed'
            : 'bg-nordic-blue-600 hover:bg-nordic-blue-700 active:bg-nordic-blue-800'
          }
        `}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="sm" />
            <span>Behandlar betalning...</span>
          </div>
        ) : (
          `Betala ${paymentService.formatCurrency(amount, currency)}`
        )}
      </button>
    </form>
  );
};

// Nordic payment methods component
const NordicPaymentForm: React.FC<{
  paymentMethod: string;
  amount: number;
  currency: string;
  description?: string;
  confirmationUrl?: string;
  onCancel?: () => void;
}> = ({ paymentMethod, amount, currency, description, confirmationUrl, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);

  useEffect(() => {
    validatePhoneNumber(phoneNumber);
  }, [phoneNumber, paymentMethod]);

  const validatePhoneNumber = (phone: string) => {
    const patterns = {
      SWISH: /^(\+46|0)[7-9]\d{8}$/, // Swedish mobile
      MOBILEPAY: /^(\+45|0)[2-9]\d{7}$/, // Danish mobile
      VIPPS: /^(\+47|0)[4-9]\d{7}$/, // Norwegian mobile
    };

    const pattern = patterns[paymentMethod as keyof typeof patterns];
    setIsValidPhone(pattern ? pattern.test(phone) : true);
  };

  const getPaymentMethodInfo = () => {
    const info = {
      SWISH: {
        name: 'Swish',
        placeholder: '+46 70 123 45 67',
        description: 'Ange ditt mobilnummer för Swish-betalning',
        icon: '📱',
      },
      MOBILEPAY: {
        name: 'MobilePay',
        placeholder: '+45 12 34 56 78',
        description: 'Ange ditt mobilnummer för MobilePay',
        icon: '📲',
      },
      VIPPS: {
        name: 'Vipps',
        placeholder: '+47 12 34 56 78',
        description: 'Ange ditt mobilnummer för Vipps',
        icon: '📳',
      },
    };

    return info[paymentMethod as keyof typeof info];
  };

  const methodInfo = getPaymentMethodInfo();
  const requiresPhoneNumber = ['SWISH', 'MOBILEPAY', 'VIPPS'].includes(paymentMethod);

  if (confirmationUrl) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">{methodInfo?.icon}</div>
        <div>
          <h3 className="text-xl font-semibold text-nordic-gray-900 mb-2">
            Slutför betalning i {methodInfo?.name}
          </h3>
          <p className="text-nordic-gray-600 mb-4">
            Klicka på länken nedan för att slutföra din betalning i {methodInfo?.name}-appen.
          </p>
          <a
            href={confirmationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Öppna {methodInfo?.name}</span>
            <span>🔗</span>
          </a>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            Avbryt betalning
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Amount summary */}
      <div className="bg-nordic-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center text-sm text-nordic-gray-700 mb-2">
          <span>Belopp:</span>
          <span>{paymentService.formatCurrency(amount, currency)}</span>
        </div>
        {description && (
          <p className="text-sm text-nordic-gray-600">{description}</p>
        )}
      </div>

      {/* Payment method header */}
      <div className="text-center">
        <div className="text-4xl mb-2">{methodInfo?.icon}</div>
        <h3 className="text-xl font-semibold text-nordic-gray-900">
          Betala med {methodInfo?.name}
        </h3>
        <p className="text-nordic-gray-600 mt-1">
          {methodInfo?.description}
        </p>
      </div>

      {/* Phone number input for mobile payments */}
      {requiresPhoneNumber && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-nordic-gray-700">
            Mobilnummer
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={methodInfo?.placeholder}
            className={`
              input-field
              ${!isValidPhone && phoneNumber ? 'border-red-300 focus:border-red-500' : ''}
            `}
          />
          {!isValidPhone && phoneNumber && (
            <p className="text-sm text-red-600">
              Ange ett giltigt mobilnummer
            </p>
          )}
        </div>
      )}

      {/* Continue button */}
      <button
        disabled={requiresPhoneNumber && (!phoneNumber || !isValidPhone)}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200
          ${requiresPhoneNumber && (!phoneNumber || !isValidPhone)
            ? 'bg-nordic-gray-400 cursor-not-allowed'
            : 'bg-nordic-blue-600 hover:bg-nordic-blue-700'
          }
        `}
      >
        Fortsätt till {methodInfo?.name}
      </button>
    </div>
  );
};

// Main payment form component
const PaymentForm: React.FC<PaymentFormProps> = ({
  transactionId,
  amount,
  currency,
  description,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}) => {
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    clientSecret?: string;
    confirmationUrl?: string;
  } | null>(null);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setPaymentData(null);
  };

  const createPayment = async () => {
    if (!selectedPaymentMethod) {
      onPaymentError('Vänligen välj en betalningsmetod');
      return;
    }

    setIsCreatingPayment(true);

    try {
      const result = await paymentService.createPayment({
        transactionId,
        amount,
        currency,
        paymentMethod: selectedPaymentMethod,
        description,
      });

      setPaymentData({
        paymentId: result.paymentId,
        clientSecret: result.clientSecret,
        confirmationUrl: undefined, // Will be set after processing for Nordic methods
      });

      // For Nordic payment methods, process immediately
      if (['SWISH', 'MOBILEPAY', 'VIPPS'].includes(selectedPaymentMethod)) {
        // This would trigger the Nordic payment flow
        toast.success('Betalning skapad. Vidarebefordrar till betalningsleverantör...');
      }
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Kunde inte skapa betalning');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const validateAmount = () => {
    const validation = paymentService.validatePaymentAmount(amount, currency);
    if (!validation.isValid) {
      onPaymentError(validation.errors[0]);
      return false;
    }
    return true;
  };

  if (!validateAmount()) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-nordic-gray-900 mb-2">
          Slutför betalning
        </h2>
        <p className="text-nordic-gray-600">
          Säker och krypterad betalning för din transaktion
        </p>
      </div>

      {!paymentData ? (
        <>
          {/* Payment method selection */}
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodSelect={handlePaymentMethodSelect}
            amount={amount}
            currency={currency}
            userCountry={user?.country || 'SE'}
            disabled={isCreatingPayment}
          />

          {/* Continue button */}
          {selectedPaymentMethod && (
            <div className="mt-6 space-y-4">
              <button
                onClick={createPayment}
                disabled={isCreatingPayment}
                className={`
                  w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200
                  ${isCreatingPayment
                    ? 'bg-nordic-gray-400 cursor-not-allowed'
                    : 'bg-nordic-blue-600 hover:bg-nordic-blue-700'
                  }
                `}
              >
                {isCreatingPayment ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Skapar betalning...</span>
                  </div>
                ) : (
                  'Fortsätt till betalning'
                )}
              </button>

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full py-2 px-4 text-nordic-gray-600 hover:text-nordic-gray-800 transition-colors"
                >
                  Avbryt
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Render appropriate payment form based on method */}
          {selectedPaymentMethod === 'STRIPE_CARD' && paymentData.clientSecret ? (
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                {...{ transactionId, amount, currency, description, onPaymentSuccess, onPaymentError }}
                clientSecret={paymentData.clientSecret}
                paymentId={paymentData.paymentId}
              />
            </Elements>
          ) : (['SWISH', 'MOBILEPAY', 'VIPPS'].includes(selectedPaymentMethod || '')) ? (
            <NordicPaymentForm
              paymentMethod={selectedPaymentMethod!}
              amount={amount}
              currency={currency}
              description={description}
              confirmationUrl={paymentData.confirmationUrl}
              onCancel={onCancel}
            />
          ) : (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-nordic-gray-600">Förbereder betalning...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentForm;