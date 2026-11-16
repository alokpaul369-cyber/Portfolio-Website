import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { getProjectCategory } from '@/data/projects';
import { fadeUp } from '@/lib/motion';

/** Shared column layout for the rows and the table header, from the md breakpoint. */
export const rowGridClass =
  'grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 md:grid-cols-[3rem_1fr_9rem_15rem_1.25rem] md:gap-x-6';

/**
 * One project in the Home page project table: number, title and summary,
 * category, stack and an arrow. The whole row is clickable through the title
 * link, which stretches over it.
 *
 * @param {{ project: object, number: string, headingLevel?: 'h3' | 'h4' }} props
 */
export default function ProjectRow({ project, number, headingLevel: Heading = 'h3' }) {
  const { slug, title, description, category, techStack = [] } = project;
  const categoryLabel = getProjectCategory(category).label;

  return (
    <motion.li
      variants={fadeUp}
      className={`group relative border-b border-border py-5 transition-colors hover:bg-surface md:py-6 ${rowGridClass}`}
    >
      <span className="pl-1 font-mono text-sm text-primary tabular-nums">{number}</span>

      <div className="min-w-0">
        <Heading className="font-serif text-xl text-text sm:text-2xl">
          <Link
            to={`/projects/${slug}`}
            className="transition-colors group-hover:text-primary after:absolute after:inset-0"
          >
            {title}
          </Link>
        </Heading>
        <p className="mt-0.5 hidden text-sm text-muted sm:line-clamp-1">{description}</p>
        {/* Below md the category and stack share one line under the title. */}
        <p className="mt-0.5 text-sm text-muted md:hidden">
          {categoryLabel} / {techStack.slice(0, 2).join(', ')}
        </p>
      </div>

      <span className="hidden text-sm font-medium text-secondary md:block">{categoryLabel}</span>
      <span className="hidden truncate text-sm text-muted md:block">{techStack.join(', ')}</span>

      <ArrowUpRight
        className="size-5 text-muted transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-text motion-reduce:transform-none"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </motion.li>
  );
}
