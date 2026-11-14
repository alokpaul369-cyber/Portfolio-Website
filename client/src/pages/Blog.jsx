import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import PostListItem, { PostListItemSkeleton } from '@/components/blog/PostListItem';
import TagLink from '@/components/blog/TagLink';
import LoadError from '@/components/ui/LoadError';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';
import { Helmet } from 'react-helmet-async';
import { Rss } from 'lucide-react';
import useApiQuery from '@/hooks/useApiQuery';
import { feedUrl } from '@/lib/api';
import Seo from '@/components/seo/Seo';
import useListParams from '@/hooks/useListParams';
import { stagger } from '@/lib/motion';

const PAGE_SIZE = 10;

/**
 * Blog list: search, tag filter, post list and pagination.
 * Filters live in the URL (?tag=&q=&page=) so filtered views can be shared.
 */
export default function Blog() {
  const { get, page, update } = useListParams();
  const tag = get('tag').toLowerCase();
  const search = get('q');

  const params = { limit: PAGE_SIZE, page };
  if (tag) params.tag = tag;
  if (search) params.search = search;

  const { data: posts, pagination, isLoading, error, retry } = useApiQuery('/blog', params);
  const { data: tags } = useApiQuery('/blog/tags');

  const hasFilters = Boolean(tag || search);

  return (
    <section className="container-page py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Seo
          title="Blog"
          description="Articles by Alok Paul on backend development, REST APIs, authentication, React and problem solving."
          path="/blog"
        />
        <PageHeader
          label="Blog"
          title="Writing"
          description="Notes on backend development, authentication, React and problem solving."
        />
        {/* Lets browsers and feed readers discover the feed. */}
        <Helmet>
          <link
            rel="alternate"
            type="application/rss+xml"
            title="Blog | Alok Paul"
            href={feedUrl()}
          />
        </Helmet>
        <a
          href={feedUrl()}
          className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
        >
          <Rss className="size-4" aria-hidden="true" />
          RSS feed
        </a>

        {/* Filters */}
        <div className="mt-10 flex flex-col gap-4">
          <SearchInput
            value={search}
            onChange={(term) => update({ q: term })}
            label="Search articles"
            placeholder="Search articles"
          />
          {tags?.length > 0 && (
            <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-2">
              <TagLink tag="All" active={!tag} onClick={() => update({ tag: '' })} />
              {tags.map(({ tag: name, count }) => (
                <TagLink
                  key={name}
                  tag={name}
                  count={count}
                  active={tag === name}
                  onClick={() => update({ tag: tag === name ? '' : name })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mt-10">
          {error && <LoadError message={error} onRetry={retry} />}

          {isLoading && (
            <div aria-busy="true" aria-label="Loading articles">
              {[0, 1, 2].map((i) => (
                <PostListItemSkeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && !error && posts.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <FileText className="size-6 text-muted" strokeWidth={1.5} aria-hidden="true" />
              {hasFilters ? (
                <>
                  <p className="font-medium">No articles match your filters</p>
                  <button
                    type="button"
                    onClick={() => update({ tag: '', q: '' })}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p className="font-medium">No articles published yet</p>
                  <p className="text-sm text-muted">New writing will appear here.</p>
                </>
              )}
            </div>
          )}

          {!isLoading && !error && posts.length > 0 && (
            <motion.ol
              key={posts.map((post) => post.id).join(',')}
              variants={stagger(0, 0.06)}
              initial="hidden"
              animate="visible"
            >
              {posts.map((post) => (
                <PostListItem key={post.id} post={post} />
              ))}
            </motion.ol>
          )}
        </div>

        <Pagination
          label="Article pages"
          pagination={pagination}
          onPageChange={(next) => update({ page: next })}
        />
      </div>
    </section>
  );
}
