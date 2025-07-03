import { PrismaClient, Payment, PaymentMethod, PaymentStatus, Currency } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface SwishPaymentRequest {
  payeePaymentReference: string;
  callbackUrl: string;
  payerAlias: string;
  payeeAlias: string;
  amount: string;
  currency: string;
  message?: string;
}

interface MobilePayPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  phoneNumber?: string;
}

interface VippsPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerInfo: {
    mobileNumber: string;
  };
  merchantInfo: {
    callbackPrefix: string;
    fallbackUrl: string;
  };
  transaction: {
    orderId: string;
    amount: number;
    transactionText: string;
  };
}

interface NordicPaymentResult {
  paymentId: string;
  status: string;
  redirectUrl?: string;
  qrCode?: string;
  expiresAt?: Date;
}

class NordicPaymentService {
  private swishConfig = {
    baseUrl: process.env.SWISH_API_URL || 'https://mss.cpc.getswish.net/swish-cpcapi/api/v1',
    merchantId: process.env.SWISH_MERCHANT_ID,
    certificatePath: process.env.SWISH_CERTIFICATE_PATH,
    privateKeyPath: process.env.SWISH_PRIVATE_KEY_PATH,
    callbackUrl: process.env.SWISH_CALLBACK_URL,
  };

  private mobilepayConfig = {
    baseUrl: process.env.MOBILEPAY_API_URL || 'https://api.mobilepay.dk/v1',
    clientId: process.env.MOBILEPAY_CLIENT_ID,
    clientSecret: process.env.MOBILEPAY_CLIENT_SECRET,
    webhookUrl: process.env.MOBILEPAY_WEBHOOK_URL,
    redirectUrl: process.env.MOBILEPAY_REDIRECT_URL,
  };

  private vippsConfig = {
    baseUrl: process.env.VIPPS_API_URL || 'https://api.vipps.no',
    clientId: process.env.VIPPS_CLIENT_ID,
    clientSecret: process.env.VIPPS_CLIENT_SECRET,
    subscriptionKey: process.env.VIPPS_SUBSCRIPTION_KEY,
    merchantSerialNumber: process.env.VIPPS_MERCHANT_SERIAL_NUMBER,
    callbackUrl: process.env.VIPPS_CALLBACK_URL,
    fallbackUrl: process.env.VIPPS_FALLBACK_URL,
  };

