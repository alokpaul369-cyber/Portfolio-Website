import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { STATIC_ROUTES, absoluteUrl, buildMeta, personSchema } from '../src/config/seo.js';

/**
 * Vite plugin for search engines and link previews.
 *
 * - index.html: writes the default title, description, canonical URL, Open
 *   Graph, Twitter and JSON-LD Person tags into the HTML. Social networks do
 *   not run JavaScript, so link previews rely on these static tags. They are
 *   marked data-seo-static and removed when the app starts (src/main.jsx),
 *   after which <Seo> renders the tags for each page.
 * - sitemap.xml and robots.txt: generated at build time into the output folder,
 *   including every project, published blog post and visible research entry
 *   fetched from the API.
 *   Both are also served by the dev server.
 *
 * @param {{ siteUrl: string, apiUrl?: string }} options
 *   siteUrl  public origin, e.g. https://alokpaul.dev
 *   apiUrl   absolute API base used to list projects, posts and research for the sitemap
 */
export default function seoPlugin({ siteUrl, apiUrl }) {
  let outDir = 'dist';
  let isBuild = false;

  return {
    name: 'portfolio-seo',

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      isBuild = config.command === 'build';
      if (isBuild && /localhost/.test(siteUrl)) {
        config.logger.warn(
          '[seo] VITE_SITE_URL is not set; canonical and social URLs will point to localhost.',
        );
      }
    },

    transformIndexHtml() {
      const { title, canonical, meta } = buildMeta({ siteUrl, path: '/', type: 'profile' });
      return [
        { tag: 'title', attrs: { 'data-seo-static': '' }, children: title, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'canonical', href: canonical, 'data-seo-static': '' }, injectTo: 'head' },
        ...meta.map((attrs) => ({ tag: 'meta', attrs: { ...attrs, 'data-seo-static': '' }, injectTo: 'head' })),
        {
          tag: 'script',
          attrs: { type: 'application/ld+json', 'data-seo-static': '' },
          children: JSON.stringify(personSchema(siteUrl)),
          injectTo: 'head',
        },
      ];
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(robotsTxt(siteUrl));
          return;
        }
        if (req.url === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(await sitemapXml(siteUrl, apiUrl, server.config.logger));
          return;
        }
        next();
      });
    },

    async closeBundle() {
      if (!isBuild) return;
      const logger = { info: console.log, warn: console.warn };
      await writeFile(path.join(outDir, 'robots.txt'), robotsTxt(siteUrl));
      await writeFile(path.join(outDir, 'sitemap.xml'), await sitemapXml(siteUrl, apiUrl, logger));
      console.log('[seo] wrote robots.txt and sitemap.xml');
    },
  };
}

/** robots.txt: allow everything except the admin area, and point to the sitemap. */
function robotsTxt(siteUrl) {
  return ['User-agent: *', 'Allow: /', 'Disallow: /admin', '', `Sitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}`, ''].join('\n');
}

/**
 * Fetches every page of a paginated API list; returns [] if the API is unreachable.
 * With `paginated: false` the list is fetched once, whole.
 */
async function fetchAll(apiUrl, resource, logger, { paginated = true } = {}) {
  const items = [];
  try {
    for (let page = 1; page <= 20; page += 1) {
      const query = paginated ? `?limit=50&page=${page}` : '';
      const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/${resource}${query}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      items.push(...body.data);
      if (!paginated || !body.pagination?.hasNextPage) break;
    }
  } catch (error) {
    logger.warn(`[seo] Could not load ${resource} for the sitemap (${error.message}); listing static pages only.`);
  }
  return items;
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);
}

/** sitemap.xml with static pages, projects, published blog posts and visible research. */
async function sitemapXml(siteUrl, apiUrl, logger) {
  const entries = STATIC_ROUTES.map((route) => ({ ...route }));

  if (apiUrl) {
    const [projects, posts, research] = await Promise.all([
      fetchAll(apiUrl, 'projects', logger),
      fetchAll(apiUrl, 'blog', logger), // public list: published posts only
      fetchAll(apiUrl, 'research', logger, { paginated: false }), // public list: visible entries only
    ]);
    projects.forEach((p) =>
      entries.push({ path: `/projects/${p.slug}`, lastmod: p.updatedAt, priority: 0.7, changefreq: 'monthly' }),
    );
    posts.forEach((p) =>
      entries.push({ path: `/blog/${p.slug}`, lastmod: p.updatedAt, priority: 0.6, changefreq: 'monthly' }),
    );
    // The Research page is listed only when it has something to show.
    if (research.length > 0) {
      entries.push({ path: '/research', priority: 0.8, changefreq: 'monthly' });
      research.forEach((r) =>
        entries.push({ path: `/research/${r.slug}`, lastmod: r.updatedAt, priority: 0.7, changefreq: 'monthly' }),
      );
    }
  } else {
    logger.warn('[seo] No API URL for the sitemap; listing static pages only.');
  }

  const urls = entries.map(({ path: pagePath, lastmod, priority, changefreq }) =>
    [
      '  <url>',
      `    <loc>${escapeXml(absoluteUrl(siteUrl, pagePath))}</loc>`,
      lastmod ? `    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : null,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority.toFixed(1)}</priority>`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n'),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
