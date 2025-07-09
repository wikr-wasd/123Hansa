import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Filter, 
  SortAsc, 
  SortDesc, 
  MessageCircle,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { ReviewDisplay } from './ReviewDisplay';
import { ReviewForm } from './ReviewForm';

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

interface Professional {
  id: string;
  userId: string;
  professionalTitle: string;
  businessName?: string;
  averageRating?: number;
  totalReviews: number;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  averageDetailedRatings: {
    communication: number;
    expertise: number;
    timeliness: number;
    value: number;
  };
  recommendationRate: number;
  responseRate: number;
}

interface ReviewManagerProps {
  professional: Professional;
  canWriteReview?: boolean;
  pendingBooking?: any;
  onWriteReview?: () => void;
  onMarkHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
}

interface ReviewFilters {
  rating?: number;
  hasComment?: boolean;
  hasResponse?: boolean;
  sortBy: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
  showOnlyRecommended?: boolean;
}

export const ReviewManager: React.FC<ReviewManagerProps> = ({
  professional,
  canWriteReview = false,
  pendingBooking,
  onWriteReview,
  onMarkHelpful,
  onReport,
  onReply
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const itemsPerPage = 10;

  // Load reviews and stats
  const loadReviews = async (page = 1, reset = false) => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      queryParams.append('professionalId', professional.userId);
      
      if (filters.rating) queryParams.append('rating', filters.rating.toString());
      if (filters.hasComment) queryParams.append('hasComment', 'true');
      if (filters.hasResponse) queryParams.append('hasResponse', 'true');
      if (filters.showOnlyRecommended) queryParams.append('recommended', 'true');
      queryParams.append('sortBy', filters.sortBy);
      queryParams.append('limit', itemsPerPage.toString());
      queryParams.append('offset', ((page - 1) * itemsPerPage).toString());

      const [reviewsResponse, statsResponse] = await Promise.all([
        fetch(`/api/reviews?${queryParams}`),
        fetch(`/api/reviews/stats?professionalId=${professional.userId}`)
      ]);

      const [reviewsData, statsData] = await Promise.all([
        reviewsResponse.json(),
        statsResponse.json()
      ]);

      if (reviewsData.success) {
        if (reset || page === 1) {
          setReviews(reviewsData.data.reviews);
        } else {
          setReviews(prev => [...prev, ...reviewsData.data.reviews]);
        }
        setHasMore(reviewsData.data.hasMore);
        setCurrentPage(page);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(1, true);
  }, [professional.userId, filters]);

  const updateFilter = (key: keyof ReviewFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadReviews(currentPage + 1, false);
    }
  };

  const handleWriteReview = () => {
    if (onWriteReview) {
      onWriteReview();
    } else {
      setShowReviewForm(true);
    }
  };

  const handleSubmitReview = async (reviewData: any) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          ...reviewData,
          professionalId: professional.userId,
          bookingId: pendingBooking?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowReviewForm(false);
        loadReviews(1, true); // Reload reviews
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    const maxCount = Math.max(...Object.values(stats.ratingDistribution));

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm font-medium w-8">{rating} ⭐</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDetailedStats = () => {
    if (!stats) return null;

    const categories = [
      { key: 'communication', label: 'Kommunikation', value: stats.averageDetailedRatings.communication },
      { key: 'expertise', label: 'Expertis', value: stats.averageDetailedRatings.expertise },
      { key: 'timeliness', label: 'Punktlighet', value: stats.averageDetailedRatings.timeliness },
      { key: 'value', label: 'Värde', value: stats.averageDetailedRatings.value }
    ].filter(cat => cat.value > 0);

    if (categories.length === 0) return null;

    return (
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.key} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{category.label}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= category.value
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {category.value.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= stats.averageRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">
                Baserat på {stats.totalReviews} recensioner
              </p>
              
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{Math.round(stats.recommendationRate)}% rekommenderar</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span>{Math.round(stats.responseRate)}% får svar</span>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Betygsfördelning</h4>
              {renderRatingDistribution()}
            </div>

            {/* Detailed Ratings */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Detaljerade betyg</h4>
              {renderDetailedStats()}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {canWriteReview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Har du arbetat med denna expert?</h4>
              <p className="text-sm text-blue-700">Dela din upplevelse för att hjälpa andra</p>
            </div>
            <button
              onClick={handleWriteReview}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Skriv recension
            </button>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">
            Recensioner ({stats?.totalReviews || 0})
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <Filter className="w-4 h-4" />
            Filter & Sortering
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Betyg
              </label>
              <select
                value={filters.rating || ''}
                onChange={(e) => updateFilter('rating', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Alla betyg</option>
                <option value="5">5 stjärnor</option>
                <option value="4">4 stjärnor</option>
                <option value="3">3 stjärnor</option>
                <option value="2">2 stjärnor</option>
                <option value="1">1 stjärna</option>
              </select>
            </div>

            {/* Content Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Innehåll
              </label>
              <select
                value={filters.hasComment ? 'comments' : filters.hasResponse ? 'responses' : ''}
                onChange={(e) => {
                  if (e.target.value === 'comments') {
                    updateFilter('hasComment', true);
                    updateFilter('hasResponse', undefined);
                  } else if (e.target.value === 'responses') {
                    updateFilter('hasResponse', true);
                    updateFilter('hasComment', undefined);
                  } else {
                    updateFilter('hasComment', undefined);
                    updateFilter('hasResponse', undefined);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Alla recensioner</option>
                <option value="comments">Med kommentarer</option>
                <option value="responses">Med expertsvar</option>
              </select>
            </div>

            {/* Recommendation Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rekommendation
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showOnlyRecommended || false}
                  onChange={(e) => updateFilter('showOnlyRecommended', e.target.checked || undefined)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Endast rekommenderade</span>
              </label>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sortera
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="newest">Senaste först</option>
                <option value="oldest">Äldsta först</option>
                <option value="rating_high">Högsta betyg först</option>
                <option value="rating_low">Lägsta betyg först</option>
                <option value="helpful">Mest hjälpsamma</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading && reviews.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Inga recensioner ännu
            </h3>
            <p className="text-gray-600">
              Bli den första att lämna en recension för denna expert.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                <ReviewDisplay
                  review={review}
                  allowInteraction={true}
                  onMarkHelpful={onMarkHelpful}
                  onReport={onReport}
                  onReply={onReply}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Laddar...' : 'Ladda fler recensioner'}
            </button>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && pendingBooking && (
        <ReviewForm
          booking={pendingBooking}
          onSubmit={handleSubmitReview}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
};