import { Router } from 'express';
import { submitContact } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/rateLimiters.js';
import validate from '../middleware/validate.js';
import { contactSchema } from '../validators/contactSchemas.js';

/** Mounted at /api/contact. */
const router = Router();

router.post('/', contactLimiter, validate({ body: contactSchema }), submitContact);

export default router;
