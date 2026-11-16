import { useState } from 'react';

/**
 * Profile photo in a bordered frame, with a static offset block behind it.
 *
 * - While `loading` is true, an empty frame of the same size is shown, so the
 *   page never flashes an old photo before the current one arrives.
 * - If `src` fails to load, `fallbackSrc` is tried; if that fails too, the
 *   person's initials are shown in the same frame so the layout never breaks.
 *
 * Give the component a `key` of `src` so a new photo starts with a fresh state.
 *
 * @param {object} props
 * @param {string} [props.src]
 * @param {string} [props.fallbackSrc]
 * @param {string} props.name
 * @param {string} [props.alt]
 * @param {boolean} [props.loading]
 * @param {boolean} [props.bare]  no frame or offset block, for a photo inside a card
 */
export default function ProfilePhoto({
  src,
  fallbackSrc,
  name,
  alt,
  loading = false,
  bare = false,
  className = '',
}) {
  const [current, setCurrent] = useState(src || fallbackSrc);
  const [failed, setFailed] = useState(!src && !fallbackSrc);
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const onError = () => {
    if (fallbackSrc && current !== fallbackSrc) setCurrent(fallbackSrc);
    else setFailed(true);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Decorative offset block behind the photo; `bare` drops it and the frame for use inside a card. */}
      {!bare && (
        <span
          className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg border border-primary/30 bg-primary/10"
          aria-hidden="true"
        />
      )}
      <div
        className={`relative aspect-[4/5] overflow-hidden bg-surface ${bare ? '' : 'rounded-lg border border-border'}`}
      >
        {loading ? (
          <div className="size-full animate-pulse bg-bg" aria-hidden="true" />
        ) : failed ? (
          <div
            role="img"
            aria-label={`${name}, profile photo placeholder`}
            className="flex size-full items-center justify-center bg-bg"
          >
            <span className="text-4xl font-medium tracking-wider text-muted">{initials}</span>
          </div>
        ) : (
          <img
            src={current}
            alt={alt || `Portrait of ${name}`}
            width={400}
            height={500}
            fetchPriority="high"
            decoding="async"
            onError={onError}
            className="size-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
