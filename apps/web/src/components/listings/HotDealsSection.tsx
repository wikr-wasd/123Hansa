import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Flame, 
  MapPin, 
  Eye, 
  Users, 
  Building2,
  Globe,
  FileText,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { HotDealBanner } from './HotDealBanner';
import { PremiumEmblem, PremiumEmblemType } from './PremiumEmblem';

interface Listing {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  askingPrice: number;
  currency: string;
  location: string;
  description: string;
  highlights: string[];
  images: string[];
  seller: {
    name: string;
    verified: boolean;
    joinedDate: string;
  };
  status: 'ACTIVE' | 'PENDING' | 'SOLD';
  createdAt: string;
  viewCount: number;
  interestedBuyers: number;
  hotDealType?: 'hot-deal' | 'premium' | 'featured' | 'trending' | 'vip';
  premiumEmblems?: PremiumEmblemType[];
  [key: string]: any;
}

interface HotDealsSectionProps {
  listings: Listing[];
  className?: string;
}

const CATEGORY_INFO = {
  companies: { name: 'Företag & Bolag', icon: Building2, color: 'blue' },
  ecommerce: { name: 'E-handel & Webshops', icon: Globe, color: 'green' },
  domains: { name: 'Domäner & Webbplatser', icon: Globe, color: 'purple' },
  content: { name: 'Content & Media', icon: FileText, color: 'orange' },
  social: { name: 'Social Media', icon: Users, color: 'pink' },
  affiliate: { name: 'Affiliate & Passive Income', icon: TrendingUp, color: 'indigo' },
  digital: { name: 'Digitala Tillgångar', icon: Building2, color: 'cyan' },
  documents: { name: 'Dokument & Rättigheter', icon: FileText, color: 'gray' },
  properties: { name: 'Fastigheter & Lokaler', icon: MapPin, color: 'yellow' },
  services: { name: 'Företagstjänster', icon: Briefcase, color: 'red' }
};

