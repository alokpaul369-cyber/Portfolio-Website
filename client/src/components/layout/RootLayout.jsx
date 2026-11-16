import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import AppToaster from '@/components/ui/AppToaster';
import usePageViews from '@/hooks/usePageViews';
import { pageEnter } from '@/lib/motion';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

/**
 * False until the layout has mounted once. The first page a visitor lands on
 * is shown at once (its sections have their own entrance); only later route
 * changes fade the page in.
 */
let hasNavigated = false;

/**
 * Shared layout for all public pages: header, page content and footer.
 * Each new page fades in with a small upward slide (lib/motion.js `pageEnter`).
 * Also sends the anonymous page view for each route (hooks/usePageViews).
 */
export default function RootLayout() {
  usePageViews();
  // Query-string changes (filters, search, page) keep the same key, so lists do not re-fade.
  const { pathname } = useLocation();

  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-text"
      >
        Skip to content
      </a>

      <ScrollToTop />
      <Navbar />

      {/* tabIndex -1: receives focus after route changes without joining the tab order. */}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {/* Pages are loaded on demand; keep the fallback empty to avoid a flash.
            The keyed wrapper sits inside Suspense, so the fade starts once the page has loaded. */}
        <Suspense fallback={null}>
          <motion.div
            key={pathname}
            variants={pageEnter}
            initial={hasNavigated ? 'hidden' : false}
            animate="visible"
          >
            <Outlet />
          </motion.div>
        </Suspense>
      </main>

      <Footer />
      <AppToaster />
    </div>
  );
}
