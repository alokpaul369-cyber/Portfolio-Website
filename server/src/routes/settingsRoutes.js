import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import protect from '../middleware/protect.js';
import validate from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/settingsSchemas.js';

/** Mounted at /api/settings. */
const router = Router();

router.get('/', getSettings);
router.put('/', protect, validate({ body: updateSettingsSchema }), updateSettings);

export default router;
