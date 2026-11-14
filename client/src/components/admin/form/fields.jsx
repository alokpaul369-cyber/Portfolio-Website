import { useId } from 'react';

/**
 * Form controls for the admin area. Each pairs a label, the control, an
 * optional hint and an accessible error message. Pass react-hook-form
 * `register(...)` results through `registration`.
 */

const controlBase =
  'w-full rounded-md border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted/70 transition-colors focus:outline-none disabled:opacity-60';

function borderFor(error) {
  return error ? 'border-danger/70 focus:border-danger' : 'border-border focus:border-primary';
}

/** Label, hint and error around any control. `children` receives the ids to wire up. */
export function FieldShell({ label, hint, error, required, className = '', children }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, hint, error, required, registration, className, ...props }) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          aria-required={required}
          className={`${controlBase} ${borderFor(error)}`}
          {...registration}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  registration,
  className,
  rows = 4,
  ...props
}) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          aria-required={required}
          className={`${controlBase} ${borderFor(error)} resize-y leading-relaxed`}
          {...registration}
          {...props}
        />
      )}
    </FieldShell>
  );
}

/** @param {{ options: Array<{ value: string, label: string }> }} props */
export function SelectField({
  label,
  hint,
  error,
  required,
  registration,
  options,
  className,
  ...props
}) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={`${controlBase} ${borderFor(error)}`}
          {...registration}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function CheckboxField({ label, hint, registration, className = '', ...props }) {
  const id = useId();
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 rounded border-border accent-primary"
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...registration}
        {...props}
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/** Titled group of fields inside a form. */
export function FormSection({ title, description, children }) {
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {description && <p className="text-xs text-muted">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
