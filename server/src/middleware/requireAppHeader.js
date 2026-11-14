import ApiError from '../utils/ApiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF protection for cookie-based authentication.
 *
 * State-changing requests must carry `X-Requested-With: XMLHttpRequest`.
 * Browsers only allow a cross-site page to send a custom header after a CORS
 * preflight, and the CORS policy rejects origins other than the client, so a
 * forged form submission or image request from another site cannot pass.
 * The client's Axios instance sends this header on every request.
 */
export default function requireAppHeader(req, _res, next) {
  if (SAFE_METHODS.has(req.method) || req.get('X-Requested-With') === 'XMLHttpRequest') {
    return next();
  }
  return next(ApiError.forbidden('Request rejected: missing required header'));
}
