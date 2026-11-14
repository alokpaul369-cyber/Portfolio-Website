import { createContext } from 'react';

/**
 * Admin session state.
 * status: 'loading' while the session is checked, then 'authenticated' or 'unauthenticated'.
 *
 * @type {import('react').Context<{
 *   admin: object | null,
 *   status: 'loading' | 'authenticated' | 'unauthenticated',
 *   login: (email: string, password: string) => Promise<void>,
 *   logout: () => Promise<void>,
 *   setAdmin: (admin: object) => void,
 * } | null>}
 */
export const AuthContext = createContext(null);

/** Window event fired by the API client when an admin request gets a 401. */
export const SESSION_EXPIRED_EVENT = 'admin:session-expired';
