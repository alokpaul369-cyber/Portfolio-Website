import { z } from 'zod';
import { EMAIL_PATTERN } from '../models/helpers/validators.js';

/**
 * Request schemas for the account routes under /api/auth.
 * Password strength itself is enforced by the Admin model; these schemas
 * only bound the input.
 */

const currentPassword = z
  .string({ error: 'Current password is required' })
  .min(1, 'Current password is required')
  .max(256, 'Current password is too long');

/** PUT /api/auth/password */
export const changePasswordSchema = z.strictObject({
  currentPassword,
  newPassword: z
    .string({ error: 'New password is required' })
    .min(1, 'New password is required')
    .max(256, 'New password is too long'),
});

/** PUT /api/auth/email */
export const changeEmailSchema = z.strictObject({
  currentPassword,
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .max(254, 'Email cannot exceed 254 characters')
    .regex(EMAIL_PATTERN, 'Please provide a valid email address'),
});
