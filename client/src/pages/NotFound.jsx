import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Seo from '@/components/seo/Seo';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import useSiteContent from '@/hooks/useSiteContent';

/** Useful destinations offered on the 404 page. */
const suggestions = [
  { to: '/projects', label: 'Projects', description: 'Applications and APIs I have built' },
  // Offered only once the blog has a published post.
  {
    to: '/blog',
    label: 'Blog',
    description: 'Articles on backend development and React',
    section: 'blog',
  },
  { to: '/contact', label: 'Contact', description: 'Get in touch about work or collaboration' },
];

/**
 * Custom 404 page for unknown routes. Excluded from search results, shows the
 * requested path and moves focus to the heading so screen reader users hear
 * that the page was not found.
 */
export default function NotFound() {
  const { pathname } = useLocation();
  const { sections } = useSiteContent();
  const shown = suggestions.filter((item) => !item.section || sections[item.section]);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.querySelector('h1')?.focus();
  }, []);

  return (
    <section className="container-page py-24 sm:py-32">
      <Seo title="Page not found" noindex />
      {/* Decorative numeral; the label and heading below carry the meaning. */}
      <p
        className="text-8xl leading-none font-bold tracking-tighter text-muted/25 sm:text-9xl"
        aria-hidden="true"
      >
        404
      </p>
      <div ref={headingRef} className="mt-6">
        <PageHeader
          label="Error 404"
          title="Page not found"
          description="The page you are looking for does not exist or may have been moved."
          tabIndex={-1}
        />
      </div>
      <p className="mt-4 font-mono text-xs break-all text-muted">{pathname}</p>

      <ul
        className={`mt-10 grid gap-3 ${shown.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
      >
        {shown.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="card-hover group flex h-full flex-col gap-1 rounded-xl border border-border bg-surface p-5"
            >
              <span className="inline-flex items-center gap-1.5 font-semibold">
                {item.label}
                <ArrowRight
                  className="size-3.5 text-muted transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
              </span>
              <span className="text-sm text-muted">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Button to="/" className="mt-10">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Return to the home page
      </Button>
    </section>
  );
}
