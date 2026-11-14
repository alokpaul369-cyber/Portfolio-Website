import { Router } from 'express';
import * as research from '../controllers/researchController.js';
import { optionalAuth } from '../middleware/protect.js';
import validate from '../middleware/validate.js';
import { slugParams } from '../validators/common.js';
import {
  createResearchSchema,
  listResearchQuery,
  updateResearchSchema,
} from '../validators/researchSchemas.js';
import registerAdminRoutes from './resourceRoutes.js';

/** Mounted at /api/research. optionalAuth lets the admin see hidden drafts. */
const router = Router();

router.get('/', optionalAuth, validate({ query: listResearchQuery }), research.listResearch);
router.get('/:slug', optionalAuth, validate({ params: slugParams }), research.getResearch);

registerAdminRoutes(
  router,
  {
    getById: research.getResearchById,
    create: research.createResearch,
    update: research.updateResearch,
    remove: research.deleteResearch,
  },
  { create: createResearchSchema, update: updateResearchSchema },
);

export default router;
