import type {I18nBase} from '@shopify/hydrogen';
import type {
  CountryCode,
  CurrencyCode,
  LanguageCode,
  ProductFilter,
} from "@shopify/hydrogen/storefront-api-types";
import type {LocalizationQuery} from 'storefrontapi.generated';
import { CURRENCIES, DEFAULT_CURRENCY, getCurrencyByCode, getCurrencyForCountry, type CurrencyOption } from "../helpers/currencies";

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
/** Cookie name for persisting selected country across reloads */
export const PREFERRED_COUNTRY_COOKIE = 'PREFERRED_COUNTRY';
/** Cookie name for persisting selected language across reloads */
export const PREFERRED_LANGUAGE_COOKIE = 'PREFERRED_LANGUAGE';

const SUPPORTED_LANGUAGES = new Set(['EN', 'SV', 'LV', 'ET']);

export function getPreferredLanguageFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${PREFERRED_LANGUAGE_COOKIE}=([^;]*)`));
  const raw = match?.[1];
  if (!raw) return null;
  const value = decodeURIComponent(raw.trim()).toUpperCase();
  return SUPPORTED_LANGUAGES.has(value) ? value : null;
}

/** Valid currency codes – derived from CURRENCIES so we don't maintain two lists */
const VALID_CURRENCIES = new Set(CURRENCIES.map((c) => c.currency));

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
  const cf = (request as Request & {cf?: {country?: string}}).cf;
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

export type DetectedLocaleInfo = {
  country: string | null;
  currency: CurrencyOption;
  language: string;
};

/**
 * Single entry point for detecting country, currency, and language from a request.
 * Combines geo-IP detection, cookie preference, and Accept-Language parsing.
 */
function getPreferredCountryFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${PREFERRED_COUNTRY_COOKIE}=([^;]*)`));
  const raw = match?.[1];
  if (!raw) return null;
  return decodeURIComponent(raw.trim()).toUpperCase() || null;
}

export function detectLocaleInfo(request: Request): DetectedLocaleInfo {
  const geoCountry = getDetectedCountryCode(request);
  // Cookie-stored country takes precedence over geo-IP (user's explicit selection)
  const country = getPreferredCountryFromCookie(request) ?? geoCountry;
  const preferredCurrency = getPreferredCurrencyFromCookie(request);
  const currency = preferredCurrency
    ? (getCurrencyByCode(preferredCurrency) ?? getCurrencyForCountry(country ?? 'LV'))
    : getCurrencyForCountry(country ?? 'LV');
  const language = getPreferredLanguageFromCookie(request) ?? 'EN';
  return { country, currency, language };
}

/**
 * Gets locale from currency cookie + geo. No URL locale – currency in context/localStorage.
 * Uses preferred currency from cookie; country from currency for cart. Geo used for detected country.
 */
export function getLocaleFromRequest(request: Request): I18nLocale {
  const { currency, country, language } = detectLocaleInfo(request);
  return {
    language: language as LanguageCode,
    country: currency.countryCode as CountryCode,
    currency: currency.currency,
    label: currency.label,
    pathPrefix: '',
  };
}
