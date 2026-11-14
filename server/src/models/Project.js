import mongoose, { Schema } from 'mongoose';
import schemaOptions from './helpers/schemaOptions.js';
import imageSchema from './helpers/imageSchema.js';
import uniqueSlug from './helpers/uniqueSlug.js';
import { optionalUrl, stringList } from './helpers/validators.js';

/**
 * Allowed project categories, shared with the admin form.
 * Keep in sync with client/src/data/projects.js, which holds the display labels.
 */
export const PROJECT_CATEGORIES = [
  'full-stack',
  'backend',
  'frontend',
  'ai',
  'desktop',
  'dsa',
  'other',
];

/**
 * Portfolio project.
 * Public listing order: featured first, then ascending `order`, then newest.
 */
const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    techStack: stringList({ label: 'Tech stack', maxItems: 20, maxItemLength: 40 }),
    images: {
      type: [imageSchema],
      default: [],
      validate: {
        validator: (images) => images.length <= 10,
        message: 'A project cannot have more than 10 images',
      },
    },
    liveUrl: optionalUrl('Live URL'),
    githubUrl: optionalUrl('GitHub URL'),
    featured: { type: Boolean, default: false },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: PROJECT_CATEGORIES, message: 'Category "{VALUE}" is not supported' },
      default: 'full-stack',
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative'],
      validate: { validator: Number.isInteger, message: 'Order must be a whole number' },
    },
  },
  schemaOptions,
);

projectSchema.plugin(uniqueSlug, { sourceField: 'title' });

projectSchema.index({ featured: -1, order: 1, createdAt: -1 });
projectSchema.index({ category: 1 });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default Project;
