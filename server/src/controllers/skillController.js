import { Skill } from '../models/index.js';
import crudFactory from './crudFactory.js';

/**
 * GET /api/skills?category=
 * Returns all skills sorted by category, then display order, then name
 * (case-insensitive). The list is small, so it is not paginated.
 */
export async function listSkills(req, res) {
  const { category } = req.validated.query;
  const filter = category ? { category } : {};

  const skills = await Skill.find(filter)
    .sort({ category: 1, order: 1, name: 1 })
    .collation({ locale: 'en', strength: 2 });

  res.json({ success: true, data: skills });
}

export const {
  getById: getSkillById,
  create: createSkill,
  update: updateSkill,
  remove: deleteSkill,
} = crudFactory(Skill, { label: 'Skill' });
