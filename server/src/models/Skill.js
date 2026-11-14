import mongoose, { Schema } from 'mongoose';
import schemaOptions from './helpers/schemaOptions.js';

/** Allowed skill categories, shared with the admin form. */
export const SKILL_CATEGORIES = ['language', 'frontend', 'backend', 'database', 'tools', 'other'];

/**
 * Proficiency levels, ordered from lowest to highest.
 * Descriptive levels are used instead of percentages to keep claims realistic.
 */
export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

/** A single technical skill shown on the Skills page. */
const skillSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: SKILL_CATEGORIES, message: 'Category "{VALUE}" is not supported' },
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: { values: SKILL_LEVELS, message: 'Level "{VALUE}" is not supported' },
      default: 'intermediate',
    },
    // Icon identifier resolved on the client, e.g. "SiReact" from react-icons/si.
    icon: {
      type: String,
      trim: true,
      maxlength: [60, 'Icon name cannot exceed 60 characters'],
      match: [/^[A-Za-z0-9]*$/, 'Icon name may contain only letters and numbers'],
    },
    // Display position within the category (ascending).
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative'],
      validate: { validator: Number.isInteger, message: 'Order must be a whole number' },
    },
  },
  schemaOptions,
);

// A skill name may appear only once per category (case-insensitive).
skillSchema.index(
  { category: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);

const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);
export default Skill;
