import mongoose, { Schema } from 'mongoose';
import schemaOptions from './helpers/schemaOptions.js';
import uniqueSlug from './helpers/uniqueSlug.js';
import { optionalUrl, stringList } from './helpers/validators.js';

/**
 * Kinds of research output and their progress, shared with the validators.
 * Keep in sync with client/src/data/research.js, which holds the display labels.
 */
export const RESEARCH_TYPES = ['paper', 'thesis', 'project', 'poster', 'preprint'];
export const RESEARCH_STATUSES = ['ongoing', 'submitted', 'published'];

/**
 * A research output: a paper, thesis, poster, preprint or research project.
 * Entries with `visible: false` are drafts that only the admin can see.
 * Public listing order: ongoing work first, then newest date, then `order`.
 */
const researchSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: { values: RESEARCH_TYPES, message: 'Type "{VALUE}" is not supported' },
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: { values: RESEARCH_STATUSES, message: 'Status "{VALUE}" is not supported' },
    },
    // One or two sentences for cards and search results.
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
      maxlength: [300, 'Summary cannot exceed 300 characters'],
    },
    // Plain text; blank lines separate paragraphs.
    abstract: {
      type: String,
      trim: true,
      maxlength: [5000, 'Abstract cannot exceed 5000 characters'],
    },
    // In display order, exactly as they should appear.
    // Not de-duplicated: two co-authors may share a name.
    authors: stringList({ label: 'Authors', maxItems: 20, maxItemLength: 80, unique: false }),
    // Journal, conference or institution.
    venue: { type: String, trim: true, maxlength: [150, 'Venue cannot exceed 150 characters'] },
    // Publication, submission or start date; shown as month and year.
    date: { type: Date, default: null },
    tags: stringList({ label: 'Tags', maxItems: 10, maxItemLength: 30, lowercase: true }),
    paperUrl: optionalUrl('Paper link'),
    doiUrl: optionalUrl('DOI link'),
    codeUrl: optionalUrl('Code link'),
    projectUrl: optionalUrl('Project link'),
    // Featured entries appear on the Home page.
    featured: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative'],
      max: [10000, 'Order cannot exceed 10000'],
      validate: { validator: Number.isInteger, message: 'Order must be a whole number' },
    },
  },
  schemaOptions,
);

researchSchema.plugin(uniqueSlug, { sourceField: 'title' });

researchSchema.index({ visible: 1, date: -1 });

const Research = mongoose.models.Research || mongoose.model('Research', researchSchema);
export default Research;
