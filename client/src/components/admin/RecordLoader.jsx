import { Loader2 } from 'lucide-react';
import LoadError from '@/components/ui/LoadError';
import useApiQuery from '@/hooks/useApiQuery';
import EmptyState from './EmptyState';

/**
 * Loads one record for an edit form and renders `children(record)` once ready.
 * Shows a spinner while loading, a not-found message for 404 and a retry
 * option for other errors.
 *
 * @param {{ path: string, label: string, children: (record: object) => React.ReactNode }} props
 */
export default function RecordLoader({ path, label, children }) {
  const { data, isLoading, error, errorStatus, retry } = useApiQuery(path);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16" role="status">
        <Loader2 className="size-5 animate-spin text-muted" aria-hidden="true" />
        <span className="sr-only">Loading {label}</span>
      </div>
    );
  }
  if (errorStatus === 404) {
    return <EmptyState title={`${label} not found`} description="It may have been deleted." />;
  }
  if (error) {
    return <LoadError message={error} onRetry={retry} />;
  }
  return children(data);
}
