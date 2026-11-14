import { Router } from 'express';
import { getGitHubActivity } from '../services/githubService.js';

/** Mounted at /api/github. */
const router = Router();

/**
 * GET /api/github
 * Public profile stats and the latest repositories. Served from a one-hour
 * server cache; browsers and CDNs may also cache the response for 10 minutes.
 */
router.get('/', async (_req, res) => {
  const data = await getGitHubActivity();
  res.set('Cache-Control', 'public, max-age=600');
  res.json({ success: true, data });
});

export default router;
