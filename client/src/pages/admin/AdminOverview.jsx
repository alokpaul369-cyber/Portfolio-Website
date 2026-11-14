import { createElement } from 'react';
import { Link } from 'react-router';
import {
  Award,
  BarChart3,
  Briefcase,
  FileText,
  FlaskConical,
  FolderKanban,
  Inbox,
  Plus,
  Wrench,
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import useApiQuery from '@/hooks/useApiQuery';
import useAuth from '@/hooks/useAuth';
import { formatRelative } from '@/lib/format';

/** One statistic card linking to its management page. */
function StatCard({ to, Icon, label, value, detail }) {
  return (
    <Link
      to={to}
      className="card-hover flex flex-col gap-3 rounded-xl border border-border bg-surface p-6"
    >
      <span className="eyebrow flex items-center justify-between text-muted">
        {label}
        {createElement(Icon, { className: 'size-4', strokeWidth: 1.75, 'aria-hidden': true })}
      </span>
      <span className="text-4xl font-bold tracking-tight tabular-nums">{value}</span>
      {detail && <span className="text-xs text-muted">{detail}</span>}
    </Link>
  );
}

/** Dashboard home: content counts, recent messages and quick actions. */
export default function AdminOverview() {
  const { admin } = useAuth();
  const { data, isLoading, error, retry } = useApiQuery('/admin/stats');
  const counts = data?.counts;

  const cards = counts
    ? [
        {
          to: '/admin/projects',
          Icon: FolderKanban,
          label: 'Projects',
          value: counts.projects,
          detail: `${counts.featuredProjects} featured`,
        },
        { to: '/admin/skills', Icon: Wrench, label: 'Skills', value: counts.skills },
        {
          to: '/admin/experience',
          Icon: Briefcase,
          label: 'Experience entries',
          value: counts.experience,
        },
        {
          to: '/admin/research',
          Icon: FlaskConical,
          label: 'Research entries',
          value: counts.research ?? 0,
          detail: `${counts.hiddenResearch ?? 0} hidden`,
        },
        {
          to: '/admin/certifications',
          Icon: Award,
          label: 'Certifications',
          value: counts.certifications ?? 0,
        },
        {
          to: '/admin/blog',
          Icon: FileText,
          label: 'Blog posts',
          value: counts.publishedPosts + counts.draftPosts,
          detail: `${counts.publishedPosts} published, ${counts.draftPosts} drafts`,
        },
        {
          to: '/admin/analytics',
          Icon: BarChart3,
          label: 'Page views, 7 days',
          value: counts.viewsLast7Days ?? 0,
        },
        {
          to: '/admin/messages',
          Icon: Inbox,
          label: 'Messages',
          value: counts.messages,
          detail: `${counts.unreadMessages} unread`,
        },
      ]
    : [];

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description={admin?.email ? `Signed in as ${admin.email}` : undefined}
        actions={
          <>
            <Button size="sm" variant="outline" to="/admin/blog/new">
              <Plus className="size-4" aria-hidden="true" />
              New post
            </Button>
            <Button size="sm" to="/admin/projects/new">
              <Plus className="size-4" aria-hidden="true" />
              New project
            </Button>
          </>
        }
      />

      {error ? (
        <LoadError message={error} onRetry={retry} />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className="h-[140px] animate-pulse rounded-xl border border-border bg-surface"
                  />
                ))
              : cards.map((card) => <StatCard key={card.label} {...card} />)}
          </div>

          <section className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-bold tracking-tight">Recent messages</h2>
              <Link to="/admin/messages" className="text-sm text-primary hover:underline">
                Open inbox
              </Link>
            </div>
            {isLoading ? (
              <div className="h-32 animate-pulse" />
            ) : data.recentMessages.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">No messages yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentMessages.map((message) => (
                  <li key={message.id}>
                    <Link
                      to={`/admin/messages?open=${message.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-bg"
                    >
                      <span
                        className={`size-2 shrink-0 rounded-full ${message.read ? 'bg-transparent' : 'bg-primary'}`}
                        aria-label={message.read ? undefined : 'Unread'}
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={`truncate text-sm ${message.read ? '' : 'font-semibold'}`}>
                          {message.subject}
                        </span>
                        <span className="truncate text-xs text-muted">
                          {message.name} &middot; {message.email}
                        </span>
                      </span>
                      <time className="shrink-0 text-xs text-muted" dateTime={message.createdAt}>
                        {formatRelative(message.createdAt)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
