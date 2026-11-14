import { githubUsername, site, socialLinks } from './site.js';

/**
 * Search and social metadata shared by the React <Seo> component (runtime)
 * and the Vite SEO plugin (build time: index.html tags, sitemap, robots.txt).
 * Plain JavaScript with relative imports only, so it also runs in Node.
 */

export const DEFAULT_TITLE = `${site.name} | MERN Full-Stack Developer`;

export const DEFAULT_DESCRIPTION =
  'Alok Paul is a MERN full-stack developer and Computer Science and Engineering undergraduate in Bangladesh, building secure, scalable web applications with a focus on REST APIs, authentication and clean user interfaces.';

/** 1200x630 image used for link previews. */
export const SOCIAL_IMAGE_PATH = site.socialImage;
export const SOCIAL_IMAGE_ALT = `Portrait of ${site.name}`;

/** Public pages listed in the sitemap, with relative crawl priority. */
export const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/projects', priority: 0.9, changefreq: 'weekly' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/skills', priority: 0.7, changefreq: 'monthly' },
  { path: '/experience', priority: 0.7, changefreq: 'monthly' },
  { path: '/blog', priority: 0.7, changefreq: 'weekly' },
  { path: '/contact', priority: 0.6, changefreq: 'yearly' },
  { path: '/privacy', priority: 0.2, changefreq: 'yearly' },
];

/** Joins the site origin and a path without double slashes. */
export function absoluteUrl(siteUrl, path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * Profile links for schema.org `sameAs`, skipping unset placeholders.
 * `linkedin` is the link saved in the admin panel, when there is one.
 */
export function profileLinks(linkedin) {
  return [socialLinks.github, linkedin || socialLinks.linkedin].filter(
    (url) => url && !/your-(username|profile)/.test(url),
  );
}

/**
 * schema.org Person, rendered as JSON-LD. The email address is left out on
 * purpose: the public address is managed in the admin panel and should not be
 * frozen into structured data.
 *
 * @param {string} siteUrl
 * @param {{ linkedin?: string | null }} [options] values saved in the admin panel
 */
export function personSchema(siteUrl, { linkedin } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: 'MERN Full-Stack Developer',
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl(siteUrl, '/'),
    image: absoluteUrl(siteUrl, site.profileImage),
    address: { '@type': 'PostalAddress', addressCountry: 'BD' },
    knowsAbout: [
      'MongoDB',
      'Express',
      'React',
      'Node.js',
      'REST APIs',
      'JWT authentication',
      'C++',
      'Data structures and algorithms',
    ],
    sameAs: profileLinks(linkedin),
    identifier: githubUsername,
  };
}

/**
 * Builds the meta tag list for a page. Returned as plain objects so the same
 * data can be rendered by React Helmet or written into index.html.
 *
 * @param {object} options
 * @param {string} options.siteUrl
 * @param {string} [options.title]        page title without the site name
 * @param {string} [options.description]
 * @param {string} [options.path='/']
 * @param {string} [options.image]        path or absolute URL
 * @param {string} [options.imageAlt]
 * @param {'website' | 'article' | 'profile'} [options.type='website']
 * @param {boolean} [options.noindex]
 * @param {{ publishedTime?: string, modifiedTime?: string, tags?: string[] }} [options.article]
 */
export function buildMeta({
  siteUrl,
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = SOCIAL_IMAGE_PATH,
  imageAlt = SOCIAL_IMAGE_ALT,
  type = 'website',
  noindex = false,
  article,
}) {
  const fullTitle = title ? `${title} | ${site.name}` : DEFAULT_TITLE;
  const url = absoluteUrl(siteUrl, path);
  const imageUrl = absoluteUrl(siteUrl, image);

  const meta = [
    { name: 'description', content: description },
    { name: 'author', content: site.name },
    { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' },
    { property: 'og:site_name', content: site.name },
    { property: 'og:type', content: type },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:alt', content: imageAlt },
    { property: 'og:locale', content: 'en_US' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
    { name: 'twitter:image:alt', content: imageAlt },
  ];

  if (type === 'article' && article) {
    if (article.publishedTime)
      meta.push({ property: 'article:published_time', content: article.publishedTime });
    if (article.modifiedTime)
      meta.push({ property: 'article:modified_time', content: article.modifiedTime });
    (article.tags ?? []).forEach((tag) => meta.push({ property: 'article:tag', content: tag }));
    meta.push({ property: 'article:author', content: site.name });
  }

  return { title: fullTitle, canonical: url, meta };
}
