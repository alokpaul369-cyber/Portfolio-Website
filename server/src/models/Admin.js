import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import schemaOptions from './helpers/schemaOptions.js';
import { EMAIL_PATTERN } from './helpers/validators.js';

/** bcrypt cost factor, set in config/env.js. */
const SALT_ROUNDS = env.auth.bcryptRounds;

/** Plain-text password rules, checked before hashing. */
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores input beyond 72 bytes.

/**
 * The single site administrator.
 * Assign a plain-text password to `password`; it is validated and hashed on save
 * and is never returned by queries unless explicitly selected.
 */
const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email cannot exceed 254 characters'],
      match: [EMAIL_PATTERN, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    // Sessions issued before this moment are rejected by the protect middleware.
    passwordChangedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    // The sign-in before the latest one, shown on the Account page.
    previousLoginAt: { type: Date, default: null },
    // Carried in every session token; raising it ends all sessions issued before.
    sessionVersion: { type: Number, default: 0 },
  },
  {
    ...schemaOptions,
    toJSON: {
      ...schemaOptions.toJSON,
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.password;
        delete ret.sessionVersion;
        return ret;
      },
    },
  },
);

/** Validates the plain-text password only when it has been set or changed. */
adminSchema.pre('validate', function checkPasswordStrength() {
  if (!this.isModified('password') || !this.password) return;

  const length = Buffer.byteLength(this.password, 'utf8');
  if (length < MIN_PASSWORD_LENGTH) {
    this.invalidate('password', `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  } else if (length > MAX_PASSWORD_LENGTH) {
    this.invalidate('password', `Password cannot exceed ${MAX_PASSWORD_LENGTH} bytes`);
  }
});

/**
 * Hashes the password whenever it is set or changed, and records the change
 * time so that sessions created with the old password stop working.
 */
adminSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  this.passwordChangedAt = new Date();
  // A new password ends every existing session, however it was set (API or seed script).
  if (!this.isNew) this.sessionVersion = (this.sessionVersion ?? 0) + 1;
});

/**
 * Compares a login attempt with the stored hash.
 * The document must be loaded with `.select('+password')`.
 * @param {string} candidate
 * @returns {Promise<boolean>}
 */
adminSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) {
    throw new Error('Password hash not loaded. Query the admin with .select("+password").');
  }
  return bcrypt.compare(String(candidate ?? ''), this.password);
};

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;
