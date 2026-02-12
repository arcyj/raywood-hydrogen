import type {CountryCode, CurrencyCode} from '@shopify/hydrogen/storefront-api-types';

/** Currency option for display – currency only, no country */
export type CurrencyOption = {
  currency: CurrencyCode;
  label: string;
  /** Country used for cart/checkout when this currency is selected */
  countryCode: CountryCode;
};

/** Available currencies – display only, no country names. countryCode used for cart/checkout. */
export const CURRENCIES: CurrencyOption[] = [
  {currency: 'EUR', label: '€ EUR', countryCode: 'LV'},
  {currency: 'GBP', label: '£ GBP', countryCode: 'GB'},
  {currency: 'USD', label: '$ USD', countryCode: 'US'},
  {currency: 'AUD', label: '$ AUD', countryCode: 'AU'},
  {currency: 'CAD', label: '$ CAD', countryCode: 'CA'},
  // {currency: 'CNY', label: '¥ CNY', countryCode: 'CN'},
  // {currency: 'JPY', label: '¥ JPY', countryCode: 'JP'},
  // {currency: 'VND', label: '₫ VND', countryCode: 'VN'},
];

export const DEFAULT_CURRENCY: CurrencyOption = CURRENCIES[0];

export function getCurrencyByCode(currency: string): CurrencyOption | undefined {
  return CURRENCIES.find((c) => c.currency.toUpperCase() === currency.toUpperCase());
}

/** EUR countries map to EUR */
const EUR_COUNTRIES = ['LV', 'DE', 'FR', 'ES', 'IT', 'NL', 'AT', 'BE', 'FI', 'IE', 'PT'];
const EUR_OPTION = CURRENCIES[0];

export function getCurrencyForCountry(countryCode: string): CurrencyOption {
  const upper = countryCode.toUpperCase();
  if (EUR_COUNTRIES.includes(upper)) return EUR_OPTION;
  const byCountry: Partial<Record<string, CurrencyOption>> = {
    AU: getCurrencyByCode('AUD'),
    CA: getCurrencyByCode('CAD'),
    GB: getCurrencyByCode('GBP'),
    US: getCurrencyByCode('USD'),
  } as const;
  const found = byCountry[upper];
  return found ?? DEFAULT_CURRENCY;
}
