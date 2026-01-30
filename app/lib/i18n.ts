import type {I18nBase} from '@shopify/hydrogen';
import type {
  CountryCode,
  CurrencyCode,
  LanguageCode,
  ProductFilter,
} from "@shopify/hydrogen/storefront-api-types";
import type {LocalizationQuery} from 'storefrontapi.generated';
import { COUNTRIES, DEFAULT_LOCALE } from "../helpers/const";

export type I18nLocale = I18nBase & {
  currency: CurrencyCode;
  label: string;
  pathPrefix?: string;
};

export type LocaleOption = I18nLocale & { pathPrefix: string };

/**
 * Builds locale options from Shopify Admin localization (available markets).
 * One option per country with its currency; uses defaultLanguage for pathPrefix only.
 */
export function buildLocaleOptionsFromApi(
  data: LocalizationQuery | null | undefined
): LocaleOption[] {
  if (!data?.localization?.availableCountries?.length) {
    return Object.entries(COUNTRIES).map(([key, locale]) => ({
      ...locale,
      pathPrefix: key === 'default' ? '' : key,
    }));
  }

  const options: LocaleOption[] = [];
  const defaultOption: LocaleOption = {
    ...DEFAULT_LOCALE,
    pathPrefix: '',
  };
  options.push(defaultOption);

  for (const country of data.localization.availableCountries) {
    const countryCode = country.isoCode;
    const langCode = (country.defaultLanguage?.isoCode ?? 'EN').toUpperCase() as LanguageCode;
    const pathPrefix = `/${langCode.toLowerCase()}-${countryCode}`;
    const currencyCode = (country.currency?.isoCode ?? 'USD') as CurrencyCode;
    const existing = COUNTRIES[pathPrefix];
    options.push({
      language: langCode,
      country: countryCode,
      currency: existing?.currency ?? currencyCode,
      label: existing?.label ?? `${country.name} (${currencyCode})`,
      pathPrefix,
    });
  }

  return options;
}

/** Matches locale path segment e.g. /en-ca, /fr-fr */
const LOCALE_PATH_PATTERN = /^\/[a-z]{2}-[a-z]{2}$/;

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  let firstPathPart = `/${url.pathname.substring(1).split("/")[0].toLowerCase()}`;
  firstPathPart = firstPathPart.replace(".data", "");

  if (COUNTRIES[firstPathPart]) {
    return {
      ...COUNTRIES[firstPathPart],
      pathPrefix: firstPathPart,
    };
  }

  // Accept locale from API / URL even if not in COUNTRIES (avoids 404 on locale change)
  if (LOCALE_PATH_PATTERN.test(firstPathPart)) {
    const [lang, country] = firstPathPart.slice(1).split("-");
    return {
      language: (lang ?? "en").toUpperCase() as LanguageCode,
      country: (country ?? "us").toUpperCase() as CountryCode,
      currency: "USD" as CurrencyCode,
      label: `${firstPathPart.slice(1)} (USD)`,
      pathPrefix: firstPathPart,
    };
  }

  return {
    ...COUNTRIES.default,
    pathPrefix: "",
  };
}
