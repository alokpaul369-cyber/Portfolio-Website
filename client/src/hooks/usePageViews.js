import { useEffect } from 'react';
import { useLocation } from 'react-router';
import api from '@/lib/api';

/** sessionStorage flag marking that this tab's visit has been counted. */
const VISIT_FLAG = 'visit-counted';

/**
 * Whether views may be sent from this browser:
 * - never when the visitor's browser asks not to be tracked (Do Not Track or
 *   Global Privacy Control);
 * - never in development, unless VITE_ANALYTICS_IN_DEV is "true", so local
 *   testing does not add to the real statistics.
 */
function trackingAllowed() {
  if (import.meta.env.DEV && import.meta.env.VITE_ANALYTICS_IN_DEV !== 'true') return false;
  if (navigator.globalPrivacyControl === true) return false;
  return navigator.doNotTrack !== '1' && window.doNotTrack !== '1';
}

/**
 * True the first time it is called in a browser tab: the first page of a
 * visit. The flag lives in sessionStorage, is never sent anywhere and is
 * cleared when the tab closes. If storage is unavailable, no visit is counted.
 */
function startsVisit() {
  try {
    if (window.sessionStorage.getItem(VISIT_FLAG)) return false;
    window.sessionStorage.setItem(VISIT_FLAG, '1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Sends one anonymous page view per public route change to
 * POST /api/analytics/view. Only the path is sent, plus the referring site on
 * the first page of a visit. Used once, in the public layout; failures are
 * ignored.
 */
export default function usePageViews() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!trackingAllowed() || pathname.startsWith('/admin')) return undefined;

    // A short delay skips pages left immediately (such as redirects), and
    // deciding inside the timer means React's development double effects
    // never count a visit twice.
    const timer = window.setTimeout(() => {
      const newVisit = startsVisit();
      api
        .post('/analytics/view', {
          path: pathname,
          newVisit,
          ...(newVisit && document.referrer && { referrer: document.referrer }),
        })
        .catch(() => {});
    }, 500);
    return () => window.clearTimeout(timer);
  }, [pathname]);
}
