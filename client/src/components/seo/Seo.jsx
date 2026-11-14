import { Helmet } from 'react-helmet-async';
import { buildMeta } from '@/config/seo';
import { SITE_URL } from '@/lib/siteUrl';

/**
 * Page metadata: title, description, canonical URL, Open Graph, Twitter card,
 * robots and optional JSON-LD. Render once per page.
 *
 * @param {object} props
 * @param {string} [props.title]        page title; "| Alok Paul" is appended
 * @param {string} [props.description]
 * @param {string} [props.path]         defaults to the current path
 * @param {string} [props.image]        social preview image (path or URL)
 * @param {string} [props.imageAlt]
 * @param {'website' | 'article' | 'profile'} [props.type]
 * @param {boolean} [props.noindex]     keep the page out of search results
 * @param {object} [props.article]      { publishedTime, modifiedTime, tags }
 * @param {object | object[]} [props.jsonLd]  structured data
 */
export default function Seo({ path, jsonLd, ...options }) {
  const { title, canonical, meta } = buildMeta({
    siteUrl: SITE_URL,
    path: path ?? window.location.pathname,
    ...options,
  });

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <link rel="canonical" href={canonical} />
      {meta.map((tag) => (
        <meta key={tag.name ?? `${tag.property}:${tag.content}`} {...tag} />
      ))}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
