import { Briefcase, Plus } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTable, Badge, TableSkeleton, Td, Th } from '@/components/admin/AdminTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import RowActions from '@/components/admin/RowActions';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import useApiQuery from '@/hooks/useApiQuery';
import useDeleteConfirm from '@/hooks/useDeleteConfirm';
import { formatDateRange } from '@/lib/format';

/** Admin list of work and education entries, current first. */
export default function AdminExperience() {
  const { data: entries, isLoading, error, retry } = useApiQuery('/experience');
  const deletion = useDeleteConfirm({
    path: (e) => `/experience/${e.id}`,
    label: 'Entry',
    onDeleted: retry,
  });

  const newButton = (
    <Button size="sm" to="/admin/experience/new">
      <Plus className="size-4" aria-hidden="true" />
      New entry
    </Button>
  );

  return (
    <>
      <AdminPageHeader
        title="Experience"
        description="Work experience and education shown on the Experience page."
        actions={newButton}
      />

      {error && <LoadError message={error} onRetry={retry} />}
      {isLoading && <TableSkeleton />}
      {!isLoading && !error && entries.length === 0 && (
        <EmptyState Icon={Briefcase} title="No entries yet" action={newButton} />
      )}

      {!isLoading && !error && entries.length > 0 && (
        <AdminTable caption="Experience and education">
          <thead>
            <tr>
              <Th>Role or degree</Th>
              <Th>Type</Th>
              <Th>Dates</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="last:[&>td]:border-b-0">
                <Td>
                  <span className="flex flex-col">
                    <span className="font-medium">{entry.role}</span>
                    {entry.company && <span className="text-xs text-muted">{entry.company}</span>}
                  </span>
                </Td>
                <Td>
                  <Badge tone={entry.type === 'work' ? 'primary' : 'neutral'}>
                    {entry.type === 'work' ? 'Work' : 'Education'}
                  </Badge>
                </Td>
                <Td className="text-muted">
                  {formatDateRange(entry.startDate, entry.endDate, { current: entry.current })}
                </Td>
                <Td>
                  <RowActions
                    name={entry.role}
                    editTo={`/admin/experience/${entry.id}`}
                    onDelete={() => deletion.request(entry)}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <ConfirmDialog
        open={Boolean(deletion.target)}
        title="Delete entry?"
        description={`"${deletion.target?.role}"${deletion.target?.company ? ` at ${deletion.target.company}` : ''} will be permanently deleted.`}
        busy={deletion.busy}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </>
  );
}
