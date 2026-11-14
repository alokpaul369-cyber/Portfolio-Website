import { z } from 'zod';
import { EMAIL_PATTERN, isHttpUrl } from '../models/helpers/validators.js';
import { imageInput, requiredText } from './common.js';
import { CONTENT_LIMITS, isLinkedInUrl } from '../models/SiteSettings.js';

/**
 * PUT /api/settings  Body: any subset of { profileImage, content, cv }.
 *
 * A key that is absent is left unchanged. `null` clears a value: the site
 * then falls back to its built-in default text, photo or no CV.
 */

/** A text field that may be set, or cleared with null. */
const clearableText = (label, max) => requiredText(label, max).nullable().optional();

const contentSchema = z.strictObject({
  role: clearableText('Role', CONTENT_LIMITS.role),
  tagline: clearableText('Tagline', CONTENT_LIMITS.tagline),
  location: clearableText('Location', CONTENT_LIMITS.location),
  availability: clearableText('Availability', CONTENT_LIMITS.availability),
  email: z
    .string()
    .trim()
    .max(254, 'Email cannot exceed 254 characters')
    .regex(EMAIL_PATTERN, 'Please provide a valid email address')
    .nullable()
    .optional(),
  linkedin: z
    .string()
    .trim()
    .max(200, 'LinkedIn URL cannot exceed 200 characters')
    .refine(isLinkedInUrl, 'LinkedIn URL must be an https address on linkedin.com')
    .nullable()
    .optional(),
  aboutParagraphs: z
    .array(requiredText('Paragraph', CONTENT_LIMITS.paragraph))
    .min(1, 'Add at least one paragraph, or reset to the default')
    .max(
      CONTENT_LIMITS.paragraphs,
      `About cannot contain more than ${CONTENT_LIMITS.paragraphs} paragraphs`,
    )
    .nullable()
    .optional(),
  keyFacts: z
    .array(
      z.strictObject({
        value: requiredText('Value', CONTENT_LIMITS.factValue),
        label: requiredText('Label', CONTENT_LIMITS.factLabel),
      }),
    )
    .max(CONTENT_LIMITS.facts, `Key facts cannot contain more than ${CONTENT_LIMITS.facts} items`)
    .nullable()
    .optional(),
});

/** CV returned by POST /api/uploads/document. */
const cvInput = z.strictObject({
  url: z
    .string()
    .trim()
    .min(1, 'CV URL is required')
    .max(500, 'CV URL cannot exceed 500 characters')
    .refine(isHttpUrl, 'CV URL must be a valid http or https URL'),
  publicId: z.string().trim().min(1, 'publicId is required').max(255),
  filename: requiredText('File name', 120),
});

export const updateSettingsSchema = z.strictObject({
  profileImage: imageInput.nullable().optional(),
  content: contentSchema.optional(),
  cv: cvInput.nullable().optional(),
});
