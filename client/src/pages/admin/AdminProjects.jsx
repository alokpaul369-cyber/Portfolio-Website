import { FolderKanban, Plus } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTable, Badge, TableSkeleton, Td, Th } from '@/components/admin/AdminTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import RowActions from '@/components/admin/RowActions';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import { getProjectCategory } from '@/data/projects';
import useApiQuery from '@/hooks/useApiQuery';
import useDeleteConfirm from '@/hooks/useDeleteConfirm';
import { formatDate } from '@/lib/format';

/** Admin list of projects in display order. */
export default function AdminProjects() {
  const {
    data: projects,
    isLoading,
    error,
    retry,
  } = useApiQuery('/projects', { limit: 50, sort: 'order' });
  const deletion = useDeleteConfirm({
    path: (p) => `/projects/${p.id}`,
    label: 'Project',
    onDeleted: retry,
  });

  const newButton = (
    <Button size="sm" to="/admin/projects/new">
      <Plus className="size-4" aria-hidden="true" />
      New project
    </Button>
  );

  return (
    <>
      <AdminPageHeader
        title="Projects"
        description="Featured projects appear first on the site, then by display order."
        actions={newButton}
      />

      {error && <LoadError message={error} onRetry={retry} />}
      {isLoading && <TableSkeleton />}
      {!isLoading && !error && projects.length === 0 && (
        <EmptyState
          Icon={FolderKanban}
          title="No projects yet"
          description="Add your first project to show it on the site."
          action={newButton}
        />
      )}

      {!isLoading && !error && projects.length > 0 && (
        <AdminTable caption="Projects">
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Order</Th>
              <Th>Updated</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="last:[&>td]:border-b-0">
                <Td>
                  <div className="flex items-center gap-3">
                    {project.images?.[0]?.url ? (
                      <img
                        src={project.images[0].url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-9 w-14 shrink-0 rounded border border-border object-cover"
                      />
                    ) : (
                      <span
                        className="h-9 w-14 shrink-0 rounded border border-border bg-bg"
                        aria-hidden="true"
                      />
                    )}
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">{project.title}</span>
                      {project.featured && <Badge tone="primary">Featured</Badge>}
                    </span>
                  </div>
                </Td>
                <Td className="text-muted">{getProjectCategory(project.category).label}</Td>
                <Td className="text-xs text-muted">{project.order}</Td>
                <Td className="text-muted">{formatDate(project.updatedAt)}</Td>
                <Td>
                  <RowActions
                    name={project.title}
                    editTo={`/admin/projects/${project.id}`}
                    viewHref={`/projects/${project.slug}`}
                    onDelete={() => deletion.request(project)}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <ConfirmDialog
        open={Boolean(deletion.target)}
        title="Delete project?"
        description={`"${deletion.target?.title}" and its images will be permanently deleted. This cannot be undone.`}
        busy={deletion.busy}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </>
  );
}
