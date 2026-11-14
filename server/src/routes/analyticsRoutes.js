import { Router } from 'express';
import { z } from 'zod';
import { getAnalyticsSummary, recordView } from '../controllers/analyticsController.js';
import protect, { optionalAuth } from '../middleware/protect.js';
import { analyticsLimiter } from '../middleware/rateLimiters.js';
import validate from '../middleware/validate.js';

/** GET /api/analytics/summary?days=7|30|90 */
const summaryQuery = z.object({
  days: z
    .enum(['7', '30', '90'], { error: 'Days must be 7, 30 or 90' })
    .default('30')
    .transform(Number),
});

/**
 * Mounted at /api/analytics.
 * - POST /view is public; optionalAuth lets the signed-in owner be left out.
 * - GET /summary is for the admin.
 */
const router = Router();

router.post('/view', analyticsLimiter, optionalAuth, recordView);
router.get('/summary', protect, validate({ query: summaryQuery }), getAnalyticsSummary);

export default router;
