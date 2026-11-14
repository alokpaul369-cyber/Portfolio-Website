import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/** Name of the httpOnly cookie that carries the admin session token. */
export const AUTH_COOKIE_NAME = 'admin_token';

const JWT_OPTIONS = Object.freeze({
  algorithm: 'HS256',
  issuer: 'alok-paul-portfolio',
  audience: 'admin',
});

/**
 * Cookie attributes. The same attributes must be used to set and to clear the
 * cookie, otherwise browsers keep the old one.
 * - httpOnly: not readable from JavaScript, which limits the impact of XSS
 * - secure: HTTPS only in production, and always when SameSite=None
 * - path: sent only to API routes
 */
function baseCookieOptions() {
  const { cookieSameSite } = env.auth;
  return {
    httpOnly: true,
    secure: env.isProduction || cookieSameSite === 'none',
    sameSite: cookieSameSite,
    path: '/api',
  };
}

/**
 * Signs a session token for the given admin. The admin's session version is
 * embedded so that raising it invalidates every token issued earlier.
 */
export function signAuthToken(admin) {
  const payload = { sub: String(admin._id), sv: admin.sessionVersion ?? 0 };
  return jwt.sign(payload, env.auth.jwtSecret, {
    ...JWT_OPTIONS,
    expiresIn: `${env.auth.sessionDays}d`,
  });
}

/**
 * Verifies a session token and returns its payload.
 * Throws a jsonwebtoken error when the token is invalid or expired.
 */
export function verifyAuthToken(token) {
  return jwt.verify(token, env.auth.jwtSecret, {
    algorithms: [JWT_OPTIONS.algorithm],
    issuer: JWT_OPTIONS.issuer,
    audience: JWT_OPTIONS.audience,
  });
}

/** Stores the token in the auth cookie; the cookie expires with the token. */
export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: env.auth.sessionDays * 24 * 60 * 60 * 1000,
  });
}

/** Removes the auth cookie. */
export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions());
}
