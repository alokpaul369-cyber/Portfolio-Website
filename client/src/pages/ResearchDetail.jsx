import { Link, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ResearchLinks from '@/components/research/ResearchLinks';
import { StatusLabel } from '@/components/research/ResearchRow';
import Seo from '@/components/seo/Seo';
import LoadError from '@/components/ui/LoadError';
import { getResearchTypeLabel } from '@/data/research';
import useApiQuery from '@/hooks/useApiQuery';
import { formatMonthYear } from '@/lib/format';
import { fadeUp, stagger } from '@/lib/motion';
import { SITE_URL } from '@/lib/siteUrl';

/** Link back to the research list. */
function BackLink() {
  return (
    <Link
      to="/research"
      className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      All research
    </Link>
  );
}

/** Loading placeholder matching the detail layout. */
function DetailSkeleton() {
  return (
    <div className="mt-10 flex flex-col gap-4" aria-busy="true" aria-label="Loading research entry">
      <div className="h-3 w-20 animate-pulse rounded bg-surface" />
      <div className="h-12 w-3/4 animate-pulse rounded bg-surface" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-surface" />
      <div className="mt-6 h-40 w-full max-w-3xl animate-pulse rounded-xl bg-surface" />
    </div>
  );
}

/** schema.org ScholarlyArticle for a research entry. */
function scholarlySchema(entry, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: entry.title,
    abstract: entry.abstract || entry.summary,
    url,
    // Authors are stated only when the entry lists them; none are assumed.
    ...(entry.authors?.length > 0 && {
      author: entry.authors.map((name) => ({ '@type': 'Person', name })),
    }),
    // A date is a publication date only for published work.
    ...(entry.date && entry.status === 'published' && { datePublished: entry.date }),
    // The venue (journal, conference or institution) is where it appears, not its publisher.
    ...(entry.venue && { isPartOf: { '@type': 'CreativeWork', name: entry.venue } }),
    ...(entry.tags?.length > 0 && { keywords: entry.tags.join(', ') }),
    ...(entry.doiUrl && { sameAs: entry.doiUrl }),
  };
}

/** One labelled value in the details panel. */
function Detail({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="eyebrow text-muted">{label}</h2>
      <div className="text-sm font-semibold break-words">{children}</div>
    </div>
  );
}

/**
 * Research entry page at /research/:slug: title, authors and venue, the
 * abstract, topics, and a details panel with status, date and links that
 * stays in view on large screens.
 */
export default function ResearchDetail() {
  const { slug } = useParams();
  const { data: entry, isLoading, error, errorStatus, retry } = useApiQuery(`/research/${slug}`);
  const path = `/research/${slug}`;

  if (errorStatus === 404) {
    return (
      <section className="container-page py-20 sm:py-28">
        <Seo title="Research entry not found" noindex />
        <BackLink />
        <h1 className="text-heading mt-10">Research entry not found</h1>
        <p className="mt-3 text-muted">This entry does not exist or has been removed.</p>
      </section>
    );
  }

  // Blank lines in the abstract separate paragraphs.
  const paragraphs = (entry?.abstract || entry?.summary || '')
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean);

  return (
    <article className="container-page py-20 sm:py-28">
      {entry ? (
        <Seo
          title={entry.title}
          description={entry.summary}
          path={path}
          type="article"
          // Hidden drafts are visible to the signed-in admin only.
          noindex={!entry.visible}
          jsonLd={scholarlySchema(entry, `${SITE_URL}${path}`)}
        />
      ) : (
        <Seo title="Research" path={path} />
      )}
      <BackLink />

      {isLoading && <DetailSkeleton />}
      {error && (
        <div className="mt-10">
          <LoadError message={error} onRetry={retry} />
        </div>
      )}

      {entry && (
        <motion.div
          variants={stagger(0, 0.08)}
          initial="hidden"
          animate="visible"
          className="mt-10"
        >
          <motion.header variants={fadeUp} className="flex flex-col gap-4">
            <p className="eyebrow flex flex-wrap items-center gap-2">
              {getResearchTypeLabel(entry.type)}
              {!entry.visible && (
                <span className="rounded-full border border-border px-2 py-px text-[11px] tracking-normal text-muted normal-case">
                  Hidden draft
                </span>
              )}
            </p>
            {/* Section-heading scale: research titles are long. */}
            <h1 className="text-heading">{entry.title}</h1>
            <span className="mt-2 h-1 w-16 bg-primary" aria-hidden="true" />
            {(entry.authors?.length > 0 || entry.venue) && (
              <p className="max-w-3xl text-lg leading-relaxed break-words text-muted">
                {entry.authors?.join(', ')}
                {entry.authors?.length > 0 && entry.venue && <span aria-hidden="true"> · </span>}
                {entry.venue && <span className="italic">{entry.venue}</span>}
              </p>
            )}
          </motion.header>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_18rem] lg:gap-12">
            <motion.aside
              variants={fadeUp}
              aria-label="Research details"
              className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 lg:sticky lg:top-24 lg:order-last lg:self-start"
            >
              <Detail label="Status">
                <StatusLabel status={entry.status} />
              </Detail>
              {entry.date && (
                <Detail label="Date">
                  <time dateTime={entry.date}>{formatMonthYear(entry.date)}</time>
                </Detail>
              )}
              {entry.venue && <Detail label="Venue">{entry.venue}</Detail>}
              <ResearchLinks entry={entry} layout="stacked" />
            </motion.aside>

            <motion.div variants={fadeUp} className="flex min-w-0 flex-col gap-8">
              <section aria-labelledby="abstract-heading" className="flex flex-col gap-4">
                <h2 id="abstract-heading" className="text-xl font-bold tracking-tight">
                  {entry.abstract ? 'Abstract' : 'Summary'}
                </h2>
                {paragraphs.map((text, index) => (
                  <p
                    key={`${index}-${text.slice(0, 24)}`}
                    className="max-w-3xl text-lg leading-relaxed break-words text-muted"
                  >
                    {text}
                  </p>
                ))}
              </section>

              {entry.tags?.length > 0 && (
                <section aria-labelledby="topics-heading" className="flex flex-col gap-3">
                  <h2 id="topics-heading" className="text-xl font-bold tracking-tight">
                    Topics
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-border px-3 py-1 text-sm text-text"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </article>
  );
}
