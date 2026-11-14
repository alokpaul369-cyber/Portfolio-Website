import mongoose, { Schema } from 'mongoose';
import schemaOptions from './helpers/schemaOptions.js';
import imageSchema from './helpers/imageSchema.js';
import { optionalUrl } from './helpers/validators.js';

/**
 * A certificate, course completion or achievement.
 * Public listing order: newest issue date first, then ascending `order`.
 */
const certificationSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    issuer: {
      type: String,
      required: [true, 'Issuer is required'],
      trim: true,
      maxlength: [100, 'Issuer cannot exceed 100 characters'],
    },
    issueDate: { type: Date, required: [true, 'Issue date is required'] },
    // Empty for certificates that do not expire.
    expiryDate: { type: Date, default: null },
    credentialId: {
      type: String,
      trim: true,
      maxlength: [100, 'Credential ID cannot exceed 100 characters'],
    },
    // Where the certificate can be verified.
    credentialUrl: optionalUrl('Credential link'),
    image: { type: imageSchema, default: undefined },
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

/** An expiry date, when present, cannot be before the issue date. Runs on partial updates too. */
certificationSchema.pre('validate', function checkDates() {
  if (this.expiryDate && this.issueDate && this.expiryDate < this.issueDate) {
    this.invalidate('expiryDate', 'Expiry date cannot be before the issue date');
  }
});

certificationSchema.index({ issueDate: -1, order: 1 });

const Certification =
  mongoose.models.Certification || mongoose.model('Certification', certificationSchema);
export default Certification;
