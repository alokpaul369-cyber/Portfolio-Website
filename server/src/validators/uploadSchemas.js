import { z } from 'zod';
import { UPLOAD_FOLDERS } from '../services/imageService.js';

/** POST /api/uploads?folder= */
export const uploadQuery = z.object({
  folder: z
    .enum(UPLOAD_FOLDERS, { error: `Folder must be one of: ${UPLOAD_FOLDERS.join(', ')}` })
    .default('general'),
});

/** DELETE /api/uploads  Body: { publicId } */
export const deleteUploadSchema = z.strictObject({
  publicId: z.string().trim().min(1, 'publicId is required').max(255),
});
