import React from 'react';
import { 
  Star, 
  TrendingUp, 
  Users, 
  CheckCircle,
  MessageCircle,
  ChevronRight
} from 'lucide-react';

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  recommendationRate: number;
  responseRate: number;
  recentReviews: Array<{
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    createdAt: string;
    client: {
      firstName: string;
      lastName: string;
    };
  }>;
}

interface ReviewSummaryProps {
  stats: ReviewStats;
  professionalId: string;
  onViewAllReviews?: () => void;
  variant?: 'compact' | 'full' | 'minimal';
  showRecentReviews?: boolean;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  stats,
  professionalId,
  onViewAllReviews,
  variant = 'full',
  showRecentReviews = true
}) => {
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

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const maxCount = Math.max(...Object.values(stats.ratingDistribution));
    
    return (
      <div className="space-y-1">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-xs font-medium w-6">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-yellow-400 h-1.5 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 w-6">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2">
        {renderStars(stats.averageRating, 'sm')}
        <span className="text-sm font-medium text-gray-900">
          {stats.averageRating.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500">
          ({stats.totalReviews} recensioner)
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Recensioner</h4>
          {onViewAllReviews && (
            <button
              onClick={onViewAllReviews}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Se alla
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl font-bold text-gray-900">
            {stats.averageRating.toFixed(1)}
          </div>
          <div>
            {renderStars(stats.averageRating)}
            <p className="text-sm text-gray-600">
              {stats.totalReviews} recensioner
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-gray-600">
              {Math.round(stats.recommendationRate)}% rekommenderar
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3 text-blue-500" />
            <span className="text-gray-600">
              {Math.round(stats.responseRate)}% får svar
            </span>
          </div>
        </div>

        {stats.recentReviews.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="space-y-2">
              {stats.recentReviews.slice(0, 2).map((review) => (
                <div key={review.id} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {review.client.firstName} {review.client.lastName}
                    </span>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating, 'sm')}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 line-clamp-2 text-xs">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Recensioner & Betyg
        </h3>
        {onViewAllReviews && (
          <button
            onClick={onViewAllReviews}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            Se alla recensioner
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {stats.totalReviews === 0 ? (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-medium text-gray-900 mb-1">
            Inga recensioner ännu
          </h4>
          <p className="text-gray-600 text-sm">
            Denna expert har inte fått några recensioner ännu
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Overall Rating */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <div className="text-4xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div>
                  {renderStars(stats.averageRating, 'lg')}
                  <p className="text-gray-600 text-sm">
                    Baserat på {stats.totalReviews} recensioner
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-lg font-semibold text-gray-900">
                      {Math.round(stats.recommendationRate)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Rekommenderar</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-lg font-semibold text-gray-900">
                      {Math.round(stats.responseRate)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Får expertsvar</p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Betygsfördelning</h4>
              {renderRatingDistribution()}
            </div>
          </div>

          {/* Recent Reviews */}
          {showRecentReviews && stats.recentReviews.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Senaste recensioner</h4>
              <div className="space-y-4">
                {stats.recentReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {review.client.firstName} {review.client.lastName}
                        </span>
                        {renderStars(review.rating, 'sm')}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatRelativeDate(review.createdAt)}
                      </span>
                    </div>
                    
                    {review.title && (
                      <h5 className="font-medium text-gray-800 text-sm mb-1">
                        {review.title}
                      </h5>
                    )}
                    
                    {review.comment && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};