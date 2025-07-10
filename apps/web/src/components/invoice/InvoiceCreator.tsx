import React, { useState } from 'react';
import { FileText, Plus, Trash2, Download, Send, Calculator, Building2, User, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceCreatorProps {
  customerId: string;
  customerName: string;
  listings: Array<{
    id: string;
    title: string;
    price: number;
  }>;
}

const InvoiceCreator: React.FC<InvoiceCreatorProps> = ({ customerId, customerName, listings }) => {
  const [selectedListing, setSelectedListing] = useState<string>('');
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    company: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Sverige'
  });
  
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: 'Företagsförsäljning - Provision',
      quantity: 1,
      price: 0,
      total: 0
    }
  ]);
  
  const [invoiceSettings, setInvoiceSettings] = useState({
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    currency: 'SEK',
    notes: 'Tack för ditt förtroende! Betalning ska ske inom 30 dagar.',
    vatRate: 25 // 25% Swedish VAT
  });
  
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0,
      total: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updated.total = updated.quantity * updated.price;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(items => items.filter(item => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateVat = () => {
    return (calculateSubtotal() * invoiceSettings.vatRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVat();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: invoiceSettings.currency
    }).format(amount);
  };

  const handleListingSelect = (listingId: string) => {
    setSelectedListing(listingId);
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      // Update first item with listing details
      const commissionRate = 0.05; // 5% commission
      const commission = listing.price * commissionRate;
      
      setInvoiceItems(items => items.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            description: `Förmedlingsavgift - ${listing.title}`,
            quantity: 1,
            price: commission,
            total: commission
          };
        }
        return item;
      }));
    }
  };

  const generateInvoice = () => {
    const invoiceData = {
      id: currentInvoiceId || `INV-${Date.now()}`,
      customerId,
      customerName,
      listingId: selectedListing,
      buyerInfo,
      items: invoiceItems,
      subtotal: calculateSubtotal(),
      vat: calculateVat(),
      total: calculateTotal(),
      currency: invoiceSettings.currency,
      dueDate: invoiceSettings.dueDate,
      notes: invoiceSettings.notes,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    // Save invoice to both localStorage and state
    localStorage.setItem(`invoice-${invoiceData.id}`, JSON.stringify(invoiceData));
    setSavedInvoices(prev => {
      const existingIndex = prev.findIndex(inv => inv.id === invoiceData.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = invoiceData;
        return updated;
      }
      return [...prev, invoiceData];
    });
    
    setCurrentInvoiceId(invoiceData.id);
    toast.success('Faktura sparad! Du kan nu ladda ner eller skicka den.');
  };

  const createNewInvoice = () => {
    setBuyerInfo({
      name: '',
      email: '',
      company: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Sverige'
    });
    setSelectedListing('');
    setInvoiceItems([{
      id: '1',
      description: 'Företagsförsäljning - Provision',
      quantity: 1,
      price: 0,
      total: 0
    }]);
    setCurrentInvoiceId(null);
    toast.success('Ny ren faktura skapad');
  };

  const downloadInvoice = () => {
    if (!currentInvoiceId) {
      toast.error('Spara fakturen först');
      return;
    }
    
    // Simulate PDF generation and download
    const invoiceData = savedInvoices.find(inv => inv.id === currentInvoiceId);
    if (invoiceData) {
      const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentInvoiceId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Faktura nedladdad som JSON (i produktionsmiljö skulle detta vara en PDF)');
    }
  };

  const sendInvoice = () => {
    if (!currentInvoiceId) {
      toast.error('Spara fakturen först');
      return;
    }
    
    if (!buyerInfo.email) {
      toast.error('Vänligen ange köparens e-postadress');
      return;
    }
    
    // Simulate email sending
    setTimeout(() => {
      toast.success(`Faktura ${currentInvoiceId} skickad till ${buyerInfo.email}`);
      
      // Update invoice status to sent
      setSavedInvoices(prev => prev.map(inv => 
        inv.id === currentInvoiceId 
          ? { ...inv, status: 'sent', sentAt: new Date().toISOString() }
          : inv
      ));
    }, 1000);
  };

  const loadInvoice = (invoiceId: string) => {
    const invoice = savedInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setBuyerInfo(invoice.buyerInfo);
      setSelectedListing(invoice.listingId);
      setInvoiceItems(invoice.items);
      setInvoiceSettings({
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        notes: invoice.notes,
        vatRate: 25
      });
      setCurrentInvoiceId(invoice.id);
      toast.success('Faktura laddad');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {currentInvoiceId ? `Redigera Faktura ${currentInvoiceId}` : 'Skapa Faktura'}
            </h2>
            <p className="text-blue-100">Skapa och skicka professionella fakturor för dina affärer</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={createNewInvoice}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ny ren faktura
            </button>
            <button
              onClick={() => setShowInvoiceHistory(!showInvoiceHistory)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Tidigare fakturor ({savedInvoices.length})
            </button>
            <FileText className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Invoice Details */}
        <div className="space-y-6">
          {/* Select Listing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Välj Annons
            </h3>
            <select
              value={selectedListing}
              onChange={(e) => handleListingSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Välj en annons...</option>
              {listings.map(listing => (
                <option key={listing.id} value={listing.id}>
                  {listing.title} - {formatCurrency(listing.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Buyer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Köparens Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Namn *
                </label>
                <input
                  type="text"
                  value={buyerInfo.name}
                  onChange={(e) => setBuyerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="För- och efternamn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-post *
                </label>
                <input
                  type="email"
                  value={buyerInfo.email}
                  onChange={(e) => setBuyerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="namn@företag.se"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Företag
                </label>
                <input
                  type="text"
                  value={buyerInfo.company}
                  onChange={(e) => setBuyerInfo(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Företagsnamn AB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adress
                </label>
                <input
                  type="text"
                  value={buyerInfo.address}
                  onChange={(e) => setBuyerInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Gatuadress"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stad
                </label>
                <input
                  type="text"
                  value={buyerInfo.city}
                  onChange={(e) => setBuyerInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Stockholm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postnummer
                </label>
                <input
                  type="text"
                  value={buyerInfo.postalCode}
                  onChange={(e) => setBuyerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Faktura Inställningar
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Förfallodag
                </label>
                <input
                  type="date"
                  value={invoiceSettings.dueDate}
                  onChange={(e) => setInvoiceSettings(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valuta
                </label>
                <select
                  value={invoiceSettings.currency}
                  onChange={(e) => setInvoiceSettings(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SEK">SEK - Svenska Kronor</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anteckningar
                </label>
                <textarea
                  value={invoiceSettings.notes}
                  onChange={(e) => setInvoiceSettings(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ytterligare information..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Invoice Items & Preview */}
        <div className="space-y-6">
          {/* Invoice Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                Faktura Poster
              </h3>
              <button
                onClick={addInvoiceItem}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Lägg till
              </button>
            </div>

            <div className="space-y-3">
              {invoiceItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Beskrivning
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Beskrivning av tjänst/produkt"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Antal
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Pris
                      </label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateInvoiceItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Total: {formatCurrency(item.total)}
                    </span>
                    {invoiceItems.length > 1 && (
                      <button
                        onClick={() => removeInvoiceItem(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Sammanfattning
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Moms ({invoiceSettings.vatRate}%):</span>
                <span className="font-medium">{formatCurrency(calculateVat())}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-3">
              <button
                onClick={generateInvoice}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                {currentInvoiceId ? 'Uppdatera Faktura' : 'Spara Faktura'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadInvoice}
                  disabled={!currentInvoiceId}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ladda ner
                </button>
                <button
                  onClick={sendInvoice}
                  disabled={!currentInvoiceId || !buyerInfo.email}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Skicka
                </button>
              </div>
              {currentInvoiceId && (
                <div className="text-center pt-2">
                  <span className="text-sm text-gray-500">Faktura ID: {currentInvoiceId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      {showInvoiceHistory && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Sparade Fakturor ({savedInvoices.length})
          </h3>
          {savedInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Inga sparade fakturor ännu</p>
              <p className="text-sm">Skapa din första faktura för att se den här</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedInvoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{invoice.id}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status === 'sent' ? 'Skickad' : 'Utkast'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>Köpare: {invoice.buyerInfo.name}</p>
                        <p>Total: {formatCurrency(invoice.total)}</p>
                        <p>Skapad: {new Date(invoice.createdAt).toLocaleDateString('sv-SE')}</p>
                        {invoice.sentAt && (
                          <p>Skickad: {new Date(invoice.sentAt).toLocaleDateString('sv-SE')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadInvoice(invoice.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Ladda
                      </button>
                      <button
                        onClick={() => {
                          setCurrentInvoiceId(invoice.id);
                          downloadInvoice();
                        }}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        Ladda ner
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceCreator;