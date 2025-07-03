import React from 'react';

interface ProgressBarProps {
  current: number;
  goal: number;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  goal,
  animated = true,
  className = ''
}) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOverfunded = current > goal;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {new Intl.NumberFormat('sv-SE', { 
            style: 'currency', 
            currency: 'SEK',
            maximumFractionDigits: 0 
          }).format(current)}
        </span>
        <span className="text-sm text-gray-500">
          av {new Intl.NumberFormat('sv-SE', { 
            style: 'currency', 
            currency: 'SEK',
            maximumFractionDigits: 0 
          }).format(goal)}
        </span>
      </div>
      
      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            isOverfunded 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-600'
          }`}
          style={{ 
            width: `${percentage}%`,
            ...(animated && { 
              animation: 'progressFill 2s ease-out' 
            })
          }}
        />
        {isOverfunded && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <span className={`text-sm font-bold ${
          isOverfunded ? 'text-purple-600' : 'text-emerald-600'
        }`}>
          {percentage.toFixed(0)}% finansierat
        </span>
        {isOverfunded && (
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
            Överfinansierat!
          </span>
        )}
      </div>
      
      <style jsx>{`
        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: ${percentage}%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;