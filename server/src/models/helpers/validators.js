/**
 * Reusable validators and field definitions for Mongoose schemas.
 */

/** Practical email pattern: one @, no spaces, a dot in the domain. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Slug pattern: lowercase letters and digits separated by single hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Returns true for absolute http(s) URLs. Empty values are treated as valid (optional fields). */
export function isHttpUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Optional URL field definition, e.g. liveUrl: optionalUrl('Live URL'). */
export function optionalUrl(label) {
  return {
    type: String,
    trim: true,
    maxlength: [500, `${label} cannot exceed 500 characters`],
    validate: { validator: isHttpUrl, message: `${label} must be a valid http or https URL` },
  };
}

/**
 * Array-of-strings field with per-item trimming, empty-item removal,
 * case-insensitive de-duplication (unless `unique: false`) and length limits.
 * Set `lowercase` to store every item in lowercase (useful for tags).
 */
export function stringList({ label, maxItems, maxItemLength, lowercase = false, unique = true }) {
  return {
    type: [
      {
        type: String,
        trim: true,
        maxlength: [
          maxItemLength,
          `Each ${label.toLowerCase()} item cannot exceed ${maxItemLength} characters`,
        ],
      },
    ],
    default: [],
    set: (items) => {
      const seen = new Set();
      return (Array.isArray(items) ? items : [items])
        .map((item) => String(item ?? '').trim())
        .map((item) => (lowercase ? item.toLowerCase() : item))
        .filter((item) => {
          const key = item.toLowerCase();
          if (!item || (unique && seen.has(key))) return false;
          seen.add(key);
          return true;
        });
    },
    validate: {
      validator: (items) => items.length <= maxItems,
      message: `${label} cannot contain more than ${maxItems} items`,
    },
  };
}
