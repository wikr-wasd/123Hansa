import React, { useState } from 'react';
import { 
  Star, 
  Send, 
  X, 
  CheckCircle, 
  MessageCircle,
  User,
  Clock,
  Briefcase,
  TrendingUp,
  Heart,
  AlertTriangle
} from 'lucide-react';

interface Professional {
  id: string;
  userId: string;
  professionalTitle: string;
  businessName?: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface Booking {
  id: string;
  title: string;
  serviceType: string;
  completedAt: string;
  professional: Professional;
}

interface ReviewFormProps {
  booking: Booking;
  onSubmit: (review: ReviewData) => void;
  onClose: () => void;
}

interface ReviewData {
  rating: number;
  title?: string;
  comment?: string;
  communicationRating?: number;
  expertiseRating?: number;
  timelinessRating?: number;
  valueRating?: number;
  wouldRecommend: boolean;
  isPublic: boolean;
  tags: string[];
}

const RATING_CATEGORIES = [
  { key: 'communicationRating', label: 'Kommunikation', description: 'Tydlighet och svarstid' },
  { key: 'expertiseRating', label: 'Expertis', description: 'Kunskapsnivå och kompetens' },
  { key: 'timelinessRating', label: 'Punktlighet', description: 'Leverans i tid' },
  { key: 'valueRating', label: 'Värde för pengarna', description: 'Prisvärdhet' }
];

const REVIEW_TAGS = [
  'Professionell',
  'Hjälpsam',
  'Snabb respons',
  'Djup kunskap',
  'Tydlig kommunikation',
  'Levererar i tid',
  'Går utöver förväntan',
  'Bra värde',
  'Skulle rekommendera',
  'Lösningsorienterad',
  'Erfaren',
  'Pålitlig'
];

export const ReviewForm: React.FC<ReviewFormProps> = ({
  booking,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState<ReviewData>({
    rating: 0,
    title: '',
    comment: '',
    communicationRating: 0,
    expertiseRating: 0,
    timelinessRating: 0,
    valueRating: 0,
    wouldRecommend: false,
    isPublic: true,
    tags: []
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateForm = (field: keyof ReviewData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRatingClick = (rating: number, category?: string) => {
    if (category) {
      updateForm(category as keyof ReviewData, rating);
    } else {
      updateForm('rating', rating);
    }
  };

  const toggleTag = (tag: string) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    updateForm('tags', newTags);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Välj ett övergripande betyg';
    }

    if (!formData.comment?.trim()) {
      newErrors.comment = 'Skriv en kommentar om din upplevelse';
    } else if (formData.comment.length < 20) {
      newErrors.comment = 'Kommentaren måste vara minst 20 tecken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: 'Kunde inte skicka recensionen. Försök igen.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const renderStarRating = (
    currentRating: number,
    onRate: (rating: number) => void,
    onHover?: (rating: number) => void,
    hoveredRating?: number,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={() => onHover?.(0)}
            className="transition-colors hover:scale-110 transform"
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= (hoveredRating || currentRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Recensera din upplevelse
            </h2>
            <p className="text-sm text-gray-600">
              Hjälp andra genom att dela din upplevelse
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Booking Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            {booking.professional.user.avatar ? (
              <img
                src={booking.professional.user.avatar}
                alt={`${booking.professional.user.firstName} ${booking.professional.user.lastName}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">
                {booking.professional.user.firstName} {booking.professional.user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{booking.professional.professionalTitle}</p>
              <p className="text-sm text-gray-500">
                {booking.title} • {formatDate(booking.completedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Övergripande betyg <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {renderStarRating(
                formData.rating,
                (rating) => handleRatingClick(rating),
                setHoveredRating,
                hoveredRating,
                'lg'
              )}
              <span className="text-lg font-medium text-gray-700">
                {hoveredRating || formData.rating || 0}/5
              </span>
            </div>
            {errors.rating && (
              <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* Detailed Ratings */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Detaljerat betyg (valfritt)
            </h4>
            <div className="space-y-4">
              {RATING_CATEGORIES.map((category) => (
                <div key={category.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {category.label}
                      </span>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStarRating(
                        formData[category.key as keyof ReviewData] as number,
                        (rating) => handleRatingClick(rating, category.key),
                        (rating) => setHoveredCategory(rating > 0 ? category.key : null),
                        hoveredCategory === category.key ? hoveredRating : undefined,
                        'sm'
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubrik (valfritt)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateForm('title', e.target.value)}
              placeholder="Sammanfatta din upplevelse i en mening"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.title?.length || 0}/100 tecken
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Din upplevelse <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => updateForm('comment', e.target.value)}
              rows={4}
              placeholder="Beskriv din upplevelse med experten. Vad gick bra? Vad kunde varit bättre? Denna information hjälper andra användare..."
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.comment ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {errors.comment && (
                  <p className="text-sm text-red-600">{errors.comment}</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {formData.comment?.length || 0}/1000 tecken
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nyckelord som beskriver experten (valfritt)
            </label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.tags.includes(tag)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.wouldRecommend}
                onChange={(e) => updateForm('wouldRecommend', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Jag skulle rekommendera denna expert till andra
              </span>
            </label>
          </div>

          {/* Privacy */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Synlighet för recensionen
                </h4>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => updateForm('isPublic', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-blue-700">
                    Gör recensionen synlig för andra användare
                  </span>
                </label>
                <p className="text-xs text-blue-600 mt-1">
                  Om avmarkerad visas endast recensionen för experten
                </p>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Avbryt
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Skickar...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Skicka recensionen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};