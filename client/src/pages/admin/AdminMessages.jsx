import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, Inbox, Loader2, Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { TableSkeleton } from '@/components/admin/AdminTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import Pagination from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';
import useApiQuery from '@/hooks/useApiQuery';
import useDeleteConfirm from '@/hooks/useDeleteConfirm';
import useListParams from '@/hooks/useListParams';
import api, { getErrorMessage } from '@/lib/api';
import { notifyMessagesChanged } from '@/lib/adminEvents';
import { formatRelative } from '@/lib/format';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

/**
 * Downloads the messages matching the current filter and search as a CSV file.
 * The request carries the admin session, so the file is fetched and saved
 * from memory rather than opened as a plain link.
 */
async function downloadCsv({ status, search }) {
  const params = {};
  if (status !== 'all') params.status = status;
  if (search) params.search = search;
  const response = await api.get('/messages/export', {
    params,
    responseType: 'blob',
    timeout: 60000,
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Small outlined toolbar button for the selection actions. */
function ToolbarButton({ onClick, disabled, danger = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
        danger ? 'hover:border-danger hover:text-danger' : 'hover:border-primary hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

const fullDate = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });

/** Full view of one message with its actions. */
function MessageDetail({ message, onToggleRead, onDelete, onBack }) {
  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;
  const actionClass =
    'inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors';

  return (
    <article
      className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5 sm:p-6"
      aria-label="Message"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted hover:text-primary lg:hidden"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to inbox
      </button>

      <header className="flex flex-col gap-2 border-b border-border pb-5">
        <h2 className="text-lg font-semibold tracking-tight">{message.subject}</h2>
        <p className="text-sm">
          <span className="font-medium">{message.name}</span>{' '}
          <a href={`mailto:${message.email}`} className="text-muted hover:text-primary">
            &lt;{message.email}&gt;
          </a>
        </p>
        <time className="text-xs text-muted" dateTime={message.createdAt}>
          {fullDate.format(new Date(message.createdAt))}
        </time>
      </header>

      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>

      <div className="flex flex-wrap gap-2 border-t border-border pt-5">
        <a href={replyHref} className={`${actionClass} bg-primary text-bg hover:bg-primary/90`}>
          <Reply className="size-4" aria-hidden="true" />
          Reply by email
        </a>
        <button type="button" onClick={onToggleRead} className={`${actionClass} hover:bg-bg`}>
          {message.read ? (
            <Mail className="size-4" aria-hidden="true" />
          ) : (
            <MailOpen className="size-4" aria-hidden="true" />
          )}
          Mark as {message.read ? 'unread' : 'read'}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className={`${actionClass} ml-auto hover:border-danger/50 hover:text-danger`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  );
}

/**
 * Contact message inbox: filter, search, read a message (marks it read),
 * mark unread, reply by email and delete; select several messages to mark or
 * delete them together; export the current view as a CSV file.
 * Changes are applied locally right away and the sidebar badge is refreshed.
 */
export default function AdminMessages() {
  const { get, page, update } = useListParams();
  const status = FILTERS.some((f) => f.value === get('status')) ? get('status') : 'all';
  const search = get('q');
  const openId = get('open');

  const params = { status, page, limit: 20 };
  if (search) params.search = search;
  const { data, pagination, isLoading, error, retry } = useApiQuery('/messages', params);

  // Local changes applied on top of the loaded page, so the list does not reload after each action.
  const [readOverrides, setReadOverrides] = useState({});
  const [deletedIds, setDeletedIds] = useState(() => new Set());
  // Messages ticked for a bulk action, by id. Cleared whenever the list changes.
  const [selected, setSelected] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [exporting, setExporting] = useState(false);

  const messages = useMemo(
    () =>
      (data ?? [])
        .filter((m) => !deletedIds.has(m.id))
        .map((m) => (m.id in readOverrides ? { ...m, read: readOverrides[m.id] } : m)),
    [data, readOverrides, deletedIds],
  );
  const openMessage = messages.find((m) => m.id === openId);

  const setRead = async (message, read) => {
    setReadOverrides((current) => ({ ...current, [message.id]: read }));
    try {
      await api.patch(`/messages/${message.id}`, { read });
      notifyMessagesChanged();
    } catch (error) {
      setReadOverrides((current) => ({ ...current, [message.id]: message.read }));
      toast.error(getErrorMessage(error));
    }
  };

  // Opening an unread message marks it as read. The local state updates once
  // the server confirms, so the effect itself never sets state synchronously.
  const openUnreadId = openMessage && !openMessage.read ? openMessage.id : null;
  useEffect(() => {
    if (!openUnreadId) return undefined;
    let cancelled = false;
    api
      .patch(`/messages/${openUnreadId}`, { read: true })
      .then(() => {
        if (cancelled) return;
        setReadOverrides((current) => ({ ...current, [openUnreadId]: true }));
        notifyMessagesChanged();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [openUnreadId]);

  const deletion = useDeleteConfirm({
    path: (m) => `/messages/${m.id}`,
    label: 'Message',
    onDeleted: () => {
      setDeletedIds((current) => new Set(current).add(deletion.target.id));
      update({ open: '' });
      notifyMessagesChanged();
    },
  });

  // Filter, search or page changes load fresh data, so local changes reset.
  const resetLocal = () => {
    setReadOverrides({});
    setDeletedIds(new Set());
    setSelected(new Set());
  };

  // Only messages still on this page count as selected.
  const selectedIds = messages.filter((m) => selected.has(m.id)).map((m) => m.id);
  const allSelected = messages.length > 0 && selectedIds.length === messages.length;

  const toggleSelected = (id) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(messages.map((m) => m.id)));

  /** Marks the selected messages read or unread, or deletes them. */
  const runBulk = async (action) => {
    const ids = selectedIds;
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      await api.post('/messages/bulk', { ids, action });
      if (action === 'delete') {
        // Reload rather than hide: messages from later pages move up and the counts change.
        resetLocal();
        retry();
        if (ids.includes(openId)) update({ open: '' });
      } else {
        setReadOverrides((current) => ({
          ...current,
          ...Object.fromEntries(ids.map((id) => [id, action === 'read'])),
        }));
      }
      setSelected(new Set());
      notifyMessagesChanged();
      const count = `${ids.length} message${ids.length === 1 ? '' : 's'}`;
      toast.success(action === 'delete' ? `${count} deleted.` : `${count} marked as ${action}.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBulkBusy(false);
      setConfirmBulkDelete(false);
    }
  };

  const onExport = async () => {
    setExporting(true);
    try {
      await downloadCsv({ status, search });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description="Messages sent through the contact form."
        actions={
          <Button size="sm" variant="outline" onClick={onExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filter messages" className="flex gap-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={status === filter.value}
              onClick={() => {
                resetLocal();
                update({ status: filter.value === 'all' ? '' : filter.value, open: '' });
              }}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                status === filter.value
                  ? 'border-primary bg-primary text-bg'
                  : 'border-border text-muted hover:text-text'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <SearchInput
          value={search}
          onChange={(term) => {
            resetLocal();
            update({ q: term, open: '' });
          }}
          label="Search messages"
          placeholder="Search name, email or text"
          className="w-full sm:w-72"
        />
      </div>

      {error && <LoadError message={error} onRetry={retry} />}
      {isLoading && <TableSkeleton rows={5} />}
      {!isLoading && !error && messages.length === 0 && (
        <EmptyState
          Icon={Inbox}
          title={search || status !== 'all' ? 'No matching messages' : 'Inbox is empty'}
          description={
            search || status !== 'all'
              ? undefined
              : 'Messages from the contact form will appear here.'
          }
        />
      )}

      {!isLoading && !error && messages.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div
            className={`flex flex-col self-start overflow-hidden rounded-xl border border-border bg-surface ${openMessage ? 'hidden lg:flex' : ''}`}
          >
            {/* Selection: select all on this page, and the actions for the selected messages. */}
            <div className="flex min-h-12 flex-wrap items-center gap-3 border-b border-border bg-bg px-4 py-2">
              <label className="inline-flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = selectedIds.length > 0 && !allSelected;
                  }}
                  onChange={toggleAll}
                  className="size-4 rounded border-border accent-primary"
                />
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected`
                  : 'Select all on this page'}
              </label>
              {selectedIds.length > 0 && (
                <div
                  role="toolbar"
                  aria-label="Selected messages"
                  className="ml-auto flex flex-wrap gap-2"
                >
                  <ToolbarButton onClick={() => runBulk('read')} disabled={bulkBusy}>
                    <MailOpen className="size-3.5" aria-hidden="true" />
                    Mark read
                  </ToolbarButton>
                  <ToolbarButton onClick={() => runBulk('unread')} disabled={bulkBusy}>
                    <Mail className="size-3.5" aria-hidden="true" />
                    Mark unread
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => setConfirmBulkDelete(true)}
                    disabled={bulkBusy}
                    danger
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Delete
                  </ToolbarButton>
                </div>
              )}
            </div>
            <ul aria-label="Messages" className="divide-y divide-border">
              {messages.map((message) => {
                const active = message.id === openId;
                return (
                  <li key={message.id} className="flex items-start">
                    <label className="flex shrink-0 cursor-pointer items-center self-stretch pl-4">
                      <input
                        type="checkbox"
                        checked={selected.has(message.id)}
                        onChange={() => toggleSelected(message.id)}
                        className="size-4 rounded border-border accent-primary"
                      />
                      <span className="sr-only">
                        Select the message from {message.name}: {message.subject}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => update({ open: message.id, page: page > 1 ? page : '' })}
                      aria-current={active ? 'true' : undefined}
                      className={`flex min-w-0 flex-1 items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                        active ? 'bg-primary/10' : 'hover:bg-bg'
                      }`}
                    >
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${message.read ? '' : 'bg-primary'}`}
                        aria-hidden="true"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={`truncate text-sm ${message.read ? '' : 'font-semibold'}`}
                          >
                            {message.name}
                          </span>
                          <time
                            className="shrink-0 text-[11px] text-muted"
                            dateTime={message.createdAt}
                          >
                            {formatRelative(message.createdAt)}
                          </time>
                        </span>
                        <span className={`truncate text-sm ${message.read ? 'text-muted' : ''}`}>
                          {message.subject}
                        </span>
                        <span className="truncate text-xs text-muted">{message.message}</span>
                        {!message.read && <span className="sr-only">Unread</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={openMessage ? '' : 'hidden lg:block'}>
            {openMessage ? (
              <MessageDetail
                message={openMessage}
                onToggleRead={() => setRead(openMessage, !openMessage.read)}
                onDelete={() => deletion.request(openMessage)}
                onBack={() => update({ open: '' })}
              />
            ) : (
              <div className="flex h-full min-h-60 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
                Select a message to read it.
              </div>
            )}
          </div>
        </div>
      )}

      <Pagination
        label="Message pages"
        pagination={pagination}
        onPageChange={(next) => {
          resetLocal();
          update({ page: next, open: '' });
        }}
      />

      <ConfirmDialog
        open={Boolean(deletion.target)}
        title="Delete message?"
        description={`The message from ${deletion.target?.name} will be permanently deleted. This cannot be undone.`}
        busy={deletion.busy}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${selectedIds.length} message${selectedIds.length === 1 ? '' : 's'}?`}
        description={`The selected ${selectedIds.length === 1 ? 'message' : 'messages'} will be permanently deleted. This cannot be undone.`}
        busy={bulkBusy}
        onConfirm={() => runBulk('delete')}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </>
  );
}
