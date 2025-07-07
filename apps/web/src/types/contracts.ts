// Enhanced Contract Types for Professional Heart Avtal System

export type ContractStatus = 
  | 'draft' 
  | 'pending_verification' 
  | 'verification_complete' 
  | 'pending_signatures' 
  | 'partially_signed' 
  | 'fully_signed' 
  | 'escrow_secured' 
  | 'pending_platform_approval' 
  | 'platform_approved' 
  | 'funds_released' 
  | 'completed' 
  | 'cancelled' 
  | 'disputed';

export type EscrowStatus = 
  | 'none' 
  | 'initiating' 
  | 'secured' 
  | 'pending_release' 
  | 'released' 
  | 'refunded' 
  | 'disputed';

export type VerificationStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'verified' 
  | 'failed' 
  | 'expired';

export type ContractType = 
  | 'business_purchase' 
  | 'business_sale' 
  | 'asset_transfer' 
  | 'partnership' 
  | 'nda' 
  | 'investment' 
  | 'service_agreement' 
  | 'licensing';

export interface PartyVerification {
  idVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  bankAccountVerified: boolean;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  kycStatus: VerificationStatus;
  verifiedAt?: string;
  verificationDocuments: string[];
}

export interface DigitalSignature {
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  signatureHash: string;
  certificateId?: string;
  witnessSignature?: boolean;
  signatureMethod: 'digital' | 'biometric' | 'sms' | 'bankid';
}

export interface ContractParty {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'witness' | 'guarantor';
  organization?: string;
  organizationNumber?: string;
  signed: boolean;
  signature?: DigitalSignature;
  verification: PartyVerification;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface EscrowDetails {
  status: EscrowStatus;
  amount: number;
  currency: string;
  accountId: string;
  securedAt?: string;
  releaseConditions: string[];
  releaseApprovals: {
    buyer: boolean;
    seller: boolean;
    platform: boolean;
    witness?: boolean;
  };
  releasedAt?: string;
  transactionId?: string;
  fees: {
    platformFee: number;
    escrowFee: number;
    paymentProcessingFee: number;
  };
}

export interface LegalCompliance {
  jurisdiction: string;
  applicableLaw: string;
  disputeResolution: {
    method: 'arbitration' | 'mediation' | 'court';
    location: string;
    language: string;
  };
  dataProtection: {
    gdprCompliant: boolean;
    dataRetentionPeriod: number;
    consentGiven: boolean;
  };
  auditTrail: Array<{
    timestamp: string;
    action: string;
    userId: string;
    details: string;
    ipAddress: string;
  }>;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  type: ContractType;
  clauses: Array<{
    id: string;
    title: string;
    content: string;
    required: boolean;
    category: string;
  }>;
  customFields: Array<{
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'select';
    required: boolean;
    options?: string[];
  }>;
}

export interface ContractDocument {
  id: string;
  name: string;
  type: 'contract' | 'addendum' | 'schedule' | 'supporting_document';
  url: string;
  hash: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
}

export interface PlatformApproval {
  required: boolean;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'escalated';
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  conditions?: string[];
  comments?: string;
  escalationReason?: string;
}

export interface EnhancedContract {
  // Basic Information
  id: string;
  title: string;
  description: string;
  type: ContractType;
  status: ContractStatus;
  version: number;
  
  // Financial Details
  amount?: number;
  currency: string;
  paymentTerms: string;
  escrow: EscrowDetails;
  
  // Parties
  parties: ContractParty[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  
  // Documents & Legal
  documents: ContractDocument[];
  template?: ContractTemplate;
  legalCompliance: LegalCompliance;
  
  // Platform Features
  platformApproval: PlatformApproval;
  autoCreated: boolean;
  
  // Listing Integration
  listingId?: string;
  listingDetails?: {
    title: string;
    description: string;
    price: number;
    category: string;
    seller: string;
  };
  
  // Metadata
  metadata: {
    priorityLevel: 'low' | 'medium' | 'high' | 'urgent';
    tags: string[];
    notes: string;
    internalReference?: string;
  };
}

export interface ContractWorkflow {
  id: string;
  contractId: string;
  currentStep: number;
  steps: Array<{
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
    assignedTo?: string;
    completedAt?: string;
    requirements: string[];
    automatable: boolean;
  }>;
  notifications: Array<{
    id: string;
    type: 'email' | 'sms' | 'push' | 'in_app';
    recipient: string;
    content: string;
    scheduledFor: string;
    sent: boolean;
    sentAt?: string;
  }>;
}

// Service Interfaces
export interface ContractService {
  createContract(data: Partial<EnhancedContract>): Promise<EnhancedContract>;
  updateContract(id: string, updates: Partial<EnhancedContract>): Promise<EnhancedContract>;
  getContract(id: string): Promise<EnhancedContract>;
  getUserContracts(userId: string): Promise<EnhancedContract[]>;
  signContract(contractId: string, partyId: string, signature: DigitalSignature): Promise<void>;
  verifyParty(contractId: string, partyId: string): Promise<void>;
  approveContract(contractId: string, approvalData: Partial<PlatformApproval>): Promise<void>;
  initiateEscrow(contractId: string): Promise<void>;
  releaseEscrow(contractId: string, approvals: Record<string, boolean>): Promise<void>;
}

export interface NotificationService {
  sendContractNotification(contractId: string, type: string, recipients: string[]): Promise<void>;
  scheduleReminder(contractId: string, reminderDate: string, message: string): Promise<void>;
  sendStatusUpdate(contractId: string, newStatus: ContractStatus): Promise<void>;
}

export interface VerificationService {
  verifyIdentity(partyId: string, documents: File[]): Promise<VerificationStatus>;
  verifyBankAccount(partyId: string, accountDetails: any): Promise<boolean>;
  sendVerificationCode(email: string, phone: string): Promise<string>;
  verifyCode(code: string, reference: string): Promise<boolean>;
}

export interface EscrowService {
  createEscrowAccount(contractId: string, amount: number, currency: string): Promise<string>;
  secureEscrow(accountId: string, paymentMethod: any): Promise<void>;
  releaseEscrow(accountId: string, recipient: string): Promise<string>;
  refundEscrow(accountId: string, reason: string): Promise<string>;
  getEscrowStatus(accountId: string): Promise<EscrowStatus>;
}