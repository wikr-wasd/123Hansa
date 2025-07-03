import { Currency } from '@prisma/client';
import axios from 'axios';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyConversion {
  fromCurrency: Currency;
  toCurrency: Currency;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  timestamp: Date;
}

interface CurrencyFormatting {
  locale: string;
  symbol: string;
  code: string;
  decimals: number;
}

class CurrencyService {
  private exchangeRatesCache: Map<string, { rates: ExchangeRates; timestamp: Date }> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly API_KEY = process.env.EXCHANGE_RATES_API_KEY;
  private readonly BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

  // Currency configurations for Nordic markets
  private readonly currencyConfigs: Record<Currency, CurrencyFormatting> = {
    [Currency.SEK]: {
      locale: 'sv-SE',
      symbol: 'kr',
      code: 'SEK',
      decimals: 2,
    },
    [Currency.NOK]: {
      locale: 'nb-NO',
      symbol: 'kr',
      code: 'NOK',
      decimals: 2,
    },
    [Currency.DKK]: {
      locale: 'da-DK',
      symbol: 'kr',
      code: 'DKK',
      decimals: 2,
    },
    [Currency.EUR]: {
      locale: 'de-DE',
      symbol: '€',
      code: 'EUR',
      decimals: 2,
    },
    [Currency.USD]: {
      locale: 'en-US',
      symbol: '$',
      code: 'USD',
      decimals: 2,
    },
    [Currency.GBP]: {
      locale: 'en-GB',
      symbol: '£',
      code: 'GBP',
      decimals: 2,
    },
  };

  // Get current exchange rates
  async getExchangeRates(baseCurrency: Currency = Currency.EUR): Promise<ExchangeRates> {
    const cacheKey = baseCurrency;
    const cached = this.exchangeRatesCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_DURATION) {
      return cached.rates;
    }

