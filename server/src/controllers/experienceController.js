import { Experience } from '../models/index.js';
import crudFactory from './crudFactory.js';

/**
 * GET /api/experience?type=work|education
 * Timeline order: current entries first, then most recent start date.
 */
export async function listExperience(req, res) {
  const { type } = req.validated.query;
  const filter = type ? { type } : {};

  const entries = await Experience.find(filter).sort({ current: -1, startDate: -1 });
  res.json({ success: true, data: entries });
}

export const {
  getById: getExperienceById,
  create: createExperience,
  update: updateExperience,
  remove: deleteExperience,
} = crudFactory(Experience, { label: 'Experience entry' });
