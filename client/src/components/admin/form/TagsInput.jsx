import { useState } from 'react';
import { X } from 'lucide-react';
import { FieldShell } from './fields';

/**
 * Editable list of short values (tech stack, tags).
 * Type a value and press Enter or comma to add it; Backspace on an empty
 * field removes the last one. Duplicates (case-insensitive) are ignored.
 *
 * @param {object} props
 * @param {string[]} props.value
 * @param {(next: string[]) => void} props.onChange
 * @param {number} [props.max]
 * @param {boolean} [props.lowercase]  store values in lowercase (tags)
 */
export default function TagsInput({
  label,
  hint,
  error,
  value = [],
  onChange,
  max = 20,
  lowercase = false,
  placeholder,
}) {
  const [draft, setDraft] = useState('');

  const add = (raw) => {
    const item = (lowercase ? raw.toLowerCase() : raw).trim().replace(/,+$/, '');
    if (!item || value.length >= max) return;
    if (value.some((existing) => existing.toLowerCase() === item.toLowerCase())) return;
    onChange([...value, item]);
  };

  const remove = (index) => onChange(value.filter((_, i) => i !== index));

  return (
    <FieldShell
      label={label}
      hint={hint ?? `Press Enter or comma to add. Up to ${max}.`}
      error={error}
    >
      {({ id, describedBy, invalid }) => (
        <div
          className={`flex flex-wrap items-center gap-1.5 rounded-md border bg-bg px-2 py-1.5 transition-colors focus-within:border-primary ${
            invalid ? 'border-danger/70' : 'border-border'
          }`}
        >
          {value.map((item, index) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded border border-border bg-surface py-0.5 pr-1 pl-2 text-xs"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove ${item}`}
                className="inline-flex size-4 items-center justify-center rounded text-muted hover:text-text"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            id={id}
            value={draft}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={value.length >= max}
            onChange={(event) => {
              const next = event.target.value;
              if (next.endsWith(',')) {
                add(next);
                setDraft('');
              } else {
                setDraft(next);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                add(draft);
                setDraft('');
              } else if (event.key === 'Backspace' && !draft && value.length > 0) {
                remove(value.length - 1);
              }
            }}
            onBlur={() => {
              if (draft.trim()) {
                add(draft);
                setDraft('');
              }
            }}
            className="min-w-32 flex-1 bg-transparent py-1 text-sm text-text placeholder:text-muted/70 focus:outline-none"
          />
        </div>
      )}
    </FieldShell>
  );
}
