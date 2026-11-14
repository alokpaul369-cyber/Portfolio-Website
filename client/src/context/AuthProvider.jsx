import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { AuthContext, SESSION_EXPIRED_EVENT } from './authContext';

/**
 * Provides the admin session to the /admin area.
 *
 * - On mount, GET /api/auth/me restores an existing session from the httpOnly cookie.
 * - login() and logout() call the API; the cookie itself is managed by the server.
 * - When any request reports 401 (expired or invalid token), the API client
 *   fires SESSION_EXPIRED_EVENT and the session is cleared, which makes
 *   ProtectedRoute redirect to the login page.
 *
 * Only mounted for admin routes, so public visitors never call /auth/me.
 */
export default function AuthProvider({ children }) {
  const [state, setState] = useState({ admin: null, status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!cancelled) setState({ admin: data.admin, status: 'authenticated' });
      })
      .catch(() => {
        if (!cancelled) setState({ admin: null, status: 'unauthenticated' });
      });

    const onExpired = () => setState({ admin: null, status: 'unauthenticated' });
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    return () => {
      cancelled = true;
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setState({ admin: data.admin, status: 'authenticated' });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setState({ admin: null, status: 'unauthenticated' });
    }
  }, []);

  /** Replaces the stored admin after an account change (email or password). */
  const setAdmin = useCallback((admin) => {
    setState({ admin, status: 'authenticated' });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout, setAdmin }),
    [state, login, logout, setAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
