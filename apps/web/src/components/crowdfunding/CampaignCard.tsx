import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, TrendingUp, MapPin } from 'lucide-react';
import ProgressBar from './ProgressBar';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  currentAmount: number;
  daysLeft: number;
  backers: number;
  category: string;
  image: string;
  creator: {
    name: string;
    avatar?: string;
  };
  location?: string;
  featured?: boolean;
}

interface CampaignCardProps {
  campaign: Campaign;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  className?: string;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  size = 'medium',
  showProgress = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg'
  };

  const percentage = (campaign.currentAmount / campaign.fundingGoal) * 100;
  const isOverfunded = campaign.currentAmount > campaign.fundingGoal;

  return (
    <Link to={`/crowdfunding/campaigns/${campaign.id}`}>
      <div className={`
        bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden 
        hover:shadow-lg hover:border-emerald-300 transition-all duration-300
        transform hover:scale-105 cursor-pointer
        ${sizeClasses[size]} ${className}
        ${campaign.featured ? 'ring-2 ring-emerald-400 shadow-emerald-100' : ''}
      `}>
        {/* Campaign Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={campaign.image} 
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          {campaign.featured && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              FEATURED
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
            {campaign.category}
          </div>
          {isOverfunded && (
            <div className="absolute bottom-3 left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              ÖVERFINANSIERAT!
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Title and Description */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {campaign.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3">
              {campaign.description}
            </p>
          </div>

          {/* Creator */}
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
              {campaign.creator.avatar ? (
                <img 
                  src={campaign.creator.avatar} 
                  alt={campaign.creator.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-emerald-600 font-bold text-sm">
                  {campaign.creator.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {campaign.creator.name}
              </p>
              {campaign.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  {campaign.location}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="mb-4">
              <ProgressBar 
                current={campaign.currentAmount}
                goal={campaign.fundingGoal}
                animated={false}
              />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center text-emerald-600 mb-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Mål</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {percentage.toFixed(0)}%
              </span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center text-blue-600 mb-1">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Stöd</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {campaign.backers}
              </span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center text-orange-600 mb-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Dagar</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {campaign.daysLeft}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;