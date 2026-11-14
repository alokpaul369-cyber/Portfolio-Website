import { createElement } from 'react';
import { ArrowUpRight, FileText, Globe, Link2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';

/** The optional links of a research entry, in display order. */
const LINKS = [
  { field: 'paperUrl', label: 'Paper', Icon: FileText },
  { field: 'doiUrl', label: 'DOI', Icon: Link2 },
  { field: 'codeUrl', label: 'Code', Icon: FaGithub },
  { field: 'projectUrl', label: 'Project page', Icon: Globe },
];

/** Returns the links an entry actually has. */
function linksOf(entry) {
  return LINKS.filter(({ field }) => entry[field]).map((link) => ({
    ...link,
    href: entry[link.field],
  }));
}

/**
 * External links for a research entry (paper, DOI, code, project page).
 * Renders nothing when the entry has none.
 *
 * @param {object} props
 * @param {object} props.entry
 * @param {'inline' | 'stacked'} [props.layout='inline'] inline for rows, stacked for the detail sidebar
 */
export default function ResearchLinks({ entry, layout = 'inline' }) {
  const links = linksOf(entry);
  if (links.length === 0) return null;

  const stacked = layout === 'stacked';

  return (
    <ul className={stacked ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}>
      {links.map(({ field, label, Icon, href }) => (
        <li key={field}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-md border border-border text-sm font-medium text-text transition-colors hover:border-primary hover:text-primary ${
              stacked ? 'w-full justify-between px-3 py-2.5' : 'px-3 py-1.5'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {createElement(Icon, { className: 'size-4 shrink-0', 'aria-hidden': true })}
              {label}
            </span>
            <ArrowUpRight className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
            <span className="sr-only">for {entry.title} (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
