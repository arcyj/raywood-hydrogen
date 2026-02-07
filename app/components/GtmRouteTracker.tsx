import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { pushPageView } from '~/helpers/google';

/**
 * Pushes a virtual page_view to GTM dataLayer on every client-side route change.
 * Required for SPAs so Google Analytics (or other GTM tags) see each "page" view.
 */
export function GtmRouteTracker() {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname + location.search;
    // Only push on route change; initial load is already tracked by GTM/GA4 default tag
    if (prevPathRef.current !== null && prevPathRef.current !== path) {
      pushPageView(path, document.title);
    }
    prevPathRef.current = path;
  }, [location.pathname, location.search]);

  return null;
}
