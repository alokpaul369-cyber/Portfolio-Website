import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import {
  Award,
  BarChart3,
  Briefcase,
  FileText,
  FlaskConical,
  FolderKanban,
  Globe,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import useApiQuery from '@/hooks/useApiQuery';
import useAuth from '@/hooks/useAuth';
import { MESSAGES_CHANGED } from '@/lib/adminEvents';

const navItems = [
  { to: '/admin', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', Icon: FolderKanban },
  { to: '/admin/skills', label: 'Skills', Icon: Wrench },
  { to: '/admin/experience', label: 'Experience', Icon: Briefcase },
  { to: '/admin/research', label: 'Research', Icon: FlaskConical },
  { to: '/admin/certifications', label: 'Certifications', Icon: Award },
  { to: '/admin/blog', label: 'Blog', Icon: FileText },
  { to: '/admin/messages', label: 'Messages', Icon: Inbox, badge: 'unread' },
  { to: '/admin/analytics', label: 'Analytics', Icon: BarChart3 },
  { to: '/admin/profile', label: 'Profile', Icon: UserRound },
  { to: '/admin/content', label: 'Site content', Icon: PenLine },
  { to: '/admin/account', label: 'Account', Icon: ShieldCheck },
];

function navLinkClass({ isActive }) {
  // The active item is tinted and marked with an accent bar on its left edge.
  return `relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary/10 font-semibold text-primary before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-primary'
      : 'text-muted hover:bg-bg hover:text-text'
  }`;
}

/** Sidebar contents, shared by the desktop sidebar and the mobile drawer. */
function SidebarContent({ unreadCount, onNavigate }) {
  const { admin, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link to="/admin" onClick={onNavigate} className="text-base font-bold tracking-tight">
          Alok Paul
          <span className="ml-2 text-[11px] font-normal tracking-wide text-muted uppercase">
            Admin
          </span>
        </Link>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ to, label, Icon, end, badge }) => (
            <li key={to}>
              <NavLink to={to} end={end} onClick={onNavigate} className={navLinkClass}>
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                {label}
                {badge === 'unread' && unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-primary px-1.5 py-px text-[11px] font-semibold text-bg">
                    {unreadCount}
                    <span className="sr-only"> unread</span>
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-1 border-t border-border p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-text"
        >
          <Globe className="size-4" strokeWidth={1.75} aria-hidden="true" />
          View site
        </a>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-text"
        >
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Sign out
        </button>
        <p className="truncate px-3 pt-2 text-xs text-muted" title={admin?.email}>
          {admin?.email}
        </p>
      </div>
    </div>
  );
}

/**
 * Admin shell: fixed sidebar on large screens, top bar with a slide-in
 * drawer on small screens, and the current admin page.
 */
export default function AdminLayout() {
  const { pathname } = useLocation();
  // The drawer remembers the page it was opened on, so navigating closes it.
  const [drawerOpenedOn, setDrawerOpenedOn] = useState(null);
  const drawerOpen = drawerOpenedOn === pathname;

  // Unread count for the Messages badge; refreshed when the inbox changes.
  const { body, retry } = useApiQuery('/messages', { limit: 1 });
  const unreadCount = body?.unreadCount ?? 0;

  useEffect(() => {
    window.addEventListener(MESSAGES_CHANGED, retry);
    return () => window.removeEventListener(MESSAGES_CHANGED, retry);
  }, [retry]);

  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);

  // Keyboard support: focus moves into the drawer when it opens, and Escape
  // closes it and returns focus to the menu button.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    drawerRef.current?.querySelector('nav a')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDrawerOpenedOn(null);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-surface lg:block">
        <SidebarContent unreadCount={unreadCount} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-header px-4 backdrop-blur-md lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setDrawerOpenedOn(pathname)}
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          className="inline-flex size-9 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-text"
        >
          <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
        <span className="text-sm font-semibold">Admin</span>
        <ThemeToggle />
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpenedOn(null)}
            className="absolute inset-0 bg-black/50"
          />
          <aside
            ref={drawerRef}
            aria-label="Admin navigation"
            className="absolute inset-y-0 left-0 w-64 border-r border-border bg-surface shadow-xl"
          >
            <button
              type="button"
              onClick={() => setDrawerOpenedOn(null)}
              aria-label="Close navigation"
              className="absolute top-3.5 right-3 inline-flex size-9 items-center justify-center rounded-md text-muted hover:bg-bg hover:text-text"
            >
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
            <SidebarContent unreadCount={unreadCount} onNavigate={() => setDrawerOpenedOn(null)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <div className="hidden h-16 items-center justify-end border-b border-border px-8 lg:flex">
          <ThemeToggle />
        </div>
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
