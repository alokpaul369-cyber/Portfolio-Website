import { Award, Plus } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTable, Badge, TableSkeleton, Td, Th } from '@/components/admin/AdminTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import RowActions from '@/components/admin/RowActions';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import useApiQuery from '@/hooks/useApiQuery';
import useDeleteConfirm from '@/hooks/useDeleteConfirm';
import useSiteContent from '@/hooks/useSiteContent';
import { isExpired } from '@/lib/certifications';
import { formatMonthYear } from '@/lib/format';

/** Admin list of certifications, newest issue date first. */
export default function AdminCertifications() {
  const { data: entries, isLoading, error, retry } = useApiQuery('/certifications');
  const { refresh } = useSiteContent();
  const deletion = useDeleteConfirm({
    path: (entry) => `/certifications/${entry.id}`,
    label: 'Certification',
    // The public menu and sections depend on whether any entries remain.
    onDeleted: () => {
      retry();
      refresh();
    },
  });

  const newButton = (
    <Button size="sm" to="/admin/certifications/new">
      <Plus className="size-4" aria-hidden="true" />
      New certification
    </Button>
  );

  return (
    <>
      <AdminPageHeader
        title="Certifications"
        description="Certificates, courses and achievements. They appear on the Experience page once you add one."
        actions={newButton}
      />

      {error && <LoadError message={error} onRetry={retry} />}
      {isLoading && <TableSkeleton />}
      {!isLoading && !error && entries.length === 0 && (
        <EmptyState
          Icon={Award}
          title="No certifications yet"
          description="Add a certificate or completed course."
          action={newButton}
        />
      )}

      {!isLoading && !error && entries.length > 0 && (
        <AdminTable caption="Certifications">
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Issued</Th>
              <Th>Expires</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <Td>
                  <span className="flex flex-col">
                    <span className="font-medium">{entry.title}</span>
                    <span className="text-xs text-muted">{entry.issuer}</span>
                  </span>
                </Td>
                <Td className="text-muted">{formatMonthYear(entry.issueDate)}</Td>
                <Td className="text-muted">
                  {entry.expiryDate ? (
                    <span className="flex flex-wrap items-center gap-2">
                      {formatMonthYear(entry.expiryDate)}
                      {isExpired(entry) && <Badge>Expired</Badge>}
                    </span>
                  ) : (
                    'No expiry'
                  )}
                </Td>
                <Td>
                  <RowActions
                    name={entry.title}
                    editTo={`/admin/certifications/${entry.id}`}
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
        title="Delete certification?"
        description={`"${deletion.target?.title ?? ''}" will be permanently deleted, along with its image.`}
        busy={deletion.busy}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </>
  );
}
