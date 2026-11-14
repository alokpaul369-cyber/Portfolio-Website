import { Router } from 'express';
import { databaseStatus } from '../config/db.js';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import skillRoutes from './skillRoutes.js';
import experienceRoutes from './experienceRoutes.js';
import blogRoutes from './blogRoutes.js';
import researchRoutes from './researchRoutes.js';
import certificationRoutes from './certificationRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import contactRoutes from './contactRoutes.js';
import githubRoutes from './githubRoutes.js';
import messageRoutes from './messageRoutes.js';
import adminRoutes from './adminRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

/**
 * Root API router, mounted at /api.
 */
const router = Router();

/** Health check used by hosting platforms and uptime monitors. */
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    database: databaseStatus(),
    uptime: Math.round(process.uptime()),
  });
});

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/skills', skillRoutes);
router.use('/experience', experienceRoutes);
router.use('/blog', blogRoutes);
router.use('/research', researchRoutes);
router.use('/certifications', certificationRoutes);
router.use('/uploads', uploadRoutes);
router.use('/contact', contactRoutes);
router.use('/github', githubRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);
router.use('/settings', settingsRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
