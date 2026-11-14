import { motion } from 'framer-motion';
import LoadError from '@/components/ui/LoadError';
import PageHeader from '@/components/ui/PageHeader';
import useApiQuery from '@/hooks/useApiQuery';
import { formatDateRange } from '@/lib/format';
import { fadeUp, inViewOnce, stagger } from '@/lib/motion';

/** One entry: dates in a left rail and details on the right from the lg breakpoint. */
const rowClass = 'grid gap-3 border-t border-border py-8 lg:grid-cols-[12rem_1fr] lg:gap-10';

/** Placeholder entry shown while education loads. */
function TimelineSkeleton() {
  return (
    <div className={rowClass} aria-busy="true" aria-label="Loading education">
      <div className="h-4 w-28 animate-pulse rounded bg-surface" />
      <div className="flex flex-col gap-2">
        <div className="h-7 w-72 max-w-full animate-pulse rounded bg-surface" />
        <div className="h-4 w-48 animate-pulse rounded bg-surface" />
      </div>
    </div>
  );
}

/**
 * Chronological list of education entries from GET /api/experience?type=education,
 * one bordered row per entry with its dates in a left rail.
 * Current entries come first, then by most recent start date (server order).
 */
export default function EducationTimeline({ headingLevel = 'h2' }) {
  const {
    data: entries,
    isLoading,
    error,
    retry,
  } = useApiQuery('/experience', {
    type: 'education',
  });

  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className="container-page py-16 sm:py-24"
    >
      <PageHeader
        id="education-heading"
        label="Education"
        title="Education"
        as={headingLevel}
        inView={headingLevel === 'h2'}
      />

      <div className="mt-12">
        {isLoading && <TimelineSkeleton />}
        {error && <LoadError message={error} onRetry={retry} />}
        {!isLoading && !error && entries?.length === 0 && (
          <p className="text-sm text-muted">Education details will be added soon.</p>
        )}

        {entries?.length > 0 && (
          <motion.ol variants={stagger(0, 0.1)} {...inViewOnce} className="border-b border-border">
            {entries.map((entry) => (
              <motion.li key={entry.id} variants={fadeUp} className={rowClass}>
                <p className="flex flex-wrap items-center gap-2 self-start text-sm font-medium text-muted tabular-nums lg:flex-col lg:items-start lg:pt-1.5">
                  <time dateTime={entry.startDate}>
                    {formatDateRange(entry.startDate, entry.endDate, {
                      current: entry.current,
                      precision: 'year',
                    })}
                  </time>
                  {entry.current && (
                    <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[11px] text-primary">
                      In progress
                    </span>
                  )}
                </p>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{entry.role}</h3>
                  {entry.company && <p className="text-muted">{entry.company}</p>}
                  {entry.description?.length > 0 && (
                    <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-sm leading-relaxed text-muted marker:text-border">
                      {entry.description.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.li>
            ))}
          </motion.ol>
        )}
      </div>
    </section>
  );
}
