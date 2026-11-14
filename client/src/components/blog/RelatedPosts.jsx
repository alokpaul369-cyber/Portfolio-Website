import { useId } from 'react';
import { motion } from 'framer-motion';
import useApiQuery from '@/hooks/useApiQuery';
import { inViewOnce, stagger } from '@/lib/motion';
import PostListItem from './PostListItem';

/**
 * "Related articles" at the end of a post: up to three other published posts,
 * chosen by the server by shared tags, then newest. Renders nothing while
 * loading, when there are none, or if the request fails, so the article never
 * ends with an empty or broken section.
 *
 * @param {{ slug: string }} props
 */
export default function RelatedPosts({ slug }) {
  const headingId = useId();
  const { data: posts } = useApiQuery(`/blog/${slug}/related`);
  if (!posts || posts.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="mt-16 border-t border-border pt-10">
      <h2 id={headingId} className="text-2xl font-bold tracking-tight">
        Related articles
      </h2>
      <motion.ol variants={stagger(0, 0.06)} {...inViewOnce} className="mt-8">
        {posts.map((post) => (
          <PostListItem key={post.id} post={post} headingLevel="h3" compact />
        ))}
      </motion.ol>
    </section>
  );
}
