import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

interface HeartButtonProps {
  listingId: string;
  listing?: any;
  isFavorited: boolean;
  onToggle: (listingId: string) => void;
  showCount?: boolean;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
}

export const HeartButton: React.FC<HeartButtonProps> = ({
  listingId,
  listing,
  isFavorited,
  onToggle,
  showCount = false,
  count = 0,
  size = 'md',
  variant = 'button'
}) => {
  const { user: authUser } = useAuthStore();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!authUser) {
      toast.error('Du måste vara inloggad för att spara favoriter');
      return;
    }

    setIsAnimating(true);
    onToggle(listingId);
    
    setTimeout(() => setIsAnimating(false), 300);
    
    // Add some visual feedback
    if (!isFavorited && listing) {
      toast.success(`${listing.title} tillagd i favoriter!`, {
        icon: '❤️',
        duration: 2000,
      });
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`transition-all duration-200 hover:scale-110 ${
          isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        } ${isAnimating ? 'scale-125' : ''}`}
      >
        <Heart 
          className={`${sizeClasses[size]} transition-all duration-300 ${
            isFavorited ? 'fill-current' : ''
          }`}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${buttonSizeClasses[size]} rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all duration-200 hover:bg-white hover:scale-110 ${
        isAnimating ? 'scale-125' : ''
      }`}
    >
      <div className="flex items-center space-x-1">
        <Heart 
          className={`${sizeClasses[size]} transition-all duration-300 ${
            isFavorited 
              ? 'text-red-500 fill-red-500' 
              : 'text-gray-600 hover:text-red-500'
          }`}
        />
        {showCount && (
          <span className={`text-xs font-medium ${
            isFavorited ? 'text-red-500' : 'text-gray-600'
          }`}>
            {count}
          </span>
        )}
      </div>
    </button>
  );
};