import protect from '../middleware/protect.js';
import validate from '../middleware/validate.js';
import { idParams } from '../validators/common.js';

/**
 * Registers the admin-only routes shared by every content resource:
 *   GET    /id/:id   read one document by id (used by the admin edit forms)
 *   POST   /         create
 *   PUT    /:id      partial update
 *   DELETE /:id      delete
 *
 * "/id/:id" has two path segments, so it never collides with public
 * single-segment routes such as GET /:slug.
 *
 * @param {import('express').Router} router
 * @param {{ getById: Function, create: Function, update: Function, remove: Function }} handlers
 * @param {{ create: import('zod').ZodType, update: import('zod').ZodType }} schemas
 */
export default function registerAdminRoutes(router, handlers, schemas) {
  router.get('/id/:id', protect, validate({ params: idParams }), handlers.getById);
  router.post('/', protect, validate({ body: schemas.create }), handlers.create);
  router.put(
    '/:id',
    protect,
    validate({ params: idParams, body: schemas.update }),
    handlers.update,
  );
  router.delete('/:id', protect, validate({ params: idParams }), handlers.remove);
}
