import env from '../config/env.js';
import { BlogPost, DailyStat, Project, Research } from '../models/index.js';

/**
 * Cookie-free visitor analytics.
 *
 * Each recorded page view adds one to a daily total; nothing about the visitor
 * (address, browser, full referrer, query string) is stored. Only the site's
 * real pages are counted, so the totals cannot be filled with made-up paths.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Public pages counted as they are. */
const STATIC_PAGES = new Set([
  '/',
  '/about',
  '/skills',
  '/projects',
  '/research',
  '/experience',
  '/blog',
  '/contact',
  '/privacy',
]);

/** Detail pages: counted only when the slug exists and is public. */
const DETAIL_PAGES = [
  { prefix: '/projects/', exists: (slug) => Project.exists({ slug }) },
  { prefix: '/blog/', exists: (slug) => BlogPost.exists({ slug, published: true }) },
  { prefix: '/research/', exists: (slug) => Research.exists({ slug, visible: true }) },
];

/** User agents of crawlers, link previewers and automated browsers. */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pagespeed|curl|wget|python-requests/i;

/** "YYYY-MM-DD" of the calendar day containing `date` in the given time zone. */
export function dayKey(date = new Date(), timeZone = env.analytics.timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** The stored date value for a day key: midnight UTC of that calendar day. */
export function dayStart(key) {
  return new Date(`${key}T00:00:00.000Z`);
}

/** Path without query, hash or trailing slash; null if it is not a usable path. */
function normalisePath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.length > 200) return null;
  const path = value.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return /^\/[\w\-/]*$/.test(path) ? path : null;
}

/** The path if it is one of the site's public pages, otherwise null. */
async function countablePath(rawPath) {
  const path = normalisePath(rawPath);
  if (!path) return null;
  if (STATIC_PAGES.has(path)) return path;

  for (const { prefix, exists } of DETAIL_PAGES) {
    const slug = path.startsWith(prefix) ? path.slice(prefix.length) : '';
    if (slug && !slug.includes('/')) return (await exists(slug)) ? path : null;
  }
  return null;
}

/** Hosts of the site itself, whose referrers are not counted as sources. */
function ownHosts() {
  return new Set(
    [env.mail.siteUrl, ...env.clientOrigins]
      .map((origin) => {
        try {
          return new URL(origin).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  );
}

/** Source domain of a referrer ("direct" when there is none); null for the site itself. */
function sourceOf(referrer) {
  if (!referrer) return 'direct';
  try {
    const { protocol, hostname } = new URL(referrer);
    if (protocol !== 'http:' && protocol !== 'https:') return 'direct';
    if (ownHosts().has(hostname)) return null;
    return hostname.replace(/^www\./, '').slice(0, 200);
  } catch {
    return 'direct';
  }
}

/**
 * Most distinct sources recorded per day. Sources come from the request and
 * cannot be verified, so without a cap a script could create unlimited rows.
 */
export const MAX_DAILY_SOURCES = 100;

/** Source key to store: the domain if already known today or under the cap, else "other". */
async function cappedSource(date, source) {
  if (await DailyStat.exists({ date, kind: 'source', key: source })) return source;
  const known = await DailyStat.countDocuments({ date, kind: 'source' });
  return known < MAX_DAILY_SOURCES ? source : 'other';
}

/** Adds one to a daily total. */
function increment(date, kind, key) {
  return DailyStat.updateOne({ date, kind, key }, { $inc: { count: 1 } }, { upsert: true });
}

/**
 * Records one page view, and a visit and its source when it is the first page
 * of a visit. Views by bots and by the signed-in owner are ignored.
 *
 * @param {{ path: unknown, referrer?: unknown, newVisit?: unknown }} view
 * @param {{ userAgent?: string, isOwner?: boolean }} context
 */
export async function recordView(view, { userAgent = '', isOwner = false } = {}) {
  if (isOwner || !userAgent || BOT_PATTERN.test(userAgent)) return;

  const path = await countablePath(view.path);
  if (!path) return;

  const date = dayStart(dayKey());
  const writes = [increment(date, 'page', path)];
  if (view.newVisit === true) {
    writes.push(increment(date, 'visit', 'all'));
    const source = sourceOf(typeof view.referrer === 'string' ? view.referrer : '');
    if (source) writes.push(increment(date, 'source', await cappedSource(date, source)));
  }
  await Promise.all(writes);
}

/** Sums `count` per key for one kind between two dates (inclusive), largest first. */
function totalsByKey(kind, from, to) {
  return DailyStat.aggregate([
    { $match: { kind, date: { $gte: from, $lte: to } } },
    { $group: { _id: '$key', count: { $sum: '$count' } } },
    { $sort: { count: -1, _id: 1 } },
  ]);
}

const sum = (rows) => rows.reduce((total, row) => total + row.count, 0);

/**
 * Totals for the last `days` days (today included), the same totals for the
 * period before, one entry per day (zeros included), and the top pages and
 * sources.
 */
export async function getSummary(days) {
  const end = dayStart(dayKey());
  const start = new Date(end.getTime() - (days - 1) * DAY_MS);
  const previousEnd = new Date(start.getTime() - DAY_MS);
  const previousStart = new Date(previousEnd.getTime() - (days - 1) * DAY_MS);

  const [rows, pages, sources, previousPages, previousVisits] = await Promise.all([
    DailyStat.find({ kind: { $in: ['page', 'visit'] }, date: { $gte: start, $lte: end } }).lean(),
    totalsByKey('page', start, end),
    totalsByKey('source', start, end),
    totalsByKey('page', previousStart, previousEnd),
    totalsByKey('visit', previousStart, previousEnd),
  ]);

  const series = Array.from({ length: days }, (_, index) => {
    const date = new Date(start.getTime() + index * DAY_MS);
    const sameDay = rows.filter((row) => row.date.getTime() === date.getTime());
    return {
      date: date.toISOString().slice(0, 10),
      views: sum(sameDay.filter((row) => row.kind === 'page')),
      visits: sum(sameDay.filter((row) => row.kind === 'visit')),
    };
  });

  return {
    days,
    totals: {
      views: series.reduce((total, day) => total + day.views, 0),
      visits: series.reduce((total, day) => total + day.visits, 0),
    },
    previous: { views: sum(previousPages), visits: sum(previousVisits) },
    series,
    topPages: pages.slice(0, 10).map((row) => ({ path: row._id, views: row.count })),
    topSources: sources.slice(0, 10).map((row) => ({ source: row._id, visits: row.count })),
  };
}

/** Page views over the last seven days, today included, for the dashboard. */
export async function viewsLastWeek() {
  const end = dayStart(dayKey());
  const start = new Date(end.getTime() - 6 * DAY_MS);
  return sum(await totalsByKey('page', start, end));
}
