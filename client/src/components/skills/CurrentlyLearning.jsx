import { motion } from 'framer-motion';
import { currentlyLearning } from '@/data/skills';
import { fadeUp, inViewOnce } from '@/lib/motion';
import { cardBg } from '@/lib/tone';

/**
 * Horizontal strip listing the topics currently being studied.
 * `headingLevel` is the tag of its label and `tone` the band it sits on, both
 * set by the section that renders it.
 */
export default function CurrentlyLearning({ headingLevel: Heading = 'h3', tone = 'bg' }) {
  return (
    <motion.div
      variants={fadeUp}
      {...inViewOnce}
      className="flex flex-col gap-3 rounded-xl border border-dashed border-border px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
    >
      <Heading className="eyebrow shrink-0">Currently Learning</Heading>
      <ul className="flex flex-wrap gap-2">
        {currentlyLearning.map((topic) => (
          <li
            key={topic}
            className={`rounded-full border border-border px-3 py-1 text-sm text-text ${cardBg(tone)}`}
          >
            {topic}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
