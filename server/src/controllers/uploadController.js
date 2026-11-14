import { BlogPost, Certification, Project, SiteSettings } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { looksLikePdf } from '../middleware/upload.js';
import {
  deleteDocuments,
  deleteImages,
  isDocumentPublicId,
  isOwnPublicId,
  uploadDocument,
  uploadImage,
} from '../services/imageService.js';

/**
 * POST /api/uploads?folder=projects|blog|profile|certificates|general
 * Multipart form with one file in the "image" field.
 * Returns { url, publicId, width, height }; include url and publicId in the
 * record that uses it (project images, post cover, profile photo, certificate image).
 */
export async function uploadSingle(req, res) {
  if (!req.file) {
    throw ApiError.badRequest('Attach an image in a field named "image"');
  }

  const image = await uploadImage(req.file.buffer, req.validated.query.folder);
  res.status(201).json({ success: true, message: 'Image uploaded', data: image });
}

/**
 * DELETE /api/uploads  Body: { publicId }
 * Removes an uploaded file that was never saved, for example when the admin
 * discards a form. Files still in use are refused; those are deleted
 * automatically when removed from the record that uses them.
 */
export async function deleteUpload(req, res) {
  const { publicId } = req.validated.body;

  if (!isOwnPublicId(publicId)) {
    throw ApiError.badRequest('This image does not belong to the site');
  }

  if (isDocumentPublicId(publicId)) {
    if (await SiteSettings.exists({ 'cv.publicId': publicId })) {
      throw new ApiError(409, 'This file is in use on the site. Remove it there instead.');
    }
    await deleteDocuments([publicId]);
    res.json({ success: true, message: 'File deleted' });
    return;
  }

  const inUse =
    (await Project.exists({ 'images.publicId': publicId })) ||
    (await BlogPost.exists({ 'coverImage.publicId': publicId })) ||
    (await Certification.exists({ 'image.publicId': publicId })) ||
    (await SiteSettings.exists({ 'profileImage.publicId': publicId }));
  if (inUse) {
    throw new ApiError(409, 'This image is in use on the site. Remove it there instead.');
  }

  await deleteImages([publicId]);
  res.json({ success: true, message: 'Image deleted' });
}

/**
 * POST /api/uploads/document
 * Multipart form with one PDF in the "file" field (the CV).
 * Returns { url, publicId, filename }; include it as `cv` when saving the settings.
 */
export async function uploadDocumentFile(req, res) {
  if (!req.file) {
    throw ApiError.badRequest('Attach a PDF in a field named "file"');
  }
  if (!looksLikePdf(req.file.buffer)) {
    throw ApiError.badRequest('Only PDF files are allowed');
  }

  // Keep a short, safe display name; the stored file gets its own generated id.
  const filename =
    String(req.file.originalname || 'document.pdf')
      .replace(/[^\w.\- ]+/g, '')
      .trim()
      .slice(0, 120) || 'document.pdf';

  const document = await uploadDocument(req.file.buffer, filename);
  res.status(201).json({ success: true, message: 'File uploaded', data: document });
}
