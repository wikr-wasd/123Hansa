import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface EmailInputProps {
  value: string;
  onChange: (email: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
  autoComplete?: string;
  id?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  error,
  placeholder = 'din@email.se',
  required = true,
  label = 'E-postadress',
  className = '',
  disabled = false,
  autoComplete = 'email',
  id = 'email'
}) => {
  const hasValue = value && value.length > 0;
  const hasAtSymbol = value && value.includes('@');
  const isValid = hasValue && !error && hasAtSymbol;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="email"
          id={id}
          required={required}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : isValid
              ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        
        {/* Status icon */}
        {hasValue && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {isValid && (
        <div className="mt-2 flex items-center space-x-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Giltig e-postadress</span>
        </div>
      )}

      {/* Help text */}
      {!error && !isValid && (
        <div className="mt-1 text-xs text-gray-500">
          {required && !hasAtSymbol && hasValue
            ? 'E-postadressen måste innehålla @ symbol'
            : required 
            ? 'En giltig e-postadress krävs'
            : 'Ange en giltig e-postadress'
          }
        </div>
      )}

      {/* @ symbol requirement notice */}
      {hasValue && !hasAtSymbol && (
        <div className="mt-1 text-xs text-red-600 font-medium">
          ⚠️ E-postadressen måste innehålla @ symbol
        </div>
      )}
    </div>
  );
};

export default EmailInput;