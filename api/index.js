import { createApp } from '../server/src/app.js';
import { connectDatabase } from '../server/src/config/db.js';

/**
 * Vercel serverless entry point: the whole Express API as one function.
 *
 * vercel.json sends every /api/* request here, and Express still sees the
 * original path (for example /api/health), so all routes work unchanged.
 * The database connection is opened on the first request and reused while
 * the function stays warm; a failed attempt is retried on the next request.
 *
 * Local development and other hosts keep using server/src/index.js.
 */
const app = createApp();
let connecting;

export default async function handler(req, res) {
  connecting ??= connectDatabase().catch((error) => {
    connecting = undefined;
    throw error;
  });
  await connecting;
  return app(req, res);
}
