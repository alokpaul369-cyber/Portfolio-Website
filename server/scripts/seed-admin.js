/**
 * Creates the single admin account from environment variables.
 *
 * Usage (from the project root):
 *   npm run seed:admin -w server              create the admin if none exists
 *   npm run seed:admin -w server -- --reset   replace the existing admin's email and password
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from server/.env. The password is hashed
 * by the Admin model before it is stored. Remove ADMIN_PASSWORD from .env once
 * the admin has been created.
 */
import mongoose from 'mongoose';
import env from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { Admin } from '../src/models/index.js';

const reset = process.argv.includes('--reset');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not set in server/.env.');
  }
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env.');
  }

  await connectDatabase();

  const existing = await Admin.findOne();

  if (existing && !reset) {
    console.log(`An admin account already exists (${existing.email}). No changes made.`);
    console.log('Run with --reset to replace its email and password with the values in .env.');
    return;
  }

  if (existing) {
    existing.email = email;
    existing.password = password; // Hashed in the model's save hook.
    await existing.save();
    console.log(
      `Admin account updated: ${existing.email}. Existing sessions have been signed out.`,
    );
  } else {
    const admin = await Admin.create({ email, password });
    console.log(`Admin account created: ${admin.email}.`);
  }

  console.log('You can now remove ADMIN_PASSWORD from server/.env.');
}

try {
  await seedAdmin();
} catch (error) {
  if (error instanceof mongoose.Error.ValidationError) {
    console.error('Admin could not be saved:');
    for (const issue of Object.values(error.errors)) {
      console.error(`  - ${issue.message}`);
    }
  } else {
    console.error(`Seeding failed: ${error.message}`);
  }
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
