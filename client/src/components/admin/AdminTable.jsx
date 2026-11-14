/**
 * Table frame and cell styles for admin lists. Scrolls horizontally on
 * narrow screens instead of squeezing columns; `fluid` lets a small table
 * (two or three columns) fit the screen instead.
 */
export function AdminTable({ caption, fluid = false, children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table
        className={`w-full ${fluid ? '' : 'min-w-[640px]'} text-left text-sm [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-bg [&_tbody_tr:last-child>td]:border-b-0`}
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`border-b border-border bg-bg px-4 py-3 text-xs font-semibold tracking-wider text-muted uppercase ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '' }) {
  return (
    <td className={`border-b border-border px-4 py-3.5 align-middle ${className}`}>{children}</td>
  );
}

/** Skeleton rows while a table loads. */
export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-surface" />
      ))}
    </div>
  );
}

/** Small status label. */
export function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'border-border text-muted',
    primary: 'border-primary/40 text-primary',
    success: 'border-success/40 text-success',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
