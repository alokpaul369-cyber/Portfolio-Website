import { z } from 'zod';
import { requiredText } from './common.js';

/**
 * Name of the hidden honeypot field. The client renders it off-screen with
 * autocomplete disabled; people leave it empty, many bots fill it in.
 * A plausible name makes bots more likely to complete it.
 */
export const HONEYPOT_FIELD = 'website';

/** POST /api/contact */
export const contactSchema = z.strictObject({
  name: requiredText('Name', 80, 2),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .max(254, 'Email cannot exceed 254 characters')
    .pipe(z.email('Please provide a valid email address')),
  subject: requiredText('Subject', 150, 3),
  message: requiredText('Message', 5000, 10),
  [HONEYPOT_FIELD]: z.string().max(500).optional(),
});
