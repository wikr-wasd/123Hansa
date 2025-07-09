import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Video, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Euro,
  Info,
  Send,
  X
} from 'lucide-react';

interface Professional {
  id: string;
  userId: string;
  professionalTitle: string;
  businessName?: string;
  hourlyRate?: number;
  consultationFee?: number;
  currency: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ConsultationBookingProps {
  professional: Professional;
  serviceListingId?: string;
  onClose: () => void;
  onSuccess?: (bookingId: string) => void;
}

interface BookingForm {
  title: string;
  description: string;
  consultationFormat: string;
  urgency: string;
  budget?: number;
  estimatedDuration: string;
  requiredExpertise: string[];
  specificRequirements: string[];
  preferredDates: Array<{
    date: string;
    timeSlots: string[];
  }>;
  confidentiality: boolean;
  preferredLocation?: string;
  canTravel: boolean;
}

const CONSULTATION_FORMATS = [
  { value: 'VIDEO_CALL', label: 'Videosamtal', icon: Video, description: 'Bekvämt från ditt kontor' },
  { value: 'PHONE_CALL', label: 'Telefonsamtal', icon: Phone, description: 'Snabb och effektiv kontakt' },
  { value: 'IN_PERSON', label: 'Personligt möte', icon: User, description: 'Ansikte mot ansikte' },
  { value: 'EMAIL_CONSULTATION', label: 'E-postkonsultation', icon: Mail, description: 'Skriftlig rådgivning' },
  { value: 'DOCUMENT_REVIEW', label: 'Dokumentgranskning', icon: FileText, description: 'Granskning av dokument' }
];

const URGENCY_LEVELS = [
  { value: 'LOW', label: 'Låg prioritet', description: 'Inom 1-2 veckor', color: 'text-gray-600' },
  { value: 'NORMAL', label: 'Normal prioritet', description: 'Inom några dagar', color: 'text-blue-600' },
  { value: 'HIGH', label: 'Hög prioritet', description: 'Inom 24-48 timmar', color: 'text-orange-600' },
  { value: 'URGENT', label: 'Akut', description: 'Samma dag', color: 'text-red-600' }
];

const EXPERTISE_AREAS = [
  'LEGAL_SERVICES',
  'BUSINESS_BROKERAGE', 
  'FINANCIAL_ADVISORY',
  'ACCOUNTING',
  'BUSINESS_CONSULTING',
  'DUE_DILIGENCE',
  'VALUATION_SERVICES',
  'TAX_ADVISORY',
  'MERGER_ACQUISITION',
  'CONTRACT_REVIEW'
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

export const ConsultationBooking: React.FC<ConsultationBookingProps> = ({
  professional,
  serviceListingId,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BookingForm>({
    title: '',
    description: '',
    consultationFormat: 'VIDEO_CALL',
    urgency: 'NORMAL',
    budget: professional.consultationFee || professional.hourlyRate,
    estimatedDuration: '1 timme',
    requiredExpertise: [],
    specificRequirements: [],
    preferredDates: [],
    confidentiality: true,
    preferredLocation: '',
    canTravel: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateForm = (field: keyof BookingForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addPreferredDate = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    setForm(prev => ({
      ...prev,
      preferredDates: [
        ...prev.preferredDates,
        {
          date: nextWeek.toISOString().split('T')[0],
          timeSlots: []
        }
      ]
    }));
  };

  const updatePreferredDate = (index: number, field: 'date' | 'timeSlots', value: any) => {
    setForm(prev => ({
      ...prev,
      preferredDates: prev.preferredDates.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePreferredDate = (index: number) => {
    setForm(prev => ({
      ...prev,
      preferredDates: prev.preferredDates.filter((_, i) => i !== index)
    }));
  };

  const toggleTimeSlot = (dateIndex: number, timeSlot: string) => {
    const currentSlots = form.preferredDates[dateIndex].timeSlots;
    const newSlots = currentSlots.includes(timeSlot)
      ? currentSlots.filter(slot => slot !== timeSlot)
      : [...currentSlots, timeSlot];
    
    updatePreferredDate(dateIndex, 'timeSlots', newSlots);
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (stepNumber === 1) {
      if (!form.title.trim()) newErrors.title = 'Titel är obligatorisk';
      if (!form.description.trim()) newErrors.description = 'Beskrivning är obligatorisk';
      if (form.description.length < 50) newErrors.description = 'Beskrivning måste vara minst 50 tecken';
    }

    if (stepNumber === 2) {
      if (form.requiredExpertise.length === 0) {
        newErrors.requiredExpertise = 'Välj minst ett expertområde';
      }
    }

    if (stepNumber === 3) {
      if (form.preferredDates.length === 0) {
        newErrors.preferredDates = 'Lägg till minst ett önskat datum';
      }
      if (form.preferredDates.some(date => date.timeSlots.length === 0)) {
        newErrors.preferredDates = 'Välj minst en tidslucka för varje datum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    try {
      setLoading(true);

      const requestData = {
        professionalId: professional.userId,
        serviceListingId,
        title: form.title,
        description: form.description,
        urgency: form.urgency,
        budget: form.budget,
        preferredFormat: form.consultationFormat,
        preferredDates: form.preferredDates,
        estimatedDuration: form.estimatedDuration,
        requiredExpertise: form.requiredExpertise,
        specificRequirements: form.specificRequirements,
        confidentiality: form.confidentiality,
        preferredLocation: form.preferredLocation,
        canTravel: form.canTravel
      };

      const response = await fetch('/api/consultations/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.(data.data.id);
      } else {
        throw new Error(data.message || 'Failed to create consultation request');
      }
    } catch (error) {
      console.error('Error creating consultation request:', error);
      setErrors({ submit: 'Kunde inte skicka förfrågan. Försök igen.' });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: professional.currency || 'SEK',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getExpertiseLabel = (expertise: string) => {
    const labels: { [key: string]: string } = {
      'LEGAL_SERVICES': 'Juridiska tjänster',
      'BUSINESS_BROKERAGE': 'Företagsmäklare',
      'FINANCIAL_ADVISORY': 'Finansiell rådgivning',
      'ACCOUNTING': 'Redovisning',
      'BUSINESS_CONSULTING': 'Affärskonsulting',
      'DUE_DILIGENCE': 'Due Diligence',
      'VALUATION_SERVICES': 'Värderingstjänster',
      'TAX_ADVISORY': 'Skatterådgivning',
      'MERGER_ACQUISITION': 'M&A',
      'CONTRACT_REVIEW': 'Avtalsgenomgång'
    };
    return labels[expertise] || expertise;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Boka konsultation
            </h2>
            <p className="text-sm text-gray-600">
              med {professional.user.firstName} {professional.user.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stepNumber <= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber < step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Beskrivning</span>
            <span>Expertområde</span>
            <span>Tidpunkter</span>
            <span>Bekräftelse</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Beskriv ditt konsultationsbehov
              </h3>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="t.ex. Juridisk granskning av försäljningsavtal"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detaljerad beskrivning <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={4}
                  placeholder="Beskriv detaljerat vad du behöver hjälp med, bakgrund, och vad du förväntar dig av konsultationen..."
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {form.description.length}/2000 tecken (minst 50 tecken)
                </p>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioritetsnivå
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {URGENCY_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        form.urgency === level.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={level.value}
                        checked={form.urgency === level.value}
                        onChange={(e) => updateForm('urgency', e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <p className={`font-medium ${level.color}`}>{level.label}</p>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Consultation Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Önskad konsultationsform
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {CONSULTATION_FORMATS.map((format) => {
                    const IconComponent = format.icon;
                    return (
                      <label
                        key={format.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          form.consultationFormat === format.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="consultationFormat"
                          value={format.value}
                          checked={form.consultationFormat === format.value}
                          onChange={(e) => updateForm('consultationFormat', e.target.value)}
                          className="sr-only"
                        />
                        <IconComponent className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{format.label}</p>
                          <p className="text-sm text-gray-600">{format.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Expertområden och krav
              </h3>

              {/* Required Expertise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vilka expertområden behöver du hjälp med? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {EXPERTISE_AREAS.map((expertise) => (
                    <label
                      key={expertise}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        form.requiredExpertise.includes(expertise)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.requiredExpertise.includes(expertise)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateForm('requiredExpertise', [...form.requiredExpertise, expertise]);
                          } else {
                            updateForm('requiredExpertise', form.requiredExpertise.filter(e => e !== expertise));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {getExpertiseLabel(expertise)}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.requiredExpertise && (
                  <p className="mt-1 text-sm text-red-600">{errors.requiredExpertise}</p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={form.budget || ''}
                    onChange={(e) => updateForm('budget', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ange din budget"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {professional.consultationFee && (
                  <p className="mt-1 text-sm text-gray-600">
                    Expertens konsultationsavgift: {formatPrice(professional.consultationFee)}
                  </p>
                )}
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uppskattad tidsåtgång
                </label>
                <select
                  value={form.estimatedDuration}
                  onChange={(e) => updateForm('estimatedDuration', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30 minuter">30 minuter</option>
                  <option value="1 timme">1 timme</option>
                  <option value="1.5 timmar">1.5 timmar</option>
                  <option value="2 timmar">2 timmar</option>
                  <option value="Halvdag">Halvdag</option>
                  <option value="Heldag">Heldag</option>
                  <option value="Flera dagar">Flera dagar</option>
                </select>
              </div>

              {/* Specific Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specifika krav eller önskemål
                </label>
                <textarea
                  value={form.specificRequirements.join('\n')}
                  onChange={(e) => updateForm('specificRequirements', e.target.value.split('\n').filter(req => req.trim()))}
                  rows={3}
                  placeholder="t.ex. Erfarenhet av mitt bransch, språkkrav, certifieringar..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Önskade tidpunkter
              </h3>

              {/* Preferred Dates */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Välj datum och tider <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={addPreferredDate}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Lägg till datum
                  </button>
                </div>

                {form.preferredDates.map((dateSlot, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="date"
                        value={dateSlot.date}
                        onChange={(e) => updatePreferredDate(index, 'date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removePreferredDate(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((timeSlot) => (
                        <button
                          key={timeSlot}
                          onClick={() => toggleTimeSlot(index, timeSlot)}
                          className={`p-2 text-sm border rounded-md ${
                            dateSlot.timeSlots.includes(timeSlot)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {timeSlot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {form.preferredDates.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Ingen datum tillagda än</p>
                    <button
                      onClick={addPreferredDate}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Lägg till ditt första datum
                    </button>
                  </div>
                )}

                {errors.preferredDates && (
                  <p className="mt-1 text-sm text-red-600">{errors.preferredDates}</p>
                )}
              </div>

              {/* Location (for in-person meetings) */}
              {form.consultationFormat === 'IN_PERSON' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Föredragen plats för mötet
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={form.preferredLocation || ''}
                        onChange={(e) => updateForm('preferredLocation', e.target.value)}
                        placeholder="t.ex. Stockholm centrum, mitt kontor, expertens kontor"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.canTravel}
                      onChange={(e) => updateForm('canTravel', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      Jag kan resa för att träffa experten
                    </span>
                  </label>
                </div>
              )}

              {/* Confidentiality */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">
                      Sekretess och konfidentialitet
                    </h4>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={form.confidentiality}
                        onChange={(e) => updateForm('confidentiality', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3 mt-1"
                      />
                      <span className="text-sm text-yellow-700">
                        Jag vill att denna konsultation ska vara konfidentiell. 
                        Experten kommer att underteckna ett sekretessavtal innan mötet.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Bekräfta din förfrågan
              </h3>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Sammanfattning</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expert:</span>
                    <span className="font-medium">
                      {professional.user.firstName} {professional.user.lastName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Titel:</span>
                    <span className="font-medium">{form.title}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">
                      {CONSULTATION_FORMATS.find(f => f.value === form.consultationFormat)?.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prioritet:</span>
                    <span className="font-medium">
                      {URGENCY_LEVELS.find(u => u.value === form.urgency)?.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uppskattat tid:</span>
                    <span className="font-medium">{form.estimatedDuration}</span>
                  </div>
                  
                  {form.budget && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">{formatPrice(form.budget)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Antal önskade datum:</span>
                    <span className="font-medium">{form.preferredDates.length}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                      Vad händer näst?
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Experten får din förfrågan omedelbart</li>
                      <li>• Du får ett svar inom {URGENCY_LEVELS.find(u => u.value === form.urgency)?.description.toLowerCase()}</li>
                      <li>• Om experten accepterar kan ni koordinera final tidpunkt</li>
                      <li>• Betalning sker efter genomförd konsultation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Tillbaka
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Avbryt
            </button>
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                Nästa
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Skickar...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Skicka förfrågan
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};