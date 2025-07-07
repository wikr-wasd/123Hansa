import React, { useState, useEffect } from 'react';
import { 
  FileSignature, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Eye,
  Send,
  Lock,
  Users,
  CreditCard,
  Gavel,
  FileText,
  Phone,
  Mail,
  Fingerprint,
  Building2,
  Award,
  Bell,
  ArrowRight,
  X,
  Plus,
  Edit3,
  Camera,
  Upload,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';
import { 
  EnhancedContract, 
  ContractStatus, 
  ContractParty, 
  EscrowStatus,
  DigitalSignature,
  PlatformApproval,
  ContractType 
} from '../../types/contracts';

interface EnhancedHeartContractProps {
  listingId?: string;
  contractType?: ContractType;
  onContractCreated?: (contract: EnhancedContract) => void;
  initialData?: Partial<EnhancedContract>;
}

export const EnhancedHeartContract: React.FC<EnhancedHeartContractProps> = ({
  listingId,
  contractType = 'business_purchase',
  onContractCreated,
  initialData
}) => {
  const { user: authUser } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [contracts, setContracts] = useState<EnhancedContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<EnhancedContract | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // Form state for new contract
  const [contractForm, setContractForm] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'SEK',
    buyerEmail: '',
    sellerEmail: '',
    dueDate: '',
    paymentTerms: '30 dagar från signering',
    specialConditions: '',
    requiresPlatformApproval: true,
    requiresVerification: true,
    autoReleaseEscrow: false
  });

  const [verificationForm, setVerificationForm] = useState({
    idDocument: null as File | null,
    bankAccountNumber: '',
    phoneNumber: '',
    smsCode: '',
    emailCode: '',
    consentGiven: false
  });

  // Load user contracts
  useEffect(() => {
    if (authUser) {
      loadUserContracts();
    }
  }, [authUser]);

  const loadUserContracts = () => {
    try {
      const contractsKey = `heartContracts_${authUser?.id}`;
      const storedContracts = localStorage.getItem(contractsKey);
      if (storedContracts) {
        setContracts(JSON.parse(storedContracts));
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Kunde inte ladda avtal');
    }
  };

  const saveContract = (contract: EnhancedContract) => {
    try {
      const contractsKey = `heartContracts_${authUser?.id}`;
      const updatedContracts = contracts.filter(c => c.id !== contract.id);
      updatedContracts.push(contract);
      setContracts(updatedContracts);
      localStorage.setItem(contractsKey, JSON.stringify(updatedContracts));
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Kunde inte spara avtal');
    }
  };

  const createNewContract = async () => {
    if (!authUser) {
      toast.error('Du måste vara inloggad för att skapa avtal');
      return;
    }

    setIsCreating(true);
    try {
      const newContract: EnhancedContract = {
        id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: contractForm.title,
        description: contractForm.description,
        type: contractType,
        status: 'draft',
        version: 1,
        amount: contractForm.amount ? parseFloat(contractForm.amount) : undefined,
        currency: contractForm.currency,
        paymentTerms: contractForm.paymentTerms,
        
        escrow: {
          status: 'none',
          amount: contractForm.amount ? parseFloat(contractForm.amount) : 0,
          currency: contractForm.currency,
          accountId: '',
          releaseConditions: [
            'Båda parter godkänner transaktionen',
            'Verifiering av alla parter slutförd',
            'Plattformsgodkännande erhållet'
          ],
          releaseApprovals: {
            buyer: false,
            seller: false,
            platform: false
          },
          fees: {
            platformFee: 0.03, // 3%
            escrowFee: 0.005, // 0.5%
            paymentProcessingFee: 0.015 // 1.5%
          }
        },

        parties: [
          {
            id: authUser.id,
            name: `${authUser.firstName} ${authUser.lastName}`,
            email: authUser.email,
            role: 'buyer',
            signed: false,
            verification: {
              idVerified: false,
              emailVerified: authUser.isEmailVerified || false,
              phoneVerified: false,
              bankAccountVerified: false,
              verificationLevel: 'basic',
              kycStatus: 'pending',
              verificationDocuments: []
            },
            notifications: {
              email: true,
              sms: true,
              push: true
            }
          },
          {
            id: `seller_${Date.now()}`,
            name: '',
            email: contractForm.sellerEmail,
            role: 'seller',
            signed: false,
            verification: {
              idVerified: false,
              emailVerified: false,
              phoneVerified: false,
              bankAccountVerified: false,
              verificationLevel: 'basic',
              kycStatus: 'pending',
              verificationDocuments: []
            },
            notifications: {
              email: true,
              sms: true,
              push: true
            }
          }
        ],

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: contractForm.dueDate,
        
        documents: [],
        
        legalCompliance: {
          jurisdiction: 'Sverige',
          applicableLaw: 'Svensk rätt',
          disputeResolution: {
            method: 'arbitration',
            location: 'Stockholm',
            language: 'Svenska'
          },
          dataProtection: {
            gdprCompliant: true,
            dataRetentionPeriod: 2555, // 7 år i dagar
            consentGiven: true
          },
          auditTrail: [{
            timestamp: new Date().toISOString(),
            action: 'contract_created',
            userId: authUser.id,
            details: 'Avtal skapat',
            ipAddress: 'Unknown'
          }]
        },

        platformApproval: {
          required: contractForm.requiresPlatformApproval,
          status: 'pending'
        },

        autoCreated: false,
        listingId,

        metadata: {
          priorityLevel: contractForm.amount && parseFloat(contractForm.amount) > 1000000 ? 'high' : 'medium',
          tags: [contractType, 'heart_avtal'],
          notes: contractForm.specialConditions
        }
      };

      // Add listing details if available
      if (listingId && initialData?.listingDetails) {
        newContract.listingDetails = initialData.listingDetails;
      }

      saveContract(newContract);
      
      if (onContractCreated) {
        onContractCreated(newContract);
      }

      toast.success('Heart Avtal skapat! Nästa steg: Verifiering av parter');
      setSelectedContract(newContract);
      setCurrentStep(2);
      
      // Send notifications to parties
      await sendContractNotifications(newContract);

    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Kunde inte skapa avtal');
    } finally {
      setIsCreating(false);
    }
  };

  const sendContractNotifications = async (contract: EnhancedContract) => {
    // Simulate sending notifications
    const notifications = contract.parties.map(party => ({
      type: 'contract_created',
      recipient: party.email,
      message: `Nytt Heart Avtal: ${contract.title} väntar på din verifiering och signering.`
    }));

    // In a real implementation, this would call an API
    console.log('Sending notifications:', notifications);
    toast.success('Notifikationer skickade till alla parter');
  };

  const startVerification = async (partyId: string) => {
    setIsVerifying(true);
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (selectedContract) {
        const updatedContract = { ...selectedContract };
        const party = updatedContract.parties.find(p => p.id === partyId);
        if (party) {
          party.verification.kycStatus = 'verified';
          party.verification.idVerified = true;
          party.verification.phoneVerified = true;
          party.verification.bankAccountVerified = true;
          party.verification.verificationLevel = 'enhanced';
          party.verification.verifiedAt = new Date().toISOString();
        }

        // Check if all parties are verified
        const allVerified = updatedContract.parties.every(p => p.verification.kycStatus === 'verified');
        if (allVerified && updatedContract.status === 'pending_verification') {
          updatedContract.status = 'verification_complete';
        }

        updatedContract.updatedAt = new Date().toISOString();
        saveContract(updatedContract);
        setSelectedContract(updatedContract);
        
        toast.success('Verifiering slutförd!');
        if (allVerified) {
          toast.success('Alla parter verifierade. Redo för signering!');
          setCurrentStep(3);
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verifiering misslyckades');
    } finally {
      setIsVerifying(false);
    }
  };

  const signContract = async (partyId: string) => {
    if (!selectedContract) return;

    setIsSigning(true);
    try {
      const signature: DigitalSignature = {
        signedAt: new Date().toISOString(),
        ipAddress: 'Unknown',
        userAgent: navigator.userAgent,
        signatureHash: `hash_${Date.now()}_${Math.random().toString(36)}`,
        signatureMethod: 'digital'
      };

      const updatedContract = { ...selectedContract };
      const party = updatedContract.parties.find(p => p.id === partyId);
      if (party) {
        party.signed = true;
        party.signature = signature;
      }

      // Check if all parties have signed
      const allSigned = updatedContract.parties.every(p => p.signed);
      if (allSigned) {
        updatedContract.status = 'fully_signed';
        
        // Initiate escrow if amount is specified
        if (updatedContract.amount && updatedContract.amount > 0) {
          updatedContract.escrow.status = 'initiating';
          updatedContract.status = 'escrow_secured';
          toast.success('Alla signaturer klara! Escrow initieras...');
          
          // Auto-approve smaller contracts or queue for manual approval
          if (updatedContract.amount < 500000) {
            setTimeout(() => {
              approveContract(updatedContract.id);
            }, 3000);
          }
        }
      }

      updatedContract.updatedAt = new Date().toISOString();
      saveContract(updatedContract);
      setSelectedContract(updatedContract);
      
      toast.success('Avtal signerat!');
      if (allSigned) {
        setCurrentStep(4);
      }

    } catch (error) {
      console.error('Signing error:', error);
      toast.error('Signering misslyckades');
    } finally {
      setIsSigning(false);
    }
  };

  const approveContract = async (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    try {
      const updatedContract = { ...contract };
      updatedContract.platformApproval = {
        ...updatedContract.platformApproval,
        status: 'approved',
        approvedBy: 'system',
        approvedAt: new Date().toISOString(),
        comments: 'Automatiskt godkänt - lågt riskavtal'
      };
      
      updatedContract.status = 'platform_approved';
      
      // Release escrow if auto-release is enabled
      if (updatedContract.metadata.notes.includes('auto_release')) {
        updatedContract.escrow.status = 'released';
        updatedContract.escrow.releasedAt = new Date().toISOString();
        updatedContract.status = 'funds_released';
      }

      updatedContract.updatedAt = new Date().toISOString();
      saveContract(updatedContract);
      
      if (selectedContract?.id === contractId) {
        setSelectedContract(updatedContract);
        setCurrentStep(5);
      }

      toast.success('Avtal godkänt av plattformen!');
      
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Godkännande misslyckades');
    }
  };

  const releaseEscrow = async (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    try {
      const updatedContract = { ...contract };
      updatedContract.escrow.status = 'released';
      updatedContract.escrow.releasedAt = new Date().toISOString();
      updatedContract.escrow.transactionId = `txn_${Date.now()}`;
      updatedContract.status = 'funds_released';
      updatedContract.completedAt = new Date().toISOString();

      updatedContract.updatedAt = new Date().toISOString();
      saveContract(updatedContract);
      
      if (selectedContract?.id === contractId) {
        setSelectedContract(updatedContract);
        setCurrentStep(6);
      }

      toast.success('Medel överförda! Transaktionen är slutförd.');
      
    } catch (error) {
      console.error('Escrow release error:', error);
      toast.error('Överföring misslyckades');
    }
  };

  const getStatusColor = (status: ContractStatus) => {
    const colorMap = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending_verification': 'bg-yellow-100 text-yellow-800',
      'verification_complete': 'bg-blue-100 text-blue-800',
      'pending_signatures': 'bg-orange-100 text-orange-800',
      'partially_signed': 'bg-orange-100 text-orange-800',
      'fully_signed': 'bg-green-100 text-green-800',
      'escrow_secured': 'bg-purple-100 text-purple-800',
      'pending_platform_approval': 'bg-indigo-100 text-indigo-800',
      'platform_approved': 'bg-green-100 text-green-800',
      'funds_released': 'bg-emerald-100 text-emerald-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'disputed': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: ContractStatus) => {
    const textMap = {
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
    return textMap[status] || status;
  };

  return (
    <div className="w-full">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Heart Avtal</h2>
          <p className="text-gray-600">Säkra digitala avtal med escrow och plattformsgodkännande</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Skapa Heart Avtal
        </button>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileSignature className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Inga avtal ännu</h3>
            <p className="text-gray-600 mb-6">Skapa ditt första Heart Avtal för säkra transaktioner</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Skapa ditt första avtal
            </button>
          </div>
        ) : (
          contracts.map((contract) => (
            <div key={contract.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{contract.title}</h3>
                  <p className="text-gray-600 mb-3">{contract.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Skapad: {new Date(contract.createdAt).toLocaleDateString('sv-SE')}</span>
                    {contract.amount && (
                      <span>Belopp: {contract.amount.toLocaleString('sv-SE')} {contract.currency}</span>
                    )}
                    <span>Parter: {contract.parties.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                    {getStatusText(contract.status)}
                  </span>
                  <button
                    onClick={() => setSelectedContract(contract)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Visa detaljer
                  </button>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${
                      contract.status === 'completed' ? 100 :
                      contract.status === 'funds_released' ? 95 :
                      contract.status === 'platform_approved' ? 80 :
                      contract.status === 'fully_signed' ? 60 :
                      contract.status === 'verification_complete' ? 40 :
                      contract.status === 'pending_verification' ? 20 :
                      10
                    }%` 
                  }}
                />
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2">
                {contract.status === 'pending_verification' && (
                  <button
                    onClick={() => startVerification(authUser?.id || '')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Fingerprint className="w-4 h-4" />
                    Verifiera
                  </button>
                )}
                {(contract.status === 'verification_complete' || contract.status === 'pending_signatures') && !contract.parties.find(p => p.id === authUser?.id)?.signed && (
                  <button
                    onClick={() => signContract(authUser?.id || '')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <FileSignature className="w-4 h-4" />
                    Signera
                  </button>
                )}
                {contract.status === 'platform_approved' && contract.escrow.status === 'secured' && (
                  <button
                    onClick={() => releaseEscrow(contract.id)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Frisläpp medel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Contract Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Skapa Heart Avtal</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avtalsrubrik *
                  </label>
                  <input
                    type="text"
                    value={contractForm.title}
                    onChange={(e) => setContractForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="t.ex. Köp av TechStartup AB"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Belopp
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={contractForm.amount}
                      onChange={(e) => setContractForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-red-500"
                      placeholder="2500000"
                    />
                    <select
                      value={contractForm.currency}
                      onChange={(e) => setContractForm(prev => ({ ...prev, currency: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="SEK">SEK</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beskrivning *
                  </label>
                  <textarea
                    value={contractForm.description}
                    onChange={(e) => setContractForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Detaljerad beskrivning av avtalet..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Köparens e-post
                  </label>
                  <input
                    type="email"
                    value={authUser?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Säljarens e-post *
                  </label>
                  <input
                    type="email"
                    value={contractForm.sellerEmail}
                    onChange={(e) => setContractForm(prev => ({ ...prev, sellerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="seller@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förfallodatum
                  </label>
                  <input
                    type="date"
                    value={contractForm.dueDate}
                    onChange={(e) => setContractForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Betalningsvillkor
                  </label>
                  <select
                    value={contractForm.paymentTerms}
                    onChange={(e) => setContractForm(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="30 dagar från signering">30 dagar från signering</option>
                    <option value="Vid signering">Vid signering</option>
                    <option value="50% vid signering, 50% vid överlämning">50% vid signering, 50% vid överlämning</option>
                    <option value="Efter leverans">Efter leverans</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Särskilda villkor
                  </label>
                  <textarea
                    value={contractForm.specialConditions}
                    onChange={(e) => setContractForm(prev => ({ ...prev, specialConditions: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Eventuella särskilda villkor eller klausuler..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="platform-approval"
                        type="checkbox"
                        checked={contractForm.requiresPlatformApproval}
                        onChange={(e) => setContractForm(prev => ({ ...prev, requiresPlatformApproval: e.target.checked }))}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="platform-approval" className="ml-2 text-sm text-gray-700">
                        Kräv plattformsgodkännande för säkerhet
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="verification-required"
                        type="checkbox"
                        checked={contractForm.requiresVerification}
                        onChange={(e) => setContractForm(prev => ({ ...prev, requiresVerification: e.target.checked }))}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="verification-required" className="ml-2 text-sm text-gray-700">
                        Kräv identitetsverifiering av alla parter
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="auto-release"
                        type="checkbox"
                        checked={contractForm.autoReleaseEscrow}
                        onChange={(e) => setContractForm(prev => ({ ...prev, autoReleaseEscrow: e.target.checked }))}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="auto-release" className="ml-2 text-sm text-gray-700">
                        Automatisk frisläppning av escrow efter godkännande
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  onClick={createNewContract}
                  disabled={isCreating || !contractForm.title || !contractForm.description || !contractForm.sellerEmail}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Skapar...
                    </>
                  ) : (
                    <>
                      <FileSignature className="w-5 h-5" />
                      Skapa Heart Avtal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Details Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedContract.title}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(selectedContract.status)}`}>
                    {getStatusText(selectedContract.status)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Contract Progress */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Avtalsprocess</h4>
                <div className="flex items-center justify-between mb-4">
                  {['Skapad', 'Verifiering', 'Signering', 'Escrow', 'Godkännande', 'Slutförd'].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index < currentStep ? 'bg-green-500 text-white' : 
                        index === currentStep - 1 ? 'bg-blue-500 text-white' : 
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{step}</span>
                      {index < 5 && <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contract Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Avtalsinformation</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Typ:</span> {selectedContract.type}</div>
                    <div><span className="font-medium">Belopp:</span> {selectedContract.amount?.toLocaleString('sv-SE')} {selectedContract.currency}</div>
                    <div><span className="font-medium">Skapad:</span> {new Date(selectedContract.createdAt).toLocaleString('sv-SE')}</div>
                    {selectedContract.dueDate && (
                      <div><span className="font-medium">Förfaller:</span> {new Date(selectedContract.dueDate).toLocaleDateString('sv-SE')}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Escrow-status</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> {selectedContract.escrow.status}</div>
                    <div><span className="font-medium">Plattformsavgift:</span> {(selectedContract.escrow.fees.platformFee * 100).toFixed(1)}%</div>
                    <div><span className="font-medium">Escrow-avgift:</span> {(selectedContract.escrow.fees.escrowFee * 100).toFixed(2)}%</div>
                    {selectedContract.escrow.releasedAt && (
                      <div><span className="font-medium">Frisläppt:</span> {new Date(selectedContract.escrow.releasedAt).toLocaleString('sv-SE')}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="mb-8">
                <h5 className="font-semibold text-gray-900 mb-3">Parter</h5>
                <div className="space-y-4">
                  {selectedContract.parties.map((party) => (
                    <div key={party.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{party.name || party.email}</div>
                          <div className="text-sm text-gray-600">{party.role} • {party.email}</div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              party.verification.kycStatus === 'verified' ? 'bg-green-100 text-green-800' : 
                              party.verification.kycStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {party.verification.kycStatus === 'verified' ? 'Verifierad' :
                               party.verification.kycStatus === 'in_progress' ? 'Verifiering pågår' :
                               'Ej verifierad'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              party.signed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {party.signed ? 'Signerat' : 'Ej signerat'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {!party.verification.kycStatus || party.verification.kycStatus === 'pending' ? (
                            <button
                              onClick={() => startVerification(party.id)}
                              disabled={isVerifying}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1"
                            >
                              <Fingerprint className="w-4 h-4" />
                              Verifiera
                            </button>
                          ) : null}
                          
                          {party.verification.kycStatus === 'verified' && !party.signed ? (
                            <button
                              onClick={() => signContract(party.id)}
                              disabled={isSigning}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1"
                            >
                              <FileSignature className="w-4 h-4" />
                              Signera
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Approval */}
              {selectedContract.platformApproval.required && (
                <div className="mb-8">
                  <h5 className="font-semibold text-gray-900 mb-3">Plattformsgodkännande</h5>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Status: {selectedContract.platformApproval.status}
                        </div>
                        {selectedContract.platformApproval.approvedAt && (
                          <div className="text-sm text-gray-600">
                            Godkänt: {new Date(selectedContract.platformApproval.approvedAt).toLocaleString('sv-SE')}
                          </div>
                        )}
                        {selectedContract.platformApproval.comments && (
                          <div className="text-sm text-gray-600 mt-2">
                            Kommentar: {selectedContract.platformApproval.comments}
                          </div>
                        )}
                      </div>
                      
                      {selectedContract.platformApproval.status === 'pending' && selectedContract.status === 'fully_signed' && (
                        <button
                          onClick={() => approveContract(selectedContract.id)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          Godkänn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Escrow Release */}
              {selectedContract.status === 'platform_approved' && selectedContract.escrow.status === 'secured' && (
                <div className="mb-8">
                  <h5 className="font-semibold text-gray-900 mb-3">Frisläppning av medel</h5>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Medel redo för överföring
                        </div>
                        <div className="text-sm text-gray-600">
                          Belopp: {selectedContract.amount?.toLocaleString('sv-SE')} {selectedContract.currency}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => releaseEscrow(selectedContract.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Överför medel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Transaction Complete */}
              {selectedContract.status === 'funds_released' && (
                <div className="mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <div className="font-semibold text-green-900">Transaktion slutförd!</div>
                        <div className="text-sm text-green-700">
                          Medel har överförts säkert. Avtalet är nu juridiskt bindande och slutfört.
                        </div>
                        {selectedContract.escrow.transactionId && (
                          <div className="text-xs text-green-600 mt-1">
                            Transaktions-ID: {selectedContract.escrow.transactionId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};