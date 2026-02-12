import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  getCurrencyByCode,
  getCurrencyForCountry,
  type CurrencyOption,
} from '~/helpers/currencies';
import { PREFERRED_CURRENCY_COOKIE } from '~/lib/i18n';

const CURRENCY_STORAGE_KEY = 'preferred_currency';
const DETECTED_COUNTRY_STORAGE_KEY = 'detected_country';
const COOKIE_MAX_AGE_DAYS = 365;

function setCurrencyCookie(currency: string) {
  if (typeof document === 'undefined') return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${PREFERRED_CURRENCY_COOKIE}=${encodeURIComponent(currency)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

type CurrencyContextValue = {
  /** User-selected currency (stored in context + localStorage + cookie) */
  selectedCurrency: CurrencyOption;
  setSelectedCurrency: (currency: CurrencyOption) => void;
  /** Geo-detected country (stored in localStorage for checkout prefill) */
  detectedCountry: string | null;
  setDetectedCountry: (country: string | null) => void;
  /** Country used for cart buyer identity – checkout uses this market */
  countryForCart: string;
  availableCurrencies: CurrencyOption[];
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  children,
  initialCurrency,
  initialDetectedCountry,
}: {
  children: ReactNode;
  initialCurrency?: CurrencyOption;
  initialDetectedCountry?: string | null;
}) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyOption>(
    () => initialCurrency ?? getStoredCurrency() ?? DEFAULT_CURRENCY
  );
  const [detectedCountry, setDetectedCountryState] = useState<string | null>(
    () => initialDetectedCountry ?? getStoredDetectedCountry() ?? null
  );

  const setSelectedCurrency = useCallback((currency: CurrencyOption) => {
    setSelectedCurrencyState(currency);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency.currency);
      setCurrencyCookie(currency.currency);
    }
  }, []);

  const setDetectedCountry = useCallback((country: string | null) => {
    setDetectedCountryState(country);
    if (typeof window !== 'undefined') {
      if (country) {
        localStorage.setItem(DETECTED_COUNTRY_STORAGE_KEY, country);
      } else {
        localStorage.removeItem(DETECTED_COUNTRY_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (initialCurrency) {
      setSelectedCurrencyState(initialCurrency);
    }
  }, [initialCurrency?.currency]);

  useEffect(() => {
    if (initialDetectedCountry !== undefined) {
      setDetectedCountryState(initialDetectedCountry);
      if (initialDetectedCountry && typeof window !== 'undefined') {
        localStorage.setItem(DETECTED_COUNTRY_STORAGE_KEY, initialDetectedCountry);
      }
    }
  }, [initialDetectedCountry]);

  const value = useMemo(
    () => ({
      selectedCurrency,
      setSelectedCurrency,
      detectedCountry,
      setDetectedCountry,
      countryForCart: selectedCurrency.countryCode,
      availableCurrencies: CURRENCIES,
    }),
    [selectedCurrency, setSelectedCurrency, detectedCountry, setDetectedCountry]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return ctx;
}

function getStoredCurrency(): CurrencyOption | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (!stored) return null;
  return getCurrencyByCode(stored) ?? null;
}

function getStoredDetectedCountry(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DETECTED_COUNTRY_STORAGE_KEY);
}

export function getCurrencyForCountryCode(countryCode: string): CurrencyOption {
  return getCurrencyForCountry(countryCode);
}