  // Swish Payment Implementation
  async createSwishPayment(params: {
    paymentId: string;
    amount: number;
    currency: Currency;
    phoneNumber: string;
    message?: string;
  }): Promise<NordicPaymentResult> {
    try {
      if (!this.swishConfig.merchantId || !this.swishConfig.callbackUrl) {
        throw new Error('Swish configuration is incomplete');
      }

      const paymentRequest: SwishPaymentRequest = {
        payeePaymentReference: params.paymentId,
        callbackUrl: `${this.swishConfig.callbackUrl}/swish/${params.paymentId}`,
        payerAlias: params.phoneNumber,
        payeeAlias: this.swishConfig.merchantId,
        amount: params.amount.toFixed(2),
        currency: params.currency,
        message: params.message || '123hansa Marketplace Payment',
      };

      const response = await this.makeSwishRequest('/paymentrequests', 'POST', paymentRequest);
      
      // Swish returns 201 with Location header containing payment ID
      const swishPaymentId = response.headers['location']?.split('/').pop();
      
      if (!swishPaymentId) {
        throw new Error('Failed to extract Swish payment ID from response');
      }

      await prisma.payment.update({
        where: { id: params.paymentId },
        data: {
          swishPaymentId,
          status: PaymentStatus.PENDING,
        },
      });

      return {
        paymentId: swishPaymentId,
        status: 'pending',
        expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
      };
    } catch (error) {
      console.error('Swish payment creation failed:', error);
      throw new Error(`Failed to create Swish payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkSwishPaymentStatus(swishPaymentId: string): Promise<{
    status: string;
    errorCode?: string;
    errorMessage?: string;
  }> {
    try {
      const response = await this.makeSwishRequest(`/paymentrequests/${swishPaymentId}`, 'GET');
      
      return {
        status: response.data.status,
        errorCode: response.data.errorCode,
        errorMessage: response.data.errorMessage,
      };
    } catch (error) {
      console.error('Swish status check failed:', error);
      throw new Error(`Failed to check Swish payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // MobilePay Implementation
  async createMobilePayPayment(params: {
    paymentId: string;
    amount: number;
    currency: Currency;
    description: string;
    phoneNumber?: string;
  }): Promise<NordicPaymentResult> {
    try {
      if (!this.mobilepayConfig.clientId || !this.mobilepayConfig.redirectUrl) {
        throw new Error('MobilePay configuration is incomplete');
      }

      const accessToken = await this.getMobilePayAccessToken();

      const paymentRequest: MobilePayPaymentRequest = {
        orderId: params.paymentId,
        amount: Math.round(params.amount * 100), // Convert to øre
        currency: params.currency,
        description: params.description,
        redirectUrl: `${this.mobilepayConfig.redirectUrl}?paymentId=${params.paymentId}`,
        webhookUrl: `${this.mobilepayConfig.webhookUrl}/mobilepay/${params.paymentId}`,
        phoneNumber: params.phoneNumber,
      };

      const response = await axios.post(
        `${this.mobilepayConfig.baseUrl}/payments`,
        paymentRequest,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const mobilepayPaymentId = response.data.paymentId;
      const mobilePayUrl = response.data.mobilePayAppRedirectUri;

      await prisma.payment.update({
        where: { id: params.paymentId },
        data: {
          mobilepayPaymentId,
          confirmationUrl: mobilePayUrl,
          status: PaymentStatus.PENDING,
        },
      });

      return {
        paymentId: mobilepayPaymentId,
        status: 'pending',
        redirectUrl: mobilePayUrl,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      };
    } catch (error) {
      console.error('MobilePay payment creation failed:', error);
      throw new Error(`Failed to create MobilePay payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Vipps Implementation
  async createVippsPayment(params: {
    paymentId: string;
    amount: number;
    currency: Currency;
    phoneNumber: string;
    description: string;
  }): Promise<NordicPaymentResult> {
    try {
      if (!this.vippsConfig.merchantSerialNumber || !this.vippsConfig.callbackUrl) {
        throw new Error('Vipps configuration is incomplete');
      }

      const accessToken = await this.getVippsAccessToken();

      const paymentRequest: VippsPaymentRequest = {
        orderId: params.paymentId,
        amount: Math.round(params.amount * 100), // Convert to øre
        currency: params.currency,
        customerInfo: {
          mobileNumber: params.phoneNumber,
        },
        merchantInfo: {
          callbackPrefix: `${this.vippsConfig.callbackUrl}/vipps`,
          fallbackUrl: this.vippsConfig.fallbackUrl!,
        },
        transaction: {
          orderId: params.paymentId,
          amount: Math.round(params.amount * 100),
          transactionText: params.description,
        },
      };

      const response = await axios.post(
        `${this.vippsConfig.baseUrl}/ecomm/v2/payments`,
        paymentRequest,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Request-Id': `123hansa-${params.paymentId}`,
            'X-Timestamp': new Date().toISOString(),
            'Ocp-Apim-Subscription-Key': this.vippsConfig.subscriptionKey,
          },
        }
      );

      const vippsPaymentId = response.data.orderId;
      const vippsUrl = response.data.url;

      await prisma.payment.update({
        where: { id: params.paymentId },
        data: {
          vippsPaymentId,
          confirmationUrl: vippsUrl,
          status: PaymentStatus.PENDING,
        },
      });

      return {
        paymentId: vippsPaymentId,
        status: 'pending',
        redirectUrl: vippsUrl,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      };
    } catch (error) {
      console.error('Vipps payment creation failed:', error);
      throw new Error(`Failed to create Vipps payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to get MobilePay access token
  private async getMobilePayAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        `${this.mobilepayConfig.baseUrl}/connect/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.mobilepayConfig.clientId!,
          client_secret: this.mobilepayConfig.clientSecret!,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get MobilePay access token:', error);
      throw new Error('Failed to authenticate with MobilePay');
    }
  }

  // Helper method to get Vipps access token
  private async getVippsAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        `${this.vippsConfig.baseUrl}/accesstoken/get`,
        {
          client_id: this.vippsConfig.clientId,
          client_secret: this.vippsConfig.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.vippsConfig.subscriptionKey,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get Vipps access token:', error);
      throw new Error('Failed to authenticate with Vipps');
    }
  }

  // Helper method for Swish requests with certificate authentication
  private async makeSwishRequest(endpoint: string, method: string, data?: any) {
    // Note: In production, you would use certificate-based authentication
    // This is a simplified version for demonstration
    try {
      const config = {
        method,
        url: `${this.swishConfig.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data,
        // In production, add certificate configuration:
        // httpsAgent: new https.Agent({
        //   cert: fs.readFileSync(this.swishConfig.certificatePath),
        //   key: fs.readFileSync(this.swishConfig.privateKeyPath),
        // }),
      };

      return await axios(config);
    } catch (error) {
      console.error('Swish API request failed:', error);
      throw error;
    }
  }

  // Map Nordic payment statuses to internal payment status
  mapNordicStatusToPaymentStatus(provider: string, status: string): PaymentStatus {
    switch (provider) {
      case 'swish':
        switch (status.toLowerCase()) {
          case 'created':
          case 'pending':
            return PaymentStatus.PENDING;
          case 'paid':
            return PaymentStatus.SUCCEEDED;
          case 'declined':
          case 'error':
            return PaymentStatus.FAILED;
          case 'cancelled':
            return PaymentStatus.CANCELLED;
          default:
            return PaymentStatus.FAILED;
        }
      case 'mobilepay':
        switch (status.toLowerCase()) {
          case 'initiated':
          case 'pending':
            return PaymentStatus.PENDING;
          case 'captured':
            return PaymentStatus.SUCCEEDED;
          case 'cancelled_by_user':
          case 'cancelled_by_merchant':
            return PaymentStatus.CANCELLED;
          case 'expired':
          case 'rejected':
            return PaymentStatus.FAILED;
          default:
            return PaymentStatus.FAILED;
        }
      case 'vipps':
        switch (status.toLowerCase()) {
          case 'initiate':
          case 'pending':
            return PaymentStatus.PENDING;
          case 'reserve':
            return PaymentStatus.REQUIRES_ACTION;
          case 'capture':
            return PaymentStatus.SUCCEEDED;
          case 'cancel':
            return PaymentStatus.CANCELLED;
          case 'refund':
            return PaymentStatus.REFUNDED;
          default:
            return PaymentStatus.FAILED;
        }
      default:
        return PaymentStatus.FAILED;
    }
  }

  // Validate phone numbers for Nordic countries
  validatePhoneNumber(phoneNumber: string, country: 'SE' | 'NO' | 'DK'): boolean {
    const patterns = {
      SE: /^(\+46|0)[7-9]\d{8}$/, // Swedish mobile numbers
      NO: /^(\+47|0)[4-9]\d{7}$/, // Norwegian mobile numbers
      DK: /^(\+45|0)[2-9]\d{7}$/, // Danish mobile numbers
    };

    return patterns[country].test(phoneNumber);
  }

  // Get supported payment methods by country
  getSupportedPaymentMethods(country: 'SE' | 'NO' | 'DK'): PaymentMethod[] {
    const methodsByCountry = {
      SE: [PaymentMethod.SWISH, PaymentMethod.STRIPE_CARD, PaymentMethod.STRIPE_SEPA],
      NO: [PaymentMethod.VIPPS, PaymentMethod.STRIPE_CARD],
      DK: [PaymentMethod.MOBILEPAY, PaymentMethod.STRIPE_CARD, PaymentMethod.STRIPE_SEPA],
    };

    return methodsByCountry[country] || [PaymentMethod.STRIPE_CARD];
  }
}

export { NordicPaymentService };