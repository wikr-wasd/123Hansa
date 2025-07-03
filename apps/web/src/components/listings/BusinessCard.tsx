import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  DollarSign, 
  MapPin, 
  Calendar,
  Eye,
  Star,
  TrendingUp,
  Users,
  Building,
  Phone,
  Mail,
  Verified,
  Clock,
  Crown,
  Sparkles
} from 'lucide-react';
import { BusinessListing } from '../../types/business';

interface BusinessCardProps {
  listing: BusinessListing;
  onViewDetails: (id: string) => void;
  onContactSeller: (id: string) => void;
  onMakeOffer: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isFavorited?: boolean;
  className?: string;
}

const BusinessCard: React.FC<BusinessCardProps> = ({
  listing,
  onViewDetails,
  onContactSeller,
  onMakeOffer,
  onToggleFavorite,
  isFavorited = false,
  className = '',
}) => {
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M SEK`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k SEK`;
    } else {
      return `${amount.toLocaleString()} SEK`;
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartAnimating(true);
    onToggleFavorite(listing.id);
    setTimeout(() => setIsHeartAnimating(false), 300);
  };

  const handleCardClick = () => {
    onViewDetails(listing.id);
  };

  const getEstablishedYears = () => {
    return new Date().getFullYear() - listing.financials.yearEstablished;
  };

  const getSectorColor = (sector: string) => {
    const colors: Record<string, string> = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Manufacturing': 'bg-orange-100 text-orange-800',
      'Retail': 'bg-green-100 text-green-800',
      'Services': 'bg-purple-100 text-purple-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Construction': 'bg-yellow-100 text-yellow-800',
    };
    return colors[sector] || 'bg-gray-100 text-gray-800';
  };

  const getPriceTypeIcon = (type: string) => {
    switch (type) {
      case 'FIXED': return <DollarSign className="w-4 h-4" />;
      case 'NEGOTIABLE': return <TrendingUp className="w-4 h-4" />;
      case 'AUCTION': return <Clock className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <Card 
      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
      onClick={handleCardClick}
    >
      {/* Premium/Featured badges */}
      <div className="absolute top-3 left-3 z-20 flex gap-2">
        {listing.premium && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        )}
        {listing.featured && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />
            Utvalda
          </Badge>
        )}
      </div>

      {/* Favorite button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all duration-200 hover:bg-white hover:scale-110"
      >
        <Heart 
          className={`w-5 h-5 transition-all duration-300 ${
            isFavorited 
              ? 'text-red-500 fill-red-500' 
              : 'text-gray-600 hover:text-red-500'
          } ${isHeartAnimating ? 'scale-125' : ''}`}
        />
      </button>

      {/* Image carousel */}
      <div className="relative h-48 overflow-hidden">
        {!imageError ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Building className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Image indicators */}
        {listing.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
            {listing.images.slice(0, 5).map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-white/60 backdrop-blur-sm"
              />
            ))}
            {listing.images.length > 5 && (
              <span className="text-xs text-white/80 ml-1">+{listing.images.length - 5}</span>
            )}
          </div>
        )}

        {/* Quick stats overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center gap-3 text-white text-sm">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {listing.viewCount}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {listing.favoriteCount}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {listing.inquiryCount}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title and location */}
        <div>
          <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {listing.location.city}, {listing.location.region}
          </div>
        </div>

        {/* Sector and price */}
        <div className="flex items-center justify-between">
          <Badge className={getSectorColor(listing.sector)}>
            {listing.sector}
          </Badge>
          <div className="flex items-center gap-1 text-lg font-bold text-green-600">
            {getPriceTypeIcon(listing.price.type)}
            {formatCurrency(listing.price.amount)}
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 py-2 border-t border-gray-100">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {formatCurrency(listing.financials.revenue)}
            </div>
            <div className="text-xs text-gray-500">Omsättning</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {listing.financials.employees}
            </div>
            <div className="text-xs text-gray-500">Anställda</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {getEstablishedYears()} år
            </div>
            <div className="text-xs text-gray-500">Etablerad</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {listing.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {listing.features.slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
          {listing.features.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{listing.features.length - 3} mer
            </Badge>
          )}
        </div>

        {/* Seller info */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Avatar className="w-8 h-8">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${listing.seller.name}&background=random`} />
            <AvatarFallback>{listing.seller.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium truncate">{listing.seller.name}</span>
              {listing.seller.verified && (
                <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {listing.seller.rating}
              </div>
              <span>•</span>
              <span>{listing.seller.totalTransactions} affärer</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Action buttons */}
      <CardFooter className="p-4 pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onContactSeller(listing.id);
            }}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Kontakta
          </Button>
          <Button 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMakeOffer(listing.id);
            }}
            className="flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Lägg bud
          </Button>
        </div>
        
        {/* Updated date */}
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 w-full">
          <Calendar className="w-3 h-3" />
          Uppdaterad {new Date(listing.updatedAt).toLocaleDateString('sv-SE')}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BusinessCard;