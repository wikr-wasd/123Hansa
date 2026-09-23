import { intlLocaleFor, isCountryCode } from '@hansa/core';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from './useTranslation';

/**
 * BCP 47-taggen som läsarens egna datum och tal ska formateras med.
 *
 * Land och språk är två olika saker (CLAUDE.md). Landet avgör formatet, så en
 * dansk som läser sidan på engelska ser ändå danska datum. Därför används
 * profilens land först.
 *
 * Saknas landet — utloggad, eller ett konto där det aldrig fyllts i — faller
 * den tillbaka på gränssnittets språk. Intl tar en ren språktagg, och 'no' ger
 * norskt datumformat. Alternativet hade varit att gissa 'sv-SE', och då ser en
 * dansk besökare svenska datum utan att något i koden säger att det är en
 * gissning.
 *
 * Annonsens EGNA datum formateras inte med den här — de följer annonsens land,
 * precis som priset.
 */
export function useViewerLocale(): string {
  const { user } = useAuthStore();
  const { getCurrentLanguage } = useTranslation();

  const country = user?.country;
  if (isCountryCode(country)) return intlLocaleFor(country);
  return getCurrentLanguage();
}
