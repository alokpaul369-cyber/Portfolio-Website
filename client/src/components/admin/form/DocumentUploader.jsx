import { useId, useRef, useState } from 'react';
import { ExternalLink, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import api, { getErrorMessage } from '@/lib/api';

const MAX_SIZE_MB = 5;

/**
 * Upload control for a single PDF (the CV).
 *
 * The file is uploaded as soon as it is chosen; the parent form stores the
 * returned { url, publicId, filename } and saves it with the rest of the form.
 * Pass a `useUploadSession()` as `session` so a file that is uploaded but never
 * saved is deleted again.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {{ url: string, filename: string, publicId?: string } | null} props.value
 * @param {(value: object | null) => void} props.onChange
 * @param {{ track: Function, discard: Function }} [props.session]
 * @param {string} [props.hint]
 */
export default function DocumentUploader({ label, value, onChange, session, hint }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const onSelect = async (event) => {
    const file = event.target.files?.[0];
    // Reset the input so choosing the same file again fires a change event.
    event.target.value = '';
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`The file must be ${MAX_SIZE_MB} MB or smaller.`);
      return;
    }

    const form = new FormData();
    form.append('file', file);
    setBusy(true);
    try {
      const { data } = await api.post('/uploads/document', form, { timeout: 60000 });
      session?.track(data.data.publicId);
      // A file uploaded earlier in this session and now replaced is no longer needed.
      if (value?.publicId) session?.discard(value.publicId);
      onChange(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const onRemove = () => {
    if (value?.publicId) session?.discard(value.publicId);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>

      {value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-bg px-3 py-2.5">
          <FileText className="size-4 shrink-0 text-muted" strokeWidth={1.75} aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-sm">{value.filename}</span>
          <a
            href={value.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{value.filename} in a new tab</span>
          </a>
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-danger hover:underline disabled:opacity-60"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted">
          No file uploaded.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="application/pdf"
          onChange={onSelect}
          disabled={busy}
          className="peer sr-only"
          aria-describedby={hint ? `${inputId}-hint` : undefined}
        />
        <label
          htmlFor={inputId}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary hover:border-primary hover:text-primary ${
            busy ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="size-4" aria-hidden="true" />
          )}
          {busy ? 'Uploading...' : value ? 'Replace file' : 'Upload PDF'}
        </label>
        {hint && (
          <p id={`${inputId}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
