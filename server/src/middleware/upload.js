import multer from 'multer';
import ApiError from '../utils/ApiError.js';

/** Accepted image types. SVG is excluded because it can contain scripts. */
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

// 4 MB keeps uploads under the 4.5 MB request limit of serverless hosts such as Vercel.
export const MAX_IMAGE_SIZE_MB = 4;

/**
 * Multer instance for image uploads.
 * Files are kept in memory and streamed straight to Cloudinary, so nothing is
 * written to the server's disk.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(null, true);
    } else {
      callback(ApiError.badRequest('Only JPEG, PNG, WebP and AVIF images are allowed'));
    }
  },
});

/** Accepts one image in the multipart field named "image". */
export const uploadSingleImage = upload.single('image');

export const MAX_DOCUMENT_SIZE_MB = 4;

/** Multipart field that carries an uploaded document. */
export const DOCUMENT_FIELD = 'file';

/** Multer instance for documents: PDF only, kept in memory like images. */
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (file.mimetype === 'application/pdf') {
      callback(null, true);
    } else {
      callback(ApiError.badRequest('Only PDF files are allowed'));
    }
  },
});

/** Accepts one PDF in the multipart field named "file". */
export const uploadSingleDocument = documentUpload.single(DOCUMENT_FIELD);

/**
 * True when the buffer starts with the PDF signature. The declared type comes
 * from the browser and can be wrong, so the content itself is checked too.
 */
export function looksLikePdf(buffer) {
  return Buffer.isBuffer(buffer) && buffer.subarray(0, 5).toString('latin1') === '%PDF-';
}
