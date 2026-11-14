import { Router } from 'express';
import { getStats } from '../controllers/adminController.js';
import protect from '../middleware/protect.js';

/** Mounted at /api/admin. Admin only. */
const router = Router();

router.use(protect);
router.get('/stats', getStats);

export default router;
