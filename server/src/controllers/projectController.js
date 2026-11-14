import { Project } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { containsRegex, exactRegex, paginate } from '../utils/query.js';
import crudFactory from './crudFactory.js';

const SORTS = {
  // Featured projects first, then the admin-defined order, then newest.
  order: { featured: -1, order: 1, createdAt: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

/**
 * GET /api/projects
 * Query: page, limit, category, featured, tech, search, sort
 */
export async function listProjects(req, res) {
  const { page, limit, category, featured, tech, search, sort } = req.validated.query;

  const filter = {};
  if (category) filter.category = category;
  if (featured !== undefined) filter.featured = featured;
  if (tech) filter.techStack = exactRegex(tech);
  if (search) {
    const pattern = containsRegex(search);
    filter.$or = [{ title: pattern }, { description: pattern }, { techStack: pattern }];
  }

  const result = await paginate(Project, { filter, sort: SORTS[sort], page, limit });
  res.json({ success: true, ...result });
}

/** GET /api/projects/:slug */
export async function getProject(req, res) {
  const project = await Project.findOne({ slug: req.validated.params.slug });
  if (!project) throw ApiError.notFound('Project not found');
  res.json({ success: true, data: project });
}

export const {
  getById: getProjectById,
  create: createProject,
  update: updateProject,
  remove: deleteProject,
} = crudFactory(Project, { label: 'Project', getImages: (doc) => doc.images });
