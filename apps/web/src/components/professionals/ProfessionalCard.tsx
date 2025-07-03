import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Users,
  Mail,
  Phone,
  ExternalLink,
  Calendar,
  Award,
  TrendingUp,
  MessageCircle
} from 'lucide-react';

interface Professional {
  id: string;
  userId: string;
  professionalTitle: string;
  businessName?: string;
  serviceCategories: string[];
  specializations: string[];
  languages: string[];
  hourlyRate?: number;
  consultationFee?: number;
  currency: string;
  averageRating?: number;
  totalReviews: number;
  completedBookings: number;
  verificationStatus: string;
  isActive: boolean;
  acceptsNewClients: boolean;
  bio?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    country: string;
    isOnline: boolean;
    lastSeenAt?: string;
    linkedinProfile?: string;
    website?: string;
  };
  serviceListings?: Array<{
    id: string;
    title: string;
    category: string;
    basePrice: number;
    currency: string;
    estimatedDuration?: string;
  }>;
  reviews?: Array<{
    rating: number;
    comment?: string;
    createdAt: string;
    client: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  }>;
}

interface ProfessionalCardProps {
  professional: Professional;
  onViewProfile?: (professional: Professional) => void;
  onContactProfessional?: (professional: Professional) => void;
  onBookConsultation?: (professional: Professional) => void;
  onViewServices?: (professional: Professional) => void;
  variant?: 'compact' | 'full' | 'featured';
  showActions?: boolean;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onViewProfile,
  onContactProfessional,
  onBookConsultation,
  onViewServices,
  variant = 'full',
  showActions = true
}) => {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency || 'SEK',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Okänt';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Aktiv nu';
    if (diffInHours < 24) return `Aktiv för ${diffInHours}h sedan`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Aktiv för ${diffInDays}d sedan`;
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

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'SE': '🇸🇪',
      'NO': '🇳🇴',
      'DK': '🇩🇰',
      'FI': '🇫🇮'
    };
    return flags[countryCode] || '🌍';
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {professional.user.avatar && !imageError ? (
              <img
                src={professional.user.avatar}
                alt={`${professional.user.firstName} ${professional.user.lastName}`}
                className="w-12 h-12 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            )}
            {professional.user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900 truncate">
                  {professional.user.firstName} {professional.user.lastName}
                </h3>
                <p className="text-sm text-gray-600 truncate">{professional.professionalTitle}</p>
              </div>
              {professional.verificationStatus === 'VERIFIED' && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">
                {professional.averageRating?.toFixed(1) || 'Nytt'} ({professional.totalReviews})
              </span>
            </div>

            {/* Price */}
            {professional.hourlyRate && (
              <p className="text-sm font-medium text-gray-900 mt-1">
                {formatPrice(professional.hourlyRate, professional.currency)}/tim
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onViewProfile?.(professional)}
              className="flex-1 text-xs bg-blue-600 text-white py-1.5 px-3 rounded hover:bg-blue-700 transition-colors"
            >
              Visa profil
            </button>
            <button
              onClick={() => onContactProfessional?.(professional)}
              className="text-xs border border-gray-300 text-gray-700 py-1.5 px-3 rounded hover:bg-gray-50 transition-colors"
            >
              Kontakta
            </button>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-blue-200 p-6 hover:shadow-lg transition-all duration-200">
        {/* Featured Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
            ⭐ Utvald expert
          </span>
          {professional.verificationStatus === 'VERIFIED' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            {professional.user.avatar && !imageError ? (
              <img
                src={professional.user.avatar}
                alt={`${professional.user.firstName} ${professional.user.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-sm">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            )}
            {professional.user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {professional.user.firstName} {professional.user.lastName}
            </h3>
            <p className="text-blue-700 font-medium">{professional.professionalTitle}</p>
            {professional.businessName && (
              <p className="text-sm text-gray-600">{professional.businessName}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {professional.averageRating?.toFixed(1) || 'Nytt'}
            </p>
            <p className="text-xs text-gray-600">{professional.totalReviews} recensioner</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{professional.completedBookings}</p>
            <p className="text-xs text-gray-600">genomförda</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {professional.serviceCategories.length}
            </p>
            <p className="text-xs text-gray-600">specialområden</p>
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {professional.specializations.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white text-blue-700 text-xs rounded-full font-medium"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onViewProfile?.(professional)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Visa profil
            </button>
            <button
              onClick={() => onBookConsultation?.(professional)}
              className="bg-white text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors font-medium border border-blue-200"
            >
              Boka
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default 'full' variant
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              {professional.user.avatar && !imageError ? (
                <img
                  src={professional.user.avatar}
                  alt={`${professional.user.firstName} ${professional.user.lastName}`}
                  className="w-14 h-14 rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              )}
              {professional.user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {professional.user.firstName} {professional.user.lastName}
              </h3>
              <p className="text-blue-600 font-medium">{professional.professionalTitle}</p>
              {professional.businessName && (
                <p className="text-sm text-gray-600">{professional.businessName}</p>
              )}
            </div>
          </div>
          {professional.verificationStatus === 'VERIFIED' && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Verifierad</span>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {professional.serviceCategories.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              <span>{getCategoryIcon(category)}</span>
              {getCategoryName(category)}
            </span>
          ))}
          {professional.serviceCategories.length > 3 && (
            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-sm rounded-full">
              +{professional.serviceCategories.length - 3} till
            </span>
          )}
        </div>

        {/* Rating & Stats */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">
                {professional.averageRating?.toFixed(1) || 'Nytt'}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({professional.totalReviews} recensioner)
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>{professional.completedBookings} genomförda uppdrag</span>
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Specialiseringar:</h4>
          <div className="flex flex-wrap gap-1">
            {professional.specializations.slice(0, 4).map((spec, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {spec}
              </span>
            ))}
            {professional.specializations.length > 4 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                +{professional.specializations.length - 4} till
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {professional.bio && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-3">
              {professional.bio}
            </p>
          </div>
        )}

        {/* Info Row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{getCountryFlag(professional.user.country)} {professional.user.country === 'SE' ? 'Sverige' : professional.user.country}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatLastSeen(professional.user.lastSeenAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{professional.languages.join(', ')}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              {professional.hourlyRate && (
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(professional.hourlyRate, professional.currency)}/tim
                </p>
              )}
              {professional.consultationFee && (
                <p className="text-sm text-gray-600">
                  Konsultation: {formatPrice(professional.consultationFee, professional.currency)}
                </p>
              )}
              {!professional.acceptsNewClients && (
                <p className="text-sm text-orange-600 font-medium">
                  Tar för närvarande inte nya kunder
                </p>
              )}
            </div>
            {professional.serviceListings && professional.serviceListings.length > 0 && (
              <button
                onClick={() => onViewServices?.(professional)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Se {professional.serviceListings.length} tjänster →
              </button>
            )}
          </div>
        </div>

        {/* External Links */}
        {(professional.user.linkedinProfile || professional.user.website) && (
          <div className="flex gap-2 mb-4">
            {professional.user.linkedinProfile && (
              <a
                href={professional.user.linkedinProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
                title="LinkedIn profil"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {professional.user.website && (
              <a
                href={professional.user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
                title="Webbsida"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="px-6 pb-6">
          <div className="flex gap-2">
            <button
              onClick={() => onViewProfile?.(professional)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Visa profil
            </button>
            <button
              onClick={() => onContactProfessional?.(professional)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              title="Kontakta expert"
            >
              <Mail className="w-4 h-4" />
            </button>
            {professional.acceptsNewClients && (
              <button
                onClick={() => onBookConsultation?.(professional)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                title="Boka konsultation"
              >
                <Calendar className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};