import { Router } from 'express';
import * as projects from '../controllers/projectController.js';
import validate from '../middleware/validate.js';
import { slugParams } from '../validators/common.js';
import {
  createProjectSchema,
  listProjectsQuery,
  updateProjectSchema,
} from '../validators/projectSchemas.js';
import registerAdminRoutes from './resourceRoutes.js';

/** Mounted at /api/projects. */
const router = Router();

router.get('/', validate({ query: listProjectsQuery }), projects.listProjects);
router.get('/:slug', validate({ params: slugParams }), projects.getProject);

registerAdminRoutes(
  router,
  {
    getById: projects.getProjectById,
    create: projects.createProject,
    update: projects.updateProject,
    remove: projects.deleteProject,
  },
  { create: createProjectSchema, update: updateProjectSchema },
);

export default router;
