import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  DollarSign, 
  FileText, 
  Users, 
  MapPin, 
  Heart, 
  Calendar,
  TrendingUp,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import CommissionInfo from '../../components/business/CommissionInfo';
import { useAuthStore } from '../../stores/authStore';

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Grundläggande information
    title: '',
    category: 'companies',
    subcategory: '',
    industry: '',
    description: '',
    longDescription: '',
    
    // Ekonomisk information
    askingPrice: '',
    monthlyRevenue: '',
    monthlyProfit: '',
    yearlyRevenue: '',
    yearlyProfit: '',
    
    // Företagsdetaljer
    employees: '',
    foundedYear: '',
    businessType: 'AB',
    website: '',
    
    // Lokalisering
    location: '',
    address: '',
    showExactLocation: false,
    
    // Kontaktinformation
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    preferredContactMethod: 'email',
    
    // Highlights
    highlights: [''],
    
    // Avtal och villkor
    acceptTerms: false,
    acceptHeart: false,
    
    // Metadata
    reasonForSelling: '',
    timeframe: '',
    negotiable: true
  });

  const [showCommission, setShowCommission] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number; lng: number} | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { 
      id: 'companies', 
      name: 'Företag & Bolag',
      subcategories: ['aktiebolag', 'handelsbolag', 'enskild_firma', 'ekonomisk_forening'] 
    },
    { 
      id: 'ecommerce', 
      name: 'E-handel & Webshops',
      subcategories: ['webshop', 'marketplace', 'dropshipping', 'subscription'] 
    },
    { 
      id: 'domains', 
      name: 'Domäner & Webbplatser',
      subcategories: ['premium_domain', 'developed_site', 'parked_domain'] 
    },
    { 
      id: 'content', 
      name: 'Content & Media',
      subcategories: ['blog', 'youtube', 'podcast', 'newsletter'] 
    },
    { 
      id: 'social', 
      name: 'Social Media',
      subcategories: ['instagram', 'tiktok', 'facebook', 'linkedin'] 
    },
    { 
      id: 'affiliate', 
      name: 'Affiliate & Passive Income',
      subcategories: ['review_site', 'comparison_site', 'coupon_site', 'lead_generation'] 
    }
  ];

  const businessTypes = [
    { id: 'AB', name: 'Aktiebolag (AB)' },
    { id: 'HB', name: 'Handelsbolag (HB)' },
    { id: 'KB', name: 'Kommanditbolag (KB)' },
    { id: 'EF', name: 'Enskild firma' },
    { id: 'EK', name: 'Ekonomisk förening' },
    { id: 'OTHER', name: 'Annat' }
  ];

  const timeframes = [
    { id: 'immediate', name: 'Så snart som möjligt' },
    { id: '3months', name: 'Inom 3 månader' },
    { id: '6months', name: 'Inom 6 månader' },
    { id: '12months', name: 'Inom 12 månader' },
    { id: 'flexible', name: 'Flexibel tidsram' }
  ];

  const totalSteps = 4;

  // Geocoding function for address to coordinates
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;
    
    try {
      // Using a simple geocoding service (in production, use Google Maps API)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Sweden')}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setMapCoordinates({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Show commission calculator when price is entered
    if (field === 'askingPrice') {
      setShowCommission(value && parseFloat(value) > 0);
    }

    // Geocode address when location changes
    if (field === 'address' && value.length > 5) {
      geocodeAddress(value);
    }
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }));
  };

  const removeHighlight = (index: number) => {
    if (formData.highlights.length > 1) {
      setFormData(prev => ({
        ...prev,
        highlights: prev.highlights.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Företagsnamn är obligatoriskt';
        if (!formData.category) newErrors.category = 'Kategori är obligatorisk';
        if (!formData.description.trim()) newErrors.description = 'Beskrivning är obligatorisk';
        if (!formData.askingPrice || parseFloat(formData.askingPrice) <= 0) {
          newErrors.askingPrice = 'Giltigt pris är obligatoriskt';
        }
        break;
      
      case 2:
        if (!formData.employees) newErrors.employees = 'Antal anställda är obligatoriskt';
        if (!formData.foundedYear) newErrors.foundedYear = 'Grundat år är obligatoriskt';
        break;

      case 3:
        if (!formData.contactName.trim()) newErrors.contactName = 'Kontaktnamn är obligatoriskt';
        if (!formData.contactEmail.trim()) newErrors.contactEmail = 'E-post är obligatorisk';
        if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
          newErrors.contactEmail = 'Giltig e-post krävs';
        }
        break;

      case 4:
        if (!formData.acceptTerms) newErrors.acceptTerms = 'Du måste acceptera villkoren';
        if (!formData.acceptHeart) newErrors.acceptHeart = 'Du måste acceptera Heart-avtal';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    if (!authUser) {
      toast.error('Du måste vara inloggad för att skapa annonser');
      navigate('/simple-test-login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const listingId = `listing_${authUser.id}_${Date.now()}`;
      const submissionData = {
        id: listingId,
        ...formData,
        highlights: formData.highlights.filter(h => h.trim() !== ''),
        coordinates: mapCoordinates,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId: authUser.id,
        status: 'active',
        views: 0,
        favoriteCount: 0,
        inquiryCount: 0,
        price: parseInt(formData.askingPrice) || 0,
        sector: formData.industry || 'Annat',
        location: {
          city: formData.city || 'Sverige',
          region: formData.city || 'Sverige', 
          country: 'Sweden'
        },
        financials: {
          revenue: parseInt(formData.yearlyRevenue) || 0,
          ebitda: parseInt(formData.yearlyProfit) || 0,
          employees: parseInt(formData.employees) || 1,
          yearEstablished: parseInt(formData.foundedYear) || new Date().getFullYear()
        },
        seller: {
          name: `${authUser.firstName} ${authUser.lastName}`,
          verified: authUser.isEmailVerified,
          rating: 4.5,
          totalTransactions: 0
        },
        sellerId: authUser.id,
        category: formData.category,
        description: formData.description,
        featured: false,
        premium: false,
        images: formData.images?.length > 0 ? formData.images : [
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop'
        ],
        features: formData.highlights.filter(h => h.trim() !== '').slice(0, 6),
        listedAt: new Date(),
        updatedAt: new Date()
      };

      // Save to localStorage
      const existingListings = JSON.parse(localStorage.getItem(`userListings_${authUser.id}`) || '[]');
      const updatedListings = [...existingListings, submissionData];
      localStorage.setItem(`userListings_${authUser.id}`, JSON.stringify(updatedListings));

      toast.success('Annons skapad!');
      navigate('/dashboard', { 
        state: { 
          message: `Annons "${formData.title}" har skapats framgångsrikt!`,
          activeTab: 'listings'
        }
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Kunde inte skapa annons. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === formData.category);
  };

  const renderGoogleMap = () => {
    if (!mapCoordinates || !formData.showExactLocation) return null;

    return (
      <div className="mt-4">
        <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Karta kommer att visas här</p>
            <p className="text-xs text-gray-500">
              Lat: {mapCoordinates.lat.toFixed(4)}, Lng: {mapCoordinates.lng.toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Sälj ditt företag - 123Hansa</title>
        <meta name="description" content="Skapa en annons för ditt företag med 123Hansas professionella mäklarservice." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Sälj ditt företag
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Skapa en professionell annons med vår steg-för-steg guide
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Steg {currentStep} av {totalSteps}</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% klart</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            
            {/* Step indicators */}
            <div className="flex justify-between mt-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {step === 1 && 'Grundinfo'}
                    {step === 2 && 'Detaljer'}
                    {step === 3 && 'Kontakt'}
                    {step === 4 && 'Granska'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                
                {/* Step 1: Grundläggande Information */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Grundläggande information</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Företagsnamn *
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                              errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="t.ex. TechStartup AB"
                          />
                        </div>
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategori *
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                              errors.category ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Underkategori
                          </label>
                          <select
                            value={formData.subcategory}
                            onChange={(e) => handleInputChange('subcategory', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">Välj underkategori</option>
                            {getCurrentCategory()?.subcategories.map(sub => (
                              <option key={sub} value={sub}>{sub.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bransch
                        </label>
                        <input
                          type="text"
                          value={formData.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="t.ex. Fintech, E-handel, Konsulting"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Utropspris (SEK) *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={formData.askingPrice}
                            onChange={(e) => handleInputChange('askingPrice', e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                              errors.askingPrice ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="5000000"
                          />
                        </div>
                        {errors.askingPrice && <p className="mt-1 text-sm text-red-600">{errors.askingPrice}</p>}
                        
                        <div className="mt-2 flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.negotiable}
                            onChange={(e) => handleInputChange('negotiable', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Pris kan förhandlas</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kort beskrivning *
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                              errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Beskriv ditt företag kortfattat (max 300 tecken)..."
                            maxLength={300}
                          />
                        </div>
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        <p className="mt-1 text-xs text-gray-500">
                          {formData.description.length}/300 tecken
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Företagsdetaljer */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Företagsdetaljer</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Antal anställda *
                          </label>
                          <div className="relative">
                            <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              value={formData.employees}
                              onChange={(e) => handleInputChange('employees', e.target.value)}
                              className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                                errors.employees ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="25"
                              min="0"
                            />
                          </div>
                          {errors.employees && <p className="mt-1 text-sm text-red-600">{errors.employees}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grundat år *
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              value={formData.foundedYear}
                              onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                              className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                                errors.foundedYear ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="2015"
                              min="1900"
                              max={new Date().getFullYear()}
                            />
                          </div>
                          {errors.foundedYear && <p className="mt-1 text-sm text-red-600">{errors.foundedYear}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Företagsform
                          </label>
                          <select
                            value={formData.businessType}
                            onChange={(e) => handleInputChange('businessType', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          >
                            {businessTypes.map(type => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webbsida
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="https://www.dittforetag.se"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Månadsomsättning (SEK)
                          </label>
                          <div className="relative">
                            <TrendingUp className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              value={formData.monthlyRevenue}
                              onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="500000"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Månadsvinst (SEK)
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              value={formData.monthlyProfit}
                              onChange={(e) => handleInputChange('monthlyProfit', e.target.value)}
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="150000"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Detaljerad beskrivning
                        </label>
                        <textarea
                          value={formData.longDescription}
                          onChange={(e) => handleInputChange('longDescription', e.target.value)}
                          rows={6}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="Beskriv företaget i detalj - historia, affärsmodell, framtidsutsikter..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Företagets styrkor och highlights
                        </label>
                        <div className="space-y-3">
                          {formData.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={highlight}
                                onChange={(e) => updateHighlight(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                placeholder="t.ex. Stark tillväxt 300% årligen"
                              />
                              {formData.highlights.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeHighlight(index)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addHighlight}
                            className="flex items-center text-emerald-600 hover:text-emerald-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Lägg till highlight
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Anledning till försäljning
                        </label>
                        <select
                          value={formData.reasonForSelling}
                          onChange={(e) => handleInputChange('reasonForSelling', e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Välj anledning</option>
                          <option value="retirement">Pension</option>
                          <option value="new_venture">Nytt projekt</option>
                          <option value="relocation">Flytt</option>
                          <option value="health">Hälsoskäl</option>
                          <option value="partnership">Partnerskap</option>
                          <option value="other">Annat</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Önskad tidsram för försäljning
                        </label>
                        <select
                          value={formData.timeframe}
                          onChange={(e) => handleInputChange('timeframe', e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          {timeframes.map(tf => (
                            <option key={tf.id} value={tf.id}>{tf.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Lokalisering och Kontakt */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Lokalisering och kontakt</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stad/Ort
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="Stockholm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fullständig adress (valfritt)
                          </label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Storgatan 1, 111 22 Stockholm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.showExactLocation}
                          onChange={(e) => handleInputChange('showExactLocation', e.target.checked)}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700">
                          Visa exakt plats på karta (rekommenderas för fysiska verksamheter)
                        </span>
                      </div>

                      {renderGoogleMap()}

                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontaktinformation</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kontaktperson *
                            </label>
                            <input
                              type="text"
                              value={formData.contactName}
                              onChange={(e) => handleInputChange('contactName', e.target.value)}
                              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                                errors.contactName ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Ditt namn"
                            />
                            {errors.contactName && <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Föredragen kontaktmetod
                            </label>
                            <select
                              value={formData.preferredContactMethod}
                              onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="email">E-post</option>
                              <option value="phone">Telefon</option>
                              <option value="both">Både e-post och telefon</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              E-post *
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                                  errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="din@email.se"
                              />
                            </div>
                            {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Telefon
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <input
                                type="tel"
                                value={formData.contactPhone}
                                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                placeholder="+46 70 123 45 67"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Granska och Skicka */}
                {currentStep === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Granska och skicka</h2>
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Sammanfattning av din annons</h3>
                        <div className="space-y-3 text-sm">
                          <div><strong>Företag:</strong> {formData.title}</div>
                          <div><strong>Kategori:</strong> {categories.find(c => c.id === formData.category)?.name}</div>
                          <div><strong>Pris:</strong> {parseInt(formData.askingPrice).toLocaleString('sv-SE')} SEK</div>
                          <div><strong>Anställda:</strong> {formData.employees}</div>
                          <div><strong>Plats:</strong> {formData.location}</div>
                          <div><strong>Kontakt:</strong> {formData.contactName} ({formData.contactEmail})</div>
                        </div>
                      </div>

                      {/* Heart Agreement */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={formData.acceptHeart}
                            onChange={(e) => handleInputChange('acceptHeart', e.target.checked)}
                            className="mt-1 mr-3"
                          />
                          <div>
                            <div className="flex items-center mb-2">
                              <Heart className="w-5 h-5 text-purple-600 mr-2" />
                              <span className="font-medium text-purple-900">Heart Avtalsstöd</span>
                            </div>
                            <p className="text-sm text-purple-800">
                              Jag godkänner att alla avtal hanteras via Heart-appen för säker digital signering 
                              och escrow-tjänster. Detta säkerställer transparens och trygghet för alla parter.
                            </p>
                          </div>
                        </div>
                        {errors.acceptHeart && <p className="mt-2 text-sm text-red-600">{errors.acceptHeart}</p>}
                      </div>

                      {/* Terms */}
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.acceptTerms}
                          onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                          className="mt-1 mr-3"
                        />
                        <p className="text-sm text-gray-600">
                          Jag accepterar 123Hansas användarvillkor och förstår att 3% mäklararvode debiteras vid genomförd försäljning.
                          Jag intygar att all information är korrekt och att jag har rätt att sälja företaget.
                        </p>
                      </div>
                      {errors.acceptTerms && <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Föregående
                  </button>

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
                    >
                      Nästa
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all duration-200"
                    >
                      {isSubmitting ? 'Skickar...' : 'Publicera annons'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Commission Info */}
              {showCommission && formData.askingPrice && (
                <CommissionInfo 
                  salePrice={parseFloat(formData.askingPrice)} 
                  className="sticky top-6"
                />
              )}

              {/* Progress Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-4">Vad händer sen?</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
                    <span>Automatisk granskning av din annons</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
                    <span>Manuell verifiering inom 24 timmar</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
                    <span>Publicering på 123Hansa marketplace</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
                    <span>Kvalificerade köpare kontaktar dig</span>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-4">Fördelar med 123Hansa</h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Endast 3% provision vid genomförd affär</li>
                  <li>• Säkra avtal via Heart-appen</li>
                  <li>• Professionell marknadsföring</li>
                  <li>• Kvalificerade köpare</li>
                  <li>• Juridisk support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateListingPage;