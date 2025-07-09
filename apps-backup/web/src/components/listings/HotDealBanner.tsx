import React from 'react';
import { Flame, Star, Crown, Zap, TrendingUp } from 'lucide-react';

interface HotDealBannerProps {
  type?: 'hot-deal' | 'premium' | 'featured' | 'trending' | 'vip';
  className?: string;
}

const BANNER_TYPES = {
  'hot-deal': {
    icon: Flame,
    text: 'HET AFFÄR',
    gradient: 'from-red-500 to-orange-500',
    textColor: 'text-white',
    pulse: true,
    iconColor: 'text-yellow-200'
  },
  'premium': {
    icon: Crown,
    text: 'PREMIUM',
    gradient: 'from-purple-500 to-pink-500',
    textColor: 'text-white',
    pulse: false,
    iconColor: 'text-yellow-200'
  },
  'featured': {
    icon: Star,
    text: 'FEATURED',
    gradient: 'from-blue-500 to-cyan-500',
    textColor: 'text-white',
    pulse: false,
    iconColor: 'text-yellow-100'
  },
  'trending': {
    icon: TrendingUp,
    text: 'TRENDING',
    gradient: 'from-green-500 to-emerald-500',
    textColor: 'text-white',
    pulse: false,
    iconColor: 'text-white'
  },
  'vip': {
    icon: Zap,
    text: 'VIP',
    gradient: 'from-yellow-400 to-orange-400',
    textColor: 'text-gray-900',
    pulse: true,
    iconColor: 'text-gray-700'
  }
};

export const HotDealBanner: React.FC<HotDealBannerProps> = ({ 
  type = 'hot-deal', 
  className = '' 
}) => {
  const config = BANNER_TYPES[type];
  const IconComponent = config.icon;

  return (
    <div className={`absolute top-3 left-3 z-10 ${className}`}>
      <div className={`
        bg-gradient-to-r ${config.gradient} 
        ${config.textColor} 
        px-3 py-1 
        rounded-lg 
        shadow-lg 
        transform 
        -rotate-2 
        ${config.pulse ? 'animate-pulse' : ''}
        border-2 border-white/30
        backdrop-blur-sm
        flex items-center gap-1
        hover:scale-110 transition-transform duration-200
        relative overflow-hidden
      `}>
        {/* Shine effect for hot deals */}
        {type === 'hot-deal' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-[shine_2s_infinite] opacity-60" />
        )}
        
        <IconComponent className={`w-4 h-4 ${config.iconColor} ${config.pulse ? 'animate-bounce' : ''}`} />
        <span className="text-xs font-black tracking-wide drop-shadow-sm">
          {config.text}
        </span>
      </div>
    </div>
  );
};

export default HotDealBanner;