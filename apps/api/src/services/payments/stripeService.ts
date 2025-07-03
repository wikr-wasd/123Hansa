import Stripe from 'stripe';
import { PrismaClient, Currency, PaymentStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  apiVersion: '2023-10-16';
}

interface CreatePaymentIntentParams {
  amount: number;
  currency: Currency;
  customerId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
  description?: string;
  automaticPaymentMethods?: boolean;
}

interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}

class StripeService {
  private stripe: Stripe;
  private config: StripeConfig;

  constructor() {
    this.config = {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      apiVersion: '2023-10-16'
    };

    if (!this.config.secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    this.stripe = new Stripe(this.config.secretKey, {
      apiVersion: this.config.apiVersion,
      typescript: true,
    });
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    try {
      const {
        amount,
        currency,
        customerId,
        paymentMethodId,
        metadata = {},
        description,
        automaticPaymentMethods = true
      } = params;

      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100), // Convert to öre/øre/cents
        currency: currency.toLowerCase(),
        metadata: {
          ...metadata,
          created_by: '123hansa_marketplace'
        },
        description: description || '123hansa Marketplace Transaction',
      };

      if (customerId) {
        paymentIntentParams.customer = customerId;
      }

      if (paymentMethodId) {
        paymentIntentParams.payment_method = paymentMethodId;
        paymentIntentParams.confirmation_method = 'manual';
        paymentIntentParams.confirm = true;
      } else if (automaticPaymentMethods) {
        paymentIntentParams.automatic_payment_methods = {
          enabled: true,
        };
      }

      // Add 3D Secure for enhanced security
      paymentIntentParams.payment_method_options = {
        card: {
          request_three_d_secure: 'automatic',
        },
      };

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
      };
    } catch (error) {
      console.error('Stripe PaymentIntent creation failed:', error);
      throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<PaymentIntentResult> {
    try {
      const confirmParams: Stripe.PaymentIntentConfirmParams = {};
      
      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, confirmParams);

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
      };
    } catch (error) {
      console.error('Stripe PaymentIntent confirmation failed:', error);
      throw new Error(`Failed to confirm payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Stripe PaymentIntent retrieval failed:', error);
      throw new Error(`Failed to retrieve payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createCustomer(params: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: {
          ...params.metadata,
          source: '123hansa_marketplace'
        }
      });
    } catch (error) {
      console.error('Stripe Customer creation failed:', error);
      throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createSetupIntent(customerId: string): Promise<{
    setupIntentId: string;
    clientSecret: string;
  }> {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
      });

      return {
        setupIntentId: setupIntent.id,
        clientSecret: setupIntent.client_secret!,
      };
    } catch (error) {
      console.error('Stripe SetupIntent creation failed:', error);
      throw new Error(`Failed to create setup intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      console.error('Stripe PaymentMethod attachment failed:', error);
      throw new Error(`Failed to attach payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      console.error('Stripe PaymentMethod detachment failed:', error);
      throw new Error(`Failed to detach payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Stripe PaymentMethods listing failed:', error);
      throw new Error(`Failed to list payment methods: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createRefund(params: {
    paymentIntentId: string;
    amount?: number;
    reason?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Refund> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: params.paymentIntentId,
        metadata: {
          ...params.metadata,
          created_by: '123hansa_marketplace'
        }
      };

      if (params.amount) {
        refundParams.amount = Math.round(params.amount * 100);
      }

      if (params.reason) {
        refundParams.reason = params.reason as Stripe.RefundCreateParams.Reason;
      }

      return await this.stripe.refunds.create(refundParams);
    } catch (error) {
      console.error('Stripe Refund creation failed:', error);
      throw new Error(`Failed to create refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processWebhook(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );
    } catch (error) {
      console.error('Stripe webhook verification failed:', error);
      throw new Error(`Webhook verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  mapStripeStatusToPaymentStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case 'requires_payment_method':
      case 'requires_source':
        return PaymentStatus.PENDING;
      case 'requires_confirmation':
        return PaymentStatus.REQUIRES_CONFIRMATION;
      case 'requires_action':
      case 'requires_source_action':
        return PaymentStatus.REQUIRES_ACTION;
      case 'processing':
        return PaymentStatus.PROCESSING;
      case 'succeeded':
        return PaymentStatus.SUCCEEDED;
      case 'canceled':
        return PaymentStatus.CANCELLED;
      default:
        return PaymentStatus.FAILED;
    }
  }

  async calculateApplicationFee(amount: number, commissionRate: number): Promise<number> {
    return Math.round(amount * (commissionRate / 100) * 100) / 100;
  }

  isWebhookEventValid(event: Stripe.Event): boolean {
    const validEvents = [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'payment_intent.requires_action',
      'payment_intent.canceled',
      'payment_method.attached',
      'payment_method.detached',
      'customer.created',
      'customer.updated',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'refund.created',
      'refund.updated'
    ];

    return validEvents.includes(event.type);
  }

  formatAmountForCurrency(amount: number, currency: Currency): string {
    const currencyMap = {
      SEK: 'kr',
      NOK: 'kr',
      DKK: 'kr',
      EUR: '€',
      USD: '$',
      GBP: '£'
    };

    const symbol = currencyMap[currency] || currency;
    
    return new Intl.NumberFormat('sv-SE', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' ' + symbol;
  }
}

export default StripeService;