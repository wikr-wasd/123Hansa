import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import BusinessListings from '../components/listings/BusinessListings';
import ContactSellerModal from '../components/listings/ContactSellerModal';
import MakeOfferModal from '../components/listings/MakeOfferModal';
import { BusinessListing } from '../types/business';

// Mock current user - in production this would come from auth context
const mockCurrentUser = {
  id: 'user-123',
  name: 'Johan Andersson',
  email: 'johan@example.com',
  phone: '+46 70 123 45 67',
};

// Mock listings data
const mockListings: BusinessListing[] = [
  {
    id: 'listing-1',
    title: 'Lönsam Tech-startup inom AI & Automation',
    description: 'Välestablerat tech-företag specialiserat på AI-lösningar för småföretag. Stark tillväxt de senaste 3 åren med återkommande intäkter från SaaS-produkter. Komplett team, moderna system och skalbar arkitektur.',
    sector: 'Technology',
    location: {
      city: 'Stockholm',
      region: 'Stockholm',
      country: 'Sweden',
    },
    price: {
      amount: 8500000,
      currency: 'SEK',
      type: 'NEGOTIABLE',
    },
    financials: {
      revenue: 4200000,
      ebitda: 1260000,
      employees: 12,
      yearEstablished: 2019,
    },
    features: [
      'SaaS-produkter',
      'Återkommande intäkter',
      'Skalbar arkitektur',
      'Kompetent team',
      'Moderna system',
      'AI-teknologi',
    ],
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller-1',
    seller: {
      name: 'Anna Lindström',
      verified: true,
      rating: 4.8,
      totalTransactions: 3,
    },
    status: 'ACTIVE',
    viewCount: 247,
    favoriteCount: 18,
    inquiryCount: 9,
    listedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    premium: true,
    featured: true,
  },
  // Add other mock listings as needed
];

const BusinessListingsPage: React.FC = () => {
  const [selectedListing, setSelectedListing] = useState<BusinessListing | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const handleViewDetails = (id: string) => {
    // In production, navigate to detailed listing page
    console.log('Viewing details for listing:', id);
    // Example: navigate(`/listings/${id}`);
  };

  const handleContactSeller = (id: string) => {
    const listing = mockListings.find(l => l.id === id);
    if (listing) {
      setSelectedListing(listing);
      setShowContactModal(true);
    }
  };

  const handleMakeOffer = (id: string) => {
    const listing = mockListings.find(l => l.id === id);
    if (listing) {
      setSelectedListing(listing);
      setShowOfferModal(true);
    }
  };

  const handleToggleFavorite = (id: string) => {
    console.log('Toggling favorite for listing:', id);
    // In production, this would update user's favorites
  };

  const closeModals = () => {
    setShowContactModal(false);
    setShowOfferModal(false);
    setSelectedListing(null);
  };

  return (
    <>
      <Helmet>
        <title>Företag till salu - Tubba</title>
        <meta name="description" content="Hitta och köp företag i Sverige. Från tech-startups till etablerade verksamheter - upptäck möjligheter för företagsförvärv på Tubba." />
        <meta name="keywords" content="företag till salu, företagsförvärv, köp företag, M&A, företagsmäklare, Sweden" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Företag till salu
              </h1>
              <p className="text-lg text-gray-600">
                Upptäck lönsamma affärsmöjligheter från etablerade företag till snabbväxande startups. 
                Alla företag är verifierade och redo för överlåtelse.
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-8">
          <BusinessListings />
        </div>

        {/* Contact Seller Modal */}
        {selectedListing && (
          <ContactSellerModal
            isOpen={showContactModal}
            onClose={closeModals}
            listing={selectedListing}
            currentUser={mockCurrentUser}
          />
        )}

        {/* Make Offer Modal */}
        {selectedListing && (
          <MakeOfferModal
            isOpen={showOfferModal}
            onClose={closeModals}
            listing={selectedListing}
            currentUser={mockCurrentUser}
          />
        )}
      </div>
    </>
  );
};

export default BusinessListingsPage;