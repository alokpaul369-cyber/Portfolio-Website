import { ChevronLeft, ChevronRight } from 'lucide-react';

const buttonClass =
  'inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40';

/**
 * Previous / next controls for a paginated API list.
 * Renders nothing when there is only one page.
 *
 * @param {{ pagination?: { page: number, totalPages: number, hasPrevPage: boolean, hasNextPage: boolean }, onPageChange: (page: number) => void, label: string }} props
 */
export default function Pagination({ pagination, onPageChange, label }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;

  return (
    <nav aria-label={label} className="mt-10 flex items-center justify-center gap-4">
      <button
        type="button"
        className={buttonClass}
        disabled={!hasPrevPage}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Previous
      </button>
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className={buttonClass}
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
