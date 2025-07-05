import React from 'react';

interface SelectProps {
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ 
  children,
  value,
  onValueChange,
  label, 
  error, 
  options = [],
  className = ''
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <option value={value}>{children}</option>
);
export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={className}>{children}</div>
);
export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
  <span>{placeholder}</span>
);