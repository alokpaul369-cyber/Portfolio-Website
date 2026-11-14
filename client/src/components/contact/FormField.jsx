import { useId } from 'react';

const controlClass =
  'w-full rounded-md border bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-muted/70 transition-colors focus:outline-none disabled:opacity-60';

/**
 * Labelled input or textarea with an accessible error message.
 * Pass the react-hook-form `register(...)` result as `registration`.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {object} props.registration  result of register('field')
 * @param {string} [props.error]       validation message
 * @param {boolean} [props.multiline]  render a textarea
 * @param {React.ReactNode} [props.hint] text shown on the right of the label row
 */
export default function FormField({
  label,
  registration,
  error,
  multiline = false,
  hint,
  ...props
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const Control = multiline ? 'textarea' : 'input';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint}
      </div>
      <Control
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`${controlClass} ${
          error ? 'border-danger/70 focus:border-danger' : 'border-border focus:border-primary'
        } ${multiline ? 'min-h-36 resize-y' : ''}`}
        {...registration}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
