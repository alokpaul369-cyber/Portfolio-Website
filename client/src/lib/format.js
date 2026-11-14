/**
 * Date formatting helpers. Dates are shown in UTC so that a value stored as
 * "2022-01-01" never shifts to the previous year in western time zones.
 */

const yearFormat = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'UTC' });
const monthYearFormat = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const fullDateFormat = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/** Formats a date as "Nov 2026" (UTC, so a stored date never shifts month). */
export function formatMonthYear(date) {
  return date ? monthYearFormat.format(new Date(date)) : '';
}

/** Formats a date as "Nov 8, 2026". */
export function formatDate(date) {
  return date ? fullDateFormat.format(new Date(date)) : '';
}

const relativeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const RELATIVE_UNITS = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** Formats a past date relative to now, e.g. "3 days ago" or "yesterday". */
export function formatRelative(date) {
  const seconds = (new Date(date).getTime() - Date.now()) / 1000;
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) {
      return relativeFormat.format(Math.round(seconds / size), unit);
    }
  }
  return 'just now';
}

/** Formats a number compactly, e.g. 1200 -> "1.2K". */
export function formatCount(value) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value ?? 0,
  );
}

/**
 * Formats a start and end date as a range, e.g. "2022 – Present" or
 * "Jan 2024 – Jun 2024".
 *
 * @param {string | Date} start
 * @param {string | Date | null} end
 * @param {{ current?: boolean, precision?: 'year' | 'month' }} [options]
 */
export function formatDateRange(start, end, { current = false, precision = 'month' } = {}) {
  const format = precision === 'year' ? yearFormat : monthYearFormat;
  const from = start ? format.format(new Date(start)) : '';
  const to = current || !end ? 'Present' : format.format(new Date(end));
  return from === to ? from : `${from} – ${to}`;
}
