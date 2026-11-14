/**
 * Helpers for building list queries.
 */

/** Escapes user input for safe use inside a regular expression. */
export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive "contains" match. */
export function containsRegex(value) {
  return new RegExp(escapeRegex(value), 'i');
}

/** Case-insensitive exact match, e.g. for tech stack items. */
export function exactRegex(value) {
  return new RegExp(`^${escapeRegex(value)}$`, 'i');
}

/**
 * Runs a paginated find and returns `{ data, pagination }`.
 *
 * @param {import('mongoose').Model} Model
 * @param {object} options
 * @param {object} options.filter  MongoDB filter
 * @param {object} options.sort    sort specification
 * @param {number} options.page    1-based page number
 * @param {number} options.limit   items per page
 * @param {string} [options.select] projection
 */
export async function paginate(Model, { filter, sort, page, limit, select }) {
  const [data, total] = await Promise.all([
    Model.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(select ?? ''),
    Model.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
