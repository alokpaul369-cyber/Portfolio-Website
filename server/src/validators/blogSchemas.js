import { z } from 'zod';
import {
  crudSchemas,
  imageInput,
  optionalText,
  paginationQuery,
  requiredText,
  searchQuery,
  slugInput,
  stringArray,
} from './common.js';

export const { create: createPostSchema, update: updatePostSchema } = crudSchemas({
  title: requiredText('Title', 150),
  content: requiredText('Content', 100000),
  slug: slugInput,
  // Empty string regenerates the excerpt from the content.
  excerpt: optionalText('Excerpt', 300),
  // null removes the cover image.
  coverImage: imageInput.nullable().optional(),
  tags: stringArray('Tags', 10, 30),
  published: z.boolean({ error: 'Published must be true or false' }).optional(),
});

/** Post visibility filter; only honoured for the signed-in admin. */
export const POST_STATUSES = ['published', 'draft', 'all'];

/** GET /api/blog?page=&limit=&tag=&search=&status= */
export const listPostsQuery = z.object({
  ...paginationQuery(10),
  tag: z.string().trim().toLowerCase().max(30).optional(),
  search: searchQuery,
  status: z
    .enum(POST_STATUSES, { error: `Status must be one of: ${POST_STATUSES.join(', ')}` })
    .optional(),
});
