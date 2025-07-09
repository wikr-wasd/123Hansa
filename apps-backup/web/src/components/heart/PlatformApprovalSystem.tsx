import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  FileText,
  User,
  Building2,
  DollarSign,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Award,
  X,
  Send,
  Flag
} from 'lucide-react';
import { EnhancedContract, PlatformApproval, ContractStatus } from '../../types/contracts';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

interface PlatformApprovalSystemProps {
  contracts: EnhancedContract[];
  onApprovalUpdate: (contractId: string, approval: Partial<PlatformApproval>) => void;
  userRole?: 'admin' | 'moderator' | 'user';
}

interface ApprovalDecision {
  contractId: string;
  decision: 'approve' | 'reject' | 'escalate' | 'request_info';
  comments: string;
  conditions?: string[];
  escalationReason?: string;
}

export const PlatformApprovalSystem: React.FC<PlatformApprovalSystemProps> = ({
  contracts,
  onApprovalUpdate,
  userRole = 'user'
}) => {
  const { user } = useAuthStore();
  const [selectedContract, setSelectedContract] = useState<EnhancedContract | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState<ApprovalDecision>({
    contractId: '',
    decision: 'approve',
    comments: '',
    conditions: [],
    escalationReason: ''
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewing' | 'approved' | 'rejected'>('all');
  const [riskAssessment, setRiskAssessment] = useState<any>(null);

  // Filter contracts that require platform approval
  const approvalContracts = contracts.filter(contract => 
    contract.platformApproval.required && 
    (filterStatus === 'all' || contract.platformApproval.status === filterStatus)
  );

  const startApprovalProcess = (contract: EnhancedContract) => {
    setSelectedContract(contract);
    setApprovalDecision({
      contractId: contract.id,
      decision: 'approve',
      comments: '',
      conditions: [],
      escalationReason: ''
    });
    
    // Perform automated risk assessment
    performRiskAssessment(contract);
    setShowApprovalModal(true);
  };

  const performRiskAssessment = (contract: EnhancedContract) => {
    const assessment = {
      riskLevel: 'low' as 'low' | 'medium' | 'high' | 'critical',
      factors: [] as string[],
      score: 0,
      recommendations: [] as string[]
    };

    // Amount-based risk
    if (contract.amount) {
      if (contract.amount > 10000000) {
        assessment.riskLevel = 'high';
        assessment.factors.push('Mycket högt belopp (>10M SEK)');
        assessment.score += 40;
      } else if (contract.amount > 5000000) {
        assessment.riskLevel = 'medium';
        assessment.factors.push('Högt belopp (>5M SEK)');
        assessment.score += 25;
      } else if (contract.amount > 1000000) {
        assessment.factors.push('Medelhögt belopp (>1M SEK)');
        assessment.score += 15;
      }
    }

    // Party verification status
    const unverifiedParties = contract.parties.filter(p => p.verification.kycStatus !== 'verified');
    if (unverifiedParties.length > 0) {
      assessment.factors.push(`${unverifiedParties.length} overifierade parter`);
      assessment.score += unverifiedParties.length * 20;
      if (assessment.riskLevel === 'low') assessment.riskLevel = 'medium';
    }

    // Contract type risk
    if (contract.type === 'investment' || contract.type === 'business_purchase') {
      assessment.factors.push('Högrisk-avtalstyp');
      assessment.score += 15;
    }

    // Timeline risk
    if (contract.dueDate) {
      const daysUntilDue = Math.ceil((new Date(contract.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue < 7) {
        assessment.factors.push('Kort tid till förfallodatum');
        assessment.score += 10;
      }
    }

    // Party relationship risk
    const buyerEmail = contract.parties.find(p => p.role === 'buyer')?.email;
    const sellerEmail = contract.parties.find(p => p.role === 'seller')?.email;
    if (buyerEmail && sellerEmail && buyerEmail.split('@')[1] === sellerEmail.split('@')[1]) {
      assessment.factors.push('Parter från samma domän');
      assessment.score += 15;
      assessment.recommendations.push('Verifiera att parterna är separata entiteter');
    }

    // Update risk level based on total score
    if (assessment.score > 60) assessment.riskLevel = 'critical';
    else if (assessment.score > 40) assessment.riskLevel = 'high';
    else if (assessment.score > 20) assessment.riskLevel = 'medium';

    // Add recommendations based on risk level
    if (assessment.riskLevel === 'high' || assessment.riskLevel === 'critical') {
      assessment.recommendations.push('Kräv manuell granskning av alla dokument');
      assessment.recommendations.push('Verifiera identitet via video-samtal');
      assessment.recommendations.push('Kontrollera företagsregistret');
    }

    if (contract.amount && contract.amount > 5000000) {
      assessment.recommendations.push('Kräv bankgaranti eller säkerhet');
      assessment.recommendations.push('Genomför utökad due diligence');
    }

    setRiskAssessment(assessment);
  };

  const submitApprovalDecision = async () => {
    if (!selectedContract) return;

    try {
      const updatedApproval: Partial<PlatformApproval> = {
        status: approvalDecision.decision === 'approve' ? 'approved' : 
               approvalDecision.decision === 'reject' ? 'rejected' :
               approvalDecision.decision === 'escalate' ? 'escalated' : 'reviewing',
        reviewedBy: user?.id,
        reviewedAt: new Date().toISOString(),
        comments: approvalDecision.comments,
        conditions: approvalDecision.conditions,
        escalationReason: approvalDecision.escalationReason
      };

      if (approvalDecision.decision === 'approve') {
        updatedApproval.approvedBy = user?.id;
        updatedApproval.approvedAt = new Date().toISOString();
      }

      onApprovalUpdate(selectedContract.id, updatedApproval);
      
      // Show success message
      const messages = {
        approve: 'Avtal godkänt! Escrow kan nu frigöras.',
        reject: 'Avtal avvisat. Parterna har informerats.',
        escalate: 'Avtal eskalerat för högre granskning.',
        request_info: 'Begäran om ytterligare information skickad.'
      };
      
      toast.success(messages[approvalDecision.decision]);
      setShowApprovalModal(false);
      
    } catch (error) {
      console.error('Error submitting approval decision:', error);
      toast.error('Kunde inte spara beslut');
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewing': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'escalated': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (userRole === 'user') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Plattformsgodkännande</h3>
          <p className="text-gray-600">
            Dina avtal granskas av vårt team för säkerhet och juridisk korrekthet.
            Du får notifiering när granskningen är klar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plattformsgodkännanden</h2>
          <p className="text-gray-600">Granska och godkänn avtal som kräver plattformsvalidering</p>
        </div>
        
        {/* Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Alla avtal</option>
          <option value="pending">Väntar på granskning</option>
          <option value="reviewing">Under granskning</option>
          <option value="approved">Godkända</option>
          <option value="rejected">Avvisade</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Väntar', status: 'pending', icon: Clock, color: 'text-yellow-600' },
          { label: 'Granskas', status: 'reviewing', icon: Eye, color: 'text-blue-600' },
          { label: 'Godkända', status: 'approved', icon: CheckCircle, color: 'text-green-600' },
          { label: 'Avvisade', status: 'rejected', icon: AlertCircle, color: 'text-red-600' }
        ].map((stat) => {
          const count = contracts.filter(c => 
            c.platformApproval.required && c.platformApproval.status === stat.status
          ).length;
          const IconComponent = stat.icon;
          
          return (
            <div key={stat.status} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <IconComponent className={`w-8 h-8 ${stat.color} mr-3`} />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {approvalContracts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Inga avtal att granska</h3>
            <p className="text-gray-600">Alla avtal som kräver godkännande har redan bearbetats.</p>
          </div>
        ) : (
          approvalContracts.map((contract) => (
            <div key={contract.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{contract.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.platformApproval.status)}`}>
                      {contract.platformApproval.status === 'pending' ? 'Väntar' :
                       contract.platformApproval.status === 'reviewing' ? 'Granskas' :
                       contract.platformApproval.status === 'approved' ? 'Godkänt' :
                       contract.platformApproval.status === 'rejected' ? 'Avvisat' :
                       contract.platformApproval.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{contract.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {contract.amount ? formatAmount(contract.amount, contract.currency) : 'Inget belopp'}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <User className="w-4 h-4 mr-2" />
                      {contract.parties.length} parter
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(contract.createdAt).toLocaleDateString('sv-SE')}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Building2 className="w-4 h-4 mr-2" />
                      {contract.type}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {contract.platformApproval.status === 'pending' && (
                    <button
                      onClick={() => startApprovalProcess(contract)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Granska
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedContract(contract)}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    Visa detaljer
                  </button>
                </div>
              </div>
              
              {/* Verification Status */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Verifieringsstatus:</span>
                    {contract.parties.map((party, index) => (
                      <div key={party.id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{party.role}:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          party.verification.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                          party.verification.kycStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {party.verification.kycStatus === 'verified' ? 'Verifierad' :
                           party.verification.kycStatus === 'in_progress' ? 'Pågår' :
                           'Ej verifierad'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {contract.platformApproval.reviewedAt && (
                    <div className="text-xs text-gray-500">
                      Granskad: {new Date(contract.platformApproval.reviewedAt).toLocaleString('sv-SE')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Granska avtal</h3>
                  <p className="text-gray-600">{selectedContract.title}</p>
                </div>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Risk Assessment */}
              {riskAssessment && (
                <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Riskbedömning</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskAssessment.riskLevel)}`}>
                      {riskAssessment.riskLevel === 'low' ? 'Låg risk' :
                       riskAssessment.riskLevel === 'medium' ? 'Mediumrisk' :
                       riskAssessment.riskLevel === 'high' ? 'Hög risk' :
                       'Kritisk risk'}
                    </span>
                  </div>
                  
                  {riskAssessment.factors.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Riskfaktorer:</h5>
                      <ul className="space-y-1">
                        {riskAssessment.factors.map((factor: string, index: number) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {riskAssessment.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Rekommendationer:</h5>
                      <ul className="space-y-1">
                        {riskAssessment.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Contract Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Avtalsdetaljer</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Typ:</span> {selectedContract.type}</div>
                    <div><span className="font-medium">Belopp:</span> {selectedContract.amount ? formatAmount(selectedContract.amount, selectedContract.currency) : 'Inget belopp'}</div>
                    <div><span className="font-medium">Skapad:</span> {new Date(selectedContract.createdAt).toLocaleString('sv-SE')}</div>
                    {selectedContract.dueDate && (
                      <div><span className="font-medium">Förfaller:</span> {new Date(selectedContract.dueDate).toLocaleDateString('sv-SE')}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Parter</h5>
                  <div className="space-y-2">
                    {selectedContract.parties.map((party) => (
                      <div key={party.id} className="text-sm">
                        <div className="font-medium">{party.role}: {party.name || party.email}</div>
                        <div className="text-gray-600">Verifiering: {party.verification.kycStatus}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Approval Decision */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beslut</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'approve', label: 'Godkänn', color: 'bg-green-100 text-green-800 border-green-200' },
                      { value: 'reject', label: 'Avvisa', color: 'bg-red-100 text-red-800 border-red-200' },
                      { value: 'escalate', label: 'Eskalera', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                      { value: 'request_info', label: 'Begär info', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setApprovalDecision(prev => ({ ...prev, decision: option.value as any }))}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                          approvalDecision.decision === option.value 
                            ? option.color 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kommentarer</label>
                  <textarea
                    value={approvalDecision.comments}
                    onChange={(e) => setApprovalDecision(prev => ({ ...prev, comments: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ange skäl för beslutet och eventuella villkor..."
                  />
                </div>
                
                {approvalDecision.decision === 'escalate' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Eskaleringsskäl</label>
                    <textarea
                      value={approvalDecision.escalationReason}
                      onChange={(e) => setApprovalDecision(prev => ({ ...prev, escalationReason: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Varför behöver detta avtal eskaleras till högre instans?"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  onClick={submitApprovalDecision}
                  disabled={!approvalDecision.comments.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Spara beslut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};