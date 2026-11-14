/**
 * Converts text into a URL-safe slug: lowercase ASCII words joined by hyphens.
 * Accented characters are reduced to their base letters; other symbols are removed.
 *
 * @example slugify('Task Manager API (v2)') // 'task-manager-api-v2'
 * @param {string} text
 * @param {number} [maxLength=80]
 * @returns {string}
 */
export default function slugify(text, maxLength = 80) {
  return String(text ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, maxLength)
    .replace(/-+$/g, '');
}
