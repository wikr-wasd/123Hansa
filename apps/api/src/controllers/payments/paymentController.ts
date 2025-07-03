import { Request, Response } from 'express';
import { PaymentService } from '../../services/payments/paymentService';
import { Currency, PaymentMethod } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/auth';

const paymentService = new PaymentService();

export const createPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId, amount, currency, paymentMethod, description, metadata } = req.body;
    const userId = req.user!.id;

    if (!transactionId || !amount || !currency || !paymentMethod) {
      return res.status(400).json({
        error: 'Missing required fields: transactionId, amount, currency, paymentMethod'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    if (!Object.values(Currency).includes(currency)) {
      return res.status(400).json({
        error: 'Invalid currency'
      });
    }

    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      return res.status(400).json({
        error: 'Invalid payment method'
      });
    }

    const result = await paymentService.createPayment({
      transactionId,
      userId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      description,
      metadata,
    });

    res.status(201).json({
      success: true,
      data: {
        paymentId: result.payment.id,
        clientSecret: result.clientSecret,
        requiresAction: result.requiresAction,
        nextAction: result.nextAction,
        status: result.payment.status,
      },
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create payment'
    });
  }
};

export const processPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethodId, returnUrl } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        error: 'Payment ID is required'
      });
    }

    const result = await paymentService.processPayment({
      paymentId,
      paymentMethodId,
      returnUrl,
    });

    res.json({
      success: true,
      data: {
        paymentId: result.payment.id,
        status: result.payment.status,
        requiresAction: result.requiresAction,
        nextAction: result.nextAction,
      },
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process payment'
    });
  }
};

export const getPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user!.id;

    if (!paymentId) {
      return res.status(400).json({
        error: 'Payment ID is required'
      });
    }

    const payment = await paymentService.getPaymentsByTransaction(paymentId);
    
    if (!payment || payment.length === 0) {
      return res.status(404).json({
        error: 'Payment not found'
      });
    }

    const userPayment = payment.find(p => p.userId === userId);
    if (!userPayment) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: userPayment,
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment'
    });
  }
};

export const getPaymentsByTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user!.id;

    if (!transactionId) {
      return res.status(400).json({
        error: 'Transaction ID is required'
      });
    }

    const payments = await paymentService.getPaymentsByTransaction(transactionId);
    
    const userPayments = payments.filter(payment => payment.userId === userId);

    res.json({
      success: true,
      data: userPayments,
    });
  } catch (error) {
    console.error('Get payments by transaction error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payments'
    });
  }
};

export const getUserPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (limit > 100) {
      return res.status(400).json({
        error: 'Limit cannot exceed 100'
      });
    }

    const payments = await paymentService.getPaymentsByUser(userId, limit, offset);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          limit,
          offset,
          hasMore: payments.length === limit,
        },
      },
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user payments'
    });
  }
};

export const createRefund = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user!.id;

    if (!paymentId) {
      return res.status(400).json({
        error: 'Payment ID is required'
      });
    }

    if (!reason) {
      return res.status(400).json({
        error: 'Reason is required for refund'
      });
    }

    if (amount && amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    await paymentService.createRefund({
      paymentId,
      amount: amount ? parseFloat(amount) : undefined,
      reason,
      requestedBy: userId,
    });

    res.json({
      success: true,
      message: 'Refund created successfully',
    });
  } catch (error) {
    console.error('Create refund error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create refund'
    });
  }
};

export const calculatePaymentFees = async (req: Request, res: Response) => {
  try {
    const { amount, paymentMethod, currency } = req.query;

    if (!amount || !paymentMethod || !currency) {
      return res.status(400).json({
        error: 'Missing required parameters: amount, paymentMethod, currency'
      });
    }

    const amountNum = parseFloat(amount as string);
    if (amountNum <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    if (!Object.values(Currency).includes(currency as Currency)) {
      return res.status(400).json({
        error: 'Invalid currency'
      });
    }

    if (!Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)) {
      return res.status(400).json({
        error: 'Invalid payment method'
      });
    }

    const fees = await paymentService.calculatePaymentFees(
      amountNum,
      paymentMethod as PaymentMethod,
      currency as Currency
    );

    res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    console.error('Calculate payment fees error:', error);
    res.status(500).json({
      error: 'Failed to calculate payment fees'
    });
  }
};