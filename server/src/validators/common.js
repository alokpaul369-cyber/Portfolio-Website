import { z } from 'zod';
import { isHttpUrl, SLUG_PATTERN } from '../models/helpers/validators.js';

/**
 * Building blocks shared by the request schemas.
 *
 * Body schemas deliberately use no `.default()` values: defaults live in the
 * Mongoose models, so a partial update never resets fields that were omitted.
 */

/** Route parameter: MongoDB ObjectId. */
export const idParams = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id'),
});

/** Route parameter: URL slug. */
export const slugParams = z.object({
  slug: z.string().max(80, 'Invalid slug').regex(SLUG_PATTERN, 'Invalid slug'),
});

/** Required, trimmed text with length limits. */
export function requiredText(label, max, min = 1) {
  return z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, min === 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} cannot exceed ${max} characters`);
}

/** Optional text; an empty string clears the value. */
export function optionalText(label, max) {
  return z.string().trim().max(max, `${label} cannot exceed ${max} characters`).optional();
}

/** Optional http(s) URL; an empty string clears the value. */
export function optionalUrl(label) {
  return z
    .string()
    .trim()
    .max(500, `${label} cannot exceed 500 characters`)
    .refine(isHttpUrl, `${label} must be a valid http or https URL`)
    .optional();
}

/** List of short strings, e.g. tags or tech stack items. */
export function stringArray(label, maxItems, maxItemLength) {
  return z
    .array(
      z
        .string()
        .trim()
        .max(
          maxItemLength,
          `Each ${label.toLowerCase()} item cannot exceed ${maxItemLength} characters`,
        ),
      { error: `${label} must be a list` },
    )
    .max(maxItems, `${label} cannot contain more than ${maxItems} items`)
    .optional();
}

/** Image object returned by the upload endpoint. */
export const imageInput = z.strictObject({
  url: z
    .string()
    .trim()
    .min(1, 'Image URL is required')
    .refine(isHttpUrl, 'Image URL must be a valid http or https URL'),
  publicId: z.string().trim().max(255).optional(),
  alt: optionalText('Alt text', 150),
});

/**
 * A calendar date sent as a string such as "2025-01-15" (or a full ISO
 * timestamp). Numbers, booleans and null are rejected rather than coerced.
 */
export function dateInput(label) {
  return z
    .string({ error: `${label} must be a valid date` })
    .trim()
    .min(1, `${label} is required`)
    .pipe(z.coerce.date({ error: `${label} must be a valid date` }));
}

/** An optional date: null or an empty string clears it. */
export function clearableDateInput(label) {
  return z
    .preprocess((value) => (value === '' ? null : value), dateInput(label).nullable())
    .optional();
}

/** Optional slug; an empty string asks the server to regenerate it from the title. */
export const slugInput = z.string().trim().max(80, 'Slug cannot exceed 80 characters').optional();

/** "true" / "false" query string to boolean. */
export const booleanQuery = z
  .enum(['true', 'false'], { error: 'Must be true or false' })
  .transform((value) => value === 'true')
  .optional();

/** Pagination query parameters with a configurable default page size. */
export function paginationQuery(defaultLimit) {
  return {
    page: z.coerce.number().int().min(1, 'Page must be 1 or greater').max(1000).default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'Limit must be 1 or greater')
      .max(50, 'Limit cannot exceed 50')
      .default(defaultLimit),
  };
}

/** Free-text search term. */
export const searchQuery = z
  .string()
  .trim()
  .max(100, 'Search cannot exceed 100 characters')
  .optional();

/**
 * Builds create and update schemas from one field definition.
 * - create: unknown fields rejected, required fields enforced
 * - update: every field optional, at least one field required
 *
 * @param {Record<string, import('zod').ZodType>} shape
 */
export function crudSchemas(shape) {
  const create = z.strictObject(shape);
  const update = create
    .partial()
    .refine((data) => Object.keys(data).length > 0, 'Provide at least one field to update');
  return { create, update };
}
