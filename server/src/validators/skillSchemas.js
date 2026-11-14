import { z } from 'zod';
import { SKILL_CATEGORIES, SKILL_LEVELS } from '../models/index.js';
import { crudSchemas, requiredText } from './common.js';

const category = z.enum(SKILL_CATEGORIES, { error: 'Category is not supported' });

export const { create: createSkillSchema, update: updateSkillSchema } = crudSchemas({
  name: requiredText('Skill name', 50),
  category,
  level: z.enum(SKILL_LEVELS, { error: 'Level is not supported' }).optional(),
  // react-icons component name, e.g. "SiReact". Empty string removes the icon.
  icon: z
    .string()
    .trim()
    .max(60, 'Icon name cannot exceed 60 characters')
    .regex(/^[A-Za-z0-9]*$/, 'Icon name may contain only letters and numbers')
    .optional(),
  order: z
    .number({ error: 'Order must be a number' })
    .int('Order must be a whole number')
    .min(0, 'Order cannot be negative')
    .max(1000)
    .optional(),
});

/** GET /api/skills?category= */
export const listSkillsQuery = z.object({
  category: category.optional(),
});
