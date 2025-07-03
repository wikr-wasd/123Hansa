import React, { useState } from 'react';
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Flag, 
  MoreVertical,
  User,
  CheckCircle,
  Calendar,
  Badge,
  Heart,
  Reply
} from 'lucide-react';

interface Review {
  id: string;
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
  createdAt: string;
  updatedAt?: string;
  helpfulCount: number;
  isHelpful?: boolean;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    verificationStatus?: string;
  };
  professionalResponse?: {
    message: string;
    respondedAt: string;
  };
  booking?: {
    id: string;
    serviceType: string;
    completedAt: string;
  };
}

interface ReviewDisplayProps {
  review: Review;
  showProfessionalResponse?: boolean;
  allowInteraction?: boolean;
  onMarkHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  variant?: 'full' | 'compact' | 'summary';
}

export const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  review,
  showProfessionalResponse = true,
  allowInteraction = true,
  onMarkHelpful,
  onReport,
  onReply,
  variant = 'full'
}) => {
  const [showMore, setShowMore] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Idag';
    if (diffInDays === 1) return 'Igår';
    if (diffInDays < 7) return `${diffInDays} dagar sedan`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} veckor sedan`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} månader sedan`;
    return `${Math.floor(diffInDays / 365)} år sedan`;
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderDetailedRatings = () => {
    const ratings = [
      { label: 'Kommunikation', value: review.communicationRating },
      { label: 'Expertis', value: review.expertiseRating },
      { label: 'Punktlighet', value: review.timelinessRating },
      { label: 'Värde', value: review.valueRating }
    ].filter(r => r.value && r.value > 0);

    if (ratings.length === 0) return null;

    return (
      <div className="grid grid-cols-2 gap-3 mt-3">
        {ratings.map((rating) => (
          <div key={rating.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{rating.label}</span>
            <div className="flex items-center gap-1">
              {renderStars(rating.value!, 'sm')}
              <span className="text-sm text-gray-500 ml-1">{rating.value}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <div className="border-b border-gray-200 py-4">
        <div className="flex items-start gap-3">
          {review.client.avatar ? (
            <img
              src={review.client.avatar}
              alt={`${review.client.firstName} ${review.client.lastName}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {review.client.firstName} {review.client.lastName}
                </span>
                {review.client.verificationStatus === 'VERIFIED' && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-1">
                {renderStars(review.rating, 'sm')}
                <span className="text-sm text-gray-500">{formatRelativeDate(review.createdAt)}</span>
              </div>
            </div>
            
            {review.title && (
              <p className="text-sm font-medium text-gray-800 mb-1">{review.title}</p>
            )}
            
            <p className="text-sm text-gray-600 line-clamp-2">
              {review.comment}
            </p>
            
            {review.wouldRecommend && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600">Rekommenderar</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'summary') {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {renderStars(review.rating)}
            <span className="font-medium text-gray-900">{review.rating}/5</span>
          </div>
          <span className="text-sm text-gray-500">{formatRelativeDate(review.createdAt)}</span>
        </div>
        
        {review.title && (
          <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
        )}
        
        <p className="text-sm text-gray-600 line-clamp-3">
          {review.comment}
        </p>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-500">
            av {review.client.firstName} {review.client.lastName}
          </span>
          {review.wouldRecommend && (
            <span className="text-xs text-green-600 font-medium">
              ✓ Rekommenderar
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="border-b border-gray-200 py-6 last:border-b-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.client.avatar ? (
            <img
              src={review.client.avatar}
              alt={`${review.client.firstName} ${review.client.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {review.client.firstName} {review.client.lastName}
              </span>
              {review.client.verificationStatus === 'VERIFIED' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(review.createdAt)}</span>
              {review.booking && (
                <>
                  <span>•</span>
                  <span>{review.booking.serviceType}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
            <span className="font-medium text-gray-900 ml-1">{review.rating}/5</span>
          </div>
          
          {allowInteraction && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      onReport?.(review.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Flag className="w-3 h-3" />
                    Rapportera
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rating Title */}
      {review.title && (
        <h4 className="text-lg font-medium text-gray-900 mb-2">{review.title}</h4>
      )}

      {/* Main Comment */}
      <div className="mb-4">
        <p className={`text-gray-700 leading-relaxed ${
          !showMore && review.comment && review.comment.length > 300 ? 'line-clamp-4' : ''
        }`}>
          {review.comment}
        </p>
        
        {review.comment && review.comment.length > 300 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
          >
            {showMore ? 'Visa mindre' : 'Läs mer'}
          </button>
        )}
      </div>

      {/* Detailed Ratings */}
      {renderDetailedRatings()}

      {/* Tags */}
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {review.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Recommendation */}
      {review.wouldRecommend && (
        <div className="flex items-center gap-2 mt-3 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Rekommenderar denna expert</span>
        </div>
      )}

      {/* Professional Response */}
      {showProfessionalResponse && review.professionalResponse && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Svar från expert</span>
            <span className="text-xs text-blue-600">
              {formatDate(review.professionalResponse.respondedAt)}
            </span>
          </div>
          <p className="text-sm text-blue-700">{review.professionalResponse.message}</p>
        </div>
      )}

      {/* Actions */}
      {allowInteraction && (
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => onMarkHelpful?.(review.id)}
            className={`flex items-center gap-1 text-sm transition-colors ${
              review.isHelpful
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${review.isHelpful ? 'fill-current' : ''}`} />
            <span>Hjälpsam ({review.helpfulCount})</span>
          </button>
          
          {onReply && (
            <button
              onClick={() => onReply(review.id)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span>Svara</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};