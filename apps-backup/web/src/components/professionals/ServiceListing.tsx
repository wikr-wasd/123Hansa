import React, { useState } from 'react';
import { 
  Clock, 
  Star, 
  User, 
  CheckCircle, 
  Tag, 
  Calendar, 
  FileText, 
  Video, 
  Phone, 
  Mail, 
  MapPin,
  Euro,
  Users,
  Briefcase,
  Award
} from 'lucide-react';

interface ServiceListing {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  serviceType: string;
  basePrice: number;
  currency: string;
  pricingModel: string;
  minimumEngagement?: number;
  estimatedDuration?: string;
  deliverables: string[];
  prerequisites: string[];
  consultationFormats: string[];
  tags: string[];
  isActive: boolean;
  viewCount: number;
  inquiryCount: number;
  bookingCount: number;
  professional: {
    id: string;
    professionalTitle: string;
    businessName?: string;
    verificationStatus: string;
    averageRating?: number;
    totalReviews: number;
    completedBookings: number;
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
      country: string;
      isOnline: boolean;
    };
  };
  _count?: {
    bookings: number;
  };
}

interface ServiceListingProps {
  service: ServiceListing;
  onBookService?: (service: ServiceListing) => void;
  onContactProfessional?: (service: ServiceListing) => void;
  onViewProfessional?: (professionalId: string) => void;
  variant?: 'card' | 'list' | 'detailed';
}

