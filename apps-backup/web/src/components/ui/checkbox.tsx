import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  onCheckedChange,
  className = '', 
  ...props 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={`
          h-4 w-4 text-blue-600 border-gray-300 rounded 
          focus:ring-blue-500 focus:ring-2
          ${className}
        `}
        {...props}
      />
      {label && (
        <label className="text-sm text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
};