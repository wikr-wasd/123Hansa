import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  Briefcase,
  Globe,
  ChevronRight,
  Heart,
  Share2,
  Flag,
  Badge
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
  credentials: any;
  experience: any;
  timezone: string;
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
    companyName?: string;
    createdAt: string;
  };
  serviceListings: Array<{
    id: string;
    title: string;
    category: string;
    basePrice: number;
    currency: string;
    estimatedDuration?: string;
    description: string;
    consultationFormats: string[];
  }>;
  reviews: Array<{
    rating: number;
    title?: string;
    comment?: string;
    createdAt: string;
    communicationRating?: number;
    expertiseRating?: number;
    timelinessRating?: number;
    valueRating?: number;
    wouldRecommend: boolean;
    client: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    professionalResponse?: string;
    respondedAt?: string;
  }>;
}

interface ProfessionalProfileProps {
  professionalId: string;
  onContactProfessional?: (professional: Professional) => void;
  onBookConsultation?: (professional: Professional) => void;
  onViewService?: (serviceId: string) => void;
}

export const ProfessionalProfile: React.FC<ProfessionalProfileProps> = ({
  professionalId,
  onContactProfessional,
  onBookConsultation,
  onViewService
}) => {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadProfessional();
  }, [professionalId]);

  const loadProfessional = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/professionals/${professionalId}`);
      const data = await response.json();

      if (data.success) {
        setProfessional(data.data);
      }
    } catch (error) {
      console.error('Error loading professional:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency || 'SEK',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getYearsSinceJoined = (joinDate: string) => {
    const years = new Date().getFullYear() - new Date(joinDate).getFullYear();
    return years;
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

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: API call to save/remove favorite
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${professional?.user.firstName} ${professional?.user.lastName} - ${professional?.professionalTitle}`,
        text: `Kolla in denna expert på 123Hansa`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const handleReport = () => {
    // TODO: Open report modal
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Expert inte hittad
        </h3>
        <p className="text-gray-600">
          Den expert du letar efter kunde inte hittas.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
          
          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
              <div className="relative">
                {professional.user.avatar ? (
                  <img
                    src={professional.user.avatar}
                    alt={`${professional.user.firstName} ${professional.user.lastName}`}
                    className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center">
                    <Users className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {professional.user.isOnline && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="mt-4 sm:mt-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {professional.user.firstName} {professional.user.lastName}
                      {professional.verificationStatus === 'VERIFIED' && (
                        <CheckCircle className="inline-block w-6 h-6 text-green-500 ml-2" />
                      )}
                    </h1>
                    <p className="text-lg text-blue-600 font-medium">
                      {professional.professionalTitle}
                    </p>
                    {professional.businessName && (
                      <p className="text-gray-600">{professional.businessName}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 mt-4 sm:mt-0">
                    <button
                      onClick={toggleFavorite}
                      className={`p-2 rounded-full border-2 transition-colors ${
                        isFavorited
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-400"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={handleReport}
                      className="p-2 rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-400"
                    >
                      <Flag className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => onContactProfessional?.(professional)}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Mail className="w-4 h-4 inline mr-2" />
                      Kontakta
                    </button>

                    {professional.acceptsNewClients && (
                      <button
                        onClick={() => onBookConsultation?.(professional)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Boka konsultation
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">
                      {professional.averageRating?.toFixed(1) || 'Nytt'}
                    </span>
                    <span>({professional.totalReviews} recensioner)</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{professional.completedBookings} genomförda uppdrag</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Medlem sedan {getYearsSinceJoined(professional.user.createdAt)} år</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{professional.user.country === 'SE' ? 'Sverige' : professional.user.country}</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {professional.serviceCategories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      <span>{getCategoryIcon(category)}</span>
                      {getCategoryName(category)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Översikt', icon: Users },
              { id: 'services', label: 'Tjänster', icon: Briefcase },
              { id: 'reviews', label: 'Recensioner', icon: Star },
              { id: 'experience', label: 'Erfarenhet', icon: Award }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'reviews' && professional.totalReviews > 0 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {professional.totalReviews}
                    </span>
                  )}
                  {tab.id === 'services' && professional.serviceListings.length > 0 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {professional.serviceListings.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* About */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Om mig</h3>
                <div className="prose prose-sm max-w-none">
                  {professional.bio ? (
                    <p className="text-gray-700 leading-relaxed">{professional.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">Ingen beskrivning tillgänglig än.</p>
                  )}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Specialiseringar</h3>
                <div className="flex flex-wrap gap-2">
                  {professional.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Språk</h3>
                <div className="flex flex-wrap gap-2">
                  {professional.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Prissättning</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {professional.hourlyRate && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Timpris</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatPrice(professional.hourlyRate, professional.currency)}/tim
                        </p>
                      </div>
                    )}
                    
                    {professional.consultationFee && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Konsultationsavgift</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatPrice(professional.consultationFee, professional.currency)}
                        </p>
                      </div>
                    )}
                  </div>

                  {!professional.acceptsNewClients && (
                    <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-800 font-medium">
                        Tar för närvarande inte nya kunder
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* External Links */}
              {(professional.user.linkedinProfile || professional.user.website) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Externa länkar</h3>
                  <div className="flex gap-4">
                    {professional.user.linkedinProfile && (
                      <a
                        href={professional.user.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                        LinkedIn profil
                      </a>
                    )}
                    {professional.user.website && (
                      <a
                        href={professional.user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Globe className="w-4 h-4" />
                        Webbsida
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Tillgängliga tjänster ({professional.serviceListings.length})
                </h3>
              </div>

              {professional.serviceListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {professional.serviceListings.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">{service.title}</h4>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {getCategoryIcon(service.category)}
                            {getCategoryName(service.category)}
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(service.basePrice, service.currency)}
                        </p>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {service.description}
                      </p>

                      {service.estimatedDuration && (
                        <p className="text-sm text-gray-500 mb-4">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Uppskattad tid: {service.estimatedDuration}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {service.consultationFormats.slice(0, 2).map((format, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {format}
                            </span>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => onViewService?.(service.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          Se detaljer
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Inga tjänster listade än
                  </h4>
                  <p className="text-gray-600">
                    Denna expert har inte lagt till några tjänster än.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Summary */}
              {professional.totalReviews > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overall Rating */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {professional.averageRating?.toFixed(1)}
                      </div>
                      <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= (professional.averageRating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        Baserat på {professional.totalReviews} recensioner
                      </p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="space-y-2">
                      {professional.reviews.length > 0 && (
                        <>
                          {['Kommunikation', 'Expertis', 'Punktlighet', 'Värde'].map((category, index) => {
                            const ratings = professional.reviews
                              .map(r => [r.communicationRating, r.expertiseRating, r.timelinessRating, r.valueRating][index])
                              .filter(r => r !== undefined);
                            const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
                            
                            return (
                              <div key={category} className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 w-20">{category}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{ width: `${(avg / 5) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">
                                  {avg.toFixed(1)}
                                </span>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Reviews */}
              {professional.reviews.length > 0 ? (
                <div className="space-y-6">
                  {professional.reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {review.client.avatar ? (
                            <img
                              src={review.client.avatar}
                              alt={`${review.client.firstName} ${review.client.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.client.firstName} {review.client.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                      )}

                      {review.comment && (
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                      )}

                      {review.wouldRecommend && (
                        <p className="text-sm text-green-600 font-medium mb-3">
                          ✓ Rekommenderar denna expert
                        </p>
                      )}

                      {/* Professional Response */}
                      {review.professionalResponse && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Svar från {professional.user.firstName}
                            </span>
                            {review.respondedAt && (
                              <span className="text-xs text-blue-600">
                                {formatDate(review.respondedAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-blue-700">{review.professionalResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Inga recensioner än
                  </h4>
                  <p className="text-gray-600">
                    Var den första att recensera denna expert efter en genomförd konsultation.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-8">
              {/* Credentials */}
              {professional.credentials && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Meriter och utbildning</h3>
                  <div className="space-y-6">
                    {/* Education */}
                    {professional.credentials.education && professional.credentials.education.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">Utbildning</h4>
                        <div className="space-y-3">
                          {professional.credentials.education.map((edu: any, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-900">{edu.degree}</p>
                                <p className="text-gray-600">{edu.institution}</p>
                                <p className="text-sm text-gray-500">{edu.field} • {edu.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {professional.credentials.certifications && professional.credentials.certifications.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">Certifieringar</h4>
                        <div className="space-y-3">
                          {professional.credentials.certifications.map((cert: any, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-900">{cert.name}</p>
                                <p className="text-gray-600">{cert.issuer}</p>
                                <p className="text-sm text-gray-500">
                                  {cert.year}
                                  {cert.expiryDate && ` • Upphör ${cert.expiryDate}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Licenses */}
                    {professional.credentials.licenses && professional.credentials.licenses.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">Licenser</h4>
                        <div className="space-y-3">
                          {professional.credentials.licenses.map((license: any, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-900">{license.name}</p>
                                <p className="text-gray-600">Nummer: {license.number}</p>
                                <p className="text-sm text-gray-500">
                                  Utfärdad av {license.issuer}
                                  {license.expiryDate && ` • Upphör ${license.expiryDate}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Experience */}
              {professional.experience && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Arbetslivserfarenhet</h3>
                  
                  {professional.experience.yearsOfExperience && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <p className="text-lg font-semibold text-blue-900">
                        {professional.experience.yearsOfExperience} års erfarenhet
                      </p>
                      <p className="text-sm text-blue-700">Inom expertområdet</p>
                    </div>
                  )}

                  {/* Previous Roles */}
                  {professional.experience.previousRoles && professional.experience.previousRoles.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-3">Tidigare roller</h4>
                      <div className="space-y-4">
                        {professional.experience.previousRoles.map((role: any, index: number) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <p className="font-medium text-gray-900">{role.title}</p>
                            <p className="text-gray-600">{role.company}</p>
                            <p className="text-sm text-gray-500">
                              {role.startYear} - {role.endYear || 'Nuvarande'}
                            </p>
                            {role.description && (
                              <p className="text-sm text-gray-700 mt-2">{role.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notable Cases */}
                  {professional.experience.notableCases && professional.experience.notableCases.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Framstående uppdrag</h4>
                      <div className="space-y-4">
                        {professional.experience.notableCases.map((case_: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <p className="font-medium text-gray-900 mb-2">{case_.title}</p>
                            <p className="text-sm text-gray-700 mb-2">{case_.description}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{case_.year}</span>
                              {case_.outcome && (
                                <span className="text-green-600 font-medium">{case_.outcome}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};