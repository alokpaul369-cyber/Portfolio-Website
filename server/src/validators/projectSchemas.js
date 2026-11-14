import { z } from 'zod';
import { PROJECT_CATEGORIES } from '../models/index.js';
import {
  crudSchemas,
  imageInput,
  booleanQuery,
  optionalUrl,
  paginationQuery,
  requiredText,
  searchQuery,
  slugInput,
  stringArray,
} from './common.js';

export const { create: createProjectSchema, update: updateProjectSchema } = crudSchemas({
  title: requiredText('Title', 100),
  description: requiredText('Description', 5000),
  slug: slugInput,
  techStack: stringArray('Tech stack', 20, 40),
  images: z.array(imageInput).max(10, 'A project cannot have more than 10 images').optional(),
  liveUrl: optionalUrl('Live URL'),
  githubUrl: optionalUrl('GitHub URL'),
  featured: z.boolean({ error: 'Featured must be true or false' }).optional(),
  category: z.enum(PROJECT_CATEGORIES, { error: 'Category is not supported' }).optional(),
  order: z
    .number({ error: 'Order must be a number' })
    .int('Order must be a whole number')
    .min(0, 'Order cannot be negative')
    .max(10000)
    .optional(),
});

/** Sort options for the public project list. */
export const PROJECT_SORTS = ['order', 'newest', 'oldest'];

/** GET /api/projects?page=&limit=&category=&featured=&tech=&search=&sort= */
export const listProjectsQuery = z.object({
  ...paginationQuery(9),
  category: z.enum(PROJECT_CATEGORIES, { error: 'Category is not supported' }).optional(),
  featured: booleanQuery,
  tech: z.string().trim().max(40).optional(),
  search: searchQuery,
  sort: z
    .enum(PROJECT_SORTS, { error: `Sort must be one of: ${PROJECT_SORTS.join(', ')}` })
    .default('order'),
});
