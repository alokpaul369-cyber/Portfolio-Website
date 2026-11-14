import mongoose, { Schema } from 'mongoose';
import schemaOptions from './helpers/schemaOptions.js';
import { stringList } from './helpers/validators.js';

/** Entry types: professional work or education. */
export const EXPERIENCE_TYPES = ['work', 'education'];

/**
 * Timeline entry for the Experience / Education page.
 * For education entries, `role` holds the degree and `company` the institution.
 */
const experienceSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: { values: EXPERIENCE_TYPES, message: 'Type must be either work or education' },
    },
    role: {
      type: String,
      required: [true, 'Role or degree is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
    },
    // Required for work entries; optional for education (institution name).
    company: {
      type: String,
      required: [
        function companyRequired() {
          return this.type === 'work';
        },
        'Company is required for work entries',
      ],
      trim: true,
      default: '',
      maxlength: [100, 'Company cannot exceed 100 characters'],
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, default: null },
    current: { type: Boolean, default: false },
    // One entry per bullet point (responsibilities, achievements, coursework).
    description: stringList({ label: 'Description', maxItems: 10, maxItemLength: 300 }),
  },
  schemaOptions,
);

/**
 * Date rules:
 * - a current entry has no end date
 * - a finished entry needs an end date that is not before the start date
 */
experienceSchema.pre('validate', function checkDates() {
  if (this.current) {
    this.endDate = null;
    return;
  }

  if (!this.endDate) {
    this.invalidate('endDate', 'End date is required unless this entry is current');
  } else if (this.startDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date cannot be before the start date');
  }
});

// Timeline order: current entries first, then most recent start date.
experienceSchema.index({ type: 1, current: -1, startDate: -1 });

const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema);
export default Experience;