export const ServiceListingComponent: React.FC<ServiceListingProps> = ({
  service,
  onBookService,
  onContactProfessional,
  onViewProfessional,
  variant = 'card'
}) => {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency || 'SEK',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'LEGAL_SERVICES': '⚖️',
      'BUSINESS_BROKERAGE': '🏢',
      'FINANCIAL_ADVISORY': '💰',
      'ACCOUNTING': '📊',
      'BUSINESS_CONSULTING': '📈',
      'DUE_DILIGENCE': '🔍',
      'VALUATION_SERVICES': '💎',
      'TAX_ADVISORY': '📋',
      'MERGER_ACQUISITION': '🤝',
      'CONTRACT_REVIEW': '📄'
    };
    return icons[category] || '💼';
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
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
    return names[category] || category;
  };

  const getServiceTypeIcon = (serviceType: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'CONSULTATION': User,
      'DOCUMENT_REVIEW': FileText,
      'DUE_DILIGENCE': CheckCircle,
      'VALUATION': Award,
      'LEGAL_REPRESENTATION': Briefcase,
      'TRANSACTION_SUPPORT': Users,
      'ONGOING_ADVISORY': Calendar,
      'CUSTOM': Tag
    };
    return icons[serviceType] || Briefcase;
  };

  const getConsultationFormatIcon = (format: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'VIDEO_CALL': Video,
      'PHONE_CALL': Phone,
      'IN_PERSON': MapPin,
      'EMAIL_CONSULTATION': Mail,
      'DOCUMENT_REVIEW': FileText
    };
    return icons[format] || Video;
  };

  const getConsultationFormatLabel = (format: string) => {
    const labels: { [key: string]: string } = {
      'VIDEO_CALL': 'Video',
      'PHONE_CALL': 'Telefon',
      'IN_PERSON': 'Personligt',
      'EMAIL_CONSULTATION': 'E-post',
      'DOCUMENT_REVIEW': 'Dokument'
    };
    return labels[format] || format;
  };

  const getPricingModelLabel = (model: string) => {
    const labels: { [key: string]: string } = {
      'HOURLY': 'per timme',
      'FIXED': 'fast pris',
      'CUSTOM': 'anpassat'
    };
    return labels[model] || model;
  };

  if (variant === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {service.professional.user.avatar && !imageError ? (
                  <img
                    src={service.professional.user.avatar}
                    alt={`${service.professional.user.firstName} ${service.professional.user.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{service.title}</h3>
                    <button
                      onClick={() => onViewProfessional?.(service.professional.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {service.professional.user.firstName} {service.professional.user.lastName}
                      {service.professional.verificationStatus === 'VERIFIED' && (
                        <CheckCircle className="inline w-4 h-4 text-green-500 ml-1" />
                      )}
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(service.basePrice, service.currency)}
                    </p>
                    <p className="text-sm text-gray-500">{getPricingModelLabel(service.pricingModel)}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {service.shortDescription || service.description}
                </p>

                <div className="flex items-center gap-4 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {getCategoryIcon(service.category)}
                    {getCategoryName(service.category)}
                  </span>

                  {service.estimatedDuration && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {service.estimatedDuration}
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">
                      {service.professional.averageRating?.toFixed(1) || 'Nytt'} ({service.professional.totalReviews})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {service.consultationFormats.slice(0, 3).map((format, index) => {
                    const IconComponent = getConsultationFormatIcon(format);
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        title={getConsultationFormatLabel(format)}
                      >
                        <IconComponent className="w-3 h-3" />
                        {getConsultationFormatLabel(format)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <button
              onClick={() => onBookService?.(service)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Boka tjänst
            </button>
            <button
              onClick={() => onContactProfessional?.(service)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
            >
              Kontakta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {getCategoryIcon(service.category)}
                  {getCategoryName(service.category)}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {React.createElement(getServiceTypeIcon(service.serviceType), { className: "w-4 h-4" })}
                  {service.serviceType}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(service.basePrice, service.currency)}
              </p>
              <p className="text-gray-600">{getPricingModelLabel(service.pricingModel)}</p>
              {service.minimumEngagement && (
                <p className="text-sm text-gray-500">
                  Min. {service.minimumEngagement} timmar
                </p>
              )}
            </div>
          </div>

          {/* Professional Info */}
          <div className="flex items-center gap-4">
            {service.professional.user.avatar && !imageError ? (
              <img
                src={service.professional.user.avatar}
                alt={`${service.professional.user.firstName} ${service.professional.user.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            )}
            
            <div>
              <button
                onClick={() => onViewProfessional?.(service.professional.id)}
                className="text-lg font-medium text-blue-600 hover:text-blue-800"
              >
                {service.professional.user.firstName} {service.professional.user.lastName}
                {service.professional.verificationStatus === 'VERIFIED' && (
                  <CheckCircle className="inline w-5 h-5 text-green-500 ml-2" />
                )}
              </button>
              <p className="text-gray-600">{service.professional.professionalTitle}</p>
              {service.professional.businessName && (
                <p className="text-sm text-gray-500">{service.professional.businessName}</p>
              )}
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {service.professional.averageRating?.toFixed(1) || 'Nytt'}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({service.professional.totalReviews} recensioner)
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {service.professional.completedBookings} genomförda uppdrag
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Beskrivning</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Service Details */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tjänstedetaljer</h4>
              <div className="space-y-2 text-sm">
                {service.estimatedDuration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Uppskattad tid:</span>
                    <span className="font-medium">{service.estimatedDuration}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Prissättning:</span>
                  <span className="font-medium">{getPricingModelLabel(service.pricingModel)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Bokningar:</span>
                  <span className="font-medium">{service._count?.bookings || 0} genomförda</span>
                </div>
              </div>
            </div>

            {/* Consultation Formats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tillgängliga format</h4>
              <div className="space-y-2">
                {service.consultationFormats.map((format, index) => {
                  const IconComponent = getConsultationFormatIcon(format);
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        {getConsultationFormatLabel(format)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Deliverables */}
          {service.deliverables.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Vad du får</h4>
              <ul className="space-y-2">
                {service.deliverables.map((deliverable, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {service.prerequisites.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Vad du behöver förbereda</h4>
              <ul className="space-y-2">
                {service.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {service.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Nyckelord</h4>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span>{service.viewCount} visningar</span>
              <span className="mx-2">•</span>
              <span>{service.inquiryCount} förfrågningar</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onContactProfessional?.(service)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Kontakta expert
              </button>
              <button
                onClick={() => onBookService?.(service)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Boka denna tjänst
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default 'card' variant
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
              {service.title}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {getCategoryIcon(service.category)}
              {getCategoryName(service.category)}
            </span>
          </div>
          <div className="text-right ml-4">
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(service.basePrice, service.currency)}
            </p>
            <p className="text-xs text-gray-500">{getPricingModelLabel(service.pricingModel)}</p>
          </div>
        </div>

        {/* Professional Info */}
        <div className="flex items-center gap-3 mb-4">
          {service.professional.user.avatar && !imageError ? (
            <img
              src={service.professional.user.avatar}
              alt={`${service.professional.user.firstName} ${service.professional.user.lastName}`}
              className="w-8 h-8 rounded-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <button
              onClick={() => onViewProfessional?.(service.professional.id)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium truncate block"
            >
              {service.professional.user.firstName} {service.professional.user.lastName}
              {service.professional.verificationStatus === 'VERIFIED' && (
                <CheckCircle className="inline w-3 h-3 text-green-500 ml-1" />
              )}
            </button>
            
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">
                {service.professional.averageRating?.toFixed(1) || 'Nytt'} ({service.professional.totalReviews})
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {service.shortDescription || service.description}
        </p>

        {/* Service Info */}
        <div className="space-y-2 mb-4">
          {service.estimatedDuration && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{service.estimatedDuration}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {service.consultationFormats.slice(0, 3).map((format, index) => {
              const IconComponent = getConsultationFormatIcon(format);
              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  <IconComponent className="w-3 h-3" />
                  {getConsultationFormatLabel(format)}
                </span>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{service.viewCount} visningar</span>
          <span>{service._count?.bookings || 0} bokningar</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => onBookService?.(service)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Boka tjänst
          </button>
          <button
            onClick={() => onContactProfessional?.(service)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};