    try {
      const response = await axios.get(`${this.BASE_URL}/${baseCurrency}`);
      const rates = response.data.rates;
      
      this.exchangeRatesCache.set(cacheKey, {
        rates,
        timestamp: new Date(),
      });
      
      return rates;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      
      // Return cached rates if available, even if expired
      if (cached) {
        console.warn('Using expired exchange rates due to API failure');
        return cached.rates;
      }
      
      // Fallback rates (approximate Nordic rates)
      return this.getFallbackRates(baseCurrency);
    }
  }

  // Convert currency amounts
  async convertCurrency(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<CurrencyConversion> {
    if (fromCurrency === toCurrency) {
      return {
        fromCurrency,
        toCurrency,
        originalAmount: amount,
        convertedAmount: amount,
        exchangeRate: 1,
        timestamp: new Date(),
      };
    }

    try {
      const rates = await this.getExchangeRates(fromCurrency);
      const exchangeRate = rates[toCurrency];
      
      if (!exchangeRate) {
        throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
      }
      
      const convertedAmount = Math.round(amount * exchangeRate * 100) / 100;
      
      return {
        fromCurrency,
        toCurrency,
        originalAmount: amount,
        convertedAmount,
        exchangeRate,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Currency conversion failed:', error);
      throw new Error(`Failed to convert ${fromCurrency} to ${toCurrency}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Format currency amount for display
  formatCurrency(amount: number, currency: Currency, options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }): string {
    const config = this.currencyConfigs[currency];
    const {
      showSymbol = true,
      showCode = false,
      minimumFractionDigits = config.decimals,
      maximumFractionDigits = config.decimals,
    } = options || {};

    try {
      const formatter = new Intl.NumberFormat(config.locale, {
        minimumFractionDigits,
        maximumFractionDigits,
      });

      const formattedNumber = formatter.format(amount);
      
      let result = formattedNumber;
      
      if (showSymbol) {
        // For Nordic currencies, put symbol after the amount
        if ([Currency.SEK, Currency.NOK, Currency.DKK].includes(currency)) {
          result = `${formattedNumber} ${config.symbol}`;
        } else {
          result = `${config.symbol}${formattedNumber}`;
        }
      }
      
      if (showCode) {
        result = `${result} ${config.code}`;
      }
      
      return result;
    } catch (error) {
      console.error('Currency formatting failed:', error);
      return `${amount} ${currency}`;
    }
  }

  // Get currency by country
  getCurrencyByCountry(countryCode: string): Currency {
    const countryToCurrency: Record<string, Currency> = {
      SE: Currency.SEK,
      NO: Currency.NOK,
      DK: Currency.DKK,
      FI: Currency.EUR,
      IS: Currency.EUR, // Iceland uses EUR in our system
      US: Currency.USD,
      GB: Currency.GBP,
    };

    return countryToCurrency[countryCode] || Currency.EUR;
  }

  // Get supported currencies for a specific country/region
  getSupportedCurrencies(countryCode?: string): Currency[] {
    const allCurrencies = Object.values(Currency);
    
    if (!countryCode) {
      return allCurrencies;
    }
    
    // Nordic countries support all Nordic currencies + EUR + USD
    const nordicCountries = ['SE', 'NO', 'DK', 'FI', 'IS'];
    if (nordicCountries.includes(countryCode)) {
      return [Currency.SEK, Currency.NOK, Currency.DKK, Currency.EUR, Currency.USD];
    }
    
    // Default to major currencies
    return [Currency.EUR, Currency.USD, Currency.GBP];
  }

  // Calculate cross-border fees
  calculateCrossBorderFees(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): {
    baseAmount: number;
    conversionFee: number;
    crossBorderFee: number;
    totalFees: number;
    finalAmount: number;
  } {
    const isNordicCurrency = (currency: Currency) => 
      [Currency.SEK, Currency.NOK, Currency.DKK].includes(currency);
    
    const isSameCurrency = fromCurrency === toCurrency;
    const isWithinNordics = isNordicCurrency(fromCurrency) && isNordicCurrency(toCurrency);
    const isEuroTransaction = fromCurrency === Currency.EUR || toCurrency === Currency.EUR;
    
    let conversionFeeRate = 0;
    let crossBorderFeeRate = 0;
    
    if (isSameCurrency) {
      // No fees for same currency
      conversionFeeRate = 0;
      crossBorderFeeRate = 0;
    } else if (isWithinNordics) {
      // Low fees within Nordic region
      conversionFeeRate = 0.5; // 0.5%
      crossBorderFeeRate = 0.2; // 0.2%
    } else if (isEuroTransaction) {
      // Standard EU fees
      conversionFeeRate = 1.0; // 1.0%
      crossBorderFeeRate = 0.3; // 0.3%
    } else {
      // Higher fees for other currencies
      conversionFeeRate = 2.0; // 2.0%
      crossBorderFeeRate = 0.5; // 0.5%
    }
    
    const conversionFee = Math.round(amount * (conversionFeeRate / 100) * 100) / 100;
    const crossBorderFee = Math.round(amount * (crossBorderFeeRate / 100) * 100) / 100;
    const totalFees = conversionFee + crossBorderFee;
    const finalAmount = amount + totalFees;
    
    return {
      baseAmount: amount,
      conversionFee,
      crossBorderFee,
      totalFees,
      finalAmount,
    };
  }

  // Validate currency amount based on currency rules
  validateCurrencyAmount(amount: number, currency: Currency): {
    isValid: boolean;
    errors: string[];
    normalizedAmount?: number;
  } {
    const errors: string[] = [];
    
    // Check minimum amount
    const minimumAmounts: Record<Currency, number> = {
      [Currency.SEK]: 10,
      [Currency.NOK]: 10,
      [Currency.DKK]: 10,
      [Currency.EUR]: 5,
      [Currency.USD]: 5,
      [Currency.GBP]: 4,
    };
    
    const minimumAmount = minimumAmounts[currency];
    if (amount < minimumAmount) {
      errors.push(`Minimum amount for ${currency} is ${this.formatCurrency(minimumAmount, currency)}`);
    }
    
    // Check maximum amount (anti-money laundering limits)
    const maximumAmounts: Record<Currency, number> = {
      [Currency.SEK]: 1000000, // 1M SEK
      [Currency.NOK]: 1000000, // 1M NOK
      [Currency.DKK]: 1000000, // 1M DKK
      [Currency.EUR]: 100000,  // 100K EUR
      [Currency.USD]: 100000,  // 100K USD
      [Currency.GBP]: 80000,   // 80K GBP
    };
    
    const maximumAmount = maximumAmounts[currency];
    if (amount > maximumAmount) {
      errors.push(`Maximum amount for ${currency} is ${this.formatCurrency(maximumAmount, currency)}`);
    }
    
    // Normalize amount to currency precision
    const config = this.currencyConfigs[currency];
    const normalizedAmount = Math.round(amount * Math.pow(10, config.decimals)) / Math.pow(10, config.decimals);
    
    return {
      isValid: errors.length === 0,
      errors,
      normalizedAmount,
    };
  }

  // Get fallback exchange rates when API is unavailable
  private getFallbackRates(baseCurrency: Currency): ExchangeRates {
    // Approximate rates as of 2024 (should be updated regularly)
    const rates: Record<Currency, Record<Currency, number>> = {
      [Currency.EUR]: {
        [Currency.SEK]: 11.5,
        [Currency.NOK]: 11.8,
        [Currency.DKK]: 7.45,
        [Currency.EUR]: 1.0,
        [Currency.USD]: 1.08,
        [Currency.GBP]: 0.86,
      },
      [Currency.SEK]: {
        [Currency.SEK]: 1.0,
        [Currency.NOK]: 1.03,
        [Currency.DKK]: 0.65,
        [Currency.EUR]: 0.087,
        [Currency.USD]: 0.094,
        [Currency.GBP]: 0.075,
      },
      [Currency.NOK]: {
        [Currency.SEK]: 0.97,
        [Currency.NOK]: 1.0,
        [Currency.DKK]: 0.63,
        [Currency.EUR]: 0.085,
        [Currency.USD]: 0.092,
        [Currency.GBP]: 0.073,
      },
      [Currency.DKK]: {
        [Currency.SEK]: 1.54,
        [Currency.NOK]: 1.58,
        [Currency.DKK]: 1.0,
        [Currency.EUR]: 0.134,
        [Currency.USD]: 0.145,
        [Currency.GBP]: 0.115,
      },
      [Currency.USD]: {
        [Currency.SEK]: 10.6,
        [Currency.NOK]: 10.9,
        [Currency.DKK]: 6.9,
        [Currency.EUR]: 0.93,
        [Currency.USD]: 1.0,
        [Currency.GBP]: 0.79,
      },
      [Currency.GBP]: {
        [Currency.SEK]: 13.4,
        [Currency.NOK]: 13.7,
        [Currency.DKK]: 8.7,
        [Currency.EUR]: 1.16,
        [Currency.USD]: 1.27,
        [Currency.GBP]: 1.0,
      },
    };

    return rates[baseCurrency] || rates[Currency.EUR];
  }

  // Clear exchange rates cache
  clearCache(): void {
    this.exchangeRatesCache.clear();
  }

  // Get currency configuration
  getCurrencyConfig(currency: Currency): CurrencyFormatting {
    return this.currencyConfigs[currency];
  }
}

export { CurrencyService };