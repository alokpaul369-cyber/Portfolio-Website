import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { Helmet } from 'react-helmet-async';
import AppToaster from '@/components/ui/AppToaster';
import AuthProvider from '@/context/AuthProvider';

/**
 * Root of the /admin area: session provider, toasts and a "noindex" robots
 * tag so search engines do not index admin pages.
 */
export default function AdminRoot() {
  return (
    <AuthProvider>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <AppToaster />
    </AuthProvider>
  );
}
