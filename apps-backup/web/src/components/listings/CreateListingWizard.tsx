import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { listingService, CreateListingRequest, ListingCategory, BusinessType } from '../../services/listingService';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// Step components
import BasicInfoStep from './wizard/BasicInfoStep';
import BusinessDetailsStep from './wizard/BusinessDetailsStep';
import FinancialInfoStep from './wizard/FinancialInfoStep';
import MediaUploadStep from './wizard/MediaUploadStep';
import ReviewStep from './wizard/ReviewStep';

export interface ListingFormData extends CreateListingRequest {
  images?: File[];
  documents?: File[];
}

const STEPS = [
  { id: 1, title: 'Grundläggande info', description: 'Titel, kategori och beskrivning' },
  { id: 2, title: 'Företagsdetaljer', description: 'Typ, plats och webbsida' },
  { id: 3, title: 'Finansiell info', description: 'Pris, intäkter och anställda' },
  { id: 4, title: 'Bilder & dokument', description: 'Ladda upp media' },
  { id: 5, title: 'Granska & publicera', description: 'Kontrollera och skicka in' },
];

const CreateListingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    shortDescription: '',
    category: 'BUSINESS' as ListingCategory,
    subcategory: '',
    businessType: 'AB' as BusinessType,
    askingPrice: undefined,
    currency: 'SEK',
    isNegotiable: true,
    monthlyRevenue: undefined,
    monthlyProfit: undefined,
    employees: undefined,
    establishedYear: undefined,
    website: '',
    location: '',
    isRemote: false,
    reasonForSale: '',
    includedAssets: [],
    images: [],
    documents: [],
  });

  const updateFormData = useCallback((data: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (publish: boolean = false) => {
    setIsLoading(true);
    try {
      // Create listing data without files
      const { images, documents, ...listingData } = formData;
      
      // Create the listing
      const createdListing = await listingService.createListing(listingData);
      
      // Upload images if any
      if (images && images.length > 0) {
        await listingService.uploadImages(createdListing.id, images);
      }
      
      // Upload documents if any
      if (documents && documents.length > 0) {
        await listingService.uploadDocuments(createdListing.id, documents);
      }
      
      // Publish if requested
      if (publish) {
        await listingService.publishListing(createdListing.id);
        toast.success('Företaget har publicerats och väntar på granskning!');
      } else {
        toast.success('Företaget har sparats som utkast!');
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Något gick fel');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <BusinessDetailsStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <FinancialInfoStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <MediaUploadStep
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <ReviewStep
            data={formData}
            updateData={updateFormData}
            onPrev={prevStep}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Sälja ditt företag - Tubba</title>
        <meta name="description" content="Skapa en annons för att sälja ditt företag på Tubba, Nordens ledande företagsmarknadsplats." />
      </Helmet>

      <div className="min-h-screen bg-nordic-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-nordic-gray-900 mb-2">
              Sälja ditt företag
            </h1>
            <p className="text-lg text-nordic-gray-600">
              Skapa en professionell annons för att nå tusentals potentiella köpare
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step.id
                          ? 'bg-nordic-blue-600 text-white'
                          : 'bg-nordic-gray-200 text-nordic-gray-600'
                      }`}
                    >
                      {step.id}
                    </div>
                    <div className="ml-3 hidden md:block">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-nordic-blue-600' : 'text-nordic-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-nordic-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-nordic-blue-600' : 'bg-nordic-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="card">
            <div className="card-body">
              {renderStep()}
            </div>
          </div>

          {/* Auto-save indicator */}
          <div className="mt-4 text-center">
            <p className="text-sm text-nordic-gray-500">
              💾 Dina ändringar sparas automatiskt
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateListingWizard;