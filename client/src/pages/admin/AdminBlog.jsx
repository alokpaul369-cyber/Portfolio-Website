import { FileText, Plus } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTable, Badge, TableSkeleton, Td, Th } from '@/components/admin/AdminTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import RowActions from '@/components/admin/RowActions';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import Pagination from '@/components/ui/Pagination';
import useApiQuery from '@/hooks/useApiQuery';
import useDeleteConfirm from '@/hooks/useDeleteConfirm';
import useListParams from '@/hooks/useListParams';
import { formatDate } from '@/lib/format';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
];

/** Admin list of blog posts, including drafts, filterable by status. */
export default function AdminBlog() {
  const { get, page, update } = useListParams();
  const status = STATUS_TABS.some((tab) => tab.value === get('status')) ? get('status') : 'all';

  const {
    data: posts,
    pagination,
    isLoading,
    error,
    retry,
  } = useApiQuery('/blog', { status, page, limit: 20 });
  const deletion = useDeleteConfirm({
    path: (p) => `/blog/${p.id}`,
    label: 'Post',
    onDeleted: retry,
  });

  const newButton = (
    <Button size="sm" to="/admin/blog/new">
      <Plus className="size-4" aria-hidden="true" />
      New post
    </Button>
  );

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Drafts are only visible to you until published."
        actions={newButton}
      />

      <div
        role="tablist"
        aria-label="Filter posts by status"
        className="mb-5 flex gap-1 border-b border-border"
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => update({ status: tab.value === 'all' ? '' : tab.value })}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              status === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <LoadError message={error} onRetry={retry} />}
      {isLoading && <TableSkeleton />}
      {!isLoading && !error && posts.length === 0 && (
        <EmptyState
          Icon={FileText}
          title={status === 'draft' ? 'No drafts' : 'No posts yet'}
          action={newButton}
        />
      )}

      {!isLoading && !error && posts.length > 0 && (
        <AdminTable caption="Blog posts">
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Status</Th>
              <Th>Published</Th>
              <Th>Updated</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="last:[&>td]:border-b-0">
                <Td>
                  <span className="flex flex-col">
                    <span className="font-medium">{post.title}</span>
                    <span className="text-xs text-muted">{post.readingTime} min read</span>
                  </span>
                </Td>
                <Td>
                  {post.published ? <Badge tone="success">Published</Badge> : <Badge>Draft</Badge>}
                </Td>
                <Td className="text-muted">
                  {post.publishedAt ? formatDate(post.publishedAt) : '-'}
                </Td>
                <Td className="text-muted">{formatDate(post.updatedAt)}</Td>
                <Td>
                  <RowActions
                    name={post.title}
                    editTo={`/admin/blog/${post.id}`}
                    viewHref={post.published ? `/blog/${post.slug}` : undefined}
                    onDelete={() => deletion.request(post)}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <Pagination
        label="Post pages"
        pagination={pagination}
        onPageChange={(next) => update({ page: next })}
      />

      <ConfirmDialog
        open={Boolean(deletion.target)}
        title="Delete post?"
        description={`"${deletion.target?.title}" and its cover image will be permanently deleted. This cannot be undone.`}
        busy={deletion.busy}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </>
  );
}
