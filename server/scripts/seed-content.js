/**
 * Loads the initial skills, projects and education entries from scripts/data/content.js.
 *
 * Usage (from the project root):
 *   npm run seed:content -w server
 *
 * Safe to run more than once: skills are matched by category and name, projects
 * by title and education entries by degree, so existing records are updated rather than
 * duplicated. Records added through the admin dashboard are left untouched.
 */
import mongoose from 'mongoose';
import env from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { Experience, Project, Skill } from '../src/models/index.js';
import { education, projects, skills } from './data/content.js';

/** Inserts or updates one document, running model validation. */
async function upsert(Model, filter, data) {
  const existing = await Model.findOne(filter).collation({ locale: 'en', strength: 2 });
  if (existing) {
    existing.set(data);
    await existing.save();
    return 'updated';
  }
  await Model.create(data);
  return 'created';
}

async function seedContent() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not set in server/.env.');
  }
  await connectDatabase();

  const counts = { created: 0, updated: 0 };

  for (const skill of skills) {
    const result = await upsert(Skill, { category: skill.category, name: skill.name }, skill);
    counts[result] += 1;
  }
  console.log(`Skills: ${counts.created} created, ${counts.updated} updated.`);

  counts.created = 0;
  counts.updated = 0;
  for (const project of projects) {
    const result = await upsert(Project, { title: project.title }, project);
    counts[result] += 1;
  }
  console.log(`Projects: ${counts.created} created, ${counts.updated} updated.`);

  counts.created = 0;
  counts.updated = 0;
  for (const entry of education) {
    const result = await upsert(Experience, { type: entry.type, role: entry.role }, entry);
    counts[result] += 1;
  }
  console.log(`Education: ${counts.created} created, ${counts.updated} updated.`);
}

try {
  await seedContent();
} catch (error) {
  if (error instanceof mongoose.Error.ValidationError) {
    console.error('Content could not be saved:');
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
