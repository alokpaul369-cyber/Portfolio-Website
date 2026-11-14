import { Research } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import crudFactory from './crudFactory.js';

/**
 * The signed-in admin also receives hidden drafts, so responses must never be
 * stored by a shared cache and replayed to visitors.
 */
const PRIVATE = 'private, no-cache';

/** The list is small; this cap only guards against an unbounded response. */
const MAX_ENTRIES = 200;

/**
 * Display order: ongoing work first, then newest date (undated entries last),
 * then the admin-defined order, then newest created.
 */
function compareEntries(a, b) {
  const ongoing = (entry) => (entry.status === 'ongoing' ? 0 : 1);
  const time = (entry) => (entry.date ? entry.date.getTime() : -Infinity);
  return (
    ongoing(a) - ongoing(b) ||
    time(b) - time(a) ||
    a.order - b.order ||
    b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * GET /api/research
 * Query: type, status, tag, featured, limit
 * Visitors see visible entries only; the signed-in admin (detected by
 * optionalAuth) also sees hidden drafts.
 */
export async function listResearch(req, res) {
  const { type, status, tag, featured, limit } = req.validated.query;

  const filter = req.admin ? {} : { visible: true };
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (tag) filter.tags = tag;
  if (featured !== undefined) filter.featured = featured;

  // Newest first before the cap, so a very long list drops its oldest entries.
  const newest = await Research.find(filter)
    .sort({ date: -1, createdAt: -1, _id: -1 })
    .limit(MAX_ENTRIES);
  const entries = newest.sort(compareEntries);
  res.set('Cache-Control', PRIVATE);
  res.json({ success: true, data: limit ? entries.slice(0, limit) : entries });
}

/** GET /api/research/:slug  Hidden entries are visible only to the admin. */
export async function getResearch(req, res) {
  const filter = { slug: req.validated.params.slug };
  if (!req.admin) filter.visible = true;

  const entry = await Research.findOne(filter);
  res.set('Cache-Control', PRIVATE);
  if (!entry) throw ApiError.notFound('Research entry not found');
  res.json({ success: true, data: entry });
}

export const {
  getById: getResearchById,
  create: createResearch,
  update: updateResearch,
  remove: deleteResearch,
} = crudFactory(Research, { label: 'Research entry' });
