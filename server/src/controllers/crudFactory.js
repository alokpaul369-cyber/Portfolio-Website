import ApiError from '../utils/ApiError.js';
import { deleteImages, removedPublicIds } from '../services/imageService.js';

/**
 * Builds the admin create, update and delete handlers for a model.
 *
 * Updates load the document and call save() rather than findByIdAndUpdate, so
 * model hooks (slug generation, date rules, derived fields) always run.
 * When images are removed from a document, or the document is deleted, the
 * files are also deleted from Cloudinary.
 *
 * @param {import('mongoose').Model} Model
 * @param {object} options
 * @param {string} options.label  human-readable name used in messages, e.g. "Project"
 * @param {(doc: object) => Array<{ publicId?: string }>} [options.getImages]
 *        returns the Cloudinary images a document references
 */
export default function crudFactory(Model, { label, getImages = () => [] }) {
  const imagesOf = (doc) =>
    getImages(doc)
      .filter(Boolean)
      .map((image) => ({ publicId: image.publicId }));

  async function findOr404(id) {
    const doc = await Model.findById(id);
    if (!doc) throw ApiError.notFound(`${label} not found`);
    return doc;
  }

  return {
    /** GET /id/:id (admin) Any document by id, including unpublished ones. */
    async getById(req, res) {
      const doc = await findOr404(req.validated.params.id);
      res.json({ success: true, data: doc });
    },

    /** POST / */
    async create(req, res) {
      const doc = await Model.create(req.validated.body);
      res.status(201).json({ success: true, message: `${label} created`, data: doc });
    },

    /** PUT /:id  Partial update: only the fields sent are changed. */
    async update(req, res) {
      const doc = await findOr404(req.validated.params.id);
      const imagesBefore = imagesOf(doc);

      doc.set(req.validated.body);
      await doc.save();

      await deleteImages(removedPublicIds(imagesBefore, imagesOf(doc)));
      res.json({ success: true, message: `${label} updated`, data: doc });
    },

    /** DELETE /:id */
    async remove(req, res) {
      const doc = await findOr404(req.validated.params.id);
      await doc.deleteOne();

      await deleteImages(imagesOf(doc).map((image) => image.publicId));
      res.json({ success: true, message: `${label} deleted` });
    },
  };
}
