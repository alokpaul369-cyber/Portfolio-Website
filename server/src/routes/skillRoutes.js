import { Router } from 'express';
import * as skills from '../controllers/skillController.js';
import validate from '../middleware/validate.js';
import {
  createSkillSchema,
  listSkillsQuery,
  updateSkillSchema,
} from '../validators/skillSchemas.js';
import registerAdminRoutes from './resourceRoutes.js';

/** Mounted at /api/skills. */
const router = Router();

router.get('/', validate({ query: listSkillsQuery }), skills.listSkills);

registerAdminRoutes(
  router,
  {
    getById: skills.getSkillById,
    create: skills.createSkill,
    update: skills.updateSkill,
    remove: skills.deleteSkill,
  },
  { create: createSkillSchema, update: updateSkillSchema },
);

export default router;
