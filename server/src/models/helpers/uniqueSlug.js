import slugify from '../../utils/slugify.js';
import { SLUG_PATTERN } from './validators.js';

/**
 * Schema plugin that adds a unique, URL-safe `slug` field derived from another field.
 *
 * Behaviour:
 * - If no slug is provided, one is generated from `sourceField` (for example the title).
 * - A slug provided by the admin is normalised with slugify().
 * - Existing slugs are not regenerated when the title changes, so published URLs stay stable.
 * - On collision a numeric suffix is appended: "my-project", "my-project-2", ...
 *
 * @param {import('mongoose').Schema} schema
 * @param {{ sourceField?: string }} [options]
 */
export default function uniqueSlug(schema, { sourceField = 'title' } = {}) {
  schema.add({
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [80, 'Slug cannot exceed 80 characters'],
      match: [SLUG_PATTERN, 'Slug may contain only lowercase letters, numbers and hyphens'],
    },
  });

  schema.pre('validate', async function assignSlug() {
    if (this.slug && !this.isModified('slug')) return;

    const base = slugify(this.slug || this.get(sourceField));
    if (!base) return; // The source field's own "required" validator reports the problem.

    // Find the first free slug, ignoring this document itself.
    const Model = this.constructor;
    let candidate = base;
    for (
      let suffix = 2;
      await Model.exists({ slug: candidate, _id: { $ne: this._id } });
      suffix += 1
    ) {
      candidate = `${base.slice(0, 80 - String(suffix).length - 1)}-${suffix}`;
    }
    this.slug = candidate;
  });
}
