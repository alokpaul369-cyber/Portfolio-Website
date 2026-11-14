import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Tracks which heading the reader is in: the last heading that has passed the
 * top of the viewport, below the sticky header. Updates come from an
 * IntersectionObserver callback, never synchronously from the effect.
 *
 * @param {string[]} ids heading ids in document order
 */
function useCurrentHeading(ids) {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (elements.length === 0 || !('IntersectionObserver' in window)) return undefined;

    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        // The first heading still in the reading band, or else the last one above it.
        const inBand = ids.find((id) => visible.has(id));
        if (inBand) {
          setCurrent(inBand);
          return;
        }
        const above = elements.filter((element) => element.getBoundingClientRect().top < 96);
        setCurrent(above.length > 0 ? above[above.length - 1].id : null);
      },
      // The band from just below the sticky header to 60% down the screen.
      { rootMargin: '-96px 0px -40% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return current;
}

/**
 * Moves to a heading, puts keyboard focus on it and records it in the URL, so
 * the section can be shared. Scrolling follows the page's scroll-behavior,
 * which is instant for visitors who prefer reduced motion.
 */
function goTo(event, id) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.scrollIntoView();
  target.focus({ preventScroll: true });
  window.history.replaceState(window.history.state, '', `#${id}`);
}

/** The list of links, shared by the sidebar and the mobile disclosure. */
function HeadingLinks({ headings, current, onNavigate }) {
  return (
    <ol className="flex flex-col gap-1 text-sm">
      {headings.map(({ id, text, level }) => {
        const active = id === current;
        return (
          <li key={id} className={level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${id}`}
              onClick={(event) => {
                goTo(event, id);
                onNavigate?.();
              }}
              aria-current={active ? 'true' : undefined}
              className={`block border-l-2 py-1 pl-3 leading-snug break-words transition-colors ${
                active
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              {text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * "On this page" navigation for a blog post.
 * - `variant="sidebar"`: sticky column beside the article on large screens,
 *   with the section being read highlighted.
 * - `variant="inline"`: a collapsed disclosure above the article on small screens.
 *
 * @param {object} props
 * @param {Array<{ id: string, text: string, level: number }>} props.headings
 * @param {'sidebar' | 'inline'} props.variant
 */
export default function TableOfContents({ headings, variant }) {
  const [ids] = useState(() => headings.map((heading) => heading.id));
  const current = useCurrentHeading(ids);

  if (variant === 'inline') {
    return (
      <details className="group rounded-xl border border-border bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          On this page
          <ChevronDown
            className="size-4 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </summary>
        <nav aria-label="On this page" className="border-t border-border px-5 py-4">
          <HeadingLinks headings={headings} current={current} />
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="On this page" className="flex flex-col gap-3">
      <p className="eyebrow text-muted">On this page</p>
      <HeadingLinks headings={headings} current={current} />
    </nav>
  );
}
