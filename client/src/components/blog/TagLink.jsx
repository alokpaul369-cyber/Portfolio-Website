import { Link } from 'react-router';

/**
 * Tag that links to the blog list filtered by that tag.
 * Pass `active` and `onClick` instead of relying on the link when used as a filter.
 */
export default function TagLink({ tag, active = false, onClick, count }) {
  const className = `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${
    active
      ? 'border-primary bg-primary text-bg'
      : 'border-border text-muted hover:border-primary/50 hover:text-text'
  }`;

  const content = (
    <>
      {tag}
      {count !== undefined && <span className={active ? 'opacity-80' : 'opacity-60'}>{count}</span>}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link to={`/blog?tag=${encodeURIComponent(tag)}`} className={className}>
      {content}
    </Link>
  );
}
