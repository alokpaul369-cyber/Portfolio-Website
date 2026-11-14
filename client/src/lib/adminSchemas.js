import { z } from 'zod';
import { CONTENT_LIMITS } from '@/lib/siteContent';

/**
 * Client-side validation for the admin forms. Limits mirror the server's
 * schemas (server/src/validators), which remain the final authority.
 */

const required = (label, max) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} cannot exceed ${max} characters`);

const optional = (label, max) =>
  z.string().trim().max(max, `${label} cannot exceed ${max} characters`);

const optionalUrl = (label) =>
  z
    .string()
    .trim()
    .max(500, `${label} cannot exceed 500 characters`)
    .refine(
      (value) => !value || /^https?:\/\/\S+$/i.test(value),
      `${label} must start with http:// or https://`,
    );

const order = z
  .number({ error: 'Order must be a number' })
  .int('Order must be a whole number')
  .min(0, 'Order cannot be negative')
  .max(1000, 'Order cannot exceed 1000');

const image = z.object({
  url: z.string(),
  publicId: z.string().optional(),
  alt: z.string().max(150, 'Alt text cannot exceed 150 characters').optional(),
});

const slug = z
  .string()
  .trim()
  .max(80, 'Slug cannot exceed 80 characters')
  .refine(
    (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    'Use lowercase letters, numbers and single hyphens',
  );

export const projectFormSchema = z.object({
  title: required('Title', 100),
  slug,
  category: z.string().min(1, 'Category is required'),
  description: required('Description', 5000),
  techStack: z.array(z.string()).max(20, 'Up to 20 technologies'),
  liveUrl: optionalUrl('Live URL'),
  githubUrl: optionalUrl('GitHub URL'),
  featured: z.boolean(),
  order,
  images: z.array(image).max(10, 'Up to 10 images'),
});

export const skillFormSchema = z.object({
  name: required('Name', 50),
  category: z.string().min(1, 'Category is required'),
  level: z.string().min(1, 'Level is required'),
  icon: z.string(),
  order,
});

export const experienceFormSchema = z
  .object({
    type: z.enum(['work', 'education']),
    role: required('Role or degree', 100),
    // Required for work entries only (checked below).
    company: optional('Company or institution', 100),
    startDate: z.string().min(1, 'Start date is required'),
    // Optional: react-hook-form submits a disabled input (current entry) as undefined.
    endDate: z.string().optional(),
    current: z.boolean(),
    description: optional('Description', 3100),
  })
  .superRefine((values, ctx) => {
    if (values.type === 'work' && !values.company?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['company'],
        message: 'Company is required for work entries',
      });
    }
    if (values.current) return;
    if (!values.endDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date is required unless this is current',
      });
    } else if (values.startDate && values.endDate < values.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date cannot be before the start date',
      });
    }
  });

export const postFormSchema = z.object({
  title: required('Title', 150),
  slug,
  excerpt: optional('Excerpt', 300),
  tags: z.array(z.string()).max(10, 'Up to 10 tags'),
  coverImage: z.array(image).max(1),
  content: required('Content', 100000),
  published: z.boolean(),
});

/** Site content form (Admin, Site content). Empty text fields mean "use the default". */
export const contentFormSchema = z.object({
  role: optional('Role', CONTENT_LIMITS.role),
  tagline: optional('Tagline', CONTENT_LIMITS.tagline),
  location: optional('Location', CONTENT_LIMITS.location),
  availability: optional('Availability', CONTENT_LIMITS.availability),
  email: z
    .string()
    .trim()
    .max(254, 'Email cannot exceed 254 characters')
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      'Please enter a valid email address',
    ),
  linkedin: z
    .string()
    .trim()
    .max(200, 'LinkedIn URL cannot exceed 200 characters')
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return (
          url.protocol === 'https:' &&
          (url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com'))
        );
      } catch {
        return false;
      }
    }, 'Enter an https address on linkedin.com'),
  aboutParagraphs: z
    .array(z.object({ text: required('Paragraph', CONTENT_LIMITS.paragraph) }))
    .min(1, 'Add at least one paragraph')
    .max(CONTENT_LIMITS.paragraphs, `Use at most ${CONTENT_LIMITS.paragraphs} paragraphs`),
  keyFacts: z
    .array(
      z.object({
        value: required('Value', CONTENT_LIMITS.factValue),
        label: required('Label', CONTENT_LIMITS.factLabel),
      }),
    )
    .max(CONTENT_LIMITS.facts, `Use at most ${CONTENT_LIMITS.facts} key facts`),
});

/** Minimum password length; mirrors the Admin model on the server. */
export const MIN_PASSWORD_LENGTH = 12;

/** Change password form (Admin, Account). */
export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
      .max(72, 'Password cannot exceed 72 characters'),
    confirmPassword: z.string().min(1, 'Enter the new password again'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The two new passwords do not match',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from your current one',
  });

/** Change email form (Admin, Account). */
export const emailFormSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(254, 'Email cannot exceed 254 characters')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),
});

/** Display order for research and certifications; mirrors their server limit. */
const largeOrder = z
  .number({ error: 'Order must be a number' })
  .int('Order must be a whole number')
  .min(0, 'Order cannot be negative')
  .max(10000, 'Order cannot exceed 10000');

/** Research entry form (Admin, Research). Authors are entered one per line. */
export const researchFormSchema = z.object({
  title: required('Title', 150),
  slug,
  type: z.string().min(1, 'Type is required'),
  status: z.string().min(1, 'Status is required'),
  summary: required('Summary', 300),
  abstract: optional('Abstract', 5000),
  authors: z
    .string()
    .refine(
      (value) => value.split('\n').filter((line) => line.trim()).length <= 20,
      'List at most 20 authors',
    )
    .refine(
      (value) => value.split('\n').every((line) => line.trim().length <= 80),
      'Each author name can be at most 80 characters',
    ),
  venue: optional('Venue', 150),
  date: z.string(),
  tags: z
    .array(z.string().max(30, 'Each tag can be at most 30 characters'))
    .max(10, 'Up to 10 tags'),
  paperUrl: optionalUrl('Paper link'),
  doiUrl: optionalUrl('DOI link'),
  codeUrl: optionalUrl('Code link'),
  projectUrl: optionalUrl('Project link'),
  featured: z.boolean(),
  visible: z.boolean(),
  order: largeOrder,
});

/** Certification form (Admin, Certifications). */
export const certificationFormSchema = z
  .object({
    title: required('Title', 150),
    issuer: required('Issuer', 100),
    issueDate: z.string().min(1, 'Issue date is required'),
    expiryDate: z.string(),
    credentialId: optional('Credential ID', 100),
    credentialUrl: optionalUrl('Credential link'),
    image: z.array(image).max(1, 'Only one image'),
    order: largeOrder,
  })
  .refine((values) => !values.expiryDate || values.expiryDate >= values.issueDate, {
    path: ['expiryDate'],
    message: 'Expiry date cannot be before the issue date',
  });
