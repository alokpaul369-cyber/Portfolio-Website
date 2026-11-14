/**
 * Local sandbox API: the real application running on a temporary in-memory
 * MongoDB, seeded with the content from scripts/data/content.js and one test
 * admin. Use it to try the admin panel or check a change without touching the
 * real database.
 *
 * Usage (from the project root, with the normal API stopped):
 *   npm run sandbox -w server
 * then run the client as usual (npm run dev:client) and sign in at /admin/login
 * with the test account below.
 *
 * Nothing is read from server/.env, and the database, Cloudinary and email are
 * never contacted (uploads answer 503, email is only logged); the only outside
 * request is the public, unauthenticated GitHub API for the activity section.
 * All data is discarded when the process stops.
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/** Test-only account. It exists only inside the sandbox's temporary database. */
export const SANDBOX_ADMIN = Object.freeze({
  email: 'sandbox-admin@example.test',
  password: 'sandbox-only-password-2026',
});

// Fix the environment before the app is imported, so it cannot reach real services.
process.env.NODE_ENV = 'development';
for (const key of [
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_USER',
  'SMTP_PASS',
  'GITHUB_TOKEN',
]) {
  delete process.env[key];
}
// Never reuse a real signing secret inherited from the shell.
process.env.JWT_SECRET = 'sandbox-only-secret-with-at-least-32-characters';

const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri());

const { default: env } = await import('../src/config/env.js');
const { createApp } = await import('../src/app.js');
const { Admin, Experience, Project, Skill } = await import('../src/models/index.js');
const { education, projects, skills } = await import('./data/content.js');

await Admin.create(SANDBOX_ADMIN);
// create() runs the model hooks (slugs, validation), one document at a time.
for (const skill of skills) await Skill.create(skill);
for (const project of projects) await Project.create(project);
for (const entry of education) await Experience.create(entry);

// Local connections only: the test account's password is in this file.
const server = createApp().listen(env.port, '127.0.0.1', () => {
  console.log(`Sandbox API listening on http://localhost:${env.port} (in-memory database)`);
  console.log(`Sign in at /admin/login with the test account defined in ${import.meta.filename}`);
});

const shutdown = () => {
  server.close(async () => {
    await mongoose.disconnect();
    await mongo.stop();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
