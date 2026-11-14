import mongoose, { Schema } from 'mongoose';
import schemaOptions from './helpers/schemaOptions.js';
import imageSchema from './helpers/imageSchema.js';
import { EMAIL_PATTERN, isHttpUrl } from './helpers/validators.js';

/** Settings are stored in a single document identified by this key. */
export const SETTINGS_KEY = 'main';

/** Length and count limits for the editable site content, shared with the request validators. */
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

/** True for an https URL on linkedin.com or one of its subdomains. Empty values are valid. */
export function isLinkedInUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com'))
    );
  } catch {
    return false;
  }
}

const text = (label, max) => ({
  type: String,
  trim: true,
  maxlength: [max, `${label} cannot exceed ${max} characters`],
});

/**
 * Text shown on the public site that the admin can override. Every field is
 * optional: an unset field means the site uses its built-in default.
 */
const contentSchema = new Schema(
  {
    role: text('Role', CONTENT_LIMITS.role),
    tagline: text('Tagline', CONTENT_LIMITS.tagline),
    location: text('Location', CONTENT_LIMITS.location),
    availability: text('Availability', CONTENT_LIMITS.availability),
    email: {
      type: String,
      trim: true,
      maxlength: [254, 'Email cannot exceed 254 characters'],
      match: [EMAIL_PATTERN, 'Please provide a valid email address'],
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: [200, 'LinkedIn URL cannot exceed 200 characters'],
      validate: {
        validator: isLinkedInUrl,
        message: 'LinkedIn URL must be an https address on linkedin.com',
      },
    },
    // Arrays default to undefined so "not set" differs from "set to an empty list".
    aboutParagraphs: {
      type: [text('Paragraph', CONTENT_LIMITS.paragraph)],
      default: undefined,
      validate: {
        validator: (items) =>
          items === undefined || (items.length >= 1 && items.length <= CONTENT_LIMITS.paragraphs),
        message: `About must contain between 1 and ${CONTENT_LIMITS.paragraphs} paragraphs`,
      },
    },
    keyFacts: {
      type: [
        new Schema(
          {
            value: {
              ...text('Value', CONTENT_LIMITS.factValue),
              required: [true, 'Value is required'],
            },
            label: {
              ...text('Label', CONTENT_LIMITS.factLabel),
              required: [true, 'Label is required'],
            },
          },
          { _id: false },
        ),
      ],
      default: undefined,
      validate: {
        validator: (items) => items === undefined || items.length <= CONTENT_LIMITS.facts,
        message: `Key facts cannot contain more than ${CONTENT_LIMITS.facts} items`,
      },
    },
  },
  { _id: false },
);

/** Uploaded CV. `publicId` lets the file be deleted from Cloudinary when it is replaced. */
const cvSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, 'CV URL is required'],
      trim: true,
      maxlength: [500, 'CV URL cannot exceed 500 characters'],
      validate: { validator: isHttpUrl, message: 'CV URL must be a valid http or https URL' },
    },
    publicId: {
      type: String,
      required: [true, 'publicId is required'],
      trim: true,
      maxlength: 255,
    },
    filename: { ...text('File name', 120), required: [true, 'File name is required'] },
  },
  { _id: false },
);

/**
 * Site-wide settings managed from the admin panel.
 * There is exactly one document (key "main"); use getSiteSettings() to read it.
 */
const siteSettingsSchema = new Schema(
  {
    key: { type: String, default: SETTINGS_KEY, unique: true, immutable: true },
    // Portrait shown on the Home page. When empty, the site uses its bundled default photo.
    profileImage: { type: imageSchema, default: undefined },
    // Editable text and links; see contentSchema.
    content: { type: contentSchema, default: undefined },
    // CV offered for download on the Home page. When empty, no download button is shown.
    cv: { type: cvSchema, default: undefined },
  },
  schemaOptions,
);

/** Returns the settings document, creating it on first use. */
siteSettingsSchema.statics.getSiteSettings = async function getSiteSettings() {
  return this.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $setOnInsert: { key: SETTINGS_KEY } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
};

const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
