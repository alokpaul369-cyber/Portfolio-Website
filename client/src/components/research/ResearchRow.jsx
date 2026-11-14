import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { getResearchStatusLabel, getResearchTypeLabel } from '@/data/research';
import { formatMonthYear } from '@/lib/format';
import { fadeUp } from '@/lib/motion';
import ResearchLinks from './ResearchLinks';

/** Small outlined label for a status; ongoing work is accented. */
export function StatusLabel({ status }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        status === 'ongoing' ? 'border-primary/40 text-primary' : 'border-border text-muted'
      }`}
    >
      {getResearchStatusLabel(status)}
    </span>
  );
}

/**
 * One research entry as a bordered row: date and status in a left rail on
 * large screens, then type, title, authors, venue, summary, tags and links.
 * Used on the Research page and in the Home page section.
 *
 * @param {object} props
 * @param {object} props.entry
 * @param {'h2' | 'h3'} [props.headingLevel='h2'] tag for the title
 */
export default function ResearchRow({ entry, headingLevel: Heading = 'h2' }) {
  const url = `/research/${entry.slug}`;

  return (
    <motion.li
      variants={fadeUp}
      className="grid gap-3 border-t border-border py-8 lg:grid-cols-[12rem_1fr] lg:gap-10"
    >
      <p className="flex flex-wrap items-center gap-2 self-start text-sm font-medium text-muted tabular-nums lg:flex-col lg:items-start lg:pt-1.5">
        {entry.date && <time dateTime={entry.date}>{formatMonthYear(entry.date)}</time>}
        <StatusLabel status={entry.status} />
      </p>

      <div className="flex min-w-0 flex-col gap-3">
        <p className="eyebrow">{getResearchTypeLabel(entry.type)}</p>
        <Heading className="text-xl leading-snug font-bold tracking-tight break-words sm:text-2xl">
          <Link to={url} className="transition-colors hover:text-primary">
            {entry.title}
          </Link>
        </Heading>

        {(entry.authors?.length > 0 || entry.venue) && (
          <p className="text-sm leading-relaxed break-words text-muted">
            {entry.authors?.join(', ')}
            {entry.authors?.length > 0 && entry.venue && <span aria-hidden="true"> · </span>}
            {entry.venue && <span className="italic">{entry.venue}</span>}
          </p>
        )}

        <p className="max-w-3xl leading-relaxed break-words text-muted">{entry.summary}</p>

        {entry.tags?.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
            {entry.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <ResearchLinks entry={entry} />
      </div>
    </motion.li>
  );
}
