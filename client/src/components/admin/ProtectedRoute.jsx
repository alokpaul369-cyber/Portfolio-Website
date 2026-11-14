import { Navigate, Outlet, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

/**
 * Renders the admin pages only for an authenticated admin.
 * While the session is being checked a spinner is shown; without a valid
 * session the admin is sent to the login page, which returns them to the
 * page they asked for after signing in.
 */
export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg" role="status">
        <Loader2 className="size-5 animate-spin text-muted" aria-hidden="true" />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
