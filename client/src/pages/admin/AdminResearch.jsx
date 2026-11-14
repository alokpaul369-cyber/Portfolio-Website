import { FlaskConical, Plus } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTable, Badge, TableSkeleton, Td, Th } from '@/components/admin/AdminTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import RowActions from '@/components/admin/RowActions';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import { getResearchStatusLabel, getResearchTypeLabel } from '@/data/research';
import useApiQuery from '@/hooks/useApiQuery';
import useDeleteConfirm from '@/hooks/useDeleteConfirm';
import useSiteContent from '@/hooks/useSiteContent';
import { formatMonthYear } from '@/lib/format';

/** Admin list of research entries, including hidden drafts. */
export default function AdminResearch() {
  const { data: entries, isLoading, error, retry } = useApiQuery('/research');
  const { refresh } = useSiteContent();
  const deletion = useDeleteConfirm({
    path: (entry) => `/research/${entry.id}`,
    label: 'Research entry',
    // The public menu and sections depend on whether any entries remain.
    onDeleted: () => {
      retry();
      refresh();
    },
  });

  const newButton = (
    <Button size="sm" to="/admin/research/new">
      <Plus className="size-4" aria-hidden="true" />
      New entry
    </Button>
  );

  return (
    <>
      <AdminPageHeader
        title="Research"
        description="Papers, theses, posters and ongoing research. The Research page and menu link appear once an entry is visible."
        actions={newButton}
      />

      {error && <LoadError message={error} onRetry={retry} />}
      {isLoading && <TableSkeleton />}
      {!isLoading && !error && entries.length === 0 && (
        <EmptyState
          Icon={FlaskConical}
          title="No research entries yet"
          description="Add your first paper, thesis or ongoing project."
          action={newButton}
        />
      )}

      {!isLoading && !error && entries.length > 0 && (
        <AdminTable caption="Research entries">
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <Td>
                  <span className="flex flex-col gap-1">
                    <span className="font-medium">{entry.title}</span>
                    {(entry.featured || !entry.visible) && (
                      <span className="flex flex-wrap gap-1.5">
                        {entry.featured && <Badge tone="primary">Featured</Badge>}
                        {!entry.visible && <Badge>Hidden</Badge>}
                      </span>
                    )}
                  </span>
                </Td>
                <Td className="text-muted">{getResearchTypeLabel(entry.type)}</Td>
                <Td>
                  <Badge tone={entry.status === 'published' ? 'success' : 'neutral'}>
                    {getResearchStatusLabel(entry.status)}
                  </Badge>
                </Td>
                <Td className="text-muted">
                  {entry.date ? formatMonthYear(entry.date) : 'Not set'}
                </Td>
                <Td>
                  <RowActions
                    name={entry.title}
                    viewHref={entry.visible ? `/research/${entry.slug}` : undefined}
                    editTo={`/admin/research/${entry.id}`}
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
        title="Delete this research entry?"
        description={`"${deletion.target?.title ?? ''}" will be removed from the site. This cannot be undone.`}
        busy={deletion.busy}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </>
  );
}
