import { BlogPost } from '../models/index.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { containsRegex, paginate } from '../utils/query.js';
import crudFactory from './crudFactory.js';

/**
 * Visitors only ever see published posts. The signed-in admin (detected by
 * optionalAuth) may request drafts with ?status=draft or ?status=all.
 */
function visibilityFilter(req, status) {
  if (!req.admin) return { published: true };
  if (status === 'draft') return { published: false };
  if (status === 'all') return {};
  return { published: true };
}

/**
 * GET /api/blog
 * Query: page, limit, tag, search, status (admin only)
 * The full Markdown content is omitted from listings; use the excerpt.
 */
export async function listPosts(req, res) {
  const { page, limit, tag, search, status } = req.validated.query;

  const filter = visibilityFilter(req, status);
  if (tag) filter.tags = tag;
  if (search) {
    const pattern = containsRegex(search);
    filter.$or = [{ title: pattern }, { excerpt: pattern }, { tags: pattern }];
  }

  const result = await paginate(BlogPost, {
    filter,
    sort: { publishedAt: -1, createdAt: -1 },
    page,
    limit,
    select: '-content',
  });
  res.json({ success: true, ...result });
}

/**
 * GET /api/blog/tags
 * Tags used by published posts, with post counts, most used first.
 */
export async function listTags(_req, res) {
  const tags = await BlogPost.aggregate([
    { $match: { published: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $project: { _id: 0, tag: '$_id', count: 1 } },
  ]);
  res.json({ success: true, data: tags });
}

/** GET /api/blog/:slug  Drafts are visible only to the admin. */
export async function getPost(req, res) {
  const filter = { slug: req.validated.params.slug };
  if (!req.admin) filter.published = true;

  const post = await BlogPost.findOne(filter);
  if (!post) throw ApiError.notFound('Post not found');
  res.json({ success: true, data: post });
}

export const {
  getById: getPostById,
  create: createPost,
  update: updatePost,
  remove: deletePost,
} = crudFactory(BlogPost, { label: 'Post', getImages: (doc) => [doc.coverImage] });

/** Fields left out of related-post results; listings never carry the full article. */
const LIST_FIELDS = '-content';
const RELATED_COUNT = 3;

/**
 * GET /api/blog/:slug/related
 * Up to three other published posts: most shared tags first, then newest; the
 * newest remaining posts fill any gap. Drafts are never included, even for the
 * admin, so the section looks the same to everyone. A draft's own related list
 * is available to the admin only, like the draft itself.
 */
export async function getRelatedPosts(req, res) {
  const filter = { slug: req.validated.params.slug };
  if (!req.admin) filter.published = true;

  const current = await BlogPost.findOne(filter).select('tags');
  if (!current) throw ApiError.notFound('Post not found');

  const newestFirst = { publishedAt: -1, _id: -1 };
  let picked = [];

  if (current.tags.length > 0) {
    // Rank every post that shares a tag in the database, so an older but closer
    // match is never missed; then load the winners as documents (id, no content).
    const ranked = await BlogPost.aggregate([
      { $match: { published: true, _id: { $ne: current._id }, tags: { $in: current.tags } } },
      { $addFields: { shared: { $size: { $setIntersection: ['$tags', current.tags] } } } },
      { $sort: { shared: -1, publishedAt: -1, _id: -1 } },
      { $limit: RELATED_COUNT },
      { $project: { _id: 1 } },
    ]);
    const ids = ranked.map((entry) => String(entry._id));
    const found = await BlogPost.find({ _id: { $in: ids } }).select(LIST_FIELDS);
    picked = ids.map((id) => found.find((post) => post.id === id)).filter(Boolean);
  }

  if (picked.length < RELATED_COUNT) {
    const fill = await BlogPost.find({
      published: true,
      _id: { $nin: [current._id, ...picked.map((post) => post._id)] },
    })
      .select(LIST_FIELDS)
      .sort(newestFirst)
      .limit(RELATED_COUNT - picked.length);
    picked = [...picked, ...fill];
  }

  res.json({ success: true, data: picked });
}

/** Posts listed in the RSS feed. */
const FEED_SIZE = 20;

/** Characters that XML 1.0 does not allow at all, even escaped. */
// eslint-disable-next-line no-control-regex
const INVALID_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;

/**
 * Escapes text for use inside XML elements and attributes, and drops
 * characters XML forbids, so one stray character cannot invalidate the feed.
 */
function escapeXml(value) {
  return String(value ?? '')
    .replace(INVALID_XML_CHARS, '')
    .replace(
      /[<>&'"]/g,
      (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char],
    );
}

/**
 * GET /api/blog/feed.xml
 * RSS 2.0 feed of the newest published posts, with excerpts rather than full
 * articles. Links point to the public website (SITE_URL).
 */
export async function getFeed(_req, res) {
  const posts = await BlogPost.find({ published: true })
    .select(LIST_FIELDS)
    .sort({ publishedAt: -1, _id: -1 })
    .limit(FEED_SIZE);

  const site = env.mail.siteUrl.replace(/\/+$/, '');
  const author = env.mail.fromName;
  const updated = posts[0]?.publishedAt ?? new Date();

  const items = posts.map((post) => {
    const url = `${site}/blog/${post.slug}`;
    return [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      post.publishedAt ? `      <pubDate>${post.publishedAt.toUTCString()}</pubDate>` : null,
      `      <description>${escapeXml(post.excerpt)}</description>`,
      ...(post.tags ?? []).map((tag) => `      <category>${escapeXml(tag)}</category>`),
      '    </item>',
    ]
      .filter(Boolean)
      .join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${escapeXml(`Blog | ${author}`)}</title>`,
    `    <link>${escapeXml(`${site}/blog`)}</link>`,
    `    <description>${escapeXml(`Articles by ${author} on backend development, REST APIs, authentication, React and problem solving.`)}</description>`,
    '    <language>en</language>',
    `    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  // The feed never contains drafts, so shared caches may keep it briefly.
  res.set('Cache-Control', 'public, max-age=600');
  res.type('application/rss+xml; charset=utf-8').send(xml);
}
