/**
 * Helpers for certification entries, shared by the public section and the admin list.
 */

/** One day in milliseconds. */
const DAY = 24 * 60 * 60 * 1000;

/**
 * True once the expiry date has fully passed. Dates are stored as midnight UTC,
 * so a certificate counts as valid for the whole of its expiry day.
 */
export function isExpired(certification, now = new Date()) {
  if (!certification?.expiryDate) return false;
  return new Date(certification.expiryDate).getTime() + DAY <= now.getTime();
}
