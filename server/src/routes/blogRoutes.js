import { Router } from 'express';
import * as blog from '../controllers/blogController.js';
import { optionalAuth } from '../middleware/protect.js';
import validate from '../middleware/validate.js';
import { slugParams } from '../validators/common.js';
import { createPostSchema, listPostsQuery, updatePostSchema } from '../validators/blogSchemas.js';
import registerAdminRoutes from './resourceRoutes.js';

/**
 * Mounted at /api/blog.
 * Read routes use optionalAuth so the signed-in admin can also see drafts.
 */
const router = Router();

router.get('/', optionalAuth, validate({ query: listPostsQuery }), blog.listPosts);
// Registered before /:slug so "tags" and "feed.xml" are not treated as post slugs.
router.get('/tags', blog.listTags);
router.get('/feed.xml', blog.getFeed);
router.get('/:slug', optionalAuth, validate({ params: slugParams }), blog.getPost);
router.get('/:slug/related', optionalAuth, validate({ params: slugParams }), blog.getRelatedPosts);

registerAdminRoutes(
  router,
  {
    getById: blog.getPostById,
    create: blog.createPost,
    update: blog.updatePost,
    remove: blog.deletePost,
  },
  { create: createPostSchema, update: updatePostSchema },
);

export default router;
