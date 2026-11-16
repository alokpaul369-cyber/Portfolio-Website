import { createElement } from 'react';
import { motion } from 'framer-motion';
import { getSkillIcon } from '@/lib/skillIcons';
import { fadeUp } from '@/lib/motion';

/**
 * A single skill: icon and name on a thin rule, in the flat, printed style of
 * the rest of the site.
 */
export default function SkillCard({ name, icon }) {
  return (
    <motion.li variants={fadeUp}>
      <div className="group flex items-center gap-3 border-b border-border py-3">
        {/* Registry icons are module-level components, so looking one up per render is safe. */}
        {createElement(getSkillIcon(icon), {
          className: 'size-5 shrink-0 text-muted transition-colors group-hover:text-text',
          'aria-hidden': true,
        })}
        <span className="text-sm font-semibold">{name}</span>
      </div>
    </motion.li>
  );
}
