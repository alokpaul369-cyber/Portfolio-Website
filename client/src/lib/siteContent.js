import { site, socialLinks } from '@/config/site';
import { aboutParagraphs, keyFacts } from '@/data/about';

/**
 * Site content that the admin can override from the panel.
 *
 * The values in code are the defaults. GET /api/settings returns only the
 * fields the admin has changed; mergeContent() lays them over the defaults,
 * so the site is complete even when the API is unavailable.
 */

/** Limits shared by the admin form; they mirror the server's validators. */
export const CONTENT_LIMITS = Object.freeze({
  role: 60,
  tagline: 240,
  location: 60,
  availability: 80,
  paragraphs: 6,
  paragraph: 1000,
  facts: 4,
  factValue: 8,
  factLabel: 30,
});

/** Built-in values, used for any field the admin has not set. */
export const DEFAULT_CONTENT = Object.freeze({
  role: site.role,
  tagline: site.tagline,
  location: site.location,
  availability: site.availability,
  email: socialLinks.email,
  // The placeholder in config/site.js is not a real profile, so there is no default link.
  linkedin: null,
  aboutParagraphs,
  keyFacts,
});

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.trim() !== '';

/**
 * Combines saved settings with the defaults. Anything missing or malformed
 * falls back to the default, so a bad response or stale cache cannot break a page.
 *
 * @param {unknown} settings data from GET /api/settings, or a cached copy
 */
export function mergeContent(settings) {
  const saved = isObject(settings) && isObject(settings.content) ? settings.content : {};
  const text = (field) => (isText(saved[field]) ? saved[field] : DEFAULT_CONTENT[field]);

  const paragraphs = Array.isArray(saved.aboutParagraphs)
    ? saved.aboutParagraphs.filter(isText)
    : [];
  const facts = Array.isArray(saved.keyFacts)
    ? saved.keyFacts.filter((fact) => isObject(fact) && isText(fact.value) && isText(fact.label))
    : null;

  const cv =
    isObject(settings) && isObject(settings.cv) && isText(settings.cv.url) ? settings.cv : null;
  const photo =
    isObject(settings) && isObject(settings.profileImage) && isText(settings.profileImage.url)
      ? settings.profileImage
      : null;

  return {
    role: text('role'),
    tagline: text('tagline'),
    location: text('location'),
    availability: text('availability'),
    email: text('email'),
    linkedin: isText(saved.linkedin) ? saved.linkedin : null,
    aboutParagraphs: paragraphs.length > 0 ? paragraphs : DEFAULT_CONTENT.aboutParagraphs,
    // A saved empty list is a deliberate choice to show no key facts.
    keyFacts: facts ?? DEFAULT_CONTENT.keyFacts,
    cv,
    profileImage: photo,
    // Optional sections stay hidden until the API reports that they have entries.
    sections: {
      research: isObject(settings) && settings.sections?.research === true,
      certifications: isObject(settings) && settings.sections?.certifications === true,
      blog: isObject(settings) && settings.sections?.blog === true,
    },
  };
}

/** localStorage key holding the last settings response, for an instant first paint. */
const CACHE_KEY = 'site-content';

/** Returns the cached settings, or null when missing, unreadable or malformed. */
export function readCachedSettings() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CACHE_KEY));
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Stores the latest settings; storage errors (private mode, quota) are ignored. */
export function writeCachedSettings(settings) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch {
    // The cache is an optimisation only.
  }
}
