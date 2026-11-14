import mongoose from 'mongoose';
import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import { DOCUMENT_FIELD, MAX_DOCUMENT_SIZE_MB, MAX_IMAGE_SIZE_MB } from './upload.js';
import env from '../config/env.js';

/**
 * Converts known error types into ApiError so every failure produces the
 * same response shape: { success: false, message, details? }.
 */
function normalizeError(error, req) {
  if (error instanceof ApiError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest('Validation failed', details);
  }

  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for ${error.path}`);
  }

  // MongoDB duplicate key error.
  if (error?.code === 11000) {
    const fields = Object.keys(error.keyValue || {});
    const label = fields.length > 0 ? fields.join(' and ') : 'value';
    return new ApiError(409, `A record with this ${label} already exists`);
  }

  // File upload errors from multer (size, file count, unexpected field).
  if (error instanceof multer.MulterError) {
    // The document route has its own limits and field name.
    if (req?.originalUrl?.split('?')[0].endsWith('/uploads/document')) {
      const documentMessages = {
        LIMIT_FILE_SIZE: `The file must be ${MAX_DOCUMENT_SIZE_MB} MB or smaller`,
        LIMIT_FILE_COUNT: 'Only one file can be uploaded at a time',
        LIMIT_UNEXPECTED_FILE: `Upload the PDF in a field named "${DOCUMENT_FIELD}"`,
      };
      return ApiError.badRequest(
        documentMessages[error.code] || 'The upload could not be processed',
      );
    }
    const messages = {
      LIMIT_FILE_SIZE: `Image must be ${MAX_IMAGE_SIZE_MB} MB or smaller`,
      LIMIT_FILE_COUNT: 'Only one image can be uploaded at a time',
      LIMIT_UNEXPECTED_FILE: 'Upload the image in a field named "image"',
    };
    return ApiError.badRequest(messages[error.code] || 'The upload could not be processed');
  }

  // Malformed JSON body from express.json().
  if (error?.type === 'entity.parse.failed') {
    return ApiError.badRequest('Request body is not valid JSON');
  }

  return new ApiError(500, 'An unexpected error occurred. Please try again later.');
}

/** Final Express error handler. Must keep four arguments to be recognised. */
export default function errorHandler(error, req, res, _next) {
  const apiError = normalizeError(error, req);

  // Unexpected failures get a full stack trace; deliberate 5xx ApiErrors
  // (for example an upstream outage) are already logged where they occur.
  if (apiError.statusCode >= 500 && !(error instanceof ApiError)) {
    console.error(error);
  }

  const body = { success: false, message: apiError.message };
  if (apiError.details) body.details = apiError.details;
  if (!env.isProduction && apiError.statusCode >= 500) body.stack = error.stack;

  res.status(apiError.statusCode).json(body);
}
