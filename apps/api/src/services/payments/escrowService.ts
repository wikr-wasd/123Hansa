import { PrismaClient, EscrowAccount, EscrowStatus, TransactionStatus, Currency, Transaction } from '@prisma/client';
import StripeService from './stripeService';
import { notificationService } from '../notificationService';

const prisma = new PrismaClient();

interface CreateEscrowParams {
  transactionId: string;
  userId: string;
  amount: number;
  currency: Currency;
  autoReleaseAfterDays?: number;
  releaseConditions?: Record<string, any>;
}

interface ReleaseEscrowParams {
  escrowAccountId: string;
  amount?: number; // For partial releases
  releasedBy: string;
  reason?: string;
}

interface RefundEscrowParams {
  escrowAccountId: string;
  amount?: number; // For partial refunds
  refundedBy: string;
  reason: string;
}

class EscrowService {
  private stripeService: StripeService;

  constructor() {
    this.stripeService = new StripeService();
  }

  async createEscrowAccount(params: CreateEscrowParams): Promise<EscrowAccount> {
    const { transactionId, userId, amount, currency, autoReleaseAfterDays = 14, releaseConditions } = params;

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

      // Verify user is involved in the transaction
      if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
        throw new Error('User not authorized for this transaction');
      }

      // Check if escrow account already exists
      const existingEscrow = await prisma.escrowAccount.findUnique({
        where: { transactionId },
      });

      if (existingEscrow) {
        throw new Error('Escrow account already exists for this transaction');
      }

      // Calculate auto-release date
      const autoReleaseAt = new Date();
      autoReleaseAt.setDate(autoReleaseAt.getDate() + autoReleaseAfterDays);

      // Create Stripe Connect account for escrow if not exists
      let stripeAccountId: string | undefined;
      try {
        const stripeAccount = await this.stripeService.createCustomer({
          email: `escrow-${transactionId}@123hansa.se`,
          name: `Escrow Account ${transactionId}`,
          metadata: {
            type: 'escrow_account',
            transactionId,
            buyerId: transaction.buyerId,
            sellerId: transaction.sellerId,
          },
        });
        stripeAccountId = stripeAccount.id;
      } catch (error) {
        console.warn('Failed to create Stripe escrow account:', error);
        // Continue without Stripe account - manual escrow handling
      }

      const escrowAccount = await prisma.escrowAccount.create({
        data: {
          transactionId,
          userId: transaction.sellerId, // Escrow is held for the seller
          escrowAmount: amount,
          currency,
          status: EscrowStatus.CREATED,
          autoReleaseAt,
          releaseConditions: releaseConditions || {},
          stripeAccountId,
        },
      });

