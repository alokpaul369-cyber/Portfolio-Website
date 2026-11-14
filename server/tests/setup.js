/**
 * Test environment for every test file.
 *
 * Runs before the application is imported: it fixes the environment so the
 * app never sees real credentials, starts an in-memory MongoDB and connects
 * mongoose to it. Tests therefore never reach Atlas, Cloudinary or SMTP.
 */
import { afterAll, afterEach, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';
// Remove anything inherited from the shell that could point at real services.
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

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  // Safety net: refuse to run against anything but the local in-memory server.
  if (!/^mongodb:\/\/(127\.0\.0\.1|localhost)[:/]/.test(uri)) {
    throw new Error('Tests must use the in-memory database only.');
  }
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
