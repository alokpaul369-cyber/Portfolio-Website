import bcrypt from 'bcryptjs';
import { Admin } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { clearAuthCookie, setAuthCookie, signAuthToken } from '../utils/authToken.js';

/** Same message for unknown email and wrong password, so neither can be probed. */
const INVALID_CREDENTIALS = 'Invalid email or password';

/**
 * Hash compared against when the email is unknown, so a failed login takes the
 * same time whether or not the account exists. Created once, on first use.
 */
let dummyHashPromise;
function getDummyHash() {
  dummyHashPromise ??= bcrypt.hash('placeholder-password-for-timing', 12);
  return dummyHashPromise;
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Sets the httpOnly session cookie and returns the admin profile.
 */
export async function login(req, res) {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    throw ApiError.badRequest('Email and password are required');
  }
  if (email.length > 254 || password.length > 256) {
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }

  const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (!admin) {
    await bcrypt.compare(password, await getDummyHash());
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }

  const passwordMatches = await admin.comparePassword(password);
  if (!passwordMatches) {
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }

  // updateOne avoids running the save hooks, which only concern the password.
  admin.previousLoginAt = admin.lastLoginAt;
  admin.lastLoginAt = new Date();
  await Admin.updateOne(
    { _id: admin._id },
    { lastLoginAt: admin.lastLoginAt, previousLoginAt: admin.previousLoginAt },
  );

  setAuthCookie(res, signAuthToken(admin));
  res.json({ success: true, message: 'Logged in successfully', admin: admin.toJSON() });
}

/**
 * POST /api/auth/logout
 * Clears the session cookie. Safe to call when already logged out.
 */
export function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
}

/**
 * GET /api/auth/me (protected)
 * Returns the current admin; the client uses it to restore a session on load.
 */
export function getCurrentAdmin(req, res) {
  res.json({ success: true, admin: req.admin.toJSON() });
}

/** Message for a wrong current password on the account routes. */
const WRONG_PASSWORD = 'Your current password is incorrect';

/** Loads the signed-in admin with the password hash and checks the supplied password. */
async function confirmPassword(req) {
  const admin = await Admin.findById(req.admin._id).select('+password');
  if (!admin || !(await admin.comparePassword(req.validated.body.currentPassword))) {
    // 400, not 401: the session is valid, and the client treats 401 as signed out.
    throw ApiError.badRequest('Validation failed', [
      { field: 'currentPassword', message: WRONG_PASSWORD },
    ]);
  }
  return admin;
}

/**
 * PUT /api/auth/password (protected)
 * Body: { currentPassword, newPassword }
 * Ends every other session; this browser receives a fresh session cookie.
 */
export async function changePassword(req, res) {
  const admin = await confirmPassword(req);
  const { newPassword } = req.validated.body;

  if (await admin.comparePassword(newPassword)) {
    throw ApiError.badRequest('Validation failed', [
      { field: 'newPassword', message: 'Choose a password you have not just been using' },
    ]);
  }

  // The model validates the length, hashes the password and records the change time.
  // It also raises the session version, which ends every other session.
  admin.password = newPassword;
  await admin.save();

  setAuthCookie(res, signAuthToken(admin));
  res.json({ success: true, message: 'Password changed', admin: admin.toJSON() });
}

/**
 * PUT /api/auth/email (protected)
 * Body: { currentPassword, email }
 */
export async function changeEmail(req, res) {
  const admin = await confirmPassword(req);
  admin.email = req.validated.body.email;
  await admin.save();
  res.json({ success: true, message: 'Email changed', admin: admin.toJSON() });
}

/**
 * POST /api/auth/sessions/revoke (protected)
 * Signs out every other session; this browser receives a fresh session cookie.
 */
export async function revokeOtherSessions(req, res) {
  req.admin.sessionVersion = (req.admin.sessionVersion ?? 0) + 1;
  await req.admin.save();
  setAuthCookie(res, signAuthToken(req.admin));
  res.json({ success: true, message: 'Signed out of all other sessions' });
}
