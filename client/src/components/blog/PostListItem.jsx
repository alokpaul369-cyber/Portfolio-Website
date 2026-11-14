import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeUp } from '@/lib/motion';
import PostMeta from './PostMeta';
import TagLink from './TagLink';

/**
 * One post in the blog list: meta, title, excerpt, tags and a read link.
 * Laid out as a readable list row rather than a card grid. `headingLevel` is
 * h2 on the Blog page and h3 under the "Related articles" heading, where
 * `compact` also sets a smaller title so it sits below that heading in size.
 */
export default function PostListItem({ post, headingLevel: Heading = 'h2', compact = false }) {
  const url = `/blog/${post.slug}`;

  return (
    <motion.li variants={fadeUp} className="border-b border-border py-8 first:pt-0">
      <article className="group flex flex-col gap-3 sm:flex-row sm:gap-8">
        {post.coverImage?.url && (
          <Link to={url} tabIndex={-1} aria-hidden="true" className="shrink-0 sm:order-last">
            <img
              src={post.coverImage.url}
              alt=""
              decoding="async"
              loading="lazy"
              className="aspect-[16/10] w-full rounded-lg border border-border object-cover sm:w-48"
            />
          </Link>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <PostMeta publishedAt={post.publishedAt} readingTime={post.readingTime} />

          <Heading
            className={`leading-snug font-bold tracking-tight ${
              compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            <Link to={url} className="transition-colors hover:text-primary">
              {post.title}
            </Link>
          </Heading>

          {post.excerpt && <p className="leading-relaxed text-muted">{post.excerpt}</p>}

          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            {post.tags?.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <TagLink tag={tag} />
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={url}
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              Read article
              <ArrowRight
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
              <span className="sr-only">: {post.title}</span>
            </Link>
          </div>
        </div>
      </article>
    </motion.li>
  );
}

/** Loading placeholder with the same shape as PostListItem. */
export function PostListItemSkeleton() {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-8 first:pt-0">
      <div className="h-4 w-40 animate-pulse rounded bg-surface" />
      <div className="h-8 w-3/4 animate-pulse rounded bg-surface" />
      <div className="h-4 w-full animate-pulse rounded bg-surface" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-surface" />
    </div>
  );
}
