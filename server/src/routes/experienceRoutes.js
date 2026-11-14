import { Router } from 'express';
import * as experience from '../controllers/experienceController.js';
import validate from '../middleware/validate.js';
import {
  createExperienceSchema,
  listExperienceQuery,
  updateExperienceSchema,
} from '../validators/experienceSchemas.js';
import registerAdminRoutes from './resourceRoutes.js';

/** Mounted at /api/experience. */
const router = Router();

router.get('/', validate({ query: listExperienceQuery }), experience.listExperience);

registerAdminRoutes(
  router,
  {
    getById: experience.getExperienceById,
    create: experience.createExperience,
    update: experience.updateExperience,
    remove: experience.deleteExperience,
  },
  { create: createExperienceSchema, update: updateExperienceSchema },
);

export default router;
