import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { navLinks, site } from '@/config/site';
import useSiteContent from '@/hooks/useSiteContent';

/**
 * Desktop link style; the marker under the active page is rendered by the link itself.
 * Links fill the header height, so the focus ring is drawn inside the link to stay visible.
 */
function desktopLinkClass({ isActive }) {
  return `relative inline-flex h-16 items-center px-1 text-sm font-medium transition-colors focus-visible:-outline-offset-2 ${
    isActive ? 'text-text' : 'text-muted hover:text-text'
  }`;
}

/** Mobile link style. */
function mobileLinkClass({ isActive }) {
  return [
    'block rounded-md px-3 py-2.5 text-base font-medium transition-colors',
    isActive ? 'bg-surface text-primary' : 'text-muted hover:bg-surface hover:text-text',
  ].join(' ');
}

/**
 * Sticky site header with a translucent, blurred background.
 * Below the md breakpoint the links collapse into a toggleable menu.
 */
export default function Navbar() {
  const { pathname } = useLocation();
  const menuId = useId();
  // Optional links (Research, Blog) appear once their section has content.
  const { sections, role } = useSiteContent();
  const initials = site.name
    .split(' ')
    .map((part) => part[0])
    .join('');
  const links = navLinks.filter((link) => !link.section || sections[link.section]);

  const toggleRef = useRef(null);
  const menuRef = useRef(null);

  // The menu remembers the page it was opened on, so navigating closes it automatically.
  const [openedOn, setOpenedOn] = useState(null);
  const isMenuOpen = openedOn === pathname;
  const closeMenu = () => setOpenedOn(null);

  // Keyboard support: focus moves to the first link when the menu opens, and
  // Escape closes the menu and returns focus to the menu button.
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    menuRef.current?.querySelector('a')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenedOn(null);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header backdrop-blur-md">
      <nav aria-label="Main" className="container-page flex h-16 items-center justify-between">
        <Link to="/" onClick={closeMenu} className="group flex items-center gap-3">
          <span
            className="inline-grid size-[30px] place-items-center rounded-md border border-border-strong font-mono text-xs font-medium text-text"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-text transition-colors group-hover:text-primary">
              {site.name}
            </span>
            <span className="hidden font-mono text-xs text-muted sm:block">{role}</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-5 md:flex lg:gap-8">
          <ul className="flex items-center gap-5 lg:gap-7">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={desktopLinkClass}>
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {/* A shared layoutId makes the marker slide between links. */}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-marker"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            ref={toggleRef}
            onClick={() => setOpenedOn(isMenuOpen ? null : pathname)}
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-text"
          >
            {isMenuOpen ? (
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id={menuId}
            ref={menuRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="border-t border-border md:hidden"
          >
            <ul className="container-page flex flex-col gap-1 py-3">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} onClick={closeMenu} className={mobileLinkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
