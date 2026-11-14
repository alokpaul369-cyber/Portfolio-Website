import { createElement, useState } from 'react';
import { getProjectCategory } from '@/data/projects';

/**
 * Project screenshot in a fixed 16:10 frame.
 * When the project has no image, or the image fails to load, a neutral
 * placeholder with the category icon is shown so cards keep the same shape.
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
          className="size-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`${title} (no screenshot available)`}
          className="flex size-full items-center justify-center bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]"
        >
          <span className="inline-flex size-12 items-center justify-center rounded-xl border border-border bg-surface text-muted">
            {createElement(getProjectCategory(category).Icon, {
              className: 'size-5',
              strokeWidth: 1.5,
              'aria-hidden': true,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
