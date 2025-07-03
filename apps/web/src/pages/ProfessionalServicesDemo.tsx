import React, { useState } from 'react';
import { ExpertDirectory } from '../components/professionals/ExpertDirectory';
import { ProfessionalProfile } from '../components/professionals/ProfessionalProfile';
import { ConsultationBooking } from '../components/professionals/ConsultationBooking';
import { ReviewManager } from '../components/professionals/ReviewManager';
import { ReviewForm } from '../components/professionals/ReviewForm';

export default function ProfessionalServicesDemo() {
  const [currentView, setCurrentView] = useState<'directory' | 'profile' | 'booking' | 'reviews' | 'demo'>('demo');
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Mock professional data
  const mockProfessional = {
    id: '1',
    userId: 'user-1',
    professionalTitle: 'Senior Företagsjurist',
    businessName: 'Nordic Legal Advisory AB',
    user: {
      firstName: 'Anna',
      lastName: 'Lindqvist',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face'
    }
  };

  // Mock booking data
  const mockBooking = {
    id: 'booking-1',
    title: 'Juridisk rådgivning - Företagsförvärv',
    serviceType: 'Legal Advisory',
    completedAt: new Date().toISOString(),
    professional: mockProfessional
  };

  const handleViewProfessional = (professional: any) => {
    setSelectedProfessional(professional);
    setCurrentView('profile');
  };

  const handleBookConsultation = (professional: any) => {
    setSelectedProfessional(professional);
    setShowBookingModal(true);
  };

  const handleContactProfessional = (professional: any) => {
    alert(`Kontaktar ${professional.user?.firstName} ${professional.user?.lastName || professional.professionalTitle}`);
  };

  const handleBookingSuccess = (bookingId: string) => {
    setShowBookingModal(false);
    alert(`Konsultationsförfrågan skickad! Booking ID: ${bookingId}`);
  };

  const handleReviewSubmit = async (reviewData: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowReviewForm(false);
    alert('Recension sparad!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Professional Services Demo
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('demo')}
                className={`px-3 py-2 text-sm rounded-md ${
                  currentView === 'demo'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Demo Info
              </button>
              <button
                onClick={() => setCurrentView('directory')}
                className={`px-3 py-2 text-sm rounded-md ${
                  currentView === 'directory'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Expert Directory
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-3 py-2 text-sm rounded-md ${
                  currentView === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Professional Profile
              </button>
              <button
                onClick={() => setCurrentView('reviews')}
                className={`px-3 py-2 text-sm rounded-md ${
                  currentView === 'reviews'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Info */}
      {currentView === 'demo' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🎉 Professional Services System - Session 11
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Välkommen till den kompletta Professional Services-implementationen! 
                Detta system transformerar Tubba från en enkel marknadsplats till ett 
                fullständigt affärsekosystem där företag kan hitta och anlita verifierade experter.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    🔍 Expert Directory
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Avancerad sökning och filtrering av verifierade experter. 
                    Stöder kategorier, platser, priser, betyg och språk.
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">
                    👤 Professional Profiles
                  </h3>
                  <p className="text-green-700 text-sm">
                    Detaljerade profiler med verifieringsmeriter, erfarenhet, 
                    tjänster och kundrecensioner.
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">
                    📅 Consultation Booking
                  </h3>
                  <p className="text-purple-700 text-sm">
                    Flerstegig bokningsprocess med kalenderintegration, 
                    konfliktdetektering och automatisk bekräftelse.
                  </p>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">
                    ⭐ Review System
                  </h3>
                  <p className="text-orange-700 text-sm">
                    Omfattande betygs- och recensionssystem med detaljerade 
                    kategorier och professionella svar.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🚀 Funktioner att testa:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Sök efter experter med olika filter (kategori, pris, betyg)</li>
                  <li>Visa detaljerade profiler med verifieringsmeriter</li>
                  <li>Boka konsultationer genom flerstegig wizard</li>
                  <li>Läs och skriv recensioner med detaljerade betyg</li>
                  <li>Se hur experter kan svara på recensioner</li>
                  <li>Upplev komplett svenska lokalisering</li>
                </ul>
              </div>

              <div className="bg-blue-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">
                  💡 Demo Data
                </h3>
                <p className="text-blue-100">
                  Systemet använder realistisk svensk demo-data med verifierade experter 
                  inom juridik, företagsmäkling och redovisning. All funktionalitet 
                  är fullt fungerande med mock API-endpoints.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expert Directory */}
      {currentView === 'directory' && (
        <ExpertDirectory
          onSelectExpert={handleViewProfessional}
          onContactExpert={handleContactProfessional}
          onBookConsultation={handleBookConsultation}
        />
      )}

      {/* Professional Profile */}
      {currentView === 'profile' && (
        <ProfessionalProfile
          professionalId="1"
          onContactProfessional={handleContactProfessional}
          onBookConsultation={handleBookConsultation}
          onViewService={(serviceId) => alert(`Viewing service: ${serviceId}`)}
        />
      )}

      {/* Reviews */}
      {currentView === 'reviews' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Skriv recension (Demo)
            </button>
          </div>
          
          <ReviewManager
            professional={mockProfessional}
            canWriteReview={true}
            pendingBooking={mockBooking}
            onWriteReview={() => setShowReviewForm(true)}
            onMarkHelpful={(reviewId) => alert(`Marked review ${reviewId} as helpful`)}
            onReport={(reviewId) => alert(`Reported review ${reviewId}`)}
            onReply={(reviewId) => alert(`Replying to review ${reviewId}`)}
          />
        </div>
      )}

      {/* Consultation Booking Modal */}
      {showBookingModal && selectedProfessional && (
        <ConsultationBooking
          professional={selectedProfessional}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          booking={mockBooking}
          onSubmit={handleReviewSubmit}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
}