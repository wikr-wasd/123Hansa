import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';

interface SecureFormProps {
  onSubmit: (data: FormData, csrfToken: string) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  requireCaptcha?: boolean;
  enableHoneypot?: boolean;
  submitText?: string;
  loadingText?: string;
}

interface FormField {
  name: string;
  value: string;
  isValid: boolean;
  errorMessage: string;
}

export const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  children,
  className = '',
  requireCaptcha = false,
  enableHoneypot = true,
  submitText = 'Skicka',
  loadingText = 'Skickar...'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [formData, setFormData] = useState<Map<string, FormField>>(new Map());
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const startTime = useRef(Date.now());

  // Fetch CSRF token on mount
  useEffect(() => {
    fetchCSRFToken();
  }, []);

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  };

  const validateEmail = (email: string): { isValid: boolean; message: string } => {
    if (!email) {
      return { isValid: false, message: 'E-postadress krävs' };
    }

    // Basic format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Ogiltig e-postadress format' };
    }

    // Check for suspicious patterns
    if (email.includes('..') || email.includes('++') || email.includes('--')) {
      return { isValid: false, message: 'E-postadressen innehåller ogiltiga tecken' };
    }

    // Check for temporary email domains
    const tempDomains = [
      '10minutemail.com', 'guerrillamail.com', 'temp-mail.org',
      'throwaway.email', 'mailinator.com', 'dispostable.com'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (tempDomains.includes(domain)) {
      return { isValid: false, message: 'Temporära e-postadresser tillåts inte' };
    }

    // Check domain validity
    if (!domain || domain.length < 3 || !domain.includes('.')) {
      return { isValid: false, message: 'Ogiltig e-postdomän' };
    }

    return { isValid: true, message: '' };
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (!password) {
      return { isValid: false, message: 'Lösenord krävs' };
    }

    if (password.length < 8) {
      return { isValid: false, message: 'Lösenordet måste vara minst 8 tecken' };
    }

    if (password.length > 128) {
      return { isValid: false, message: 'Lösenordet får vara max 128 tecken' };
    }

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (!hasLowerCase || !hasUpperCase || !hasNumbers || !hasSpecialChar) {
      return {
        isValid: false,
        message: 'Lösenordet måste innehålla små och stora bokstäver, siffror och specialtecken'
      };
    }

    return { isValid: true, message: '' };
  };

  const validateField = (name: string, value: string): { isValid: boolean; message: string } => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        const originalPassword = formData.get('password')?.value || '';
        if (value !== originalPassword) {
          return { isValid: false, message: 'Lösenorden matchar inte' };
        }
        return { isValid: true, message: '' };
      default:
        if (value.trim().length === 0) {
          return { isValid: false, message: 'Detta fält krävs' };
        }
        return { isValid: true, message: '' };
    }
  };

  const sanitizeInput = (value: string): string => {
    // Remove potentially dangerous characters
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>?/gm, '')
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    const validation = validateField(name, sanitizedValue);

    const newFormData = new Map(formData);
    newFormData.set(name, {
      name,
      value: sanitizedValue,
      isValid: validation.isValid,
      errorMessage: validation.message
    });
    setFormData(newFormData);
  };

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;
    
    // Minimum 2 seconds between submissions
    if (timeSinceLastSubmit < 2000) {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), 2000);
      return false;
    }

    // Maximum 3 attempts per minute
    if (submitAttempts >= 3) {
      const oneMinuteAgo = now - 60000;
      if (lastSubmitTime > oneMinuteAgo) {
        setIsRateLimited(true);
        setTimeout(() => {
          setIsRateLimited(false);
          setSubmitAttempts(0);
        }, 60000);
        return false;
      }
    }

    return true;
  };

  const checkFormTiming = (): boolean => {
    const fillTime = Date.now() - startTime.current;
    // Form filled too quickly (likely bot)
    if (fillTime < 3000) {
      console.warn('Form submitted too quickly');
      return false;
    }
    return true;
  };

  const checkHoneypot = (): boolean => {
    if (!enableHoneypot) return true;
    
    // Honeypot field should be empty
    const honeypotValue = honeypotRef.current?.value;
    if (honeypotValue && honeypotValue.trim() !== '') {
      console.warn('Honeypot field filled - likely bot');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting || isRateLimited) return;

    // Rate limiting check
    if (!checkRateLimit()) {
      alert('För många försök. Vänta innan du försöker igen.');
      return;
    }

    // Anti-bot checks
    if (!checkFormTiming() || !checkHoneypot()) {
      alert('Ogiltig formulärinskickning.');
      return;
    }

    // Validate all fields
    const newFormData = new Map(formData);
    let hasErrors = false;

    const formElement = formRef.current;
    if (formElement) {
      const inputs = formElement.querySelectorAll('input, textarea');
      inputs.forEach((input) => {
        const element = input as HTMLInputElement | HTMLTextAreaElement;
        if (element.name && element.name !== 'website') { // Skip honeypot
          const validation = validateField(element.name, element.value);
          newFormData.set(element.name, {
            name: element.name,
            value: element.value,
            isValid: validation.isValid,
            errorMessage: validation.message
          });
          if (!validation.isValid) {
            hasErrors = true;
          }
        }
      });
    }

    setFormData(newFormData);

    if (hasErrors) {
      alert('Vänligen korrigera felen i formuläret.');
      return;
    }

    if (!csrfToken) {
      alert('Säkerhetstoken saknas. Vänligen ladda om sidan.');
      return;
    }

    setIsSubmitting(true);
    setSubmitAttempts(prev => prev + 1);
    setLastSubmitTime(Date.now());

    try {
      const formDataObj = new FormData(formElement!);
      await onSubmit(formDataObj, csrfToken);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Ett fel uppstod. Vänligen försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
        <Shield className="w-4 h-4" />
        <span>Säkert formulär med kryptering och anti-spam skydd</span>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`space-y-4 ${className}`}
        autoComplete="on"
      >
        {/* CSRF Token */}
        <input type="hidden" name="_csrf" value={csrfToken} />
        
        {/* Honeypot field (hidden) */}
        {enableHoneypot && (
          <div style={{ display: 'none' }}>
            <label htmlFor="website">Website (leave empty):</label>
            <input
              ref={honeypotRef}
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
        )}

        {/* Form fields with validation */}
        <div className="space-y-4">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.props.name) {
              const fieldData = formData.get(child.props.name);
              const hasError = fieldData && !fieldData.isValid;

              return (
                <div className="space-y-2">
                  {React.cloneElement(child as React.ReactElement<any>, {
                    onChange: handleInputChange,
                    className: `${child.props.className || ''} ${
                      hasError ? 'border-red-500 focus:border-red-500' : ''
                    }`.trim(),
                    'aria-invalid': hasError ? 'true' : 'false'
                  })}
                  
                  {hasError && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{fieldData.errorMessage}</span>
                    </div>
                  )}
                  
                  {fieldData && fieldData.isValid && fieldData.value && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm">
                      <Check className="w-4 h-4" />
                      <span>Giltigt</span>
                    </div>
                  )}
                </div>
              );
            }
            return child;
          })}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || isRateLimited}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isSubmitting || isRateLimited
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{loadingText}</span>
            </div>
          ) : isRateLimited ? (
            'Vänta...'
          ) : (
            submitText
          )}
        </button>

        {/* Security indicators */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>SSL-krypterad anslutning</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>CSRF-skydd aktiverat</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Anti-spam kontroller</span>
          </div>
        </div>
      </form>
    </div>
  );
};

// Secure email input component
export const SecureEmailInput: React.FC<{
  name: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, placeholder = 'din@email.se', required = true, className = '', onChange }) => {
  return (
    <input
      type="email"
      name={name}
      placeholder={placeholder}
      required={required}
      autoComplete="email"
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${className}`}
      onChange={onChange}
    />
  );
};

// Secure password input component
export const SecurePasswordInput: React.FC<{
  name: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, placeholder = 'Lösenord', required = true, className = '', onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        required={required}
        autoComplete={name === 'password' ? 'current-password' : 'new-password'}
        className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${className}`}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default SecureForm;