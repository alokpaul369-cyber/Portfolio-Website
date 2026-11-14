import { RotateCw } from 'lucide-react';
import { cardBg } from '@/lib/tone';

/**
 * Inline error message with a retry button, for sections that load data.
 * `tone` is the background band it sits on, so the card stays distinct from it.
 */
export default function LoadError({ message, onRetry, tone = 'bg' }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-start gap-3 rounded-xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between ${cardBg(tone)}`}
    >
      <p className="text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
      >
        <RotateCw className="size-3.5" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
