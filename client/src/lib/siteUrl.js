/**
 * Public origin of the website, used for canonical, Open Graph and share URLs.
 * Set VITE_SITE_URL (for example https://alokpaul.dev) for production builds;
 * without it the current origin is used, which is correct in development.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(
  /\/+$/,
  '',
);
