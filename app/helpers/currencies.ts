import type {CountryCode, CurrencyCode} from '@shopify/hydrogen/storefront-api-types';

/** Currency option for display – currency only, no country */
export type CurrencyOption = {
  currency: CurrencyCode;
  label: string;
  /** Country used for cart/checkout when this currency is selected */
  countryCode: CountryCode;
};

/**
 * Available currencies – display only, no country names. countryCode used for cart/checkout.
 * Only includes currencies for markets that must be enabled in Shopify Admin (Settings → Markets).
 * TRY, UAH, RSD, MDL, MKD, ALL etc. removed – add back when those markets are configured.
 */
export const CURRENCIES: CurrencyOption[] = [
  // European (commonly supported by Shopify Markets)
  {currency: 'EUR', label: '€ EUR', countryCode: 'DE'},
  {currency: 'GBP', label: '£ GBP', countryCode: 'GB'},
  {currency: 'SEK', label: 'kr SEK', countryCode: 'SE'},
  {currency: 'NOK', label: 'kr NOK', countryCode: 'NO'},
  {currency: 'DKK', label: 'kr DKK', countryCode: 'DK'},
  {currency: 'CHF', label: 'CHF', countryCode: 'CH'},
  {currency: 'PLN', label: 'zł PLN', countryCode: 'PL'},
  {currency: 'CZK', label: 'Kč CZK', countryCode: 'CZ'},
  {currency: 'HUF', label: 'Ft HUF', countryCode: 'HU'},
  {currency: 'RON', label: 'lei RON', countryCode: 'RO'},
  {currency: 'ISK', label: 'kr ISK', countryCode: 'IS'},
  // Rest of world
  {currency: 'USD', label: '$ USD', countryCode: 'US'},
  {currency: 'AUD', label: '$ AUD', countryCode: 'AU'},
  {currency: 'CAD', label: '$ CAD', countryCode: 'CA'},
  {currency: 'JPY', label: '¥ JPY', countryCode: 'JP'},
];

export const DEFAULT_CURRENCY: CurrencyOption = CURRENCIES[0];

export function getCurrencyByCode(currency: string): CurrencyOption | undefined {
  return CURRENCIES.find((c) => c.currency.toUpperCase() === currency.toUpperCase());
}

/** Eurozone countries map to EUR */
const EUR_COUNTRIES = [
  'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK',
];
const EUR_OPTION = CURRENCIES[0];

export function getCurrencyForCountry(countryCode: string): CurrencyOption {
  const upper = countryCode.toUpperCase();
  if (EUR_COUNTRIES.includes(upper)) return EUR_OPTION;
  const byCountry: Partial<Record<string, CurrencyOption>> = {
    AU: getCurrencyByCode('AUD'),
    CA: getCurrencyByCode('CAD'),
    CH: getCurrencyByCode('CHF'),
    CZ: getCurrencyByCode('CZK'),
    DK: getCurrencyByCode('DKK'),
    GB: getCurrencyByCode('GBP'),
    HU: getCurrencyByCode('HUF'),
    IS: getCurrencyByCode('ISK'),
    NO: getCurrencyByCode('NOK'),
    PL: getCurrencyByCode('PLN'),
    RO: getCurrencyByCode('RON'),
    SE: getCurrencyByCode('SEK'),
    US: getCurrencyByCode('USD'),
    JP: getCurrencyByCode('JPY'),
  };
  const found = byCountry[upper];
  return found ?? DEFAULT_CURRENCY;
}
