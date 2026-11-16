import { createElement, useState } from 'react';
import { getProjectCategory } from '@/data/projects';

/**
 * Project screenshot in a fixed 16:10 frame.
 * When the project has no image, or the image fails to load, a placeholder on
 * the site's square grid, with the category icon and name, keeps the card shape.
 * Inside a card with `group`, the image zooms in slightly on hover.
 *
 * @param {{ image?: { url: string, alt?: string }, title: string, category: string, eager?: boolean }} props
 */
export default function ProjectImage({ image, title, category, eager = false, className = '' }) {
  const [failed, setFailed] = useState(false);
  const showImage = image?.url && !failed;

  return (
    <div className={`relative aspect-[16/10] overflow-hidden bg-bg ${className}`}>
      {showImage ? (
        <img
          src={image.url}
          alt={image.alt || `Screenshot of ${title}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
        />
      ) : (
        <div
          role="img"
          aria-label={`${title} (no screenshot available)`}
          className="flex size-full flex-col items-center justify-center gap-3 bg-[linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] [background-size:32px_32px] [background-position:center]"
        >
          <span className="inline-flex size-16 items-center justify-center rounded-2xl border border-border bg-surface text-primary transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transform-none">
            {createElement(getProjectCategory(category).Icon, {
              className: 'size-7',
              strokeWidth: 1.5,
              'aria-hidden': true,
            })}
          </span>
          <span className="eyebrow" aria-hidden="true">
            {getProjectCategory(category).label}
          </span>
        </div>
      )}
    </div>
  );
}
