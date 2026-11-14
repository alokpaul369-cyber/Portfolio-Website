import { Certification } from '../models/index.js';
import crudFactory from './crudFactory.js';

/**
 * GET /api/certifications
 * Newest issue date first, then the admin-defined order.
 */
export async function listCertifications(_req, res) {
  const entries = await Certification.find().sort({ issueDate: -1, order: 1, _id: -1 });
  res.json({ success: true, data: entries });
}

export const {
  getById: getCertificationById,
  create: createCertification,
  update: updateCertification,
  remove: deleteCertification,
} = crudFactory(Certification, { label: 'Certification', getImages: (doc) => [doc.image] });
