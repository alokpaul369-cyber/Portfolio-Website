import { Router } from 'express';
import {
  bulkUpdateMessages,
  deleteMessage,
  exportMessages,
  listMessages,
  updateMessage,
} from '../controllers/messageController.js';
import protect from '../middleware/protect.js';
import validate from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import {
  bulkMessagesSchema,
  exportMessagesQuery,
  listMessagesQuery,
  updateMessageSchema,
} from '../validators/messageSchemas.js';

/**
 * Mounted at /api/messages. Admin only.
 * Messages are created through the public POST /api/contact route.
 */
const router = Router();

router.use(protect);

router.get('/', validate({ query: listMessagesQuery }), listMessages);
// Registered before /:id routes, though only PATCH and DELETE use an id.
router.get('/export', validate({ query: exportMessagesQuery }), exportMessages);
router.post('/bulk', validate({ body: bulkMessagesSchema }), bulkUpdateMessages);
router.patch('/:id', validate({ params: idParams, body: updateMessageSchema }), updateMessage);
router.delete('/:id', validate({ params: idParams }), deleteMessage);

export default router;