      // Update transaction with escrow account
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          escrowAccountId: escrowAccount.id,
        },
      });

      // Notify involved parties
      await notificationService.createNotification({
        userId: transaction.sellerId,
        type: 'TRANSACTION',
        title: 'Escrow-konto skapad',
        content: `Ett escrow-konto har skapats för transaktionen av ${transaction.listing.title}`,
        data: {
          transactionId,
          escrowAccountId: escrowAccount.id,
          amount,
          currency,
          autoReleaseAt,
        },
        channel: 'EMAIL',
      });

      await notificationService.createNotification({
        userId: transaction.buyerId,
        type: 'TRANSACTION',
        title: 'Escrow-konto skapad',
        content: `Dina medel för ${transaction.listing.title} kommer att hållas säkert i escrow`,
        data: {
          transactionId,
          escrowAccountId: escrowAccount.id,
          amount,
          currency,
          autoReleaseAt,
        },
        channel: 'EMAIL',
      });

      return escrowAccount;
    } catch (error) {
      console.error('Escrow account creation failed:', error);
      throw new Error(`Failed to create escrow account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fundEscrowAccount(escrowAccountId: string, amount: number): Promise<EscrowAccount> {
    try {
      const escrowAccount = await prisma.escrowAccount.findUnique({
        where: { id: escrowAccountId },
        include: {
          transactions: {
            include: {
              buyer: true,
              seller: true,
              listing: true,
            },
          },
        },
      });

      if (!escrowAccount) {
        throw new Error('Escrow account not found');
      }

      if (escrowAccount.status !== EscrowStatus.CREATED) {
        throw new Error('Escrow account is not in a state to receive funds');
      }

      const newFundedAmount = escrowAccount.fundedAmount + amount;

      if (newFundedAmount > escrowAccount.escrowAmount) {
        throw new Error('Funded amount cannot exceed escrow amount');
      }

      const updatedEscrowAccount = await prisma.escrowAccount.update({
        where: { id: escrowAccountId },
        data: {
          fundedAmount: newFundedAmount,
          status: newFundedAmount >= escrowAccount.escrowAmount ? EscrowStatus.FUNDED : EscrowStatus.CREATED,
          fundedAt: newFundedAmount >= escrowAccount.escrowAmount ? new Date() : undefined,
        },
      });

      // If fully funded, update transaction status
      if (newFundedAmount >= escrowAccount.escrowAmount) {
        await prisma.transaction.updateMany({
          where: { escrowAccountId },
          data: {
            status: TransactionStatus.ESCROW_FUNDED,
            escrowFundedAt: new Date(),
          },
        });

        // Notify seller that escrow is funded
        const transaction = escrowAccount.transactions[0];
        if (transaction) {
          await notificationService.createNotification({
            userId: transaction.sellerId,
            type: 'TRANSACTION',
            title: 'Escrow är finansierat',
            content: `Medel för ${transaction.listing.title} har placerats i escrow`,
            data: {
              transactionId: transaction.id,
              escrowAccountId,
              amount: updatedEscrowAccount.escrowAmount,
              currency: updatedEscrowAccount.currency,
            },
            channel: 'EMAIL',
          });
        }
      }

      return updatedEscrowAccount;
    } catch (error) {
      console.error('Escrow funding failed:', error);
      throw new Error(`Failed to fund escrow account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async releaseEscrowFunds(params: ReleaseEscrowParams): Promise<EscrowAccount> {
    const { escrowAccountId, amount, releasedBy, reason } = params;

    try {
      const escrowAccount = await prisma.escrowAccount.findUnique({
        where: { id: escrowAccountId },
        include: {
          transactions: {
            include: {
              buyer: true,
              seller: true,
              listing: true,
            },
          },
        },
      });

      if (!escrowAccount) {
        throw new Error('Escrow account not found');
      }

      if (escrowAccount.status !== EscrowStatus.FUNDED) {
        throw new Error('Escrow account is not funded and cannot be released');
      }

      const transaction = escrowAccount.transactions[0];
      if (!transaction) {
        throw new Error('No transaction associated with this escrow account');
      }

      // Verify authorization to release funds
      const isAuthorized = 
        releasedBy === transaction.buyerId || // Buyer can release funds
        releasedBy === transaction.sellerId || // Seller can request release (admin approval needed)
        transaction.seller.role === 'ADMIN'; // Admin can release

      if (!isAuthorized) {
        throw new Error('Not authorized to release escrow funds');
      }

      const releaseAmount = amount || (escrowAccount.fundedAmount - escrowAccount.releasedAmount);
      const newReleasedAmount = escrowAccount.releasedAmount + releaseAmount;

      if (newReleasedAmount > escrowAccount.fundedAmount) {
        throw new Error('Release amount exceeds available funds');
      }

      // Determine new status
      let newStatus = EscrowStatus.PARTIAL_RELEASE;
      if (newReleasedAmount >= escrowAccount.fundedAmount) {
        newStatus = EscrowStatus.RELEASED;
      }

      const updatedEscrowAccount = await prisma.escrowAccount.update({
        where: { id: escrowAccountId },
        data: {
          releasedAmount: newReleasedAmount,
          status: newStatus,
          releasedAt: newStatus === EscrowStatus.RELEASED ? new Date() : undefined,
        },
      });

      // Update transaction status
      if (newStatus === EscrowStatus.RELEASED) {
        await prisma.transaction.updateMany({
          where: { escrowAccountId },
          data: {
            status: TransactionStatus.COMPLETED,
            completedAt: new Date(),
            escrowReleaseAt: new Date(),
          },
        });
      }

      // Create audit log
      await this.createEscrowAuditLog({
        escrowAccountId,
        action: 'RELEASE',
        amount: releaseAmount,
        performedBy: releasedBy,
        reason: reason || 'Funds released to seller',
        details: {
          totalReleased: newReleasedAmount,
          remainingFunds: escrowAccount.fundedAmount - newReleasedAmount,
        },
      });

      // Notify parties
      await notificationService.createNotification({
        userId: transaction.sellerId,
        type: 'TRANSACTION',
        title: 'Escrow-medel frisläppta',
        content: `${this.stripeService.formatAmountForCurrency(releaseAmount, escrowAccount.currency)} har frisläppts från escrow för ${transaction.listing.title}`,
        data: {
          transactionId: transaction.id,
          escrowAccountId,
          releaseAmount,
          currency: escrowAccount.currency,
        },
        channel: 'EMAIL',
      });

      await notificationService.createNotification({
        userId: transaction.buyerId,
        type: 'TRANSACTION',
        title: 'Transaktion slutförd',
        content: `Medel har frisläppts till säljaren för ${transaction.listing.title}`,
        data: {
          transactionId: transaction.id,
          escrowAccountId,
          releaseAmount,
          currency: escrowAccount.currency,
        },
        channel: 'EMAIL',
      });

      return updatedEscrowAccount;
    } catch (error) {
      console.error('Escrow release failed:', error);
      throw new Error(`Failed to release escrow funds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refundEscrowFunds(params: RefundEscrowParams): Promise<EscrowAccount> {
    const { escrowAccountId, amount, refundedBy, reason } = params;

    try {
      const escrowAccount = await prisma.escrowAccount.findUnique({
        where: { id: escrowAccountId },
        include: {
          transactions: {
            include: {
              buyer: true,
              seller: true,
              listing: true,
            },
          },
        },
      });

      if (!escrowAccount) {
        throw new Error('Escrow account not found');
      }

      if (escrowAccount.status !== EscrowStatus.FUNDED && escrowAccount.status !== EscrowStatus.PARTIAL_RELEASE) {
        throw new Error('Escrow account cannot be refunded in current status');
      }

      const transaction = escrowAccount.transactions[0];
      if (!transaction) {
        throw new Error('No transaction associated with this escrow account');
      }

      const refundAmount = amount || (escrowAccount.fundedAmount - escrowAccount.releasedAmount - escrowAccount.refundedAmount);
      const newRefundedAmount = escrowAccount.refundedAmount + refundAmount;

      if (newRefundedAmount > (escrowAccount.fundedAmount - escrowAccount.releasedAmount)) {
        throw new Error('Refund amount exceeds available funds');
      }

      const updatedEscrowAccount = await prisma.escrowAccount.update({
        where: { id: escrowAccountId },
        data: {
          refundedAmount: newRefundedAmount,
          status: EscrowStatus.REFUNDED,
        },
      });

      // Update transaction status
      await prisma.transaction.updateMany({
        where: { escrowAccountId },
        data: {
          status: TransactionStatus.REFUNDED,
          refundedAt: new Date(),
        },
      });

      // Create audit log
      await this.createEscrowAuditLog({
        escrowAccountId,
        action: 'REFUND',
        amount: refundAmount,
        performedBy: refundedBy,
        reason,
        details: {
          totalRefunded: newRefundedAmount,
          refundReason: reason,
        },
      });

      // Notify parties
      await notificationService.createNotification({
        userId: transaction.buyerId,
        type: 'TRANSACTION',
        title: 'Återbetalning från escrow',
        content: `${this.stripeService.formatAmountForCurrency(refundAmount, escrowAccount.currency)} har återbetalats från escrow för ${transaction.listing.title}`,
        data: {
          transactionId: transaction.id,
          escrowAccountId,
          refundAmount,
          currency: escrowAccount.currency,
          reason,
        },
        channel: 'EMAIL',
      });

      return updatedEscrowAccount;
    } catch (error) {
      console.error('Escrow refund failed:', error);
      throw new Error(`Failed to refund escrow funds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processAutoRelease(): Promise<void> {
    try {
      const expiredEscrows = await prisma.escrowAccount.findMany({
        where: {
          status: EscrowStatus.FUNDED,
          autoReleaseAt: {
            lte: new Date(),
          },
        },
        include: {
          transactions: {
            include: {
              buyer: true,
              seller: true,
              listing: true,
            },
          },
        },
      });

      for (const escrow of expiredEscrows) {
        const transaction = escrow.transactions[0];
        if (!transaction) continue;

        try {
          await this.releaseEscrowFunds({
            escrowAccountId: escrow.id,
            releasedBy: 'SYSTEM',
            reason: 'Automatic release after expiration period',
          });

          console.log(`Auto-released escrow ${escrow.id} for transaction ${transaction.id}`);
        } catch (error) {
          console.error(`Failed to auto-release escrow ${escrow.id}:`, error);
          
          // Notify admin of failed auto-release
          await notificationService.createNotification({
            userId: 'ADMIN', // System notification
            type: 'SYSTEM',
            title: 'Misslyckad automatisk frisläppning av escrow',
            content: `Kunde inte automatiskt frisläppa escrow ${escrow.id} för transaktion ${transaction.id}`,
            data: {
              escrowAccountId: escrow.id,
              transactionId: transaction.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            channel: 'EMAIL',
          });
        }
      }
    } catch (error) {
      console.error('Auto-release process failed:', error);
    }
  }

  async getEscrowAccount(escrowAccountId: string): Promise<EscrowAccount | null> {
    return prisma.escrowAccount.findUnique({
      where: { id: escrowAccountId },
      include: {
        transactions: {
          include: {
            buyer: true,
            seller: true,
            listing: true,
          },
        },
      },
    });
  }

  async getEscrowsByUser(userId: string): Promise<EscrowAccount[]> {
    return prisma.escrowAccount.findMany({
      where: {
        transactions: {
          some: {
            OR: [
              { buyerId: userId },
              { sellerId: userId },
            ],
          },
        },
      },
      include: {
        transactions: {
          include: {
            buyer: true,
            seller: true,
            listing: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async createEscrowAuditLog(params: {
    escrowAccountId: string;
    action: string;
    amount: number;
    performedBy: string;
    reason: string;
    details?: Record<string, any>;
  }): Promise<void> {
    // Implementation would create an audit log entry
    // For now, we'll just log to console
    console.log('Escrow audit log:', {
      ...params,
      timestamp: new Date().toISOString(),
    });
  }

  calculateEscrowFees(amount: number, currency: Currency): {
    baseAmount: number;
    escrowFee: number;
    totalAmount: number;
  } {
    // Escrow fee structure: 0.5% of transaction amount, minimum 10 SEK/NOK/DKK, 5 EUR
    const feePercentage = 0.5;
    const minimumFees = {
      SEK: 10,
      NOK: 10,
      DKK: 10,
      EUR: 5,
      USD: 5,
      GBP: 4,
    };

    const calculatedFee = amount * (feePercentage / 100);
    const escrowFee = Math.max(calculatedFee, minimumFees[currency] || 5);

    return {
      baseAmount: amount,
      escrowFee: Math.round(escrowFee * 100) / 100,
      totalAmount: Math.round((amount + escrowFee) * 100) / 100,
    };
  }
}

export { EscrowService };