import { createElement } from 'react';
import { motion } from 'framer-motion';
import { getSkillIcon } from '@/lib/skillIcons';
import { fadeUp } from '@/lib/motion';
import { cardBg } from '@/lib/tone';

/** A single skill: icon and name, in a bordered card. `tone` is the band the card sits on. */
export default function SkillCard({ name, icon, tone = 'bg' }) {
  return (
    <motion.li variants={fadeUp}>
      <div
        className={`card-hover group flex items-center gap-3 rounded-lg border border-border px-4 py-3 ${cardBg(tone)}`}
      >
        {/* Registry icons are module-level components, so looking one up per render is safe. */}
        {createElement(getSkillIcon(icon), {
          className:
            'size-5 shrink-0 text-muted transition-colors duration-300 group-hover:text-primary',
          'aria-hidden': true,
        })}
        <span className="text-sm font-medium">{name}</span>
      </div>
    </motion.li>
  );
}
