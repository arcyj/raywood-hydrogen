import type {I18nBase} from '@shopify/hydrogen';
import type {
  CountryCode,
  CurrencyCode,
  LanguageCode,
  ProductFilter,
} from "@shopify/hydrogen/storefront-api-types";
import type {LocalizationQuery} from 'storefrontapi.generated';
import { CURRENCIES, DEFAULT_CURRENCY, getCurrencyByCode, getCurrencyForCountry } from "../helpers/currencies";

export type I18nLocale = I18nBase & {
  currency: CurrencyCode;
  label: string;
  pathPrefix?: string;
};

export type LocaleOption = I18nLocale & { pathPrefix: string };

/**
 * Builds locale options from currency config (for backward compat with some components).
 */
export function buildLocaleOptionsFromApi(
  _data: LocalizationQuery | null | undefined
): LocaleOption[] {
  return CURRENCIES.map((c) => ({
    language: 'EN' as LanguageCode,
    country: c.countryCode,
    currency: c.currency,
    label: c.label,
    pathPrefix: '',
  }));
}

/** Cookie name for persisting selected currency across reloads */
export const PREFERRED_CURRENCY_COOKIE = 'PREFERRED_CURRENCY';

/** Valid currency codes */
const VALID_CURRENCIES = new Set(['EUR', 'GBP', 'USD', 'AUD', 'CAD', 'CNY', 'JPY', 'VND']);

export function getPreferredCurrencyFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${PREFERRED_CURRENCY_COOKIE}=([^;]*)`));
  const raw = match?.[1];
  if (raw === undefined) return null;
  const value = decodeURIComponent(raw.trim()).toUpperCase();
  if (VALID_CURRENCIES.has(value)) return value;
  return null;
}

/** Country codes that should not trigger geo-based locale (unknown/Tor) */
const SKIP_GEO_COUNTRIES = new Set(['XX', 'T1']);

/**
 * Detects user country from request (Cloudflare CF-IPCountry / request.cf, or Vercel header).
 * Returns ISO 3166-1 Alpha-2 country code (e.g. "CA") or null.
 */
export function getDetectedCountryCode(request: Request): string | null {
  const cf = (request as Request & { cf?: { country?: string } }).cf;
  const fromCf = cf?.country?.toUpperCase();
  if (fromCf && !SKIP_GEO_COUNTRIES.has(fromCf)) return fromCf;

  const fromHeader =
    request.headers.get('CF-IPCountry')?.toUpperCase() ??
    request.headers.get('x-vercel-ip-country')?.toUpperCase();
  if (fromHeader && !SKIP_GEO_COUNTRIES.has(fromHeader)) return fromHeader;

  return null;
}

/**
 * Returns the locale option that matches the given country code, or null.
 */
export function getLocaleOptionForCountry(
  countryCode: string,
  options: LocaleOption[],
): LocaleOption | null {
  const code = countryCode.toUpperCase();
  return options.find((opt) => opt.country.toUpperCase() === code) ?? null;
}

/**
 * Gets locale from currency cookie + geo. No URL locale – currency in context/localStorage.
 * Uses preferred currency from cookie; country from currency for cart. Geo used for detected country.
 */
export function getLocaleFromRequest(request: Request): I18nLocale {
  const preferredCurrency = getPreferredCurrencyFromCookie(request);
  const detectedCountry = getDetectedCountryCode(request);

  if (preferredCurrency) {
    const currencyOption = getCurrencyByCode(preferredCurrency);
    if (currencyOption) {
      return {
        language: 'EN' as LanguageCode,
        country: currencyOption.countryCode as CountryCode,
        currency: currencyOption.currency,
        label: currencyOption.label,
        pathPrefix: '',
      };
    }
  }

  if (detectedCountry) {
    const currencyOption = getCurrencyForCountry(detectedCountry);
    return {
      language: 'EN' as LanguageCode,
      country: currencyOption.countryCode as CountryCode,
      currency: currencyOption.currency,
      label: currencyOption.label,
      pathPrefix: '',
    };
  }

  return {
    language: 'EN' as LanguageCode,
    country: DEFAULT_CURRENCY.countryCode as CountryCode,
    currency: DEFAULT_CURRENCY.currency,
    label: DEFAULT_CURRENCY.label,
    pathPrefix: '',
  };
}
