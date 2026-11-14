import { z } from 'zod';
import { RESEARCH_STATUSES, RESEARCH_TYPES } from '../models/index.js';
import {
  booleanQuery,
  clearableDateInput,
  crudSchemas,
  optionalText,
  optionalUrl,
  requiredText,
  slugInput,
  stringArray,
} from './common.js';

const type = z.enum(RESEARCH_TYPES, { error: 'Type is not supported' });
const status = z.enum(RESEARCH_STATUSES, { error: 'Status is not supported' });

/** Request schemas for /api/research. Limits mirror the Research model. */
export const { create: createResearchSchema, update: updateResearchSchema } = crudSchemas({
  title: requiredText('Title', 150),
  slug: slugInput,
  type,
  status,
  summary: requiredText('Summary', 300),
  abstract: optionalText('Abstract', 5000),
  authors: stringArray('Authors', 20, 80),
  venue: optionalText('Venue', 150),
  // null or an empty string clears the date.
  date: clearableDateInput('Date'),
  tags: stringArray('Tags', 10, 30),
  paperUrl: optionalUrl('Paper link'),
  doiUrl: optionalUrl('DOI link'),
  codeUrl: optionalUrl('Code link'),
  projectUrl: optionalUrl('Project link'),
  featured: z.boolean({ error: 'Featured must be true or false' }).optional(),
  visible: z.boolean({ error: 'Visible must be true or false' }).optional(),
  order: z
    .number({ error: 'Order must be a number' })
    .int('Order must be a whole number')
    .min(0, 'Order cannot be negative')
    .max(10000, 'Order cannot exceed 10000')
    .optional(),
});

/** GET /api/research?type=&status=&tag=&featured=&limit= */
export const listResearchQuery = z.object({
  type: type.optional(),
  status: status.optional(),
  tag: z.string().trim().toLowerCase().max(30).optional(),
  featured: booleanQuery,
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be 1 or greater')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
});
