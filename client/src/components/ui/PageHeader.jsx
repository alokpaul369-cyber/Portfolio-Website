import { motion } from 'framer-motion';
import { fadeUp, riseIn, stagger } from '@/lib/motion';

/**
 * Heading block: a small mono label (with the section number in the accent
 * color), a serif title and an optional description.
 *
 * Section headings (h2) use a label-left grid from md: the label takes three
 * of twelve columns and the title and description the other nine. Page titles
 * (h1) stack the label above a larger title.
 *
 * @param {object} props
 * @param {string} [props.index]        section number shown before the label, for example "02"
 * @param {string} [props.label]        small uppercase label
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
    <motion.header
      variants={stagger(0, 0.1)}
      {...animation}
      className={
        isPageTitle
          ? 'flex flex-col gap-5'
          : 'grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] md:gap-8'
      }
    >
      {(label || index) && (
        <motion.p variants={fadeUp} className="eyebrow md:pt-3">
          {index && <span className="mr-2 text-primary">{index}</span>}
          {label}
        </motion.p>
      )}
      <div className={isPageTitle ? 'flex flex-col gap-5' : 'flex flex-col gap-4'}>
        {/* The title rises out of its own box; the bottom padding keeps descenders visible. */}
        <Heading
          id={id}
          tabIndex={tabIndex}
          className={`${isPageTitle ? 'text-display' : 'text-section'} overflow-hidden pb-[0.12em] outline-none`}
        >
          <motion.span variants={riseIn} className="block">
            {title}
          </motion.span>
        </Heading>
        {description && (
          <motion.p
            variants={fadeUp}
            className="max-w-[58ch] text-[1.0625rem] leading-7 text-muted"
          >
            {description}
          </motion.p>
        )}
      </div>
    </motion.header>
  );
}
