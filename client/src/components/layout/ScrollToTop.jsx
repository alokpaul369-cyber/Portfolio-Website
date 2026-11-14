import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/**
 * Runs on every route change:
 * - scrolls to the top (or to the element named by the URL hash)
 * - moves keyboard focus to the main content, so keyboard and screen reader
 *   users start at the new page instead of on the link they activated
 *
 * Nothing happens on the first load, where the browser already handles both.
 * Renders nothing.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    } else {
      // "instant" avoids a visible smooth scroll when a new page loads.
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!hash) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
  }, [pathname, hash]);

  return null;
}
