import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Modal confirmation for destructive actions, built on the native <dialog>
 * element (focus trapping, Escape to close and backdrop come from the browser).
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} [props.confirmLabel='Delete']
 * @param {boolean} [props.busy]      disables the buttons while the action runs
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-surface p-0 text-text shadow-xl backdrop:bg-black/50"
    >
      {/* Content renders only while open, so stale or empty text never reaches assistive technology. */}
      {open && (
        <>
          <div className="flex flex-col gap-3 p-6">
            <h2 id="confirm-title" className="text-lg font-semibold">
              {title}
            </h2>
            <p id="confirm-description" className="text-sm leading-relaxed text-muted">
              {description}
            </p>
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-bg disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md bg-danger px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-danger/90 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {confirmLabel}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
