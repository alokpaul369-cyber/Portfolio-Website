import { BlogPost, Certification, Research, SiteSettings } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { deleteDocuments, deleteImages, isDocumentPublicId } from '../services/imageService.js';

/** Content fields the admin can override, in the order they are returned. */
const CONTENT_FIELDS = [
  'role',
  'tagline',
  'location',
  'availability',
  'email',
  'linkedin',
  'aboutParagraphs',
  'keyFacts',
];

/**
 * Public view of the settings: only what the website needs.
 * Unset content fields are omitted, so the client applies its defaults; the
 * CV's Cloudinary id is never exposed.
 */
function toPublic(settings) {
  const saved = settings.content?.toObject?.() ?? {};
  const content = {};
  for (const field of CONTENT_FIELDS) {
    const value = saved[field];
    if (value !== undefined && value !== null && value !== '') content[field] = value;
  }

  return {
    profileImage: settings.profileImage?.url ? settings.profileImage : null,
    content,
    cv: settings.cv?.url ? { url: settings.cv.url, filename: settings.cv.filename } : null,
  };
}

/**
 * Which optional sections have something to show. The client hides the
 * Research and Blog links and the Certifications section until they have
 * content; hidden research and draft posts do not count.
 */
async function visibleSections() {
  const [research, certifications, blog] = await Promise.all([
    Research.exists({ visible: true }),
    Certification.exists({}),
    BlogPost.exists({ published: true }),
  ]);
  return {
    research: Boolean(research),
    certifications: Boolean(certifications),
    blog: Boolean(blog),
  };
}

/** GET /api/settings  Public. */
export async function getSettings(_req, res) {
  const settings = await SiteSettings.getSiteSettings();
  // Browsers re-check on every visit (a cheap 304 via ETag when unchanged),
  // so newly saved content shows up immediately.
  res.set('Cache-Control', 'no-cache');
  res.json({ success: true, data: { ...toPublic(settings), sections: await visibleSections() } });
}

/**
 * PUT /api/settings  Admin only. Body: any subset of { profileImage, content, cv }.
 * Keys that are absent stay unchanged; null clears a value. Replacing or
 * removing the photo or CV deletes the previous file from Cloudinary.
 */
export async function updateSettings(req, res) {
  const settings = await SiteSettings.getSiteSettings();
  const body = req.validated.body;
  const previousPhotoId = settings.profileImage?.publicId;
  const previousCvId = settings.cv?.publicId;

  if ('profileImage' in body) {
    settings.profileImage = body.profileImage ?? undefined;
  }

  if (body.content) {
    for (const [field, value] of Object.entries(body.content)) {
      settings.set(`content.${field}`, value ?? undefined);
    }
  }

  if ('cv' in body) {
    // Only a file from POST /api/uploads/document, at its own https address, can be the CV.
    if (body.cv) {
      const { publicId, url } = body.cv;
      if (!isDocumentPublicId(publicId) || !url.startsWith('https://') || !url.includes(publicId)) {
        throw ApiError.badRequest('Validation failed', [
          {
            field: 'cv',
            message: 'Upload the CV again; this file is not one of the site documents',
          },
        ]);
      }
    }
    settings.cv = body.cv ?? undefined;
  }

  await settings.save();

  if (previousPhotoId && previousPhotoId !== settings.profileImage?.publicId) {
    await deleteImages([previousPhotoId]);
  }
  if (previousCvId && previousCvId !== settings.cv?.publicId) {
    await deleteDocuments([previousCvId]);
  }
  res.json({
    success: true,
    message: 'Settings saved',
    data: { ...toPublic(settings), sections: await visibleSections() },
  });
}
