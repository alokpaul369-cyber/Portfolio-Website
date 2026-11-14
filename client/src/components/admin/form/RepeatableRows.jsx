import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

const iconButton =
  'inline-flex size-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:text-text disabled:pointer-events-none disabled:opacity-40';

/**
 * A list of form rows the admin can add to, remove from and reorder.
 * Designed for react-hook-form's `useFieldArray`: pass its `fields` and wire
 * `onAdd`, `onRemove` and `onMove` to `append`, `remove` and `move`.
 *
 * @param {object} props
 * @param {string} props.itemLabel       singular name used in button labels, e.g. "paragraph"
 * @param {Array<{ id: string }>} props.fields
 * @param {number} props.max             the Add button is disabled at this many rows
 * @param {number} [props.min=0]         Remove is disabled at this many rows
 * @param {() => void} props.onAdd
 * @param {(index: number) => void} props.onRemove
 * @param {(from: number, to: number) => void} props.onMove
 * @param {(index: number) => React.ReactNode} props.renderRow
 * @param {string} [props.error]         message for the list as a whole
 */
export default function RepeatableRows({
  itemLabel,
  fields,
  max,
  min = 0,
  onAdd,
  onRemove,
  onMove,
  renderRow,
  error,
}) {
  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && <p className="text-sm text-muted">None added.</p>}

      <ol className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <li key={field.id} className="flex items-start gap-3">
            <div className="min-w-0 flex-1">{renderRow(index)}</div>
            <div className="flex shrink-0 gap-1 pt-7">
              <button
                type="button"
                onClick={() => onMove(index, index - 1)}
                disabled={index === 0}
                aria-label={`Move ${itemLabel} ${index + 1} up`}
                className={iconButton}
              >
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onMove(index, index + 1)}
                disabled={index === fields.length - 1}
                aria-label={`Move ${itemLabel} ${index + 1} down`}
                className={iconButton}
              >
                <ArrowDown className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={fields.length <= min}
                aria-label={`Remove ${itemLabel} ${index + 1}`}
                className={`${iconButton} hover:text-danger`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={fields.length >= max}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add {itemLabel}
        </button>
        <span className="text-xs text-muted">
          {fields.length} of {max}
        </span>
      </div>
    </div>
  );
}
