import { Schema } from 'mongoose';
import { isHttpUrl } from './validators.js';

/**
 * Embedded image stored on Cloudinary.
 * `publicId` is kept so the file can be deleted from Cloudinary when the
 * image is removed; `alt` provides accessible text for the <img> element.
 */
const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      validate: { validator: isHttpUrl, message: 'Image URL must be a valid http or https URL' },
    },
    publicId: { type: String, trim: true, maxlength: 255 },
    alt: { type: String, trim: true, maxlength: [150, 'Alt text cannot exceed 150 characters'] },
  },
  { _id: false },
);

export default imageSchema;
