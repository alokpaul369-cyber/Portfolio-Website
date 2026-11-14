import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import apiRouter from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import requireAppHeader from './middleware/requireAppHeader.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

/**
 * Builds the Express application. Kept separate from index.js so it can be
 * imported by tests without opening a network port.
 */
export function createApp() {
  const app = express();

  // Trust the proxies in front of the API (TRUST_PROXY) so rate limiting sees real client IPs.
  app.set('trust proxy', env.trustProxy);
  app.disable('x-powered-by');

  // Security headers.
  app.use(helmet());

  // Allow only the configured client origins; cookies are permitted for admin auth.
  app.use(
    cors({
      origin(origin, callback) {
        // Requests without an Origin header (curl, server-to-server) are allowed.
        if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
    }),
  );

  // Basic abuse protection for every API route. Stricter limits are applied
  // on individual routes such as login.
  app.use('/api', apiLimiter);

  // CSRF protection for cookie-authenticated requests.
  app.use('/api', requireAppHeader);

  // Request logging in development; registered before body parsing so
  // requests rejected by the parsers are still logged.
  if (!env.isProduction && !env.isTest) {
    app.use(morgan('dev'));
  }

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  app.use('/api', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
