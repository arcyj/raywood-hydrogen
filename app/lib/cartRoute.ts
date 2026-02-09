import { useLocation } from 'react-router';

/**
 * Resolve cart route with locale prefix so cart forms submit to the correct path
 * (e.g. /en-ca/cart when under ($locale) routes).
 */
export function useCartRoute() {
  const { pathname } = useLocation();
  const localePrefix =
    pathname.match(/^(\/[a-z]{2}(?:-[a-z]{2})?)/i)?.[1] ?? '';
  return `${localePrefix}/cart`;
}
