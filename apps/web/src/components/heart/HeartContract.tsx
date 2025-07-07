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
  Users
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

interface Contract {
  id: string;
  title: string;
  type: 'purchase' | 'sale' | 'partnership' | 'nda' | 'investment';
  status: 'draft' | 'pending' | 'signed' | 'completed' | 'cancelled';
  amount?: number;
  parties: {
    buyer: { name: string; email: string; id: string; signed: boolean; signedAt?: string };
    seller: { name: string; email: string; id: string; signed: boolean; signedAt?: string };
    witness?: { name: string; email: string; id: string; signed: boolean; signedAt?: string };
  };
  escrowStatus: 'none' | 'pending' | 'secured' | 'released';
  createdAt: string;
  dueDate?: string;
  documents: string[];
  listingId?: string;
  listingDetails?: {
    title: string;
    description: string;
    price: number;
    category: string;
    industry: string;
    employees: number;
    revenue: number;
    city: string;
    website?: string;
  };
  autoCreated?: boolean;
}

interface HeartContractProps {
  listingId?: string;
  contractType?: Contract['type'];
  onContractCreated?: (contract: Contract) => void;
}

export const HeartContract: React.FC<HeartContractProps> = ({
  listingId,
  contractType = 'purchase',
  onContractCreated
}) => {
  const { user: authUser } = useAuthStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [newContract, setNewContract] = useState({
    title: '',
    buyerEmail: '',
    amount: '',
    dueDate: ''
  });

  useEffect(() => {
    if (authUser) {
      const userContracts = JSON.parse(localStorage.getItem(`heartContracts_${authUser.id}`) || '[]');
      setContracts(userContracts);
    }
  }, [authUser]);

  const createContract = () => {
    if (!authUser) {
      toast.error('Du måste vara inloggad för att skapa avtal');
      return;
    }

    if (!newContract.title || !newContract.buyerEmail) {
      toast.error('Fyll i alla obligatoriska fält');
      return;
    }

    const contract: Contract = {
      id: `contract_${Date.now()}`,
      title: newContract.title,
      type: contractType,
      status: 'draft',
      amount: newContract.amount ? parseInt(newContract.amount) : undefined,
      parties: {
        buyer: {
          name: newContract.buyerEmail.split('@')[0],
          email: newContract.buyerEmail,
          id: 'buyer_temp',
          signed: false
        },
        seller: {
          name: `${authUser.firstName} ${authUser.lastName}`,
          email: authUser.email,
          id: authUser.id,
          signed: false
        }
      },
      escrowStatus: newContract.amount ? 'none' : 'none',
      createdAt: new Date().toISOString(),
      dueDate: newContract.dueDate || undefined,
      documents: [],
      listingId: listingId
    };

    const updatedContracts = [...contracts, contract];
    setContracts(updatedContracts);
    localStorage.setItem(`heartContracts_${authUser.id}`, JSON.stringify(updatedContracts));

    toast.success('Avtal skapat! Skickat till motparten för signering.');
    setIsCreatingContract(false);
    setNewContract({ title: '', buyerEmail: '', amount: '', dueDate: '' });
    
    if (onContractCreated) {
      onContractCreated(contract);
    }
  };

  const signContract = (contractId: string) => {
    if (!authUser) return;

    const updatedContracts = contracts.map(contract => {
      if (contract.id === contractId) {
        const isSellerSigning = contract.parties.seller.id === authUser.id;
        const isBuyerSigning = contract.parties.buyer.email === authUser.email;

        if (isSellerSigning) {
          contract.parties.seller.signed = true;
          contract.parties.seller.signedAt = new Date().toISOString();
        } else if (isBuyerSigning) {
          contract.parties.buyer.signed = true;
          contract.parties.buyer.signedAt = new Date().toISOString();
        }

        // Check if all parties have signed
        const allSigned = contract.parties.buyer.signed && contract.parties.seller.signed;
        if (allSigned) {
          contract.status = 'signed';
          if (contract.amount && contract.amount > 0) {
            contract.escrowStatus = 'pending';
          }
        }

        return contract;
      }
      return contract;
    });

    setContracts(updatedContracts);
    localStorage.setItem(`heartContracts_${authUser.id}`, JSON.stringify(updatedContracts));
    toast.success('Avtal signerat framgångsrikt!');
  };

  const releaseEscrow = (contractId: string) => {
    const updatedContracts = contracts.map(contract => {
      if (contract.id === contractId && contract.parties.seller.id === authUser.id) {
        contract.escrowStatus = 'released';
        contract.status = 'completed';
        return contract;
      }
      return contract;
    });

    setContracts(updatedContracts);
    localStorage.setItem(`heartContracts_${authUser.id}`, JSON.stringify(updatedContracts));
    toast.success('Escrow-medel frigjorda!');
  };

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEscrowStatusColor = (status: Contract['escrowStatus']) => {
    switch (status) {
      case 'none': return 'bg-gray-100 text-gray-600';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'secured': return 'bg-blue-100 text-blue-800';
      case 'released': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  if (!authUser) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Heart Avtalsstöd</h3>
        <p className="text-blue-700 mb-4">
          Säker digital signering och escrow-tjänster för alla transaktioner
        </p>
        <button 
          onClick={() => window.location.href = '/simple-test-login'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Logga in för att använda Heart
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
        <div className="flex items-center">
          <Shield className="w-8 h-8 mr-3" />
          <div>
            <h2 className="text-2xl font-bold">Heart Avtalsstöd</h2>
            <p className="text-blue-100">
              Säker digital signering och escrow-tjänster för transparenta transaktioner
            </p>
          </div>
        </div>
      </div>

      {/* Create Contract Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Mina Avtal</h3>
        <button
          onClick={() => setIsCreatingContract(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FileSignature className="w-4 h-4 mr-2" />
          Skapa Nytt Avtal
        </button>
      </div>

      {/* Create Contract Modal */}
      {isCreatingContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Skapa Nytt Avtal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avtalstitel *
                </label>
                <input
                  type="text"
                  value={newContract.title}
                  onChange={(e) => setNewContract({...newContract, title: e.target.value})}
                  placeholder="t.ex. Köp av TechStartup AB"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motparts e-post *
                </label>
                <input
                  type="email"
                  value={newContract.buyerEmail}
                  onChange={(e) => setNewContract({...newContract, buyerEmail: e.target.value})}
                  placeholder="motpart@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Belopp (SEK)
                </label>
                <input
                  type="number"
                  value={newContract.amount}
                  onChange={(e) => setNewContract({...newContract, amount: e.target.value})}
                  placeholder="1000000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Förfallodatum
                </label>
                <input
                  type="date"
                  value={newContract.dueDate}
                  onChange={(e) => setNewContract({...newContract, dueDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsCreatingContract(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={createContract}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Skapa Avtal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.length > 0 ? (
          contracts.map((contract) => (
            <div key={contract.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold">{contract.title}</h4>
                  <p className="text-gray-600">Skapat {formatDate(contract.createdAt)}</p>
                  {contract.amount && (
                    <p className="text-xl font-bold text-green-600 mt-1">
                      {formatCurrency(contract.amount)}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                    {contract.status === 'draft' && 'Utkast'}
                    {contract.status === 'pending' && 'Väntar på signering'}
                    {contract.status === 'signed' && 'Signerat'}
                    {contract.status === 'completed' && 'Slutfört'}
                    {contract.status === 'cancelled' && 'Avbrutet'}
                  </span>
                  {contract.escrowStatus !== 'none' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEscrowStatusColor(contract.escrowStatus)}`}>
                      Escrow: {contract.escrowStatus === 'pending' && 'Väntar'}
                      {contract.escrowStatus === 'secured' && 'Säkrat'}
                      {contract.escrowStatus === 'released' && 'Frigjort'}
                    </span>
                  )}
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    contract.parties.seller.signed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {contract.parties.seller.signed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Säljare: {contract.parties.seller.name}</p>
                    {contract.parties.seller.signed && (
                      <p className="text-xs text-green-600">
                        Signerat {formatDate(contract.parties.seller.signedAt!)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    contract.parties.buyer.signed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {contract.parties.buyer.signed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Köpare: {contract.parties.buyer.name}</p>
                    {contract.parties.buyer.signed && (
                      <p className="text-xs text-green-600">
                        Signerat {formatDate(contract.parties.buyer.signedAt!)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                {!contract.parties.seller.signed && contract.parties.seller.id === authUser.id && (
                  <button
                    onClick={() => signContract(contract.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FileSignature className="w-4 h-4 mr-2" />
                    Signera som Säljare
                  </button>
                )}

                {!contract.parties.buyer.signed && contract.parties.buyer.email === authUser.email && (
                  <button
                    onClick={() => signContract(contract.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FileSignature className="w-4 h-4 mr-2" />
                    Signera som Köpare
                  </button>
                )}

                {contract.status === 'signed' && contract.escrowStatus === 'pending' && contract.parties.seller.id === authUser.id && (
                  <button
                    onClick={() => releaseEscrow(contract.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Frigör Escrow
                  </button>
                )}

                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Visa Detaljer
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileSignature className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Inga avtal än</h3>
            <p className="text-gray-500 mb-4">
              Skapa ditt första avtal för säker digital hantering av transaktioner
            </p>
            <button
              onClick={() => setIsCreatingContract(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Skapa Första Avtalet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};