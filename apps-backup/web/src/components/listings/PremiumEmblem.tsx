import React from 'react';
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Award, 
  Gem, 
  TrendingUp,
  CheckCircle,
  Timer,
  Sparkles
} from 'lucide-react';

export type PremiumEmblemType = 
  | 'verified'
  | 'premium' 
  | 'vip'
  | 'exclusive'
  | 'bestseller'
  | 'new'
  | 'trending'
  | 'featured'
  | 'urgent'
  | 'diamond';

interface PremiumEmblemProps {
  type: PremiumEmblemType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

const EMBLEM_CONFIG = {
  verified: {
    icon: CheckCircle,
    text: 'VERIFIERAD',
    gradient: 'from-green-500 to-emerald-600',
    textColor: 'text-white',
    borderColor: 'border-green-200',
    pulse: false,
    glow: false,
    iconColor: 'text-green-100'
  },
  premium: {
    icon: Crown,
    text: 'PREMIUM',
    gradient: 'from-purple-500 to-violet-600',
    textColor: 'text-white',
    borderColor: 'border-purple-200',
    pulse: false,
    glow: true,
    iconColor: 'text-yellow-200'
  },
  vip: {
    icon: Gem,
    text: 'VIP',
    gradient: 'from-yellow-400 to-orange-500',
    textColor: 'text-gray-900',
    borderColor: 'border-yellow-200',
    pulse: true,
    glow: true,
    iconColor: 'text-gray-700'
  },
  exclusive: {
    icon: Shield,
    text: 'EXKLUSIV',
    gradient: 'from-indigo-500 to-purple-600',
    textColor: 'text-white',
    borderColor: 'border-indigo-200',
    pulse: false,
    glow: true,
    iconColor: 'text-indigo-100'
  },
  bestseller: {
    icon: Award,
    text: 'BÄSTSÄLJARE',
    gradient: 'from-orange-500 to-red-500',
    textColor: 'text-white',
    borderColor: 'border-orange-200',
    pulse: false,
    glow: false,
    iconColor: 'text-orange-100'
  },
  new: {
    icon: Sparkles,
    text: 'NYT',
    gradient: 'from-blue-500 to-cyan-500',
    textColor: 'text-white',
    borderColor: 'border-blue-200',
    pulse: true,
    glow: false,
    iconColor: 'text-blue-100'
  },
  trending: {
    icon: TrendingUp,
    text: 'TREND',
    gradient: 'from-pink-500 to-rose-500',
    textColor: 'text-white',
    borderColor: 'border-pink-200',
    pulse: false,
    glow: false,
    iconColor: 'text-pink-100'
  },
  featured: {
    icon: Star,
    text: 'UTVALD',
    gradient: 'from-emerald-500 to-teal-500',
    textColor: 'text-white',
    borderColor: 'border-emerald-200',
    pulse: false,
    glow: false,
    iconColor: 'text-emerald-100'
  },
  urgent: {
    icon: Timer,
    text: 'BRÅDSKANDE',
    gradient: 'from-red-500 to-red-600',
    textColor: 'text-white',
    borderColor: 'border-red-200',
    pulse: true,
    glow: false,
    iconColor: 'text-red-100'
  },
  diamond: {
    icon: Zap,
    text: 'DIAMOND',
    gradient: 'from-slate-400 via-slate-200 to-slate-400',
    textColor: 'text-gray-900',
    borderColor: 'border-slate-200',
    pulse: false,
    glow: true,
    iconColor: 'text-gray-700'
  }
};

const SIZE_CONFIG = {
  sm: {
    container: 'px-2 py-1',
    text: 'text-xs',
    icon: 'w-3 h-3',
    rounded: 'rounded-md'
  },
  md: {
    container: 'px-3 py-1',
    text: 'text-xs',
    icon: 'w-4 h-4',
    rounded: 'rounded-lg'
  },
  lg: {
    container: 'px-4 py-2',
    text: 'text-sm',
    icon: 'w-5 h-5',
    rounded: 'rounded-lg'
  }
};

const POSITION_CONFIG = {
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-right': 'bottom-2 right-2',
  'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
};

export const PremiumEmblem: React.FC<PremiumEmblemProps> = ({
  type,
  className = '',
  size = 'md',
  position = 'top-right'
}) => {
  const config = EMBLEM_CONFIG[type];
  const sizeConfig = SIZE_CONFIG[size];
  const positionClass = POSITION_CONFIG[position];
  const IconComponent = config.icon;

  return (
    <div className={`absolute ${positionClass} z-10 ${className}`}>
      <div className={`
        bg-gradient-to-r ${config.gradient}
        ${config.textColor}
        ${sizeConfig.container}
        ${sizeConfig.rounded}
        shadow-lg
        border-2 ${config.borderColor}
        backdrop-blur-sm
        flex items-center gap-1
        transform -rotate-3
        transition-all duration-200
        hover:scale-110 hover:rotate-0
        ${config.pulse ? 'animate-pulse' : ''}
        ${config.glow ? 'shadow-xl drop-shadow-lg' : ''}
        relative overflow-hidden
      `}>
        {/* Glow effect for premium types */}
        {config.glow && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse" />
        )}
        
        {/* Shine effect for VIP and Diamond */}
        {(type === 'vip' || type === 'diamond') && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-[shine_3s_infinite] opacity-60" />
        )}
        
        <IconComponent className={`${sizeConfig.icon} ${config.iconColor} ${config.pulse ? 'animate-bounce' : ''}`} />
        <span className={`${sizeConfig.text} font-black tracking-wide drop-shadow-sm`}>
          {config.text}
        </span>
      </div>
    </div>
  );
};

export default PremiumEmblem;