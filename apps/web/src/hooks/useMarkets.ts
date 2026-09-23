import { useEffect, useState } from 'react';
import type { CountryCode } from '@hansa/core';
import { fetchLaunchedCountries } from '../services/marketService';

// Listan är liten och ändras nästan aldrig, men den ligger i databasen och
// måste hämtas. Ett modulcachat löfte gör att sex komponenter på samma sida
// delar ett anrop i stället för att göra var sitt.
let cache: Promise<CountryCode[]> | null = null;

function load(): Promise<CountryCode[]> {
  if (!cache) {
    cache = fetchLaunchedCountries().catch((err) => {
      // Ett misslyckat anrop får inte cachas som ett svar. Utan den här raden
      // vore sidan trasig tills fliken laddas om.
      cache = null;
      throw err;
    });
  }
  return cache;
}

export interface LaunchedCountries {
  countries: CountryCode[];
  isLoading: boolean;
  /** Satt när listan inte kunde hämtas. Formuläret ska då inte gissa. */
  error: string | null;
  reload: () => void;
}

/**
 * De länder plattformen är öppen i.
 *
 * Tom lista under laddning, med flit: ett formulär ska inte visa ett land som
 * kanske inte är öppet. Den som renderar en landsväljare ska låsa den medan
 * `isLoading` är sant.
 */
export function useLaunchedCountries(): LaunchedCountries {
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setError(null);

    load()
      .then((list) => {
        if (!alive) return;
        setCountries(list);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setCountries([]);
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [attempt]);

  return {
    countries,
    isLoading,
    error,
    reload: () => {
      cache = null;
      setAttempt((n) => n + 1);
    },
  };
}
