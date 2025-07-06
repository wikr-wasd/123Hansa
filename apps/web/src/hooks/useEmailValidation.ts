import { useState, useCallback } from 'react';
import { validateEmail, EmailValidationResult } from '../utils/emailValidation';

interface UseEmailValidationReturn {
  email: string;
  emailError: string;
  isEmailValid: boolean;
  setEmail: (email: string) => void;
  validateEmailField: () => boolean;
  clearEmailError: () => void;
}

export const useEmailValidation = (initialEmail: string = ''): UseEmailValidationReturn => {
  const [email, setEmailState] = useState(initialEmail);
  const [emailError, setEmailError] = useState('');

  const setEmail = useCallback((newEmail: string) => {
    setEmailState(newEmail);
    
    // Validera i realtid när användaren skriver
    if (newEmail.length > 0) {
      const validation = validateEmail(newEmail);
      setEmailError(validation.error);
    } else {
      setEmailError('');
    }
  }, []);

  const validateEmailField = useCallback((): boolean => {
    const validation = validateEmail(email);
    setEmailError(validation.error);
    return validation.isValid;
  }, [email]);

  const clearEmailError = useCallback(() => {
    setEmailError('');
  }, []);

  const isEmailValid = email.length > 0 && emailError === '';

  return {
    email,
    emailError,
    isEmailValid,
    setEmail,
    validateEmailField,
    clearEmailError
  };
};

export default useEmailValidation;