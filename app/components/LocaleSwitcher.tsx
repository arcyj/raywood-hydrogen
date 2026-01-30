import { useLocation, useNavigate, useRouteLoaderData } from 'react-router';
import { COUNTRIES } from '~/helpers/const';
import type { LocaleOption } from '~/lib/i18n';
import type { RootLoader } from '~/root';
import { Combobox } from './ui/Combobox';

/**
 * Returns the flag emoji for a 2-letter ISO country code (e.g. "CA" → 🇨🇦).
 * Uses Unicode regional indicator symbols; no assets or API needed.
 */
function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const a = countryCode.toUpperCase().charCodeAt(0);
  const b = countryCode.toUpperCase().charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return '';
  return String.fromCodePoint(0x1f1e6 - 65 + a, 0x1f1e6 - 65 + b);
}

function getFallbackLocaleOptions(): LocaleOption[] {
  return Object.entries(COUNTRIES).map(([key, locale]) => ({
    ...locale,
    pathPrefix: key === 'default' ? '' : key,
  }));
}

function getPathWithoutLocale(pathname: string, pathPrefix: string): string {
  if (!pathPrefix) return pathname;
  // Case-insensitive: URL can be /en-CA/... while pathPrefix is /en-ca
  if (pathname.toLowerCase().startsWith(pathPrefix.toLowerCase())) {
    const rest = pathname.slice(pathPrefix.length) || '/';
    return rest;
  }
  // First segment might be same locale in different case (e.g. /en-CA vs /en-ca)
  const firstSegment = pathname.slice(1).split('/')[0] ?? '';
  const pathPrefixWithoutSlash = pathPrefix.slice(1);
  if (firstSegment.toLowerCase() === pathPrefixWithoutSlash.toLowerCase()) {
    const rest = pathname.slice(1 + firstSegment.length) || '/';
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return pathname;
}

function getCurrentPathPrefix(pathname: string, options: LocaleOption[]): string {
  const firstSegment = pathname.slice(1).split('/')[0]?.toLowerCase() ?? '';
  const withSlash = firstSegment ? `/${firstSegment}` : '';
  const match = options.find(
    (opt) => opt.pathPrefix.toLowerCase() === withSlash.toLowerCase()
  );
  return match ? match.pathPrefix : '';
}

export function LocaleSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const rootData = useRouteLoaderData<RootLoader>('root');
  const options: LocaleOption[] = rootData?.availableLocales ?? getFallbackLocaleOptions();
  const currentPathPrefix = getCurrentPathPrefix(pathname, options);
  const currentOption =
    options.find((opt: LocaleOption) => opt.pathPrefix === currentPathPrefix) ?? options[0];

  const handleChange = (value: LocaleOption | null) => {
    if (!value) return;
    const pathWithoutLocale = getPathWithoutLocale(pathname, currentPathPrefix);
    const newPath = value.pathPrefix + pathWithoutLocale;
    navigate(newPath);
  };

  return (
    <Combobox<LocaleOption>
      value={currentOption}
      onChange={handleChange}
      items={options.map((opt: LocaleOption) => {
        const flag = getCountryFlag(opt.country);
        return {
          value: opt,
          label: flag ? `${flag} ${opt.label}` : opt.label,
        };
      })}
      getOptionKey={(opt) => opt.pathPrefix}
      by={(a, b) => a.pathPrefix === b.pathPrefix}
      placeholder="Country / Currency"
      aria-label="Select country and currency"
      buttonClassName="min-w-[160px]"
      filterable
    />
  );
}
