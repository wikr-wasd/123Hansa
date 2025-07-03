import { Request, Response } from 'express';
import { PaymentService } from '../../services/payments/paymentService';
import { NordicPaymentService } from '../../services/payments/nordicPaymentService';
import { EscrowService } from '../../services/payments/escrowService';
import StripeService from '../../services/payments/stripeService';
import { PrismaClient, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();
const paymentService = new PaymentService();
const nordicPaymentService = new NordicPaymentService();
const escrowService = new EscrowService();
const stripeService = new StripeService();

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'No Stripe signature found' });
  }

  try {
    const event = await stripeService.processWebhook(req.body, signature);

    if (!stripeService.isWebhookEventValid(event)) {
      console.warn(`Unhandled Stripe webhook event type: ${event.type}`);
      return res.status(200).json({ received: true });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;
      
      case 'payment_intent.requires_action':
        await handlePaymentIntentRequiresAction(event);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event);
        break;
      
      case 'refund.created':
        await handleRefundCreated(event);
        break;
      
      case 'refund.updated':
        await handleRefundUpdated(event);
        break;
      
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing failed:', error);
    res.status(400).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleSwishWebhook = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const webhookData = req.body;

    // Verify webhook authenticity (implement based on Swish documentation)
    // This is a simplified version
    
    const payment = await prisma.payment.findFirst({
      where: { swishPaymentId: paymentId },
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
      return res.status(404).json({ error: 'Payment not found' });
    }

    const newStatus = nordicPaymentService.mapNordicStatusToPaymentStatus('swish', webhookData.status);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        authorizedAt: newStatus === PaymentStatus.SUCCEEDED ? new Date() : undefined,
        capturedAt: newStatus === PaymentStatus.SUCCEEDED ? new Date() : undefined,
        failedAt: newStatus === PaymentStatus.FAILED ? new Date() : undefined,
        failureReason: webhookData.errorMessage || undefined,
        providerResponse: webhookData,
      },
    });

    if (newStatus === PaymentStatus.SUCCEEDED) {
      await paymentService.handleSuccessfulPayment(payment.id);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Swish webhook processing failed:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleMobilePayWebhook = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const webhookData = req.body;

    const payment = await prisma.payment.findFirst({
      where: { mobilepayPaymentId: paymentId },
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
      return res.status(404).json({ error: 'Payment not found' });
    }

    const newStatus = nordicPaymentService.mapNordicStatusToPaymentStatus('mobilepay', webhookData.type);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        authorizedAt: newStatus === PaymentStatus.SUCCEEDED ? new Date() : undefined,
        capturedAt: newStatus === PaymentStatus.SUCCEEDED ? new Date() : undefined,
        failedAt: newStatus === PaymentStatus.FAILED ? new Date() : undefined,
        failureReason: webhookData.errorDescription || undefined,
        providerResponse: webhookData,
      },
    });

    if (newStatus === PaymentStatus.SUCCEEDED) {
      await paymentService.handleSuccessfulPayment(payment.id);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('MobilePay webhook processing failed:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleVippsWebhook = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const webhookData = req.body;

    const payment = await prisma.payment.findFirst({
      where: { vippsPaymentId: paymentId },
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
      return res.status(404).json({ error: 'Payment not found' });
    }

    const newStatus = nordicPaymentService.mapNordicStatusToPaymentStatus('vipps', webhookData.transactionInfo?.status);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        authorizedAt: newStatus === PaymentStatus.SUCCEEDED ? new Date() : undefined,
        capturedAt: newStatus === PaymentStatus.SUCCEEDED ? new Date() : undefined,
        failedAt: newStatus === PaymentStatus.FAILED ? new Date() : undefined,
        failureReason: webhookData.transactionInfo?.errorMessage || undefined,
        providerResponse: webhookData,
      },
    });

    if (newStatus === PaymentStatus.SUCCEEDED) {
      await paymentService.handleSuccessfulPayment(payment.id);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Vipps webhook processing failed:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Stripe webhook handlers
async function handlePaymentIntentSucceeded(event: any): Promise<void> {
  const paymentIntent = event.data.object;
  
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!payment) {
    console.error(`Payment not found for Stripe PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.SUCCEEDED,
      authorizedAt: new Date(),
      capturedAt: new Date(),
      providerResponse: paymentIntent,
    },
  });

  await paymentService.handleSuccessfulPayment(payment.id);
}

async function handlePaymentIntentFailed(event: any): Promise<void> {
  const paymentIntent = event.data.object;
  
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!payment) {
    console.error(`Payment not found for Stripe PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.FAILED,
      failedAt: new Date(),
      failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      providerResponse: paymentIntent,
    },
  });

  // Update transaction status
  await prisma.transaction.update({
    where: { id: payment.transactionId },
    data: { status: 'PAYMENT_FAILED' },
  });
}

async function handlePaymentIntentRequiresAction(event: any): Promise<void> {
  const paymentIntent = event.data.object;
  
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!payment) {
    console.error(`Payment not found for Stripe PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.REQUIRES_ACTION,
      providerResponse: paymentIntent,
    },
  });
}

async function handlePaymentIntentCanceled(event: any): Promise<void> {
  const paymentIntent = event.data.object;
  
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!payment) {
    console.error(`Payment not found for Stripe PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.CANCELLED,
      providerResponse: paymentIntent,
    },
  });

  // Update transaction status
  await prisma.transaction.update({
    where: { id: payment.transactionId },
    data: { status: 'CANCELLED' },
  });
}

async function handleRefundCreated(event: any): Promise<void> {
  const refund = event.data.object;
  
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: refund.payment_intent },
  });

  if (!payment) {
    console.error(`Payment not found for Stripe refund: ${refund.id}`);
    return;
  }

  await prisma.paymentRefund.upsert({
    where: { providerRefundId: refund.id },
    update: {
      status: refund.status,
      providerResponse: refund,
    },
    create: {
      paymentId: payment.id,
      amount: refund.amount / 100, // Convert from cents
      currency: refund.currency.toUpperCase(),
      reason: refund.reason || 'Refund processed',
      status: refund.status,
      providerRefundId: refund.id,
      providerResponse: refund,
      processedAt: new Date(),
    },
  });

  // Update payment status if fully refunded
  const totalRefunded = await prisma.paymentRefund.aggregate({
    where: { paymentId: payment.id },
    _sum: { amount: true },
  });

  const totalRefundAmount = totalRefunded._sum.amount || 0;
  
  if (totalRefundAmount >= payment.amount) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      },
    });
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PARTIALLY_REFUNDED,
      },
    });
  }
}

async function handleRefundUpdated(event: any): Promise<void> {
  const refund = event.data.object;
  
  await prisma.paymentRefund.updateMany({
    where: { providerRefundId: refund.id },
    data: {
      status: refund.status,
      providerResponse: refund,
    },
  });
}