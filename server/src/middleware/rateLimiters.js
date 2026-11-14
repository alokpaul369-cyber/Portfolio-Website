import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

/** Shared settings for all limiters. */
const common = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  // Automated tests send many requests from one address; limits are off there only.
  skip: () => env.isTest,
};

/**
 * General limit applied to every /api route. Generous because many visitors can
 * share one address (mobile networks, campuses) and one page makes several requests.
 */
export const apiLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 2000,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/**
 * Contact form limit: 5 submissions per IP per hour.
 * Counts every attempt, including invalid ones, to slow down automated abuse.
 */
export const contactLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: 'You have sent several messages recently. Please try again in an hour.',
  },
});

/**
 * Login limit: 5 failed attempts per IP every 15 minutes.
 * Successful logins are not counted, so the admin is not locked out by normal use.
 */
export const loginLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes and try again.',
  },
});

/**
 * Page-view limit: 60 per address per minute. Over the limit the view is
 * dropped with the same empty 204 as every other view, so nothing is revealed.
 */
export const analyticsLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  limit: 60,
  handler: (_req, res) => res.status(204).end(),
});
