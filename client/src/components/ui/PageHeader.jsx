import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

/**
 * Heading block: optional section number and label, a large title and an
 * optional description. Page titles (h1) are followed by a short accent rule.
 *
 * @param {object} props
 * @param {string} [props.index]        section number shown before the label, for example "01"
 * @param {string} [props.label]        small uppercase label above the title
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {'h1' | 'h2'} [props.as='h1'] heading level; use h2 for sections within a page
 * @param {boolean} [props.inView=false] animate when scrolled into view instead of on load
 * @param {string} [props.id]           id for the heading, for aria-labelledby
 * @param {number} [props.tabIndex]     -1 lets the heading receive focus from script
 */
export default function PageHeader({
  index,
  label,
  title,
  description,
  as: Heading = 'h1',
  inView = false,
  id,
  tabIndex,
}) {
  const animation = inView
    ? { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin: '-80px' } }
    : { initial: 'hidden', animate: 'visible' };

  const isPageTitle = Heading === 'h1';

  return (
    <motion.header variants={fadeUp} {...animation} className="flex flex-col gap-4">
      {(label || index) && (
        <p className="flex items-center gap-3">
          {index && (
            <>
              <span className="text-sm font-semibold text-muted tabular-nums">{index}</span>
              <span className="h-px w-8 bg-border" aria-hidden="true" />
            </>
          )}
          {label && <span className="eyebrow">{label}</span>}
        </p>
      )}
      <Heading
        id={id}
        tabIndex={tabIndex}
        className={`${isPageTitle ? 'text-display' : 'text-heading'} outline-none`}
      >
        {title}
      </Heading>
      {isPageTitle && <span className="mt-2 h-1 w-16 bg-primary" aria-hidden="true" />}
      {description && <p className="max-w-2xl text-lg leading-relaxed text-muted">{description}</p>}
    </motion.header>
  );
}
