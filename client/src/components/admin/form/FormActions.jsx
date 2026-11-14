import { Loader2, Save } from 'lucide-react';
import Button from '@/components/ui/Button';

/** Save and Cancel buttons at the bottom of an admin form. */
export default function FormActions({ cancelTo, isSubmitting, submitLabel = 'Save' }) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button size="sm" variant="outline" to={cancelTo}>
        Cancel
      </Button>
      <Button size="sm" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="size-4" aria-hidden="true" />
        )}
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
}
