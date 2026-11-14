import axios from 'axios';

/**
 * Shared Axios instance for all API requests.
 * - baseURL comes from VITE_API_URL, so the same build can target any server
 *   (defaults to /api, which the Vite dev server proxies to Express).
 * - withCredentials sends the admin session cookie.
 * - X-Requested-With is required by the server's CSRF check on non-GET requests.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

/**
 * Session expiry: any 401 except a failed login means the admin token is
 * missing, expired or invalid. The AuthProvider listens for this event and
 * signs the admin out, which redirects to the login page.
 * Public pages never receive 401 responses, so visitors are unaffected.
 */
api.interceptors.response.use(undefined, (error) => {
  const isLoginRequest = error.config?.url?.endsWith('/auth/login');
  if (error.response?.status === 401 && !isLoginRequest) {
    window.dispatchEvent(new Event('admin:session-expired'));
  }
  return Promise.reject(error);
});

/**
 * Converts any request error into a message that is safe to show in the UI.
 * Uses the server's message when available.
 * @param {unknown} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!error.response) return 'Unable to reach the server. Please check your connection.';
    // A 5xx without a JSON message usually means the API is down or restarting.
    if (error.response.status >= 500) {
      return 'The server is temporarily unavailable. Please try again shortly.';
    }
  }
  return 'Something went wrong. Please try again.';
}

/**
 * Absolute address of the blog's RSS feed (GET /api/blog/feed.xml), for feed
 * readers. Works whether VITE_API_URL is relative (/api) or a full URL.
 */
export function feedUrl() {
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
  return new URL(`${base}/blog/feed.xml`, window.location.origin).href;
}

export default api;
