import { Suspense } from 'react';
import { Outlet } from 'react-router';
import AppToaster from '@/components/ui/AppToaster';
import usePageViews from '@/hooks/usePageViews';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

/**
 * Shared layout for all public pages: header, page content and footer.
 * Also sends the anonymous page view for each route (hooks/usePageViews).
 */
export default function RootLayout() {
  usePageViews();

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
        {/* Pages are loaded on demand; keep the fallback empty to avoid a flash. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <AppToaster />
    </div>
  );
}
