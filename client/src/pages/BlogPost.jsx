import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import MarkdownContent from '@/components/blog/MarkdownContent';
import PostMeta from '@/components/blog/PostMeta';
import RelatedPosts from '@/components/blog/RelatedPosts';
import TableOfContents from '@/components/blog/TableOfContents';
import ShareButtons from '@/components/blog/ShareButtons';
import TagLink from '@/components/blog/TagLink';
import LoadError from '@/components/ui/LoadError';
import useApiQuery from '@/hooks/useApiQuery';
import Seo from '@/components/seo/Seo';
import { feedUrl } from '@/lib/api';
import { extractHeadings, MIN_TOC_HEADINGS } from '@/lib/headings';
import { SITE_URL } from '@/lib/siteUrl';
import { fadeUp, stagger } from '@/lib/motion';

function BackLink() {
  return (
    <Link
      to="/blog"
      className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      All articles
    </Link>
  );
}

/** Loading placeholder matching the article layout. */
function ArticleSkeleton() {
  return (
    <div className="mt-10 flex flex-col gap-4" aria-busy="true" aria-label="Loading article">
      <div className="h-4 w-44 animate-pulse rounded bg-surface" />
      <div className="h-10 w-5/6 animate-pulse rounded bg-surface" />
      <div className="mt-8 flex flex-col gap-3">
        {[100, 96, 92, 98, 70].map((width) => (
          <div
            key={width}
            className="h-4 animate-pulse rounded bg-surface"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Article page at /blog/:slug: header, cover image, table of contents (for
 * posts with three or more sections), Markdown body, tags, sharing and
 * related articles.
 */
export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading, error, errorStatus, retry } = useApiQuery(`/blog/${slug}`);

  const path = `/blog/${slug}`;
  const shareUrl = `${SITE_URL}${path}`;
  // Table of contents from the article's own headings; short posts have none.
  const headings = useMemo(() => (post ? extractHeadings(post.content) : []), [post]);
  const hasToc = headings.length >= MIN_TOC_HEADINGS;

  // A shared link to a section (/blog/slug#section) opens at that section once the
  // article has rendered. Runs once per post, so later re-renders never move the reader.
  useEffect(() => {
    if (!post) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    // Arriving on the page jumps straight there; a smooth scroll started here gets cancelled.
    target.scrollIntoView({ behavior: 'instant' });
    target.focus({ preventScroll: true });
  }, [post]);

  if (errorStatus === 404) {
    return (
      <section className="container-page py-20 sm:py-28">
        <Seo title="Article not found" noindex />
        <div className="mx-auto max-w-3xl">
          <BackLink />
          <h1 className="text-heading mt-10">Article not found</h1>
          <p className="mt-3 text-muted">This article does not exist or is no longer available.</p>
        </div>
      </section>
    );
  }

  return (
    <article className="container-page py-20 sm:py-28">
      {post ? (
        <Seo
          title={post.title}
          description={post.excerpt}
          path={path}
          type="article"
          image={post.coverImage?.url}
          imageAlt={post.coverImage?.alt || post.title}
          noindex={!post.published}
          article={{
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            tags: post.tags,
          }}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            keywords: post.tags?.join(', '),
            mainEntityOfPage: shareUrl,
            ...(post.coverImage?.url && { image: post.coverImage.url }),
            author: { '@type': 'Person', name: 'Alok Paul', url: SITE_URL },
          }}
        />
      ) : (
        <Seo title="Blog" path={path} />
      )}
      <Helmet>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Blog | Alok Paul"
          href={feedUrl()}
        />
      </Helmet>
      {/* With a table of contents, it sits in a column beside the article on large screens. */}
      <div
        className={
          hasToc ? 'lg:grid lg:grid-cols-[minmax(0,48rem)_14rem] lg:justify-center lg:gap-14' : ''
        }
      >
        <div className="mx-auto w-full max-w-3xl min-w-0">
          <BackLink />

          {isLoading && <ArticleSkeleton />}
          {error && (
            <div className="mt-10">
              <LoadError message={error} onRetry={retry} />
            </div>
          )}

          {post && (
            <motion.div variants={stagger(0, 0.08)} initial="hidden" animate="visible">
              <motion.header variants={fadeUp} className="mt-10 flex flex-col gap-5">
                <PostMeta publishedAt={post.publishedAt} readingTime={post.readingTime} />
                {/* Section-heading scale: article titles are long and sit in a narrow reading column. */}
                <h1 className="text-heading">{post.title}</h1>
                <span className="h-1 w-16 bg-primary" aria-hidden="true" />
                {/* The excerpt is shown on the list page only; here it would repeat the opening. */}
              </motion.header>

              {post.coverImage?.url && (
                <motion.img
                  variants={fadeUp}
                  src={post.coverImage.url}
                  alt={post.coverImage.alt || ''}
                  // Above the fold: fetch early so it can be the Largest Contentful Paint.
                  fetchPriority="high"
                  decoding="async"
                  className="mt-10 aspect-[16/9] w-full rounded-xl border border-border object-cover"
                />
              )}

              {hasToc && (
                <motion.div variants={fadeUp} className="mt-10 lg:hidden">
                  <TableOfContents key={post.id} headings={headings} variant="inline" />
                </motion.div>
              )}

              <motion.div variants={fadeUp} className="mt-10 border-t border-border pt-10">
                <MarkdownContent>{post.content}</MarkdownContent>
              </motion.div>

              <motion.footer
                variants={fadeUp}
                className="mt-14 flex flex-col gap-6 border-t border-border pt-8"
              >
                {post.tags?.length > 0 && (
                  <ul className="flex flex-wrap gap-2" aria-label="Tags">
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <TagLink tag={tag} />
                      </li>
                    ))}
                  </ul>
                )}
                <ShareButtons url={shareUrl} title={post.title} />
              </motion.footer>

              <RelatedPosts key={post.slug} slug={post.slug} />
            </motion.div>
          )}
        </div>

        {hasToc && (
          <aside className="hidden pt-20 lg:block">
            <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto">
              <TableOfContents key={post.id} headings={headings} variant="sidebar" />
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
