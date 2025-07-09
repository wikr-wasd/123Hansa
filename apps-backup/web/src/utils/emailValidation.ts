/**
 * Strikt e-postvalidering för 123Hansa plattformen
 * Kräver @ symbol och validerar enligt RFC-standard
 */

export interface EmailValidationResult {
  isValid: boolean;
  error: string;
}

export const validateEmail = (email: string): EmailValidationResult => {
  // Kontrollera om e-post är tom
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'E-postadress krävs'
    };
  }

  const trimmedEmail = email.trim();

  // Kräv @ symbol - detta är det viktigaste kravet
  if (!trimmedEmail.includes('@')) {
    return {
      isValid: false,
      error: 'E-postadressen måste innehålla @ symbol'
    };
  }

  // Kontrollera att det bara finns en @ symbol
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount !== 1) {
    return {
      isValid: false,
      error: 'E-postadressen får bara innehålla en @ symbol'
    };
  }

  // RFC-kompatibel e-postvalidering
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Ogiltig e-postadress format. Använd format: exempel@domän.se'
    };
  }

  // Kontrollera längd
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: 'E-postadressen är för lång (max 254 tecken)'
    };
  }

  // Kontrollera för misstänkta mönster
  if (trimmedEmail.includes('..') || trimmedEmail.includes('++') || trimmedEmail.includes('--')) {
    return {
      isValid: false,
      error: 'E-postadressen innehåller ogiltiga teckenkombinationers'
    };
  }

  // Kontrollera att e-posten inte börjar eller slutar med punkt
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return {
      isValid: false,
      error: 'E-postadressen får inte börja eller sluta med punkt'
    };
  }

  // Kontrollera domändelen
  const parts = trimmedEmail.split('@');
  const localPart = parts[0];
  const domain = parts[1];

  // Validera local part (före @)
  if (localPart.length === 0) {
    return {
      isValid: false,
      error: 'E-postadressen måste ha text före @ symbolen'
    };
  }

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Delen före @ får max vara 64 tecken'
    };
  }

  // Validera domändelen
  if (!domain || domain.length < 3) {
    return {
      isValid: false,
      error: 'Ogiltig e-postdomän (för kort)'
    };
  }

  if (!domain.includes('.')) {
    return {
      isValid: false,
      error: 'Domänen måste innehålla minst en punkt'
    };
  }

  // Kontrollera att domänen inte börjar eller slutar med punkt eller bindestreck
  if (domain.startsWith('.') || domain.endsWith('.') || 
      domain.startsWith('-') || domain.endsWith('-')) {
    return {
      isValid: false,
      error: 'Ogiltig domänformat'
    };
  }

  // Kontrollera TLD (top level domain)
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  
  if (tld.length < 2) {
    return {
      isValid: false,
      error: 'Ogiltig domänändelse (för kort)'
    };
  }

  // Blockera temporära e-postdomäner
  const tempDomains = [
    '10minutemail.com',
    'guerrillamail.com', 
    'temp-mail.org',
    'throwaway.email',
    'mailinator.com',
    'dispostable.com',
    'tempmail.org',
    'fakemailgenerator.com',
    'yopmail.com',
    'sharklasers.com',
    'guerrillamail.org',
    'guerrillamail.net',
    'guerrillamail.biz',
    'spam4.me',
    'grr.la',
    'guerrillamail.de',
    'trbvm.com',
    'byom.de'
  ];
  
  if (tempDomains.includes(domain.toLowerCase())) {
    return {
      isValid: false,
      error: 'Temporära e-postadresser tillåts inte. Använd din vanliga e-post.'
    };
  }

  // Blockera kända spam-domäner
  const spamDomains = [
    'test.com',
    'example.com',
    'demo.com',
    'fake.com',
    'invalid.com'
  ];

  if (spamDomains.includes(domain.toLowerCase())) {
    return {
      isValid: false,
      error: 'Använd en riktig e-postadress'
    };
  }

  return {
    isValid: true,
    error: ''
  };
};

/**
 * Snabb kontroll om e-post har @ symbol
 */
export const hasAtSymbol = (email: string): boolean => {
  return email.includes('@');
};

/**
 * Normalisera e-postadress för konsistent lagring
 */
export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Hämta domän från e-postadress
 */
export const getEmailDomain = (email: string): string => {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : '';
};

/**
 * Kontrollera om e-postdomän verkar vara en företagsdomän
 */
export const isBusinessEmail = (email: string): boolean => {
  const domain = getEmailDomain(email);
  const personalDomains = [
    'gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com',
    'live.com', 'icloud.com', 'protonmail.com', 'telia.com',
    'spray.se', 'passagen.se', 'bredband2.com'
  ];
  
  return !personalDomains.includes(domain);
};

export default {
  validateEmail,
  hasAtSymbol,
  normalizeEmail,
  getEmailDomain,
  isBusinessEmail
};