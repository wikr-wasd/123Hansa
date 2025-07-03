import { api } from './api';

export interface Payment {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  clientSecret?: string;
  confirmationUrl?: string;
  stripePaymentIntentId?: string;
  swishPaymentId?: string;
  mobilepayPaymentId?: string;
  vippsPaymentId?: string;
  originalAmount: number;
  feeAmount: number;
  netAmount: number;
  metadata?: Record<string, any>;
  failureReason?: string;
  authorizedAt?: string;
  capturedAt?: string;
  failedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  amount: number;
  currency: string;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  paymentMethod?: string;
  status: string;
  escrowAccountId?: string;
  escrowFundedAt?: string;
  escrowReleaseAt?: string;
  autoReleaseAt?: string;
  agreedAt?: string;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  description?: string;
  buyerNotes?: string;
  sellerNotes?: string;
  terms?: Record<string, any>;
  milestones?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    askingPrice: number;
    currency: string;
  };
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreatePaymentParams {
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentParams {
  paymentMethodId?: string;
  returnUrl?: string;
}

export interface PaymentMethodInfo {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  currencies: string[];
  countries: string[];
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
  isAvailable: boolean;
  requiresSetup: boolean;
}

export interface PaymentFees {
  baseAmount: number;
  feeAmount: number;
  totalAmount: number;
}

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  timestamp: string;
}

class PaymentService {
  // Create new payment
  async createPayment(params: CreatePaymentParams): Promise<{
    paymentId: string;
    clientSecret?: string;
    requiresAction?: boolean;
    nextAction?: any;
    status: string;
  }> {
    const response = await api.post('/payments/payments', params);
    return response.data;
  }

  // Process payment (confirm payment intent)
  async processPayment(paymentId: string, params: ProcessPaymentParams): Promise<{
    paymentId: string;
    status: string;
    requiresAction?: boolean;
    nextAction?: any;
  }> {
    const response = await api.post(`/payments/payments/${paymentId}/process`, params);
    return response.data;
  }

  // Get payment details
  async getPayment(paymentId: string): Promise<Payment> {
    const response = await api.get(`/payments/payments/${paymentId}`);
    return response.data;
  }

  // Get payments for a transaction
  async getPaymentsByTransaction(transactionId: string): Promise<Payment[]> {
    const response = await api.get(`/payments/transactions/${transactionId}/payments`);
    return response.data;
  }

