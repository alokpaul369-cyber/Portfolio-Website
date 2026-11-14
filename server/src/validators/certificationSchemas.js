import { z } from 'zod';
import {
  clearableDateInput,
  crudSchemas,
  dateInput,
  imageInput,
  optionalText,
  optionalUrl,
  requiredText,
} from './common.js';

/**
 * Request schemas for /api/certifications. Field-level rules only: the rule
 * that the expiry date cannot precede the issue date lives in the model, so
 * it also applies when a partial update changes just one of the two dates.
 */
export const { create: createCertificationSchema, update: updateCertificationSchema } = crudSchemas(
  {
    title: requiredText('Title', 150),
    issuer: requiredText('Issuer', 100),
    issueDate: dateInput('Issue date'),
    // null or an empty string clears the expiry date.
    expiryDate: clearableDateInput('Expiry date'),
    credentialId: optionalText('Credential ID', 100),
    credentialUrl: optionalUrl('Credential link'),
    // null removes the image.
    image: imageInput.nullable().optional(),
    order: z
      .number({ error: 'Order must be a number' })
      .int('Order must be a whole number')
      .min(0, 'Order cannot be negative')
      .max(10000, 'Order cannot exceed 10000')
      .optional(),
  },
);
