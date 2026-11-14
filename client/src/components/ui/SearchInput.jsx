import { useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

const DEFAULT_DELAY_MS = 300;

/**
 * Search field that reports its value after the visitor pauses typing.
 * Pressing Enter or clearing the field reports immediately.
 *
 * @param {object} props
 * @param {string} props.value             committed value (for example from the URL)
 * @param {(value: string) => void} props.onChange  receives the trimmed value
 * @param {string} props.label             accessible label
 * @param {string} [props.placeholder]
 * @param {number} [props.delay]           debounce delay in milliseconds
 */
export default function SearchInput({
  value,
  onChange,
  label,
  placeholder,
  delay = DEFAULT_DELAY_MS,
  className = '',
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  const timer = useRef();

  // When the committed value changes from outside (back button, "Clear filters"),
  // show it. Typing never triggers this because the committed value then matches.
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== draft.trim()) setDraft(value);
  }

  const commit = (next, immediate = false) => {
    clearTimeout(timer.current);
    if (immediate) onChange(next.trim());
    else timer.current = setTimeout(() => onChange(next.trim()), delay);
  };

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        commit(draft, true);
      }}
      className={`relative ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={draft}
        maxLength={100}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => {
          setDraft(event.target.value);
          commit(event.target.value);
        }}
        className="w-full rounded-md border border-border bg-surface py-2 pr-9 pl-9 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft('');
            commit('', true);
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted hover:text-text"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