export const HotDealsSection: React.FC<HotDealsSectionProps> = ({ 
  listings, 
  className = '' 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Enhanced hot deal assignment logic with premium service priority
  const getHotDeals = () => {
    // First, separate listings by type and payment status
    const existingHotDeals = listings.filter(listing => listing.hotDealType);
    const regularListings = listings.filter(listing => !listing.hotDealType);
    
    // Prioritize paid premium services
    const paidPremiumListings = regularListings.filter(listing => 
      listing.isPaidPremium || listing.featuredUntil || listing.sponsoredLevel
    );
    const standardListings = regularListings.filter(listing => 
      !listing.isPaidPremium && !listing.featuredUntil && !listing.sponsoredLevel
    );
    
    // If we already have enough manually assigned hot deals, use them
    if (existingHotDeals.length >= 3) {
      return existingHotDeals.slice(0, 3);
    }
    
    // Combine existing hot deals with priority listings
    const needed = 3 - existingHotDeals.length;
    let candidateListings = [];
    
    // First priority: Paid premium services
    if (paidPremiumListings.length > 0) {
      candidateListings.push(...paidPremiumListings.slice(0, needed));
    }
    
    // Second priority: Standard listings if we still need more
    const stillNeeded = needed - candidateListings.length;
    if (stillNeeded > 0) {
      candidateListings.push(...standardListings.slice(0, stillNeeded));
    }
    
    // Assign hot deal types with premium service logic
    const autoAssignedListings = candidateListings.map((listing, index) => {
      const totalExisting = existingHotDeals.length;
      const position = totalExisting + index;
      
      // Premium services get higher tier hot deal types
      let hotDealType: 'hot-deal' | 'premium' | 'featured' | 'trending' | 'vip';
      
      if (listing.isPaidPremium || listing.sponsoredLevel === 'premium') {
        hotDealType = position === 0 ? 'vip' : position === 1 ? 'premium' : 'hot-deal';
      } else if (listing.featuredUntil) {
        hotDealType = position === 0 ? 'premium' : position === 1 ? 'featured' : 'trending';
      } else {
        hotDealType = position === 0 ? 'hot-deal' : position === 1 ? 'featured' : 'trending';
      }
      
      return {
        ...listing,
        hotDealType,
        isAutoAssigned: true,
        assignmentReason: listing.isPaidPremium ? 'paid-premium' : 
                         listing.featuredUntil ? 'featured-service' :
                         listing.sponsoredLevel ? 'sponsored' : 'standard'
      };
    });
    
    return [...existingHotDeals, ...autoAssignedListings];
  };

  const hotDeals = getHotDeals();

  if (hotDeals.length === 0) return null;

  const formatPrice = (price: number, currency: string = 'SEK') => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ${currency}`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k ${currency}`;
    }
    return `${price.toLocaleString('sv-SE')} ${currency}`;
  };

  return (
    <section className={`py-16 bg-gradient-to-br from-orange-50 to-red-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 text-red-500 mr-3 animate-pulse" />
            <h2 className="text-4xl font-bold text-gray-900">
              Heta Affärsmöjligheter
            </h2>
            <Flame className="w-8 h-8 text-red-500 ml-3 animate-pulse" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Utvalda premium-annonser med exceptionella möjligheter
          </p>
        </div>

        {/* Hot Deals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {hotDeals.map((listing, index) => {
            const categoryInfo = CATEGORY_INFO[listing.category as keyof typeof CATEGORY_INFO];
            const IconComponent = categoryInfo?.icon || Building2;
            
            return (
              <div 
                key={listing.id} 
                className={`
                  relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl 
                  transition-all duration-300 transform hover:scale-105 border-2
                  ${index === 0 ? 'border-red-200 lg:scale-105' : 
                    index === 1 ? 'border-purple-200' : 'border-blue-200'}
                `}
              >
                {/* Hot Deal Banner */}
                <HotDealBanner 
                  type={listing.hotDealType as any} 
                  className="z-20"
                />

                {/* Image */}
                <div className="relative overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <div className="aspect-video">
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                      <IconComponent className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  
                  {/* Price badge */}
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-lg">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(listing.askingPrice, listing.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Premium Emblems */}
                  {listing.premiumEmblems && listing.premiumEmblems.length > 0 && (
                    <>
                      {listing.premiumEmblems.slice(0, 2).map((emblem, emblemIndex) => (
                        <PremiumEmblem
                          key={emblem}
                          type={emblem}
                          position={emblemIndex === 0 ? 'bottom-left' : 'top-left'}
                          size="md"
                        />
                      ))}
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category */}
                  <div className="flex items-center mb-3">
                    <IconComponent className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">
                      {categoryInfo?.name || 'Kategori'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <Link 
                      to={`/listings/${listing.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {listing.title}
                    </Link>
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {listing.description}
                  </p>

                  {/* Highlights */}
                  {listing.highlights && listing.highlights.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {listing.highlights.slice(0, 2).map((highlight, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                          >
                            {highlight}
                          </span>
                        ))}
                        {listing.highlights.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{listing.highlights.length - 2} mer
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {listing.location}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {listing.viewCount}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {listing.interestedBuyers}
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link 
                    to={`/listings/${listing.id}`}
                    className={`
                      block w-full text-center px-6 py-3 font-bold rounded-xl 
                      transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105
                      ${index === 0 ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600' :
                        index === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' :
                        'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                      }
                    `}
                  >
                    {index === 0 ? '🔥 Visa Heta Affären' : 
                     index === 1 ? '👑 Visa Premium' : 
                     '⭐ Visa Featured'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              // Check if we're already on the listings page
              if (location.pathname === '/listings') {
                // Scroll to the listings grid or filter section
                const mainListings = document.querySelector('[class*="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"]') ||
                                   document.querySelector('[class*="space-y-4"]') ||
                                   document.querySelector('[class*="bg-white border-b border-gray-200"]');
                if (mainListings) {
                  mainListings.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  // Fallback: scroll to a reasonable position
                  window.scrollTo({ top: 800, behavior: 'smooth' });
                }
              } else {
                // Navigate to listings page
                navigate('/listings');
              }
            }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Flame className="w-5 h-5 mr-2" />
            Se Alla Affärsmöjligheter
          </button>
        </div>
      </div>
    </section>
  );
};

export default HotDealsSection;