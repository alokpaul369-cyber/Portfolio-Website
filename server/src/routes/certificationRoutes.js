import { Router } from 'express';
import * as certifications from '../controllers/certificationController.js';
import {
  createCertificationSchema,
  updateCertificationSchema,
} from '../validators/certificationSchemas.js';
import registerAdminRoutes from './resourceRoutes.js';

/** Mounted at /api/certifications. */
const router = Router();

router.get('/', certifications.listCertifications);

registerAdminRoutes(
  router,
  {
    getById: certifications.getCertificationById,
    create: certifications.createCertification,
    update: certifications.updateCertification,
    remove: certifications.deleteCertification,
  },
  { create: createCertificationSchema, update: updateCertificationSchema },
);

export default router;
