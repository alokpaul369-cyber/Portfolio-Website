import { z } from 'zod';
import { getSummary, recordView as record } from '../services/analyticsService.js';

/** Body of a page view. Anything else is ignored rather than rejected. */
const viewSchema = z.object({
  path: z.string().max(500),
  referrer: z.string().max(1000).optional(),
  newVisit: z.boolean().optional(),
});

/**
 * POST /api/analytics/view  Public.  Body: { path, referrer?, newVisit? }
 * Always answers 204 with no body, whether the view was counted or ignored,
 * so the response reveals nothing.
 */
export async function recordView(req, res) {
  const parsed = viewSchema.safeParse(req.body ?? {});
  if (parsed.success) {
    try {
      await record(parsed.data, {
        userAgent: req.get('user-agent') ?? '',
        isOwner: Boolean(req.admin),
      });
    } catch (error) {
      // A lost view is acceptable; an error response would reveal more than a 204.
      console.error('Page view not recorded:', error.message);
    }
  }
  res.status(204).end();
}

/** GET /api/analytics/summary?days=7|30|90 (admin) */
export async function getAnalyticsSummary(req, res) {
  res.json({ success: true, data: await getSummary(req.validated.query.days) });
}
