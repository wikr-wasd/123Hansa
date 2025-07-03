import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const TestListingSubmission: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'companies',
    askingPrice: '',
    description: '',
    location: 'Stockholm',
    sellerName: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/listings/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          askingPrice: parseInt(formData.askingPrice),
          description: formData.description,
          location: formData.location,
          seller: { name: formData.sellerName }
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Annons inlämnad för granskning! ID: ${data.data.listingId}`);
        setFormData({
          title: '',
          category: 'companies',
          askingPrice: '',
          description: '',
          location: 'Stockholm',
          sellerName: ''
        });
      } else {
        toast.error('Kunde inte skicka annons');
      }
    } catch (error) {
      toast.error('Kunde inte skicka annons');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: 'companies', name: 'Företag & Bolag' },
    { id: 'ecommerce', name: 'E-handel & Webshops' },
    { id: 'domains', name: 'Domäner & Webbplatser' },
    { id: 'content', name: 'Content & Media' },
    { id: 'social', name: 'Social Media' },
    { id: 'affiliate', name: 'Affiliate & Passive Income' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test: Skicka in annons för granskning
          </h1>
          <p className="text-gray-600 mb-8">
            Denna sida är för testning av det automatiska granskningssystemet. 
            Annonser som skickas in här kommer att visas i admin-panelen för granskning.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="t.ex. TechStartup AB - AI Solutions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pris (SEK) *
              </label>
              <input
                type="number"
                value={formData.askingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, askingPrice: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="5000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beskrivning *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detaljerad beskrivning av företaget..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plats *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Säljare *
                </label>
                <input
                  type="text"
                  value={formData.sellerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, sellerName: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ditt namn"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Skickar...' : 'Skicka för granskning'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Så här fungerar det:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Fyll i formuläret och skicka in</li>
              <li>2. Systemet analyserar automatiskt innehållet</li>
              <li>3. Annonsen dyker upp i admin-panelen (/admin)</li>
              <li>4. Administratören kan godkänna eller avslå annonsen</li>
              <li>5. Godkända annonser publiceras på /listings</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestListingSubmission;