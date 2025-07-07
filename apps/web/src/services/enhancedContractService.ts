import { 
  EnhancedContract, 
  ContractService, 
  NotificationService, 
  VerificationService, 
  EscrowService,
  ContractStatus,
  DigitalSignature,
  PlatformApproval,
  VerificationStatus
} from '../types/contracts';

class EnhancedContractServiceImpl implements ContractService {
  private baseUrl = '/api/contracts'; // This would be your actual API endpoint

  async createContract(data: Partial<EnhancedContract>): Promise<EnhancedContract> {
    try {
      // In a real implementation, this would make an API call
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create contract');
      }

      const contract = await response.json();
      
      // Add to audit trail
      await this.addAuditTrailEntry(contract.id, 'contract_created', 'Contract created successfully');
      
      // Send notifications
      await notificationService.sendContractNotification(
        contract.id, 
        'contract_created', 
        contract.parties.map((p: any) => p.email)
      );

      return contract;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  async updateContract(id: string, updates: Partial<EnhancedContract>): Promise<EnhancedContract> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update contract');
      }

      const contract = await response.json();
      
      // Add to audit trail
      await this.addAuditTrailEntry(id, 'contract_updated', `Contract updated: ${Object.keys(updates).join(', ')}`);
      
      return contract;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  async getContract(id: string): Promise<EnhancedContract> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get contract');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting contract:', error);
      throw error;
    }
  }

  async getUserContracts(userId: string): Promise<EnhancedContract[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user contracts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user contracts:', error);
      throw error;
    }
  }

  async signContract(contractId: string, partyId: string, signature: DigitalSignature): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${contractId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ partyId, signature })
      });

      if (!response.ok) {
        throw new Error('Failed to sign contract');
      }

      // Add to audit trail
      await this.addAuditTrailEntry(contractId, 'contract_signed', `Contract signed by party ${partyId}`);
      
      // Check if all parties have signed
      const contract = await this.getContract(contractId);
      const allSigned = contract.parties.every(p => p.signed);
      
      if (allSigned) {
        await this.updateContractStatus(contractId, 'fully_signed');
        
        // Initiate escrow if applicable
        if (contract.amount && contract.amount > 0) {
          await escrowService.createEscrowAccount(contractId, contract.amount, contract.currency);
        }
      }

    } catch (error) {
      console.error('Error signing contract:', error);
      throw error;
    }
  }

  async verifyParty(contractId: string, partyId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${contractId}/verify/${partyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify party');
      }

      // Add to audit trail
      await this.addAuditTrailEntry(contractId, 'party_verified', `Party ${partyId} verification completed`);
      
      // Check if all parties are verified
      const contract = await this.getContract(contractId);
      const allVerified = contract.parties.every(p => p.verification.kycStatus === 'verified');
      
      if (allVerified) {
        await this.updateContractStatus(contractId, 'verification_complete');
      }

    } catch (error) {
      console.error('Error verifying party:', error);
      throw error;
    }
  }

  async approveContract(contractId: string, approvalData: Partial<PlatformApproval>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${contractId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(approvalData)
      });

      if (!response.ok) {
        throw new Error('Failed to approve contract');
      }

      // Add to audit trail
      await this.addAuditTrailEntry(contractId, 'contract_approved', `Contract approved by platform`);
      
      await this.updateContractStatus(contractId, 'platform_approved');

    } catch (error) {
      console.error('Error approving contract:', error);
      throw error;
    }
  }

  async initiateEscrow(contractId: string): Promise<void> {
    try {
      const contract = await this.getContract(contractId);
      
      if (!contract.amount || contract.amount <= 0) {
        throw new Error('No amount specified for escrow');
      }

      const accountId = await escrowService.createEscrowAccount(
        contractId, 
        contract.amount, 
        contract.currency
      );

      await this.updateContract(contractId, {
        escrow: {
          ...contract.escrow,
          status: 'secured',
          accountId,
          securedAt: new Date().toISOString()
        }
      });

      // Add to audit trail
      await this.addAuditTrailEntry(contractId, 'escrow_initiated', `Escrow account created: ${accountId}`);

    } catch (error) {
      console.error('Error initiating escrow:', error);
      throw error;
    }
  }

  async releaseEscrow(contractId: string, approvals: Record<string, boolean>): Promise<void> {
    try {
      const contract = await this.getContract(contractId);
      
      // Verify all required approvals
      const requiredApprovals = ['buyer', 'seller', 'platform'];
      const hasAllApprovals = requiredApprovals.every(approval => approvals[approval]);
      
      if (!hasAllApprovals) {
        throw new Error('Missing required approvals for escrow release');
      }

      // Get seller party for recipient
      const seller = contract.parties.find(p => p.role === 'seller');
      if (!seller) {
        throw new Error('Seller not found');
      }

      const transactionId = await escrowService.releaseEscrow(
        contract.escrow.accountId, 
        seller.id
      );

      await this.updateContract(contractId, {
        escrow: {
          ...contract.escrow,
          status: 'released',
          releasedAt: new Date().toISOString(),
          transactionId,
          releaseApprovals: approvals
        },
        status: 'funds_released',
        completedAt: new Date().toISOString()
      });

      // Add to audit trail
      await this.addAuditTrailEntry(contractId, 'escrow_released', `Escrow released - Transaction ID: ${transactionId}`);
      
      // Send completion notifications
      await notificationService.sendContractNotification(
        contractId, 
        'contract_completed', 
        contract.parties.map(p => p.email)
      );

    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw error;
    }
  }

  private async updateContractStatus(contractId: string, status: ContractStatus): Promise<void> {
    await this.updateContract(contractId, { 
      status, 
      updatedAt: new Date().toISOString() 
    });
    
    await notificationService.sendStatusUpdate(contractId, status);
  }

  private async addAuditTrailEntry(contractId: string, action: string, details: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/${contractId}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          action,
          details,
          userId: 'current_user', // Get from auth context
          ipAddress: 'unknown' // Get from request
        })
      });
    } catch (error) {
      console.error('Error adding audit trail entry:', error);
    }
  }
}

class NotificationServiceImpl implements NotificationService {
  private baseUrl = '/api/notifications';

  async sendContractNotification(contractId: string, type: string, recipients: string[]): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          contractId,
          type,
          recipients,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error sending contract notification:', error);
    }
  }

  async scheduleReminder(contractId: string, reminderDate: string, message: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          contractId,
          reminderDate,
          message,
          scheduledAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }
  }

  async sendStatusUpdate(contractId: string, newStatus: ContractStatus): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/status-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          contractId,
          newStatus,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error sending status update:', error);
    }
  }
}

class VerificationServiceImpl implements VerificationService {
  private baseUrl = '/api/verification';

  async verifyIdentity(partyId: string, documents: File[]): Promise<VerificationStatus> {
    try {
      const formData = new FormData();
      formData.append('partyId', partyId);
      documents.forEach((doc, index) => {
        formData.append(`document_${index}`, doc);
      });

      const response = await fetch(`${this.baseUrl}/identity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Identity verification failed');
      }

      const result = await response.json();
      return result.status;

    } catch (error) {
      console.error('Error verifying identity:', error);
      return 'failed';
    }
  }

  async verifyBankAccount(partyId: string, accountDetails: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/bank-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ partyId, accountDetails })
      });

      if (!response.ok) {
        throw new Error('Bank account verification failed');
      }

      const result = await response.json();
      return result.verified;

    } catch (error) {
      console.error('Error verifying bank account:', error);
      return false;
    }
  }

  async sendVerificationCode(email: string, phone: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ email, phone })
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }

      const result = await response.json();
      return result.reference;

    } catch (error) {
      console.error('Error sending verification code:', error);
      throw error;
    }
  }

  async verifyCode(code: string, reference: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ code, reference })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.verified;

    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    }
  }
}

class EscrowServiceImpl implements EscrowService {
  private baseUrl = '/api/escrow';

  async createEscrowAccount(contractId: string, amount: number, currency: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ contractId, amount, currency })
      });

      if (!response.ok) {
        throw new Error('Failed to create escrow account');
      }

      const result = await response.json();
      return result.accountId;

    } catch (error) {
      console.error('Error creating escrow account:', error);
      throw error;
    }
  }

  async secureEscrow(accountId: string, paymentMethod: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${accountId}/secure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ paymentMethod })
      });

      if (!response.ok) {
        throw new Error('Failed to secure escrow');
      }

    } catch (error) {
      console.error('Error securing escrow:', error);
      throw error;
    }
  }

  async releaseEscrow(accountId: string, recipient: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/${accountId}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ recipient })
      });

      if (!response.ok) {
        throw new Error('Failed to release escrow');
      }

      const result = await response.json();
      return result.transactionId;

    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw error;
    }
  }

  async refundEscrow(accountId: string, reason: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/${accountId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to refund escrow');
      }

      const result = await response.json();
      return result.refundId;

    } catch (error) {
      console.error('Error refunding escrow:', error);
      throw error;
    }
  }

  async getEscrowStatus(accountId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${accountId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get escrow status');
      }

      return await response.json();

    } catch (error) {
      console.error('Error getting escrow status:', error);
      throw error;
    }
  }
}

// Export service instances
export const contractService = new EnhancedContractServiceImpl();
export const notificationService = new NotificationServiceImpl();
export const verificationService = new VerificationServiceImpl();
export const escrowService = new EscrowServiceImpl();

// Export utility functions
export const formatContractStatus = (status: ContractStatus): string => {
  const statusMap = {
    'draft': 'Utkast',
    'pending_verification': 'Väntar på verifiering',
    'verification_complete': 'Verifiering klar',
    'pending_signatures': 'Väntar på signaturer',
    'partially_signed': 'Delvis signerat',
    'fully_signed': 'Fullt signerat',
    'escrow_secured': 'Escrow säkrat',
    'pending_platform_approval': 'Väntar på godkännande',
    'platform_approved': 'Plattformsgodkänt',
    'funds_released': 'Medel överförda',
    'completed': 'Slutfört',
    'cancelled': 'Avbrutet',
    'disputed': 'Tvist'
  };
  return statusMap[status] || status;
};

export const calculateContractFees = (amount: number) => {
  const platformFee = amount * 0.03; // 3%
  const escrowFee = amount * 0.005; // 0.5%
  const paymentProcessingFee = amount * 0.015; // 1.5%
  const totalFees = platformFee + escrowFee + paymentProcessingFee;
  
  return {
    platformFee,
    escrowFee,
    paymentProcessingFee,
    totalFees,
    netAmount: amount - totalFees
  };
};

export const validateContractData = (data: Partial<EnhancedContract>): string[] => {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Titel måste vara minst 3 tecken');
  }
  
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Beskrivning måste vara minst 10 tecken');
  }
  
  if (!data.parties || data.parties.length < 2) {
    errors.push('Minst två parter krävs');
  }
  
  if (data.amount && data.amount < 0) {
    errors.push('Belopp kan inte vara negativt');
  }
  
  if (data.dueDate && new Date(data.dueDate) < new Date()) {
    errors.push('Förfallodatum kan inte vara i det förflutna');
  }
  
  return errors;
};