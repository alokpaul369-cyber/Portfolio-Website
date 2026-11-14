import { Clock } from 'lucide-react';
import { formatDate } from '@/lib/format';

/**
 * Publication date and reading time, e.g. "Nov 8, 2026 · 6 min read".
 * Drafts (no publication date) show "Draft" instead of a date.
 */
export default function PostMeta({ publishedAt, readingTime, className = '' }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted ${className}`}>
      {publishedAt ? (
        <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
      ) : (
        <span className="rounded border border-border px-1.5 text-xs">Draft</span>
      )}
      <span aria-hidden="true" className="text-border">
        |
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
        {readingTime} min read
      </span>
    </p>
  );
}
