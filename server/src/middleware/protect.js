import { Admin } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { AUTH_COOKIE_NAME, clearAuthCookie, verifyAuthToken } from '../utils/authToken.js';

/**
 * Resolves the admin from the session cookie.
 *
 * Verifies the JWT and confirms the admin still exists. Tokens issued before
 * the last password change, or carrying an older session version, are
 * rejected, so changing the password or signing out everywhere ends every
 * other session.
 *
 * @returns {Promise<{ admin: object | null, reason: 'missing' | 'invalid' | null }>}
 */
async function resolveAdmin(req) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return { admin: null, reason: 'missing' };

  let payload;
  try {
    payload = verifyAuthToken(token);
  } catch {
    return { admin: null, reason: 'invalid' };
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin) return { admin: null, reason: 'invalid' };

  if (admin.passwordChangedAt) {
    const changedAtSeconds = Math.floor(admin.passwordChangedAt.getTime() / 1000);
    if (payload.iat < changedAtSeconds) return { admin: null, reason: 'invalid' };
  }

  // Tokens from before a password change or a 'sign out everywhere' carry an older version.
  if ((payload.sv ?? 0) !== (admin.sessionVersion ?? 0)) return { admin: null, reason: 'invalid' };

  return { admin, reason: null };
}

/**
 * Restricts a route to the authenticated admin.
 * On success the admin document is available as `req.admin`.
 */
export default async function protect(req, res, next) {
  const { admin, reason } = await resolveAdmin(req);

  if (reason === 'missing') {
    throw ApiError.unauthorized('Please log in to continue');
  }
  if (!admin) {
    clearAuthCookie(res);
    throw ApiError.unauthorized('Your session has expired or is invalid. Please log in again.');
  }

  req.admin = admin;
  next();
}

/**
 * Attaches `req.admin` when a valid session exists, but never rejects the request.
 * Used by public routes that show extra data to the admin (for example draft posts).
 */
export async function optionalAuth(req, _res, next) {
  const { admin } = await resolveAdmin(req);
  req.admin = admin ?? undefined;
  next();
}
