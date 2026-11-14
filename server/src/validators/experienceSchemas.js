import { z } from 'zod';
import { EXPERIENCE_TYPES } from '../models/index.js';
import {
  clearableDateInput,
  crudSchemas,
  dateInput,
  optionalText,
  requiredText,
  stringArray,
} from './common.js';

const type = z.enum(EXPERIENCE_TYPES, { error: 'Type must be either work or education' });

/**
 * Field-level rules only. Cross-field rules (end after start, no end date
 * while current, company required for work entries) are enforced by the
 * Experience model so they also apply to partial updates.
 */
export const { create: createExperienceSchema, update: updateExperienceSchema } = crudSchemas({
  type,
  role: requiredText('Role or degree', 100),
  company: optionalText('Company or institution', 100),
  startDate: dateInput('Start date'),
  // null or an empty string clears the end date.
  endDate: clearableDateInput('End date'),
  current: z.boolean({ error: 'Current must be true or false' }).optional(),
  description: stringArray('Description', 10, 300),
});

/** GET /api/experience?type= */
export const listExperienceQuery = z.object({
  type: type.optional(),
});
