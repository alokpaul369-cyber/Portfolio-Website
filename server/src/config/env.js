import { randomBytes } from 'node:crypto';

/**
 * Centralised, validated access to environment variables.
 * Import `env` instead of reading process.env directly elsewhere in the app.
 */

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
// Automated tests: no request logging, no rate limits and cheaper password hashing.
const isTest = NODE_ENV === 'test';

// Test mode weakens security on purpose, so it must never run against a real database.
if (isTest && process.env.MONGODB_URI) {
  throw new Error('NODE_ENV=test cannot be used with MONGODB_URI set.');
}

/** Variables that must be present before the server starts in production. */
const REQUIRED_IN_PRODUCTION = ['MONGODB_URI', 'CLIENT_URL', 'JWT_SECRET'];

if (isProduction) {
  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * JWT signing secret. Production requires at least 32 characters.
 * In development a random secret is generated when none is set, which means
 * admin sessions end whenever the server restarts.
 */
function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    if (isProduction && secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production.');
    }
    return secret;
  }
  console.warn('JWT_SECRET is not set. Using a temporary secret; sessions reset on restart.');
  return randomBytes(48).toString('hex');
}

/**
 * SameSite policy for the auth cookie.
 * "lax" works when the client and API share a site (same domain or subdomains).
 * Use "none" when they are hosted on different sites; the cookie is then sent
 * only over HTTPS.
 */
function resolveSameSite() {
  const value = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
  if (!['lax', 'strict', 'none'].includes(value)) {
    throw new Error('COOKIE_SAME_SITE must be one of: lax, strict, none.');
  }
  return value;
}

const sessionDays = Number(process.env.AUTH_SESSION_DAYS) || 7;

/** Time zone for analytics days; a typo would otherwise break every page view silently. */
function resolveTimeZone() {
  const timeZone = (process.env.ANALYTICS_TIMEZONE || 'Asia/Dhaka').trim();
  try {
    new Intl.DateTimeFormat('en', { timeZone });
  } catch {
    throw new Error(
      `ANALYTICS_TIMEZONE "${timeZone}" is not a valid time zone, for example Asia/Dhaka.`,
    );
  }
  return timeZone;
}

/**
 * Number of proxies in front of the API (for real client addresses in rate limiting).
 * 1 for a single host such as Render; 2 when the site's host also proxies /api to it.
 */
const trustProxy = Number(process.env.TRUST_PROXY ?? 1) || 0;

const env = Object.freeze({
  nodeEnv: NODE_ENV,
  isProduction,
  isTest,
  port: Number(process.env.PORT) || 5000,
  trustProxy,
  mongoUri: process.env.MONGODB_URI || '',
  clientOrigins: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  auth: Object.freeze({
    jwtSecret: resolveJwtSecret(),
    sessionDays,
    // bcrypt cost factor. 12 is a sound balance of security and login latency.
    bcryptRounds: isTest ? 4 : 12,
    cookieSameSite: resolveSameSite(),
  }),
  cloudinary: Object.freeze({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    // All uploads are stored under this folder, e.g. "portfolio/projects".
    rootFolder: process.env.CLOUDINARY_FOLDER || 'portfolio',
  }),
  analytics: Object.freeze({
    // Calendar days for visitor statistics follow this time zone.
    timeZone: resolveTimeZone(),
  }),
  github: Object.freeze({
    username: process.env.GITHUB_USERNAME || 'alokpaul369-cyber',
    // Optional. Raises the GitHub rate limit from 60 to 5,000 requests per hour.
    token: process.env.GITHUB_TOKEN || '',
    cacheMinutes: Number(process.env.GITHUB_CACHE_MINUTES) || 60,
  }),
  mail: Object.freeze({
    // Defaults target Gmail over implicit TLS; SMTP_PASS is a Gmail app password.
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.MAIL_FROM_NAME || 'Alok Paul',
    // Where contact notifications are delivered; defaults to the sending account.
    contactRecipient: process.env.CONTACT_RECIPIENT || process.env.SMTP_USER || '',
    siteUrl:
      process.env.SITE_URL ||
      (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim(),
  }),
});

export default env;
