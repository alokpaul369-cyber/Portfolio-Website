/** Small label for a technology used in a project. */
export default function TechBadge({ children }) {
  return (
    <li className="rounded-md border border-border bg-bg px-2 py-0.5 text-[11px] text-muted">
      {children}
    </li>
  );
}

/**
 * Row of tech badges. When `max` is set, extra items collapse into "+N".
 * @param {{ items: string[], max?: number, className?: string }} props
 */
export function TechBadgeList({ items = [], max, className = '' }) {
  const visible = max ? items.slice(0, max) : items;
  const hidden = items.length - visible.length;

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Technologies">
      {visible.map((item) => (
        <TechBadge key={item}>{item}</TechBadge>
      ))}
      {hidden > 0 && <TechBadge>+{hidden}</TechBadge>}
    </ul>
  );
}