  // Get user's payment history
  async getUserPayments(limit = 50, offset = 0): Promise<{
    payments: Payment[];
    pagination: {
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const response = await api.get('/payments/users/me/payments', {
      params: { limit, offset },
    });
    return response.data;
  }

  // Create refund
  async createRefund(paymentId: string, params: {
    amount?: number;
    reason: string;
  }): Promise<void> {
    await api.post(`/payments/payments/${paymentId}/refund`, params);
  }

  // Calculate payment fees
  async calculatePaymentFees(
    amount: number,
    paymentMethod: string,
    currency: string
  ): Promise<PaymentFees> {
    const response = await api.get('/payments/payment-fees', {
      params: { amount, paymentMethod, currency },
    });
    return response.data;
  }

  // Get available payment methods
  getAvailablePaymentMethods(country?: string): PaymentMethodInfo[] {
    const allMethods: PaymentMethodInfo[] = [
      {
        id: 'STRIPE_CARD',
        type: 'card',
        name: 'Kort',
        description: 'Betala med kredit- eller betalkort',
        icon: '💳',
        currencies: ['SEK', 'NOK', 'DKK', 'EUR', 'USD', 'GBP'],
        countries: ['SE', 'NO', 'DK', 'FI', 'IS', 'EU', 'US', 'GB'],
        fees: { percentage: 2.9, fixed: 1.8, currency: 'SEK' },
        isAvailable: true,
        requiresSetup: false,
      },
      {
        id: 'SWISH',
        type: 'mobile',
        name: 'Swish',
        description: 'Betala direkt med Swish',
        icon: '📱',
        currencies: ['SEK'],
        countries: ['SE'],
        fees: { percentage: 1.2, fixed: 1.0, currency: 'SEK' },
        isAvailable: true,
        requiresSetup: false,
      },
      {
        id: 'MOBILEPAY',
        type: 'mobile',
        name: 'MobilePay',
        description: 'Betala med MobilePay',
        icon: '📲',
        currencies: ['DKK'],
        countries: ['DK'],
        fees: { percentage: 1.45, fixed: 0, currency: 'DKK' },
        isAvailable: true,
        requiresSetup: false,
      },
      {
        id: 'VIPPS',
        type: 'mobile',
        name: 'Vipps',
        description: 'Betala med Vipps',
        icon: '📳',
        currencies: ['NOK'],
        countries: ['NO'],
        fees: { percentage: 1.4, fixed: 1.0, currency: 'NOK' },
        isAvailable: true,
        requiresSetup: false,
      },
      {
        id: 'STRIPE_SEPA',
        type: 'bank_transfer',
        name: 'SEPA Bankoverföring',
        description: 'Betala via SEPA-överföring',
        icon: '🏦',
        currencies: ['EUR'],
        countries: ['EU'],
        fees: { percentage: 0.8, fixed: 0.25, currency: 'EUR' },
        isAvailable: true,
        requiresSetup: false,
      },
      {
        id: 'BANK_TRANSFER',
        type: 'bank_transfer',
        name: 'Bankgiro/Plusgiro',
        description: 'Traditionell bankoverföring',
        icon: '🏛️',
        currencies: ['SEK', 'NOK', 'DKK'],
        countries: ['SE', 'NO', 'DK'],
        fees: { percentage: 0, fixed: 5.0, currency: 'SEK' },
        isAvailable: false, // Manual processing required
        requiresSetup: true,
      },
    ];

    if (!country) {
      return allMethods.filter(method => method.isAvailable);
    }

    return allMethods.filter(method => 
      method.isAvailable && method.countries.includes(country)
    );
  }

  // Format currency amount
  formatCurrency(amount: number, currency: string): string {
    const currencyConfigs = {
      SEK: { locale: 'sv-SE', symbol: 'kr' },
      NOK: { locale: 'nb-NO', symbol: 'kr' },
      DKK: { locale: 'da-DK', symbol: 'kr' },
      EUR: { locale: 'de-DE', symbol: '€' },
      USD: { locale: 'en-US', symbol: '$' },
      GBP: { locale: 'en-GB', symbol: '£' },
    };

    const config = currencyConfigs[currency as keyof typeof currencyConfigs];
    if (!config) {
      return `${amount} ${currency}`;
    }

    try {
      const formatter = new Intl.NumberFormat(config.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const formattedAmount = formatter.format(amount);
      
      // For Nordic currencies, put symbol after amount
      if (['SEK', 'NOK', 'DKK'].includes(currency)) {
        return `${formattedAmount} ${config.symbol}`;
      } else {
        return `${config.symbol}${formattedAmount}`;
      }
    } catch (error) {
      return `${amount} ${currency}`;
    }
  }

  // Get payment method icon
  getPaymentMethodIcon(paymentMethod: string): string {
    const icons = {
      STRIPE_CARD: '💳',
      SWISH: '📱',
      MOBILEPAY: '📲',
      VIPPS: '📳',
      STRIPE_SEPA: '🏦',
      BANK_TRANSFER: '🏛️',
      PAYPAL: '🅿️',
    };

    return icons[paymentMethod as keyof typeof icons] || '💰';
  }

  // Get payment status color
  getPaymentStatusColor(status: string): string {
    const colors = {
      PENDING: 'yellow',
      PROCESSING: 'blue',
      SUCCEEDED: 'green',
      FAILED: 'red',
      CANCELLED: 'gray',
      REFUNDED: 'orange',
      PARTIALLY_REFUNDED: 'orange',
      REQUIRES_ACTION: 'purple',
      REQUIRES_CONFIRMATION: 'blue',
    };

    return colors[status as keyof typeof colors] || 'gray';
  }

  // Get payment status text in Swedish
  getPaymentStatusText(status: string): string {
    const statusTexts = {
      PENDING: 'Väntar',
      PROCESSING: 'Behandlas',
      SUCCEEDED: 'Genomförd',
      FAILED: 'Misslyckades',
      CANCELLED: 'Avbruten',
      REFUNDED: 'Återbetald',
      PARTIALLY_REFUNDED: 'Delvis återbetald',
      REQUIRES_ACTION: 'Kräver åtgärd',
      REQUIRES_CONFIRMATION: 'Kräver bekräftelse',
    };

    return statusTexts[status as keyof typeof statusTexts] || status;
  }

  // Check if payment can be refunded
  canRefundPayment(payment: Payment): boolean {
    return payment.status === 'SUCCEEDED' && !payment.refundedAt;
  }

  // Validate payment amount
  validatePaymentAmount(amount: number, currency: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Minimum amounts by currency
    const minimumAmounts = {
      SEK: 10,
      NOK: 10,
      DKK: 10,
      EUR: 5,
      USD: 5,
      GBP: 4,
    };

    // Maximum amounts (AML limits)
    const maximumAmounts = {
      SEK: 1000000,
      NOK: 1000000,
      DKK: 1000000,
      EUR: 100000,
      USD: 100000,
      GBP: 80000,
    };

    const minAmount = minimumAmounts[currency as keyof typeof minimumAmounts] || 1;
    const maxAmount = maximumAmounts[currency as keyof typeof maximumAmounts] || 1000000;

    if (amount < minAmount) {
      errors.push(`Minimibelopp är ${this.formatCurrency(minAmount, currency)}`);
    }

    if (amount > maxAmount) {
      errors.push(`Maximibelopp är ${this.formatCurrency(maxAmount, currency)}`);
    }

    if (amount <= 0) {
      errors.push('Beloppet måste vara större än 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const paymentService = new PaymentService();