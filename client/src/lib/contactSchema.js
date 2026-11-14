import { z } from 'zod';

/**
 * Client-side validation for the contact form.
 * Limits mirror the server's schema (server/src/validators/contactSchemas.js)
 * so visitors see the same rules before submitting.
 */

export const MESSAGE_MAX = 5000;

const text = (label, min, max) =>
  z
    .string()
    .trim()
    .min(1, `Please enter your ${label.toLowerCase()}`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} cannot exceed ${max} characters`);

export const contactSchema = z.object({
  name: text('Name', 2, 80),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address')
    .max(254, 'Email cannot exceed 254 characters')
    .pipe(z.email('Please enter a valid email address')),
  subject: text('Subject', 3, 150),
  message: text('Message', 10, MESSAGE_MAX),
  // Honeypot: hidden from people, left empty by them. Sent as-is to the server.
  website: z.string().optional(),
});

export const contactDefaults = { name: '', email: '', subject: '', message: '', website: '' };
