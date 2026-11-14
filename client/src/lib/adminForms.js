import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api';

/**
 * Shared helpers for admin forms.
 */

/**
 * Handles a failed save: server validation errors are placed on the matching
 * fields (when the field exists in the form), and a toast explains the result.
 *
 * @param {unknown} error              the Axios error
 * @param {Function} setError          react-hook-form setError
 * @param {string[]} fieldNames        fields present in the form
 */
export function handleSaveError(error, setError, fieldNames) {
  const details = error?.response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    let placed = 0;
    details.forEach(({ field, message }) => {
      const name = field?.split('.')[0];
      if (fieldNames.includes(name)) {
        setError(name, { message });
        placed += 1;
      }
    });
    toast.error(placed > 0 ? 'Please correct the highlighted fields.' : details[0].message);
    return;
  }
  toast.error(getErrorMessage(error));
}

/** Converts an ISO date to the "YYYY-MM-DD" value of a date input. */
export function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

/** Splits a textarea into non-empty trimmed lines. */
export function linesToList(text) {
  return String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
