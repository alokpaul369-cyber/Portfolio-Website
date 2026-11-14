import { motion } from 'framer-motion';
import ResearchRow from '@/components/research/ResearchRow';
import Seo from '@/components/seo/Seo';
import FilterButton from '@/components/ui/FilterButton';
import LoadError from '@/components/ui/LoadError';
import PageHeader from '@/components/ui/PageHeader';
import { researchStatuses, researchTypes } from '@/data/research';
import useApiQuery from '@/hooks/useApiQuery';
import useListParams from '@/hooks/useListParams';
import { stagger } from '@/lib/motion';

/** One row of filter buttons; only values that occur in the list are offered. */
function FilterGroup({ label, options, value, onChange }) {
  if (options.length < 2) return null;
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted">{label}</span>
      <FilterButton active={!value} onClick={() => onChange('')}>
        All
      </FilterButton>
      {options.map((option) => (
        <FilterButton
          key={option.key}
          active={value === option.key}
          onClick={() => onChange(value === option.key ? '' : option.key)}
        >
          {option.label}
        </FilterButton>
      ))}
    </div>
  );
}

/** Placeholder rows while the list loads. */
function RowsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading research">
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="grid gap-3 border-t border-border py-8 lg:grid-cols-[12rem_1fr] lg:gap-10"
        >
          <div className="h-4 w-24 animate-pulse rounded bg-surface" />
          <div className="flex flex-col gap-3">
            <div className="h-7 w-3/4 animate-pulse rounded bg-surface" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface" />
            <div className="h-4 w-full animate-pulse rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Research page: every visible entry, filterable by type and status.
 * The list is short, so it is loaded once and filtered in the browser; the
 * active filters live in the URL (?type=&status=).
 */
export default function Research() {
  const { get, update } = useListParams();
  const { data: entries, isLoading, error, retry } = useApiQuery('/research');

  // The signed-in owner also receives hidden drafts; leave them out so this page
  // looks the same for everyone. Drafts are listed in the admin panel.
  const all = (entries ?? []).filter((entry) => entry.visible);
  const typeOptions = researchTypes.filter(({ key }) => all.some((entry) => entry.type === key));
  const statusOptions = researchStatuses.filter(({ key }) =>
    all.some((entry) => entry.status === key),
  );

  // Ignore filter values that do not occur (for example from an old link).
  const type = typeOptions.some(({ key }) => key === get('type')) ? get('type') : '';
  const status = statusOptions.some(({ key }) => key === get('status')) ? get('status') : '';
  const shown = all.filter(
    (entry) => (!type || entry.type === type) && (!status || entry.status === status),
  );

  return (
    <section className="container-page py-20 sm:py-28">
      <Seo
        title="Research"
        description="Research by Alok Paul: papers, theses, posters and ongoing research work."
        path="/research"
        noindex={!isLoading && !error && all.length === 0}
      />
      <PageHeader
        label="Research"
        title="Research"
        description="Papers, theses and ongoing research work."
      />

      {error && (
        <div className="mt-12">
          <LoadError message={error} onRetry={retry} />
        </div>
      )}

      {isLoading && (
        <div className="mt-12">
          <RowsSkeleton />
        </div>
      )}

      {!isLoading && !error && all.length === 0 && (
        <p className="mt-12 rounded-xl border border-dashed border-border px-6 py-14 text-center text-muted">
          Research work will be listed here.
        </p>
      )}

      {!isLoading && !error && all.length > 0 && (
        <>
          <div className="mt-12 flex flex-col gap-3">
            <FilterGroup
              label="Type"
              options={typeOptions}
              value={type}
              onChange={(key) => update({ type: key })}
            />
            <FilterGroup
              label="Status"
              options={statusOptions}
              value={status}
              onChange={(key) => update({ status: key })}
            />
          </div>

          <p className="mt-6 text-sm text-muted" aria-live="polite">
            {shown.length} {shown.length === 1 ? 'entry' : 'entries'}
          </p>

          {shown.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
              <p className="font-medium">No entries match these filters</p>
              <button
                type="button"
                onClick={() => update({ type: '', status: '' })}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <motion.ul
              // Re-run the entrance animation when the filtered set changes.
              key={shown.map((entry) => entry.id).join(',')}
              variants={stagger(0, 0.06)}
              initial="hidden"
              animate="visible"
              className="mt-4 border-b border-border"
            >
              {shown.map((entry) => (
                <ResearchRow key={entry.id} entry={entry} />
              ))}
            </motion.ul>
          )}
        </>
      )}
    </section>
  );
}
