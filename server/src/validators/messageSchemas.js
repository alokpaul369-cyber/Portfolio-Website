import { z } from 'zod';
import { paginationQuery, searchQuery } from './common.js';

/** Inbox filter. */
export const MESSAGE_STATUSES = ['all', 'unread', 'read'];

/** GET /api/messages?page=&limit=&status=&search= */
export const listMessagesQuery = z.object({
  ...paginationQuery(20),
  status: z
    .enum(MESSAGE_STATUSES, { error: `Status must be one of: ${MESSAGE_STATUSES.join(', ')}` })
    .default('all'),
  search: searchQuery,
});

/** PATCH /api/messages/:id  Body: { read } */
export const updateMessageSchema = z.strictObject({
  read: z.boolean({ error: 'read must be true or false' }),
});

/** Most messages one bulk request may change. */
export const MAX_BULK_IDS = 100;

/** POST /api/messages/bulk  Body: { ids, action } */
export const bulkMessagesSchema = z.strictObject({
  ids: z
    .array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id'), { error: 'ids must be a list' })
    .min(1, 'Select at least one message')
    .max(MAX_BULK_IDS, `Select at most ${MAX_BULK_IDS} messages at a time`),
  action: z.enum(['read', 'unread', 'delete'], { error: 'Action must be read, unread or delete' }),
});

/** GET /api/messages/export?status=&search= */
export const exportMessagesQuery = listMessagesQuery.pick({ status: true, search: true });
