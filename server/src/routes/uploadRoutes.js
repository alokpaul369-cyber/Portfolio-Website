import { Router } from 'express';
import { deleteUpload, uploadDocumentFile, uploadSingle } from '../controllers/uploadController.js';
import protect from '../middleware/protect.js';
import { uploadSingleDocument, uploadSingleImage } from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { deleteUploadSchema, uploadQuery } from '../validators/uploadSchemas.js';

/**
 * Mounted at /api/uploads. Admin only.
 * protect runs before multer so unauthenticated uploads are never buffered.
 */
const router = Router();

router.post('/', protect, validate({ query: uploadQuery }), uploadSingleImage, uploadSingle);
router.post('/document', protect, uploadSingleDocument, uploadDocumentFile);
router.delete('/', protect, validate({ body: deleteUploadSchema }), deleteUpload);

export default router;
