import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { navLinks, site, socialLinks } from '@/config/site';
import useSiteContent from '@/hooks/useSiteContent';

const footLinkClass = 'text-muted transition-colors hover:text-text';

/** Copies the email address, showing "Copied" briefly; selects the text if copying is blocked. */
function CopyButton({ text, targetId }) {
  const [status, setStatus] = useState('Copy');

  const flash = (label) => {
    setStatus(label);
    setTimeout(() => setStatus('Copy'), 1600);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      flash('Copied');
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById(targetId));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      flash('Selected');
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={status === 'Copy' ? 'Copy email address' : status}
      className="rounded-md border border-border-strong px-2.5 py-1 font-mono text-xs font-medium text-muted transition-colors hover:border-text hover:text-text"
    >
      {status}
    </button>
  );
}

/**
 * Site footer: a contact card (headline, email with a copy button, GitHub and
 * LinkedIn, and a link to the contact page), then three columns (name and
 * summary, navigation, profiles) and a base line with the copyright notice.
 * The contact card is hidden on the Contact page, where it would repeat the page.
 */
export default function Footer() {
  const { pathname } = useLocation();
  const { email, linkedin, role, location, sections } = useSiteContent();
  const year = new Date().getFullYear();
  const showContactCard = pathname !== '/contact';
  const links = navLinks.filter((link) => !link.section || sections[link.section]);
  const initials = site.name
    .split(' ')
    .map((part) => part[0])
    .join('');

  const contactLines = [
    { label: 'Email', value: email, id: 'footer-email', copy: true },
    {
      label: 'GitHub',
      value: socialLinks.github.replace('https://', ''),
      href: socialLinks.github,
    },
    linkedin && {
      label: 'LinkedIn',
      value: linkedin.replace(/^https?:\/\/(www\.)?/, ''),
      href: linkedin,
    },
  ].filter(Boolean);

  return (
    <footer className="mt-12">
      {showContactCard && (
        <div className="container-page">
          <section
            aria-labelledby="contact-card-title"
            className="ink-panel elevated grid overflow-hidden rounded-3xl border border-border lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          >
            <div className="flex flex-col gap-6 border-b border-border p-6 sm:p-12 lg:border-r lg:border-b-0">
              <p className="eyebrow">Contact</p>
              <h2 id="contact-card-title" className="text-closing">
                Let&rsquo;s build something <em>reliable</em> together.
              </h2>
              <p className="max-w-[38ch] text-muted">
                Have a project or a role in mind? Send a short message with the details.
              </p>
            </div>

            <div className="flex flex-col justify-between gap-8 p-6 sm:p-12">
              <dl className="border-t border-border">
                {contactLines.map(({ label, value, id, href, copy }) => (
                  <div
                    key={label}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-border py-3 sm:grid-cols-[5.25rem_minmax(0,1fr)_auto]"
                  >
                    {/* Below sm the label sits above the value, so long addresses are not split. */}
                    <dt className="eyebrow col-span-2 sm:col-span-1">{label}</dt>
                    <dd id={id} className="text-[0.9375rem] [overflow-wrap:anywhere]">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline decoration-border-strong underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                        >
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                    {copy ? <CopyButton text={value} targetId={id} /> : <span aria-hidden="true" />}
                  </div>
                ))}
              </dl>
              <Button to="/contact" className="self-start">
                Send a message
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </section>
        </div>
      )}

      <div className="mt-24 border-t border-border">
        <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,6fr)_minmax(0,3fr)_minmax(0,3fr)]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3">
              <span
                className="inline-grid size-[30px] place-items-center rounded-md border border-border-strong font-mono text-xs font-medium"
                aria-hidden="true"
              >
                {initials}
              </span>
              <span className="text-[0.9375rem] font-medium">{site.name}</span>
            </Link>
            <p className="mt-3 max-w-[36ch] text-[0.9375rem] text-muted">
              {role} building secure web applications with the MERN stack.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="eyebrow">Navigate</p>
            <ul className="mt-4 grid gap-2 text-[0.9375rem]">
              {links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={footLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="eyebrow">Elsewhere</p>
            <ul className="mt-4 grid gap-2 text-[0.9375rem]">
              <li>
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footLinkClass}
                >
                  GitHub
                </a>
              </li>
              {linkedin && (
                <li>
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footLinkClass}
                  >
                    LinkedIn
                  </a>
                </li>
              )}
              <li>
                <a href={`mailto:${email}`} className={footLinkClass}>
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="container-page flex flex-wrap justify-between gap-4 border-t border-border py-6 font-mono text-[0.8125rem] text-muted">
          <span>
            &copy; {year} {site.name}. All rights reserved.
          </span>
          <span className="flex gap-6">
            <Link to="/privacy" className={footLinkClass}>
              Privacy
            </Link>
            <span>{location}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
