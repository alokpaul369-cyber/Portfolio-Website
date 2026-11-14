import mongoose, { Schema } from 'mongoose';
import schemaOptions from './helpers/schemaOptions.js';
import { EMAIL_PATTERN } from './helpers/validators.js';

/** A message submitted through the public contact form. */
const messageSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email cannot exceed 254 characters'],
      match: [EMAIL_PATTERN, 'Please provide a valid email address'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [3, 'Subject must be at least 3 characters'],
      maxlength: [150, 'Subject cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    read: { type: Boolean, default: false },
  },
  schemaOptions,
);

// Admin inbox: unread first, newest first.
messageSchema.index({ read: 1, createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;
