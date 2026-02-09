import {useParams} from 'react-router';

const LOCALE_PATH_PATTERN = /^\/[a-z]{2}-[a-z]{2}(?:\/|$)/i;
const EXTERNAL_PREFIXES = ['http://', 'https://', 'mailto:', 'tel:'];

export function withLocalePrefix(path: string, locale?: string | null): string {
  if (!path || !locale) return path;
  if (path.startsWith('#')) return path;
  if (path.startsWith('//')) return path;
  if (EXTERNAL_PREFIXES.some((prefix) => path.startsWith(prefix))) return path;
  if (!path.startsWith('/')) return path;

  const trimmed = path.split(/[?#]/)[0] ?? path;
  if (LOCALE_PATH_PATTERN.test(trimmed)) return path;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

export function useLocalizedPath(): (path: string) => string {
  const {locale} = useParams();
  return (path: string) => withLocalePrefix(path, locale);
}
