import { PrismaClient, Payment, Transaction, PaymentMethod, PaymentStatus, Currency, TransactionStatus, EscrowStatus } from '@prisma/client';
import StripeService from './stripeService';
import { notificationService } from '../notificationService';

const prisma = new PrismaClient();

interface CreatePaymentParams {
  transactionId: string;
  userId: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  description?: string;
  metadata?: Record<string, any>;
}

interface ProcessPaymentParams {
  paymentId: string;
  paymentMethodId?: string;
  returnUrl?: string;
}

interface PaymentResult {
  payment: Payment;
  clientSecret?: string;
  requiresAction?: boolean;
  nextAction?: any;
}

class PaymentService {
  private stripeService: StripeService;

  constructor() {
    this.stripeService = new StripeService();
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const { transactionId, userId, amount, currency, paymentMethod, description, metadata } = params;

    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          buyer: true,
          seller: true,
          listing: true,
        },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.buyerId !== userId) {
        throw new Error('Unauthorized: User is not the buyer of this transaction');
      }

      let payment = await prisma.payment.create({
        data: {
          transactionId,
          userId,
          amount,
          currency,
          paymentMethod,
          originalAmount: amount,
          netAmount: amount,
          status: PaymentStatus.PENDING,
          metadata: metadata || {},
        },
      });

      let clientSecret: string | undefined;
      let requiresAction = false;
      let nextAction: any;

      if (paymentMethod === PaymentMethod.STRIPE_CARD) {
        const stripeResult = await this.stripeService.createPaymentIntent({
          amount,
          currency,
          description: description || `Payment for ${transaction.listing.title}`,
          metadata: {
            transactionId,
            paymentId: payment.id,
            buyerId: transaction.buyerId,
            sellerId: transaction.sellerId,
            listingId: transaction.listingId,
          },
        });

        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            stripePaymentIntentId: stripeResult.paymentIntentId,
            clientSecret: stripeResult.clientSecret,
            status: this.stripeService.mapStripeStatusToPaymentStatus(stripeResult.status),
          },
        });

        clientSecret = stripeResult.clientSecret;
        requiresAction = stripeResult.status === 'requires_action';
      }

      await this.updateTransactionStatus(transactionId, TransactionStatus.PENDING_PAYMENT);

      await notificationService.createNotification({
        userId: transaction.sellerId,
        type: 'TRANSACTION',
        title: 'Ny betalning påbörjad',
        content: `Köparen har påbörjat betalning för ${transaction.listing.title}`,
        data: {
          transactionId,
          paymentId: payment.id,
          amount,
          currency,
        },
        channel: 'IN_APP',
      });

      return {
        payment,
        clientSecret,
        requiresAction,
        nextAction,
      };
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw new Error(`Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    const { paymentId, paymentMethodId, returnUrl } = params;

    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          transaction: {
            include: {
              buyer: true,
              seller: true,
              listing: true,
              escrowAccount: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      let updatedPayment = payment;
      let requiresAction = false;
      let nextAction: any;

      if (payment.paymentMethod === PaymentMethod.STRIPE_CARD && payment.stripePaymentIntentId) {
        if (paymentMethodId) {
          const stripeResult = await this.stripeService.confirmPaymentIntent(
            payment.stripePaymentIntentId,
            paymentMethodId
          );

          updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
              status: this.stripeService.mapStripeStatusToPaymentStatus(stripeResult.status),
              authorizedAt: stripeResult.status === 'succeeded' ? new Date() : undefined,
              capturedAt: stripeResult.status === 'succeeded' ? new Date() : undefined,
            },
          });

          requiresAction = stripeResult.status === 'requires_action';

          if (stripeResult.status === 'succeeded') {
            await this.handleSuccessfulPayment(paymentId);
          }
        } else {
          const stripePaymentIntent = await this.stripeService.retrievePaymentIntent(
            payment.stripePaymentIntentId
          );

          updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
              status: this.stripeService.mapStripeStatusToPaymentStatus(stripePaymentIntent.status),
              authorizedAt: stripePaymentIntent.status === 'succeeded' ? new Date() : undefined,
              capturedAt: stripePaymentIntent.status === 'succeeded' ? new Date() : undefined,
            },
          });

          requiresAction = stripePaymentIntent.status === 'requires_action';

          if (stripePaymentIntent.status === 'succeeded') {
            await this.handleSuccessfulPayment(paymentId);
          }
        }
      }

      return {
        payment: updatedPayment,
        requiresAction,
        nextAction,
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          failedAt: new Date(),
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleSuccessfulPayment(paymentId: string): Promise<void> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          transaction: {
            include: {
              buyer: true,
              seller: true,
              listing: true,
              escrowAccount: true,
            },
          },
        },
      });

      if (!payment || !payment.transaction) {
        throw new Error('Payment or transaction not found');
      }

      const transaction = payment.transaction;

      await this.updateTransactionStatus(transaction.id, TransactionStatus.ESCROW);
      
      if (transaction.escrowAccount) {
        await this.fundEscrowAccount(transaction.escrowAccount.id, payment.amount);
      }

      await notificationService.createNotification({
        userId: transaction.sellerId,
        type: 'TRANSACTION',
        title: 'Betalning mottagen',
        content: `Betalning för ${transaction.listing.title} har mottagits och placerats i escrow`,
        data: {
          transactionId: transaction.id,
          paymentId,
          amount: payment.amount,
          currency: payment.currency,
        },
        channel: 'EMAIL',
      });

      await notificationService.createNotification({
        userId: transaction.buyerId,
        type: 'TRANSACTION',
        title: 'Betalning genomförd',
        content: `Din betalning för ${transaction.listing.title} har genomförts`,
        data: {
          transactionId: transaction.id,
          paymentId,
          amount: payment.amount,
          currency: payment.currency,
        },
        channel: 'EMAIL',
      });

    } catch (error) {
      console.error('Failed to handle successful payment:', error);
      throw error;
    }
  }

  async createRefund(params: {
    paymentId: string;
    amount?: number;
    reason: string;
    requestedBy: string;
  }): Promise<void> {
    const { paymentId, amount, reason, requestedBy } = params;

    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          transaction: {
            include: {
              buyer: true,
              seller: true,
              listing: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== PaymentStatus.SUCCEEDED) {
        throw new Error('Cannot refund payment that has not been successfully captured');
      }

      const refundAmount = amount || payment.amount;

      if (refundAmount > payment.amount) {
        throw new Error('Refund amount cannot exceed original payment amount');
      }

      let providerRefundId: string | undefined;

      if (payment.paymentMethod === PaymentMethod.STRIPE_CARD && payment.stripePaymentIntentId) {
        const stripeRefund = await this.stripeService.createRefund({
          paymentIntentId: payment.stripePaymentIntentId,
          amount: refundAmount,
          reason,
          metadata: {
            paymentId,
            transactionId: payment.transactionId,
            requestedBy,
          },
        });

        providerRefundId = stripeRefund.id;
      }

      await prisma.paymentRefund.create({
        data: {
          paymentId,
          amount: refundAmount,
          currency: payment.currency,
          reason,
          status: 'pending',
          providerRefundId,
          processedAt: new Date(),
        },
      });

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: refundAmount === payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
          refundedAt: new Date(),
        },
      });

      await notificationService.createNotification({
        userId: payment.transaction.buyerId,
        type: 'TRANSACTION',
        title: 'Återbetalning påbörjad',
        content: `Återbetalning av ${this.stripeService.formatAmountForCurrency(refundAmount, payment.currency)} har påbörjats`,
        data: {
          paymentId,
          refundAmount,
          currency: payment.currency,
        },
        channel: 'EMAIL',
      });

    } catch (error) {
      console.error('Refund creation failed:', error);
      throw new Error(`Failed to create refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPaymentsByTransaction(transactionId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentsByUser(userId: string, limit = 50, offset = 0): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        transaction: {
          include: {
            listing: true,
          },
        },
      },
    });
  }

  private async updateTransactionStatus(transactionId: string, status: TransactionStatus): Promise<void> {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    });
  }

  private async fundEscrowAccount(escrowAccountId: string, amount: number): Promise<void> {
    await prisma.escrowAccount.update({
      where: { id: escrowAccountId },
      data: {
        fundedAmount: amount,
        status: EscrowStatus.FUNDED,
        fundedAt: new Date(),
      },
    });
  }

  async calculatePaymentFees(amount: number, paymentMethod: PaymentMethod, currency: Currency): Promise<{
    baseAmount: number;
    feeAmount: number;
    totalAmount: number;
  }> {
    let feePercentage = 0;
    let fixedFee = 0;

    switch (paymentMethod) {
      case PaymentMethod.STRIPE_CARD:
        feePercentage = 2.9; // 2.9% for European cards
        fixedFee = currency === Currency.SEK ? 1.8 : 
                   currency === Currency.EUR ? 0.25 : 
                   currency === Currency.NOK ? 2.0 :
                   currency === Currency.DKK ? 1.8 : 0.30;
        break;
      case PaymentMethod.STRIPE_SEPA:
        feePercentage = 0.8;
        fixedFee = 0.25;
        break;
      case PaymentMethod.SWISH:
        feePercentage = 1.2;
        fixedFee = 1.0;
        break;
      case PaymentMethod.MOBILEPAY:
        feePercentage = 1.45;
        fixedFee = 0.0;
        break;
      case PaymentMethod.VIPPS:
        feePercentage = 1.4;
        fixedFee = 1.0;
        break;
      default:
        feePercentage = 2.0;
        fixedFee = 1.0;
    }

    const feeAmount = Math.round((amount * (feePercentage / 100) + fixedFee) * 100) / 100;
    const totalAmount = amount + feeAmount;

    return {
      baseAmount: amount,
      feeAmount,
      totalAmount,
    };
  }
}

export { PaymentService };