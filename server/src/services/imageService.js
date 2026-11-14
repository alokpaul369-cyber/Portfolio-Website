import { randomUUID } from 'node:crypto';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

/** Sub-folders an upload may target, under the configured root folder. */
export const UPLOAD_FOLDERS = ['projects', 'blog', 'profile', 'certificates', 'general'];

function assertConfigured() {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'Image uploads are not configured on the server');
  }
}

/**
 * Uploads an in-memory image buffer to Cloudinary.
 * Images are capped at 2000px wide and served in the best format and quality
 * for each browser.
 *
 * @param {Buffer} buffer
 * @param {string} folder one of UPLOAD_FOLDERS
 * @returns {Promise<{ url: string, publicId: string, width: number, height: number }>}
 */
export function uploadImage(buffer, folder) {
  assertConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinary.rootFolder}/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 2000, crop: 'limit' },
          { fetch_format: 'auto', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(502, 'The image could not be uploaded. Please try again.'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      },
    );
    stream.end(buffer);
  });
}

/** True when a public id belongs to this site's upload folder. */
export function isOwnPublicId(publicId) {
  return typeof publicId === 'string' && publicId.startsWith(`${env.cloudinary.rootFolder}/`);
}

/**
 * Deletes images from Cloudinary. Best effort: failures are logged and never
 * fail the request, because the database change has already succeeded.
 *
 * @param {Array<string | undefined>} publicIds
 */
export async function deleteImages(publicIds) {
  const ids = [...new Set(publicIds.filter(isOwnPublicId))];
  if (ids.length === 0 || !isCloudinaryConfigured) return;

  const results = await Promise.allSettled(
    ids.map((id) => cloudinary.uploader.destroy(id, { resource_type: 'image' })),
  );
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Failed to delete Cloudinary image ${ids[index]}:`, result.reason);
    }
  });
}

/** Folder, under the root folder, that holds uploaded documents such as the CV. */
export const DOCUMENT_FOLDER = 'documents';

/** True when a public id is one of this site's uploaded documents. */
export function isDocumentPublicId(publicId) {
  return (
    typeof publicId === 'string' &&
    publicId.startsWith(`${env.cloudinary.rootFolder}/${DOCUMENT_FOLDER}/`)
  );
}

/**
 * Uploads an in-memory PDF to Cloudinary as a raw file (stored as is, with
 * no image processing).
 *
 * @param {Buffer} buffer
 * @param {string} filename original file name, returned so the download keeps it
 * @returns {Promise<{ url: string, publicId: string, filename: string }>}
 */
export function uploadDocument(buffer, filename) {
  assertConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinary.rootFolder}/${DOCUMENT_FOLDER}`,
        resource_type: 'raw',
        // Raw files keep an extension only when it is part of the public id; the
        // extension is what makes the file open as a PDF.
        public_id: `cv-${randomUUID()}.pdf`,
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(502, 'The file could not be uploaded. Please try again.'));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id, filename });
      },
    );
    stream.end(buffer);
  });
}

/**
 * Deletes uploaded documents from Cloudinary. Best effort, like deleteImages.
 * @param {Array<string | undefined>} publicIds
 */
export async function deleteDocuments(publicIds) {
  const ids = [...new Set(publicIds.filter(isDocumentPublicId))];
  if (ids.length === 0 || !isCloudinaryConfigured) return;

  const results = await Promise.allSettled(
    ids.map((id) => cloudinary.uploader.destroy(id, { resource_type: 'raw' })),
  );
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Failed to delete Cloudinary document ${ids[index]}:`, result.reason);
    }
  });
}

/** Public ids present in `before` but missing from `after`. */
export function removedPublicIds(before = [], after = []) {
  const kept = new Set(after.map((image) => image?.publicId).filter(Boolean));
  return before.map((image) => image?.publicId).filter((id) => id && !kept.has(id));
}
